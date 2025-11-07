"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectIcon } from "@/components/ui/project-icon"
import { 
  Eye, 
  ExternalLink, 
  Smartphone,
  BarChart3,
  Code,
  Wrench,
  Users,
  Palette,
  Check,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { SiGooglechrome } from "react-icons/si"
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiJavascript, SiVercel, SiSupabase, SiStripe } from "react-icons/si"

// Demo data
const demoAnalytics = {
  totalViews: 524,
  uniqueSources: 7,
  topDevice: { name: "Android Mobile", count: 279 },
  topBrowser: { name: "Chrome", count: 346 },
  topReferrers: [
    { referrer: "direct", count: 248 },
    { referrer: "Twitter", count: 239 },
    { referrer: "devfolio.cc", count: 25 },
    { referrer: "Instagram", count: 6 },
    { referrer: "LinkedIn", count: 3 },
    { referrer: "com.google.android.gm", count: 2 },
    { referrer: "com.linkedin.android", count: 1 },
  ]
}

// Generate heatmap data (52 weeks x 7 days)
const generateHeatmapData = () => {
  const weeks: any[][] = []
  for (let week = 0; week < 52; week++) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      // Most days have 0 visits, some have visits
      const count = Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0
      weekData.push({ count })
    }
    weeks.push(weekData)
  }
  // Add some activity in the last week (Nov)
  for (let day = 0; day < 8; day++) {
    weeks[51][day] = { count: Math.floor(Math.random() * 3) + 1 }
  }
  return weeks
}

const heatmapWeeks = generateHeatmapData()

const getHeatmapColor = (count: number) => {
  if (count === 0) return "bg-gray-200"
  if (count === 1) return "bg-green-200"
  if (count === 2) return "bg-green-300"
  if (count >= 3) return "bg-green-400"
  return "bg-gray-200"
}

const demoProjects = [
  {
    id: 1,
    name: "DevFolio - Build Your Developer Portfolio in Minutes",
    description: "Create stunning developer portfolios by importing projects from GitHub",
    visits: 37,
    percentageChange: 340.0,
    logo: "DF",
    chartData: [
      { day: "Thu", views: 0 },
      { day: "Fri", views: 0 },
      { day: "Sat", views: 0 },
      { day: "Sun", views: 0 },
      { day: "Mon", views: 6 },
      { day: "Tue", views: 12 },
      { day: "Wed", views: 22 },
    ],
    color: "#f97316",
    maxY: 22
  },
  {
    id: 2,
    name: "Zayka - Digital Menu Solutions",
    description: "Transform your restaurant menu into a digital experience",
    visits: 24,
    percentageChange: 71.4,
    logo: "Z",
    chartData: [
      { day: "Thu", views: 0 },
      { day: "Fri", views: 0 },
      { day: "Sat", views: 0 },
      { day: "Sun", views: 0 },
      { day: "Mon", views: 0 },
      { day: "Tue", views: 6 },
      { day: "Wed", views: 12 },
    ],
    color: "#3b82f6",
    maxY: 12
  },
  {
    id: 3,
    name: "Watch Dog 🐕",
    description: "Realtime, privacy-first analytics for developers",
    visits: 26,
    percentageChange: 25.0,
    logo: "WD",
    chartData: [
      { day: "Thu", views: 0 },
      { day: "Fri", views: 3 },
      { day: "Sat", views: 2 },
      { day: "Sun", views: 1 },
      { day: "Mon", views: 4 },
      { day: "Tue", views: 7 },
      { day: "Wed", views: 10 },
    ],
    color: "#10b981",
    maxY: 10
  },
]

const demoSkills = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "Vercel", icon: SiVercel, color: "#000000" },
  { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
  { name: "Stripe", icon: SiStripe, color: "#635BFF" },
  { name: "Node.js", icon: SiNextdotjs, color: "#339933" },
  { name: "Python", icon: SiNextdotjs, color: "#3776AB" },
  { name: "PostgreSQL", icon: SiSupabase, color: "#336791" },
  { name: "Docker", icon: SiVercel, color: "#2496ED" },
  { name: "GraphQL", icon: SiReact, color: "#E10098" },
  { name: "MongoDB", icon: SiSupabase, color: "#47A248" },
]

const demoSocials = [
  { platform: "GitHub", username: "@johndoe", icon: Github },
  { platform: "Twitter", username: "@johndoe", icon: Twitter },
  { platform: "LinkedIn", username: "john-doe", icon: Linkedin },
  { platform: "Instagram", username: "@johndoe", icon: Instagram },
  { platform: "Email", username: "john@example.com", icon: Mail },
]

