import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, User, LogOut, Menu, X, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">StudentHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/home"
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-primary"
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </Link>
                        <Link
                            to="/explore"
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-primary"
                        >
                            <Compass className="w-5 h-5" />
                            <span>Explore</span>
                        </Link>
                        <Link
                            to="/post/create"
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ml-2"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Post Problem</span>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/profile"
                            className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-primary" />
                                )}
                            </div>
                            <span className="text-gray-900 font-medium">{user.name}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-2">
                            <Link
                                to="/home"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                            >
                                <Home className="w-5 h-5" />
                                <span>Home</span>
                            </Link>
                            <Link
                                to="/explore"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                            >
                                <Compass className="w-5 h-5" />
                                <span>Explore</span>
                            </Link>
                            <Link
                                to="/post/create"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span>Post Problem</span>
                            </Link>
                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                            >
                                <User className="w-5 h-5" />
                                <span>Profile</span>
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
