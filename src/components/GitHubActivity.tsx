"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Calendar, Star, GitFork, ExternalLink } from 'lucide-react'

interface Contribution {
  date: string
  level: number
  count: number
}

interface PinnedRepo {
  id: number
  name: string
  description: string
  htmlUrl: string
  language: string
  stargazersCount: number
  forksCount: number
  updatedAt: string
  topics: string[]
}

interface GitHubActivityProps {
  username: string
  theme: 'light' | 'dark'
}

interface ContributionSquareProps {
  day: Contribution
  theme: 'light' | 'dark'
  getContributionColor: (level: number, count: number) => string
  delay: number
}

function ContributionSquare({ day, theme, getContributionColor, delay }: ContributionSquareProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <>
      <motion.div
        className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm cursor-pointer relative"
        style={{ backgroundColor: getContributionColor(day.level, day.count) }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3, 
          delay: delay 
        }}
        whileHover={{ scale: 1.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`px-3 py-2 rounded-lg shadow-lg border text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="font-semibold">{formatDate(day.date)}</div>
              <div className="text-gray-500">
                {day.count === 0 ? 'No contributions' : `${day.count} contribution${day.count > 1 ? 's' : ''}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function GitHubActivity({ username, theme }: GitHubActivityProps) {
  const [data, setData] = useState<{
    user: any
    contributions: Contribution[]
    pinnedRepos: PinnedRepo[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/github-activity?username=${username}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub activity')
        }
        
        const activityData = await response.json()
        setData(activityData)
      } catch (err) {
        console.error('GitHub Activity Error:', err)
        setError('Failed to load GitHub activity')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchActivity()
    }
  }, [username])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  const { contributions, pinnedRepos } = data

  // Group contributions by weeks
  const weeks = []
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7))
  }

  const getContributionColor = (level: number, count: number = 0) => {
    // Violet to white gradient based on actual contribution count
    if (count === 0) return theme === 'dark' ? '#1a0b2e' : '#f8f5ff' // No contributions - darkest violet/lightest
    
    // Calculate level based on actual count for better distribution
    let actualLevel = 0
    if (count >= 1 && count <= 3) actualLevel = 1
    else if (count >= 4 && count <= 6) actualLevel = 2  
    else if (count >= 7 && count <= 9) actualLevel = 3
    else if (count >= 10) actualLevel = 4
    
    // Violet to white gradient
    if (actualLevel === 0) return theme === 'dark' ? '#1a0b2e' : '#f8f5ff' // No contributions
    if (actualLevel === 1) return theme === 'dark' ? '#2d1b69' : '#e6d7ff' // 1-3 contributions - dark violet/light violet
    if (actualLevel === 2) return theme === 'dark' ? '#4c1d95' : '#c4b5fd' // 4-6 contributions - medium violet
    if (actualLevel === 3) return theme === 'dark' ? '#7c3aed' : '#a78bfa' // 7-9 contributions - bright violet
    return theme === 'dark' ? '#a855f7' : '#8b5cf6' // 10+ contributions - lightest violet/medium violet
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'Python': '#3776ab',
      'Java': '#ed8b00',
      'React': '#61dafb',
      'Vue': '#4fc08d',
      'HTML': '#e34f26',
      'CSS': '#1572b6',
      'Go': '#00add8',
      'Rust': '#000000',
      'PHP': '#777bb4',
      'Ruby': '#cc342d',
    }
    return colors[language] || '#6b7280'
  }

  return (
    <motion.section 
      className="relative z-10 py-3 md:py-4"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        {/* Header */}
        <motion.div
          className="text-left mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            GitHub Activity
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            My coding journey and recent repositories
          </p>
        </motion.div>

        {/* Contribution Graph */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Github className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {username} • {contributions.reduce((sum, day) => sum + day.count, 0)} contributions
                </span>
              </div>
            </div>
            
            {/* Contribution Graph - Mobile Responsive */}
            <div className="overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
              <div className="flex gap-0.5 sm:gap-1 min-w-max">
                {/* Days of week labels */}
                <div className="flex flex-col gap-0.5 sm:gap-1 mr-1 sm:mr-2">
                  <div className="h-2 sm:h-3"></div>
                  {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((day, index) => (
                    <div key={index} className={`h-2 sm:h-3 flex items-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Contribution grid */}
                <div className="flex gap-0.5 sm:gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                      {week.map((day, dayIndex) => (
                        <ContributionSquare
                          key={`${weekIndex}-${dayIndex}`}
                          day={day}
                          theme={theme}
                          getContributionColor={getContributionColor}
                          delay={(weekIndex * 7 + dayIndex) * 0.01}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Month labels - Mobile Responsive */}
              <div className="flex gap-0.5 sm:gap-1 ml-6 sm:ml-8 mt-1 sm:mt-2">
                {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, index) => (
                  <div key={index} className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-2 sm:w-3 text-center`}>
                    {index % 2 === 0 ? month : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend - Mobile Responsive */}
            <div className="flex items-center justify-end mt-2 sm:mt-4 text-xs">
              <span className={`mr-1 sm:mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Less</span>
              <div className="flex gap-0.5 sm:gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
                    style={{ backgroundColor: getContributionColor(level, level === 0 ? 0 : level * 2) }}
                  />
                ))}
              </div>
              <span className={`ml-1 sm:ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>More</span>
            </div>
          </div>
        </motion.div>

        {/* Pinned Repositories */}
        {pinnedRepos && pinnedRepos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v6.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {pinnedRepos.length} pinned • {data?.user?.publicRepos || 0} repositories (public only)
                  </span>
                </div>
              </div>
              
              {/* Repository Grid - Mobile Responsive */}
              <div className={`grid gap-3 sm:gap-4 ${theme === 'dark' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {pinnedRepos.map((repo, index) => (
                  <motion.a
                    key={repo.id}
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:shadow-md min-h-[120px] sm:min-h-[140px] flex flex-col ${
                      theme === 'dark' 
                        ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className={`font-semibold text-sm sm:text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'} group-hover:text-violet-500 transition-colors`}>
                          {repo.name}
                        </h4>
                      </div>
                      <ExternalLink className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} group-hover:text-violet-500 transition-colors`} />
                    </div>
                    
                    {repo.description && (
                      <p className={`text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed flex-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {repo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap mt-auto">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          />
                          <span className={`truncate max-w-[80px] sm:max-w-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {repo.language}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Star className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{repo.stargazersCount}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <GitFork className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{repo.forksCount}</span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="text-center py-8">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No repositories found. Make sure your GitHub username is correct and you have public repositories.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
