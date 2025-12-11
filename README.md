# StudentHub — Student Doubt Community (MERN Edition)

A Reddit-style student doubt community built with the MERN stack (MongoDB, Express, React, Node.js). Features hierarchical problem classification, canonical solutions, voting, and a sleek, modern UI with glassmorphism design.

## 🚀 Features

### Core Functionality
- **Hierarchical Classification**: Domain → Subdomain → Category → Tech Stack → Programming Language → Topic
- **Major Problems Pages**: Per-classification aggregated problems and site-wide top 100 curated
- **Problem & Discussion**: Create problems, add answers, vote, bookmark, and comment
- **Canonical Solutions**: Admin-curated canonical answers for common problems
- **User Authentication**: JWT + OAuth (Google) integration
- **Severity & Difficulty Levels**: CRITICAL/HIGH/MEDIUM/LOW severity, BEGINNER/INTERMEDIATE/ADVANCED difficulty
- **Search & Filters**: Advanced filtering by classification, severity, difficulty, tags, and more

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- JWT authentication + refresh tokens
- Google OAuth 2.0
- Cloudinary for image uploads
- Rate limiting & validation middleware

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS + glassmorphism effects
- Zustand for state management
- Framer Motion for animations
- React Router v6
- Axios for API calls

## 📁 Project Structure

```
Studenthub/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, Cloudinary, Passport config
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   └── server.ts      # Express server entry point
│   ├── scripts/
│   │   └── seed.js        # Database seeding script
│   ├── tests/             # Jest unit tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── design-tokens.json     # Design system documentation
```

## 🛠️ Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier available)
- **Cloudinary** account (free tier available)
- **Google Cloud Console** project (for OAuth)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
cd Studenthub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studenthub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=your-session-secret-change-this-in-production
```

#### Seed the Database

```bash
npm run seed
```

This creates:
- 2 users (admin & test user)
- Classification hierarchy (Web Development domain with subdomains, categories, etc.)
- 5 sample problems (2 canonical)

**Login Credentials:**
- Admin: `admin@studenthub.com` / `admin123`
- User: `test@example.com` / `test123`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Classification
- `GET /api/domains` - List all domains
- `GET /api/domains/:id/subdomains` - Get subdomains by domain
- `GET /api/hierarchy` - Get full classification hierarchy

### Problems
- `GET /api/problems` - List problems with filters
- `GET /api/problems/major` - Get top 100 canonical problems
- `GET /api/problems/:id` - Get problem details
- `GET /api/class/:type/:id/problems` - Get problems  by classification
- `POST /api/problems` - Create problem (auth required)
- `PATCH /api/problems/:id` - Update problem
- `POST /api/problems/:id/answers` - Add answer
- `POST /api/problems/:id/solve` - Mark as solved
- `POST /api/problems/vote` - Vote on problem/answer
- `POST /api/problems/bookmark` - Bookmark content
- `POST /api/problems/comment` - Add comment

### Admin (requires admin role)
- `GET /api/admin/moderation` - Moderation queue
- `PATCH /api/admin/problems/:id/canonical` - Mark problem as canonical
- `GET /api/admin/analytics` - Get analytics
- `DELETE /api/admin/problems/:id` - Delete problem

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5)
- **Accent**: Neon Blue (#38BDF8)
- **Severity Colors**:
  - CRITICAL: Red (#EF4444)
  - HIGH: Amber (#F59E0B)
  - MEDIUM: Indigo (#6366F1)
  -  LOW: Green (#10B981)

### Typography
- **Font**: Inter (400, 500, 600, 700)

### Components
- Glassmorphism cards (16px blur, rounded-2xl)
- Gradient buttons with hover effects
- Smooth micro-animations
- Mobile-first responsive design

## 🔐 Setting Up Third-Party Services

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and add to `MONGODB_URI`

### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to backend `.env`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret
7. Add to backend `.env` and frontend `.env`

## 🚢 Deployment

### Backend (Render/Heroku)

**Render:**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables from `.env`

**Heroku:**
```bash
heroku create studenthub-api
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
# ... add all env vars
git push heroku main
```

### Frontend (Vercel/Netlify)

**Vercel:**
```bash
cd frontend
vercel --prod
```

**Netlify:**
```bash
cd frontend
npm run build
# Deploy dist/ folder via Netlify UI or CLI
```

Update `VITE_API_URL` to your deployed backend URL.

## 📖 Admin Guide

### Marking Problems as Canonical

1. Login as admin
2. Navigate to Admin Dashboard
3. Review moderation queue (problems with high votes)
4. Click "Mark as Canonical" on quality problems
5. Canonical problems appear at the top of classification pages

### Moderation Queue Criteria

Problems appear in moderation queue if:
- Severity is CRITICAL or HIGH
- Upvotes ≥ 10
- Not already canonical

## 🎯 Next Steps (To Complete Full Implementation)

The current implementation provides a solid foundation. To complete all features:

### High Priority
1. **Implement full problem display logic** in `ProblemDetail.tsx`
2. **Create markdown editor** component for problem creation
3. **Build voting system UI** with upvote/downvote buttons
4. **Implement classification browser** in `Explore.tsx`
5. **Add personalized feed** in `Home.tsx` based on user interests

### Medium Priority
6. **Export functionality** (CSV/PDF) for major problems
7. **Analytics page** with charts and heatmaps
8. **Bookmark management** page
9. **User profile** with activity history
10. **Search functionality** with autocomplete

### Polish
11. **Dark mode** toggle
12. **Accessibility** improvements (ARIA labels, keyboard navigation)
13. **Loading skeletons** and error boundaries
14. **Toast notifications** for user actions
15. **Onboarding modal** for new users

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### OAuth Not Working
- Verify redirect URIs in Google Console match exactly
- Check client ID and secret are correct
- Ensure cookies are enabled

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Ensure credentials are being sent with requests

## 📝 License

MIT

## 🤝 Contributing

This is a project template. Feel free to customize and extend it for your needs!

## 📧 Support

For issues related to setup or deployment, please check the troubleshooting section or create an issue in the repository.

---

**Built with ❤️ using the MERN stack**
