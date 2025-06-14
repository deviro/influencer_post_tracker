import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase, handleSupabaseError, handleSupabaseSuccess, type SupabaseResponse } from '../lib/supabase'
import { 
  type Campaign, 
  type Influencer, 
  type Video, 
  type VideoLenient,
  type InfluencerWithMetrics,
  type CreateCampaign,
  type UpdateCampaign,
  type CreateInfluencer,
  type UpdateInfluencer,
  type CreateVideo,
  type UpdateVideo,
  calculateInfluencerMetrics,
  CampaignSchema,
  InfluencerSchema,
  VideoSchema,
  VideoSchemaLenient
} from '../lib/schemas'

interface CampaignState {
  // State
  campaigns: Campaign[]
  influencers: InfluencerWithMetrics[]
  videos: VideoLenient[]
  currentCampaignId: string | null
  loading: boolean
  error: string | null

  // Actions
  setCampaigns: (campaigns: Campaign[]) => void
  setInfluencers: (influencers: InfluencerWithMetrics[]) => void
  setVideos: (videos: VideoLenient[]) => void
  setCurrentCampaignId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API Actions
  fetchCampaigns: () => Promise<SupabaseResponse<Campaign[]>>
  fetchInfluencersForCampaign: (campaignId: string) => Promise<SupabaseResponse<InfluencerWithMetrics[]>>
  fetchVideosForInfluencer: (influencerId: string) => Promise<SupabaseResponse<VideoLenient[]>>
  
  createCampaign: (campaign: CreateCampaign) => Promise<SupabaseResponse<Campaign>>
  updateCampaign: (id: string, campaign: UpdateCampaign) => Promise<SupabaseResponse<Campaign>>
  deleteCampaign: (id: string) => Promise<SupabaseResponse<void>>
  
  createInfluencer: (influencer: CreateInfluencer) => Promise<SupabaseResponse<Influencer>>
  updateInfluencer: (id: string, influencer: UpdateInfluencer) => Promise<SupabaseResponse<Influencer>>
  deleteInfluencer: (id: string) => Promise<SupabaseResponse<void>>
  
  createVideo: (video: CreateVideo) => Promise<SupabaseResponse<Video>>
  updateVideo: (id: string, video: UpdateVideo) => Promise<SupabaseResponse<Video>>
  deleteVideo: (id: string) => Promise<SupabaseResponse<void>>

  // Utility actions
  getInfluencerById: (id: string) => InfluencerWithMetrics | undefined
  getVideoById: (id: string) => VideoLenient | undefined
  refreshInfluencerMetrics: (influencerId: string) => void
}

