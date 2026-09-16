import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AIChatConversation, AIMessage } from '../types';

const CHATS_CACHE_PREFIX = 'venue_chats_';
const MSG_CACHE_PREFIX = 'venue_chat_msgs_';

// In-flight promise caches to deduplicate simultaneous requests
const inFlightListPromises = new Map<string, Promise<{ conversations: AIChatConversation[]; hasMore: boolean }>>();
const inFlightMsgPromises = new Map<string, Promise<AIMessage[]>>();

/**
 * Get active student UID from Firebase Auth or local profile cache
 */
export function getActiveUserId(): string {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  try {
    const raw = localStorage.getItem('venue_student_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.uid) return parsed.uid;
    }
  } catch {
    // Ignore cache error
  }
  return 'local-guest-student';
}

/**
 * Read cached conversation metadata
 */
export function getCachedConversations(userId: string = getActiveUserId()): AIChatConversation[] {
  try {
    const raw = localStorage.getItem(`${CHATS_CACHE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading chat cache:', e);
  }
  return [];
}

/**
 * Save cached conversations
 */
export function setCachedConversations(userId: string, chats: AIChatConversation[]): void {
  try {
    localStorage.setItem(`${CHATS_CACHE_PREFIX}${userId}`, JSON.stringify(chats));
  } catch (e) {
    console.warn('Error saving chat cache:', e);
  }
}

/**
 * Read cached messages for a conversation
 */
export function getCachedMessages(chatId: string): AIMessage[] {
  try {
    const raw = localStorage.getItem(`${MSG_CACHE_PREFIX}${chatId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading message cache:', e);
  }
  return [];
}

/**
 * Save cached messages for a conversation
 */
export function setCachedMessages(chatId: string, msgs: AIMessage[]): void {
  try {
    localStorage.setItem(`${MSG_CACHE_PREFIX}${chatId}`, JSON.stringify(msgs));
  } catch (e) {
    console.warn('Error saving message cache:', e);
  }
}

/**
 * Sanitize a message object for Firestore serialization
 */
function sanitizeMessageForFirestore(msg: AIMessage): Record<string, any> {
  const role = msg.role || msg.sender || 'user';
  const text = msg.text || msg.content || '';
  const content = msg.content || msg.text || '';

  const clean: Record<string, any> = {
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sender: msg.sender || role,
    role: role,
    text: text,
    content: content,
    timestamp: msg.timestamp || new Date().toISOString(),
  };

  if (Array.isArray(msg.steps) && msg.steps.length > 0) clean.steps = msg.steps;
  if (msg.formula) clean.formula = msg.formula;
  if (msg.courseContext) clean.courseContext = msg.courseContext;
  if (Array.isArray(msg.suggestions) && msg.suggestions.length > 0) clean.suggestions = msg.suggestions;
  if (msg.isError) clean.isError = true;
  if (msg.originalQuery) clean.originalQuery = msg.originalQuery;
  if (msg.detectedLanguage) clean.detectedLanguage = msg.detectedLanguage;
  if (msg.isImageGeneration) clean.isImageGeneration = true;
  if (msg.generatedImageUrl) clean.generatedImageUrl = msg.generatedImageUrl;
  if (msg.imageGenStatus) clean.imageGenStatus = msg.imageGenStatus;
  if (msg.imageGenPrompt) clean.imageGenPrompt = msg.imageGenPrompt;
  if (msg.chart) clean.chart = msg.chart;
  if (msg.diagramSvg) clean.diagramSvg = msg.diagramSvg;

  // Preserve image attachment metadata
  if (msg.imageAttachment) {
    clean.imageAttachment = {
      name: msg.imageAttachment.name || '',
      size: msg.imageAttachment.size || '',
      mimeType: msg.imageAttachment.mimeType || '',
    };
  } else if (msg.imageName || msg.imageSize || msg.imageMimeType) {
    clean.imageAttachment = {
      name: msg.imageName || '',
      size: msg.imageSize || '',
      mimeType: msg.imageMimeType || '',
    };
  }

  // Preserve image URL if available
  if (msg.imageUrl) {
    // If it's a huge base64 data URL, ensure we still preserve imageAttachment metadata
    clean.imageUrl = msg.imageUrl;
  }

  return clean;
}

/**
 * Normalize an AIMessage retrieved from cache or Firestore
 */
function normalizeMessage(data: any): AIMessage {
  const role = data.role || data.sender || 'assistant';
  const text = data.text || data.content || '';
  const content = data.content || data.text || '';

  return {
    id: data.id || `msg_${Date.now()}`,
    sender: role === 'model' ? 'assistant' : (role as 'user' | 'assistant'),
    role: role === 'model' ? 'assistant' : (role as 'user' | 'assistant'),
    text,
    content,
    timestamp: data.timestamp || 'Just now',
    steps: data.steps,
    formula: data.formula,
    courseContext: data.courseContext,
    suggestions: data.suggestions,
    isError: data.isError,
    originalQuery: data.originalQuery,
    imageUrl: data.imageUrl,
    imageAttachment: data.imageAttachment,
    imageName: data.imageAttachment?.name || data.imageName,
    imageSize: data.imageAttachment?.size || data.imageSize,
    imageMimeType: data.imageAttachment?.mimeType || data.imageMimeType,
    chart: data.chart,
    diagramSvg: data.diagramSvg,
    detectedLanguage: data.detectedLanguage,
    isImageGeneration: data.isImageGeneration,
    generatedImageUrl: data.generatedImageUrl,
    imageGenStatus: data.imageGenStatus,
    imageGenPrompt: data.imageGenPrompt,
  };
}

/**
 * Fetch conversations for the authenticated user with pagination and deduplication
 */
export async function listUserConversations(
  userId: string = getActiveUserId(),
  limitCount = 20
): Promise<{ conversations: AIChatConversation[]; hasMore: boolean }> {
  // Deduplicate active in-flight request
  const requestKey = `${userId}_${limitCount}`;
  if (inFlightListPromises.has(requestKey)) {
    return inFlightListPromises.get(requestKey)!;
  }

  const promise = (async () => {
    const cached = getCachedConversations(userId);

    // If user is authenticated in Firebase, query Firestore under their private student UID
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const chatsRef = collection(db, 'students', userId, 'chats');
        const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(limitCount + 1));
        const snapshot = await getDocs(q);

        const firestoreChats: AIChatConversation[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as AIChatConversation;
          firestoreChats.push({
            ...data,
            id: d.id,
            userId: data.userId || userId,
            title: data.title || 'Conversation',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            lastMessagePreview: data.lastMessagePreview || '',
            messageCount: data.messageCount || 0,
            courseContext: data.courseContext || 'All Courses',
            languagePreference: data.languagePreference || 'auto',
          });
        });

        const hasMore = firestoreChats.length > limitCount;
        const resultChats = firestoreChats.slice(0, limitCount);

        if (resultChats.length > 0) {
          // Merge with cached to keep fast sync
          setCachedConversations(userId, resultChats);
          return { conversations: resultChats, hasMore };
        }
      } catch (err) {
        console.warn('Firestore chats query notice, using local cache:', err);
      }
    }

    return {
      conversations: cached,
      hasMore: false,
    };
  })();

  inFlightListPromises.set(requestKey, promise);
  try {
    return await promise;
  } finally {
    inFlightListPromises.delete(requestKey);
  }
}

