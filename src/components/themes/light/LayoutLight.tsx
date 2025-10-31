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
  experiences?: any[]
  backgroundColor?: string | null
  backgroundPattern?: string | null
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

const getPatternStyle = (pattern: string | null) => {
  if (!pattern) return {}
  
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'cross':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)'
      }
    case 'waves':
      return {
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)'
      }
    case 'stars':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }
    default:
      return {}
  }
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

  // Get background customization
  // Properly handle background style - ensure no conflicts
  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {}
    
    // Safely handle backgroundColor - check for null, undefined, or empty string
    const bgColor = portfolio.backgroundColor || null
    
    // If backgroundColor is set (not null/undefined/empty), use it; otherwise use default gradient
    if (bgColor && typeof bgColor === 'string' && bgColor.trim() !== '') {
      baseStyle.backgroundColor = bgColor
    } else {
      baseStyle.background = 'linear-gradient(to bottom right, #f9fafb, #ffffff)'
    }
    
    // Apply pattern if exists (safely handle null/undefined)
    const patternStyle = (portfolio.backgroundPattern && 
                          typeof portfolio.backgroundPattern === 'string' && 
                          portfolio.backgroundPattern.trim() !== '')
      ? getPatternStyle(portfolio.backgroundPattern)
      : {}
    
    return {
      ...baseStyle,
      ...patternStyle
    }
  }

  return (
    <div 
      className="min-h-screen scroll-smooth relative"
      style={{ 
        color: theme.colors.text,
        scrollBehavior: 'smooth'
      }}
    >
      {/* Customizable Background */}
      <div 
        className="fixed inset-0 z-0"
        style={getBackgroundStyle()}
      />

      {/* Main Container - Two Column Layout on Large Screens */}
      <div className="relative z-10 pt-6 md:pt-8 lg:pt-10 pb-2 md:pb-3 lg:pb-4">
        <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl">
          {/* Two Column Grid - Left: User Info, Right: Projects */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
            
            {/* LEFT COLUMN - User Info & Skills (1/3 width on large screens) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:pr-4">
              
              {/* Profile Picture */}
              <motion.div
                className="flex justify-start mb-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-cyan-400/30 bg-white shadow-lg">
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

              {/* Name & Handle */}
              <motion.div 
                className="text-left space-y-1"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  {portfolio.displayName}
                </h1>
                {portfolio.jobTitle && (
                  <p className="text-sm sm:text-base md:text-lg text-purple-600 font-semibold">
                    {portfolio.jobTitle}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-purple-500">
                  @{portfolio.user?.githubUsername || 'user'}
                </p>
              </motion.div>

              {/* Bio */}
              <motion.p 
                className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed text-left"
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

              {/* Social Icons */}
              {portfolio.socials && portfolio.socials.length > 0 && (
                <motion.div 
                  className="flex gap-2 justify-start flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Social media links"
                >
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
                      className={`p-2 rounded-lg ${style.bg} border ${style.border} ${style.text} ${style.hover} ${style.shadow} transition-all duration-300 shadow-sm`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      aria-label={`Visit ${social.platform} profile`}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>
                  )
                })}
                </motion.div>
              )}

              {/* Skills Section */}
              {portfolio.skills && portfolio.skills.length > 0 && (
                <motion.section 
                  className="pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Technical skills"
                >
                  <h2 className="text-base sm:text-lg font-bold mb-3 text-gray-900 text-left">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {portfolio.skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        className="group relative"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`${skill.name} skill`}
                      >
                        <div className="bg-black text-white px-2.5 py-1 rounded-md font-medium text-xs hover:bg-gray-800 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-700 whitespace-nowrap">
                          {skill.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Work Experience Section */}
              {portfolio.experiences && portfolio.experiences.length > 0 && (
                <motion.section 
                  className="pt-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Work experience"
                >
                  <motion.h2 
                    className="text-base sm:text-lg font-bold mb-3 text-gray-900 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Work Experience
                  </motion.h2>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300" />
                    <div className="space-y-3">
                      {portfolio.experiences.map((exp: any, idx: number) => (
                        <motion.div key={idx} className="relative pl-8"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-gray-700" />
                          <div className="border border-gray-200 rounded-lg p-2.5 bg-transparent">
                            <div className="flex items-start gap-2">
                              {exp.faviconUrl ? (
                                <img src={exp.faviconUrl} alt={exp.companyName} className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              ) : (
                                <div className="h-4 w-4 mt-0.5 rounded bg-gray-300 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-gray-900 font-semibold text-xs break-words">
                                  {exp.companyName}
                                  {exp.role ? <span className="text-gray-500 font-normal"> • {exp.role}</span> : null}
                                  {exp.duration ? <span className="text-gray-500 font-normal"> • {exp.duration}</span> : null}
                                </div>
                                {exp.description && (
                                  <div className="text-gray-700 text-xs mt-1 whitespace-pre-line leading-relaxed">{exp.description}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

            </div>

            {/* RIGHT COLUMN - Projects & GitHub Activity (2/3 width on large screens) */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-8">

              {/* Projects Section */}
              {portfolio.repositories && portfolio.repositories.filter(repo => repo.isVisible).length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Projects showcase"
                >
                  <motion.h2 
                    className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-gray-900"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Projects I've Made
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                    // Track project click using PortfolioRepository ID
                    // repo.id is now the PortfolioRepository ID
                    const portfolioRepoId = repo.id
                    console.log(`🔍 DEBUG: Light theme - Project click data:`, {
                      portfolioId: portfolio.id,
                      projectId: portfolioRepoId,
                      projectName: repo.customName || repo.repository.name,
                      projectIdType: typeof portfolioRepoId,
                      portfolioIdType: typeof portfolio.id,
                      repoId: repo.id,
                      repoRepositoryId: repo.repository.id
                    })
                    trackProjectClick(portfolio.id, portfolioRepoId, repo.customName || repo.repository.name)
                    
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
                  <div className="relative bg-transparent rounded-lg p-2 xs:p-3 sm:p-4 md:p-6 hover:bg-gray-200/20 transition-all duration-300 border border-gray-200 w-full">
                    {/* OG image preview for public card only */}
                    {repo.repository.logo && (/^https?:/i.test(repo.repository.logo) || /^data:image\//i.test(repo.repository.logo)) && (
                      <div className="mb-2 -mt-1 overflow-hidden rounded-md">
                        <img
                          src={repo.repository.logo}
                          alt={(repo.customName || repo.repository.name) + ' preview'}
                          className={`w-full aspect-[16/9] ${/^data:image\//i.test(repo.repository.logo) ? 'object-cover object-top' : 'object-cover'}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                    
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
                        // Track project click (GitHub button) using PortfolioRepository ID
                        trackProjectClick(portfolio.id, repo.id, repo.customName || repo.repository.name)
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
                    
                    {/* Languages */}
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
                </motion.section>
              )}

              {/* GitHub Activity Section */}
              {portfolio.user?.githubUsername && (
                <GitHubActivity 
                  username={portfolio.user.githubUsername} 
                  theme="light" 
                />
              )}

            </div>
          </div>
        </div>
      </div>


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