export const useCampaignStore = create<CampaignState>()(
  devtools(
    (set, get) => ({
      // Initial state
      campaigns: [],
      influencers: [],
      videos: [],
      currentCampaignId: null,
      loading: false,
      error: null,

      // Basic setters
      setCampaigns: (campaigns) => set({ campaigns }),
      setInfluencers: (influencers) => set({ influencers }),
      setVideos: (videos) => set({ videos }),
      setCurrentCampaignId: (id) => set({ currentCampaignId: id }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions - Campaigns
      fetchCampaigns: async () => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error

          const validatedCampaigns = data.map(campaign => CampaignSchema.parse(campaign))
          
          set({ campaigns: validatedCampaigns, loading: false })
          return handleSupabaseSuccess(validatedCampaigns)
        } catch (error) {
          set({ loading: false })
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      // API Actions - Influencers
      fetchInfluencersForCampaign: async (campaignId: string) => {
        set({ loading: true, error: null })
        try {
          // Fetch influencers with their videos
          const { data: influencersData, error: influencersError } = await supabase
            .from('influencers')
            .select(`
              *,
              videos (*)
            `)
            .eq('campaign_id', campaignId)

          if (influencersError) throw influencersError

          // Process and validate data
          const influencersWithMetrics: InfluencerWithMetrics[] = influencersData.map(influencer => {
            const validatedInfluencer = InfluencerSchema.parse(influencer)
            const validatedVideos = influencer.videos.map((video: any) => VideoSchemaLenient.parse(video))
            const metrics = calculateInfluencerMetrics(validatedVideos)

            return {
              ...validatedInfluencer,
              videos: validatedVideos,
              ...metrics
            }
          })

          set({ influencers: influencersWithMetrics, loading: false })
          return handleSupabaseSuccess(influencersWithMetrics)
        } catch (error) {
          set({ loading: false })
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      // API Actions - Videos
      fetchVideosForInfluencer: async (influencerId: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('influencer_id', influencerId)
            .order('posted_on', { ascending: false })

          if (error) throw error

          const validatedVideos = data.map(video => VideoSchemaLenient.parse(video))
          set({ videos: validatedVideos, loading: false })
          return handleSupabaseSuccess(validatedVideos)
        } catch (error) {
          set({ loading: false })
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      // Create operations
      createCampaign: async (campaign: CreateCampaign) => {
        // Don't set loading state for smooth UX
        try {
          // Create optimistic campaign with temporary ID
          const tempId = `temp-${Date.now()}`
          const optimisticCampaign: Campaign = {
            id: tempId,
            ...campaign,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // Update UI immediately
          set(state => ({ 
            campaigns: [optimisticCampaign, ...state.campaigns]
          }))

          // Then save to database
          const { data, error } = await supabase
            .from('campaigns')
            .insert(campaign)
            .select()
            .single()

          if (error) throw error

          const validatedCampaign = CampaignSchema.parse(data)
          
          // Replace optimistic campaign with real data
          set(state => ({ 
            campaigns: state.campaigns.map(c => 
              c.id === tempId ? validatedCampaign : c
            )
          }))
          return handleSupabaseSuccess(validatedCampaign)
        } catch (error) {
          // Rollback optimistic update on error
          set(state => ({
            campaigns: state.campaigns.filter(c => !c.id.startsWith('temp-'))
          }))
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      updateCampaign: async (id: string, campaign: UpdateCampaign) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('campaigns')
            .update(campaign)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          const validatedCampaign = CampaignSchema.parse(data)
          set(state => ({
            campaigns: state.campaigns.map(c => c.id === id ? validatedCampaign : c),
            loading: false
          }))
          return handleSupabaseSuccess(validatedCampaign)
        } catch (error) {
          set({ loading: false })
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      deleteCampaign: async (id: string) => {
        // Don't set loading state for smooth UX
        // Store original campaign for potential rollback
        const originalCampaign = get().campaigns.find(c => c.id === id)
        
        try {
          if (!originalCampaign) {
            throw new Error('Campaign not found')
          }

          // Optimistic update - remove campaign immediately from UI
          set(state => ({
            campaigns: state.campaigns.filter(c => c.id !== id)
          }))

          // Then delete from database
          const { error } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', id)

          if (error) throw error

          return handleSupabaseSuccess(undefined)
        } catch (error) {
          // Rollback optimistic update on error - restore original campaign
          if (originalCampaign) {
            set(state => ({
              campaigns: [...state.campaigns, originalCampaign].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
            }))
          } else {
            // If we don't have the original, try to fetch campaigns again
            get().fetchCampaigns()
          }
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      createInfluencer: async (influencer: CreateInfluencer) => {
        // Don't set loading state for smooth UX
        try {
          // Create optimistic influencer with temporary ID
          const tempId = `temp-${Date.now()}`
          const optimisticInfluencer: InfluencerWithMetrics = {
            id: tempId,
            ...influencer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            videos: [],
            platforms: [],
            video_count: 0,
            views_median: 0,
            total_views: 0,
            views_now: 0
          }

          // Update UI immediately
          set(state => ({
            influencers: [optimisticInfluencer, ...state.influencers],
          }))

          // Then save to database
          const { data, error } = await supabase
            .from('influencers')
            .insert(influencer)
            .select()
            .single()

          if (error) throw error

          const validatedInfluencer = InfluencerSchema.parse(data)
          const newInfluencerWithMetrics: InfluencerWithMetrics = {
            ...validatedInfluencer,
            videos: [],
            platforms: [],
            video_count: 0,
            views_median: 0,
            total_views: 0,
            views_now: 0
          }

          // Replace optimistic influencer with real data
          set(state => ({
            influencers: state.influencers.map(inf => 
              inf.id === tempId ? newInfluencerWithMetrics : inf
            ),
          }))
          return handleSupabaseSuccess(validatedInfluencer)
        } catch (error) {
          // Rollback optimistic update on error
          set(state => ({
            influencers: state.influencers.filter(inf => !inf.id.startsWith('temp-')),
          }))
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      updateInfluencer: async (id: string, influencer: UpdateInfluencer) => {
        // Don't set loading state for smooth UX
        try {
          // Store original influencer for potential rollback
          const originalInfluencer = get().getInfluencerById(id)
          
          if (!originalInfluencer) {
            throw new Error('Influencer not found')
          }

          // Create optimistic updated influencer
          const optimisticInfluencer = { ...originalInfluencer, ...influencer, updated_at: new Date().toISOString() }
          
          // Optimistic update - update influencer immediately in UI
          set(state => ({
            influencers: state.influencers.map(inf => 
              inf.id === id ? optimisticInfluencer : inf
            ),
          }))

          // Then save to database
          const { data, error } = await supabase
            .from('influencers')
            .update(influencer)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          const validatedInfluencer = InfluencerSchema.parse(data)
          
          // Replace optimistic influencer with real data
          set(state => ({
            influencers: state.influencers.map(inf => 
              inf.id === id 
                ? { ...inf, ...validatedInfluencer }
                : inf
            ),
          }))
          return handleSupabaseSuccess(validatedInfluencer)
        } catch (error) {
          // Rollback optimistic update on error - restore original influencer
          const originalInfluencer = get().getInfluencerById(id)
          
          if (originalInfluencer) {
            set(state => ({
              influencers: state.influencers.map(inf => 
                inf.id === id ? originalInfluencer : inf
              ),
            }))
          }
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      deleteInfluencer: async (id: string) => {
        // Don't set loading state for smooth UX
        try {
          // Store the influencer for potential rollback
          const influencerToDelete = get().getInfluencerById(id)

          if (!influencerToDelete) {
            throw new Error('Influencer not found')
          }

          // Optimistic update - remove influencer immediately from UI
          set(state => ({
            influencers: state.influencers.filter(inf => inf.id !== id),
          }))

          // Then delete from database
          const { error } = await supabase
            .from('influencers')
            .delete()
            .eq('id', id)

          if (error) throw error

          return handleSupabaseSuccess(undefined)
        } catch (error) {
          // Rollback optimistic update on error - restore the influencer
          const influencerToRestore = get().getInfluencerById(id)

          if (influencerToRestore) {
            set(state => ({
              influencers: [influencerToRestore, ...state.influencers.filter(inf => inf.id !== id)],
            }))
          }
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      createVideo: async (video: CreateVideo) => {
        // Don't set loading state for smooth UX
        try {
          // Optimistic update first - add video immediately to UI
          const tempId = `temp-${Date.now()}`
          const optimisticVideo = {
            id: tempId,
            ...video,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Update UI immediately
          set(state => {
            const updatedInfluencers = state.influencers.map(inf => {
              if (inf.id === video.influencer_id) {
                const updatedVideos = [optimisticVideo, ...inf.videos]
                const metrics = calculateInfluencerMetrics(updatedVideos)
                return {
                  ...inf,
                  videos: updatedVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              influencers: updatedInfluencers,
              videos: [optimisticVideo, ...state.videos],
            }
          })

          // Then save to database
          const { data, error } = await supabase
            .from('videos')
            .insert(video)
            .select()
            .single()

          if (error) throw error

          const validatedVideo = VideoSchema.parse(data)
          
          // Replace optimistic video with real data
          set(state => {
            const updatedInfluencers = state.influencers.map(inf => {
              if (inf.id === video.influencer_id) {
                const updatedVideos = inf.videos.map(v => 
                  v.id === tempId ? validatedVideo : v
                )
                const metrics = calculateInfluencerMetrics(updatedVideos)
                return {
                  ...inf,
                  videos: updatedVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              influencers: updatedInfluencers,
              videos: state.videos.map(v => v.id === tempId ? validatedVideo : v),
            }
          })
          
          return handleSupabaseSuccess(validatedVideo)
        } catch (error) {
          // Rollback optimistic update on error
          set(state => {
            const updatedInfluencers = state.influencers.map(inf => {
              if (inf.id === video.influencer_id) {
                const updatedVideos = inf.videos.filter(v => !v.id.startsWith('temp-'))
                const metrics = calculateInfluencerMetrics(updatedVideos)
                return {
                  ...inf,
                  videos: updatedVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              influencers: updatedInfluencers,
              videos: state.videos.filter(v => !v.id.startsWith('temp-')),
            }
          })
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      updateVideo: async (id: string, video: UpdateVideo) => {
        // Don't set loading state for smooth UX
        try {
          // Store original video for potential rollback - use helper function
          const originalVideo = get().getVideoById(id)
          
          if (!originalVideo) {
            throw new Error('Video not found')
          }

          // Create optimistic updated video
          const optimisticVideo = { ...originalVideo, ...video, updated_at: new Date().toISOString() }
          
          // Optimistic update - update video immediately in UI
          set(state => {
            const updatedVideos = state.videos.map(v => v.id === id ? optimisticVideo : v)
            const updatedInfluencers = state.influencers.map(inf => {
              const videoIndex = inf.videos.findIndex(v => v.id === id)
              if (videoIndex !== -1) {
                const updatedInfluencerVideos = [...inf.videos]
                updatedInfluencerVideos[videoIndex] = optimisticVideo
                const metrics = calculateInfluencerMetrics(updatedInfluencerVideos)
                return {
                  ...inf,
                  videos: updatedInfluencerVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              videos: updatedVideos,
              influencers: updatedInfluencers,
            }
          })

          // Then save to database
          const { data, error } = await supabase
            .from('videos')
            .update(video)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error

          const validatedVideo = VideoSchema.parse(data)
          
          // Replace optimistic video with real data
          set(state => {
            const updatedVideos = state.videos.map(v => v.id === id ? validatedVideo : v)
            const updatedInfluencers = state.influencers.map(inf => {
              const videoIndex = inf.videos.findIndex(v => v.id === id)
              if (videoIndex !== -1) {
                const updatedInfluencerVideos = [...inf.videos]
                updatedInfluencerVideos[videoIndex] = validatedVideo
                const metrics = calculateInfluencerMetrics(updatedInfluencerVideos)
                return {
                  ...inf,
                  videos: updatedInfluencerVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              videos: updatedVideos,
              influencers: updatedInfluencers,
            }
          })
          
          return handleSupabaseSuccess(validatedVideo)
        } catch (error) {
          // Rollback optimistic update on error - restore original video
          const originalVideo = get().getVideoById(id)
          
          if (originalVideo) {
            set(state => {
              const updatedVideos = state.videos.map(v => v.id === id ? originalVideo : v)
              const updatedInfluencers = state.influencers.map(inf => {
                const videoIndex = inf.videos.findIndex(v => v.id === id)
                if (videoIndex !== -1) {
                  const updatedInfluencerVideos = [...inf.videos]
                  updatedInfluencerVideos[videoIndex] = originalVideo
                  const metrics = calculateInfluencerMetrics(updatedInfluencerVideos)
                  return {
                    ...inf,
                    videos: updatedInfluencerVideos,
                    ...metrics
                  }
                }
                return inf
              })
              
              return {
                videos: updatedVideos,
                influencers: updatedInfluencers,
              }
            })
          }
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      deleteVideo: async (id: string) => {
        // Don't set loading state for smooth UX
        try {
          // Store the video for potential rollback - use helper function
          const videoToDelete = get().getVideoById(id)
          const state = get()
          const influencerToUpdate = state.influencers.find(inf => 
            inf.videos.some(v => v.id === id)
          )

          if (!videoToDelete || !influencerToUpdate) {
            throw new Error('Video not found')
          }

          // Optimistic update - remove video immediately from UI
          set(state => {
            const updatedVideos = state.videos.filter(v => v.id !== id)
            
            const updatedInfluencers = state.influencers.map(inf => {
              if (inf.id === influencerToUpdate.id) {
                const updatedInfluencerVideos = inf.videos.filter(v => v.id !== id)
                const metrics = calculateInfluencerMetrics(updatedInfluencerVideos)
                return {
                  ...inf,
                  videos: updatedInfluencerVideos,
                  ...metrics
                }
              }
              return inf
            })
            
            return {
              videos: updatedVideos,
              influencers: updatedInfluencers,
            }
          })

          // Then delete from database
          const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id)

          if (error) throw error
          
          return handleSupabaseSuccess(undefined)
        } catch (error) {
          // Rollback optimistic update on error - restore the video
          const videoToRestore = get().getVideoById(id)

          if (videoToRestore) {
            set(state => {
              const updatedVideos = [videoToRestore, ...state.videos.filter(v => v.id !== id)]
              
              const updatedInfluencers = state.influencers.map(inf => {
                if (inf.id === videoToRestore.influencer_id) {
                  const updatedInfluencerVideos = [videoToRestore, ...inf.videos.filter(v => v.id !== id)]
                  const metrics = calculateInfluencerMetrics(updatedInfluencerVideos)
                  return {
                    ...inf,
                    videos: updatedInfluencerVideos,
                    ...metrics
                  }
                }
                return inf
              })
              
              return {
                videos: updatedVideos,
                influencers: updatedInfluencers,
              }
            })
          }
          
          const response = handleSupabaseError(error)
          set({ error: response.error })
          return response
        }
      },

      // Utility functions
      getInfluencerById: (id: string) => {
        return get().influencers.find(inf => inf.id === id)
      },

      getVideoById: (id: string) => {
        const state = get()
        // First check global videos array
        let video = state.videos.find(v => v.id === id)
        
        // If not found, check influencers' videos
        if (!video) {
          for (const influencer of state.influencers) {
            video = influencer.videos.find(v => v.id === id)
            if (video) break
          }
        }
        
        return video
      },

      refreshInfluencerMetrics: (influencerId: string) => {
        set(state => ({
          influencers: state.influencers.map(inf => {
            if (inf.id === influencerId) {
              const metrics = calculateInfluencerMetrics(inf.videos)
              return { ...inf, ...metrics }
            }
            return inf
          })
        }))
      }
    }),
    {
      name: 'campaign-store'
    }
  )
) 