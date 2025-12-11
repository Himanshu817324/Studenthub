import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate, AuthRequest } from '../middleware/auth';
import passport from '../config/passport';

const router = Router();

// Signup
router.post(
    '/signup',
    authLimiter,
    validate([
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ]),
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Create user
            const user = await User.create({
                name,
                email,
                passwordHash: password, // Will be hashed by pre-save hook
                roles: ['user'],
                oauthProviders: [],
            });

            // Generate tokens
            const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-dev-only';
            const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-dev-only';

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const accessToken = jwt.sign({ userId: user._id }, jwtSecret, {
                expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
            });

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const refreshToken = jwt.sign({ userId: user._id }, jwtRefreshSecret, {
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
            });

            res.status(201).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    roles: user.roles,
                },
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    }
);

// Login
router.post(
    '/login',
    authLimiter,
    validate([
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user || !user.passwordHash) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate tokens
            const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-dev-only';
            const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-dev-only';

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const accessToken = jwt.sign({ userId: user._id }, jwtSecret, {
                expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
            });

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const refreshToken = jwt.sign({ userId: user._id }, jwtRefreshSecret, {
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
            });

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    roles: user.roles,
                },
                accessToken,
                refreshToken,
            });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    }
);

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-dev-only';
        const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-dev-only';

        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // @ts-expect-error - JWT typing issue with expiresIn as string
        const newAccessToken = jwt.sign({ userId: user._id }, jwtSecret, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
        });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
            bio: user.bio,
            interests: user.interests,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Google OAuth - initiate
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Google OAuth - callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req: any, res) => {
        try {
            const user = req.user as any;
            const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-dev-only';
            const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-dev-only';

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const accessToken = jwt.sign({ userId: user._id }, jwtSecret, {
                expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
            });

            // @ts-expect-error - JWT typing issue with expiresIn as string
            const refreshToken = jwt.sign({ userId: user._id }, jwtRefreshSecret, {
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
            });

            // Redirect to frontend with tokens
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(
                `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
            );
        } catch (error) {
            console.error('OAuth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
    }
);

export default router;
