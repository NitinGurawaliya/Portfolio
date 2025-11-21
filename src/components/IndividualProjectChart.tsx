'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IndividualProjectChartProps {
  portfolioId: number
  projectId: number
  projectName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Subtle, aesthetic colors for different projects
const getProjectColor = (projectId: number) => {
  const colors = [
    '#6366f1', // Indigo - softer blue
    '#10b981', // Emerald - soft green
    '#f59e0b', // Amber - warm yellow
    '#ef4444', // Red - kept for contrast
    '#a855f7', // Purple - softer purple
    '#06b6d4', // Cyan - kept
    '#84cc16', // Lime - kept
    '#f97316', // Orange - kept
  ]
  return colors[projectId % colors.length]
}

export function IndividualProjectChart({ 
  portfolioId, 
  projectId, 
  projectName,
  className = "",
  size = 'sm'
}: IndividualProjectChartProps) {
  // Dynamic Y-axis max based on data - ensure it's visible
  const getYAxisMax = (data: any[]) => {
    if (data.length === 0) return 5
    const maxViews = Math.max(...data.map(d => Number(d.views) || 0))
    if (maxViews === 0) return 5
    
    // Add padding: 30% or minimum 2, but cap at reasonable max
    const padded = Math.max(maxViews * 1.3, maxViews + 2)
    // For small numbers, round up to next integer
    return Math.ceil(padded)
  }
  const [chartData, setChartData] = useState<any[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [percentageChange, setPercentageChange] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 IndividualProjectChart: Starting data fetch for:', { portfolioId, projectId, projectName })
      
      setLoading(true)
      try {
        // Check if portfolioId is valid
        if (!portfolioId || portfolioId === undefined) {
          console.error('❌ IndividualProjectChart: portfolioId is undefined or invalid:', portfolioId)
          setLoading(false)
          return
        }

        const params = new URLSearchParams({
          portfolioId: portfolioId.toString(),
          projectId: projectId.toString(),
          days: 'all' // Get all data, will be summarized by month
        })

        const apiUrl = `/api/analytics/track-project-click?${params}`
        
        console.log('📊 IndividualProjectChart fetching data for:', {
          portfolioId,
          projectId,
          projectName,
          url: apiUrl,
          portfolioIdType: typeof portfolioId,
          projectIdType: typeof projectId
        })

        console.log('📊 IndividualProjectChart: Making fetch request to:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        console.log('📊 IndividualProjectChart: Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ IndividualProjectChart API Error:', response.status, response.statusText)
          console.error('❌ IndividualProjectChart Error body:', errorText)
          throw new Error('Failed to fetch project views data')
        }

        const result = await response.json()
        
        console.log('📊 IndividualProjectChart API Response:', result)
        console.log('📊 IndividualProjectChart Response success:', result.success)
        console.log('📊 IndividualProjectChart chartData length:', result.data?.length || 0)
        console.log('📊 IndividualProjectChart totalViews:', result.totalViews)
        
        if (result.success && result.data && result.data.length > 0) {
          setChartData(result.data)
          setTotalViews(result.totalViews)
          
          // Use projectName from API response if available, otherwise use prop
          const effectiveProjectName = result.projectName || projectName
          
          console.log('📊 IndividualProjectChart: Using projectName:', effectiveProjectName)
          console.log('📊 IndividualProjectChart: Sample data keys:', Object.keys(result.data[0] || {}))
          
          // Calculate percentage change - for monthly data, compare last two months
          const projectData = result.data.map((item: any) => {
            // Try to get views using the effective project name
            const views = item[effectiveProjectName] !== undefined 
              ? item[effectiveProjectName] 
              : (item[projectName] || item.views || 0)
            return {
              label: item.month || item.monthShort || item.day || item.date,
              date: item.date,
              views: Number(views) || 0
            }
          })
          
          if (projectData.length >= 2) {
            const latestViews = projectData[projectData.length - 1].views
            const previousViews = projectData[projectData.length - 2].views
            
            if (previousViews > 0) {
              const change = ((latestViews - previousViews) / previousViews) * 100
              setPercentageChange(change)
            } else if (latestViews > 0) {
              setPercentageChange(100) // 100% increase from 0
            } else {
              setPercentageChange(0) // No change
            }
          } else if (projectData.length === 1) {
            setPercentageChange(0)
          } else {
            setPercentageChange(null)
          }
          
          console.log('📊 IndividualProjectChart data set successfully:', result.data)
          console.log('📊 IndividualProjectChart projectData:', projectData)
        } else {
          console.error('❌ IndividualProjectChart API returned success: false or no data')
          console.log('📊 IndividualProjectChart result:', result)
          // Set empty data to show "No data" message
          setChartData([])
          setTotalViews(0)
          setPercentageChange(null)
        }
      } catch (error) {
        console.error('Error fetching project views data:', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [portfolioId, projectId, projectName])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-[180px]'
      case 'md':
        return 'h-52'
      case 'lg':
        return 'h-60'
      default:
        return 'h-[180px]'
    }
  }

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`${getSizeClasses()} flex items-center justify-center bg-gray-50/50 rounded border`}>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`${getSizeClasses()} flex items-center justify-center bg-gray-50/50 rounded border`}>
          <div className="text-sm text-gray-500 text-center">
            <div>No data</div>
            <div className="text-xs text-gray-400 mt-1">Click project to generate</div>
          </div>
        </div>
      </div>
    )
  }

  // Get project data from chart data - ensure we extract views correctly
  // First, try to get the projectName from the first data item's keys
  const firstItemKeys = chartData.length > 0 ? Object.keys(chartData[0] || {}) : []
  const dataProjectName = firstItemKeys.find(key => 
    key !== 'date' && 
    key !== 'month' && 
    key !== 'monthShort' && 
    key !== 'day' && 
    typeof chartData[0]?.[key] === 'number'
  ) || projectName
  
  console.log('📊 IndividualProjectChart: Extracting data with projectName:', dataProjectName)
  console.log('📊 IndividualProjectChart: First item keys:', firstItemKeys)
  
  const projectData = chartData.map(item => {
    // Try multiple ways to get views
    const views = item[dataProjectName] !== undefined 
      ? item[dataProjectName] 
      : (item[projectName] !== undefined ? item[projectName] : (item.views || 0))
    return {
      label: item.month || item.monthShort || item.day || item.date || '',
      date: item.date || '',
      views: Number(views) || 0
    }
  }).filter(item => item.label) // Remove items without labels
  
  console.log('📊 IndividualProjectChart projectData:', projectData.map(d => ({ label: d.label, views: d.views })))
  console.log('📊 IndividualProjectChart chartData sample:', chartData[0])
  console.log('📊 IndividualProjectChart projectName:', projectName)

  // If only one data point, duplicate it to show a line (or show as bar)
  const displayData = projectData.length === 1 
    ? [
        { ...projectData[0], label: '', views: 0 }, // Empty point at start
        projectData[0],
        { ...projectData[0], label: '', views: 0 }  // Empty point at end
      ]
    : projectData.length === 0
    ? []
    : projectData

  // Calculate dynamic Y-axis max
  const yAxisMax = getYAxisMax(projectData)

  // Get color for this project
  const projectColor = getProjectColor(projectId)

  console.log('📊 IndividualProjectChart projectData:', projectData)
  console.log('📊 IndividualProjectChart totalViews:', totalViews)
  console.log('📊 IndividualProjectChart projectName:', projectName)
  console.log('📊 IndividualProjectChart projectColor:', projectColor)
  console.log('📊 IndividualProjectChart chartData keys:', chartData.map(d => Object.keys(d)))
  console.log('📊 IndividualProjectChart chartData sample:', chartData[0])
  console.log('📊 IndividualProjectChart projectName in chartData:', chartData.map(d => d[projectName]))
  console.log('📊 IndividualProjectChart projectData views:', projectData.map(d => d.views))
  console.log('📊 IndividualProjectChart projectData max views:', Math.max(...projectData.map(d => d.views)))

  return (
    <div className={`w-full ${className}`} style={{ overflow: 'visible' }}>
      <div className={`${getSizeClasses()} w-full flex flex-col`} style={{ overflow: 'visible' }}>
        {/* Percentage Badge - More subtle */}
        {percentageChange !== null && (
          <div className="mb-1 flex justify-end">
            <div className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              percentageChange > 0 
                ? 'text-emerald-600 bg-emerald-50/50' 
                : percentageChange < 0 
                ? 'text-rose-500 bg-rose-50/50' 
                : 'text-gray-500 bg-gray-50/50'
            }`}>
              {percentageChange > 0 ? '↗' : percentageChange < 0 ? '↘' : '→'} 
              {Math.abs(percentageChange).toFixed(1)}%
            </div>
          </div>
        )}
        
        <div className="flex-1 w-full" style={{ overflow: 'visible', position: 'relative', paddingBottom: '15px' }}>
          <div style={{ width: '100%', height: '170px', overflow: 'visible', position: 'relative' }}>
            <ResponsiveContainer width="100%" height={170} style={{ overflow: 'visible' }}>
            <AreaChart 
              data={displayData} 
              margin={{ top: 5, right: 8, left: 8, bottom: 45 }}
            >
            <defs>
              {/* More visible gradient for area under line */}
              <linearGradient id={`gradient-${projectId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={projectColor} stopOpacity={0.25} />
                <stop offset="50%" stopColor={projectColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={projectColor} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              axisLine={true}
              tickLine={true}
              mirror={false}
              tick={{ fontSize: 9, fill: '#374151', fontWeight: 500 }}
              tickMargin={10}
              height={40}
              interval={0}
              angle={displayData.length > 6 ? -35 : 0}
              textAnchor={displayData.length > 6 ? "end" : "middle"}
              hide={displayData.length === 3 && projectData.length === 1}
              stroke="#9ca3af"
              strokeWidth={1.5}
            />
            <YAxis 
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 9, fill: '#374151', fontWeight: 500 }}
              domain={[0, yAxisMax]}
              width={36}
              tickCount={Math.min(5, Math.max(3, Math.ceil(yAxisMax / 2) + 1))}
              tickFormatter={(value) => {
                const num = Math.round(value)
                return num === 0 ? '' : num.toString()
              }}
              padding={{ top: 2, bottom: 2 }}
              allowDecimals={false}
              stroke="#9ca3af"
              strokeWidth={1.5}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  const actualData = projectData.find(d => d.label === label)
                  if (!actualData) return null
                  
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-[11px] font-medium text-gray-600 mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {payload[0]?.value} {Number(payload[0]?.value) === 1 ? 'view' : 'views'}
                      </p>
                    </div>
                  )
                }
                return null
              }}
              cursor={{ stroke: projectColor, strokeWidth: 1, strokeOpacity: 0.25, strokeDasharray: '4 4' }}
            />
            {/* Gradient area - more visible */}
            <Area 
              type="basis"
              dataKey="views" 
              fill={`url(#gradient-${projectId})`}
              stroke="none"
              isAnimationActive={true}
            />
            {/* Main line - smoother with basis curve, more visible */}
            <Line 
              type="basis"
              dataKey="views" 
              stroke={projectColor} 
              strokeWidth={3}
              strokeOpacity={1}
              dot={{ 
                r: projectData.length <= 5 ? 4 : 0,
                fill: projectColor,
                strokeWidth: 2.5,
                stroke: '#fff',
                opacity: 1
              }}
              activeDot={{ 
                r: 6, 
                fill: projectColor,
                strokeWidth: 3,
                stroke: '#fff',
                opacity: 1
              }}
              connectNulls={false}
              isAnimationActive={true}
            />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
