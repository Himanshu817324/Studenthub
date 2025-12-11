import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Users, Eye, MessageCircle, Filter, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Domain {
    _id: string;
    name: string;
}

interface Filters {
    search: string;
    severity: string;
    difficulty: string;
    canonical: string;
    solved: string;
    sort: string;
    domainId: string;
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

function Explore() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [domains, setDomains] = useState<Domain[]>([]);

    const [filters, setFilters] = useState<Filters>({
        search: '',
        severity: '',
        difficulty: '',
        canonical: '',
        solved: '',
        sort: 'newest',
        domainId: '',
    });

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [filters]);

    const fetchDomains = async () => {
        try {
            const response = await axios.get('${API_URL}/domains');
            setDomains(response.data);
        } catch (err) {
            console.error('Failed to fetch domains:', err);
        }
    };

    const fetchProblems = async () => {
        try {
            // Build query params
            const params: any = {};
            if (filters.search) params.search = filters.search;
            if (filters.severity) params.severity = filters.severity;
            if (filters.difficulty) params.difficulty = filters.difficulty;
            if (filters.canonical) params.canonical = filters.canonical;
            if (filters.solved) params.solved = filters.solved;
            if (filters.domainId) params.domainId = filters.domainId;
            if (filters.sort) params.sort = filters.sort;

            const response = await axios.get('${API_URL}/problems', { params });
            setProblems(response.data.problems || []);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch problems:', err);
            setError(err.response?.data?.error || 'Failed to load problems');
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            severity: '',
            difficulty: '',
            canonical: '',
            solved: '',
            sort: 'newest',
            domainId: '',
        });
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading problems...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="glass-card p-8 max-w-md text-center">
                        <p className="text-red-600 mb-4">❌ {error}</p>
                        <button
                            onClick={fetchProblems}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Problems</h1>
                        <p className="text-gray-600">Browse and discover programming problems shared by the community</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="glass-card p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
                                    <p className="text-sm text-gray-600">Total Problems</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {problems.filter(p => p.solved).length}
                                    </p>
                                    <p className="text-sm text-gray-600">Solved</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Eye className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {problems.reduce((sum, p) => sum + p.viewCount, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Views</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {problems.filter(p => p.canonical).length}
                                    </p>
                                    <p className="text-sm text-gray-600">Canonical</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="glass-card p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search problems..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>

                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                        {/* Severity Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Severity
                                            </label>
                                            <select
                                                value={filters.severity}
                                                onChange={(e) => handleFilterChange('severity', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">All Severities</option>
                                                <option value="CRITICAL">Critical</option>
                                                <option value="HIGH">High</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="LOW">Low</option>
                                            </select>
                                        </div>

                                        {/* Difficulty Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Difficulty
                                            </label>
                                            <select
                                                value={filters.difficulty}
                                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">All Difficulties</option>
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                            </select>
                                        </div>

                                        {/* Domain Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Domain
                                            </label>
                                            <select
                                                value={filters.domainId}
                                                onChange={(e) => handleFilterChange('domainId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">All Domains</option>
                                                {domains.map((domain) => (
                                                    <option key={domain._id} value={domain._id}>
                                                        {domain.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Solved Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={filters.solved}
                                                onChange={(e) => handleFilterChange('solved', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">All Problems</option>
                                                <option value="true">Solved Only</option>
                                                <option value="false">Unsolved Only</option>
                                            </select>
                                        </div>

                                        {/* Canonical Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={filters.canonical}
                                                onChange={(e) => handleFilterChange('canonical', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">All Types</option>
                                                <option value="true">Canonical Only</option>
                                            </select>
                                        </div>

                                        {/* Sort Order */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Sort By
                                            </label>
                                            <select
                                                value={filters.sort}
                                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="popular">Most Popular</option>
                                                <option value="views">Most Viewed</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Active Filters Display */}
                    {activeFilterCount > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {filters.severity && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1">
                                    <span>Severity: {filters.severity}</span>
                                    <button onClick={() => handleFilterChange('severity', '')} className="hover:text-blue-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.difficulty && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center space-x-1">
                                    <span>Difficulty: {filters.difficulty}</span>
                                    <button onClick={() => handleFilterChange('difficulty', '')} className="hover:text-purple-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.solved && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center space-x-1">
                                    <span>{filters.solved === 'true' ? 'Solved' : 'Unsolved'}</span>
                                    <button onClick={() => handleFilterChange('solved', '')} className="hover:text-green-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.canonical && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center space-x-1">
                                    <span>Canonical</span>
                                    <button onClick={() => handleFilterChange('canonical', '')} className="hover:text-yellow-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.domainId && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center space-x-1">
                                    <span>Domain: {domains.find(d => d._id === filters.domainId)?.name}</span>
                                    <button onClick={() => handleFilterChange('domainId', '')} className="hover:text-gray-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Problems List */}
                    {problems.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <p className="text-gray-600 text-lg">No problems found</p>
                            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
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
                </div>
            </div>
        </>
    );
}

export default Explore;
