import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Calendar, User, ExternalLink, CheckCircle } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProblem();
        }
    }, [id]);

    const fetchProblem = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/problems/${id}`);
            // Backend returns { problem, answers, comments }
            setProblem(response.data.problem || response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch problem:', err);
            setError(err.response?.data?.error || 'Failed to load problem');
            setLoading(false);
        }
    };

    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (voting || !problem) return;

        setVoting(true);
        try {
            await axios.post(
                `http://localhost:5000/api/problems/${id}/vote`,
                { voteType },
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

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                    <div className="glass-card p-8 max-w-md text-center">
                        <p className="text-red-600 mb-4">❌ {error}</p>
                        <Link to="/explore" className="btn-primary inline-block">
                            Back to Explore
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (!problem) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                    <div className="glass-card p-8 max-w-md text-center">
                        <p className="text-red-600 mb-4">❌ Problem not found</p>
                        <Link to="/explore" className="btn-primary inline-block">
                            Back to Explore
                        </Link>
                    </div>
                </div>
            </>
        );
    }

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
                                onClick={() => handleVote('upvote')}
                                disabled={voting}
                                className="p-2 rounded-lg hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
                            >
                                <TrendingUp className="w-6 h-6" />
                            </button>
                            <span className="text-2xl font-bold text-gray-900">
                                {problem.upvotes - problem.downvotes}
                            </span>
                            <button
                                onClick={() => handleVote('downvote')}
                                disabled={voting}
                                className="p-2 rounded-lg hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
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
                    </motion.div>

                    {/* Discussion placeholder */}
                    <div className="glass-card p-8 text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Discussion</h3>
                        <p className="text-gray-600">Comments and solutions will appear here</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProblemDetail;