/**
 * Load more conversations with pagination
 */
export async function loadMoreUserConversations(
  userId: string = getActiveUserId(),
  lastUpdatedAt: string,
  limitCount = 20
): Promise<{ conversations: AIChatConversation[]; hasMore: boolean }> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return { conversations: [], hasMore: false };
  }

  try {
    const chatsRef = collection(db, 'students', userId, 'chats');
    const q = query(
      chatsRef,
      orderBy('updatedAt', 'desc'),
      startAfter(lastUpdatedAt),
      limit(limitCount + 1)
    );
    const snapshot = await getDocs(q);

    const items: AIChatConversation[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as AIChatConversation;
      items.push({
        ...data,
        id: d.id,
        userId: data.userId || userId,
        title: data.title || 'Conversation',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastMessagePreview: data.lastMessagePreview || '',
        messageCount: data.messageCount || 0,
      });
    });

    const hasMore = items.length > limitCount;
    const result = items.slice(0, limitCount);

    // Update cache
    const existing = getCachedConversations(userId);
    const combined = [...existing, ...result.filter((r) => !existing.some((e) => e.id === r.id))];
    setCachedConversations(userId, combined);

    return { conversations: result, hasMore };
  } catch (err) {
    console.warn('loadMoreUserConversations notice:', err);
    return { conversations: [], hasMore: false };
  }
}

