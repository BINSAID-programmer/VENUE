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
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { AIChatConversation } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    <div className="fixed inset-0 z-50 flex venue-ai-tutor-white" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="AI Tutor Chat History Drawer"
        className="relative z-10 w-full max-w-xs sm:max-w-sm h-full flex flex-col bg-white border-r border-slate-200 text-slate-900 shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Conversations</h3>
            <p className="text-[11px] text-slate-500">
              {conversations.length} saved {conversations.length === 1 ? 'session' : 'sessions'}
            </p>
          </div>

          <button
            id="chat-drawer-close-btn"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 border-b border-slate-100">
          <button
            id="chat-drawer-new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pt-2.5 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus-within:border-blue-500 focus-within:bg-white transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              id="search-chat-history-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent w-full focus:outline-none text-xs text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && searchQuery.toLowerCase() !== debouncedQuery && (
            <p className="text-[10px] text-slate-400 mt-1 pl-1">Searching...</p>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1.5 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                {debouncedQuery ? 'No matching conversations' : 'No saved conversations yet'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {debouncedQuery
                  ? 'Try different search keywords or start a new conversation'
                  : 'Your academic questions and step-by-step solutions appear here automatically'}
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
                  className={`group relative rounded-xl px-3 py-2.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
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
                        className="w-full text-xs font-medium px-2 py-1 rounded border border-blue-500 bg-white text-slate-900 focus:outline-none"
                      />
                      <button
                        type="submit"
                        title="Save title"
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
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
                        className="p-1 rounded text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : isPendingDelete ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2 text-[11px] text-red-800"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Delete conversation?</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          id={`confirm-delete-chat-${chat.id}`}
                          onClick={(e) => handleConfirmDelete(chat.id, e)}
                          disabled={isDeleting}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {isDeleting ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChatId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4
                            className={`text-xs truncate ${
                              isActive ? 'text-slate-900 font-semibold' : 'text-slate-800 font-medium'
                            }`}
                          >
                            {chat.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            {formatChatDate(chat.updatedAt)}
                          </span>
                        </div>

                        {chat.lastMessagePreview && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                            {chat.lastMessagePreview}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                          {chat.courseContext && chat.courseContext !== 'All Courses' && (
                            <>
                              <span className="font-medium text-slate-600">{chat.courseContext}</span>
                              <span>·</span>
                            </>
                          )}
                          <span>
                            {chat.messageCount || 1} {chat.messageCount === 1 ? 'message' : 'messages'}
                          </span>
                        </div>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          id={`btn-rename-${chat.id}`}
                          onClick={(e) => handleStartRename(chat, e)}
                          title="Rename conversation"
                          aria-label="Rename conversation"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-delete-${chat.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChatId(chat.id);
                          }}
                          title="Delete conversation"
                          aria-label="Delete conversation"
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

          {hasMore && !debouncedQuery && onLoadMore && (
            <div className="pt-2 pb-1 px-1">
              <button
                id="chat-drawer-load-more-btn"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    <span>Loading older chats...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Load older conversations</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>VENUE Academic History</span>
          <span>Synced</span>
        </div>
      </aside>
    </div>
  );
};
