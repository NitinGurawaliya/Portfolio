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
          <CardTitle className="text-xl text-black font-bold flex items-center">
            Analytics and Insights
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 -mt-1">
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm border border-gray-200 rounded-lg h-28">
            <CardContent className="p-4 h-full">
              <p className="text-xs text-gray-500 mb-2">Total Visits</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-black leading-none">{analytics?.totalViews || 0}</p>
                <div className="border border-gray-200 rounded p-1.5">
                  <Eye className="h-5 w-5 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm border border-gray-200 rounded-lg h-28">
            <CardContent className="p-4 h-full">
              <p className="text-xs text-gray-500 mb-2">Unique Sources</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-black leading-none">{analytics?.topReferrers?.length || 0}</p>
                <div className="border border-gray-200 rounded p-1.5">
                  <ExternalLink className="h-5 w-5 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm border border-gray-200 rounded-lg h-28">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-gray-500">Top Device</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-black leading-none">{analytics?.topDevices?.[0]?.count || 0}</p>
                  {analytics?.topDevices?.[0]?.device && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {analytics.topDevices[0].device}
                    </p>
                  )}
                </div>
                {(() => {
                  const device = analytics?.topDevices?.[0]?.device?.toLowerCase() || ''
                  const IconComponent = device.includes('iphone') ? Smartphone :
                    device.includes('ipad') || device.includes('tablet') || device.includes('android tablet') ? Tablet :
                    device.includes('android') || device.includes('mobile') ? Smartphone :
                    Laptop
                  return (
                    <div className="border border-gray-200 rounded p-1.5">
                      <IconComponent className="h-5 w-5 text-black" />
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm border border-gray-200 rounded-lg h-28">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-gray-500">Top Browser</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold text-black leading-none">{analytics?.topBrowsers?.[0]?.count || 0}</p>
                  {analytics?.topBrowsers?.[0]?.browser && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {analytics.topBrowsers[0].browser}
                    </p>
                  )}
                </div>
                {analytics?.topBrowsers?.[0]?.browser ? 
                  <div className="border border-gray-200 rounded p-1.5">
                    {getBrowserIcon(analytics.topBrowsers[0].browser, "h-5 w-5")}
                  </div> : 
                  <div className="border border-gray-200 rounded p-1.5">
                    <Globe className="h-5 w-5 text-black" />
                  </div>
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Graph - Moved to Top */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-none border-none">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-black font-bold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Visits over time
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Month labels row */}
            <div className="flex gap-1 min-w-max mb-2 overflow-x-auto scrollbar-hide pl-7">
              {weeks.map((week, weekIndex) => {
                // Get the first day of this week to determine month
                const firstDay = week.find(day => day.date)
                if (!firstDay || !firstDay.date) return null
                
                const date = new Date(firstDay.date)
                const month = date.toLocaleDateString('en-US', { month: 'short' })
                const weekStart = date.getDate()
                
                // Show month label only on the first week of each month
                const isFirstWeekOfMonth = weekStart <= 7
                const shouldShowMonth = isFirstWeekOfMonth || weekIndex === 0
                
                return (
                  <div key={weekIndex} className="w-3 flex items-start justify-center">
                    {shouldShowMonth && (
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
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
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Sun</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Mon</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Tue</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Wed</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Thu</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Fri</span>
                <span className="text-[10px] text-gray-500 font-medium h-3 leading-none">Sat</span>
              </div>
              
              {/* Heatmap grid */}
              <div className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Referrers - Half width */}
      {analytics?.topReferrers && analytics.topReferrers.length > 0 && (
        <motion.div variants={itemVariants} className="max-w-[50%]">
          <TopReferrersList referrers={analytics.topReferrers} />
        </motion.div>
      )}

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
