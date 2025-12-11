import { Router } from 'express';
import { Domain, Subdomain, Category, TechStack, Language, Topic } from '../models/Classification';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Get all domains
router.get('/domains', optionalAuth, async (req, res) => {
    try {
        const domains = await Domain.find().sort({ name: 1 });
        res.json(domains);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
});

// Get subdomains by domain
router.get('/domains/:domainId/subdomains', optionalAuth, async (req, res) => {
    try {
        const subdomains = await Subdomain.find({ domainId: req.params.domainId }).sort({ name: 1 });
        res.json(subdomains);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subdomains' });
    }
});

// Get categories by subdomain
router.get('/subdomains/:subdomainId/categories', optionalAuth, async (req, res) => {
    try {
        const categories = await Category.find({ subdomainId: req.params.subdomainId }).sort({
            name: 1,
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get tech stacks by category
router.get('/categories/:categoryId/techstacks', optionalAuth, async (req, res) => {
    try {
        const techStacks = await TechStack.find({ categoryId: req.params.categoryId }).sort({
            name: 1,
        });
        res.json(techStacks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tech stacks' });
    }
});

// Get languages by tech stack
router.get('/techstacks/:techStackId/languages', optionalAuth, async (req, res) => {
    try {
        const languages = await Language.find({ techStackId: req.params.techStackId }).sort({
            name: 1,
        });
        res.json(languages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch languages' });
    }
});

// Get topics by language
router.get('/languages/:languageId/topics', optionalAuth, async (req, res) => {
    try {
        const topics = await Topic.find({ languageId: req.params.languageId }).sort({ name: 1 });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Get full hierarchy
router.get('/hierarchy', optionalAuth, async (req, res) => {
    try {
        const domains = await Domain.find().sort({ name: 1 });
        const subdomains = await Subdomain.find().sort({ name: 1 });
        const categories = await Category.find().sort({ name: 1 });
        const techStacks = await TechStack.find().sort({ name: 1 });
        const languages = await Language.find().sort({ name: 1 });
        const topics = await Topic.find().sort({ name: 1 });

        res.json({
            domains,
            subdomains,
            categories,
            techStacks,
            languages,
            topics,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hierarchy' });
    }
});

export default router;
