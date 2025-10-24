import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Building } from "lucide-react"
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
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-50 to-white"></div>

      {/* Hero Section - Centered Layout */}
      <motion.section 
        className="relative z-10 pt-6 md:pt-8 lg:pt-10 pb-2 md:pb-3 lg:pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-label="Profile introduction"
      >
        <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="text-left space-y-2 sm:space-y-3 lg:space-y-4">
            {/* Profile Picture */}
            <motion.div
              className="flex justify-start"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Avatar className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 border-2 sm:border-4 border-cyan-400/30 bg-white shadow-lg sm:shadow-2xl">
                <AvatarImage 
                  src={portfolio.profilePic} 
                  className="object-cover" 
                  alt={`${portfolio.displayName}'s profile picture`}
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 text-3xl lg:text-4xl font-bold">
                  {portfolio.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Name */}
            <motion.h1 
              className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {portfolio.displayName}
            </motion.h1>

            {/* Job Title */}
            {portfolio.jobTitle && (
              <motion.p 
                className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-purple-600 font-semibold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {portfolio.jobTitle}
              </motion.p>
            )}

            {/* Bio */}
              <motion.p 
                className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {displayedBio}
              {!isTypingComplete && (
                <motion.span
                  className="inline-block w-0.5 h-5 bg-purple-600 ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.p>

          </div>
        </div>
      </motion.section>

      {/* Social Icons Section - Above Skills */}
      {portfolio.socials && portfolio.socials.length > 0 && (
        <motion.section 
          className="relative z-10 py-2 md:py-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-label="Social media links"
        >
          <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl">
            <div className="flex justify-start gap-2 xs:gap-3 sm:gap-4 md:gap-6 flex-wrap">
              {portfolio.socials
                .filter(social => social.username && social.username.trim())
                .map((social, index) => {
                  const Icon = getSocialIcon(social.platform)
                  
                  const platformStyles = {
                    github: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-md'
                    },
                    email: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-md'
                    },
                    twitter: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-md'
                    },
                    x: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-gray-700/40'
                    },
                    instagram: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-purple-500/40'
                    },
                    linkedin: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-blue-600/40'
                    },
                    facebook: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-blue-500/40'
                    },
                    youtube: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-red-500/40'
                    },
                    stackoverflow: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
                      shadow: 'hover:shadow-xl hover:shadow-orange-500/40'
                    },
                    reddit: { 
                      bg: 'bg-white', 
                      border: 'border-gray-200', 
                      text: 'text-gray-800', 
                      hover: 'hover:bg-orange-600/90 hover:text-white hover:border-orange-300/70',
                      shadow: 'hover:shadow-xl hover:shadow-orange-400/40'
                    }
                  }
                  
                  const style = platformStyles[social.platform as keyof typeof platformStyles] || platformStyles.github
                  const rotations = [5, -5, 3, -3, 7, -7, 4, -4]
                  const rotation = rotations[index % rotations.length]
                  
                  return (
                    <motion.button
                      key={social.id}
                      onClick={() => window.open(social.url, '_blank')}
                      className={`p-2 xs:p-3 sm:p-4 rounded-lg ${style.bg} border ${style.border} ${style.text} ${style.hover} ${style.shadow} transition-all duration-300 shadow-sm`}
                      whileHover={{ scale: 1.1, y: -3, rotate: rotation }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      aria-label={`Visit ${social.platform} profile`}
                    >
                      <Icon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    </motion.button>
                  )
                })}
            </div>
          </div>
        </motion.section>
      )}

      {/* Skills Section - Auto Scrolling */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <motion.section 
          className="relative z-10 py-2 md:py-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-label="Technical skills"
        >
          <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl">
            <motion.h2 
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-6 text-gray-900 text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Skills I've Learned
            </motion.h2>
            
            {/* Manual Scroll Skills Grid */}
            <div className="overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
              <div className="flex gap-2 xs:gap-3 sm:gap-4 py-1 xs:py-2 min-w-max">
                {portfolio.skills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    className="group relative flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${skill.name} skill`}
                  >
                    <div className="bg-black text-white px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-md xs:rounded-lg font-medium text-xs xs:text-sm hover:bg-gray-800 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-700 whitespace-nowrap">
                      {skill.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Projects Section */}
      {portfolio.repositories && portfolio.repositories.filter(repo => repo.isVisible).length > 0 && (
        <motion.section 
          className="relative z-10 py-3 md:py-4 lg:py-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-label="Projects showcase"
        >
          <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl">
            <motion.h2 
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 xs:mb-3 sm:mb-4 md:mb-6 text-gray-900 text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Projects I've Made
            </motion.h2>
            <div className="grid grid-cols-1 gap-2 xs:gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2 xs:px-4">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.article
                  key={repo.id}
                  className="group relative cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    // Track project click
                    // Use GitHub repository ID for analytics
                    const githubRepoId = repo.repository.id
                    console.log(`🔍 DEBUG: Light theme - Project click data:`, {
                      portfolioId: portfolio.id,
                      projectId: githubRepoId,
                      projectName: repo.customName || repo.repository.name,
                      projectIdType: typeof githubRepoId,
                      portfolioIdType: typeof portfolio.id,
                      repoId: repo.id,
                      repoRepositoryId: repo.repository.id
                    })
                    trackProjectClick(portfolio.id, githubRepoId, repo.customName || repo.repository.name)
                    
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
                  <div className="relative bg-gray-100 rounded-lg p-2 xs:p-3 sm:p-4 md:p-6 hover:bg-gray-200 transition-all duration-300 border border-gray-200 w-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {/* Project Icon at the top */}
                        <div className="mb-2">
                          <ProjectIcon
                            favicon={repo.repository.favicon}
                            logo={repo.repository.logo}
                            title={repo.customName || repo.repository.name}
                            size="md"
                          />
                        </div>
                        
                        {/* Project Name */}
                        <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-800 break-words mb-1 xs:mb-2">
                          {repo.customName || repo.repository.name}
                        </h3>
                        <div 
                          className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed break-words prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: repo.customDescription || repo.repository.description || "No description available for this project."
                          }}
                        />
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Track project click (GitHub button)
                          trackProjectClick(portfolio.id, repo.repository.id, repo.customName || repo.repository.name)
                          const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                          window.open(githubUrl, '_blank')
                        }}
                        className="flex-shrink-0 p-1.5 rounded-md bg-transparent text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-all duration-300 ml-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`View ${repo.repository.name} on GitHub`}
                      >
                        <SiGithub className="h-3 w-3 xs:h-4 xs:w-4" />
                      </motion.button>
                    </div>
                    
                    {/* All Languages badges */}
                    <div className="flex items-center flex-wrap gap-2 mt-auto">
                      {(() => {
                        // Parse languages from JSON string
                        let languages: string[] = []
                        if (repo.repository.languages) {
                          try {
                            languages = JSON.parse(repo.repository.languages)
                          } catch (e) {
                            // Fallback to single language
                            if (repo.repository.language) {
                              languages = [repo.repository.language]
                            }
                          }
                        } else if (repo.repository.language) {
                          languages = [repo.repository.language]
                        }
                        
                        return languages
                          .filter(lang => lang.toLowerCase() !== 'web') // Filter out "Web" tag
                          .map((lang, idx) => (
                            <span key={idx} className="text-gray-700 text-xs sm:text-sm font-medium px-2 py-1 bg-gray-200 rounded border border-gray-300">
                              {lang}
                            </span>
                          ))
                      })()}
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
        <div className="py-8 text-center">
          <p className="text-gray-500">GitHub username not available</p>
        </div>
      )}


      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-3 lg:py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="flex justify-center">
            <motion.a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Visit DevFolio homepage"
            >
              <p className="text-sm font-medium">
                <span className="text-gray-300">Powered by </span>
                <span className="text-blue-400 font-semibold">DevFolio</span>
              </p>
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
