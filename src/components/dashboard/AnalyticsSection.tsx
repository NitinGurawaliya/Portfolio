"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { 
  BarChart3,
  Users,
  ExternalLink,
  Monitor,
  Globe,
  Eye,
  Smartphone,
  Laptop,
  Tablet,
  Circle
} from "lucide-react"
import { SiGooglechrome, SiFirefox, SiSafari, SiOpera, SiBrave, SiVivaldi } from "react-icons/si"
import { ProjectViewsChart } from "@/components/ProjectViewsChart"
import { TopReferrersList } from "./TopReferrersList"

// Browser icon component using react-icons
function getBrowserIcon(browser: string, size: string = "h-8 w-8") {
  const browserLower = browser.toLowerCase()
  
  // Firefox - Check first (not Chromium based)
  if (browserLower.includes('firefox')) {
    return <SiFirefox className={`${size} text-[#FF7139]`} />
  }
  
  // Safari - Check before Chrome
  if (browserLower.includes('safari')) {
    return <SiSafari className={`${size} text-[#007AFF]`} />
  }
  
  // Edge - Check before Chrome
  if (browserLower.includes('edge')) {
    return <SiOpera className={`${size} text-[#0078D4]`} />
  }
  
  // Opera - Check before Chrome
  if (browserLower.includes('opera')) {
    return <SiOpera className={`${size} text-[#FF1B2D]`} />
  }
  
  // Vivaldi - Check before Chrome
  if (browserLower.includes('vivaldi')) {
    return <SiVivaldi className={`${size} text-[#EF3939]`} />
  }
  
  // Brave - Check before Chrome
  if (browserLower.includes('brave')) {
    return <SiBrave className={`${size} text-[#FB542B]`} />
  }
  
  // Chrome - Check last (most common Chromium browser)
  if (browserLower.includes('chrome')) {
    return <SiGooglechrome className={`${size} text-[#4285F4]`} />
  }
  
  // Default globe icon
  return <Globe className={`${size} text-black`} />
}

interface DailyData {
  date: string
  count: number
}


interface AnalyticsData {
  totalViews: number
  lastViewedAt: string | null
  dailyData: DailyData[]
  uniqueVisitors?: number
  topReferrers?: Array<{ referrer: string, count: number }>
  topDevices?: Array<{ device: string, count: number }>
  topBrowsers?: Array<{ browser: string, count: number }>
}

interface AnalyticsSectionProps {
  portfolioId: number
  analyticsData?: AnalyticsData | null
}

interface DayAnalytics {
  totalViews: number
  topReferrers: Array<{ referrer: string, count: number }>
  topDevices: Array<{ device: string, count: number }>
  topBrowsers: Array<{ browser: string, count: number }>
}