function ProjectChart({ data, color, maxY }: { data: any[], color: string, maxY: number }) {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark') || 
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkDarkMode)
    
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkDarkMode)
    }
  }, [])
  
  // Calculate optimal tick count for Y-axis
  const tickCount = maxY <= 10 ? 3 : maxY <= 20 ? 4 : 5
  
  // Format day labels - show first 3 letters
  const formatDay = (day: string) => {
    return day.slice(0, 3)
  }
  
  // Get text color based on theme
  const textColor = isDark ? '#9ca3af' : '#6b7280'
  
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 5, bottom: 18 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: textColor, fontWeight: 500 }}
            height={18}
            interval={0}
            tickFormatter={formatDay}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: textColor }}
            domain={[0, maxY]}
            width={35}
            tickCount={tickCount}
            tickFormatter={(value) => Math.round(value).toString()}
          />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke={color} 
            strokeWidth={2.5}
            dot={{ r: 3, fill: color, strokeWidth: 1.5, stroke: isDark ? '#1f2937' : '#fff' }}
            activeDot={{ r: 4, fill: color }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function getReferrerIcon(referrer: string) {
  const refLower = referrer.toLowerCase()
  
  if (refLower.includes('twitter') || refLower === 't.co') {
    return <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
  }
  
  if (refLower.includes('linkedin')) {
    return <div className="w-7 h-7 rounded-full bg-[#0077b5] flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </div>
  }
  
  if (refLower.includes('instagram')) {
    return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  }
  
  if (refLower.includes('google')) {
    return <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
  }
  
  if (refLower.includes('github')) {
    return <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    </div>
  }
  
  return <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
    <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
  </div>
}

const BACKGROUND_COLORS = [
  { name: 'Default', value: '#ffffff', preview: 'linear-gradient(to bottom right, #ffffff, #f8f8f8)' },
  { name: 'Sky Blue', value: '#eff6ff', preview: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' },
  { name: 'Mint Green', value: '#ecfdf5', preview: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)' },
  { name: 'Peach', value: '#fff7ed', preview: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)' },
  { name: 'Lavender', value: '#f5f3ff', preview: 'linear-gradient(to bottom right, #f5f3ff, #e9d5ff)' },
  { name: 'Rose Pink', value: '#fdf2f8', preview: 'linear-gradient(to bottom right, #fdf2f8, #fce7f3)' },
  { name: 'Canary Yellow', value: '#fffbeb', preview: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)' },
  { name: 'Soft Cyan', value: '#ecfeff', preview: 'linear-gradient(to bottom right, #ecfeff, #cffafe)' },
]

const BACKGROUND_PATTERNS = [
  { name: 'None', value: null },
  { name: 'Dots', value: 'dots' },
  { name: 'Grid', value: 'grid' },
  { name: 'Cross', value: 'cross' },
  { name: 'Waves', value: 'waves' },
  { name: 'Stars', value: 'stars' },
]

const getPatternStyle = (pattern: string | null) => {
  if (!pattern) return {}
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'cross':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)'
      }
    case 'waves':
      return {
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)'
      }
    case 'stars':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.08) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }
    default:
      return {}
  }
}

