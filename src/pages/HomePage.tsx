import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Campaign {
  id: number
  name: string
  status: string
  influencers: number
  budget: string
  startDate: string
  endDate: string
}

const sampleCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Tech Review Campaign",
    status: "Active",
    influencers: 5,
    budget: "$15,000",
    startDate: "2024-06-01",
    endDate: "2024-08-31"
  },
  {
    id: 2,
    name: "Lifestyle Brand Awareness",
    status: "Planning",
    influencers: 3,
    budget: "$8,500",
    startDate: "2024-07-15",
    endDate: "2024-09-15"
  },
  {
    id: 3,
    name: "Gaming Product Launch",
    status: "Completed",
    influencers: 8,
    budget: "$25,000",
    startDate: "2024-03-01",
    endDate: "2024-05-31"
  },
  {
    id: 4,
    name: "Fitness Challenge Series",
    status: "Active",
    influencers: 4,
    budget: "$12,000",
    startDate: "2024-05-01",
    endDate: "2024-07-31"
  }
]

export function HomePage() {
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
            {sampleCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Link to="/campaigns" className="block">
                    <h3 className="text-lg font-semibold text-center hover:text-blue-600 transition-colors">
                      {campaign.name}
                    </h3>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 