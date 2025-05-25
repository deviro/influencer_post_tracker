import { useEffect } from 'react'
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCampaignStore } from '../store/campaignStore'

export function HomePage() {
  const {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    setCurrentCampaignId
  } = useCampaignStore()

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCampaignClick = (campaignId: string) => {
    setCurrentCampaignId(campaignId)
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
            <Button>Create New Campaign</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link 
                    to="/campaigns" 
                    className="block"
                    onClick={() => handleCampaignClick(campaign.id)}
                  >
                    <h3 className="text-lg font-semibold text-center hover:text-blue-600 transition-colors">
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
    </div>
  )
} 