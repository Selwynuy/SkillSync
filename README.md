# SkillSync

AI-powered career assessment and personalized job path recommendations for students. Discover your perfect career path through comprehensive assessments and data-driven insights.

## 🚀 Features

### Core Functionality
- **Career Assessment**: Comprehensive multi-module assessment with Likert scale and multiple-choice questions
- **Personalized Recommendations**: AI-powered career path recommendations based on trait matching
- **Academic Grade Tracking**: Optional grade input (grades 7-10) to enhance recommendations
- **Job Path Exploration**: Browse detailed career information with salary ranges, education requirements, and growth projections
- **Saved Paths**: Bookmark and manage your favorite career paths
- **Dashboard**: View assessment history, recommendations, and saved paths

### Additional Features
- **Scholarships**: Browse available scholarship opportunities
- **Colleges**: Explore educational institutions
- **SHS Strands**: Explore Senior High School tracks and strands with detailed information
- **Milestones**: Track your career journey milestones
- **Data Export**: Export your assessment data and profile

### AI Integration
- **Gemini AI** (Optional): Natural, personalized rationale generation for career recommendations using Google's Gemini 1.5 Flash model
- **Fallback System**: Graceful degradation to deterministic rationales when AI is unavailable

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js v5
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (optional)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 20+ and npm
- Supabase account (for database)
- Google Gemini API key (optional, for AI-powered rationales)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SkillSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Auth.js
   AUTH_SECRET=your-auth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   DATABASE_URL=your-postgresql-connection-string

   # Gemini AI (Optional)
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Set up Supabase Database**
   
   - Create a new Supabase project
   - Run the database schema migration (SQL files available locally)
   - Configure Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
SkillSync/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/       # Marketing pages and components
│   ├── api/               # API routes
│   ├── assessments/       # Assessment pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── recommendations/   # Career recommendations
├── components/             # React components
│   ├── ui/               # shadcn/ui components
│   ├── assessment/       # Assessment-specific components
│   └── common/           # Shared components
├── lib/                   # Utility libraries
│   ├── auth/            # Authentication utilities
│   ├── assessment/      # Assessment scoring and storage
│   ├── recommendations/ # Recommendation engine
│   └── supabase/        # Supabase client configuration
├── data/                 # Static data files
└── types/                # TypeScript type definitions
```

## 🎯 How It Works

1. **User Registration**: Sign up with email/password
2. **Assessment**: Complete a comprehensive career assessment covering multiple personality traits
3. **Trait Calculation**: System calculates an 8-dimensional trait vector from responses
4. **Recommendation Engine**: Uses cosine similarity to match user traits with career paths
5. **AI Enhancement**: (Optional) Gemini AI generates personalized explanations
6. **Results**: View ranked career recommendations with detailed insights

## 📚 Key Concepts

### Trait Vector Matching
- Users receive an 8-dimensional trait vector from their assessment
- Each job path has a pre-defined trait vector
- Cosine similarity calculates match scores (0-1)
- Top matches are ranked and recommended

### Recommendation Generation
1. **Deterministic Mode**: Template-based rationales (default)
2. **AI Mode**: Gemini AI generates natural explanations (when `GEMINI_API_KEY` is set)

## 🔐 Security

- Row Level Security (RLS) on all Supabase tables
- Password hashing with bcryptjs
- Secure session management with NextAuth.js
- Environment variable protection

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- AI powered by [Google Gemini](https://ai.google.dev)