export function AnalyticsSection({ portfolioId, analyticsData }: AnalyticsSectionProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(analyticsData || null)
  const [loading, setLoading] = useState(!analyticsData)
  const [hoveredDay, setHoveredDay] = useState<{date: string, count: number, x: number, top: number, dayData: DayAnalytics | null} | null>(null)
  const [loadingDayData, setLoadingDayData] = useState(false)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Set up real-time analytics updates via SSE
  useEffect(() => {
    if (!portfolioId || portfolioId <= 0) return

    console.log("🔌 Connecting to real-time analytics stream for portfolio:", portfolioId)
    
    // Connect to SSE stream
    const eventSource = new EventSource(`/api/analytics/realtime?portfolioId=${portfolioId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'connected') {
          console.log("✅ Connected to real-time analytics stream")
          return
        }

        // Handle analytics events
        if (data.event === 'view') {
          console.log("📊 Real-time view update:", data.data)
          
          // Update analytics state with new data
          setAnalytics(prev => {
            if (!prev) return prev
            
            // Increment total views
            const newTotalViews = data.data.totalViews
            
            // Update top referrers
            let newTopReferrers = [...(prev.topReferrers || [])]
            const referrerIndex = newTopReferrers.findIndex(r => r.referrer === data.data.referrer)
            if (referrerIndex >= 0) {
              newTopReferrers[referrerIndex].count++
            } else {
              newTopReferrers.push({ referrer: data.data.referrer, count: 1 })
            }
            newTopReferrers.sort((a, b) => b.count - a.count)
            
            // Update top devices
            let newTopDevices = [...(prev.topDevices || [])]
            const deviceIndex = newTopDevices.findIndex(d => d.device === data.data.device)
            if (deviceIndex >= 0) {
              newTopDevices[deviceIndex].count++
            } else {
              newTopDevices.push({ device: data.data.device, count: 1 })
            }
            newTopDevices.sort((a, b) => b.count - a.count)
            
            // Update top browsers
            let newTopBrowsers = [...(prev.topBrowsers || [])]
            const browserIndex = newTopBrowsers.findIndex(b => b.browser === data.data.browser)
            if (browserIndex >= 0) {
              newTopBrowsers[browserIndex].count++
            } else {
              newTopBrowsers.push({ browser: data.data.browser, count: 1 })
            }
            newTopBrowsers.sort((a, b) => b.count - a.count)
            
            // Update today's count in dailyData
            const today = new Date().toISOString().split('T')[0]
            const newDailyData = [...(prev.dailyData || [])]
            const todayIndex = newDailyData.findIndex(d => d.date === today)
            if (todayIndex >= 0) {
              newDailyData[todayIndex].count++
            } else {
              // Add new day if it doesn't exist
              newDailyData.push({ date: today, count: 1 })
              // Keep only last 365 days
              if (newDailyData.length > 365) {
                newDailyData.shift()
              }
            }
            
            return {
              ...prev,
              totalViews: newTotalViews,
              topReferrers: newTopReferrers,
              topDevices: newTopDevices,
              topBrowsers: newTopBrowsers,
              dailyData: newDailyData
            }
          })
          
          // Show notification animation on the stats cards
          const statsCard = document.querySelector('[data-stat="total-views"]')
          if (statsCard) {
            statsCard.classList.add('animate-pulse')
            setTimeout(() => {
              statsCard.classList.remove('animate-pulse')
            }, 1000)
          }
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("❌ SSE connection error:", error)
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("🔌 SSE connection closed")
      }
    }

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting from real-time analytics stream")
      eventSource.close()
    }
  }, [portfolioId])

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

  const fetchDayData = async (date: string) => {
    if (!date || !portfolioId) return null
    
    try {
      const response = await fetch(`/api/analytics/day-stats?portfolioId=${portfolioId}&date=${date}`)
      const dayData = await response.json()
      return dayData
    } catch (error) {
      console.error("Error fetching day data:", error)
      return null
    }
  }

  const handleDayHover = async (event: React.MouseEvent, day: {date: string, count: number}) => {
    if (!day.date) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    
    setHoveredDay({
      date: day.date,
      count: day.count,
      x: rect.left + rect.width / 2,
      top: rect.top, // Store the box's top position for reference
      dayData: null
    })
    
    // Fetch day data on hover
    setLoadingDayData(true)
    const dayData = await fetchDayData(day.date)
    
    setHoveredDay(prev => prev ? {
      ...prev,
      dayData
    } : null)
    
    setLoadingDayData(false)
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

  // Check if there's no data
  const hasNoData = !analytics || 
    (analytics.totalViews === 0 && 
     (!analytics.dailyData || analytics.dailyData.length === 0 || analytics.dailyData.every(d => d.count === 0)) &&
     (!analytics.topReferrers || analytics.topReferrers.length === 0) &&
     (!analytics.topDevices || analytics.topDevices.length === 0) &&
     (!analytics.topBrowsers || analytics.topBrowsers.length === 0))

  if (hasNoData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Analytics Title */}
        <Card className="bg-transparent shadow-none border-none py-0">
          <CardHeader className="pb-0 mb-0 pt-0">
            <CardTitle className="text-xl text-black font-bold flex items-center dark:text-white">
              Analytics and Insights
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Creative Empty State */}
        <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-background">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-full">
                <BarChart3 className="h-16 w-16 text-orange-600" />
              </div>
            </motion.div>

            {/* Message */}
            <div className="space-y-2">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-2xl font-bold text-gray-800 dark:text-white"
              >
                No Analytics Data Yet
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-gray-500 max-w-md"
              >
                Your portfolio analytics will appear here once people start visiting your portfolio. Share your portfolio link to start tracking visitors!
              </motion.p>
            </div>

            {/* Action Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex flex-wrap gap-3 justify-center mt-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Share your portfolio</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Get visitors</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">See insights</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
      {/* Analytics Title */}
      <Card className="bg-transparent shadow-none border-none py-0">
        <CardHeader className="pb-0 mb-0 pt-0">
          <CardTitle className="text-xl text-black font-bold flex items-center dark:text-white">
            Analytics and Insights
          </CardTitle>
        </CardHeader>
      </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 -mt-1 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card data-stat="total-views" className="shadow-sm border-gray-200 rounded-lg h-28 transition-all duration-300 bg-background">
            <CardContent className="p-4 h-full">
              <p className="text-xs text-gray-500 mb-2">Total Visits</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-black leading-none dark:text-white">{analytics?.totalViews || 0}</p>
                <div className="border-gray-900 rounded p-1.5">
                  <Eye className="h-5 w-5 text-black dark:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-gray-200 rounded-lg h-28 bg-background">
            <CardContent className="p-4 h-full">
              <p className="text-xs text-gray-500 mb-2">Unique Sources</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-black leading-none dark:text-white">{analytics?.topReferrers?.length || 0}</p>
                <div className="border-gray-900 rounded p-1.5">
                  <ExternalLink className="h-5 w-5 text-black dark:text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-gray-200 rounded-lg h-28 bg-background">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-gray-500">Top Device</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-black leading-none dark:text-white">{analytics?.topDevices?.[0]?.count || 0}</p>
                  {analytics?.topDevices?.[0]?.device && (
                    <p className="text-[10px] text-gray-400 mt-0.5 dark:text-white">
                      {analytics.topDevices[0].device}
                    </p>
                  )}
                </div>
                {(() => {
                  const device = analytics?.topDevices?.[0]?.device?.toLowerCase() || ''
                  
                  // Handle unknown devices
                  if (device === 'unknown' || !device) {
                    return (
                      <div className="border-gray-200 rounded p-1.5 dark:text-white">
                        <Circle className="h-5 w-5 text-gray-400" />
                      </div>
                    )
                  }
                  
                  const IconComponent = device.includes('iphone') ? Smartphone :
                    device.includes('ipad') || device.includes('tablet') || device.includes('android tablet') ? Tablet :
                    device.includes('android') || device.includes('mobile') ? Smartphone :
                    Laptop
                  return (
                    <div className="border-gray-200 rounded p-1.5">
                      <IconComponent className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-gray-200 rounded-lg h-28 bg-background">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-gray-500">Top Browser</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-black leading-none dark:text-white">{analytics?.topBrowsers?.[0]?.count || 0}</p>
                  {analytics?.topBrowsers?.[0]?.browser && (
                    <p className="text-[10px] text-gray-400 mt-0.5 dark:text-white">
                      {analytics.topBrowsers[0].browser}
                    </p>
                  )}
                </div>
                {(() => {
                  const browserValue = analytics?.topBrowsers?.[0]?.browser || ''
                  const browser = browserValue.toLowerCase()
                  
                  // Handle unknown browsers
                  if (browser === 'unknown' || !browser) {
                    return (
                      <div className="rounded p-1.5">
                        <Circle className="h-5 w-5 text-gray-400" />
                      </div>
                    )
                  }
                  
                  return (
                    <div className="rounded p-1.5">
                      {getBrowserIcon(browserValue, "h-5 w-5")}
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Graph and Top Referrers - Side by Side */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-4">
          {/* Heatmap - Left side */}
          <Card className="shadow-none border-none flex-1 bg-background">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-black font-bold flex items-center dark:text-white">
                    Visits over time
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
              <CardContent className="pt-4">
                <div
                  ref={heatmapRef}
                  className="w-full overflow-x-auto scrollbar-thin sm:scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div className="min-w-[680px]">
                    {/* Month labels row */}
                    <div className="mb-2 flex gap-1 pl-[42px]">
                      {weeks.map((week, weekIndex) => {
                        const firstDay = week.find(day => day.date)
                        if (!firstDay || !firstDay.date) return <div key={weekIndex} className="w-3" />
                        
                        const date = new Date(firstDay.date)
                        const month = date.toLocaleDateString("en-US", { month: "short" })
                        const weekStart = date.getDate()
                        const isFirstWeekOfMonth = weekStart <= 7
                        const shouldShowMonth = isFirstWeekOfMonth || weekIndex === 0
                        
                        return (
                          <div key={weekIndex} className="flex w-3 items-start justify-center">
                            {shouldShowMonth && (
                              <span className="whitespace-nowrap text-[10px] font-medium text-gray-500">
                                {month}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="flex items-start gap-1">
                      {/* Weekday labels - Left side */}
                      <div className="flex flex-col gap-1 pt-0.5">
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Sun</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Mon</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Tue</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Wed</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Thu</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Fri</span>
                        <span className="h-3 leading-none text-[10px] font-medium text-gray-500">Sat</span>
                      </div>
                      
                      {/* Heatmap grid */}
                      <div className="flex flex-1 gap-1 pb-1">
                        {weeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                              <div
                                key={`${day.date || `empty-${weekIndex}-${dayIndex}`}-${dayIndex}`}
                                className={`h-3 w-3 rounded-sm ${getHeatmapColor(day.count)} cursor-pointer transition-all duration-150 hover:scale-110 hover:z-10`}
                                onMouseEnter={(e) => handleDayHover(e, day)}
                                onMouseLeave={handleDayLeave}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Top Referrers - Right side */}
          {analytics?.topReferrers && analytics.topReferrers.length > 0 && (
            <div className="w-full xl:w-[30rem] max-w-full">
              <TopReferrersList referrers={analytics.topReferrers} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Hover Tooltip */}
      {hoveredDay && (
        <div 
          className="fixed z-50 bg-gray-800 text-white text-sm rounded-lg shadow-2xl pointer-events-none border border-gray-700"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.top - 12}px`, // Start from box top and go up 12px
            transform: 'translate(-50%, -100%)', // Center horizontally and move up by 100% of tooltip height
            animation: 'fadeIn 0.1s ease-out',
            minWidth: '220px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Date and Views */}
          <div className="px-4 pt-3 pb-2">
            <div className="text-gray-400 text-xs mb-1">
              {new Date(hoveredDay.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-600"></div>
              <span className="text-gray-300 text-xs">Visits</span>
              <span className="font-bold ml-auto">{hoveredDay.count}</span>
            </div>
          </div>

          {/* Day Data */}
          {loadingDayData ? (
            <div className="px-4 pb-3 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            </div>
          ) : hoveredDay.dayData ? (
            <div className="px-4 pb-3 space-y-3">
              {/* Top Referrers */}
              {hoveredDay.dayData.topReferrers.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">Top sources</div>
                  <div className="space-y-1">
                    {hoveredDay.dayData.topReferrers.slice(0, 3).map((ref, idx) => {
                      const isDirect = ref.referrer === 'Direct' || ref.referrer === 'direct'
                      const domainName = isDirect ? 'direct' : 
                        ref.referrer.toLowerCase().includes('http') ? 
                          new URL(ref.referrer).hostname.replace('www.', '') : 
                          ref.referrer.toLowerCase()
                      
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {domainName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs flex-1 truncate">{domainName}</span>
                          <span className="text-xs font-bold">{ref.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top Devices */}
              {hoveredDay.dayData.topDevices.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">Top devices</div>
                  <div className="space-y-1">
                    {hoveredDay.dayData.topDevices.slice(0, 3).map((device, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">{device.device}</span>
                        <span className="text-xs font-bold">{device.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Arrow pointing down to the box */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-gray-800"></div>
        </div>
      )}




      </motion.div>
    </>
  )
}
