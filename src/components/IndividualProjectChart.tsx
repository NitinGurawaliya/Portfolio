'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IndividualProjectChartProps {
  portfolioId: number
  projectId: number
  projectName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// Different colors for different projects
const getProjectColor = (projectId: number) => {
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
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
          days: '7'
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
          
          // Calculate percentage change from yesterday
          const projectData = result.data.map((day: any) => ({
            day: day.day,
            views: day[projectName] || 0
          }))
          
          if (projectData.length >= 2) {
            const todayViews = projectData[projectData.length - 1].views
            const yesterdayViews = projectData[projectData.length - 2].views
            
            if (yesterdayViews > 0) {
              const change = ((todayViews - yesterdayViews) / yesterdayViews) * 100
              setPercentageChange(change)
            } else if (todayViews > 0) {
              setPercentageChange(100) // 100% increase from 0
            } else {
              setPercentageChange(0) // No change
            }
          } else {
            setPercentageChange(0)
          }
          
          console.log('📊 IndividualProjectChart data set successfully:', result.data)
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
        return 'h-40'
      case 'md':
        return 'h-48'
      case 'lg':
        return 'h-56'
      default:
        return 'h-40'
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

  // Get project data from chart data
  const projectData = chartData.map(day => ({
    day: day.day,
    views: day[projectName] || 0
  }))

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
    <div className={`w-full ${className}`}>
      <div className={`${getSizeClasses()} w-full flex flex-col overflow-hidden`}>
        {/* Percentage Badge */}
        {percentageChange !== null && (
          <div className="mb-1 flex justify-end">
            <div className={`text-xs px-2 py-1 rounded ${
              percentageChange > 0 
                ? 'bg-green-100 text-green-700' 
                : percentageChange < 0 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {percentageChange > 0 ? '↗' : percentageChange < 0 ? '↘' : '↔'} 
              {Math.abs(percentageChange).toFixed(1)}% 
              {percentageChange > 0 ? ' more than yesterday' : percentageChange < 0 ? ' less than yesterday' : ' same as yesterday'}
            </div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 8, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              domain={[0, 'dataMax + 0.5']}
              width={30}
              tickCount={5}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-gray-200 rounded p-2 shadow-lg">
                      <p className="text-xs font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-blue-600 font-semibold">
                        {payload[0]?.value} views
                      </p>
                    </div>
                  )
                }
                return null
              }}
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke={projectColor} 
              strokeWidth={2}
              dot={{ r: 2, fill: projectColor }}
              activeDot={{ r: 3, fill: projectColor }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
