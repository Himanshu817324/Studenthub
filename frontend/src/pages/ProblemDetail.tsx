import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Calendar, User, ExternalLink, CheckCircle, Edit, Trash2, Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

interface Problem {
    _id: string;
    title: string;
    descriptionMarkdown: string;
    createdBy: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    canonical: boolean;
    solved: boolean;
    upvotes: number;
    downvotes: number;
    viewCount: number;
    tags: string[];
    resources?: Array<{
        type: 'link' | 'video' | 'article';
        url: string;
        title: string;
    }>;
    createdAt: string;
}

interface Answer {
    _id: string;
    problemId: string;
    authorId: {
        _id: string;
        name: string;
        avatarUrl?: string;
        roles: string[];
    };
    contentMarkdown: string;
    upvotes: number;
    accepted: boolean;
    createdAt: string;
}

interface Comment {
    _id: string;
    parentId: string;
    parentType: string;
    authorId: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
    content: string;
    createdAt: string;
}

const severityColors = {
    CRITICAL: 'bg-red-500/10 text-red-700 border-red-200',
    HIGH: 'bg-orange-500/10 text-orange-700 border-orange-200',
    MEDIUM: 'bg-blue-500/10 text-blue-700 border-blue-200',
    LOW: 'bg-green-500/10 text-green-700 border-green-200',
};

const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
};

function ProblemDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [voting, setVoting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Answer form
    const [answerContent, setAnswerContent] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // Comment form
    const [commentContent, setCommentContent] = useState('');
    const [commentingOn, setCommentingOn] = useState<{ type: string; id: string } | null>(null);
    const [submittingComment, setSubmittingComment] = useState(false);

    // User votes
    const [userVote, setUserVote] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchProblem();
        }
    }, [id]);

    const fetchProblem = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/problems/${id}`);
            setProblem(response.data.problem);
            setAnswers(response.data.answers || []);
            setComments(response.data.comments || []);
            setUserVote(response.data.userVote);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch problem:', err);
            setError(err.response?.data?.error || 'Failed to load problem');
            setLoading(false);
        }
    };

    const handleVote = async (targetType: string, targetId: string, value: number) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (voting) return;

        setVoting(true);
        try {
            await axios.post(
                'http://localhost:5000/api/problems/vote',
                { targetType, targetId, value },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            // Refresh problem data
            await fetchProblem();
        } catch (err: any) {
            console.error('Vote failed:', err);
        } finally {
            setVoting(false);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerContent.trim() || !user) return;

        setSubmittingAnswer(true);
        try {
            await axios.post(
                `http://localhost:5000/api/problems/${id}/answers`,
                { contentMarkdown: answerContent },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            setAnswerContent('');
            await fetchProblem();
        } catch (err: any) {
            console.error('Failed to submit answer:', err);
            setError(err.response?.data?.error || 'Failed to submit answer');
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() || !commentingOn || !user) return;

        setSubmittingComment(true);
        try {
            await axios.post(
                'http://localhost:5000/api/problems/comment',
                {
                    parentType: commentingOn.type,
                    parentId: commentingOn.id,
                    content: commentContent,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            setCommentContent('');
            setCommentingOn(null);
            await fetchProblem();
        } catch (err: any) {
            console.error('Failed to submit comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleAcceptAnswer = async (answerId: string) => {
        if (!user) return;

        try {
            await axios.post(
                `http://localhost:5000/api/problems/${id}/answers/${answerId}/accept`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            await fetchProblem();
        } catch (err: any) {
            console.error('Failed to accept answer:', err);
        }
    };

    const handleDelete = async () => {
        if (!problem) return;

        setDeleting(true);
        try {
            await axios.delete(
                `http://localhost:5000/api/problems/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            navigate('/home');
        } catch (err: any) {
            console.error('Delete failed:', err);
            setError(err.response?.data?.error || 'Failed to delete problem');
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </>
        );
    }

    if (error || !problem) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error || 'Problem not found'}
                        </div>
                        <Link to="/explore" className="mt-4 btn-primary inline-block">
                            Back to Explore
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const isProblemCreator = user?.id === problem.createdBy._id;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="container mx-auto max-w-4xl">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {/* Main Problem Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 mb-6"
                    >
                        {/* Header with badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {problem.canonical && (
                                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-md">
                                    ⭐ CANONICAL
                                </span>
                            )}
                            <span className={`px-3 py-1 text-sm font-semibold rounded-md border ${severityColors[problem.severity]}`}>
                                {problem.severity}
                            </span>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-md ${difficultyColors[problem.difficulty]}`}>
                                {problem.difficulty}
                            </span>
                            {problem.solved && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-md flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Solved</span>
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">{problem.title}</h1>

                        {/* Edit and Delete buttons */}
                        {user && isProblemCreator && (
                            <div className="flex space-x-3 mb-6">
                                <button
                                    onClick={() => navigate(`/problems/${id}/edit`)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Posted by <strong>{problem.createdBy?.name || 'Unknown'}</strong></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4" />
                                <span>{problem.viewCount || 0} views</span>
                            </div>
                        </div>

                        {/* Voting Section */}
                        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                            <button
                                onClick={() => handleVote('Problem', problem._id, 1)}
                                disabled={voting}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${userVote === 1 ? 'bg-green-100 text-green-600' : 'hover:bg-green-100 text-gray-600 hover:text-green-600'
                                    }`}
                            >
                                <TrendingUp className="w-6 h-6" />
                            </button>
                            <span className="text-2xl font-bold text-gray-900">
                                {problem.upvotes - problem.downvotes}
                            </span>
                            <button
                                onClick={() => handleVote('Problem', problem._id, -1)}
                                disabled={voting}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${userVote === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
                                    }`}
                            >
                                <TrendingDown className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Markdown Content */}
                        <div className="prose prose-lg max-w-none mb-6">
                            <ReactMarkdown
                                components={{
                                    code: ({ node, inline, className, children, ...props }: any) => {
                                        return inline ? (
                                            <code className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                                    a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                                }}
                            >
                                {problem.descriptionMarkdown}
                            </ReactMarkdown>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(problem.tags || []).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Resources */}
                        {problem.resources && problem.resources.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
                                <div className="space-y-2">
                                    {problem.resources.map((resource, index) => (
                                        <a
                                            key={index}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-primary hover:underline"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>{resource.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Problem Comments */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Comments ({comments.filter(c => c.parentId === problem._id).length})</h3>
                                <button
                                    onClick={() => setCommentingOn({ type: 'Problem', id: problem._id })}
                                    className="text-primary hover:text-primary/80 flex items-center space-x-1"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Add Comment</span>
                                </button>
                            </div>

                            {comments.filter(c => c.parentId === problem._id).map((comment) => (
                                <div key={comment._id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-semibold text-gray-900">{comment.authorId.name}</span>
                                        <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Answers Section */}
                    <div className="glass-card p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Answers ({answers.length})
                        </h2>

                        {/* Answer Form */}
                        {user && (
                            <form onSubmit={handleSubmitAnswer} className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Answer
                                </label>
                                <textarea
                                    value={answerContent}
                                    onChange={(e) => setAnswerContent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                                    rows={8}
                                    placeholder="Write your answer in markdown..."
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={submittingAnswer}
                                    className="mt-3 btn-primary flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {submittingAnswer ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Posting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Post Answer</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Answers List */}
                        <div className="space-y-6">
                            {answers.map((answer) => (
                                <div
                                    key={answer._id}
                                    className={`p-6 rounded-lg border-2 ${answer.accepted ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    {/* Answer Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {answer.authorId.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-gray-900">{answer.authorId.name}</span>
                                                    {answer.authorId.roles?.includes('admin') && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Admin</span>
                                                    )}
                                                    {answer.accepted && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex items-center space-x-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Accepted</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-500">{new Date(answer.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Accept Answer Button */}
                                        {isProblemCreator && !answer.accepted && (
                                            <button
                                                onClick={() => handleAcceptAnswer(answer._id)}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Accept Answer
                                            </button>
                                        )}
                                    </div>

                                    {/* Voting */}
                                    <div className="flex items-center space-x-4 mb-4">
                                        <button
                                            onClick={() => handleVote('Answer', answer._id, 1)}
                                            disabled={voting}
                                            className="p-1 rounded hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors"
                                        >
                                            <TrendingUp className="w-5 h-5" />
                                        </button>
                                        <span className="text-xl font-bold text-gray-900">{answer.upvotes}</span>
                                        <button
                                            onClick={() => handleVote('Answer', answer._id, -1)}
                                            disabled={voting}
                                            className="p-1 rounded hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <TrendingDown className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Answer Content */}
                                    <div className="prose max-w-none mb-4">
                                        <ReactMarkdown>{answer.contentMarkdown}</ReactMarkdown>
                                    </div>

                                    {/* Answer Comments */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setCommentingOn({ type: 'Answer', id: answer._id })}
                                            className="text-sm text-primary hover:text-primary/80 flex items-center space-x-1"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Add Comment</span>
                                        </button>

                                        {comments.filter(c => c.parentId === answer._id).map((comment) => (
                                            <div key={comment._id} className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-semibold text-gray-900 text-sm">{comment.authorId.name}</span>
                                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {answers.length === 0 && (
                                <p className="text-center text-gray-600 py-8">No answers yet. Be the first to answer!</p>
                            )}
                        </div>
                    </div>

                    {/* Comment Form Modal */}
                    {commentingOn && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="glass-card p-6 max-w-2xl w-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Comment</h3>
                                <form onSubmit={handleSubmitComment}>
                                    <textarea
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows={4}
                                        placeholder="Write your comment..."
                                        required
                                    />
                                    <div className="flex space-x-3 mt-4">
                                        <button
                                            type="submit"
                                            disabled={submittingComment}
                                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {submittingComment ? 'Posting...' : 'Post Comment'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCommentingOn(null);
                                                setCommentContent('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-6 max-w-md w-full"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Problem?</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this problem? This action cannot be undone
                                    and will also delete all associated answers, comments, votes, and bookmarks.
                                </p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={deleting}
                                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProblemDetail;