/**
 * Create a new conversation record
 */
export async function createConversation(
  userId: string = getActiveUserId(),
  initialTitle = 'New Conversation',
  courseContext = 'All Courses',
  languagePreference = 'auto'
): Promise<AIChatConversation> {
  const now = new Date().toISOString();
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newChat: AIChatConversation = {
    id: chatId,
    userId,
    title: initialTitle,
    createdAt: now,
    updatedAt: now,
    lastMessagePreview: '',
    messageCount: 0,
    courseContext,
    languagePreference,
  };

  // Update local cache immediately
  const existing = getCachedConversations(userId);
  const updated = [newChat, ...existing.filter((c) => c.id !== chatId)];
  setCachedConversations(userId, updated);

  // Sync to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
      await setDoc(chatDocRef, newChat, { merge: true });
    } catch (err) {
      console.warn('Could not persist new chat to Firestore, cached locally:', err);
    }
  }

  return newChat;
}

/**
 * Update a conversation's title
 */
export async function updateConversationTitle(
  chatId: string,
  newTitle: string,
  userId: string = getActiveUserId()
): Promise<void> {
  const cleanTitle = newTitle.trim();
  if (!cleanTitle) return;

  const now = new Date().toISOString();

  // Update local cache
  const cached = getCachedConversations(userId);
  const updated = cached.map((c) =>
    c.id === chatId ? { ...c, title: cleanTitle, updatedAt: now } : c
  );
  setCachedConversations(userId, updated);

  // Sync to Firestore
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
      await setDoc(chatDocRef, { title: cleanTitle, updatedAt: now }, { merge: true });
    } catch (err) {
      console.warn('Could not update chat title in Firestore:', err);
    }
  }
}

/**
 * Delete a conversation and its local cache
 */
export async function deleteConversation(
  chatId: string,
  userId: string = getActiveUserId()
): Promise<void> {
  // Update local cache
  const cached = getCachedConversations(userId);
  const filtered = cached.filter((c) => c.id !== chatId);
  setCachedConversations(userId, filtered);

  // Remove messages cache
  try {
    localStorage.removeItem(`${MSG_CACHE_PREFIX}${chatId}`);
  } catch {
    // Ignore
  }

  // Delete from Firestore
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
      await deleteDoc(chatDocRef);
    } catch (err) {
      console.warn('Could not delete chat from Firestore:', err);
    }
  }
}

/**
 * Load all messages for a specific conversation with deduplication
 */
export async function loadConversationMessages(
  chatId: string,
  userId: string = getActiveUserId()
): Promise<AIMessage[]> {
  const cached = getCachedMessages(chatId);

  // Check in-flight promise
  if (inFlightMsgPromises.has(chatId)) {
    return inFlightMsgPromises.get(chatId)!;
  }

  const promise = (async () => {
    // If online and authenticated, attempt to fetch from Firestore
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists()) {
          const chatData = chatDocSnap.data();
          if (Array.isArray(chatData.messages) && chatData.messages.length > 0) {
            const normalized = chatData.messages.map(normalizeMessage);
            setCachedMessages(chatId, normalized);
            return normalized;
          }
        }

        // Fallback: check subcollection if messages stored there
        const msgsRef = collection(db, 'students', userId, 'chats', chatId, 'messages');
        const q = query(msgsRef, orderBy('timestamp', 'asc'), limit(100));
        const snapshot = await getDocs(q);

        const firestoreMsgs: AIMessage[] = [];
        snapshot.forEach((d) => {
          firestoreMsgs.push(normalizeMessage(d.data()));
        });

        if (firestoreMsgs.length > 0) {
          setCachedMessages(chatId, firestoreMsgs);
          return firestoreMsgs;
        }
      } catch (err) {
        console.warn('Could not fetch messages from Firestore, using local cache:', err);
      }
    }

    return cached;
  })();

  inFlightMsgPromises.set(chatId, promise);
  try {
    return await promise;
  } finally {
    inFlightMsgPromises.delete(chatId);
  }
}

