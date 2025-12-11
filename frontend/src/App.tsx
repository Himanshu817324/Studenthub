import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages (will be created)
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MajorProblems from './pages/MajorProblems';
import ProblemDetail from './pages/ProblemDetail';
import PostCreate from './pages/PostCreate';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />

                {/* Protected routes */}
                <Route
                    path="/home"
                    element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
                />
                <Route path="/explore" element={<Explore />} />
                <Route path="/problems/major" element={<MajorProblems />} />
                <Route path="/problems/:id" element={<ProblemDetail />} />
                <Route
                    path="/problems/new"
                    element={isAuthenticated ? <PostCreate /> : <Navigate to="/login" />}
                />
                <Route path="/profile/:userId?" element={<Profile />} />
                <Route
                    path="/admin"
                    element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
