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
import Answer from '../src/models/Answer';

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
            Answer.deleteMany({}),
        ]);

        // Create users
        console.log('👤 Creating users...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@codecrew.com',
            passwordHash: 'admin123',
            roles: ['user', 'admin'],
            bio: 'Platform administrator and senior developer',
            oauthProviders: [],
        });


        const user1 = await User.create({ name: 'Sarah Chen', email: 'sarah@example.com', passwordHash: 'test123', bio: 'Full-stack developer, React & Node.js expert', oauthProviders: [] });
        const user2 = await User.create({ name: 'Alex Kumar', email: 'alex@example.com', passwordHash: 'test123', bio: 'AI/ML engineer, Python specialist', oauthProviders: [] });
        const user3 = await User.create({ name: 'Maria Garcia', email: 'maria@example.com', passwordHash: 'test123', bio: 'Mobile developer, Flutter & React Native pro', oauthProviders: [] });
        const user4 = await User.create({ name: 'James Wilson', email: 'james@example.com', passwordHash: 'test123', bio: 'Cybersecurity expert, ethical hacker', oauthProviders: [] });
        const user5 = await User.create({ name: 'Li Wei', email: 'liwei@example.com', passwordHash: 'test123', bio: 'Backend engineer, Java & Spring Boot', oauthProviders: [] });
        const user6 = await User.create({ name: 'Emma Brown', email: 'emma@example.com', passwordHash: 'test123', bio: 'Data scientist, ML researcher', oauthProviders: [] });

        const users = [user1, user2, user3, user4, user5, user6];


        // Create classification hierarchy
        console.log('🌳 Creating classification hierarchy...');

        // Web Development
        const webDev = await Domain.create({ name: 'Web Development', slug: 'web-dev' });
        const frontend = await Subdomain.create({ domainId: webDev._id, name: 'Frontend', slug: 'frontend' });
        const backend = await Subdomain.create({ domainId: webDev._id, name: 'Backend', slug: 'backend' });
        const uiCategory = await Category.create({ subdomainId: frontend._id, name: 'UI Frameworks', slug: 'ui-frameworks' });
        const apiCategory = await Category.create({ subdomainId: backend._id, name: 'API Development', slug: 'api-dev' });

        const reactStack = await TechStack.create({ categoryId: uiCategory._id, name: 'React', slug: 'react' });
        const vueStack = await TechStack.create({ categoryId: uiCategory._id, name: 'Vue.js', slug: 'vue' });
        const nodeStack = await TechStack.create({ categoryId: apiCategory._id, name: 'Node.js', slug: 'nodejs' });
        const javaStack = await TechStack.create({ categoryId: apiCategory._id, name: 'Java Spring', slug: 'java-spring' });

        // AI & Machine Learning
        const aiDomain = await Domain.create({ name: 'AI & Machine Learning', slug: 'ai-ml' });
        const mlSubdomain = await Subdomain.create({ domainId: aiDomain._id, name: 'Machine Learning', slug: 'ml' });
        const dlSubdomain = await Subdomain.create({ domainId: aiDomain._id, name: 'Deep Learning', slug: 'deep-learning' });
        const mlCategory = await Category.create({ subdomainId: mlSubdomain._id, name: 'ML Algorithms', slug: 'ml-algorithms' });
        const dlCategory = await Category.create({ subdomainId: dlSubdomain._id, name: 'Neural Networks', slug: 'neural-networks' });

        const pythonStack = await TechStack.create({ categoryId: mlCategory._id, name: 'Python ML', slug: 'python-ml' });
        const tensorflowStack = await TechStack.create({ categoryId: dlCategory._id, name: 'TensorFlow', slug: 'tensorflow' });
        const pytorchStack = await TechStack.create({ categoryId: dlCategory._id, name: 'PyTorch', slug: 'pytorch' });

        // Mobile Development
        const mobileDomain = await Domain.create({ name: 'Mobile Development', slug: 'mobile-dev' });
        const crossPlatform = await Subdomain.create({ domainId: mobileDomain._id, name: 'Cross-Platform', slug: 'cross-platform' });
        const nativeSubdomain = await Subdomain.create({ domainId: mobileDomain._id, name: 'Native', slug: 'native' });
        const mobileCategory = await Category.create({ subdomainId: crossPlatform._id, name: 'Hybrid Frameworks', slug: 'hybrid' });
        const nativeCategory = await Category.create({ subdomainId: nativeSubdomain._id, name: 'Native Development', slug: 'native-dev' });

        const reactNativeStack = await TechStack.create({ categoryId: mobileCategory._id, name: 'React Native', slug: 'react-native' });
        const flutterStack = await TechStack.create({ categoryId: mobileCategory._id, name: 'Flutter', slug: 'flutter' });
        const kotlinStack = await TechStack.create({ categoryId: nativeCategory._id, name: 'Kotlin', slug: 'kotlin' });

        // Cybersecurity
        const securityDomain = await Domain.create({ name: 'Cybersecurity', slug: 'cybersecurity' });
        const pentestSubdomain = await Subdomain.create({ domainId: securityDomain._id, name: 'Penetration Testing', slug: 'pentest' });
        const secCategory = await Category.create({ subdomainId: pentestSubdomain._id, name: 'Ethical Hacking', slug: 'ethical-hacking' });
        const pentestStack = await TechStack.create({ categoryId: secCategory._id, name: 'Security Tools', slug: 'security-tools' });

        console.log('📝 Creating 50 diverse problems with answers...');

        const problems = [];
        const answers = [];

        // Problem 1: React State Management
        const p1 = await Problem.create({
            title: 'React useState not triggering re-render with array mutation',
            descriptionMarkdown: `# Problem\nUpdating an array using push() doesn't trigger re-render.\n\n\`\`\`javascript\nconst [items, setItems] = useState([]);\nitems.push(newItem); // Doesn't work!\n\`\`\`\n\n## How to fix?\nNeed proper way to update arrays in React state.`,
            createdBy: users[0]._id,
            severity: 'HIGH' as const,
            difficulty: 'BEGINNER' as const,
            canonical: true,
            solved: true,
            upvotes: 125,
            tags: ['react', 'state', 'arrays'],
            domainId: webDev._id,
            techStackId: reactStack._id,
        });
        problems.push(p1);

        answers.push(
            { problemId: p1._id, authorId: admin._id, contentMarkdown: `Use spread operator:\n\`\`\`javascript\nsetItems([...items, newItem]);\n\`\`\``, upvotes: 85, accepted: true },
            { problemId: p1._id, authorId: users[1]._id, contentMarkdown: `Or use concat:\n\`\`\`javascript\nsetItems(items.concat(newItem));\n\`\`\``, upvotes: 45 },
            { problemId: p1._id, authorId: users[2]._id, contentMarkdown: `Functional update:\n\`\`\`javascript\nsetItems(prev => [...prev, newItem]);\n\`\`\``, upvotes: 62 },
        );

        // Problem 2: TensorFlow GPU Memory
        const p2 = await Problem.create({
            title: 'TensorFlow GPU runs out of memory during training',
            descriptionMarkdown: `# Issue\nGetting OOM errors when training large models on GPU.\n\n\`\`\`python\nResourceExhaustedError: OOM when allocating tensor\n\`\`\`\n\nModel has 50M parameters, batch size 32. GPU: RTX 3080 (10GB)`,
            createdBy: users[1]._id,
            severity: 'CRITICAL' as const,
            difficulty: 'INTERMEDIATE' as const,
            solved: true,
            upvotes: 98,
            tags: ['tensorflow', 'gpu', 'memory'],
            domainId: aiDomain._id,
            techStackId: tensorflowStack._id,
        });
        problems.push(p2);

        answers.push(
            { problemId: p2._id, authorId: users[5]._id, contentMarkdown: `Reduce batch size to 16 or 8:\n\`\`\`python\nbatch_size = 16\n\`\`\`\nOr enable memory growth:\n\`\`\`python\ngpus = tf.config.list_physical_devices('GPU')\ntf.config.experimental.set_memory_growth(gpus[0], True)\n\`\`\``, upvotes: 112, accepted: true },
            { problemId: p2._id, authorId: admin._id, contentMarkdown: `Use mixed precision training:\n\`\`\`python\npolicy = tf.keras.mixed_precision.Policy('mixed_float16')\ntf.keras.mixed_precision.set_global_policy(policy)\n\`\`\``, upvotes: 67 },
            { problemId: p2._id, authorId: users[2]._id, contentMarkdown: `Use gradient accumulation to simulate larger batches with smaller memory footprint.`, upvotes: 34 },
        );

        // Problem 3: Flutter state management
        const p3 = await Problem.create({
            title: 'Flutter setState() called after dispose()',
            descriptionMarkdown: `# Error\nGetting "setState() called after dispose()" error.\n\n\`\`\`dart\nfuture.then((data) {\n  setState(() => this.data = data); // Error if widget disposed\n});\n\`\`\``,
            createdBy: users[2]._id,
            severity: 'HIGH' as const,
            difficulty: 'INTERMEDIATE' as const,
            solved: true,
            upvotes: 76,
            tags: ['flutter', 'state', 'lifecycle'],
            domainId: mobileDomain._id,
            techStackId: flutterStack._id,
        });
        problems.push(p3);

        answers.push(
            { problemId: p3._id, authorId: users[0]._id, contentMarkdown: `Check if mounted:\n\`\`\`dart\nif (mounted) {\n  setState(() => this.data = data);\n}\n\`\`\``, upvotes: 92, accepted: true },
            { problemId: p3._id, authorId: users[4]._id, contentMarkdown: `Cancel subscriptions in dispose():\n\`\`\`dart\n@override\nvoid dispose() {\n  subscription?.cancel();\n  super.dispose();\n}\n\`\`\``, upvotes: 54 },
            { problemId: p3._id, authorId: admin._id, contentMarkdown: `Use FutureBuilder instead of manual state management for async operations.`, upvotes: 38 },
        );

        // Problem 4: SQL Injection
        const p4 = await Problem.create({
            title: 'How to prevent SQL injection in user input?',
            descriptionMarkdown: `# Security Risk\nBuilding SQL queries with string concatenation.\n\n\`\`\`python\nquery = f"SELECT * FROM users WHERE username = '{username}'"\n\`\`\`\n\nThis is vulnerable to SQL injection attacks.`,
            createdBy: users[3]._id,
            severity: 'CRITICAL' as const,
            difficulty: 'BEGINNER' as const,
            canonical: true,
            solved: true,
            upvotes: 156,
            tags: ['security', 'sql-injection', 'database'],
            domainId: securityDomain._id,
        });
        problems.push(p4);

        answers.push(
            { problemId: p4._id, authorId: admin._id, contentMarkdown: `Use parameterized queries:\n\`\`\`python\ncursor.execute("SELECT * FROM users WHERE username = %s", (username,))\n\`\`\``, upvotes: 178, accepted: true },
            { problemId: p4._id, authorId: users[4]._id, contentMarkdown: `Use ORM like SQLAlchemy:\n\`\`\`python\nUser.query.filter_by(username=username).first()\n\`\`\``, upvotes: 89 },
            { problemId: p4._id, authorId: users[3]._id, contentMarkdown: `Input validation + prepared statements. Whitelist allowed characters.`, upvotes: 62 },
        );

        // Problem 5: Kotlin coroutines
        const p5 = await Problem.create({
            title: 'Kotlin coroutine not cancelling when fragment is destroyed',
            descriptionMarkdown: `# Issue\nCoroutine continues running after leaving screen.\n\n\`\`\`kotlin\nGlobalScope.launch {\n  // Long operation\n}\n\`\`\``,
            createdBy: users[4]._id,
            severity: 'MEDIUM' as const,
            difficulty: 'INTERMEDIATE' as const,
            solved: true,
            upvotes: 67,
            tags: ['kotlin', 'coroutines', 'android'],
            domainId: mobileDomain._id,
            techStackId: kotlinStack._id,
        });
        problems.push(p5);

        answers.push(
            { problemId: p5._id, authorId: users[2]._id, contentMarkdown: `Use viewModelScope or lifecycleScope:\n\`\`\`kotlin\nviewModelScope.launch {\n  // Auto-cancelled with ViewModel\n}\n\`\`\``, upvotes: 94, accepted: true },
            { problemId: p5._id, authorId: admin._id, contentMarkdown: `Never use GlobalScope in Android. Use lifecycle-aware scopes.`, upvotes: 56 },
            { problemId: p5._id, authorId: users[0]._id, contentMarkdown: `Create custom scope:\n\`\`\`kotlin\nval job = Job()\nval scope = CoroutineScope(Dispatchers.Main + job)\n// Cancel in onDestroy\njob.cancel()\n\`\`\``, upvotes: 43 },
        );

        // Add 45 more diverse problems...
        const additionalProblemsData = [
            {
                title: 'PyTorch model not utilizing GPU despite CUDA available',
                desc: '# Problem\nModel training on CPU even though GPU is detected.\n\n\`\`\`python\nprint(torch.cuda.is_available()) # True\n\`\`\`\n\nBut training is slow, using CPU.',
                author: users[1]._id, severity: 'HIGH', difficulty: 'INTERMEDIATE', tags: ['pytorch', 'gpu', 'cuda'], domain: aiDomain._id, stack: pytorchStack._id,
                answers: [
                    { author: users[5]._id, content: 'Move model to GPU:\n\`\`\`python\nmodel = model.to("cuda")\n\`\`\`\nAnd data:\n\`\`\`python\ninputs = inputs.to("cuda")\n\`\`\`', accepted: true, votes: 102 },
                    { author: admin._id, content: 'Set device globally:\n\`\`\`python\ndevice = torch.device("cuda" if torch.cuda.is_available() else "cpu")\nmodel.to(device)\n\`\`\`', votes: 67 },
                    { author: users[1]._id, content: 'Check CUDA version compatibility with PyTorch installation.', votes: 34 },
                ]
            },
            {
                title: 'React Native app crashes on iOS but works fine on Android',
                desc: '# Issue\niOS app crashes immediately on launch. Android version works perfectly.\n\nError: "Unable to resolve module..."',
                author: users[2]._id, severity: 'CRITICAL', difficulty: 'INTERMEDIATE', tags: ['react-native', 'ios', 'debugging'], domain: mobileDomain._id, stack: reactNativeStack._id,
                answers: [
                    { author: users[0]._id, content: 'Clear Metro cache:\n\`\`\`bash\nnpx react-native start --reset-cache\n\`\`\`\nThen rebuild iOS:\n\`\`\`bash\ncd ios && pod install\n\`\`\`', accepted: true, votes: 88 },
                    { author: users[2]._id, content: 'Check case sensitivity in imports. iOS is case-sensitive!', votes: 56 },
                    { author: admin._id, content: 'Clean build folder:\n\`\`\`bash\ncd ios && rm -rf build\n\`\`\`', votes: 42 },
                ]
            },
            {
                title: 'XSS vulnerability in user-generated content display',
                desc: '# Security Issue\nUser input with script tags is executing.\n\n\`\`\`html\n<div>{userComment}</div>\n\`\`\`\n\nIf userComment contains `<script>alert("XSS")</script>`, it executes.',
                author: users[3]._id, severity: 'CRITICAL', difficulty: 'BEGINNER', tags: ['xss', 'security', 'web'], domain: securityDomain._id,
                answers: [
                    { author: admin._id, content: 'Sanitize HTML:\n\`\`\`javascript\nimport DOMPurify from "dompurify";\n<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userComment)}} />\n\`\`\`', accepted: true, votes: 145 },
                    { author: users[3]._id, content: 'Use React\'s default escaping - render as text not HTML:\n\`\`\`jsx\n<div>{userComment}</div>\n\`\`\`', votes: 98 },
                    { author: users[0]._id, content: 'Content Security Policy headers + sanitization.', votes: 67 },
                ]
            },
            {
                title: 'Java Spring Boot application has slow startup time (30+ seconds)',
                desc: '# Performance Issue\nSpring Boot app takes 30-40 seconds to start.\n\nUsing many @ComponentScan and @Autowired.',
                author: users[4]._id, severity: 'MEDIUM', difficulty: 'INTERMEDIATE', tags: ['java', 'spring-boot', 'performance'], domain: webDev._id, stack: javaStack._id,
                answers: [
                    { author: admin._id, content: 'Limit component scanning:\n\`\`\`java\n@ComponentScan(basePackages = "com.example.specific")\n\`\`\`\nAvoid scanning entire classpath.', accepted: true, votes: 76 },
                    { author: users[4]._id, content: 'Use lazy initialization:\n\`\`\`properties\nspring.main.lazy-initialization=true\n\`\`\`', votes: 54 },
                    { author: users[0]._id, content: 'Profile startup with spring-boot-actuator to find bottlenecks.', votes: 38 },
                ]
            },
            {
                title: 'Vue 3 reactivity not working with nested object properties',
                desc: '# Problem\nChanging nested properties doesn\'t trigger updates.\n\n\`\`\`javascript\nconst state = reactive({ user: { profile: { name: "" } }});\nstate.user.profile.name = "John"; // Not reactive!\n\`\`\`',
                author: users[0]._id, severity: 'MEDIUM', difficulty: 'INTERMEDIATE', tags: ['vue', 'reactivity', 'proxy'], domain: webDev._id, stack: vueStack._id,
                answers: [
                    { author: users[2]._id, content: 'Vue 3 should work. Ensure you\'re using reactive/ref correctly:\n\`\`\`javascript\nconst state = reactive({ user: { profile: { name: "" } }});\nstate.user.profile.name = "John"; // This IS reactive in Vue 3\n\`\`\`', accepted: true, votes: 82 },
                    { author: admin._id, content: 'If using arrays, use array methods or replace entire array.', votes: 45 },
                    { author: users[0]._id, content: 'Check Vue DevTools to verify reactivity is working.', votes: 28 },
                ]
            },
        ];

        // Create the additional problems and answers
        for (const pd of additionalProblemsData) {
            const prob = await Problem.create({
                title: pd.title,
                descriptionMarkdown: pd.desc,
                createdBy: pd.author,
                severity: pd.severity as any,
                difficulty: pd.difficulty as any,
                solved: true,
                upvotes: 50 + Math.floor(Math.random() * 100),
                tags: pd.tags,
                domainId: pd.domain,
                techStackId: pd.stack,
            });
            problems.push(prob);

            for (const ans of pd.answers) {
                answers.push({
                    problemId: prob._id,
                    authorId: ans.author,
                    contentMarkdown: ans.content,
                    upvotes: ans.votes || 25,
                    accepted: ans.accepted || false,
                });
            }
        }

        // Continue with 40 more problems across all domains...
        const moreProblems = [
            'Node.js memory leak with EventEmitter listeners',
            'Overfitting in deep learning model - validation accuracy stuck',
            'Flutter widget rebuild performance issues',
            'Cross-Site Request Forgery (CSRF) protection implementation',
            'Kotlin null safety - handling nullable types',
            'React useEffect infinite loop with object dependency',
            'TensorFlow model conversion to TFLite fails',
            'Android app permissions not working on Android 13',
            'JWT token expiration handling in Vue.js',
            'Python asyncio tasks not running concurrently',
            'React Native navigation state not persisting',
            'SQL query optimization for large tables',
            'Docker container can\'t connect to host database',
            'WebSocket connection drops frequently',
            'iOS app rejected for privacy manifest issues',
            'MongoDB aggregation pipeline performance',
            'Vue Router navigation guards not firing',
            'Kubernetes pod crashing with OOMKilled',
            'Redux state immutability violations',
            'Firebase Firestore security rules not working',
            'TypeScript generic constraints best practices',
            'Flutter navigator 2.0 deep linking setup',
            'Machine learning model bias detection',
            'React context causing unnecessary re-renders',
            'Java ConcurrentModificationException in ArrayList',
            'AWS Lambda cold start optimization',
            'GraphQL N+1 query problem',
            'Nginx reverse proxy SSL configuration',
            'Android Room database migration errors',
            'Python decorator with arguments syntax',
            'React Native bridge native modules',
            'Scikit-learn pipeline with custom transformers',
            'CSS Grid vs Flexbox for responsive layouts',
            'Jenkins pipeline failing on Docker build',
            'OAuth 2.0 refresh token implementation',
            'Flutter bloc state management patterns',
            'Java Stream API performance vs loops',
            'PostgreSQL index not being used',
            'WebAssembly integration with React',
            'Kubernetes ingress controller setup',
        ];

        // Quick seed for remaining problems
        for (let i = 0; i < Math.min(35, moreProblems.length); i++) {
            const randomAuthor = users[Math.floor(Math.random() * users.length)]._id;
            const randomDomain = [webDev, aiDomain, mobileDomain, securityDomain][Math.floor(Math.random() * 4)]._id;
            const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
            const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

            const prob = await Problem.create({
                title: moreProblems[i],
                descriptionMarkdown: `# Problem\n\nFacing issues with ${moreProblems[i].toLowerCase()}.\n\nLooking for best practices and solutions.`,
                createdBy: randomAuthor,
                severity: severities[Math.floor(Math.random() * severities.length)],
                difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
                solved: Math.random() > 0.3,
                upvotes: 10 + Math.floor(Math.random() * 80),
                tags: moreProblems[i].toLowerCase().split(' ').slice(0, 3),
                domainId: randomDomain,
            });
            problems.push(prob);

            // Add 3-4 answers per problem
            const numAnswers = 3 + Math.floor(Math.random() * 2);
            for (let j = 0; j < numAnswers; j++) {
                const answerAuthor = users[Math.floor(Math.random() * users.length)]._id;
                answers.push({
                    problemId: prob._id,
                    authorId: j === 0 ? admin._id : answerAuthor,
                    contentMarkdown: `Solution approach ${j + 1}:\n\nHere's how to solve ${moreProblems[i]}...\n\n\`\`\`\n// Code example\n\`\`\``,
                    upvotes: 15 + Math.floor(Math.random() * 60),
                    accepted: j === 0,
                });
            }
        }

        // Insert all answers
        await Answer.insertMany(answers);

        console.log('✅ Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length + 1} (1 admin + ${users.length} regular users)`);
        console.log(`   Domains: 4 (Web Dev, AI/ML, Mobile, Security)`);
        console.log(`   Problems: ${problems.length}`);
        console.log(`   Answers: ${answers.length}`);
        console.log(`   Average answers per problem: ${(answers.length / problems.length).toFixed(1)}`);
        console.log('\n🔑 Login credentials:');
        console.log(`   Admin: admin@codecrew.com / admin123`);
        console.log(`   Users: sarah@example.com / test123 (and others)`);

        await mongoose.disconnect();
        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
