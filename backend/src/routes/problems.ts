import { Router } from 'express';
import { body, query } from 'express-validator';
import Problem from '../models/Problem';
import Answer from '../models/Answer';
import Comment from '../models/Comment';
import Vote from '../models/Vote';
import Bookmark from '../models/Bookmark';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createContentLimiter, voteLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get problems with filters and pagination
router.get(
    '/',
    apiLimiter,
    optionalAuth,
    validate([
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const filter: any = {};

            // Filter by classification
            if (req.query.domainId) filter.domainId = req.query.domainId;
            if (req.query.subdomainId) filter.subdomainId = req.query.subdomainId;
            if (req.query.categoryId) filter.categoryId = req.query.categoryId;
            if (req.query.techStackId) filter.techStackId = req.query.techStackId;
            if (req.query.languageId) filter.languageId = req.query.languageId;
            if (req.query.topicId) filter.topicId = req.query.topicId;

            // Filter by severity/difficulty
            if (req.query.severity) filter.severity = req.query.severity;
            if (req.query.difficulty) filter.difficulty = req.query.difficulty;

            // Filter by canonical
            if (req.query.canonical === 'true') filter.canonical = true;

            // Filter by solved status
            if (req.query.solved === 'true') filter.solved = true;
            else if (req.query.solved === 'false') filter.solved = false;

            // Search by text
            if (req.query.search) {
                filter.$text = { $search: req.query.search as string };
            }

            // Sort
            let sort: any = { createdAt: -1 }; // Default: newest first

            if (req.query.sort === 'popular') sort = { upvotes: -1 };
            else if (req.query.sort === 'views') sort = { viewCount: -1 };
            else if (req.query.sort === 'oldest') sort = { createdAt: 1 };

            const [problems, total] = await Promise.all([
                Problem.find(filter)
                    .populate('createdBy', 'name avatarUrl')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Problem.countDocuments(filter),
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
        } catch (error: any) {
            console.error('Get problems error:', error);
            res.status(500).json({ error: 'Failed to fetch problems' });
        }
    }
);

// Get major problems (aggregated)
router.get('/major', apiLimiter, optionalAuth, async (req: AuthRequest, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;

        // Get canonical problems sorted by popularity and severity
        const problems = await Problem.find({ canonical: true })
            .populate('createdBy', 'name avatarUrl')
            .sort({ upvotes: -1, viewCount: -1 })
            .limit(limit)
            .lean();

        // Group by severity for UI organization
        const grouped = {
            critical: problems.filter((p) => p.severity === 'CRITICAL'),
            high: problems.filter((p) => p.severity === 'HIGH'),
            medium: problems.filter((p) => p.severity === 'MEDIUM'),
            low: problems.filter((p) => p.severity === 'LOW'),
        };

        res.json({ problems, grouped });
    } catch (error) {
        console.error('Get major problems error:', error);
        res.status(500).json({ error: 'Failed to fetch major problems' });
    }
});

// Get problems by classification
router.get('/class/:type/:id', apiLimiter, optionalAuth, async (req: AuthRequest, res) => {
    try {
        const { type, id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const filter: any = {};

        // Map classification type to field
        const typeMap: any = {
            domain: 'domainId',
            subdomain: 'subdomainId',
            category: 'categoryId',
            techstack: 'techStackId',
            language: 'languageId',
            topic: 'topicId',
        };

        const field = typeMap[type];
        if (!field) {
            return res.status(400).json({ error: 'Invalid classification type' });
        }

        filter[field] = id;

        // Apply additional filters
        if (req.query.severity) filter.severity = req.query.severity;
        if (req.query.difficulty) filter.difficulty = req.query.difficulty;
        if (req.query.canonical === 'true') filter.canonical = true;

        let sort: any = { canonical: -1, upvotes: -1 }; // Canonical first, then by votes

        const [problems, total] = await Promise.all([
            Problem.find(filter)
                .populate('createdBy', 'name avatarUrl')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Problem.countDocuments(filter),
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
        console.error('Get classification problems error:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Get single problem by ID
router.get('/:id', apiLimiter, optionalAuth, async (req: AuthRequest, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
            .populate('createdBy', 'name avatarUrl bio roles')
            .lean();

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }


        // Get answers
        const answers = await Answer.find({ problemId: problem._id })
            .populate('authorId', 'name avatarUrl roles')
            .sort({ accepted: -1, upvotes: -1 })
            .lean();

        // Get ALL comments (for problem and all answers)
        const answerIds = answers.map(a => a._id);
        const comments = await Comment.find({
            $or: [
                { parentId: problem._id, parentType: 'Problem' },
                { parentId: { $in: answerIds }, parentType: 'Answer' }
            ]
        })
            .populate('authorId', 'name avatarUrl')
            .sort({ createdAt: 1 })
            .lean();

        // Get user's vote if authenticated
        let userVote = null;
        let userBookmark = null;

        if (req.user) {
            userVote = await Vote.findOne({
                userId: req.user._id,
                targetType: 'Problem',
                targetId: problem._id,
            }).lean();

            userBookmark = await Bookmark.findOne({
                userId: req.user._id,
                targetType: 'Problem',
                targetId: problem._id,
            }).lean();
        }

        res.json({
            problem,
            answers,
            comments,
            userVote: userVote?.value || null,
            bookmarked: !!userBookmark,
        });
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// Create problem
router.post(
    '/',
    createContentLimiter,
    authenticate,
    validate([
        body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
        body('descriptionMarkdown').notEmpty().withMessage('Description is required'),
        body('severity').isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid severity'),
        body('difficulty')
            .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
            .withMessage('Invalid difficulty'),
        body('tags').optional().isArray().withMessage('Tags must be an array'),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const problem = await Problem.create({
                ...req.body,
                createdBy: req.user!._id,
                canonical: false, // Only admins can mark as canonical
                solved: false,
                upvotes: 0,
                downvotes: 0,
                viewCount: 0,
            });

            const populatedProblem = await Problem.findById(problem._id)
                .populate('createdBy', 'name avatarUrl')
                .lean();

            res.status(201).json(populatedProblem);
        } catch (error) {
            console.error('Create problem error:', error);
            res.status(500).json({ error: 'Failed to create problem' });
        }
    }
);

// Update problem
router.patch(
    '/:id',
    authenticate,
    validate([
        body('title').optional().trim().isLength({ max: 200 }),
        body('descriptionMarkdown').optional().notEmpty(),
        body('severity').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
        body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        body('tags').optional().isArray(),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const problem = await Problem.findById(req.params.id);

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            // Only creator or admin can update
            const isCreator = problem.createdBy.toString() === req.user!._id.toString();
            const isAdmin = req.user!.roles.includes('admin');

            if (!isCreator && !isAdmin) {
                return res.status(403).json({ error: 'Not authorized to update this problem' });
            }

            // Prevent non-admins from changing canonical status
            if (req.body.canonical !== undefined && !isAdmin) {
                delete req.body.canonical;
            }

            Object.assign(problem, req.body);
            await problem.save();

            const updatedProblem = await Problem.findById(problem._id)
                .populate('createdBy', 'name avatarUrl')
                .lean();

            res.json(updatedProblem);
        } catch (error) {
            console.error('Update problem error:', error);
            res.status(500).json({ error: 'Failed to update problem' });
        }
    }
);

// Delete problem
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Only creator or admin can delete
        const isCreator = problem.createdBy.toString() === req.user!._id.toString();
        const isAdmin = req.user!.roles.includes('admin');

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this problem' });
        }

        // Delete all associated data
        await Promise.all([
            // Delete all answers to this problem
            Answer.deleteMany({ problemId: req.params.id }),
            // Delete all comments on this problem
            Comment.deleteMany({ parentId: req.params.id, parentType: 'Problem' }),
            // Delete all votes on this problem
            Vote.deleteMany({ targetId: req.params.id, targetType: 'Problem' }),
            // Delete all bookmarks of this problem
            Bookmark.deleteMany({ targetId: req.params.id, targetType: 'Problem' }),
        ]);

        // Delete the problem itself
        await Problem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Problem and associated data deleted successfully' });
    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({ error: 'Failed to delete problem' });
    }
});

// Mark problem as solved
router.post('/:id/solve', authenticate, async (req: AuthRequest, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Only creator can mark as solved
        if (problem.createdBy.toString() !== req.user!._id.toString()) {
            return res.status(403).json({ error: 'Only the creator can mark problem as solved' });
        }

        problem.solved = true;
        await problem.save();

        res.json({ message: 'Problem marked as solved', problem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark problem as solved' });
    }
});

// Add answer to problem
router.post(
    '/:id/answers',
    createContentLimiter,
    authenticate,
    validate([body('contentMarkdown').notEmpty().withMessage('Answer content is required')]),
    async (req: AuthRequest, res) => {
        try {
            const problem = await Problem.findById(req.params.id);

            if (!problem) {
                return res.status(404).json({ error: 'Problem not found' });
            }

            const answer = await Answer.create({
                problemId: req.params.id,
                authorId: req.user!._id,
                contentMarkdown: req.body.contentMarkdown,
                upvotes: 0,
                accepted: false,
            });

            const populatedAnswer = await Answer.findById(answer._id)
                .populate('authorId', 'name avatarUrl roles')
                .lean();

            res.status(201).json(populatedAnswer);
        } catch (error) {
            console.error('Create answer error:', error);
            res.status(500).json({ error: 'Failed to create answer' });
        }
    }
);

// Accept an answer (problem creator only)
router.post('/:problemId/answers/:answerId/accept', authenticate, async (req: AuthRequest, res) => {
    try {
        const problem = await Problem.findById(req.params.problemId);

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Only creator can accept answers
        if (problem.createdBy.toString() !== req.user!._id.toString()) {
            return res.status(403).json({ error: 'Only the problem creator can accept answers' });
        }

        // Unaccept all other answers
        await Answer.updateMany({ problemId: req.params.problemId }, { accepted: false });

        // Accept this answer
        const answer = await Answer.findByIdAndUpdate(
            req.params.answerId,
            { accepted: true },
            { new: true }
        )
            .populate('authorId', 'name avatarUrl')
            .lean();

        if (!answer) {
            return res.status(404).json({ error: 'Answer not found' });
        }

        res.json(answer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept answer' });
    }
});

// Vote on problem/answer/comment
router.post(
    '/vote',
    voteLimiter,
    authenticate,
    validate([
        body('targetType').isIn(['Problem', 'Answer', 'Comment']).withMessage('Invalid target type'),
        body('targetId').notEmpty().withMessage('Target ID is required'),
        body('value').isIn([1, -1]).withMessage('Vote value must be 1 or -1'),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const { targetType, targetId, value } = req.body;

            // Check if user already voted
            const existingVote = await Vote.findOne({
                userId: req.user!._id,
                targetType,
                targetId,
            });

            if (existingVote) {
                if (existingVote.value === value) {
                    // Remove vote if same value
                    await Vote.deleteOne({ _id: existingVote._id });

                    // Update vote count
                    const model = targetType === 'Problem' ? Problem : targetType === 'Answer' ? Answer : null;
                    if (model) {
                        const field = value === 1 ? 'upvotes' : 'downvotes';
                        await model.findByIdAndUpdate(targetId, { $inc: { [field]: -1 } });
                    }

                    return res.json({ message: 'Vote removed', voted: false });
                } else {
                    // Change vote
                    existingVote.value = value;
                    await existingVote.save();

                    // Update vote counts
                    const model = targetType === 'Problem' ? Problem : targetType === 'Answer' ? Answer : null;
                    if (model) {
                        const incrementField = value === 1 ? 'upvotes' : 'downvotes';
                        const decrementField = value === 1 ? 'downvotes' : 'upvotes';
                        await model.findByIdAndUpdate(targetId, {
                            $inc: { [incrementField]: 1, [decrementField]: -1 },
                        });
                    }

                    return res.json({ message: 'Vote changed', voted: true, value });
                }
            }

            // Create new vote
            await Vote.create({
                userId: req.user!._id,
                targetType,
                targetId,
                value,
            });

            // Update vote count
            const model = targetType === 'Problem' ? Problem : targetType === 'Answer' ? Answer : null;
            if (model) {
                const field = value === 1 ? 'upvotes' : 'downvotes';
                await model.findByIdAndUpdate(targetId, { $inc: { [field]: 1 } });
            }

            res.json({ message: 'Vote recorded', voted: true, value });
        } catch (error) {
            console.error('Vote error:', error);
            res.status(500).json({ error: 'Failed to record vote' });
        }
    }
);

// Bookmark problem/answer
router.post(
    '/bookmark',
    authenticate,
    validate([
        body('targetType').isIn(['Problem', 'Answer']).withMessage('Invalid target type'),
        body('targetId').notEmpty().withMessage('Target ID is required'),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const { targetType, targetId } = req.body;

            const existingBookmark = await Bookmark.findOne({
                userId: req.user!._id,
                targetType,
                targetId,
            });

            if (existingBookmark) {
                // Remove bookmark
                await Bookmark.deleteOne({ _id: existingBookmark._id });
                return res.json({ message: 'Bookmark removed', bookmarked: false });
            }

            // Create bookmark
            await Bookmark.create({
                userId: req.user!._id,
                targetType,
                targetId,
            });

            res.json({ message: 'Bookmarked', bookmarked: true });
        } catch (error) {
            console.error('Bookmark error:', error);
            res.status(500).json({ error: 'Failed to bookmark' });
        }
    }
);

// Add comment
router.post(
    '/comment',
    createContentLimiter,
    authenticate,
    validate([
        body('parentType').isIn(['Problem', 'Answer']).withMessage('Invalid parent type'),
        body('parentId').notEmpty().withMessage('Parent ID is required'),
        body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 1000 }),
    ]),
    async (req: AuthRequest, res) => {
        try {
            const comment = await Comment.create({
                ...req.body,
                authorId: req.user!._id,
            });

            const populatedComment = await Comment.findById(comment._id)
                .populate('authorId', 'name avatarUrl')
                .lean();

            res.status(201).json(populatedComment);
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json({ error: 'Failed to create comment' });
        }
    }
);

export default router;
