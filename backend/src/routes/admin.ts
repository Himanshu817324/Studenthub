import { Router } from 'express';
import { body } from 'express-validator';
import Problem from '../models/Problem';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin', 'moderator'));

// Mark problem as canonical
router.patch(
    '/problems/:id/canonical',
    validate([body('canonical').isBoolean().withMessage('Canonical must be a boolean')]),
    async (req: AuthRequest, res) => {
        try {
            const problem = await Problem.findByIdAndUpdate(
                req.params.id,
                { canonical: req.body.canonical },
                { new: true }
            )
                .populate('createdBy', 'name avatarUrl')
                .lean();

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            res.json({
                message: `Problem ${req.body.canonical ? 'marked' : 'unmarked'} as canonical`,
                problem,
            });
        } catch (error) {
            console.error('Mark canonical error:', error);
            res.status(500).json({ error: 'Failed to update problem' });
        }
    }
);

// Get moderation queue (flagged content)
router.get('/moderation', async (req: AuthRequest, res) => {
    try {
        // For now, return problems that need review (high severity, not canonical)
        const problems = await Problem.find({
            severity: { $in: ['CRITICAL', 'HIGH'] },
            canonical: false,
            upvotes: { $gte: 10 }, // Threshold for review
        })
            .populate('createdBy', 'name avatarUrl email')
            .sort({ upvotes: -1 })
            .limit(50)
            .lean();

        res.json({ problems });
    } catch (error) {
        console.error('Moderation queue error:', error);
        res.status(500).json({ error: 'Failed to fetch moderation queue' });
    }
});

// Delete problem (admin only)
router.delete('/problems/:id', authorize('admin'), async (req: AuthRequest, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({ error: 'Failed to delete problem' });
    }
});

// Get analytics
router.get('/analytics', async (req: AuthRequest, res) => {
    try {
        const [totalProblems, solvedProblems, canonicalProblems, severityStats] = await Promise.all([
            Problem.countDocuments(),
            Problem.countDocuments({ solved: true }),
            Problem.countDocuments({ canonical: true }),
            Problem.aggregate([
                {
                    $group: {
                        _id: '$severity',
                        count: { $sum: 1 },
                        avgUpvotes: { $avg: '$upvotes' },
                        avgViews: { $avg: '$viewCount' },
                    },
                },
            ]),
        ]);

        const difficultyStats = await Problem.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 },
                    avgUpvotes: { $avg: '$upvotes' },
                },
            },
        ]);

        res.json({
            totalProblems,
            solvedProblems,
            canonicalProblems,
            solveRate: totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0,
            severityStats,
            difficultyStats,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
