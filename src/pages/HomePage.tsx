import { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Save, AlertCircle, Plus, Trash2 } from "lucide-react"
import { cn } from '@/lib/utils'
import { useCampaignStore } from '../store/campaignStore'
import { type CreateCampaign, CreateCampaignSchema } from '../lib/schemas'

// Form validation state interface
interface FormErrors {
  name?: string
  description?: string
  start_date?: string
  end_date?: string
  budget?: string
  general?: string
}

export function HomePage() {
  const {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    setCurrentCampaignId,
    createCampaign,
    deleteCampaign
  } = useCampaignStore()

  const { toast } = useToast()

  // Create campaign dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState<Partial<CreateCampaign>>({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    budget: null,
    status: 'Active'
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})

  // Delete campaign dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCampaignClick = (campaignId: string) => {
    setCurrentCampaignId(campaignId)
  }

  // Validation functions
  const validateField = (field: keyof CreateCampaign, value: any): string | undefined => {
    try {
      switch (field) {
        case 'name':
          if (!value || value.trim() === '') {
            return 'Campaign name is required'
          }
          if (value.trim().length < 2) {
            return 'Campaign name must be at least 2 characters'
          }
          break
        case 'start_date':
          if (value && value.trim() !== '') {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              return 'Must be a valid date'
            }
          }
          break
        case 'end_date':
          if (value && value.trim() !== '') {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              return 'Must be a valid date'
            }
            if (newCampaign.start_date && date <= new Date(newCampaign.start_date)) {
              return 'End date must be after start date'
            }
          }
          break
        case 'budget':
          if (value !== null && value !== undefined && value !== '') {
            const numValue = Number(value)
            if (isNaN(numValue) || numValue < 0) {
              return 'Budget must be a positive number'
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
      if (!newCampaign.name || newCampaign.name.trim() === '') {
        errors.name = 'Campaign name is required'
      } else {
        const nameError = validateField('name', newCampaign.name)
        if (nameError) errors.name = nameError
      }

      // Validate dates
      if (newCampaign.start_date) {
        const startDateError = validateField('start_date', newCampaign.start_date)
        if (startDateError) errors.start_date = startDateError
      }

      if (newCampaign.end_date) {
        const endDateError = validateField('end_date', newCampaign.end_date)
        if (endDateError) errors.end_date = endDateError
      }

      // Validate budget
      if (newCampaign.budget !== null && newCampaign.budget !== undefined) {
        const budgetError = validateField('budget', newCampaign.budget)
        if (budgetError) errors.budget = budgetError
      }

      // Validate using Zod schema
      try {
        const campaignData: CreateCampaign = {
          name: newCampaign.name!.trim(),
          description: newCampaign.description?.trim() || null,
          start_date: newCampaign.start_date || null,
          end_date: newCampaign.end_date || null,
          budget: newCampaign.budget || null,
          status: newCampaign.status || 'Active'
        }
        CreateCampaignSchema.parse(campaignData)
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
    } catch (error) {
      console.error('Unexpected error in form validation:', error)
      errors.general = 'An unexpected error occurred during validation'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFieldChange = (field: keyof CreateCampaign, value: any) => {
    setNewCampaign(prev => ({ ...prev, [field]: value }))
    
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

  const handleFieldBlur = (field: keyof CreateCampaign) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = newCampaign[field]
    const error = validateField(field, value)
    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleCreateCampaign = () => {
    setNewCampaign({
      name: '',
      description: '',
      start_date: null,
      end_date: null,
      budget: null,
      status: 'Active'
    })
    setFormErrors({})
    setTouched({})
    setIsCreateDialogOpen(true)
  }

  const handleSaveCampaign = async () => {
    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const campaignData: CreateCampaign = {
        name: newCampaign.name!.trim(),
        description: newCampaign.description?.trim() || null,
        start_date: newCampaign.start_date || null,
        end_date: newCampaign.end_date || null,
        budget: newCampaign.budget || null,
        status: newCampaign.status || 'Active'
      }

      const result = await createCampaign(campaignData)
      
      if (result.success) {
        setIsCreateDialogOpen(false)
        setNewCampaign({
          name: '',
          description: '',
          start_date: null,
          end_date: null,
          budget: null,
          status: 'Active'
        })
        setFormErrors({})
        setTouched({})
        
        toast({
          title: 'Success',
          description: 'Campaign created successfully',
        })
      } else {
        setFormErrors({ 
          general: result.error || 'Failed to create campaign. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      setFormErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCampaign = (campaignId: string, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation
    event.stopPropagation() // Prevent event bubbling
    setCampaignToDelete(campaignId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteCampaign(campaignToDelete)
      
      if (result.success) {
        setIsDeleteDialogOpen(false)
        setCampaignToDelete(null)
        toast({
          title: 'Success',
          description: 'Campaign deleted successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete campaign',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Influencer Post Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading campaigns...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Influencer Post Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Influencer Post Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            Track and manage your influencer marketing campaigns in one place.
          </div>
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Campaigns</h2>
            <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer relative">
                <CardContent className="p-6">
                  {/* Delete button in top right corner */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <Link 
                    to="/campaigns" 
                    className="block"
                    onClick={(e) => handleCampaignClick(campaign.id)}
                  >
                    <h3 className="text-lg font-semibold text-center hover:text-blue-600 transition-colors pr-8">
                      {campaign.name}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      <div>Status: {campaign.status}</div>
                      {campaign.description && (
                        <div className="mt-1 text-xs">{campaign.description}</div>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaigns found. Create your first campaign to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new influencer marketing campaign. Fill in the details below.
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
              <label htmlFor="campaign-name" className="text-right pt-2">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="col-span-3">
                <Input
                  id="campaign-name"
                  value={newCampaign.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={cn(
                    "w-full",
                    formErrors.name && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Enter campaign name"
                  onBlur={() => handleFieldBlur('name')}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="campaign-description" className="text-right pt-2">
                Description
              </label>
              <div className="col-span-3">
                <Textarea
                  id="campaign-description"
                  value={newCampaign.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className={cn(
                    "w-full",
                    formErrors.description && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Enter campaign description (optional)"
                  rows={3}
                  onBlur={() => handleFieldBlur('description')}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="campaign-start-date" className="text-right pt-2">
                Start Date
              </label>
              <div className="col-span-3">
                <Input
                  id="campaign-start-date"
                  type="date"
                  value={newCampaign.start_date || ''}
                  onChange={(e) => handleFieldChange('start_date', e.target.value)}
                  className={cn(
                    "w-full",
                    formErrors.start_date && "border-red-500 focus-visible:ring-red-500"
                  )}
                  onBlur={() => handleFieldBlur('start_date')}
                />
                {formErrors.start_date && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.start_date}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="campaign-end-date" className="text-right pt-2">
                End Date
              </label>
              <div className="col-span-3">
                <Input
                  id="campaign-end-date"
                  type="date"
                  value={newCampaign.end_date || ''}
                  onChange={(e) => handleFieldChange('end_date', e.target.value)}
                  className={cn(
                    "w-full",
                    formErrors.end_date && "border-red-500 focus-visible:ring-red-500"
                  )}
                  onBlur={() => handleFieldBlur('end_date')}
                />
                {formErrors.end_date && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.end_date}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="campaign-budget" className="text-right pt-2">
                Budget
              </label>
              <div className="col-span-3">
                <Input
                  id="campaign-budget"
                  type="number"
                  value={newCampaign.budget || ''}
                  onChange={(e) => handleFieldChange('budget', parseFloat(e.target.value) || null)}
                  className={cn(
                    "w-full",
                    formErrors.budget && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Enter budget amount (optional)"
                  min="0"
                  step="0.01"
                  onBlur={() => handleFieldBlur('budget')}
                />
                {formErrors.budget && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.budget}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCampaign} 
              disabled={isSubmitting || !newCampaign.name?.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign and all its influencers and videos? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCampaign} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 