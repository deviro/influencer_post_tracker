import { useState } from 'react'
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

interface Influencer {
  id: number
  name: string
  platform: string
  followers: number
  engagement: string
  lastPost: string
}

const sampleData: Influencer[] = [
  {
    id: 1,
    name: "Tech Reviewer Pro",
    platform: "YouTube",
    followers: 1250000,
    engagement: "4.2%",
    lastPost: "2 hours ago"
  },
  {
    id: 2,
    name: "Lifestyle Guru",
    platform: "Instagram",
    followers: 890000,
    engagement: "6.8%",
    lastPost: "5 hours ago"
  },
  {
    id: 3,
    name: "Gaming Master",
    platform: "Twitch",
    followers: 567000,
    engagement: "8.1%",
    lastPost: "1 day ago"
  },
  {
    id: 4,
    name: "Fitness Coach",
    platform: "TikTok",
    followers: 2100000,
    engagement: "5.3%",
    lastPost: "3 hours ago"
  },
  {
    id: 5,
    name: "Food Blogger",
    platform: "Instagram",
    followers: 445000,
    engagement: "7.2%",
    lastPost: "6 hours ago"
  }
]

function App() {
  const [influencers] = useState<Influencer[]>(sampleData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count.toString()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Influencer Post Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Search influencers or platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button>Add New Influencer</Button>
          </div>
          
          <Table>
            <TableCaption>
              A list of tracked influencers and their posting activity.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="text-center">Engagement</TableHead>
                <TableHead className="text-center">Last Post</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInfluencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell className="font-medium">{influencer.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {influencer.platform}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatFollowers(influencer.followers)}
                  </TableCell>
                  <TableCell className="text-center">{influencer.engagement}</TableCell>
                  <TableCell className="text-center">{influencer.lastPost}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInfluencers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No influencers found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
