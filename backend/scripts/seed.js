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

        const testUser = await User.create({
            name: 'Alice Johnson',
            email: 'alice@example.com',
            passwordHash: 'test123',
            roles: ['user'],
            bio: 'Full-stack developer passionate about React and Node.js',
            oauthProviders: [],
        });

        const user3 = await User.create({
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
        console.log('📝 Creating sample problems...');

        await Problem.create({
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
        });

        await Problem.create({
            title: 'CORS errors when calling API from frontend',
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
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
        });

        await Problem.create({
            title: 'Vue 3 Composition API vs Options API: When to use which?',
            descriptionMarkdown: `# Question

I'm new to Vue 3 and confused about when to use the Composition API versus the traditional Options API. What are the best practices?

## Composition API

\`\`\`javascript
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubled = computed(() => count.value * 2);
    
    return { count, doubled };
  }
}
\`\`\`

## Options API

\`\`\`javascript
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() {
      return this.count * 2;
    }
  }
}
\`\`\`

## When to Use Each?

**Use Composition API when:**
- Building complex components with lots of logic
- Need to reuse logic across components
- Using TypeScript (better type inference)

**Use Options API when:**
- Building simple components
- Team is more familiar with it
- Migrating from Vue 2`,
            createdBy: user3._id,
            severity: 'MEDIUM',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: false,
            upvotes: 45,
            downvotes: 2,
            viewCount: 1200,
            tags: ['vue', 'composition-api', 'options-api', 'best-practices'],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
            techStackId: vueStack._id,
        });

        await Problem.create({
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
4. **Network Issues**: Check firewall rules and VPC settings

## Example Connection String

\`\`\`
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
\`\`\``,
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

        await Problem.create({
            title: 'TypeScript Generic Constraints - How to properly type this function?',
            descriptionMarkdown: `# Problem

I'm trying to create a generic function that filters an array of objects, but TypeScript is complaining about the property access.

## Code

\`\`\`typescript
function filterByProperty<T>(items: T[], key: string, value: any): T[] {
  return items.filter(item => item[key] === value);
  // Error: Element implicitly has an 'any' type
}
\`\`\`

## Solution

Use generic constraints with \`keyof\`:

\`\`\`typescript
function filterByProperty<T, K extends keyof T>(
  items: T[], 
  key: K, 
  value: T[K]
): T[] {
  return items.filter(item => item[key] === value);
}

// Usage with full type safety
const users = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }];
const filtered = filterByProperty(users, 'name', 'Alice'); // ✅ Works!
\`\`\``,
            createdBy: testUser._id,
            severity: 'MEDIUM',
            difficulty: 'ADVANCED',
            canonical: true,
            solved: true,
            upvotes: 88,
            downvotes: 3,
            viewCount: 2100,
            tags: ['typescript', 'generics', 'type-safety', 'advanced'],
            domainId: webDevDomain._id,
            subdomainId: frontendSubdomain._id,
            categoryId: uiCssCategory._id,
            techStackId: reactTechStack._id,
            languageId: tsLanguage._id,
        });

        await Problem.create({
            title: 'Understanding Python Pandas GroupBy for Data Aggregation',
            descriptionMarkdown: `# Question

How do I use pandas \`groupby()\` to calculate multiple aggregations on different columns?

## Problem

I have a DataFrame with sales data and want to group by region, then calculate:
- Total sales (sum)
- Average price (mean)
- Number of transactions (count)

## Solution

\`\`\`python
import pandas as pd

# Sample data
df = pd.DataFrame({
    'region': ['North', 'South', 'North', 'South'],
    'sales': [100, 200, 150, 250],
    'price': [10, 20, 15, 25]
})

# Multiple aggregations
result = df.groupby('region').agg({
    'sales': 'sum',
    'price': 'mean',
    'region': 'count'
}).rename(columns={'region': 'count'})

print(result)
\`\`\`

## Output

\`\`\`
        sales  price  count
region                     
North     250   12.5      2
South     450   22.5      2
\`\`\``,
            createdBy: user3._id,
            severity: 'MEDIUM',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: true,
            upvotes: 65,
            downvotes: 1,
            viewCount: 1800,
            tags: ['python', 'pandas', 'data-analysis', 'groupby', 'aggregation'],
            domainId: dataScienceDomain._id,
            subdomainId: mlSubdomain._id,
            categoryId: dataAnalysisCategory._id,
            techStackId: pythonStack._id,
        });

        await Problem.create({
            title: 'React Native FlatList performance issues with large datasets',
            descriptionMarkdown: `# Problem

My React Native app becomes slow and laggy when rendering a FlatList with 1000+ items.

## Symptoms

- Scrolling is choppy
- App freezes when loading data
- High memory usage

## Solutions

### 1. Use getItemLayout for fixed-size items

\`\`\`javascript
<FlatList
  data={items}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
\`\`\`

### 2. Implement pagination

\`\`\`javascript
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 20;

<FlatList
  data={items.slice(0, page * ITEMS_PER_PAGE)}
  onEndReached={() => setPage(p => p + 1)}
  onEndReachedThreshold={0.5}
/>
\`\`\`

### 3. Use React.memo for list items

\`\`\`javascript
const ListItem = React.memo(({ item }) => (
  <View>
    <Text>{item.title}</Text>
  </View>
));
\`\`\``,
            createdBy: testUser._id,
            severity: 'HIGH',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: false,
            upvotes: 42,
            downvotes: 0,
            viewCount: 980,
            tags: ['react-native', 'performance', 'flatlist', 'optimization'],
            domainId: mobileDomain._id,
            subdomainId: crossPlatformSubdomain._id,
            categoryId: mobileFrameworkCategory._id,
            techStackId: reactNativeStack._id,
        });

        await Problem.create({
            title: 'Express middleware execution order causing authentication issues',
            descriptionMarkdown: `# Problem

My authentication middleware isn't working correctly. Some routes are accessible without authentication.

## Wrong Order

\`\`\`javascript
app.use('/api/posts', postRoutes); // ❌ Routes registered first
app.use(authMiddleware); // Auth middleware added after routes!
\`\`\`

The middleware only applies to routes registered AFTER it.

## Correct Order

\`\`\`javascript
// 1. Global middleware first
app.use(express.json());
app.use(cors());

// 2. Authentication middleware
app.use(authMiddleware);

// 3. Routes last
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
\`\`\`

## Per-Route Authentication

\`\`\`javascript
router.get('/public', publicHandler);
router.get('/protected', authMiddleware, protectedHandler);
\`\`\``,
            createdBy: admin._id,
            severity: 'CRITICAL',
            difficulty: 'BEGINNER',
            canonical: true,
            solved: true,
            upvotes: 110,
            downvotes: 2,
            viewCount: 3200,
            tags: ['express', 'middleware', 'authentication', 'security', 'nodejs'],
            domainId: webDevDomain._id,
            subdomainId: backendSubdomain._id,
            categoryId: apiCategory._id,
            techStackId: nodeTechStack._id,
        });

        await Problem.create({
            title: 'Scikit-learn train_test_split not shuffling data correctly',
            descriptionMarkdown: `# Problem

When splitting my dataset, the training and test sets aren't properly randomized, causing poor model performance.

## Issue

\`\`\`python
from sklearn.model_selection import train_test_split

# ❌ Not shuffled by default in older versions
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
\`\`\`

## Solution

\`\`\`python
# ✅ Explicitly enable shuffling and set random_state
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    shuffle=True,
    random_state=42  # For reproducibility
)
\`\`\`

## Best Practices

1. **Always set \`random_state\`** for reproducible results
2. **Use \`stratify\`** for imbalanced datasets

\`\`\`python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2,
    stratify=y,  # Maintains class distribution
    random_state=42
)
\`\`\``,
            createdBy: user3._id,
            severity: 'HIGH',
            difficulty: 'INTERMEDIATE',
            canonical: false,
            solved: true,
            upvotes: 38,
            downvotes: 1,
            viewCount: 750,
            tags: ['python', 'scikit-learn', 'machine-learning', 'data-split'],
            domainId: dataScienceDomain._id,
            subdomainId: mlSubdomain._id,
            categoryId: dataAnalysisCategory._id,
            techStackId: pythonStack._id,
        });

        await Problem.create({
            title: 'Async/await error handling in Node.js Express routes',
            descriptionMarkdown: `# Problem

Unhandled promise rejections in async Express routes crash my server.

## The Issue

\`\`\`javascript
app.get('/users', async (req, res) => {
  const users = await User.find(); // If this fails, server crashes!
  res.json(users);
});
\`\`\`

## Solutions

### 1. Try-Catch in every route

\`\`\`javascript
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
\`\`\`

### 2. Async wrapper middleware (Better!)

\`\`\`javascript
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
\`\`\``,
            createdBy: admin._id,
            severity: 'CRITICAL',
            difficulty: 'INTERMEDIATE',
            canonical: true,
            solved: true,
            upvotes: 95,
            downvotes: 2,
            viewCount: 2800,
            tags: ['nodejs', 'express', 'async-await', 'error-handling', 'promises'],
            domainId: webDevDomain._id,
            subdomainId: backendSubdomain._id,
            categoryId: apiCategory._id,
            techStackId: nodeTechStack._id,
        });

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
