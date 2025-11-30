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
        className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-2 lg:h-2 rounded-sm cursor-pointer relative"
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
            <div className={`px-3 py-2 rounded-lg  border text-xs font-medium ${
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

  const { contributions, pinnedRepos = [] } = data

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

  const isDark = theme === "dark"
  const cardClasses = isDark
    ? "border border-gray-800 bg-gray-900/70 "
    : "border border-gray-200 bg-white "
  const sectionHeading = isDark ? "text-white" : "text-gray-900"
  const sectionSubheading = isDark ? "text-gray-400" : "text-gray-600"
  const subCardClasses = isDark
    ? "border border-gray-800 bg-gray-900/40"
    : "border border-gray-100 bg-gray-50"

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className={`rounded-3xl p-6 sm:p-8 ${cardClasses}`}>
        <motion.div
          className="mb-6 flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-lg font-semibold ${sectionHeading}`}>GitHub</h2>
          <p className={`text-sm ${sectionSubheading}`}>
            Highlights from my open-source activity and pinned repositories.
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              className={`rounded-2xl border p-4 sm:p-5 ${
                isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className={`h-5 w-5 ${sectionHeading}`} />
                  <span className={`text-sm font-semibold ${sectionHeading}`}>
                    {username} • {contributions.reduce((sum, day) => sum + day.count, 0)} contributions
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto scroll-smooth lg:overflow-x-visible" style={{ scrollBehavior: "smooth" }}>
                <div className="flex min-w-max gap-0.5 sm:gap-1 lg:min-w-0 lg:w-full lg:gap-0.5">
                  <div className="mr-1 flex flex-col gap-0.5 sm:mr-2 sm:gap-1 lg:mr-1 lg:gap-0.5">
                    <div className="h-2 sm:h-2.5 lg:h-2"></div>
                    {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((day, index) => (
                      <div
                        key={index}
                        className={`flex h-2 items-center text-[10px] sm:h-2.5 sm:text-xs lg:h-2 lg:text-[10px] ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-0.5 sm:gap-1 lg:gap-0.5">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1 lg:gap-0.5">
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

                <div className="mt-1 ml-6 flex gap-0.5 text-[10px] sm:mt-2 sm:ml-8 sm:gap-1 sm:text-xs lg:mt-1 lg:ml-5 lg:gap-0.5 lg:text-[10px]">
                  {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(
                    (month, index) => (
                      <div
                        key={index}
                        className={`w-2 text-center ${isDark ? "text-gray-400" : "text-gray-500"} sm:w-2.5 lg:w-2`}
                      >
                        {index % 2 === 0 ? month : ""}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end text-[10px] sm:mt-4 sm:text-xs lg:mt-2 lg:text-[10px]">
                <span className={`mr-1 ${isDark ? "text-gray-400" : "text-gray-500"} sm:mr-2 lg:mr-1`}>Less</span>
                <div className="flex gap-0.5 sm:gap-1 lg:gap-0.5">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-2 w-2 rounded-sm sm:h-2.5 sm:w-2.5 lg:h-2 lg:w-2"
                      style={{ backgroundColor: getContributionColor(level, level === 0 ? 0 : level * 2) }}
                    />
                  ))}
                </div>
                <span className={`ml-1 ${isDark ? "text-gray-400" : "text-gray-500"} sm:ml-2 lg:ml-1`}>More</span>
              </div>
            </div>
          </motion.div>

          {pinnedRepos && pinnedRepos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={`rounded-2xl border p-4 sm:p-5 ${subCardClasses}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={isDark ? "rounded bg-gray-800 p-1" : "rounded bg-white p-1 shadow-inner"}>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v6.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-semibold ${sectionHeading}`}>
                      {pinnedRepos.length} pinned • {data?.user?.publicRepos || 0} repositories (public only)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {pinnedRepos.map((repo, index) => (
                    <motion.a
                      key={repo.id}
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex min-h-[120px] flex-col rounded-xl border p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:min-h-[140px] sm:p-4 ${
                        isDark
                          ? "border-gray-800 bg-gray-900/50 hover:border-gray-700"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4
                            className={`truncate text-sm font-semibold transition-colors sm:text-base ${
                              isDark ? "text-white" : "text-gray-900"
                            } group-hover:text-primary`}
                          >
                            {repo.name}
                          </h4>
                        </div>
                        <ExternalLink
                          className={`h-3 w-3 flex-shrink-0 transition-colors sm:h-4 sm:w-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } group-hover:text-primary`}
                        />
                      </div>

                      {repo.description && (
                        <p
                          className={`mb-3 flex-1 text-xs leading-relaxed sm:text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {repo.description}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span
                              className="h-2 w-2 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>{repo.language}</span>
                          </div>
                        )}
                        <div className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          <Star className="h-3 w-3" />
                          <span>{repo.stargazersCount}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          <GitFork className="h-3 w-3" />
                          <span>{repo.forksCount}</span>
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
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className={`rounded-2xl border p-6 text-center ${
                  isDark ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-white"
                }`}
              >
                <p className={`text-sm ${sectionSubheading}`}>
                  No repositories found. Make sure your GitHub username is correct and you have public repositories.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
