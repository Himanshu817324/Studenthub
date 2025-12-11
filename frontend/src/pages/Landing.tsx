import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
            {/* Hero Section */}
            <nav className="container mx-auto px-6 py-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <BookOpen className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-gray-900">StudentHub</span>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/login" className="btn-secondary">
                            Login
                        </Link>
                        <Link to="/signup" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-6xl font-bold text-gray-900 mb-6">
                        Solve Programming Problems
                        <span className="text-primary"> Together</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10">
                        A Reddit-style community for students to share, discuss, and solve coding problems.
                        Learn from canonical solutions and help others grow.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                            Join Community
                        </Link>
                        <Link to="/explore" className="btn-secondary text-lg px-8 py-3">
                            Explore Problems
                        </Link>
                    </div>
                </motion.div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    {[
                        {
                            icon: BookOpen,
                            title: 'Curated Problems',
                            description: 'Access canonical solutions to common programming issues',
                        },
                        {
                            icon: Users,
                            title: 'Community Driven',
                            description: 'Learn from peers and contribute your knowledge',
                        },
                        {
                            icon: TrendingUp,
                            title: 'Track Progress',
                            description: 'Monitor your growth and help rate',
                        },
                        {
                            icon: Shield,
                            title: 'Quality Content',
                            description: 'Moderated community ensures high-quality discussions',
                        },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 * (idx + 1) }}
                            className="glass-card p-8 hover-lift"
                        >
                            <feature.icon className="w-12 h-12 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Landing;
