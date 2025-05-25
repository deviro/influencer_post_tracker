# Supabase Setup Guide

## 📋 **Prerequisites**
- Supabase account (free tier is fine)
- Database tables created using `supabase_schema.sql`

## 🔧 **Setup Steps**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Wait for the project to be ready

### 2. **Create Database Tables**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `supabase_schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**

### 3. **Get Your Credentials**
1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

### 4. **Configure Environment Variables**
Create a `.env.local` file in your project root:

```env
# Replace with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. **Test Connection**
Run your development server:
```bash
npm run dev
```

The app should now connect to Supabase! 🎉

## 🔒 **Security Notes**

- The anon key is safe to use in frontend code
- Row Level Security (RLS) is enabled by default
- Adjust RLS policies in **Authentication** → **Policies** as needed

## 📊 **Sample Data**

The schema includes sample data that matches your current app structure. You can:
- View it in **Table Editor**
- Modify it as needed
- Add more test data

## 🛠️ **Available Features**

Your app now has:
- ✅ **Zustand store** for state management
- ✅ **Zod validation** for type safety
- ✅ **Full CRUD operations** for campaigns, influencers, and videos
- ✅ **Real-time metrics calculation**
- ✅ **TypeScript support** with proper types
- ✅ **Error handling** and loading states

## 🚀 **Next Steps**

1. Update your React components to use the Zustand store
2. Replace hardcoded data with Supabase calls
3. Add authentication if needed
4. Deploy to production

## 📝 **Usage Example**

```typescript
import { useCampaignStore } from './store/campaignStore'

function MyComponent() {
  const { 
    campaigns, 
    loading, 
    fetchCampaigns,
    createCampaign 
  } = useCampaignStore()

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Create new campaign
  const handleCreate = async () => {
    await createCampaign({
      name: 'New Campaign',
      description: 'Campaign description'
    })
  }

  return (
    <div>
      {loading ? 'Loading...' : campaigns.map(campaign => (
        <div key={campaign.id}>{campaign.name}</div>
      ))}
    </div>
  )
}
``` 