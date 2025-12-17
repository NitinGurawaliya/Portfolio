"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface ProductHuntProject {
  id: string
  name: string
  tagline: string
  votes: number
  url: string
  thumbnail: string
}

interface ProductHuntProjectsProps {
  username: string | null
}

export function ProductHuntProjects({ username }: ProductHuntProjectsProps) {
  const [projects, setProjects] = useState<ProductHuntProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username || username.trim() === '') {
      return
    }

    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/external-work/producthunt?username=${encodeURIComponent(username)}`)
        const data = await response.json()
        
        console.log('ProductHunt API response:', { success: data.success, projectsCount: data.projects?.length, message: data.message })
        
        if (data.success && data.projects) {
          setProjects(data.projects)
          if (data.projects.length === 0 && data.message) {
            // Show message if no projects but API call was successful
            setError(data.message)
          }
        } else {
          setError(data.message || data.error || 'Failed to fetch projects')
        }
      } catch (err) {
        console.error('Error fetching ProductHunt projects:', err)
        setError('Failed to load projects. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [username])

  if (!username || username.trim() === '') {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Show Your Work
        </h3>
        <div className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg px-4">
          {error}
        </div>
      </div>
    )
  }

  if (projects.length === 0 && !loading && !error) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        Show Your Work
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <motion.a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-0">
                {project.thumbnail && (
                  <div className="w-full h-32 bg-gray-100 overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                      {project.name}
                    </h4>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {project.tagline}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {project.votes.toLocaleString()} upvotes
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.a>
        ))}
      </div>
    </motion.div>
  )
}

