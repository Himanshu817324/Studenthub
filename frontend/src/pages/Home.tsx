import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Eye, Calendar, Award, PlusCircle } from 'lucide-react';
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

function Home() {
    const { user } = useAuthStore();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/problems');
            // Get latest 10 problems for the feed
            setProblems((response.data.problems || []).slice(0, 10));
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch problems:', err);
            setLoading(false);
        }
    };

    const userProblemsCount = problems.filter(p => p.createdBy._id === user?.id).length;
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.name}! 👋
                        </h1>
                        <p className="text-gray-600">Here's what's happening in your community</p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Award className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{userProblemsCount}</p>
                                    <p className="text-sm text-gray-600">Problems Posted</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {problems.filter(p => p.createdBy._id === user?.id && p.solved).length}
                                    </p>
                                    <p className="text-sm text-gray-600">Solved</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{memberSince}</p>
                                    <p className="text-sm text-gray-600">Member Since</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Problems</h2>
                        <Link
                            to="/post/create"
                            className="btn-primary flex items-center space-x-2"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Post Problem</span>
                        </Link>
                    </div>

                    {/* Problems Feed */}
                    {problems.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <p className="text-gray-600 text-lg mb-4">No problems yet</p>
                            <Link to="/post/create" className="btn-primary inline-block">
                                Create the first problem
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {problems.map((problem, index) => (
                                <motion.div
                                    key={problem._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Link to={`/problems/${problem._id}`}>
                                        <div className="glass-card p-6 hover-lift cursor-pointer hover:shadow-xl transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {problem.canonical && (
                                                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                                                                ⭐ CANONICAL
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${severityColors[problem.severity]}`}>
                                                            {problem.severity}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${difficultyColors[problem.difficulty]}`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                                                        {problem.title}
                                                    </h3>
                                                    <p className="text-gray-600 line-clamp-2 mb-3">
                                                        {problem.descriptionMarkdown.substring(0, 200)}...
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {problem.tags.slice(0, 5).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span className="font-medium">{problem.upvotes - problem.downvotes}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{problem.viewCount}</span>
                                                    </div>
                                                    {problem.solved && (
                                                        <span className="text-green-600 font-medium">✓ Solved</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-500">by</span>
                                                    <span className="font-medium text-gray-900">{problem.createdBy.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* View All Link */}
                    {problems.length > 0 && (
                        <div className="text-center mt-8">
                            <Link
                                to="/explore"
                                className="text-primary font-medium hover:underline"
                            >
                                View all problems →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Home;
