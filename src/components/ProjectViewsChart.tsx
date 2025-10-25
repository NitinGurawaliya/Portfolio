'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Remove the import since we'll use the existing API directly

interface ProjectViewsChartProps {
  portfolioId: number
  projectId?: number
  days?: number
  className?: string
}

export function ProjectViewsChart({ 
  portfolioId, 
  projectId, 
  days = 7, 
  className = "" 
}: ProjectViewsChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          portfolioId: portfolioId.toString(),
          days: days.toString()
        })
        
        if (projectId) {
          params.append('projectId', projectId.toString())
        }

        const response = await fetch(`/api/analytics/track-project-click?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch project views data')
        }

        const result = await response.json()
        
        console.log('📊 ProjectViewsChart API Response:', result)
        
        if (result.success) {
          setChartData(result.data)
          setTotalViews(result.totalViews)
          console.log('📊 Chart data set:', result.data)
        }
      } catch (error) {
        console.error('Error fetching project views data:', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [portfolioId, projectId, days])

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="h-32 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="h-32 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">No views data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get all project names from the data
  const projectNames = new Set<string>()
  chartData.forEach(day => {
    Object.keys(day).forEach(key => {
      if (key !== 'date' && key !== 'day' && typeof day[key] === 'number') {
        projectNames.add(key)
      }
    })
  })

  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
  ]

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Project Views (Last {days} days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.value} views
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              {Array.from(projectNames).map((projectName, index) => (
                <Line
                  key={projectName}
                  type="monotone"
                  dataKey={projectName}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {totalViews > 0 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Total: {totalViews} views
          </div>
        )}
      </CardContent>
    </Card>
  )
}
