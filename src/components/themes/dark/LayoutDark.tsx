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

interface LayoutDarkProps {
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
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }
    case 'cross':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)'
      }
    case 'waves':
      return {
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
      }
    case 'stars':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }
    default:
      return {}
  }
}

export default function LayoutDark({ theme, portfolio }: LayoutDarkProps) {
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
      baseStyle.background = 'linear-gradient(to bottom right, #111827, #000000)'
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
      className="min-h-screen relative"
      style={{ 
        color: theme.colors.text 
      }}
    >
      {/* Customizable Background */}
      <div 
        className="fixed inset-0 z-0"
        style={getBackgroundStyle()}
      />

      {/* Main Container - Two Column Layout on Large Screens */}
      <div className="relative z-10 pt-8 md:pt-12 lg:pt-16 pb-6 md:pb-8 lg:pb-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          {/* Two Column Grid - Left: User Info, Right: Projects */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
            
            {/* LEFT COLUMN - User Info & Skills (1/3 width on large screens) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:pr-4">
              
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group flex justify-center lg:justify-start mb-4"
              >
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-3 border-orange-500/20 bg-gray-800 relative shadow-2xl group-hover:border-orange-500/40 transition-all duration-300">
                  <AvatarImage 
                    src={portfolio.profilePic} 
                    className="object-cover" 
                    alt={`${portfolio.displayName}'s profile picture`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white text-3xl lg:text-4xl font-bold">
                    {portfolio.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all duration-300 -z-10"></div>
              </motion.div>

              {/* Name & Handle */}
              <motion.div 
                className="text-center lg:text-left space-y-1"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  {portfolio.displayName}
                </h1>
                {portfolio.jobTitle && (
                  <p className="text-sm sm:text-base md:text-lg text-orange-300 font-semibold">
                    {portfolio.jobTitle}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-orange-400">
                  @{portfolio.user?.githubUsername || 'user'}
                </p>
              </motion.div>

              {/* Bio */}
              <motion.p 
                className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed text-center lg:text-left"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {displayedBio}
                {!isTypingComplete && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-orange-400 ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </motion.p>

              {/* Location & Company Info */}
              <motion.div 
                className="space-y-2 text-sm text-gray-400 text-center lg:text-left"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                {portfolio.user.location && (
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span>📍</span>
                    <span>{portfolio.user.location}</span>
                  </div>
                )}
                {portfolio.user.company && (
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <Building className="h-4 w-4" />
                    <span>{portfolio.user.company}</span>
                  </div>
                )}
              </motion.div>

              {/* Social Icons */}
              {portfolio.socials && portfolio.socials.filter(social => social.isPinned).length > 0 && (
                <motion.div 
                  className="flex gap-2 justify-center lg:justify-start flex-wrap"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {portfolio.socials
                    .filter(social => social.isPinned)
                    .map((social, index) => {
                      const Icon = getSocialIcon(social.platform)
                      return (
                        <motion.button
                          key={social.id}
                          onClick={() => window.open(social.url, '_blank')}
                          className="group p-2 rounded-xl bg-gray-900/50 border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-300 transition-all duration-300 backdrop-blur-sm"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          aria-label={`Visit ${social.platform} profile`}
                        >
                          <Icon className="h-4 w-4 group-hover:drop-shadow-lg" />
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
                  <h2 className="text-base sm:text-lg font-bold mb-3 text-white text-center lg:text-left">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {portfolio.skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-900/40 border border-orange-500/20 hover:bg-gray-800/60 hover:border-orange-500/40 transition-all duration-300 cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`${skill.name} skill`}
                      >
                        <SkillIcon skillName={skill.name} className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                          {skill.name}
                        </span>
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
                    className="text-base sm:text-lg font-bold mb-3 text-white text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Work Experience
                  </motion.h2>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-orange-500/20" />
                    <div className="space-y-3">
                      {portfolio.experiences.map((exp: any, idx: number) => (
                        <motion.div key={idx} className="relative pl-8"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_2px_rgba(249,115,22,0.15)]" />
                          <div className="border border-orange-500/30 rounded-lg p-2.5 bg-transparent">
                            <div className="flex items-start gap-2">
                              {exp.faviconUrl ? (
                                <img src={exp.faviconUrl} alt={exp.companyName} className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              ) : (
                                <div className="h-4 w-4 mt-0.5 rounded bg-gray-700 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-xs break-words">
                                  {exp.companyName}
                                  {exp.role ? <span className="text-gray-400 font-normal"> • {exp.role}</span> : null}
                                  {exp.duration ? <span className="text-gray-400 font-normal"> • {exp.duration}</span> : null}
                                </div>
                                {exp.description && (
                                  <div className="text-gray-300 text-xs mt-1 whitespace-pre-line leading-relaxed">{exp.description}</div>
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
                    className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    Projects
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.article
                  key={repo.id}
                  className="group relative cursor-pointer h-fit w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    // Track project click using PortfolioRepository ID
                    // repo.id is now the PortfolioRepository ID
                    const portfolioRepoId = repo.id
                    console.log(`🔍 DEBUG: Dark theme - Project click data:`, {
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
                  <div className="relative bg-transparent border border-orange-500/30 rounded-lg p-4 sm:p-6 hover:border-orange-500/50 transition-all duration-300 h-full flex flex-col w-full">
                    {/* OG image preview for public card only */}
                    {repo.repository.logo && (/^https?:/i.test(repo.repository.logo) || /^data:image\//i.test(repo.repository.logo)) && (
                      <div className="mb-4 -mt-1 overflow-hidden rounded-md">
                        <img
                          src={repo.repository.logo}
                          alt={(repo.customName || repo.repository.name) + ' preview'}
                          className={`w-full aspect-[16/9] ${/^data:image\//i.test(repo.repository.logo) ? 'object-cover object-top' : 'object-cover'}`}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4 min-w-0">
                        {/* Project Icon at the top */}
                        <div className="mb-3">
                          <ProjectIcon
                            favicon={repo.repository.favicon}
                            logo={repo.repository.logo}
                            title={repo.customName || repo.repository.name}
                            size="md"
                          />
                        </div>
                        
                        {/* Project Name */}
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300 break-words mb-2">
                          {repo.customName || repo.repository.name}
                        </h3>
                        <div 
                          className="text-gray-400 text-sm sm:text-base leading-relaxed mb-3 break-words prose prose-sm max-w-none prose-invert"
                          dangerouslySetInnerHTML={{
                            __html: repo.customDescription || repo.repository.description || "No description available for this project."
                          }}
                        />
                        
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Track project click (GitHub button) using PortfolioRepository ID
                          const portfolioRepoId = repo.id
                          trackProjectClick(portfolio.id, portfolioRepoId, repo.customName || repo.repository.name)
                          const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                          window.open(githubUrl, '_blank')
                        }}
                        className="flex-shrink-0 p-2 rounded-lg bg-transparent border border-orange-500/40 text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/60 hover:text-white transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`View ${repo.repository.name} on GitHub`}
                      >
                        <SiGithub className="h-4 w-4" />
                      </motion.button>
                    </div>
                    
                    {/* All Languages badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
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
                            <span key={idx} className="text-orange-300 text-xs sm:text-sm font-medium px-2 py-1 bg-orange-500/10 rounded border border-orange-500/30">
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
                  theme="dark" 
                />
              )}

            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-4 lg:py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="flex justify-end">
            <motion.a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Visit DevFolio homepage"
            >
              <p className="text-sm font-medium">
                <span className="text-gray-600">Powered by </span>
                <span className="text-blue-600 font-semibold">DevFolio</span>
              </p>
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
