# Influencer Post Tracker

A comprehensive React application for tracking influencer campaigns, posts, and performance metrics. Built with modern technologies and featuring a complete database backend with Supabase.

## 🚀 Live Demo

[View Live Application](https://deviro.github.io/influencer_post_tracker/)

## ✨ Features

- 📊 **Campaign Management**: Create, edit, and delete marketing campaigns
- 👥 **Influencer Tracking**: Manage influencer profiles and contact information
- 🎥 **Video Analytics**: Track video performance across multiple platforms
- 📈 **Real-time Metrics**: Automatic calculation of views, engagement, and statistics
- 🔍 **Advanced Filtering**: Search and filter by status, platform, and keywords
- 📱 **Responsive Design**: Mobile-friendly interface with modern UI
- 🗄️ **Database Integration**: Full CRUD operations with Supabase backend
- 🚀 **GitHub Pages Deployment**: Automated CI/CD pipeline

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Validation**: Zod schemas
- **Deployment**: GitHub Pages with GitHub Actions
- **Development**: Cursor AI-assisted development

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier available)
- Git installed on your machine

## 🚀 Step-by-Step Launch Tutorial

### Step 1: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/deviro/influencer_post_tracker.git
cd influencer_post_tracker

# Install dependencies
npm install
```

### Step 2: Supabase Database Setup

#### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `influencer-tracker`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

#### 2.2 Configure Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase_schema.sql` from this repository
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, relationships, and sample data

#### 2.3 Disable Row Level Security (for development)

1. In SQL Editor, run the contents of `disable_rls.sql`:
```sql
-- Disable RLS for development
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencers DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
```

#### 2.4 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Local Development

```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

You should now see the application with sample data loaded from Supabase!

### Step 4: Verify Database Connection

1. Navigate to the **Campaigns** page
2. Try creating a new campaign
3. Add influencers and videos
4. Check that data persists after page refresh
5. Verify data appears in your Supabase dashboard under **Table Editor**

### Step 5: Deploy to GitHub Pages

#### 5.1 Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

#### 5.2 Update Environment Variables

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add your Supabase credentials as repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

#### 5.3 Deploy

```bash
# Build and deploy
git add .
git commit -m "Initial deployment setup"
git push origin main
```

The GitHub Action will automatically build and deploy your app. Check the **Actions** tab to monitor progress.

### Step 6: Production Configuration

#### 6.1 Enable Row Level Security (Production)

For production, enable RLS and create proper policies:

```sql
-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Add policies as needed for your authentication setup
```

#### 6.2 Custom Domain (Optional)

1. In your repository, create a `CNAME` file in the `public/` directory
2. Add your custom domain name
3. Configure DNS settings with your domain provider

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── ErrorBoundary.tsx   # Error handling
│   └── ...                 # Feature components
├── lib/
│   ├── supabase.ts         # Database client
│   ├── schemas.ts          # Zod validation schemas
│   ├── database.types.ts   # TypeScript types
│   └── utils.ts            # Utility functions
├── pages/
│   ├── HomePage.tsx        # Campaign overview
│   └── CampaignsPage.tsx   # Detailed campaign view
├── store/
│   └── campaignStore.ts    # Zustand state management
└── App.tsx                 # Main application
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📊 Database Schema

The application uses three main tables:

- **campaigns**: Campaign information and metadata
- **influencers**: Influencer profiles linked to campaigns
- **videos**: Individual video posts with performance metrics

See `supabase_schema.sql` for the complete schema definition.


## 📝 Development Notes

**Development Time**: Approximately 7 hours of focused development

**Tools Used**: 
- Primary development with [Cursor](https://cursor.sh/) AI-assisted IDE
- Extensive use of AI pair programming for rapid feature development
- Modern React patterns and TypeScript best practices

