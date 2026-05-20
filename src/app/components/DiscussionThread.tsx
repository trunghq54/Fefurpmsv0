import { useState } from 'react';
import { MessageSquare, Send, Reply, ThumbsUp, Pin, Trash2, Edit2, Clock } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
  isPinned: boolean;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  role: string;
  content: string;
  timestamp: string;
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: 'Dr. Hoàng Văn E',
    role: 'Reviewer',
    content: 'The methodology section needs more detail on the data collection process. Could you elaborate on your sampling strategy?',
    timestamp: '2026-05-12T10:30:00',
    likes: 5,
    isPinned: true,
    replies: [
      {
        id: 101,
        author: 'Dr. Nguyễn Văn A',
        role: 'PI',
        content: 'Thank you for the feedback. I will add a detailed subsection on our stratified random sampling approach in the revised version.',
        timestamp: '2026-05-12T14:20:00'
      }
    ]
  },
  {
    id: 2,
    author: 'Dr. Vũ Thị F',
    role: 'Reviewer',
    content: 'The budget allocation seems appropriate, but consider increasing the allocation for testing phase. Real-world validation is crucial for this type of AI system.',
    timestamp: '2026-05-11T15:45:00',
    likes: 3,
    isPinned: false,
    replies: []
  },
  {
    id: 3,
    author: 'Admin Staff',
    role: 'Admin',
    content: 'Reminder: Please submit your final review scores by May 20, 2026. Committee meeting is scheduled for May 22.',
    timestamp: '2026-05-10T09:00:00',
    likes: 8,
    isPinned: true,
    replies: []
  },
  {
    id: 4,
    author: 'Dr. Nguyễn Văn A',
    role: 'PI',
    content: 'I have uploaded the revised proposal (v3) with additional details on the evaluation metrics. Please review when you have time.',
    timestamp: '2026-05-09T16:30:00',
    likes: 2,
    isPinned: false,
    replies: [
      {
        id: 102,
        author: 'Dr. Hoàng Văn E',
        role: 'Reviewer',
        content: 'Received. Will review by end of week.',
        timestamp: '2026-05-09T17:00:00'
      },
      {
        id: 103,
        author: 'Dr. Vũ Thị F',
        role: 'Reviewer',
        content: 'Same here. Thanks for the quick turnaround.',
        timestamp: '2026-05-09T17:15:00'
      }
    ]
  }
];

export default function DiscussionThread({ proposalId }: { proposalId?: number }) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Math.max(...comments.map(c => c.id)) + 1,
      author: 'Current User',
      role: 'Reviewer',
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isPinned: false,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handlePostReply = (commentId: number) => {
    if (!replyContent.trim()) return;

    const reply: Reply = {
      id: Date.now(),
      author: 'Current User',
      role: 'Reviewer',
      content: replyContent,
      timestamp: new Date().toISOString()
    };

    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, replies: [...c.replies, reply] }
        : c
    ));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleLike = (commentId: number) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const handlePin = (commentId: number) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, isPinned: !c.isPinned } : c
    ));
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Reviewer': 'bg-green-100 text-green-800',
      'PI': 'bg-blue-100 text-blue-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Discussion & Comments</h2>
            <p className="text-gray-500 mt-1">Collaborate with reviewers and stakeholders</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {comments.length} comments • {comments.reduce((sum, c) => sum + c.replies.length, 0)} replies
        </div>
      </div>

      {/* New Comment Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Add a Comment</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts, ask questions, or provide feedback..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handlePostComment}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Send className="w-4 h-4" />
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map(comment => (
          <div key={comment.id} className={`bg-white rounded-xl shadow-sm border ${comment.isPinned ? 'border-yellow-400' : 'border-gray-200'}`}>
            {comment.isPinned && (
              <div className="bg-yellow-50 px-6 py-2 border-b border-yellow-100 flex items-center gap-2 text-yellow-800 text-sm font-medium">
                <Pin className="w-4 h-4" />
                Pinned Comment
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {comment.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{comment.author}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(comment.role)}`}>
                        {comment.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(comment.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePin(comment.id)}
                    className={`p-2 rounded-lg transition ${comment.isPinned ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">{comment.content}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{comment.likes}</span>
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Reply className="w-4 h-4" />
                  <span className="text-sm font-medium">Reply</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-12">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePostReply(comment.id)}
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-12 space-y-3 border-l-2 border-gray-200">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="pl-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {reply.author[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">{reply.author}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(reply.role)}`}>
                              {reply.role}
                            </span>
                            <span className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
