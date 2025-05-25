-- Influencer Post Tracker Database Schema for Supabase
-- This schema supports the current application structure with campaigns, influencers, and videos

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data consistency
CREATE TYPE platform_type AS ENUM ('YouTube', 'Instagram', 'TikTok', 'Twitch');
CREATE TYPE video_status_type AS ENUM ('Published', 'Scheduled', 'Draft', 'Live', 'Under Review', 'Archived');

-- 1. Campaigns Table
-- Represents marketing campaigns that contain multiple influencers
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Influencers Table
-- Represents individual influencers/content creators
CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    link TEXT NOT NULL, -- Main profile or representative link
    platforms platform_type[] NOT NULL, -- Array of platforms they're active on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Videos Table
-- Represents individual video posts from influencers
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    link TEXT NOT NULL,
    platform platform_type NOT NULL,
    status video_status_type NOT NULL DEFAULT 'Draft',
    posted_on DATE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_influencers_campaign_id ON influencers(campaign_id);
CREATE INDEX idx_influencers_username ON influencers(username);
CREATE INDEX idx_influencers_platforms ON influencers USING GIN(platforms);
CREATE INDEX idx_videos_influencer_id ON videos(influencer_id);
CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_posted_on ON videos(posted_on);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your authentication needs)
-- These policies allow authenticated users to perform all operations
-- You may want to customize these based on your specific requirements

CREATE POLICY "Enable read access for authenticated users" ON campaigns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON campaigns
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON campaigns
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON influencers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON influencers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON influencers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON influencers
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON videos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON videos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON videos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data to match current application structure
INSERT INTO campaigns (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Tech Product Launch', 'Campaign for new tech product launch');

INSERT INTO influencers (id, campaign_id, username, link, platforms) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '@techreviewerpro', 'https://youtube.com/watch?v=abc123', ARRAY['YouTube', 'Instagram']::platform_type[]),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '@lifestyleguru', 'https://instagram.com/p/def456', ARRAY['Instagram', 'TikTok']::platform_type[]),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '@gamingmaster', 'https://twitch.tv/videos/ghi789', ARRAY['Twitch', 'YouTube']::platform_type[]),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '@fitnesscoach', 'https://tiktok.com/@fitnesscoach/video/jkl012', ARRAY['TikTok', 'Instagram', 'YouTube']::platform_type[]),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '@foodblogger', 'https://instagram.com/p/mno345', ARRAY['Instagram']::platform_type[]);

INSERT INTO videos (influencer_id, link, platform, status, posted_on, views) VALUES 
    -- @techreviewerpro videos
    ('550e8400-e29b-41d4-a716-446655440001', 'https://youtube.com/watch?v=abc123', 'YouTube', 'Published', '2024-01-15', 145000),
    ('550e8400-e29b-41d4-a716-446655440001', 'https://youtube.com/watch?v=def456', 'YouTube', 'Published', '2024-01-10', 98000),
    ('550e8400-e29b-41d4-a716-446655440001', 'https://instagram.com/p/tech789', 'Instagram', 'Scheduled', '2024-01-12', 87000),
    
    -- @lifestyleguru videos
    ('550e8400-e29b-41d4-a716-446655440002', 'https://instagram.com/p/def456', 'Instagram', 'Published', '2024-01-14', 92000),
    ('550e8400-e29b-41d4-a716-446655440002', 'https://instagram.com/p/jkl012', 'Instagram', 'Published', '2024-01-12', 87000),
    ('550e8400-e29b-41d4-a716-446655440002', 'https://tiktok.com/@lifestyleguru/video/abc123', 'TikTok', 'Draft', '2024-01-13', 156000),
    
    -- @gamingmaster videos
    ('550e8400-e29b-41d4-a716-446655440003', 'https://twitch.tv/videos/ghi789', 'Twitch', 'Live', '2024-01-13', 58200),
    ('550e8400-e29b-41d4-a716-446655440003', 'https://twitch.tv/videos/pqr123', 'Twitch', 'Published', '2024-01-11', 54000),
    ('550e8400-e29b-41d4-a716-446655440003', 'https://youtube.com/watch?v=gaming456', 'YouTube', 'Published', '2024-01-09', 61000),
    
    -- @fitnesscoach videos
    ('550e8400-e29b-41d4-a716-446655440004', 'https://tiktok.com/@fitnesscoach/video/jkl012', 'TikTok', 'Published', '2024-01-16', 225000),
    ('550e8400-e29b-41d4-a716-446655440004', 'https://instagram.com/p/fitness789', 'Instagram', 'Scheduled', '2024-01-14', 198000),
    ('550e8400-e29b-41d4-a716-446655440004', 'https://youtube.com/watch?v=workout123', 'YouTube', 'Under Review', '2024-01-12', 234000),
    
    -- @foodblogger videos
    ('550e8400-e29b-41d4-a716-446655440005', 'https://instagram.com/p/mno345', 'Instagram', 'Published', '2024-01-15', 47200),
    ('550e8400-e29b-41d4-a716-446655440005', 'https://instagram.com/p/bcd678', 'Instagram', 'Published', '2024-01-13', 42000),
    ('550e8400-e29b-41d4-a716-446655440005', 'https://instagram.com/p/efg901', 'Instagram', 'Archived', '2024-01-10', 46800);

-- Useful queries for the application:

-- Get all influencers with their video counts and calculated metrics for a campaign
-- SELECT 
--     i.id,
--     i.username,
--     i.link,
--     i.platforms,
--     COUNT(v.id) as video_count,
--     AVG(v.views) as views_median,
--     SUM(v.views) as total_views,
--     MAX(v.views) as views_now
-- FROM influencers i
-- LEFT JOIN videos v ON i.id = v.influencer_id
-- WHERE i.campaign_id = 'your-campaign-id'
-- GROUP BY i.id, i.username, i.link, i.platforms;

-- Get all videos for a specific influencer
-- SELECT * FROM videos 
-- WHERE influencer_id = 'your-influencer-id' 
-- ORDER BY posted_on DESC;

-- Get platform statistics
-- SELECT 
--     platform,
--     COUNT(*) as video_count,
--     AVG(views) as avg_views,
--     SUM(views) as total_views
-- FROM videos 
-- GROUP BY platform;

-- Calculate metrics for a specific influencer (frontend calculation example)
-- SELECT 
--     influencer_id,
--     COUNT(*) as video_count,
--     AVG(views) as views_median,
--     SUM(views) as total_views,
--     MAX(views) as highest_views,
--     MIN(views) as lowest_views
-- FROM videos 
-- WHERE influencer_id = 'your-influencer-id'
-- GROUP BY influencer_id; 