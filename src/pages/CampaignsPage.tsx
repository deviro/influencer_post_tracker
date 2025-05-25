import { useState } from 'react'
import { Link } from "react-router-dom"
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
import { ChevronDown, ChevronRight, Edit, Pencil, Save, SquarePen, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

interface Video {
  id: number
  link: string
  platform: string
  status: string
  postedOn: string
  views: number
}

interface InfluencerData {
  id: number
  username: string
  link: string
  platforms: string[]
  viewsMedian: number
  totalViews: number
  viewsNow: number
  videos: Video[]
}

const sampleData: InfluencerData[] = [
  {
    id: 1,
    username: "@techreviewerpro",
    link: "https://youtube.com/watch?v=abc123",
    platforms: ["YouTube", "Instagram"],
    viewsMedian: 125000,
    totalViews: 1250000,
    viewsNow: 145000,
    videos: [
      { id: 1, link: "https://youtube.com/watch?v=abc123", platform: "YouTube", status: "Published", postedOn: "2024-01-15", views: 145000 },
      { id: 2, link: "https://youtube.com/watch?v=def456", platform: "YouTube", status: "Published", postedOn: "2024-01-10", views: 98000 },
      { id: 3, link: "https://instagram.com/p/tech789", platform: "Instagram", status: "Scheduled", postedOn: "2024-01-12", views: 87000 }
    ]
  },
  {
    id: 2,
    username: "@lifestyleguru",
    link: "https://instagram.com/p/def456",
    platforms: ["Instagram", "TikTok"],
    viewsMedian: 89000,
    totalViews: 890000,
    viewsNow: 92000,
    videos: [
      { id: 1, link: "https://instagram.com/p/def456", platform: "Instagram", status: "Published", postedOn: "2024-01-14", views: 92000 },
      { id: 2, link: "https://instagram.com/p/jkl012", platform: "Instagram", status: "Published", postedOn: "2024-01-12", views: 87000 },
      { id: 3, link: "https://tiktok.com/@lifestyleguru/video/abc123", platform: "TikTok", status: "Draft", postedOn: "2024-01-13", views: 156000 }
    ]
  },
  {
    id: 3,
    username: "@gamingmaster",
    link: "https://twitch.tv/videos/ghi789",
    platforms: ["Twitch", "YouTube"],
    viewsMedian: 56700,
    totalViews: 567000,
    viewsNow: 58200,
    videos: [
      { id: 1, link: "https://twitch.tv/videos/ghi789", platform: "Twitch", status: "Live", postedOn: "2024-01-13", views: 58200 },
      { id: 2, link: "https://twitch.tv/videos/pqr123", platform: "Twitch", status: "Published", postedOn: "2024-01-11", views: 54000 },
      { id: 3, link: "https://youtube.com/watch?v=gaming456", platform: "YouTube", status: "Published", postedOn: "2024-01-09", views: 61000 }
    ]
  },
  {
    id: 4,
    username: "@fitnesscoach",
    link: "https://tiktok.com/@fitnesscoach/video/jkl012",
    platforms: ["TikTok", "Instagram", "YouTube"],
    viewsMedian: 210000,
    totalViews: 2100000,
    viewsNow: 225000,
    videos: [
      { id: 1, link: "https://tiktok.com/@fitnesscoach/video/jkl012", platform: "TikTok", status: "Published", postedOn: "2024-01-16", views: 225000 },
      { id: 2, link: "https://instagram.com/p/fitness789", platform: "Instagram", status: "Scheduled", postedOn: "2024-01-14", views: 198000 },
      { id: 3, link: "https://youtube.com/watch?v=workout123", platform: "YouTube", status: "Under Review", postedOn: "2024-01-12", views: 234000 }
    ]
  },
  {
    id: 5,
    username: "@foodblogger",
    link: "https://instagram.com/p/mno345",
    platforms: ["Instagram"],
    viewsMedian: 44500,
    totalViews: 445000,
    viewsNow: 47200,
    videos: [
      { id: 1, link: "https://instagram.com/p/mno345", platform: "Instagram", status: "Published", postedOn: "2024-01-15", views: 47200 },
      { id: 2, link: "https://instagram.com/p/bcd678", platform: "Instagram", status: "Published", postedOn: "2024-01-13", views: 42000 },
      { id: 3, link: "https://instagram.com/p/efg901", platform: "Instagram", status: "Archived", postedOn: "2024-01-10", views: 46800 }
    ]
  }
]

const statusOptions = ["Published", "Scheduled", "Draft", "Live", "Under Review", "Archived"]
const platformOptions = ["YouTube", "Instagram", "TikTok", "Twitch"]

export function CampaignsPage() {
  const [records, setRecords] = useState<InfluencerData[]>(sampleData)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [editingFields, setEditingFields] = useState<{[key: string]: boolean}>({})

  const filteredRecords = records.filter(record =>
    record.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.platforms.some(platform => platform.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count.toString()
  }

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  const updateVideo = (influencerId: number, videoId: number, field: keyof Video, value: any) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === influencerId
          ? {
              ...record,
              videos: record.videos.map(video =>
                video.id === videoId
                  ? { ...video, [field]: value }
                  : video
              )
            }
          : record
      )
    )
  }

  const toggleFieldEdit = (influencerId: number, videoId: number, field: string) => {
    const key = `${influencerId}-${videoId}-${field}`
    setEditingFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isFieldEditing = (influencerId: number, videoId: number, field: string) => {
    const key = `${influencerId}-${videoId}-${field}`
    return editingFields[key] || false
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "bg-red-100 text-red-800"
      case "Instagram":
        return "bg-pink-100 text-pink-800"
      case "TikTok":
        return "bg-purple-100 text-purple-800"
      case "Twitch":
        return "bg-indigo-100 text-indigo-800"
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
        return "bg-red-100"
      case "Instagram":
        return "bg-pink-100"
      case "TikTok":
        return "bg-purple-100"
      case "Twitch":
        return "bg-indigo-100"
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Search by username or platform..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button>Add New Record</Button>
          </div>
          
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
                    <TableCell className="font-medium">{record.username}</TableCell>
                    <TableCell>
                      <a 
                        href={record.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                      >
                        {record.link}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {record.platforms.map((platform, index) => (
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
                      {formatViews(record.viewsMedian)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatViews(record.totalViews)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatViews(record.viewsNow)}
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(record.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-gray-50 p-4">
                          <h4 className="font-semibold mb-3 text-sm">Videos for {record.username}</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">ID</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Posted On</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {record.videos.map((video) => (
                                <TableRow key={video.id}>
                                  <TableCell className="font-mono text-sm">{video.id}</TableCell>
                                  
                                  {/* Link - with edit icon */}
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {isFieldEditing(record.id, video.id, 'link') ? (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            value={video.link}
                                            onChange={(e) => updateVideo(record.id, video.id, 'link', e.target.value)}
                                            className="text-sm w-56 h-6"
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
                                            className="w-56 h-6 text-blue-600 hover:text-blue-800 underline truncate block text-sm"
                                          >
                                            {video.link}
                                          </a>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFieldEdit(record.id, video.id, 'link')}
                                            className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Views - click to edit */}
                                  <TableCell>
                                    {isFieldEditing(record.id, video.id, 'views') ? (
                                      <Input
                                        type="number"
                                        value={video.views}
                                        onChange={(e) => updateVideo(record.id, video.id, 'views', parseInt(e.target.value) || 0)}
                                        className="text-sm w-24 h-6"
                                        onBlur={() => toggleFieldEdit(record.id, video.id, 'views')}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === 'Escape') {
                                            toggleFieldEdit(record.id, video.id, 'views')
                                          }
                                        }}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="flex items-center justify-start w-24 h-6">
                                        <span 
                                          className="w-16 h-fit flex items-center justify-center gap-1 font-mono text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
                                          onClick={() => toggleFieldEdit(record.id, video.id, 'views')}
                                        >
                                          {formatViews(video.views)}
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
                                  <TableCell>
                                    <Select
                                      value={video.platform}
                                      onValueChange={(value: string) => updateVideo(record.id, video.id, 'platform', value)}
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
                                  <TableCell className='!cursor-pointer'>
                                    <Select
                                      value={video.status}
                                      onValueChange={(value: string) => updateVideo(record.id, video.id, 'status', value)}
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
                                  <TableCell>
                                    {isFieldEditing(record.id, video.id, 'postedOn') ? (
                                      <Input
                                        type="date"
                                        value={video.postedOn}
                                        onChange={(e) => updateVideo(record.id, video.id, 'postedOn', e.target.value)}
                                        className="text-sm w-32 h-6 !p-0"
                                        onBlur={() => toggleFieldEdit(record.id, video.id, 'postedOn')}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === 'Escape') {
                                            toggleFieldEdit(record.id, video.id, 'postedOn')
                                          }
                                        }}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="w-32 h-6 flex items-center gap-2">
                                        <span 
                                          className="text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
                                          onClick={() => toggleFieldEdit(record.id, video.id, 'postedOn')}
                                        >
                                          {video.postedOn}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleFieldEdit(record.id, video.id, 'postedOn')}
                                          className="h-4 w-4 p-0 opacity-50 hover:opacity-100 cursor-pointer"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No records found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 