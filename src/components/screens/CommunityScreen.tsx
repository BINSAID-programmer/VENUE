import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Plus,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { CommunityPost, StudentProfile } from '../../types';

interface CommunityScreenProps {
  posts: CommunityPost[];
  profile?: StudentProfile;
  onAddPost: (post: CommunityPost) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ posts, profile, onAddPost }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [postsList, setPostsList] = useState<CommunityPost[]>(posts);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('Course Doubts');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(posts[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  const currentAuthorName = profile?.name || 'Student';
  const currentAuthorRole = profile?.programmeShort
    ? `${profile.programmeShort} (${profile.yearOfStudy})`
    : 'BSc Math & Stats';

  const categories = ['All', 'Course Doubts', 'Study Groups', 'Exam Prep', 'Career & Tech'];

  const filtered = postsList.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleUpvote = (postId: string) => {
    setPostsList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasUpvoted = p.hasUpvoted;
          return {
            ...p,
            upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: currentAuthorName,
      authorRole: currentAuthorRole,
      isVerifiedStudent: true,
      timestamp: 'Just now',
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      courseTag: newPostCategory === 'Course Doubts' ? 'MT 201' : undefined,
      upvotes: 1,
      hasUpvoted: true,
      repliesCount: 0,
      replies: [],
    };

    setPostsList([newPost, ...postsList]);
    onAddPost(newPost);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostModalOpen(false);
  };

  const handleAddReply = (postId: string) => {
    if (!replyText.trim()) return;

    setPostsList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            replies: [
              ...p.replies,
              {
                id: `reply-${Date.now()}`,
                authorName: currentAuthorName,
                authorRole: currentAuthorRole,
                timestamp: 'Just now',
                text: replyText.trim(),
                upvotes: 0,
              },
            ],
          };
        }
        return p;
      })
    );
    setReplyText('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Student Community</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Moderated academic discussion board for peer collaboration
          </p>
        </div>
        <button
          id="community-create-post-btn"
          onClick={() => setNewPostModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Peer</span>
        </button>
      </div>

      {/* Moderation Badge */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Strictly academic discussions. Verified student registration numbers only.</span>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`comm-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filtered.map((post) => {
          const isExpanded = expandedPostId === post.id;

          return (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-sky-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{post.authorName}</span>
                      {post.isVerifiedStudent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {post.authorRole} • {post.timestamp}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-500/20 font-medium">
                  {post.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{post.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Interaction Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      post.hasUpvoted
                        ? 'bg-blue-600/30 text-sky-400 border border-blue-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.repliesCount} Replies</span>
                  </button>
                </div>

                {post.courseTag && (
                  <span className="text-[10px] font-bold text-sky-400 px-2 py-0.5 rounded bg-slate-950">
                    {post.courseTag}
                  </span>
                )}
              </div>

              {/* Thread Replies Section */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Discussion Thread ({post.replies.length})
                  </span>

                  <div className="space-y-2">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">
                            {reply.authorName}
                          </span>
                          <span className="text-[10px] text-slate-500">{reply.timestamp}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{reply.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Reply Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write an academic response..."
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddReply(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(post.id)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Post Modal */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Ask Academic Question</h3>
              <button
                onClick={() => setNewPostModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Course Doubts">Course Doubts</option>
                  <option value="Study Groups">Study Groups</option>
                  <option value="Exam Prep">Exam Prep</option>
                  <option value="Career & Tech">Career & Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. ST 210: Clarification on Jacobian in 2D Transformations"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Question Details</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Provide context, problem statement, or textbook reference..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Post to Forum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