/**
 * Persist messages for a conversation and update metadata preview
 */
export async function saveConversationMessages(
  chatId: string,
  messages: AIMessage[],
  userId: string = getActiveUserId(),
  courseContext = 'All Courses',
  languagePreference = 'auto'
): Promise<{ success: boolean; error?: string }> {
  if (!messages || messages.length === 0) return { success: true };

  // 1. Save messages locally immediately (zero data loss guarantee)
  setCachedMessages(chatId, messages);

  // 2. Derive preview and title
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user' || m.role === 'user');
  const lastMsg = messages[messages.length - 1];
  const now = new Date().toISOString();

  const preview = (lastMsg?.text || lastMsg?.content || '').slice(0, 100).replace(/\n/g, ' ');

  // Update conversation list locally
  const cachedChats = getCachedConversations(userId);
  const targetIndex = cachedChats.findIndex((c) => c.id === chatId);
  let updatedChats = [...cachedChats];

  let currentTitle = 'New Conversation';
  let createdAt = now;

  if (targetIndex >= 0) {
    const existing = cachedChats[targetIndex];
    createdAt = existing.createdAt || now;
    currentTitle = existing.title;
    if (existing.title === 'New Conversation' && lastUserMsg?.text) {
      currentTitle = lastUserMsg.text.slice(0, 36).trim();
      if (lastUserMsg.text.length > 36) currentTitle += '...';
    }

    const updatedItem: AIChatConversation = {
      ...existing,
      title: currentTitle,
      updatedAt: now,
      lastMessagePreview: preview,
      messageCount: messages.length,
      courseContext: courseContext || existing.courseContext,
      languagePreference: languagePreference || existing.languagePreference,
    };

    updatedChats[targetIndex] = updatedItem;
    // Move to front
    updatedChats = [updatedItem, ...updatedChats.filter((c) => c.id !== chatId)];
  } else {
    // New conversation record
    if (lastUserMsg?.text) {
      currentTitle = lastUserMsg.text.slice(0, 36).trim();
      if (lastUserMsg.text.length > 36) currentTitle += '...';
    }
    const newChat: AIChatConversation = {
      id: chatId,
      userId,
      title: currentTitle,
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: preview,
      messageCount: messages.length,
      courseContext,
      languagePreference,
    };
    updatedChats.unshift(newChat);
  }

  setCachedConversations(userId, updatedChats);

  // 3. Persist to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
      const cleanMessages = messages.map(sanitizeMessageForFirestore);

      const conversationDocData = {
        id: chatId,
        userId,
        title: currentTitle,
        createdAt,
        updatedAt: now,
        lastMessagePreview: preview,
        messageCount: messages.length,
        courseContext,
        languagePreference,
        messages: cleanMessages,
      };

      await setDoc(chatDocRef, conversationDocData, { merge: true });

      // Also persist latest message to subcollection for individual indexing
      if (lastMsg) {
        const msgDocRef = doc(db, 'students', userId, 'chats', chatId, 'messages', lastMsg.id);
        const cleanLastMsg = sanitizeMessageForFirestore(lastMsg);
        await setDoc(msgDocRef, cleanLastMsg, { merge: true });
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Firestore message persistence note:', err);
      return { success: false, error: err?.message || 'Sync pending' };
    }
  }

  return { success: true };
}
