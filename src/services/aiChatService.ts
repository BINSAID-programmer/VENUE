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
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { AIChatConversation, AIMessage } from '../types';

const CHATS_CACHE_PREFIX = 'venue_chats_';
const MSG_CACHE_PREFIX = 'venue_chat_msgs_';

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
function getCachedConversations(userId: string): AIChatConversation[] {
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
function setCachedConversations(userId: string, chats: AIChatConversation[]): void {
  try {
    localStorage.setItem(`${CHATS_CACHE_PREFIX}${userId}`, JSON.stringify(chats));
  } catch (e) {
    console.warn('Error saving chat cache:', e);
  }
}

/**
 * Read cached messages for a conversation
 */
function getCachedMessages(chatId: string): AIMessage[] {
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
function setCachedMessages(chatId: string, msgs: AIMessage[]): void {
  try {
    localStorage.setItem(`${MSG_CACHE_PREFIX}${chatId}`, JSON.stringify(msgs));
  } catch (e) {
    console.warn('Error saving message cache:', e);
  }
}

/**
 * Fetch all conversations for the authenticated user
 * Supports fast local cache first with background Firestore refresh
 */
export async function listUserConversations(userId: string = getActiveUserId()): Promise<AIChatConversation[]> {
  const cached = getCachedConversations(userId);

  // If user is authenticated, query Firestore
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatsRef = collection(db, 'students', userId, 'chats');
      const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      const firestoreChats: AIChatConversation[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as AIChatConversation;
        firestoreChats.push({
          ...data,
          id: d.id,
        });
      });

      if (firestoreChats.length > 0) {
        setCachedConversations(userId, firestoreChats);
        return firestoreChats;
      }
    } catch (err) {
      console.warn('Firestore chats query notice, using local cache:', err);
    }
  }

  return cached;
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
 * Load all messages for a specific conversation
 */
export async function loadConversationMessages(
  chatId: string,
  userId: string = getActiveUserId()
): Promise<AIMessage[]> {
  const cached = getCachedMessages(chatId);

  // If online and authenticated, attempt to fetch from Firestore
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const msgsRef = collection(db, 'students', userId, 'chats', chatId, 'messages');
      const q = query(msgsRef, orderBy('timestamp', 'asc'), limit(100));
      const snapshot = await getDocs(q);

      const firestoreMsgs: AIMessage[] = [];
      snapshot.forEach((d) => {
        firestoreMsgs.push(d.data() as AIMessage);
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
}

/**
 * Persist messages for a conversation and update metadata preview
 */
export async function saveConversationMessages(
  chatId: string,
  messages: AIMessage[],
  userId: string = getActiveUserId()
): Promise<void> {
  if (!messages || messages.length === 0) return;

  // 1. Save messages locally
  setCachedMessages(chatId, messages);

  // 2. Derive preview and title
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
  const lastMsg = messages[messages.length - 1];
  const now = new Date().toISOString();

  const preview = (lastMsg?.text || '').slice(0, 100).replace(/\n/g, ' ');

  // Update conversation list locally
  const cachedChats = getCachedConversations(userId);
  const targetIndex = cachedChats.findIndex((c) => c.id === chatId);
  let updatedChats = [...cachedChats];

  if (targetIndex >= 0) {
    const existing = cachedChats[targetIndex];
    let autoTitle = existing.title;
    if (existing.title === 'New Conversation' && lastUserMsg?.text) {
      autoTitle = lastUserMsg.text.slice(0, 36).trim();
      if (lastUserMsg.text.length > 36) autoTitle += '...';
    }

    const updatedItem: AIChatConversation = {
      ...existing,
      title: autoTitle,
      updatedAt: now,
      lastMessagePreview: preview,
      messageCount: messages.length,
    };

    updatedChats[targetIndex] = updatedItem;
    // Move to front
    updatedChats = [updatedItem, ...updatedChats.filter((c) => c.id !== chatId)];
  } else {
    // New conversation record
    let autoTitle = 'New Conversation';
    if (lastUserMsg?.text) {
      autoTitle = lastUserMsg.text.slice(0, 36).trim();
      if (lastUserMsg.text.length > 36) autoTitle += '...';
    }
    const newChat: AIChatConversation = {
      id: chatId,
      userId,
      title: autoTitle,
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: preview,
      messageCount: messages.length,
    };
    updatedChats.unshift(newChat);
  }

  setCachedConversations(userId, updatedChats);

  // 3. Persist to Firestore if authenticated
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const chatDocRef = doc(db, 'students', userId, 'chats', chatId);
      const chatMeta = updatedChats.find((c) => c.id === chatId);
      if (chatMeta) {
        await setDoc(chatDocRef, chatMeta, { merge: true });
      }

      // Save the latest message doc
      if (lastMsg) {
        const msgDocRef = doc(db, 'students', userId, 'chats', chatId, 'messages', lastMsg.id);
        // Ensure undefined values are cleaned for Firestore
        const cleanMsg = JSON.parse(JSON.stringify(lastMsg));
        await setDoc(msgDocRef, cleanMsg, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore message persistence note:', err);
    }
  }
}
