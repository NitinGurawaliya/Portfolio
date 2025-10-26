import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Building, Eye } from "lucide-react"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"
import { SkillIcon } from "@/lib/skill-icons"
import { useState, useEffect } from "react"
import { GitHubActivity } from "@/components/GitHubActivity"
import { trackProjectClick } from "@/lib/analytics-utils"

interface ThemeConfig {
  name: string
  colors: {
    background: string
    text: string
    accent: string
    cardBg?: string
    border?: string
  }
  layout: string
  previewImage: string
}

interface PortfolioData {
  id: number
  displayName: string
  jobTitle?: string
  bio: string
  profilePic: string
  skills: any[]
  socials: any[]
  repositories: any[]
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

interface LayoutLightProps {
  theme: ThemeConfig
  portfolio: PortfolioData
}

const getSocialIcon = (platform: string) => {
  const icons: Record<string, any> = {
    github: SiGithub,
    email: SiGmail,
    twitter: SiX,
    x: SiX,
    linkedin: SiLinkedin,
    instagram: SiInstagram,
    facebook: SiFacebook,
    youtube: SiYoutube,
    stackoverflow: SiStackoverflow,
    reddit: SiReddit,
  }
  return icons[platform] || Globe
}

export default function LayoutLight({ theme, portfolio }: LayoutLightProps) {
  const [displayedBio, setDisplayedBio] = useState('')
  const [bioIndex, setBioIndex] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [viewsCount, setViewsCount] = useState(0)
  const [projectViews, setProjectViews] = useState<{[key: number]: number}>({})

  // Fetch views count
  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(`/api/analytics/stats?portfolioId=${portfolio.id}`)
        if (response.ok) {
          const data = await response.json()
          setViewsCount(data.totalViews || 0)
        }
      } catch (error) {
        console.error('Failed to fetch views:', error)
      }
    }
    
    if (portfolio.id) {
      fetchViews()
    }
  }, [portfolio.id])

  // Fetch project views
  useEffect(() => {
    const fetchProjectViews = async () => {
      try {
        const response = await fetch(`/api/analytics/detailed?portfolioId=${portfolio.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.projects) {
            const views: {[key: number]: number} = {}
            data.projects.forEach((project: any) => {
              // Use PortfolioRepository ID or GitHub ID for matching
              const projectId = project.projectId
              const githubId = project.githubId
              const clickCount = project.clickCount || 0
              
              // Store by both PortfolioRepository ID and GitHub ID for compatibility
              if (projectId) views[projectId] = clickCount
              if (githubId) views[githubId] = clickCount
            })
            setProjectViews(views)
          }
        }
      } catch (error) {
        console.error('Failed to fetch project views:', error)
      }
    }
    
    if (portfolio.id) {
      fetchProjectViews()
    }
  }, [portfolio.id])

  // Typing animation effect for bio
  useEffect(() => {
    if (!portfolio.bio) {
      setIsTypingComplete(true)
      return
    }

    if (bioIndex < portfolio.bio.length) {
      const timeout = setTimeout(() => {
        setDisplayedBio(portfolio.bio.slice(0, bioIndex + 1))
        setBioIndex(bioIndex + 1)
      }, 30) // Typing speed (30ms per character)
      return () => clearTimeout(timeout)
    } else {
      setIsTypingComplete(true)
    }
  }, [bioIndex, portfolio.bio])

  return (
    <div 
      className="min-h-screen scroll-smooth"
      style={{ 
        background: theme.colors.background,
        color: theme.colors.text,
        scrollBehavior: 'smooth'
      }}
    >
      {/* Light Background */}
      <div className="fixed inset-0 z-0 bg-[#fafafa]"></div>

      {/* Page container: 2-col on md+, single on mobile */}
      <div className="relative z-10 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-[1200px] py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 md:gap-6 lg:gap-8">
          {/* Left column - profile card and skills/actions */}
          <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <motion.section 
              className="rounded-2xl bg-white border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-label="Profile introduction"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-200">
                    <AvatarImage 
                      src={portfolio.profilePic} 
                      className="object-cover" 
                      alt={`${portfolio.displayName}'s profile picture`}
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-800 text-2xl font-bold">
                      {portfolio.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{portfolio.displayName}</h1>
                    {portfolio.jobTitle && (
                      <p className="text-sm sm:text-base text-gray-600 mt-0.5">{portfolio.jobTitle}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">{displayedBio}</p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>{viewsCount} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Socials - compact buttons */}
            {portfolio.socials && portfolio.socials.length > 0 && (
              <motion.section 
                className="rounded-2xl bg-white border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                aria-label="Social media links"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-wrap gap-2">
                    {portfolio.socials
                      .filter(social => social.username && social.username.trim())
                      .map((social, index) => {
                        const Icon = getSocialIcon(social.platform)
                        return (
                          <motion.button
                            key={social.id}
                            onClick={() => window.open(social.url, '_blank')}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 6 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            viewport={{ once: true }}
                            aria-label={`Visit ${social.platform} profile`}
                          >
                            <Icon className="h-4 w-4" />
                          </motion.button>
                        )
                      })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Skills - horizontal scroll chips */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <motion.section 
                className="rounded-2xl bg-white border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                aria-label="Technical skills"
              >
                <div className="p-3 sm:p-4">
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">Skills</h2>
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                      {portfolio.skills.map((skill, index) => (
                        <motion.div
                          key={skill.id}
                          className="px-2.5 py-1.5 rounded-md bg-black text-white text-xs whitespace-nowrap border border-gray-900"
                          initial={{ opacity: 0, y: 6 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          viewport={{ once: true }}
                        >
                          {skill.name}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right column - projects and github */}
          <div className="space-y-4 md:space-y-6">
            {/* Projects Section */}
            {portfolio.repositories && portfolio.repositories.filter(repo => repo.isVisible).length > 0 && (
              <motion.section 
                className="rounded-2xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                aria-label="Projects showcase"
              >
                <div className="">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {portfolio.repositories
                      .filter(repo => repo.isVisible)
                      .map((repo, index) => (
                      <motion.article
                        key={repo.id}
                        className="group relative cursor-pointer w-full"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -2 }}
                        onClick={() => {
                          const portfolioRepoId = repo.id
                          trackProjectClick(portfolio.id, portfolioRepoId, repo.customName || repo.repository.name)
                          // Update counters
                          setViewsCount(prev => prev + 1)
                          setProjectViews(prev => ({
                            ...prev,
                            [portfolioRepoId]: (prev[portfolioRepoId] || 0) + 1
                          }))
                          if (repo.deployedUrl) {
                            window.open(repo.deployedUrl, '_blank')
                          } else {
                            const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                            window.open(githubUrl, '_blank')
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${repo.repository.name} project`}
                      >
                        <div className="relative bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-all duration-300 w-full">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              {/* Project Icon */}
                              <div className="mb-2">
                                <ProjectIcon
                                  favicon={repo.repository.favicon}
                                  logo={repo.repository.logo}
                                  title={repo.customName || repo.repository.name}
                                  size="md"
                                />
                              </div>
                              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words mb-1">
                                {repo.customName || repo.repository.name}
                              </h3>
                              <div 
                                className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: repo.customDescription || repo.repository.description || "No description available for this project."
                                }}
                              />
                            </div>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                trackProjectClick(portfolio.id, repo.id, repo.customName || repo.repository.name)
                                setViewsCount(prev => prev + 1)
                                setProjectViews(prev => ({
                                  ...prev,
                                  [repo.id]: (prev[repo.id] || 0) + 1
                                }))
                                const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                                window.open(githubUrl, '_blank')
                              }}
                              className="flex-shrink-0 p-1.5 rounded-md bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 ml-2 border border-gray-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label={`View ${repo.repository.name} on GitHub`}
                            >
                              <SiGithub className="h-4 w-4" />
                            </motion.button>
                          </div>

                          {/* Languages and Views */}
                          <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
                            {/* Languages badges */}
                            <div className="flex items-center flex-wrap gap-2">
                              {(() => {
                                let languages: string[] = []
                                if (repo.repository.languages) {
                                  try {
                                    languages = JSON.parse(repo.repository.languages)
                                  } catch (e) {
                                    if (repo.repository.language) {
                                      languages = [repo.repository.language]
                                    }
                                  }
                                } else if (repo.repository.language) {
                                  languages = [repo.repository.language]
                                }
                                return languages
                                  .filter(lang => lang.toLowerCase() !== 'web')
                                  .map((lang, idx) => (
                                    <span key={idx} className="text-gray-700 text-xs font-medium px-2 py-1 bg-gray-100 rounded border border-gray-300">
                                      {lang}
                                    </span>
                                  ))
                              })()}
                            </div>
                            {/* Project Views */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Eye className="h-3 w-3" />
                              <span>{projectViews[repo.repository.githubId] || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* GitHub Activity Section */}
            {portfolio.user?.githubUsername ? (
              <GitHubActivity 
                username={portfolio.user.githubUsername} 
                theme="light" 
              />
            ) : (
              <div className="py-6 text-center">
                <p className="text-gray-500">GitHub username not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Socials/Skills moved into left column cards above */}

      {/* Skills moved into left column */}

      {/* Projects moved into right column with white cards and 2-col grid */}


      {/* GitHub Activity rendered in right column */}


      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-[1200px]">
          <div className="flex justify-center">
            <motion.a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Visit DevFolio homepage"
            >
              <p className="text-sm font-medium">
                <span className="text-gray-200">Powered by </span>
                <span className="text-white font-semibold">DevFolio</span>
              </p>
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
