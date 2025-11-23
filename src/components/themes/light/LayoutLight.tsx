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
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.12) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }
    case 'sprinkles':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 0.6px, transparent 0.6px), radial-gradient(circle, rgba(0,0,0,0.08) 0.6px, transparent 0.6px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      }
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 14px, rgba(0,0,0,0.04) 14px, rgba(0,0,0,0.04) 15px)'
      }
    case 'mesh':
      return {
        backgroundImage: 'radial-gradient(60% 60% at 20% 20%, rgba(0,0,0,0.14) 0%, transparent 65%), radial-gradient(50% 50% at 80% 0%, rgba(0,0,0,0.1) 0%, transparent 60%), radial-gradient(70% 70% at 30% 80%, rgba(0,0,0,0.08) 0%, transparent 65%)',
        backgroundBlendMode: 'screen'
      }
    default:
      return {}
  }
}

export default function LayoutLight({ theme, portfolio }: LayoutLightProps) {
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
      <div className="relative z-10 pt-6 md:pt-8 lg:pt-10 pb-4 md:pb-6 lg:pb-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-screen-xl">
          {/* Two Column Grid - Left: User Info, Right: Projects */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
            
            {/* LEFT COLUMN - User Info & Skills (1/3 width on large screens) */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:pr-4">
              
              {/* Profile Picture */}
              <motion.div
                className="flex justify-start mb-2"
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
                className="text-left"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-xl font-bold text-gray-800 leading-snug">
                  {portfolio.displayName}
                </h1>
                {portfolio.jobTitle && (
                  <p className="text-sm sm:text-base md:text-base lg:text-sm text-purple-600 font-semibold mt-0.5">
                    {portfolio.jobTitle}
                  </p>
                )}
              </motion.div>

              {/* Bio */}
              <motion.p 
                className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed text-left mt-1"
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
                    className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium text-gray-900">Download CV</span>
                    <div className="bg-gray-100 rounded-md p-1.5">
                      <Download className="h-4 w-4 text-gray-700" />
                    </div>
                  </motion.button>
                </motion.div>
              )}

              {/* Social Icons */}
              {portfolio.socials && portfolio.socials.length > 0 && (
                <motion.div 
                  className="flex gap-1.5 justify-start flex-wrap"
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
                  className="pt-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Technical skills"
                >
                    <h2 className="mb-3 text-base font-semibold text-gray-900 text-left">
                    Skills
                  </h2>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
                      {portfolio.skills.map((skill, index) => (
                        <motion.div
                          key={skill.id}
                          className="group flex-shrink-0 sm:flex-shrink"
                          initial={{ opacity: 0, y: 6 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm transition-all duration-300 group-hover:border-gray-300 group-hover:shadow-md">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-inner">
                              <SkillIcon skillName={skill.name} className="h-3.5 w-3.5" />
                            </span>
                            <span className="whitespace-nowrap">{skill.name}</span>
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
                      className="mb-3 text-base font-semibold text-gray-900 text-left"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      Work Experience
                    </motion.h2>
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                      <div className="space-y-3">
                        {portfolio.experiences.map((exp: any, idx: number) => (
                          <motion.div
                            key={idx}
                            className="relative pl-8"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            viewport={{ once: true }}
                          >
                            <div className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-orange-400" />
                            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="flex items-start gap-3">
                                {exp.faviconUrl ? (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
                                    <img src={exp.faviconUrl} alt={exp.companyName} className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
                                    {exp.companyName?.charAt(0) ?? "•"}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="text-sm font-semibold text-gray-900 break-words">
                                    {exp.companyName}
                                  </div>
                                  <div className="text-xs font-medium text-gray-500">
                                    {[exp.role, exp.duration].filter(Boolean).join(" • ")}
                                  </div>
                                  {exp.description && (
                                    <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-line">
                                      {exp.description}
                                    </p>
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
            <div className="lg:col-span-8 xl:col-span-8 space-y-8 lg:space-y-10">

              {/* Projects Section */}
              {portfolio.repositories && portfolio.repositories.filter(repo => repo.isVisible).length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  aria-label="Projects showcase"
                  className="mt-6 lg:mt-8"
                >
                    <motion.h2
                      className="mb-3 text-base font-semibold text-gray-900 sm:mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      Projects I've Made
                    </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
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
                        className="group relative flex h-full w-full cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -2 }}
                      >
                          <div className="relative flex h-full w-full min-h-[190px] flex-col rounded-2xl border border-gray-200 bg-white p-3 xs:p-4 sm:p-4 transition-all duration-300 hover:border-gray-300">
                            {/* Top Right: Status + Users */}
                            {(repo.projectStatus || typeof repo.projectUsers === "number") && (
                              <div className="absolute top-3 right-3 xs:top-4 xs:right-4 sm:top-4 sm:right-4 flex items-center gap-1.5">
                                {repo.projectStatus && (
                                  <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-green-100 text-green-800 border border-green-200">
                                    <span className="mr-1">●</span>
                                    {repo.projectStatus}
                                  </span>
                                )}
                                {typeof repo.projectUsers === "number" && (
                                  <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                    <UsersIcon className="h-2.5 w-2.5 mr-1" />
                                    {repo.projectUsers.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Header: Icon/Name */}
                            <div className="flex items-start mb-2 pr-24">
                              <div className="flex-1 min-w-0">
                                <div className="mb-0 flex items-center gap-2">
                                  <ProjectIcon
                                    favicon={repo.repository.favicon}
                                    logo={repo.repository.logo}
                                    title={repo.customName || repo.repository.name}
                                    size="sm"
                                  />
                                  <h3 className="text-sm xs:text-base font-semibold text-gray-900 break-words mb-1">
                                    {repo.customName || repo.repository.name}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {descriptionText && (
                              <p className="text-xs xs:text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
                                {descriptionText}
                              </p>
                            )}

                            {/* Categories */}
                            {/* {repo.projectCategory && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {repo.projectCategory.split(',').map((cat: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-white text-gray-900 border border-black">
                                    {cat.trim()}
                                  </span>
                                ))}
                              </div>
                            )} */}

                            {/* Tech Stack */}
                            {repo.technologies && (
                              <div className="mt-2">
                                <div className="flex items-center gap-1 mb-1.5">
                                  <Code2 className="h-3 w-3 text-gray-500" />
                                  <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Tech Stack</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {repo.technologies.split(',').map((tech: string, idx: number) => {
                                    const techName = tech.trim()
                                    const IconComponent = getSkillIcon(techName)
                                    return (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md px-1.5 py-1 bg-slate-100 text-slate-700 border border-slate-200">
                                        {IconComponent ? (
                                          <SkillIcon skillName={techName} className="h-3 w-3" />
                                        ) : null}
                                        <span>{techName}</span>
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center flex-wrap gap-1.5 mt-auto pt-1.5">
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
                                    <span key={idx} className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 sm:text-sm">
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
        <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
          <div className="flex justify-center">
            <motion.a
              href="https://devfolio.cc"
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
