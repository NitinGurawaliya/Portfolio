"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectIcon } from "@/components/ui/project-icon"
import { motion } from "framer-motion"
import { 
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface DailyData {
  date: string
  count: number
}

interface ProjectStats {
  projectId: number
  projectName: string
  clickCount: number
  lastClicked: string
}

interface SocialStats {
  socialType: string
  socialUrl: string
  clickCount: number
  lastClicked: string
}

interface TimeSpentStats {
  average: number
  totalSessions: number
  validSessions: number
}

interface DetailedAnalytics {
  projects: ProjectStats[]
  socials: SocialStats[]
  timeSpent: TimeSpentStats
}

interface AnalyticsData {
  totalViews: number
  lastViewedAt: string | null
  dailyData: DailyData[]
  detailed?: DetailedAnalytics
}

interface AnalyticsSectionProps {
  portfolioId: number
  analyticsData?: AnalyticsData | null
  selectedRepos?: number[]
  importedProjects?: any[]
  customNames?: Record<number, string>
  customDescriptions?: Record<number, string>
}

export function AnalyticsSection({ portfolioId, analyticsData, selectedRepos, importedProjects, customNames, customDescriptions }: AnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(analyticsData || null)
  const [loading, setLoading] = useState(!analyticsData)
  const [hoveredDay, setHoveredDay] = useState<{date: string, count: number, x: number, y: number} | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const heatmapRef = useRef<HTMLDivElement>(null)

  const projectsPerPage = 5

  // Debug logging
  console.log("🔍 AnalyticsSection Debug:")
  console.log("📊 selectedRepos:", selectedRepos)
  console.log("📊 selectedRepos length:", selectedRepos?.length)
  console.log("📊 importedProjects:", importedProjects)
  console.log("📊 importedProjects length:", importedProjects?.length)
  console.log("📊 customNames:", customNames)
  console.log("📊 customDescriptions:", customDescriptions)

  useEffect(() => {
    if (analyticsData) {
      setAnalytics(analyticsData)
      setLoading(false)
    } else if (portfolioId > 0) {
      fetchAnalytics()
    }
  }, [portfolioId, analyticsData])

  const fetchAnalytics = async () => {
    try {
      console.log("🔍 Fetching analytics for portfolio:", portfolioId)
      
      // Fetch basic analytics
      const response = await fetch(`/api/analytics/stats?portfolioId=${portfolioId}`)
      const data = await response.json()
      
      // Fetch detailed analytics
      const detailedResponse = await fetch(`/api/analytics/detailed?portfolioId=${portfolioId}`)
      const detailedData = await detailedResponse.json()
      
      const combinedData = {
        ...data,
        detailed: detailedData
      }
      
      console.log("🔍 DEBUG: Analytics data received:", combinedData)
      console.log("🔍 DEBUG: Detailed analytics:", detailedData)
      console.log("🔍 DEBUG: Projects data:", detailedData.projects)
      console.log("🔍 DEBUG: Socials data:", detailedData.socials)
      console.log("🔍 DEBUG: Time spent data:", detailedData.timeSpent)
      setAnalytics(combinedData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-gray-200 hover:bg-gray-300"
    if (count === 1) return "bg-green-200 hover:bg-green-300"
    if (count === 2) return "bg-green-300 hover:bg-green-400"
    if (count >= 3 && count < 5) return "bg-green-400 hover:bg-green-500"
    if (count >= 5 && count < 10) return "bg-green-500 hover:bg-green-600"
    return "bg-green-600 hover:bg-green-700"
  }

  const getTooltipData = (date: string, count: number) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
    return `${count} ${count === 1 ? 'view' : 'views'} on ${formattedDate}`
  }

  const handleDayHover = (event: React.MouseEvent, day: {date: string, count: number}) => {
    if (!day.date) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    
    setHoveredDay({
      date: day.date,
      count: day.count,
      x: rect.left + rect.width / 2,
      y: rect.top - 60 // Move further up to avoid covering the box
    })
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
  }

  const weeks = []
  if (analytics?.dailyData) {
    // console.log('📊 Analytics data received:', analytics.dailyData.length, 'days') // Disabled to reduce terminal noise
    // console.log('📅 First date:', analytics.dailyData[0]?.date) // Disabled to reduce terminal noise
    // console.log('📅 Last date:', analytics.dailyData[analytics.dailyData.length - 1]?.date) // Disabled to reduce terminal noise
    
    // Ensure we have exactly 365 days of data
    let dailyData = analytics.dailyData
    if (dailyData.length < 365) {
      // If we have less than 365 days, pad with empty days at the beginning
      const emptyDays = []
      for (let i = 0; i < 365 - dailyData.length; i++) {
        emptyDays.push({ date: '', count: 0 })
      }
      dailyData = [...emptyDays, ...dailyData]
      // console.log('📊 Padded data to 365 days') // Disabled to reduce terminal noise
    } else if (dailyData.length > 365) {
      // If we have more than 365 days, take the last 365
      dailyData = dailyData.slice(-365)
      // console.log('📊 Trimmed data to 365 days') // Disabled to reduce terminal noise
    }
    
    // console.log('📊 Final daily data:', dailyData.length, 'days') // Disabled to reduce terminal noise
    // console.log('📅 Final first date:', dailyData[0]?.date) // Disabled to reduce terminal noise
    // console.log('📅 Final last date:', dailyData[dailyData.length - 1]?.date) // Disabled to reduce terminal noise
    
    // Group into weeks (exactly 52 weeks for 365 days)
    for (let i = 0; i < 52; i++) {
      const week = []
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j
        if (dayIndex < dailyData.length) {
          week.push(dailyData[dayIndex])
        } else {
          // Add empty days for incomplete weeks
          week.push({ date: '', count: 0 })
        }
      }
      weeks.push(week)
    }
    console.log('📊 Generated weeks:', weeks.length, 'weeks with', weeks[0]?.length || 0, 'days per week')
    console.log('📊 Total boxes:', weeks.length * 7)
    
    // Scroll to current day (right side) when data is loaded
    if (heatmapRef.current) {
      setTimeout(() => {
        if (heatmapRef.current) {
          // Scroll to show current day area (accounting for 7 days advance)
          // Calculate approximate position for current day
          const advanceDays = 7
          const boxWidth = 13 // Approximate width per day box
          const scrollPosition = heatmapRef.current.scrollWidth - heatmapRef.current.clientWidth - (advanceDays * boxWidth)
          heatmapRef.current.scrollLeft = Math.max(0, scrollPosition)
          console.log("📊 Scrolled to current day area (with advance days), scrollLeft:", heatmapRef.current.scrollLeft)
        }
      }, 300) // Increased timeout to ensure data is fully rendered
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Analytics</h3>
          <p className="text-sm text-gray-500">Fetching your portfolio performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
      {/* Analytics Title */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-6 w-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Views</p>
                <p className="text-lg font-bold text-gray-900">{analytics?.totalViews || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Last Viewed</p>
                <p className="text-lg font-bold text-gray-900">
                  {analytics?.lastViewedAt 
                    ? new Date(analytics.lastViewedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Never'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-1">Activity (1 year)</p>
                <p className="text-lg font-bold text-gray-900">
                  {analytics?.dailyData?.filter(d => d.count > 0).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project Analytics - Stack Layout */}
      {(importedProjects && Array.isArray(importedProjects) && importedProjects.length > 0) || (selectedRepos && Array.isArray(selectedRepos) && selectedRepos.length > 0) ? (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-gray-300 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  Project Analytics
                </CardTitle>
                
                {/* Show All Dropdown */}
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {showAllProjects ? 'Show Less' : 'Show All'}
                  {showAllProjects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Stack Layout - Top to Bottom */}
              <div className="space-y-3">
                {(() => {
                  const allProjects = (importedProjects && importedProjects.length > 0 ? importedProjects : []).filter(repo => repo && repo.id)
                  const totalPages = Math.ceil(allProjects.length / projectsPerPage)
                  const startIndex = showAllProjects ? 0 : (currentPage - 1) * projectsPerPage
                  const endIndex = showAllProjects ? allProjects.length : startIndex + projectsPerPage
                  const projectsToShow = allProjects.slice(startIndex, endIndex)
                  
                  return (
                    <>
                      {projectsToShow.map((repo) => {
                        const projectName = customNames?.[repo.id] || repo.name || 'Project'
                        const projectDescription = customDescriptions?.[repo.id] || repo.description || 'No description available'
                        // Try to match by GitHub ID first, then by database ID
                        const clickCount = analytics?.detailed?.projects?.find(p => p.projectId === repo.id || p.projectId === repo.githubId)?.clickCount || 0
                        
                        // Debug project click matching
                        console.log(`🔍 DEBUG: Project ${projectName} (ID: ${repo.id}, GitHub ID: ${repo.githubId}):`, {
                          projectId: repo.id,
                          githubId: repo.githubId,
                          projectName: projectName,
                          clickCount: clickCount,
                          allProjects: analytics?.detailed?.projects,
                          matchingProject: analytics?.detailed?.projects?.find(p => p.projectId === repo.id || p.projectId === repo.githubId)
                        })
                        
                        return (
                          <div 
                            key={repo.id} 
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            {/* Project Row Layout */}
                            <div className="flex items-center gap-4">
                              {/* Actual Project Icon/Favicon using ProjectIcon component */}
                              <ProjectIcon
                                favicon={repo.favicon}
                                logo={repo.logo}
                                title={projectName || 'Project'}
                                size="lg"
                                className="flex-shrink-0"
                              />
                              
                              {/* Project Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                                      {projectName || 'Project'}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                                      {projectDescription}
                                    </p>
                                  </div>
                                  
                                  {/* Simple Click Count */}
                                  <div className="text-right ml-4">
                                    <div className="text-xs text-gray-500 font-medium">Times clicked</div>
                                    <div className="text-lg font-bold text-gray-900">{clickCount}</div>
                                  </div>
                                </div>
                                
                                {/* Technologies */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {repo?.language && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                      {repo.language}
                                    </span>
                                  )}
                                  {repo?.topics?.slice(0, 3).map((topic: string) => (
                                    <span key={topic} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Pagination Controls */}
                      {!showAllProjects && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm rounded-lg ${
                                  page === currentPage 
                                    ? 'bg-blue-100 text-blue-800 font-medium' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* No Projects Message */}
      {(!importedProjects || !Array.isArray(importedProjects) || importedProjects.length === 0) && (!selectedRepos || !Array.isArray(selectedRepos) || selectedRepos.length === 0) && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-gray-300 shadow-sm rounded-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Selected</h3>
                <p className="text-gray-500 text-sm mb-4">Add projects to your portfolio to see analytics</p>
                <p className="text-gray-400 text-xs">Go to the Repositories section to select projects</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Graph - Moved to Top */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white border border-gray-300 shadow-sm rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                1 Year Activity
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-sm"></div>
                  <div className="w-2 h-2 bg-green-300 rounded-sm"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-green-700 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div 
                className="flex gap-1 min-w-max scroll-smooth" 
                ref={heatmapRef}
                style={{ scrollBehavior: 'smooth' }}
              >
                 {weeks.map((week, weekIndex) => (
                   <div key={weekIndex} className="flex flex-col gap-1">
                     {week.map((day, dayIndex) => (
                       <div
                         key={`${day.date || `empty-${weekIndex}-${dayIndex}`}-${dayIndex}`}
                         className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)} cursor-pointer transition-all duration-150 hover:scale-110 hover:z-10 relative`}
                         onMouseEnter={(e) => handleDayHover(e, day)}
                         onMouseLeave={handleDayLeave}
                       />
                     ))}
                   </div>
                 ))}
              </div>
            </div>
            
            {/* Week labels */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Hover Tooltip */}
      {hoveredDay && (
        <div 
          className="fixed z-50 bg-white text-gray-900 text-sm rounded-lg px-4 py-3 shadow-2xl pointer-events-none border border-gray-200"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.1s ease-out',
            maxWidth: '220px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          <div className="font-bold text-gray-900 text-center text-base">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'view' : 'views'}
          </div>
          <div className="text-gray-600 text-sm mt-1 text-center font-medium">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          {/* Arrow pointing down to the box */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}

      </motion.div>
    </>
  )
}
