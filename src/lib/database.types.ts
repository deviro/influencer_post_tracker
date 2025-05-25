export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          id: string
          campaign_id: string
          username: string
          link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          username: string
          link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          username?: string
          link?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      videos: {
        Row: {
          id: string
          influencer_id: string
          link: string
          platform: Database['public']['Enums']['platform_type']
          status: Database['public']['Enums']['video_status_type']
          posted_on: string | null
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          link: string
          platform: Database['public']['Enums']['platform_type']
          status?: Database['public']['Enums']['video_status_type']
          posted_on?: string | null
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          link?: string
          platform?: Database['public']['Enums']['platform_type']
          status?: Database['public']['Enums']['video_status_type']
          posted_on?: string | null
          views?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_influencer_id_fkey"
            columns: ["influencer_id"]
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      platform_type: 'YouTube' | 'Instagram' | 'TikTok' | 'Twitch'
      video_status_type: 'Published' | 'Scheduled' | 'Draft' | 'Live' | 'Under Review' | 'Archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 