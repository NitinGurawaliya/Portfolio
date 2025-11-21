import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Building, Download, Code2, TrendingUp, Users as UsersIcon } from "lucide-react"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"
import { SkillIcon, getSkillIcon } from "@/lib/skill-icons"
import { PublicShiplogList } from "@/components/shiplog/PublicShiplogList"
import { useState, useEffect, useMemo } from "react"
import { GitHubActivity } from "@/components/GitHubActivity"
import { trackProjectClick } from "@/lib/analytics-utils"
import { getProjectSlugMap } from "@/lib/project-slug"
import { truncateWords } from "@/lib/text"

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return null
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toLocaleString()}`
}

// Helper function to check if a URL is a GitHub repository URL
const isGitHubUrl = (url?: string | null) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').filter(Boolean).length >= 2
  } catch {
    return false
  }
}

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
  customUsername?: string | null
  skills: any[]
  socials: any[]
  repositories: any[]
  experiences?: any[]
  backgroundColor?: string | null
  backgroundPattern?: string | null
  cvUrl?: string | null
    shiplogs?: any[]
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
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }
    case 'sprinkles':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.16) 0.6px, transparent 0.6px), radial-gradient(circle, rgba(255,255,255,0.1) 0.6px, transparent 0.6px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      }
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 14px, rgba(255,255,255,0.14) 14px, rgba(255,255,255,0.14) 15px)'
      }
    case 'mesh':
      return {
        backgroundImage: 'radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.18) 0%, transparent 65%), radial-gradient(50% 50% at 80% 0%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(70% 70% at 30% 80%, rgba(255,255,255,0.1) 0%, transparent 65%)',
        backgroundBlendMode: 'screen'
      }
    default:
      return {}
  }
}

export default function LayoutDark({ theme, portfolio }: LayoutDarkProps) {
  const [displayedBio, setDisplayedBio] = useState('')
  const [bioIndex, setBioIndex] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const projectSlugMap = useMemo(
    () => getProjectSlugMap(portfolio.repositories || []),
    [portfolio.repositories]
  )
  const portfolioSlug =
    portfolio.customUsername ||
    portfolio.user?.githubUsername ||
    portfolio.displayName ||
    ""

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
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-screen-xl">
          {/* Two Column Grid - Left: User Info, Right: Projects */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
            
            {/* LEFT COLUMN - User Info & Skills (1/3 width on large screens) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:pr-4">
              
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group flex justify-center lg:justify-start mb-2"
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
                className="text-center lg:text-left space-y-0.5"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
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

              {/* Download CV Button */}
              {portfolio.cvUrl && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <motion.button
                    onClick={() => {
                      window.open(portfolio.cvUrl!, '_blank')
                    }}
                    className="w-full flex items-center justify-between bg-white/10 border border-gray-700 rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 text-left backdrop-blur-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium text-white">Download CV</span>
                    <div className="bg-white/20 rounded-md p-1.5">
                      <Download className="h-4 w-4 text-white" />
                    </div>
                  </motion.button>
                </motion.div>
              )}

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
                  className="flex gap-1.5 justify-center lg:justify-start flex-wrap"
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
                  className="pt-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Technical skills"
                >
                  <h2 className="text-base sm:text-lg font-bold mb-3 text-white text-center lg:text-left">
                    Skills
                  </h2>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:justify-center lg:justify-start">
                    {portfolio.skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        className="group relative flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/20 bg-gray-900/40 px-2.5 py-1 hover:bg-gray-800/60 hover:border-orange-500/40 transition-all duration-300 cursor-pointer sm:flex-shrink"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`${skill.name} skill`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800/80 shadow-inner">
                            <SkillIcon skillName={skill.name} className="w-3.5 h-3.5" />
                          </span>
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
                  .map((repo, index) => {
                    const projectSlug = projectSlugMap[repo.id]
                    const projectHref =
                      projectSlug && portfolioSlug
                        ? `/${portfolioSlug}/${projectSlug}`
                        : undefined

                      const descriptionText = truncateWords(repo.customDescription || repo.repository.description, 18)
                      const cardContent = (
                      <motion.article
                        className={`group relative flex w-full cursor-pointer ${repo.technologies ? 'h-full' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02, y: -4 }}
                      >
                          <div className={`relative bg-transparent border border-orange-500/30 rounded-lg p-4 sm:p-4 hover:border-orange-500/40 transition-all duration-300 flex flex-col w-full ${repo.technologies ? 'h-full min-h-[190px]' : ''}`}>
                            {/* Top Row: Logo, Users, Status */}
                            <div className="flex items-center justify-between mb-3">
                              <ProjectIcon
                                favicon={repo.repository.favicon}
                                logo={repo.repository.logo}
                                title={repo.customName || repo.repository.name}
                                size="sm"
                              />
                              <div className="flex items-center gap-1.5">
                                {typeof repo.projectUsers === "number" && (
                                  <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                                    <UsersIcon className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                    {repo.projectUsers.toLocaleString()}
                                  </span>
                                )}
                                {repo.projectStatus && (
                                  <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 whitespace-nowrap">
                                    <span className="mr-1">●</span>
                                    {repo.projectStatus}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Name */}
                            <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-orange-300 transition-colors duration-300 break-words mb-2">
                              {repo.customName || repo.repository.name}
                            </h3>

                            {/* Description */}
                            {descriptionText && (
                              <p className="text-gray-400 text-sm leading-relaxed mb-3 break-words line-clamp-2">
                                {descriptionText}
                              </p>
                            )}

                            {/* Categories */}
                            {repo.projectCategory && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {repo.projectCategory.split(',').map((cat: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center text-xs font-semibold rounded-full px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/30">
                                    {cat.trim()}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Tech Stack */}
                            {repo.technologies && (
                              <div className="mb-2">
                                <div className="flex items-center gap-1 mb-2">
                                  <Code2 className="h-3 w-3 text-white/50" />
                                  <span className="text-[9px] font-medium text-white/50 uppercase tracking-wide">Tech Stack</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {repo.technologies.split(',').map((tech: string, idx: number) => {
                                    const techName = tech.trim()
                                    const IconComponent = getSkillIcon(techName)
                                    return (
                                      <span key={idx} className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 transition-colors">
                                        {IconComponent ? (
                                          <SkillIcon skillName={techName} className="h-3.5 w-3.5" />
                                        ) : null}
                                        <span>{techName}</span>
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div className={`flex items-center flex-wrap gap-2 ${repo.technologies ? 'mt-auto pt-2' : 'mt-3 pt-2'}`}>
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
                                    <span key={idx} className="text-orange-300 text-xs sm:text-sm font-medium px-2 py-1 bg-orange-500/10 rounded border border-orange-500/30">
                                      {lang}
                                    </span>
                                  ))
                              })()}
                            </div>
                          </div>
                      </motion.article>
                    )

                    if (projectHref) {
                      return (
                        <Link
                          key={repo.id}
                          href={projectHref}
                          className="group relative flex h-full w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cardContent}
                        </Link>
                      )
                    }

                    return (
                      <div key={repo.id} className="group relative flex h-full w-full">
                        {cardContent}
                      </div>
                    )
                  })}
                  </div>
                </motion.section>
              )}

                {portfolio.shiplogs && portfolio.shiplogs.length > 0 ? (
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    aria-label="Shiplog updates"
                  >
                    <PublicShiplogList shiplogs={portfolio.shiplogs} />
                  </motion.section>
                ) : null}

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
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl">
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
