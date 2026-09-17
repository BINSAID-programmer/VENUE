import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  BookOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { AIChatConversation } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AIChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: AIChatConversation[];
  activeChatId: string | null;
  onSelectChat: (chat: AIChatConversation) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string, newTitle: string) => Promise<void>;
  onDeleteChat: (chatId: string) => Promise<void>;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const AIChatHistoryDrawer: React.FC<AIChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced search query (300ms) to avoid lagging or excessive re-computation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter conversations based on debounced search query
  const filteredChats = useMemo(() => {
    if (!debouncedQuery) return conversations;
    return conversations.filter((c) => {
      const matchTitle = (c.title || '').toLowerCase().includes(debouncedQuery);
      const matchPreview = (c.lastMessagePreview || '').toLowerCase().includes(debouncedQuery);
      const matchCourse = (c.courseContext || '').toLowerCase().includes(debouncedQuery);
      return matchTitle || matchPreview || matchCourse;
    });
  }, [conversations, debouncedQuery]);

  const handleStartRename = (c: AIChatConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = async (chatId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      await onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleConfirmDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await onDeleteChat(chatId);
    } finally {
      setIsDeleting(false);
      setDeletingChatId(null);
    }
  };

  const formatChatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="AI Tutor Chat History Drawer"
        className={`relative z-10 w-full max-w-xs sm:max-w-sm h-full flex flex-col shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-950 border-r border-slate-800/90 text-slate-100'
            : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Recent Chats</h3>
              <p className="text-[10px] text-slate-400">
                {conversations.length} saved {conversations.length === 1 ? 'chat' : 'chats'}
              </p>
            </div>
          </div>

          <button
            id="chat-drawer-close-btn"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 border-b border-slate-800/40">
          <button
            id="chat-drawer-new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-semibold shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar with Debounce indicator */}
        <div className="px-3 pt-3 pb-2">
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus-within:border-blue-500/60'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus-within:border-blue-500/60 focus-within:bg-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              id="search-chat-history-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="bg-transparent w-full focus:outline-none placeholder:text-slate-500 text-xs text-slate-800 dark:text-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchQuery && searchQuery.toLowerCase() !== debouncedQuery && (
            <p className="text-[10px] text-slate-500 mt-1 pl-1">Searching...</p>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-400">
                {debouncedQuery ? 'No matching conversations' : 'No saved chats yet'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {debouncedQuery
                  ? 'Try different search keywords or start a new chat'
                  : 'Your questions and solutions will appear here automatically'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = editingChatId === chat.id;
              const isPendingDelete = deletingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  id={`chat-item-${chat.id}`}
                  onClick={() => {
                    if (!isEditing && !isPendingDelete) {
                      onSelectChat(chat);
                      onClose();
                    }
                  }}
                  className={`group relative rounded-xl p-2.5 transition-all cursor-pointer border ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600/20 border-blue-500/50 text-sky-200 shadow-sm'
                        : 'bg-blue-50 border-blue-200 text-blue-900 shadow-xs'
                      : isDark
                      ? 'border-transparent hover:bg-slate-900/70 hover:border-slate-800 text-slate-300'
                      : 'border-transparent hover:bg-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  {/* Inline Renaming Mode */}
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(chat.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        id={`input-rename-chat-${chat.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className={`w-full text-xs font-medium px-2 py-1 rounded border focus:outline-none ${
                          isDark
                            ? 'bg-slate-900 text-white border-blue-500'
                            : 'bg-white text-slate-900 border-blue-500 shadow-xs'
                        }`}
                      />
                      <button
                        type="submit"
                        title="Save title"
                        className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(null);
                        }}
                        title="Cancel"
                        className="p-1 rounded text-slate-400 hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : isPendingDelete ? (
                    /* Simple confirmation popover inside card */
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-red-950/60 border border-red-500/50 rounded-lg flex items-center justify-between gap-1 text-[11px] text-red-200"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>Delete chat permanently?</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          id={`confirm-delete-chat-${chat.id}`}
                          onClick={(e) => handleConfirmDelete(chat.id, e)}
                          disabled={isDeleting}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                          {isDeleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChatId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Conversation Card */
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs font-semibold truncate ${
                              isActive
                                ? isDark
                                  ? 'text-sky-300 font-bold'
                                  : 'text-blue-700 font-bold'
                                : isDark
                                ? 'text-slate-200'
                                : 'text-slate-800'
                            }`}
                          >
                            {chat.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            {formatChatDate(chat.updatedAt)}
                          </span>
                        </div>

                        {chat.lastMessagePreview && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                            {chat.lastMessagePreview}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          {chat.courseContext && chat.courseContext !== 'All Courses' && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-500/20 truncate max-w-[110px]">
                              <BookOpen className="w-2.5 h-2.5" />
                              {chat.courseContext}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400">
                            {chat.messageCount || 1} {chat.messageCount === 1 ? 'message' : 'messages'}
                          </span>
                        </div>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          id={`btn-rename-${chat.id}`}
                          onClick={(e) => handleStartRename(chat, e)}
                          title="Rename chat"
                          aria-label="Rename conversation"
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800/60 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-delete-${chat.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChatId(chat.id);
                          }}
                          title="Delete chat"
                          aria-label="Delete conversation"
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Pagination / Lazy Loading Footer Button */}
          {hasMore && !debouncedQuery && onLoadMore && (
            <div className="pt-2 pb-1 px-1">
              <button
                id="chat-drawer-load-more-btn"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                  isDark
                    ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-sky-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-blue-700 shadow-xs'
                }`}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>Loading older chats...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Load older conversations</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800/40 text-[10px] text-slate-400 text-center flex items-center justify-between">
          <span>VENUE Cloud Chat Sync</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Private & Encrypted
          </span>
        </div>
      </aside>
    </div>
  );
};
