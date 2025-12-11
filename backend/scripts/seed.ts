import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User';
import {
    Domain,
    Subdomain,
    Category,
    TechStack,
    Language,
    Topic,
} from '../src/models/Classification';
import Problem from '../src/models/Problem';

const seedData = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI not defined');
        }

        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Domain.deleteMany({}),
            Subdomain.deleteMany({}),
            Category.deleteMany({}),
            TechStack.deleteMany({}),
            Language.deleteMany({}),
            Topic.deleteMany({}),
            Problem.deleteMany({}),
        ]);

        // Create users
        console.log('👤 Creating users...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@studenthub.com',
            passwordHash: 'admin123',
            roles: ['user', 'admin'],
            bio: 'Platform administrator',
            oauthProviders: [],
        });

        const alice = await User.create({
            name: 'Alice Johnson',
            email: 'alice@example.com',
            passwordHash: 'test123',
            roles: ['user'],
            bio: 'Full-stack developer passionate about React and Node.js',
            oauthProviders: [],
        });

        const bob = await User.create({
            name: 'Bob Smith',
            email: 'bob@example.com',
            passwordHash: 'test123',
            roles: ['user'],
            bio: 'Python enthusiast and data science learner',
            oauthProviders: [],
        });

        // Create classification hierarchy
        console.log('🌳 Creating classification hierarchy...');

        // Web Development Domain
        const webDevDomain = await Domain.create({
            name: 'Web Development',
            slug: 'web-development',
            description: 'Everything related to web development',
        });

        const frontendSubdomain = await Subdomain.create({
            domainId: webDevDomain._id,
            name: 'Frontend',
            slug: 'frontend',
        });

        const backendSubdomain = await Subdomain.create({
            domainId: webDevDomain._id,
            name: 'Backend',
            slug: 'backend',
        });

        const uiCssCategory = await Category.create({
            subdomainId: frontendSubdomain._id,
            name: 'UI & CSS',
            slug: 'ui-css',
        });

        const apiCategory = await Category.create({
            subdomainId: backendSubdomain._id,
            name: 'API Development',
            slug: 'api-development',
        });

        const reactTechStack = await TechStack.create({
            categoryId: uiCssCategory._id,
            name: 'React',
            slug: 'react',
        });

        const vueStack = await TechStack.create({
            categoryId: uiCssCategory._id,
            name: 'Vue.js',
            slug: 'vuejs',
        });

        const nodeTechStack = await TechStack.create({
            categoryId: apiCategory._id,
            name: 'Node.js',
            slug: 'nodejs',
        });

        const jsLanguage = await Language.create({
            techStackId: reactTechStack._id,
            name: 'JavaScript',
            slug: 'javascript',
        });

        const tsLanguage = await Language.create({
            techStackId: reactTechStack._id,
            name: 'TypeScript',
            slug: 'typescript',
        });

        // Data Science Domain
        const dataScienceDomain = await Domain.create({
            name: 'Data Science',
            slug: 'data-science',
            description: 'Data analysis, machine learning, and AI',
        });

        const mlSubdomain = await Subdomain.create({
            domainId: dataScienceDomain._id,
            name: 'Machine Learning',
            slug: 'machine-learning',
        });

        const dataAnalysisCategory = await Category.create({
            subdomainId: mlSubdomain._id,
            name: 'Data Analysis',
            slug: 'data-analysis',
        });

        const pythonStack = await TechStack.create({
            categoryId: dataAnalysisCategory._id,
            name: 'Python',
            slug: 'python',
        });

        // Mobile Development Domain
        const mobileDomain = await Domain.create({
            name: 'Mobile Development',
            slug: 'mobile-development',
            description: 'iOS and Android app development',
        });

        const crossPlatformSubdomain = await Subdomain.create({
            domainId: mobileDomain._id,
            name: 'Cross-Platform',
            slug: 'cross-platform',
        });

        const mobileFrameworkCategory = await Category.create({
            subdomainId: crossPlatformSubdomain._id,
            name: 'Mobile Frameworks',
            slug: 'mobile-frameworks',
        });

        const reactNativeStack = await TechStack.create({
            categoryId: mobileFrameworkCategory._id,
            name: 'React Native',
            slug: 'react-native',
        });

        // Create sample problems
        console.log('📝 Creating 10 diverse problems...');

        const problems = [
            {
                title: 'State not updating in React due to direct mutation',
                descriptionMarkdown: `# Problem
A common mistake in React is mutating state objects directly instead of creating a new object.

## Example
\`\`\`javascript
// ❌ Wrong - Direct mutation
const [user, setUser] = useState({ name: 'John', age: 30 });
user.age = 31;
setUser(user); // React won't detect this
\`\`\`

## Solution
\`\`\`javascript
// ✅ Correct
setUser({ ...user, age: 31 });
\`\`\``,
                createdBy: admin._id,
                severity: 'HIGH' as const,
                difficulty: 'BEGINNER' as const,
                canonical: true,
                solved: true,
                upvotes: 150,
                tags: ['react', 'state', 'hooks', 'immutable'],
                domainId: webDevDomain._id,
                subdomainId: frontendSubdomain._id,
                categoryId: uiCssCategory._id,
                techStackId: reactTechStack._id,
            },
            {
                title: 'CORS errors when calling API from frontend',
                descriptionMarkdown: `# Problem
Getting CORS errors when making API calls from frontend to backend.

## Solution
\`\`\`javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
\`\`\``,
                createdBy: alice._id,
                severity: 'HIGH' as const,
                difficulty: 'INTERMEDIATE' as const,
                canonical: true,
                solved: true,
                upvotes: 200,
                tags: ['cors', 'api', 'http', 'security'],
                domainId: webDevDomain._id,
            },
            {
                title: 'Vue 3 Composition API vs Options API',
                descriptionMarkdown: `# Question
When should I use Composition API vs Options API in Vue 3?

## Composition API
Better for complex logic and reusability.

## Options API
Better for simple components and Vue 2 migration.`,
                createdBy: bob._id,
                severity: 'MEDIUM' as const,
                difficulty: 'INTERMEDIATE' as const,
                solved: false,
                upvotes: 45,
                tags: ['vue', 'composition-api', 'best-practices'],
                domainId: webDevDomain._id,
                techStackId: vueStack._id,
            },
            {
                title: 'MongoDB connection timeout in production',
                descriptionMarkdown: `# Problem
MongoDB connects locally but times out in production.

## Solutions
1. Add server IP to MongoDB Atlas whitelist
2. Check connection string parameters
3. Verify environment variables`,
                createdBy: admin._id,
                severity: 'CRITICAL' as const,
                difficulty: 'ADVANCED' as const,
                solved: false,
                upvotes: 30,
                tags: ['mongodb', 'database', 'production'],
                domainId: webDevDomain._id,
                techStackId: nodeTechStack._id,
            },
            {
                title: 'TypeScript Generic Constraints',
                descriptionMarkdown: `# Problem
How to properly constrain TypeScript generics?

## Solution
\`\`\`typescript
function filter<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[] {
  return items.filter(item => item[key] === value);
}
\`\`\``,
                createdBy: alice._id,
                severity: 'MEDIUM' as const,
                difficulty: 'ADVANCED' as const,
                canonical: true,
                solved: true,
                upvotes: 88,
                tags: ['typescript', 'generics', 'type-safety'],
                domainId: webDevDomain._id,
                languageId: tsLanguage._id,
            },
            {
                title: 'Python Pandas GroupBy for Data Aggregation',
                descriptionMarkdown: `# Question
How to use pandas groupby() for multiple aggregations?

## Solution
\`\`\`python
result = df.groupby('region').agg({
    'sales': 'sum',
    'price': 'mean'
})
\`\`\``,
                createdBy: bob._id,
                severity: 'MEDIUM' as const,
                difficulty: 'INTERMEDIATE' as const,
                solved: true,
                upvotes: 65,
                tags: ['python', 'pandas', 'data-analysis'],
                domainId: dataScienceDomain._id,
                techStackId: pythonStack._id,
            },
            {
                title: 'React Native FlatList performance issues',
                descriptionMarkdown: `# Problem
FlatList becomes slow with large datasets.

## Solutions
1. Use \`getItemLayout\` for fixed-size items
2. Implement pagination
3. Use React.memo for list items`,
                createdBy: alice._id,
                severity: 'HIGH' as const,
                difficulty: 'INTERMEDIATE' as const,
                solved: false,
                upvotes: 42,
                tags: ['react-native', 'performance', 'flatlist'],
                domainId: mobileDomain._id,
                techStackId: reactNativeStack._id,
            },
            {
                title: 'Express middleware execution order',
                descriptionMarkdown: `# Problem
Authentication middleware not working - routes are registered before auth middleware!

## Correct Order
\`\`\`javascript
app.use(express.json());
app.use(authMiddleware); // BEFORE routes
app.use('/api/posts', postRoutes);
\`\`\``,
                createdBy: admin._id,
                severity: 'CRITICAL' as const,
                difficulty: 'BEGINNER' as const,
                canonical: true,
                solved: true,
                upvotes: 110,
                tags: ['express', 'middleware', 'authentication'],
                domainId: webDevDomain._id,
                techStackId: nodeTechStack._id,
            },
            {
                title: 'Scikit-learn train_test_split shuffling',
                descriptionMarkdown: `# Problem
Data not shuffled correctly in train_test_split.

## Solution
\`\`\`python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2,
    shuffle=True,
    random_state=42
)
\`\`\``,
                createdBy: bob._id,
                severity: 'HIGH' as const,
                difficulty: 'INTERMEDIATE' as const,
                solved: true,
                upvotes: 38,
                tags: ['python', 'scikit-learn', 'machine-learning'],
                domainId: dataScienceDomain._id,
                techStackId: pythonStack._id,
            },
            {
                title: 'Async/await error handling in Express',
                descriptionMarkdown: `# Problem
Unhandled promise rejections crash the server.

## Solution
\`\`\`javascript
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
\`\`\``,
                createdBy: admin._id,
                severity: 'CRITICAL' as const,
                difficulty: 'INTERMEDIATE' as const,
                canonical: true,
                solved: true,
                upvotes: 95,
                tags: ['nodejs', 'express', 'async-await', 'error-handling'],
                domainId: webDevDomain._id,
                techStackId: nodeTechStack._id,
            },
        ];

        await Problem.insertMany(problems);

        console.log('✅ Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: 3`);
        console.log(`   Domains: 3 (Web Dev, Data Science, Mobile)`);
        console.log(`   Problems: 10 (across multiple tech stacks)`);
        console.log(`   Tech Stacks: React, Vue.js, Node.js, Python, React Native`);
        console.log('\n🔑 Login credentials:');
        console.log(`   Admin: admin@studenthub.com / admin123`);
        console.log(`   User:  alice@example.com / test123`);
        console.log(`   User:  bob@example.com / test123`);

        await mongoose.disconnect();
        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
