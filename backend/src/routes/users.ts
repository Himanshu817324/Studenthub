import { Router } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import Problem from '../models/Problem';
import Answer from '../models/Answer';
import Bookmark from '../models/Bookmark';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get user profile by ID
router.get('/:userId', apiLimiter, optionalAuth, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-passwordHash -oauthProviders')
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get statistics
        const [problems, answers, totalUpvotes] = await Promise.all([
            Problem.countDocuments({ createdBy: user._id }),
            Answer.countDocuments({ authorId: user._id }),
            // Calculate total upvotes received on problems and answers
            Problem.aggregate([
                { $match: { createdBy: user._id } },
                { $group: { _id: null, total: { $sum: '$upvotes' } } },
            ]).then((result) => result[0]?.total || 0),
        ]);

        // Get accepted answers count
        const acceptedAnswers = await Answer.countDocuments({
            authorId: user._id,
            accepted: true,
        });

        // Get upvotes from answers too
        const answerUpvotes = await Answer.aggregate([
            { $match: { authorId: user._id } },
            { $group: { _id: null, total: { $sum: '$upvotes' } } },
        ]).then((result) => result[0]?.total || 0);

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                roles: user.roles,
                createdAt: user.createdAt,
            },
            stats: {
                problemsPosted: problems,
                answersGiven: answers,
                upvotesReceived: totalUpvotes + answerUpvotes,
                acceptedAnswers,
            },
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.patch(
    '/:userId',
    authenticate,
    validate([
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
        body('avatarUrl').optional().isURL().withMessage('Avatar must be a valid URL'),
    ]),
    async (req: AuthRequest, res) => {
        try {
            // Only allow users to update their own profile
            if (req.user!._id.toString() !== req.params.userId) {
                return res.status(403).json({ error: 'You can only update your own profile' });
            }

            const allowedUpdates = ['name', 'bio', 'avatarUrl'];
            const updates: any = {};

            for (const key of allowedUpdates) {
                if (req.body[key] !== undefined) {
                    updates[key] = req.body[key];
                }
            }

            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-passwordHash -oauthProviders');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio,
                    roles: user.roles,
                },
            });
        } catch (error) {
            console.error('Update user profile error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
);

// Get user's problems
router.get('/:userId/problems', apiLimiter, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [problems, total] = await Promise.all([
            Problem.find({ createdBy: req.params.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name avatarUrl')
                .lean(),
            Problem.countDocuments({ createdBy: req.params.userId }),
        ]);

        res.json({
            problems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get user problems error:', error);
        res.status(500).json({ error: 'Failed to fetch user problems' });
    }
});

// Get user's answers
router.get('/:userId/answers', apiLimiter, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [answers, total] = await Promise.all([
            Answer.find({ authorId: req.params.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('authorId', 'name avatarUrl')
                .populate('problemId', 'title')
                .lean(),
            Answer.countDocuments({ authorId: req.params.userId }),
        ]);

        res.json({
            answers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get user answers error:', error);
        res.status(500).json({ error: 'Failed to fetch user answers' });
    }
});

// Get user's bookmarks
router.get('/:userId/bookmarks', authenticate, async (req: AuthRequest, res) => {
    try {
        // Only allow users to view their own bookmarks
        if (req.user!._id.toString() !== req.params.userId) {
            return res.status(403).json({ error: 'You can only view your own bookmarks' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [bookmarks, total] = await Promise.all([
            Bookmark.find({ userId: req.params.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'targetId',
                    select: 'title descriptionMarkdown createdBy severity difficulty upvotes',
                })
                .lean(),
            Bookmark.countDocuments({ userId: req.params.userId }),
        ]);

        res.json({
            bookmarks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get user bookmarks error:', error);
        res.status(500).json({ error: 'Failed to fetch user bookmarks' });
    }
});

export default router;
