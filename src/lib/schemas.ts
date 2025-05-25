import { z } from 'zod'

// Platform and Status enums to match database
export const PlatformSchema = z.enum(['YouTube', 'Instagram', 'TikTok', 'Twitch'])
export const VideoStatusSchema = z.enum(['Published', 'Scheduled', 'Draft', 'Live', 'Under Review', 'Archived'])

export type Platform = z.infer<typeof PlatformSchema>
export type VideoStatus = z.infer<typeof VideoStatusSchema>

// Campaign schema
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().nullable(),
  start_date: z.string().nullable(), // ISO date string
  end_date: z.string().nullable(), // ISO date string
  budget: z.number().nullable(),
  status: z.string().default('Active'),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
})

// Influencer schema (without calculated fields)
export const InfluencerSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  username: z.string().min(1, 'Username is required'),
  link: z.string().url('Must be a valid URL'),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
})

// Video schema for reading existing data (more lenient)
export const VideoSchemaLenient = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  link: z.string().min(1, 'Link is required'), // More lenient - just require non-empty string
  platform: PlatformSchema,
  status: VideoStatusSchema.default('Draft'),
  posted_on: z.string().nullable(), // ISO date string
  views: z.number().int().min(0).default(0),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
})

// Video schema for strict validation (creating new videos)
export const VideoSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  link: z.string().url('Must be a valid URL'),
  platform: PlatformSchema,
  status: VideoStatusSchema.default('Draft'),
  posted_on: z.string().nullable(), // ISO date string
  views: z.number().int().min(0).default(0),
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
})

// Extended influencer schema with calculated fields for frontend
export const InfluencerWithMetricsSchema = InfluencerSchema.extend({
  videos: z.array(VideoSchemaLenient).default([]), // Use lenient schema for existing data
  // Calculated fields
  platforms: z.array(PlatformSchema).default([]), // Calculated from videos
  video_count: z.number().int().min(0).default(0),
  views_median: z.number().min(0).default(0),
  total_views: z.number().min(0).default(0),
  views_now: z.number().min(0).default(0), // Latest/highest views
})

// Input schemas for creating/updating (without auto-generated fields)
export const CreateCampaignSchema = CampaignSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateCampaignSchema = CreateCampaignSchema.partial()

export const CreateInfluencerSchema = InfluencerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateInfluencerSchema = CreateInfluencerSchema.partial().omit({
  campaign_id: true, // Don't allow changing campaign
})

export const CreateVideoSchema = VideoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const UpdateVideoSchema = CreateVideoSchema.partial().omit({
  influencer_id: true, // Don't allow changing influencer
})

// Type exports
export type Campaign = z.infer<typeof CampaignSchema>
export type Influencer = z.infer<typeof InfluencerSchema>
export type Video = z.infer<typeof VideoSchema>
export type VideoLenient = z.infer<typeof VideoSchemaLenient>
export type InfluencerWithMetrics = z.infer<typeof InfluencerWithMetricsSchema>

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>
export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>
export type CreateInfluencer = z.infer<typeof CreateInfluencerSchema>
export type UpdateInfluencer = z.infer<typeof UpdateInfluencerSchema>
export type CreateVideo = z.infer<typeof CreateVideoSchema>
export type UpdateVideo = z.infer<typeof UpdateVideoSchema>

// Utility function to calculate metrics from videos
export const calculateInfluencerMetrics = (videos: VideoLenient[]) => {
  if (videos.length === 0) {
    return {
      platforms: [] as Platform[],
      video_count: 0,
      views_median: 0,
      total_views: 0,
      views_now: 0,
    }
  }

  // Calculate unique platforms from videos
  const uniquePlatforms = Array.from(new Set(videos.map(v => v.platform))) as Platform[]

  const views = videos.map(v => v.views).sort((a, b) => a - b)
  const total_views = views.reduce((sum, views) => sum + views, 0)
  const views_median = views.length % 2 === 0
    ? (views[views.length / 2 - 1] + views[views.length / 2]) / 2
    : views[Math.floor(views.length / 2)]
  const views_now = Math.max(...views)

  return {
    platforms: uniquePlatforms,
    video_count: videos.length,
    views_median: Math.round(views_median),
    total_views,
    views_now,
  }
} 