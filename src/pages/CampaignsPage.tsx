import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronRight, Edit, Plus, Trash2, Save, AlertCircle, RefreshCw, Home } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils'
import { useCampaignStore } from '../store/campaignStore'
import { type VideoLenient, type Platform, type VideoStatus, type CreateVideo, type CreateInfluencer, CreateVideoSchema, CreateInfluencerSchema } from '../lib/schemas'

const statusOptions: VideoStatus[] = ["Published", "Scheduled", "Draft", "Live", "Under Review", "Archived"]
const platformOptions: Platform[] = ["YouTube", "Instagram", "TikTok"]

// Form validation state interface
interface FormErrors {
  link?: string
  platform?: string
  status?: string
  views?: string
  posted_on?: string
  username?: string
  general?: string
}

export function CampaignsPage() {
  const {
    campaigns,
    influencers,
    loading,
    error,
    currentCampaignId,
    fetchInfluencersForCampaign,
    fetchCampaigns,
    setCurrentCampaignId,
    setError,
    updateVideo,
    createVideo,
    deleteVideo,
    createInfluencer,
    updateInfluencer,
    deleteInfluencer,
    setInfluencers,
    setLoading,
    setVideos,
  } = useCampaignStore()

  const { toast } = useToast()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<VideoStatus | 'All'>('All')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingFields, setEditingFields] = useState<{[key: string]: boolean}>({})
  
  // Track previous filter state to detect when filters are first applied
  const [prevFiltersActive, setPrevFiltersActive] = useState(false)
  
  // Video editing states
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false)
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState<Partial<CreateVideo>>({
    link: '',
    platform: 'YouTube',
    status: 'Draft',
    posted_on: null,
    views: 0
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  
  // Influencer editing states
  const [isAddInfluencerDialogOpen, setIsAddInfluencerDialogOpen] = useState(false)
  const [isDeleteInfluencerDialogOpen, setIsDeleteInfluencerDialogOpen] = useState(false)
  const [influencerToDelete, setInfluencerToDelete] = useState<string | null>(null)
  const [newInfluencer, setNewInfluencer] = useState<Partial<CreateInfluencer>>({
    username: '',
    link: '',
    campaign_id: ''
  })
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingInfluencer, setIsDeletingInfluencer] = useState(false)
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})

  // Get current campaign name
  const currentCampaign = campaigns.find(campaign => campaign.id === currentCampaignId)
  const campaignName = currentCampaign?.name || 'Unknown Campaign'

  // Set default campaign ID (you can change this to the actual campaign ID you want to display)
  const defaultCampaignId = '550e8400-e29b-41d4-a716-446655440000'

  useEffect(() => {
    const loadData = async () => {
      try {
        // Clear any previous errors when component mounts
        setError(null)
        
        // Fetch campaigns if not already loaded
        if (campaigns.length === 0) {
          await fetchCampaigns()
        }
        
        if (!currentCampaignId) {
          setCurrentCampaignId(defaultCampaignId)
          return // Let the next useEffect handle the actual loading
        }
        
        if (currentCampaignId) {
          setLoading(true)
          const result = await fetchInfluencersForCampaign(currentCampaignId)
          
          if (!result.success) {
            setError(result.error || 'Failed to load campaign data')
            toast({
              title: 'Error',
              description: result.error || 'Failed to load campaign data. Please try again.',
              variant: 'destructive'
            })
          }
        }
      } catch (err) {
        console.error('Error in useEffect:', err)
        setError('Failed to initialize campaign data')
        setLoading(false)
      }
    }

    loadData()
  }, [currentCampaignId, fetchInfluencersForCampaign, fetchCampaigns, setCurrentCampaignId, setError, setLoading, toast, campaigns.length])

  // Clear error when user navigates to the page
  useEffect(() => {
    setError(null)
  }, [])

  // Add keyboard shortcut for debugging (Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault()
        resetEverything()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Function to clear error and retry loading data
  const clearErrorAndRetry = async () => {
    setError(null)
    setLoading(true)
    if (currentCampaignId) {
      try {
        const result = await fetchInfluencersForCampaign(currentCampaignId)
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Data refreshed successfully',
          })
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load data',
            variant: 'destructive'
          })
        }
      } catch (err) {
        console.error('Error retrying:', err)
        setError('Failed to load data. Please check your connection.')
        toast({
          title: 'Error',
          description: 'Still having trouble loading data. Please check your connection.',
          variant: 'destructive'
        })
      }
    } else {
      setLoading(false)
      setError('No campaign selected')
    }
  }

  // Force refresh - completely reset state and reload
  const forceRefresh = async () => {
    setError(null)
    setInfluencers([])
    setLoading(true)
    
    // Reset to default campaign and fetch
    setCurrentCampaignId(defaultCampaignId)
    
    try {
      const result = await fetchInfluencersForCampaign(defaultCampaignId)
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Data completely refreshed',
        })
      } else {
        setError(result.error || 'Failed to load data')
        toast({
          title: 'Error',
          description: result.error || 'Failed to load data',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error in force refresh:', err)
      setError('Failed to load data. Please check your connection.')
      setLoading(false)
    }
  }

  // Dismiss error and try to reload data
  const dismissErrorAndReload = async () => {
    setError(null)
    
    // If we have no data, try to reload
    if (influencers.length === 0 && currentCampaignId) {
      setLoading(true)
      try {
        const result = await fetchInfluencersForCampaign(currentCampaignId)
        if (!result.success) {
          // If it fails again, just clear the error but don't show it
          console.error('Failed to reload after dismiss:', result.error)
        }
      } catch (err) {
        console.error('Error reloading after dismiss:', err)
      }
    }
  }

  // Debug function to completely reset everything
  const resetEverything = () => {
    setError(null)
    setInfluencers([])
    setVideos([])
    setLoading(false)
    setFormErrors({})
    setTouched({})
    setIsAddVideoDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setSelectedInfluencerId(null)
    setVideoToDelete(null)
    setExpandedRows(new Set())
    setEditingFields({})
    
    // Clear any cached data and restart
    setTimeout(() => {
      setCurrentCampaignId(defaultCampaignId)
    }, 100)
    
    toast({
      title: 'Reset Complete',
      description: 'Application state has been completely reset',
    })
  }

  // Validation functions
  const validateField = (field: keyof CreateVideo, value: any): string | undefined => {
    try {
      switch (field) {
        case 'link':
          if (!value || value.trim() === '') {
            return 'Video link is required'
          }
          // Basic URL validation
          try {
            const url = new URL(value)
            
            // Platform-specific URL validation
            const platform = newVideo.platform
            switch (platform) {
              case 'YouTube':
                if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) {
                  return 'Must be a valid YouTube URL (youtube.com or youtu.be)'
                }
                break
              case 'Instagram':
                if (!url.hostname.includes('instagram.com')) {
                  return 'Must be a valid Instagram URL (instagram.com)'
                }
                break
              case 'TikTok':
                if (!url.hostname.includes('tiktok.com')) {
                  return 'Must be a valid TikTok URL (tiktok.com)'
                }
                break
            }
          } catch {
            return 'Must be a valid URL (e.g., https://youtube.com/watch?v=...)'
          }
          break
        case 'views':
          if (value < 0) {
            return 'Views cannot be negative'
          }
          if (!Number.isInteger(Number(value))) {
            return 'Views must be a whole number'
          }
          break
        case 'posted_on':
          if (value && value.trim() !== '') {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              return 'Must be a valid date'
            }
            if (date > new Date()) {
              return 'Posted date cannot be in the future'
            }
          }
          break
      }
    } catch (error) {
      return 'Invalid value'
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    try {
      // Validate required fields
      if (!newVideo.link || newVideo.link.trim() === '') {
        errors.link = 'Video link is required'
      } else {
        const linkError = validateField('link', newVideo.link)
        if (linkError) errors.link = linkError
      }

      // Validate views
      if (newVideo.views !== undefined && newVideo.views !== null) {
        const viewsError = validateField('views', newVideo.views)
        if (viewsError) errors.views = viewsError
      }

      // Validate posted_on
      if (newVideo.posted_on) {
        const dateError = validateField('posted_on', newVideo.posted_on)
        if (dateError) errors.posted_on = dateError
      }

      // Validate using Zod schema
      try {
        const videoData: CreateVideo = {
          influencer_id: selectedInfluencerId!,
          link: newVideo.link!,
          platform: newVideo.platform as Platform,
          status: newVideo.status as VideoStatus,
          posted_on: newVideo.posted_on ?? null,
          views: newVideo.views || 0
        }
        CreateVideoSchema.parse(videoData)
      } catch (zodError: any) {
        console.error('Zod validation error:', zodError)
        if (zodError.errors && Array.isArray(zodError.errors)) {
          zodError.errors.forEach((err: any) => {
            const field = err.path?.[0] as keyof FormErrors
            if (field && !errors[field]) {
              errors[field] = err.message || 'Invalid value'
            }
          })
        } else {
          // Fallback for unexpected Zod error format
          errors.general = 'Validation failed. Please check your input.'
        }
      }
    } catch (error) {
      console.error('Unexpected error in form validation:', error)
      errors.general = 'An unexpected error occurred during validation'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFieldChange = (field: keyof CreateVideo, value: any) => {
    setNewVideo(prev => ({ ...prev, [field]: value }))
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Clear previous error for this field
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Validate field in real-time if it's been touched
    if (touched[field]) {
      const error = validateField(field, value)
      if (error) {
        setFormErrors(prev => ({ ...prev, [field]: error }))
      }
    }
  }

  const handleFieldBlur = (field: keyof CreateVideo) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = newVideo[field]
    const error = validateField(field, value)
    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  // Local function to update influencer fields
  const updateInfluencerField = async (influencerId: string, field: 'username' | 'link', value: string) => {
    try {
      // Basic validation
      if (!value || value.trim() === '') {
        throw new Error(`${field === 'username' ? 'Username' : 'Link'} cannot be empty`)
      }
      
      if (field === 'link') {
        try {
          new URL(value)
        } catch {
          throw new Error('Must be a valid URL')
        }
      }
      
      // Update the influencer field
      const result = await updateInfluencer(influencerId, { [field]: value.trim() })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update influencer')
      }
      
      // Clear any existing errors on successful operation
      setError(null)
      
    } catch (error) {
      console.error('Error updating influencer field:', error)
      toast({
        title: 'Error',
        description: `Error updating ${field}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    }
  }

  // Local function to update video fields
  const updateVideoField = async (videoId: string, field: keyof VideoLenient, value: any) => {
    // Validate the field before updating
    let validatedValue = value
    
    try {
      // Basic validation based on field type
      switch (field) {
        case 'link':
          if (!value || value.trim() === '') {
            throw new Error('Video link cannot be empty')
          }
          try {
            new URL(value)
            // Note: For inline editing, we don't have access to the platform context
            // so we'll do basic URL validation only
          } catch {
            throw new Error('Must be a valid URL')
          }
          break
        case 'views':
          const numValue = Number(value)
          if (isNaN(numValue) || numValue < 0) {
            throw new Error('Views must be a positive number')
          }
          if (!Number.isInteger(numValue)) {
            throw new Error('Views must be a whole number')
          }
          validatedValue = numValue
          break
        case 'posted_on':
          if (value && value.trim() !== '') {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              throw new Error('Must be a valid date')
            }
            if (date > new Date()) {
              throw new Error('Posted date cannot be in the future')
            }
          }
          break
      }
      
      // Update the video field
      const result = await updateVideo(videoId, { [field]: validatedValue })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update video')
      }
      
      // Clear any existing errors on successful operation
      setError(null)
      
      // Show success notification - removed for smoother UX
      // toast({
      //   title: 'Success',
      //   description: `Video ${field} updated successfully`,
      // })
      
    } catch (error) {
      console.error('Error updating video field:', error)
      toast({
        title: 'Error',
        description: `Error updating ${field}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    }
  }

  // Video editing functions
  const handleAddVideo = (influencerId: string) => {
    setSelectedInfluencerId(influencerId)
    setNewVideo({
      link: '',
      platform: 'YouTube',
      status: 'Draft',
      posted_on: null,
      views: 0
    })
    setFormErrors({})
    setTouched({})
    setIsAddVideoDialogOpen(true)
  }

  const handleSaveVideo = async () => {
    if (!selectedInfluencerId) {
      setFormErrors({ general: 'No influencer selected' })
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const videoData: CreateVideo = {
        influencer_id: selectedInfluencerId,
        link: newVideo.link!,
        platform: newVideo.platform as Platform,
        status: newVideo.status as VideoStatus,
        posted_on: newVideo.posted_on ?? null,
        views: newVideo.views || 0
      }

      const result = await createVideo(videoData)
      
      if (result.success) {
        // Clear any existing errors on successful operation
        setError(null)
        
        setIsAddVideoDialogOpen(false)
        setSelectedInfluencerId(null)
        setNewVideo({
          link: '',
          platform: 'YouTube',
          status: 'Draft',
          posted_on: null,
          views: 0
        })
        setFormErrors({})
        setTouched({})
        
        // Show success notification - removed for smoother UX
        // toast({
        //   title: 'Success',
        //   description: 'Video added successfully',
        // })
      } else {
        setFormErrors({ 
          general: result.error || 'Failed to create video. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error creating video:', error)
      setFormErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteVideo(videoToDelete)
      if (result.success) {
        // Clear any existing errors on successful operation
        setError(null)
        
        setIsDeleteDialogOpen(false)
        setVideoToDelete(null)
        
        // Show success notification - removed for smoother UX
        // toast({
        //   title: 'Success',
        //   description: 'Video deleted successfully',
        // })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete video',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the video',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Influencer management functions
  const handleAddInfluencer = () => {
    setNewInfluencer({
      username: '',
      link: '',
      campaign_id: currentCampaignId || defaultCampaignId
    })
    setFormErrors({})
    setTouched({})
    setIsAddInfluencerDialogOpen(true)
  }

  const handleSaveInfluencer = async () => {
    if (!currentCampaignId) {
      setFormErrors({ general: 'No campaign selected' })
      return
    }

    // Validate form
    const errors: FormErrors = {}
    
    if (!newInfluencer.username || newInfluencer.username.trim() === '') {
      errors.username = 'Username is required'
    }
    
    if (!newInfluencer.link || newInfluencer.link.trim() === '') {
      errors.link = 'Link is required'
    } else {
      try {
        new URL(newInfluencer.link)
      } catch {
        errors.link = 'Must be a valid URL'
      }
    }

    // Validate using Zod schema
    try {
      const influencerData: CreateInfluencer = {
        campaign_id: currentCampaignId,
        username: newInfluencer.username!.trim(),
        link: newInfluencer.link!.trim()
      }
      CreateInfluencerSchema.parse(influencerData)
    } catch (zodError: any) {
      console.error('Zod validation error:', zodError)
      if (zodError.errors && Array.isArray(zodError.errors)) {
        zodError.errors.forEach((err: any) => {
          const field = err.path?.[0] as keyof FormErrors
          if (field && !errors[field]) {
            errors[field] = err.message || 'Invalid value'
          }
        })
      } else {
        errors.general = 'Validation failed. Please check your input.'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const influencerData: CreateInfluencer = {
        campaign_id: currentCampaignId,
        username: newInfluencer.username!.trim(),
        link: newInfluencer.link!.trim()
      }

      const result = await createInfluencer(influencerData)
      
      if (result.success) {
        // Clear any existing errors on successful operation
        setError(null)
        
        setIsAddInfluencerDialogOpen(false)
        setNewInfluencer({
          username: '',
          link: '',
          campaign_id: ''
        })
        setFormErrors({})
        setTouched({})
      } else {
        setFormErrors({ 
          general: result.error || 'Failed to create influencer. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error creating influencer:', error)
      setFormErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteInfluencer = (influencerId: string) => {
    setInfluencerToDelete(influencerId)
    setIsDeleteInfluencerDialogOpen(true)
  }

  const confirmDeleteInfluencer = async () => {
    if (!influencerToDelete) return

    setIsDeletingInfluencer(true)
    try {
      const result = await deleteInfluencer(influencerToDelete)
      
      if (result.success) {
        setIsDeleteInfluencerDialogOpen(false)
        setInfluencerToDelete(null)
        toast({
          title: 'Success',
          description: 'Influencer deleted successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete influencer',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting influencer:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsDeletingInfluencer(false)
    }
  }

  const filteredRecords = (() => {
    try {
      return influencers.filter(record => {
        // Status filter - check if influencer has any videos with the selected status
        const matchesStatus = statusFilter === 'All' || 
                             record.videos?.some(video => video.status === statusFilter)
        
        return matchesStatus
      }).map(record => {
        // If status filter is active, only show videos that match the status
        if (statusFilter !== 'All') {
          return {
            ...record,
            videos: record.videos?.filter(video => video.status === statusFilter) || []
          }
        }
        return record
      })
    } catch (error) {
      console.error('Error filtering records:', error)
      toast({
        title: 'Error',
        description: 'Error processing campaign data',
        variant: 'destructive'
      })
      return []
    }
  })()

  // Auto-expand all rows when filtering is active
  useEffect(() => {
    const filtersActive = Boolean(statusFilter !== 'All')
    
    // Only auto-expand when filters are first applied (transition from false to true)
    if (filtersActive && !prevFiltersActive) {
      const allFilteredIds = new Set(filteredRecords.map(record => record.id))
      setExpandedRows(prev => {
        const newExpanded = new Set(prev)
        // Add all filtered records to expanded set
        allFilteredIds.forEach(id => newExpanded.add(id))
        return newExpanded
      })
    }
    
    // Update previous filter state
    setPrevFiltersActive(filtersActive)
  }, [statusFilter, filteredRecords, prevFiltersActive])

  // Calculate campaign totals
  const campaignTotals = (() => {
    try {
      const totalInfluencers = influencers.length
      const totalVideos = influencers.reduce((sum, influencer) => sum + (influencer.videos?.length || 0), 0)
      const totalViews = influencers.reduce((sum, influencer) => sum + (influencer.total_views || 0), 0)
      const totalViewsNow = influencers.reduce((sum, influencer) => sum + (influencer.views_now || 0), 0)
      
      // Calculate overall median views
      const allViewCounts = influencers.flatMap(influencer => 
        influencer.videos?.map(video => video.views || 0) || []
      ).sort((a, b) => a - b)
      
      const overallMedianViews = allViewCounts.length > 0 
        ? allViewCounts.length % 2 === 0
          ? (allViewCounts[allViewCounts.length / 2 - 1] + allViewCounts[allViewCounts.length / 2]) / 2
          : allViewCounts[Math.floor(allViewCounts.length / 2)]
        : 0

      // Status distribution
      const statusCounts = influencers.reduce((acc, influencer) => {
        influencer.videos?.forEach(video => {
          acc[video.status] = (acc[video.status] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>)

      return {
        totalInfluencers,
        totalVideos,
        totalViews,
        totalViewsNow,
        overallMedianViews,
        statusCounts
      }
    } catch (error) {
      console.error('Error calculating campaign totals:', error)
      return {
        totalInfluencers: 0,
        totalVideos: 0,
        totalViews: 0,
        totalViewsNow: 0,
        overallMedianViews: 0,
        statusCounts: {}
      }
    }
  })()

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count.toString()
  }

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  const toggleFieldEdit = (influencerId: string, videoId: string, field: string) => {
    const key = `${influencerId}-${videoId}-${field}`
    setEditingFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isFieldEditing = (influencerId: string, videoId: string, field: string) => {
    const key = `${influencerId}-${videoId}-${field}`
    return editingFields[key] || false
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "bg-red-500 text-white"
      case "Instagram":
        return "bg-pink-500 text-white"
      case "TikTok":
        return "bg-black text-white"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Live":
        return "bg-red-100 text-red-800"
      case "Under Review":
        return "bg-orange-100 text-orange-800"
      case "Archived":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getPlatformBgColor = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "bg-red-500"
      case "Instagram":
        return "bg-pink-500"
      case "TikTok":
        return "bg-black"
      default:
        return "bg-blue-100"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100"
      case "Scheduled":
        return "bg-yellow-100"
      case "Draft":
        return "bg-gray-100"
      case "Live":
        return "bg-red-100"
      case "Under Review":
        return "bg-orange-100"
      case "Archived":
        return "bg-slate-100"
      default:
        return "bg-blue-100"
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    const isConfigError = error.includes('Missing Supabase environment variables') || 
                         error.includes('VITE_SUPABASE_URL') || 
                         error.includes('VITE_SUPABASE_ANON_KEY')
    
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  {isConfigError ? (
                    <>
                      <p className="font-semibold">⚙️ Configuration Required</p>
                      <div className="text-sm space-y-2">
                        <p>Your Supabase database is not configured yet.</p>
                        <div className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-line">
                          {error}
                        </div>
                        <p>
                          <strong>Quick Setup:</strong> Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file 
                          in your project root with your Supabase credentials.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Unable to load campaign data</p>
                      <p className="text-sm">{error}</p>
                    </>
                  )}
                  <div className="flex gap-2 mt-3">
                    {!isConfigError && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearErrorAndRetry}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={forceRefresh}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Force Refresh
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={dismissErrorAndReload}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback for when influencers data is corrupted or invalid
  if (!Array.isArray(influencers)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Data format error</p>
                  <p className="text-sm">The campaign data appears to be corrupted. Please refresh the page.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="mt-2"
                  >
                    Refresh Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  try {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Debug panel - only show in development */}
        {import.meta.env.DEV && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mb-4">
            <div className="space-y-1 text-blue-800">
              <div>🐛 Debug Info:</div>
              <div>• Current Campaign ID: {currentCampaignId || 'None'}</div>
              <div>• Loading: {loading ? 'Yes' : 'No'}</div>
              <div>• Error: {error || 'None'}</div>
              <div>• Influencers Count: {influencers.length}</div>
              <div>• Filtered Records: {filteredRecords.length}</div>
              {error && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetEverything}
                  className="text-blue-800 hover:bg-blue-100 mt-2"
                >
                  Reset Everything
                </Button>
              )}
            </div>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              
              <CardTitle className="text-3xl font-bold text-center">
                {campaignName}
              </CardTitle>
              
              {/* Empty div for spacing */}
              <Button
                variant="outline"
                disabled={true}
                className="flex items-center gap-2 invisible"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button> 
            </div>
          </CardHeader>
          <CardContent>
            {/* Campaign Totals Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Campaign Overview</h3>
              
              {/* Main Layout: 4 cards on left, 1 large card on right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: 4 metric cards in 2x2 grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex flex-col justify-center items-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{campaignTotals.totalInfluencers}</div>
                      <div className="text-base text-gray-600 text-center">Influencers</div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex flex-col justify-center items-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">{campaignTotals.totalVideos}</div>
                      <div className="text-base text-gray-600 text-center">Total Videos</div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex flex-col justify-center items-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">{formatViews(campaignTotals.totalViews)}</div>
                      <div className="text-base text-gray-600 text-center">Total Views</div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex flex-col justify-center items-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">{formatViews(campaignTotals.overallMedianViews)}</div>
                      <div className="text-base text-gray-600 text-center">Median Views</div>
                    </div>
                  </div>
                </div>

                {/* Right side: Large video status distribution card */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
                    <h4 className="font-medium text-gray-800 mb-4 text-center">Video Status Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(campaignTotals.statusCounts).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{count} video{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                      {Object.keys(campaignTotals.statusCounts).length === 0 && (
                        <div className="text-sm text-gray-500 italic text-center">No videos found</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Select
                  value={statusFilter}
                  onValueChange={(value: VideoStatus | 'All') => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by video status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddInfluencer}>Add New Influencer</Button>
            </div>
            
            {/* Active filters indicator */}
            {(statusFilter as string) !== 'All' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <span className="font-medium">Active filters:</span>
                    {(statusFilter as string) !== 'All' && (
                      <span className="bg-blue-100 px-2 py-1 rounded">
                        Status: {statusFilter}
                      </span>
                    )}
                    <span className="text-blue-600">
                      ({filteredRecords.length} of {influencers.length} shown)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('All')
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
            
            <Table>
              <TableCaption>
                Campaign performance records and analytics.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead className="text-right">Views Median</TableHead>
                  <TableHead className="text-right">Total Views</TableHead>
                  <TableHead className="text-right">Views Now</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <>
                    <TableRow key={record.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(record.id)}
                          className="p-0 h-6 w-6"
                        >
                          {expandedRows.has(record.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      
                      {/* Username - with edit icon */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isFieldEditing(record.id, 'username', 'field') ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={record.username || ''}
                                onChange={(e) => updateInfluencerField(record.id, 'username', e.target.value)}
                                className="text-sm w-40 h-6"
                                onBlur={() => toggleFieldEdit(record.id, 'username', 'field')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    toggleFieldEdit(record.id, 'username', 'field')
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="w-40 flex items-center gap-2">
                              <span className="w-32 overflow-hidden text-ellipsis whitespace-nowrap font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
                                    onClick={() => toggleFieldEdit(record.id, 'username', 'field')}>
                                {record.username || 'Unknown'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFieldEdit(record.id, 'username', 'field')}
                                className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Link - with edit icon */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isFieldEditing(record.id, 'link', 'field') ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={record.link || ''}
                                onChange={(e) => updateInfluencerField(record.id, 'link', e.target.value)}
                                className="text-sm w-56 h-6"
                                onBlur={() => toggleFieldEdit(record.id, 'link', 'field')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    toggleFieldEdit(record.id, 'link', 'field')
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <a 
                                href={record.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-56 h-6 text-blue-600 hover:text-blue-800 underline truncate block text-sm"
                              >
                                {record.link || 'No link'}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFieldEdit(record.id, 'link', 'field')}
                                className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(record.platforms || []).map((platform, index) => (
                            <span 
                              key={index}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(platform)}`}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatViews(record.views_median || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatViews(record.total_views || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatViews(record.views_now || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInfluencer(record.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 mx-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(record.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <div className="bg-gray-50 p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-sm">Videos for {record.username || 'Unknown'}</h4>
                              <Button
                                size="sm"
                                onClick={() => handleAddVideo(record.id)}
                                className="flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Video
                              </Button>
                            </div>
                            <div className="w-full overflow-x-auto">
                              <Table className="w-full">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-16">ID</TableHead>
                                    <TableHead className="w-48">Link</TableHead>
                                    <TableHead className="w-20">Views</TableHead>
                                    <TableHead className="w-24">Platform</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead className="w-28">Posted On</TableHead>
                                    <TableHead className="w-16 text-center">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(record.videos || []).map((video) => (
                                    <TableRow key={video.id}>
                                      <TableCell className="font-mono text-xs w-16">
                                        {video.id.length > 6 ? `${video.id.slice(0, 4)}...${video.id.slice(-2)}` : video.id}
                                      </TableCell>
                                      
                                      {/* Link - with edit icon */}
                                      <TableCell className="w-48">
                                        <div className="flex items-center gap-2 w-full">
                                          {isFieldEditing(record.id, video.id, 'link') ? (
                                            <div className="flex items-center gap-1 w-full">
                                              <Input
                                                value={video.link}
                                                onChange={(e) => updateVideoField(video.id, 'link', e.target.value)}
                                                className="text-sm h-6 w-28 px-1"
                                                onBlur={() => toggleFieldEdit(record.id, video.id, 'link')}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                                    toggleFieldEdit(record.id, video.id, 'link')
                                                  }
                                                }}
                                                autoFocus
                                              />
                                            </div>
                                          ) : (
                                            <>
                                              <a 
                                                href={video.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-40 text-blue-600 hover:text-blue-800 underline truncate block text-sm"
                                                title={video.link}
                                              >
                                                {video.link}
                                              </a>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleFieldEdit(record.id, video.id, 'link')}
                                                className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer flex-shrink-0"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </TableCell>

                                      {/* Views - click to edit */}
                                      <TableCell className="w-20">
                                        {isFieldEditing(record.id, video.id, 'views') ? (
                                          <Input
                                            type="number"
                                            value={video.views}
                                            onChange={(e) => updateVideoField(video.id, 'views', parseInt(e.target.value) || 0)}
                                            className="text-sm w-20 h-6 px-1"
                                            onBlur={() => toggleFieldEdit(record.id, video.id, 'views')}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === 'Escape') {
                                                toggleFieldEdit(record.id, video.id, 'views')
                                              }
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <div className="w-20 flex items-center justify-start h-6">
                                            <span 
                                              className="font-mono text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
                                              onClick={() => toggleFieldEdit(record.id, video.id, 'views')}
                                            >
                                              {formatViews(video.views || 0)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleFieldEdit(record.id, video.id, 'views')}
                                              className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </TableCell>
                                      
                                      {/* Platform - direct select */}
                                      <TableCell className="w-24">
                                        <Select
                                          value={video.platform}
                                          onValueChange={(value: string) => updateVideoField(video.id, 'platform', value)}
                                        >
                                          <SelectTrigger className={`w-fit h-fit flex items-center gap-0 px-1 py-0 rounded-full cursor-pointer ${getPlatformColor(video.platform)}`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-transparent shadow-none border-none px-2 py-0">
                                            {platformOptions.map((platform) => (
                                              <SelectItem
                                               key={platform} 
                                               value={platform}
                                               className={
                                                cn(`w-24 h-fit flex flex-1 items-center justify-center gap-2 px-3 py-0 mb-2`,
                                                 `rounded-full text-xs font-medium shadow-md cursor-pointer ${getPlatformColor(platform)}`,
                                                 `hover:shadow-lg hover:scale-105 hover:${getPlatformBgColor(platform)} transition-all duration-200`,
                                                 `data-[highlighted]:shadow-lg data-[highlighted]:scale-105 data-[highlighted]:${getPlatformBgColor(platform)}`,
                                                 `focus:${getPlatformBgColor(platform)} data-[state=checked]:${getPlatformBgColor(platform)}`
                                                )}
                                               >
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(platform)}`}>
                                                  {platform}
                                                </span>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      
                                      {/* Status - direct select */}
                                      <TableCell className="w-28">
                                        <Select
                                          value={video.status}
                                          onValueChange={(value: string) => updateVideoField(video.id, 'status', value)}
                                        >
                                          <SelectTrigger className={`w-fit h-fit flex items-center gap-0 px-1 py-0 rounded-full cursor-pointer ${getStatusColor(video.status)}`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-transparent shadow-none border-none px-2 py-0">
                                            {statusOptions.map((status) => (
                                              <SelectItem
                                               key={status} 
                                               value={status}
                                               className={
                                                cn(`w-32 h-fit flex flex-1 items-center justify-center gap-2 px-3 py-0 mb-2`,
                                                 `rounded-full text-xs font-medium shadow-md cursor-pointer ${getStatusBgColor(status)}`,
                                                 `hover:shadow-lg hover:scale-105 hover:${getStatusBgColor(status)} transition-all duration-200`,
                                                 `data-[highlighted]:shadow-lg data-[highlighted]:scale-105 data-[highlighted]:${getStatusBgColor(status)}`,
                                                 `focus:${getStatusBgColor(status)} data-[state=checked]:${getStatusBgColor(status)}`
                                                )}
                                               >
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                                  {status}
                                                </span>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      
                                      {/* Posted On - click to edit */}
                                      <TableCell className="w-32 p-0 flex justify-end">
                                        {isFieldEditing(record.id, video.id, 'posted_on') ? (
                                          <Input
                                            type="date"
                                            value={video.posted_on || ''}
                                            onChange={(e) => updateVideoField(video.id, 'posted_on', e.target.value)}
                                            className="text-sm h-6 w-30 px-1"
                                            onBlur={() => toggleFieldEdit(record.id, video.id, 'posted_on')}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === 'Escape') {
                                                toggleFieldEdit(record.id, video.id, 'posted_on')
                                              }
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <div className="w-32 h-6 flex items-center gap-2">
                                            <span 
                                              className="w-24 text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
                                              onClick={() => toggleFieldEdit(record.id, video.id, 'posted_on')}
                                            >
                                              {video.posted_on || 'Not set'}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleFieldEdit(record.id, video.id, 'posted_on')}
                                              className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </TableCell>

                                      {/* Actions */}
                                      <TableCell className="text-center w-16">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteVideo(video.id)}
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 mx-auto"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            
            {filteredRecords.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                {(statusFilter as string) !== 'All' ? (
                  <div className="space-y-2">
                    <p className="text-gray-500">
                      No influencers found matching your filters
                    </p>
                    <div className="text-sm text-gray-400">
                      {(statusFilter as string) !== 'All' && <span>Status: {statusFilter}</span>}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setStatusFilter('All')
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-500">No influencers found for this campaign.</p>
                    <p className="text-sm text-gray-400">The campaign might be empty or there could be a connection issue.</p>
                    <Button 
                      variant="outline" 
                      onClick={clearErrorAndRetry}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Loading
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Video Dialog */}
        <Dialog open={isAddVideoDialogOpen} onOpenChange={setIsAddVideoDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>
                Add a new video for this influencer. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            
            {/* General Error Alert */}
            {formErrors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="video-link" className="text-right pt-2">
                  Link <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <Input
                    id="video-link"
                    value={newVideo.link || ''}
                    onChange={(e) => handleFieldChange('link', e.target.value)}
                    className={cn(
                      "w-full",
                      formErrors.link && "border-red-500 focus-visible:ring-red-500"
                    )}
                    placeholder="https://youtube.com/watch?v=..."
                    onBlur={() => handleFieldBlur('link')}
                  />
                  {formErrors.link && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.link}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="video-platform" className="text-right pt-2">
                  Platform
                </label>
                <div className="col-span-3">
                  <Select
                    value={newVideo.platform}
                    onValueChange={(value) => handleFieldChange('platform', value as Platform)}
                  >
                    <SelectTrigger className={cn(
                      "w-full",
                      formErrors.platform && "border-red-500 focus-visible:ring-red-500"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.platform && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.platform}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="video-status" className="text-right pt-2">
                  Status
                </label>
                <div className="col-span-3">
                  <Select
                    value={newVideo.status}
                    onValueChange={(value) => handleFieldChange('status', value as VideoStatus)}
                  >
                    <SelectTrigger className={cn(
                      "w-full",
                      formErrors.status && "border-red-500 focus-visible:ring-red-500"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.status && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.status}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="video-views" className="text-right pt-2">
                  Views
                </label>
                <div className="col-span-3">
                  <Input
                    id="video-views"
                    type="number"
                    value={newVideo.views || 0}
                    onChange={(e) => handleFieldChange('views', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full",
                      formErrors.views && "border-red-500 focus-visible:ring-red-500"
                    )}
                    min="0"
                    onBlur={() => handleFieldBlur('views')}
                  />
                  {formErrors.views && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.views}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="video-posted-on" className="text-right pt-2">
                  Posted On
                </label>
                <div className="col-span-3">
                  <Input
                    id="video-posted-on"
                    type="date"
                    value={newVideo.posted_on || ''}
                    onChange={(e) => handleFieldChange('posted_on', e.target.value)}
                    className={cn(
                      "w-full",
                      formErrors.posted_on && "border-red-500 focus-visible:ring-red-500"
                    )}
                    onBlur={() => handleFieldBlur('posted_on')}
                  />
                  {formErrors.posted_on && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.posted_on}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddVideoDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveVideo} 
                disabled={isSubmitting || !newVideo.link?.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Video'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Video Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Video</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this video? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteVideo} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Video'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Influencer Dialog */}
        <Dialog open={isAddInfluencerDialogOpen} onOpenChange={setIsAddInfluencerDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Influencer</DialogTitle>
              <DialogDescription>
                Add a new influencer to this campaign. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            
            {/* General Error Alert */}
            {formErrors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="influencer-username" className="text-right pt-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <Input
                    id="influencer-username"
                    value={newInfluencer.username || ''}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, username: e.target.value }))}
                    className={cn(
                      "w-full",
                      formErrors.username && "border-red-500 focus-visible:ring-red-500"
                    )}
                    placeholder="@username"
                  />
                  {formErrors.username && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.username}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="influencer-link" className="text-right pt-2">
                  Link <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <Input
                    id="influencer-link"
                    value={newInfluencer.link || ''}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, link: e.target.value }))}
                    className={cn(
                      "w-full",
                      formErrors.link && "border-red-500 focus-visible:ring-red-500"
                    )}
                    placeholder="https://instagram.com/username"
                  />
                  {formErrors.link && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.link}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddInfluencerDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveInfluencer} 
                disabled={isSubmitting || !newInfluencer.username?.trim() || !newInfluencer.link?.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Influencer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Influencer Dialog */}
        <Dialog open={isDeleteInfluencerDialogOpen} onOpenChange={setIsDeleteInfluencerDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Influencer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this influencer and all their videos? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteInfluencerDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteInfluencer} disabled={isDeletingInfluencer}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeletingInfluencer ? 'Deleting...' : 'Delete Influencer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  } catch (renderError) {
    console.error('Error rendering CampaignsPage:', renderError)
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Rendering Error</p>
                  <p className="text-sm">Something went wrong while displaying the page. Please refresh to try again.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="mt-2"
                  >
                    Refresh Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }
} 