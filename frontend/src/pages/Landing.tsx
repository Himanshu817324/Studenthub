import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Shield, Code, Zap, Award, ChevronLeft, ChevronRight, Github, Twitter, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const heroSlides = [
    {
        image: '/hero1.png',
        title: 'Master Coding Together',
        subtitle: 'Join thousands of developers solving real-world programming challenges',
        cta: 'Start Learning'
    },
    {
        image: '/hero2.png',
        title: 'Share Knowledge, Grow Faster',
        subtitle: 'Collaborate with peers, learn from experts, and build your developer portfolio',
        cta: 'Explore Problems'
    },
    {
        image: '/hero3.png',
        title: 'Your Code Community Awaits',
        subtitle: 'Get instant help, contribute solutions, and level up your programming skills',
        cta: 'Join Now'
    }
];

function Landing() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Navbar */}
            <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CodeCrew</span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex space-x-4"
                        >
                            <Link to="/login" className="px-6 py-2 text-gray-700 hover:text-primary transition-colors font-medium">
                                Login
                            </Link>
                            <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium">
                                Get Started
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Slider */}
            <div className="relative h-screen overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                        </div>

                        <div className="relative h-full flex items-center">
                            <div className="container mx-auto px-6">
                                <div className="max-w-3xl">
                                    <motion.h1
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
                                    >
                                        {heroSlides[currentSlide].title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed"
                                    >
                                        {heroSlides[currentSlide].subtitle}
                                    </motion.p>
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="flex flex-wrap gap-4"
                                    >
                                        <Link
                                            to="/signup"
                                            className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                        >
                                            {heroSlides[currentSlide].cta}
                                        </Link>
                                        <Link
                                            to="/explore"
                                            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg text-lg font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                                        >
                                            Browse Problems
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Slider Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slider Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { number: '10K+', label: 'Active Developers', icon: Users },
                            { number: '50K+', label: 'Problems Solved', icon: Award },
                            { number: '100+', label: 'Tech Topics', icon: Code },
                            { number: '95%', label: 'Success Rate', icon: TrendingUp },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CodeCrew</span>?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to accelerate your coding journey
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Curated Solutions',
                                description: 'Access canonical solutions to common programming problems, verified by experts',
                                color: 'from-blue-500 to-cyan-500',
                            },
                            {
                                icon: Users,
                                title: 'Active Community',
                                description: 'Connect with developers worldwide, share knowledge, and grow together',
                                color: 'from-purple-500 to-pink-500',
                            },
                            {
                                icon: Zap,
                                title: 'Real-time Help',
                                description: 'Get instant answers to your coding questions from experienced developers',
                                color: 'from-orange-500 to-red-500',
                            },
                            {
                                icon: Shield,
                                title: 'Quality Content',
                                description: 'Moderated discussions ensure high-quality, accurate programming solutions',
                                color: 'from-green-500 to-emerald-500',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Track Progress',
                                description: 'Monitor your learning journey with detailed stats and achievement badges',
                                color: 'from-indigo-500 to-purple-500',
                            },
                            {
                                icon: Award,
                                title: 'Earn Recognition',
                                description: 'Build your reputation by helping others and contributing quality solutions',
                                color: 'from-yellow-500 to-orange-500',
                            },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Simple steps to start your coding journey</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Sign Up Free', description: 'Create your account in seconds and join the community' },
                            { step: '02', title: 'Explore & Learn', description: 'Browse thousands of problems across multiple tech stacks' },
                            { step: '03', title: 'Solve & Share', description: 'Post solutions, help others, and build your portfolio' },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative text-center"
                            >
                                <div className="text-8xl font-bold text-primary/10 mb-4">{item.step}</div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {item.step}
                                </div>
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary to-accent">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Level Up Your Coding Skills?
                        </h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Join thousands of developers who are already solving problems and growing together
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/signup"
                                className="px-10 py-4 bg-white text-primary rounded-lg text-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl"
                            >
                                Join CodeCrew Free
                            </Link>
                            <Link
                                to="/explore"
                                className="px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg text-lg font-bold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                            >
                                View Problems
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">CodeCrew</span>
                            </div>
                            <p className="text-gray-400">
                                Empowering developers to solve problems together
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Platform</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/explore" className="hover:text-white transition">Explore</Link></li>
                                <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
                                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Community</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Guidelines</a></li>
                                <li><a href="#" className="hover:text-white transition">Support</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Connect</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 CodeCrew. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
