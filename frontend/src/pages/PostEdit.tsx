import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import apiClient from '../services/api';

interface FormData {
    title: string;
    descriptionMarkdown: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    tags: string[];
    resources: Array<{
        type: 'link' | 'video' | 'article';
        url: string;
        title: string;
    }>;
}

function PostEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState<FormData>({
        title: '',
        descriptionMarkdown: '',
        severity: 'MEDIUM',
        difficulty: 'INTERMEDIATE',
        tags: [],
        resources: [],
    });

    useEffect(() => {
        if (id) {
            fetchProblem();
        }
    }, [id]);

    const fetchProblem = async () => {
        try {
            const response = await apiClient.get(`/problems/${id}`);
            const problem = response.data.problem || response.data;

            // Check if user is authorized to edit
            if (problem.createdBy._id !== user?.id && !user?.roles?.includes('admin')) {
                setError('You are not authorized to edit this problem');
                setLoading(false);
                return;
            }

            setFormData({
                title: problem.title,
                descriptionMarkdown: problem.descriptionMarkdown,
                severity: problem.severity,
                difficulty: problem.difficulty,
                tags: problem.tags || [],
                resources: problem.resources || [],
            });
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch problem:', err);
            setError(err.response?.data?.error || 'Failed to load problem');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.descriptionMarkdown.trim()) {
            setError('Description is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await apiClient.patch(`/problems/${id}`, formData);

            // Redirect back to the problem detail page
            navigate(`/problems/${id}`);
        } catch (err: any) {
            console.error('Failed to update problem:', err);
            setError(err.response?.data?.error || 'Failed to update problem');
            setSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim().toLowerCase()],
            });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove),
        });
    };

    const addResource = () => {
        setFormData({
            ...formData,
            resources: [
                ...formData.resources,
                { type: 'link', url: '', title: '' },
            ],
        });
    };

    const updateResource = (index: number, field: string, value: string) => {
        const newResources = [...formData.resources];
        newResources[index] = { ...newResources[index], [field]: value };
        setFormData({ ...formData, resources: newResources });
    };

    const removeResource = (index: number) => {
        setFormData({
            ...formData,
            resources: formData.resources.filter((_, i) => i !== index),
        });
    };

    if (!user) {
        navigate('/login');
        return null;
    }

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

    if (error && !formData.title) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 btn-primary"
                        >
                            Go Back
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
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Problem</h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Problem Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., React state not updating after API call"
                                    maxLength={200}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Markdown supported) *
                                </label>
                                <textarea
                                    value={formData.descriptionMarkdown}
                                    onChange={(e) => setFormData({ ...formData, descriptionMarkdown: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                                    rows={12}
                                    placeholder="Describe your problem in detail. You can use markdown formatting:
# Heading
## Subheading
- Bullet points
```javascript
code blocks
```
**bold** and *italic* text"
                                    required
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Use markdown to format your problem description
                                </p>
                            </div>

                            {/* Severity & Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Severity *
                                    </label>
                                    <select
                                        value={formData.severity}
                                        onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="LOW">Low - Minor issue</option>
                                        <option value="MEDIUM">Medium - Moderate impact</option>
                                        <option value="HIGH">High - Significant problem</option>
                                        <option value="CRITICAL">Critical - Blocking issue</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty *
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <div className="flex space-x-2 mb-3">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Add tags (e.g., react, javascript, hooks)"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md flex items-center space-x-2"
                                        >
                                            <span>#{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Resources */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Helpful Resources (Optional)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addResource}
                                        className="flex items-center space-x-1 text-primary hover:text-primary/80"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Resource</span>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.resources.map((resource, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={resource.title}
                                                onChange={(e) => updateResource(index, 'title', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                placeholder="Title"
                                            />
                                            <input
                                                type="url"
                                                value={resource.url}
                                                onChange={(e) => updateResource(index, 'url', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                placeholder="URL"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeResource(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/problems/${id}`)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

export default PostEdit;
