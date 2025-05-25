-- Simple migration script to replace Twitch with TikTok
-- Run this script in your Supabase SQL editor

-- Update all existing Twitch videos to TikTok
UPDATE videos 
SET platform = 'TikTok' 
WHERE platform = 'Twitch';

-- Verify the changes
SELECT platform, COUNT(*) as count 
FROM videos 
GROUP BY platform 
ORDER BY platform;

-- Check that no Twitch entries remain
SELECT COUNT(*) as remaining_twitch_count 
FROM videos 
WHERE platform = 'Twitch';

-- Optional: View all videos to confirm the changes
-- SELECT id, platform, link FROM videos ORDER BY platform; 