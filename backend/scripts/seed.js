require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../src/models/User').default;
const {
    Domain,
    Subdomain,
    Category,
    TechStack,
    Language,
    Topic,
} = require('../src/models/Classification');
const Problem = require('../src/models/Problem').default;

// Seed data
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

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@studenthub.com',
            passwordHash: 'admin123', // Will be hashed by pre-save hook
            roles: ['user', 'admin'],
            bio: 'Platform administrator',
            oauthProviders: [],
        });

        // Create test user
        const testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            passwordHash: 'test123',
            roles: ['user'],
            bio: 'Test user for demo',
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

        const uiCssCategory = await Category.create({
            subdomainId: frontendSubdomain._id,
            name: 'UI & CSS',
            slug: 'ui-css',
        });

        const reactTechStack = await TechStack.create({
            categoryId: uiCssCategory._id,
            name: 'React',
            slug: 'react',
        });

        const jsLanguage = await Language.create({
            techStackId: reactTechStack._id,
            name: 'JavaScript',
            slug: 'javascript',
        });

        const stateTopic = await Topic.create({
            languageId: jsLanguage._id,
            name: 'State Management',
            slug: 'state-management',
        });

        // Backend subdomain
        const backendSubdomain = await Subdomain.create({
            domainId: webDevDomain._id,
            name: 'Backend',
            slug: 'backend',
        });

        const apiCategory = await Category.create({
            subdomainId: backendSubdomain._id,
            name: 'API Development',
            slug: 'api-development',
        });

        const nodeTechStack = await TechStack.create({
            categoryId: apiCategory._id,
            name: 'Node.js',
            slug: 'nodejs',
        });

        // Data Science Domain
        const dataScienceDomain = await Domain.create({
            name: 'Data Science',
            slug: 'data-science',
            description: 'Data analysis, machine learning, and AI',
        });

        // Update admin interests
        admin.interests = [webDevDomain._id, dataScienceDomain._id];
        await admin.save();

        testUser.interests = [webDevDomain._id];
        await testUser.save();

        // Create sample problems
        console.log('📝 Creating sample problems...');

        const problem1 = await Problem.create({
            title: 'State not updating in React due to direct mutation',
            descriptionMarkdown: `# Problem
      
A common mistake in React is mutating state objects directly instead of creating a new object. This prevents React from detecting the change and re-rendering.

## Example

\`\`\`javascript
// ❌ Wrong - Direct mutation
const [user, setUser] = useState({ name: 'John', age: 30 });

const updateAge = () => {
  user.age = 31; // Direct mutation!
  setUser(user); // React won't detect this change
};
\`\`\`

## Solution

\`\`\`javascript
// ✅ Correct - Create new object
const updateAge = () => {
  setUser({ ...user, age: 31 });
};
\`\`\`

## Why This Happens

React uses shallow comparison to detect state changes. When you mutate the object directly, the reference remains the same, so React doesn't trigger a re-render.`,
            createdBy: admin._id,
            severity: 'HIGH',
            difficulty: 'BEGINNER',
            canonical: true,
            solved: true,
            upvotes: 150,
            downvotes: 5,
            viewCount: 5000,
            tags: ['react', 'state', 'hooks', 'immutable', 'beginner'],
            resources: [
                {
                    type: 'link',
                    url: 'https://react.dev/learn/updating-objects-in-state',
                    title: 'React Docs: Updating Objects in State',
                },
            ],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
            techStackId: reactTechStack._id,
            languageId: jsLanguage._id,
            topicId: stateTopic._id,
        });

        const problem2 = await Problem.create({
            title: 'CORS errors when calling API from front-end',
            descriptionMarkdown: `# Problem

When making API calls from your frontend to a backend server, you encounter CORS (Cross-Origin Resource Sharing) errors in the browser console.

## Error Message

\`\`\`
Access to fetch at 'http://localhost:5000/api/data' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
\`\`\`

## Root Cause

Browsers enforce the same-origin policy for security. When your frontend (origin A) tries to make requests to a backend (origin B), the browser blocks it unless the backend explicitly allows it via CORS headers.

## Solutions

### 1. Backend Solution (Express)

\`\`\`javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
\`\`\`

### 2. Development Proxy (package.json)

\`\`\`json
{
  "proxy": "http://localhost:5000"
}
\`\`\`

Then use relative URLs in fetch:
\`\`\`javascript
fetch('/api/data') // Instead of full URL
\`\`\``,
            createdBy: testUser._id,
            severity: 'HIGH',
            difficulty: 'INTERMEDIATE',
            canonical: true,
            solved: true,
            upvotes: 200,
            downvotes: 3,
            viewCount: 8000,
            tags: ['cors', 'api', 'http', 'security', 'network'],
            resources: [
                {
                    type: 'link',
                    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
                    title: 'MDN: CORS',
                },
            ],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
        });

        const problem3 = await Problem.create({
            title: 'useEffect running infinitely causing app to crash',
            descriptionMarkdown: `# Problem

The \`useEffect\` hook is running infinitely in a loop, causing the browser to freeze or the app to crash.

## Common Cause

Missing or incorrect dependency array, especially when using objects or arrays as dependencies.

## Example

\`\`\`javascript
// ❌ Wrong - Creates infinite loop
useEffect(() => {
  const config = { theme: 'dark' };
  applyConfig(config);
}, [config]); // Config is recreated every render!
\`\`\`

## Solutions

### 1. Use useMemo for object dependencies
\`\`\`javascript
const config = useMemo(() => ({ theme: 'dark' }), []);

useEffect(() => {
  applyConfig(config);
}, [config]);
\`\`\`

### 2. Extract values instead of objects
\`\`\`javascript
const theme = 'dark';

useEffect(() => {
  applyConfig({ theme });
}, [theme]);
\`\`\``,
            createdBy: testUser._id,
            severity: 'CRITICAL',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: false,
            upvotes: 45,
            downvotes: 2,
            viewCount: 1200,
            tags: ['react', 'hooks', 'useeffect', 'infinite-loop', 'performance'],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
            techStackId: reactTechStack._id,
            languageId: jsLanguage._id,
        });

        const problem4 = await Problem.create({
            title: 'MongoDB connection timeout in production',
            descriptionMarkdown: `# Problem

MongoDB connection works fine locally but times out in production environment.

## Error
\`\`\`
MongooseServerSelectionError: connect ETIMEDOUT
\`\`\`

## Common Causes & Solutions

1. **IP Whitelist**: Add your deployment server's IP to MongoDB Atlas Network Access
2. **Connection String**: Ensure \`retryWrites=true&w=majority\` parameters are present
3. **Environment Variables**: Verify MONGODB_URI is correctly set in production
4. **Network Issues**: Check firewall rules and VPC settings`,
            createdBy: admin._id,
            severity: 'CRITICAL',
            difficulty: 'ADVANCED',
            canonical: false,
            solved: false,
            upvotes: 30,
            downvotes: 1,
            viewCount: 500,
            tags: ['mongodb', 'database', 'deployment', 'production', 'networking'],
            domainId: webDevDomain._id,
            subdomainId: backendSubdomain._id,
            categoryId: apiCategory._id,
            techStackId: nodeTechStack._id,
        });

        const problem5 = await Problem.create({
            title: 'JWT token expiration handling in React',
            descriptionMarkdown: `# Problem

How to properly handle JWT token expiration and refresh tokens in a React application?

## Best Practices

1. Store access token in memory (not localStorage for security)
2. Use refresh token stored in httpOnly cookie
3. Intercept 401 responses to trigger token refresh
4. Implement retry logic for failed requests

## Example with Axios

\`\`\`javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try refreshing token
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = \`Bearer \${newToken}\`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
\`\`\``,
            createdBy: testUser._id,
            severity: 'MEDIUM',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: true,
            upvotes: 75,
            downvotes: 4,
            viewCount: 2500,
            tags: ['jwt', 'authentication', 'security', 'react', 'axios'],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
        });

        console.log('✅ Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: 2 (admin@studenthub.com, test@example.com)`);
        console.log(`   Domains: 2`);
        console.log(`   Problems: 5 (2 canonical)`);
        console.log('\n🔑 Login credentials:');
        console.log(`   Admin: admin@studenthub.com / admin123`);
        console.log(`   User:  test@example.com / test123`);

        await mongoose.disconnect();
        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