export function FeatureShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Our Flagship Features
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build and showcase your developer portfolio
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. Analytics Dashboard - Full Width */}
          <Card className="bg-card shadow-md border-border rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-card-foreground font-bold">Analytics and Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Card className="bg-card shadow-md border-border rounded-lg h-24">
                  <CardContent className="p-3 h-full">
                    <p className="text-[10px] text-muted-foreground mb-1">Total Visits</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-card-foreground leading-none">{demoAnalytics.totalViews}</p>
                      <div className="border border-border rounded p-1">
                        <Eye className="h-4 w-4 text-card-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-md border-border rounded-lg h-24">
                  <CardContent className="p-3 h-full">
                    <p className="text-[10px] text-muted-foreground mb-1">Unique Sources</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-card-foreground leading-none">{demoAnalytics.uniqueSources}</p>
                      <div className="border border-border rounded p-1">
                        <ExternalLink className="h-4 w-4 text-card-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-md border-border rounded-lg h-24">
                  <CardContent className="p-3 h-full flex flex-col justify-between">
                    <p className="text-[10px] text-muted-foreground">Top Device</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-2xl font-bold text-card-foreground leading-none">{demoAnalytics.topDevice.count}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{demoAnalytics.topDevice.name}</p>
                      </div>
                      <div className="border border-border rounded p-1">
                        <Smartphone className="h-4 w-4 text-card-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-md border-border rounded-lg h-24">
                  <CardContent className="p-3 h-full flex flex-col justify-between">
                    <p className="text-[10px] text-muted-foreground">Top Browser</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-2xl font-bold text-card-foreground leading-none">{demoAnalytics.topBrowser.count}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{demoAnalytics.topBrowser.name}</p>
                      </div>
                      <div className="border border-border rounded p-1">
                        <SiGooglechrome className="h-4 w-4 text-[#4285F4]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visits over time and Top Referrers - Side by Side */}
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Heatmap - Left side */}
                <div className="flex-1">
                  <CardTitle className="text-base text-card-foreground font-bold mb-2">Visits over time</CardTitle>
                  <div className="flex items-start gap-1">
                    {/* Weekday labels */}
                    <div className="flex flex-col gap-1 pt-0.5">
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Sun</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Mon</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Tue</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Wed</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Thu</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Fri</span>
                      <span className="text-[9px] text-muted-foreground font-medium h-3 leading-none">Sat</span>
                    </div>
                    
                    <div className="flex flex-col">
                      {/* Month labels */}
                      <div className="flex gap-1 mb-1.5 pl-7">
                        {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((month, idx) => (
                          <div key={idx} className="w-3 flex items-start justify-center">
                            {idx === 0 || idx === 12 ? (
                              <span className="text-[9px] text-muted-foreground font-medium">{month}</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                      
                      {/* Heatmap grid */}
                      <div className="flex gap-1">
                        {heatmapWeeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                              <div
                                key={`${weekIndex}-${dayIndex}`}
                                className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Referrers - Right side */}
                <div className="w-full lg:w-72 flex-shrink-0">
                  <CardTitle className="text-base text-card-foreground font-bold mb-2">Top Referrers</CardTitle>
                  <div className="space-y-2">
                    {demoAnalytics.topReferrers.map((ref, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getReferrerIcon(ref.referrer)}
                          <span className="text-xs text-card-foreground font-medium truncate">{ref.referrer}</span>
                        </div>
                        <span className="text-xs font-bold text-card-foreground ml-2">{ref.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Projects Section - Full Width */}
          <Card className="bg-card shadow-md border-border rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-card-foreground font-bold">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoProjects.map((project) => (
                  <Card key={project.id} className="bg-card shadow-md border-border rounded-lg h-[240px]">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <ProjectIcon title={project.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-card-foreground truncate leading-tight">{project.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">{project.description}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-[10px] text-muted-foreground mb-0.5">Times visited</div>
                          <div className="text-base font-bold text-card-foreground leading-none">{project.visits}</div>
                          <div className="text-[10px] text-green-600 dark:text-green-500 mt-1 font-medium">
                            ↗{project.percentageChange}%
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden mt-auto">
                        <ProjectChart data={project.chartData} color={project.color} maxY={project.maxY} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Bottom Row - Customization, Skills, Socials Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Theme Customization */}
            <Card className="bg-card shadow-md border-border rounded-lg">
              <CardHeader className="pb-1.5">
                <CardTitle className="text-sm text-card-foreground font-bold">Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {/* Background Colors */}
                <div>
                  <h3 className="text-[10px] font-semibold text-card-foreground mb-1.5">Background Colors</h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {BACKGROUND_COLORS.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-9 h-9 rounded-lg shadow-sm cursor-pointer relative border-2 ${
                          idx === 1 ? 'border-orange-500' : 'border-border'
                        }`}
                        style={{ background: color.preview }}
                      >
                        {idx === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-3 w-3 text-orange-600 dark:text-orange-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Patterns */}
                <div>
                  <h3 className="text-[10px] font-semibold text-card-foreground mb-1.5">Background Patterns</h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {BACKGROUND_PATTERNS.map((pattern, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-9 rounded-lg shadow-sm cursor-pointer relative border-2 ${
                          idx === 2 ? 'border-orange-500' : 'border-border'
                        }`}
                        style={{
                          background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
                          ...getPatternStyle(pattern.value)
                        }}
                      >
                        {idx === 2 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-3 w-3 text-orange-600 dark:text-orange-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customization Alert */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-1.5 flex items-start gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-semibold text-orange-900 dark:text-orange-300 mb-0.5">Customization</div>
                    <div className="text-[9px] text-orange-700 dark:text-orange-400">Changes will be applied when you click 'Publish 🔥'</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Feature Card */}
            <Card className="bg-card shadow-md border-border rounded-lg">
              <CardHeader className="pb-1.5">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-card-foreground">Skills & Tech</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {demoSkills.map((skill, idx) => {
                    const IconComponent = skill.icon
                    return (
                      <div 
                        key={idx}
                        className="flex items-center gap-1 px-1.5 py-0.5 bg-muted border-border rounded text-[10px]"
                      >
                        <IconComponent className="h-3 w-3" style={{ color: skill.color }} />
                        <span className="text-muted-foreground font-medium">{skill.name}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Socials Feature Card */}
            <Card className="bg-card shadow-md border-border rounded-lg">
              <CardHeader className="pb-1.5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-card-foreground">Social Links</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-1.5">
                <div className="space-y-1">
                  {demoSocials.map((social, idx) => {
                    const IconComponent = social.icon
                    return (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 p-1.5 bg-muted border-border rounded hover:border-border/80 transition-colors"
                      >
                        <IconComponent className="h-3 w-3 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-medium text-card-foreground">{social.platform}</div>
                          <div className="text-[9px] text-muted-foreground truncate">{social.username}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Bottom CTA Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            <span className="font-semibold text-foreground">Everything you need</span> to showcase your work, track your impact, and grow your developer brand—all in one beautiful portfolio.
          </p>
        </div>
      </div>
    </section>
  )
}
