import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Calendar, Award, CheckCircle, TrendingUp, Edit, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    roles: string[];
    createdAt: string;
}

interface UserStats {
    problemsPosted: number;
    answersGiven: number;
    upvotesReceived: number;
    acceptedAnswers: number;
}

interface Problem {
    _id: string;
    title: string;
    severity: string;
    difficulty: string;
    solved: boolean;
    upvotes: number;
    createdAt: string;
}

interface Answer {
    _id: string;
    problemId: { _id: string; title: string };
    contentMarkdown: string;
    accepted: boolean;
    upvotes: number;
    createdAt: string;
}

type Tab = 'problems' | 'answers' | 'bookmarks';

function Profile() {
    const { userId } = useParams<{ userId?: string }>();
    const { user: currentUser } = useAuthStore();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Activity data
    const [activeTab, setActiveTab] = useState<Tab>('problems');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        avatarUrl: '',
    });
    const [saving, setSaving] = useState(false);

    // Determine if viewing own profile
    const targetUserId = userId || currentUser?.id;
    const isOwnProfile = currentUser?.id === targetUserId;

    useEffect(() => {
        if (targetUserId) {
            fetchProfile();
        }
    }, [targetUserId]);

    useEffect(() => {
        if (targetUserId) {
            fetchActivity();
        }
    }, [activeTab, targetUserId]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${targetUserId}`);
            setProfile(response.data.user);
            setStats(response.data.stats);
            setEditForm({
                name: response.data.user.name,
                bio: response.data.user.bio || '',
                avatarUrl: response.data.user.avatarUrl || '',
            });
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch profile:', err);
            setError(err.response?.data?.error || 'Failed to load profile');
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        if (!targetUserId) return;

        setActivityLoading(true);
        try {
            if (activeTab === 'problems') {
                const response = await axios.get(`http://localhost:5000/api/users/${targetUserId}/problems`);
                setProblems(response.data.problems);
            } else if (activeTab === 'answers') {
                const response = await axios.get(`http://localhost:5000/api/users/${targetUserId}/answers`);
                setAnswers(response.data.answers);
            }
            setActivityLoading(false);
        } catch (err) {
            console.error('Failed to fetch activity:', err);
            setActivityLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!targetUserId) return;

        setSaving(true);
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/users/${targetUserId}`,
                editForm,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            setProfile(response.data.user);
            setIsEditing(false);
            setSaving(false);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
            setSaving(false);
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

    if (error || !profile || !stats) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error || 'Profile not found'}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 mb-6"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="text-3xl font-bold text-gray-900 mb-2 px-3 py-1 border border-gray-300 rounded-lg"
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                                    )}
                                    <p className="text-gray-600 mb-1">{profile.email}</p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            {isOwnProfile && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            )}

                            {/* Save/Cancel Buttons */}
                            {isEditing && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{saving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({
                                                name: profile.name,
                                                bio: profile.bio || '',
                                                avatarUrl: profile.avatarUrl || '',
                                            });
                                        }}
                                        disabled={saving}
                                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            {isEditing ? (
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-600">
                                    {profile.bio || 'No bio available'}
                                </p>
                            )}
                        </div>

                        {/* Avatar URL Edit */}
                        {isEditing && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                                <input
                                    type="url"
                                    value={editForm.avatarUrl}
                                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.problemsPosted}</p>
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
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.answersGiven}</p>
                                    <p className="text-sm text-gray-600">Answers Given</p>
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
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.upvotesReceived}</p>
                                    <p className="text-sm text-gray-600">Upvotes Received</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-yellow-500/10 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.acceptedAnswers}</p>
                                    <p className="text-sm text-gray-600">Accepted Answers</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Activity Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        {/* Tab Headers */}
                        <div className="flex space-x-4 mb-6 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('problems')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'problems'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Problems ({stats.problemsPosted})
                            </button>
                            <button
                                onClick={() => setActiveTab('answers')}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'answers'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Answers ({stats.answersGiven})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activityLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div>
                                {activeTab === 'problems' && (
                                    <div className="space-y-4">
                                        {problems.length === 0 ? (
                                            <p className="text-center text-gray-600 py-8">No problems posted yet</p>
                                        ) : (
                                            problems.map((problem) => (
                                                <Link
                                                    key={problem._id}
                                                    to={`/problems/${problem._id}`}
                                                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                                {problem.title}
                                                            </h3>
                                                            <div className="flex items-center space-x-3 text-sm">
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                                                    {problem.severity}
                                                                </span>
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                                                                    {problem.difficulty}
                                                                </span>
                                                                {problem.solved && (
                                                                    <span className="text-green-600 font-medium">✓ Solved</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm text-gray-600">
                                                            <div className="flex items-center space-x-1">
                                                                <TrendingUp className="w-4 h-4" />
                                                                <span>{problem.upvotes}</span>
                                                            </div>
                                                            <div className="mt-1">
                                                                {new Date(problem.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === 'answers' && (
                                    <div className="space-y-4">
                                        {answers.length === 0 ? (
                                            <p className="text-center text-gray-600 py-8">No answers given yet</p>
                                        ) : (
                                            answers.map((answer) => (
                                                <Link
                                                    key={answer._id}
                                                    to={`/problems/${answer.problemId._id}`}
                                                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                Answer to: <span className="font-semibold">{answer.problemId.title}</span>
                                                            </p>
                                                            <p className="text-gray-700 line-clamp-2">
                                                                {answer.contentMarkdown.substring(0, 150)}...
                                                            </p>
                                                            <div className="flex items-center space-x-3 mt-2">
                                                                {answer.accepted && (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                                                                        ✓ Accepted
                                                                    </span>
                                                                )}
                                                                <span className="text-sm text-gray-600 flex items-center space-x-1">
                                                                    <TrendingUp className="w-4 h-4" />
                                                                    <span>{answer.upvotes}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {new Date(answer.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
}

export default Profile;
