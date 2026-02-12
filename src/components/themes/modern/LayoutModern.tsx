"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Globe } from "lucide-react"
import {
  SiGithub,
  SiX,
  SiLinkedin,
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiGmail,
  SiStackoverflow,
  SiReddit,
} from "react-icons/si"
import { SkillIcon, getSkillIcon } from "@/lib/skill-icons"
import { ProjectIcon } from "@/components/ui/project-icon"
import { GitHubActivity } from "@/components/GitHubActivity"
import { trackProjectClick } from "@/lib/analytics-utils"
import { PublicShiplogList } from "@/components/shiplog/PublicShiplogList"
import { getProjectSlugMap } from "@/lib/project-slug"
import { truncateWords } from "@/lib/text"
import { Code2, TrendingUp, Users as UsersIcon } from "lucide-react"
import type { SocialIconComponent, ThemeConfig, ThemePortfolioData } from "@/components/themes/types"

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

interface LayoutModernProps {
  theme: ThemeConfig
  portfolio: ThemePortfolioData
}

const getSocialIcon = (platform: string) => {
  const icons: Record<string, SocialIconComponent> = {
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

  const subtle = "rgba(17,17,17,0.06)"
  const bold = "rgba(17,17,17,0.12)"

  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, ${subtle} 1px, transparent 1px)`,
        backgroundSize: "18px 18px",
      }
    case "grid":
      return {
        backgroundImage: `linear-gradient(${subtle} 1px, transparent 1px), linear-gradient(90deg, ${subtle} 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }
    case "cross":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 14px, ${subtle} 14px, ${subtle} 15px)`,
      }
    case "waves":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${subtle} 4px, ${subtle} 5px)`,
      }
    case "stars":
      return {
        backgroundImage: `radial-gradient(circle at 2px 2px, ${bold} 1.5px, transparent 0)`,
        backgroundSize: "28px 28px",
      }
    case "sprinkles":
      return {
        backgroundImage: `
          radial-gradient(circle, ${bold} 0.6px, transparent 0.6px),
          radial-gradient(circle, ${subtle} 0.6px, transparent 0.6px)
        `,
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 12px 12px",
      }
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 18px, ${subtle} 18px, ${subtle} 19px)`,
      }
    case "mesh":
      return {
        backgroundImage: `
          radial-gradient(60% 60% at 20% 20%, ${bold} 0%, transparent 65%),
          radial-gradient(50% 50% at 80% 0%, ${subtle} 0%, transparent 60%),
          radial-gradient(70% 70% at 30% 80%, ${subtle} 0%, transparent 65%)
        `,
        backgroundBlendMode: "screen",
      }
    default:
      return {}
  }
}

export default function LayoutModern({ theme, portfolio }: LayoutModernProps) {
  const [displayedBio, setDisplayedBio] = useState("")
  const [bioIndex, setBioIndex] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    if (!portfolio.bio) {
      setIsTypingComplete(true)
      return
    }

    if (bioIndex < portfolio.bio.length) {
      const timeout = setTimeout(() => {
        setDisplayedBio(portfolio.bio.slice(0, bioIndex + 1))
        setBioIndex(bioIndex + 1)
      }, 20)
      return () => clearTimeout(timeout)
    } else {
      setIsTypingComplete(true)
    }
  }, [bioIndex, portfolio.bio])

  const getBackgroundStyle = (portfolio: PortfolioData): CSSProperties => {
    const baseStyle: CSSProperties = {}
    const bgColor = portfolio.backgroundColor || null

    if (bgColor && typeof bgColor === "string" && bgColor.trim() !== "") {
      baseStyle.background = bgColor
    } else {
      baseStyle.background = "linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)"
    }

    const patternStyle =
      portfolio.backgroundPattern &&
      typeof portfolio.backgroundPattern === "string" &&
      portfolio.backgroundPattern.trim() !== ""
        ? getPatternStyle(portfolio.backgroundPattern)
        : {}

    return {
      ...baseStyle,
      ...patternStyle,
    }
  }

  const visibleRepos = (portfolio.repositories || []).filter((repo) => repo.isVisible)
  const hasProjects = visibleRepos.length > 0
  const experiences = portfolio.experiences || []
  const hasExperience = experiences.length > 0
  const hasGithub = Boolean(portfolio.user?.githubUsername)
  const projectSlugMap = useMemo(
    () => getProjectSlugMap(portfolio.repositories || []),
    [portfolio.repositories]
  )
  const portfolioSlug =
    portfolio.customUsername ||
    portfolio.user?.githubUsername ||
    ""

  return (
    <div className="min-h-screen relative" style={{ color: theme.colors.text }}>
      <div className="fixed inset-0 z-0" style={getBackgroundStyle(portfolio)} />

      <div className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 xs:py-8 sm:py-10 md:py-14">
        <div className="max-w-6xl mx-auto space-y-6 xs:space-y-8 sm:space-y-10 md:space-y-12">
          {/* Primary Layout */}
          <section className="grid grid-cols-1 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-12 xl:gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,2.05fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] items-start">
            <div className="space-y-6 xs:space-y-7 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden"
              >
                <div className="p-4 xs:p-5 sm:p-6 space-y-5 xs:space-y-6">
                  <div className="flex flex-col xs:flex-col sm:flex-row items-center sm:items-start gap-3 xs:gap-4">
                    <Avatar className="w-16 xs:w-20 sm:w-24 h-16 xs:h-20 sm:h-24 border border-neutral-200 flex-shrink-0">
                      <AvatarImage src={portfolio.profilePic || "/placeholder.svg"} alt={portfolio.displayName} />
                      <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xl xs:text-2xl sm:text-3xl font-semibold">
                        {portfolio.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 xs:space-y-3 text-center sm:text-left flex-1 min-w-0">
                      <div>
                        <p className="text-xs xs:text-sm font-semibold text-neutral-800 truncate">
                          @{portfolio.user?.githubUsername}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Location</p>
                        <p className="text-xs xs:text-sm font-semibold text-neutral-800 truncate">
                          {portfolio.user?.location || "Remote"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {portfolio.skills && portfolio.skills.length > 0 && (
                    <div className="space-y-2 xs:space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Capabilities</p>
                      <div className="flex flex-wrap gap-1.5 xs:gap-2">
                        {portfolio.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="flex items-center gap-1.5 xs:gap-2 rounded-full border border-neutral-200 bg-white px-2.5 xs:px-3 py-1 xs:py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-700"
                          >
                            <SkillIcon skillName={skill.name} className="h-3 xs:h-3.5 w-3 xs:w-3.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">{skill.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {hasExperience && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="rounded-3xl border border-neutral-200 bg-transparent p-4 xs:p-5 sm:p-6 shadow-none"
                >
                  <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
                    Work Experience
                  </h2>
                  <div className="relative mt-4 xs:mt-6 pl-4 xs:pl-6 space-y-4 xs:space-y-5">
                    <span className="absolute left-[10px] xs:left-[11px] top-1 bottom-1 w-px bg-neutral-200" />
                    {experiences.map((exp, index: number) => (
                      <motion.div
                        key={index}
                        className="relative"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <span className="absolute left-[-14px] xs:left-[-17px] top-4 h-2.5 xs:h-3.5 w-2.5 xs:w-3.5 rounded-full border-2 border-white bg-neutral-300" />
                        <a
                          className={`block rounded-2xl border border-neutral-200 ${exp.companyUrl ? "hover:-translate-y-1 hover:shadow-md transition" : ""} bg-white/80 p-3 xs:p-4 shadow-sm`}
                          {...(exp.companyUrl
                            ? {
                                onClick: () => window.open(exp.companyUrl!, "_blank"),
                                role: "button",
                                tabIndex: 0,
                                "aria-label": `Visit ${exp.companyName}`,
                              }
                            : {})}
                        >
                          <div className="flex items-start gap-2 xs:gap-3">
                            {exp.faviconUrl ? (
                              <div className="flex h-8 xs:h-9 w-8 xs:w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white">
                                <img
                                  src={exp.faviconUrl || "/placeholder.svg"}
                                  alt={exp.companyName}
                                  className="h-3.5 xs:h-4 w-3.5 xs:w-4 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex h-8 xs:h-9 w-8 xs:w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-500">
                                {exp.companyName?.charAt(0) || "•"}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs xs:text-sm font-semibold text-neutral-900">{exp.companyName}</p>
                              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mt-1">
                                {[exp.role, exp.duration].filter(Boolean).join(" • ")}
                              </p>
                              {exp.description && (
                                <p className="mt-2 xs:mt-3 text-xs xs:text-sm text-neutral-600 leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-8 xs:space-y-10">
              <div className="space-y-4 xs:space-y-6 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 text-xs uppercase tracking-[0.35em] text-neutral-400">
                  <span className="h-px w-8 xs:w-10 bg-neutral-300" />
                  Portfolio
                </div>
                <div className="space-y-2 xs:space-y-3">
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight break-words">
                    {portfolio.displayName}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 xs:gap-3 text-xs xs:text-sm sm:text-base md:text-lg text-neutral-500 uppercase tracking-[0.2em]">
                    {portfolio.jobTitle && <span>{portfolio.jobTitle}</span>}
                    {portfolio.user?.company && <span>• {portfolio.user.company}</span>}
                  </div>
                </div>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg text-neutral-600 max-w-3xl leading-relaxed mx-auto lg:mx-0">
                  {displayedBio}
                  {!isTypingComplete && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-neutral-400 ml-1"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}
                </p>
                <div className="flex flex-col xs:flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2 xs:gap-3">
                  {portfolio.cvUrl && (
                    <Button
                      onClick={() => window.open(portfolio.cvUrl!, "_blank")}
                      className="rounded-full bg-neutral-900 text-white px-5 xs:px-6 py-2 xs:py-2.5 h-auto text-xs xs:text-sm tracking-wide hover:bg-neutral-700"
                    >
                      Download CV
                      <Download className="h-3.5 xs:h-4 w-3.5 xs:w-4 ml-2" />
                    </Button>
                  )}
                  {portfolio.user?.websiteUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(portfolio.user.websiteUrl, "_blank")}
                      className="rounded-full border-neutral-300 text-neutral-700 px-5 xs:px-6 py-2 xs:py-2.5 h-auto text-xs xs:text-sm hover:bg-neutral-100"
                    >
                      Portfolio Site
                      <ExternalLink className="h-3.5 xs:h-4 w-3.5 xs:w-4 ml-2" />
                    </Button>
                  )}
                </div>
                {portfolio.socials && portfolio.socials.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 xs:gap-2 pt-1 xs:pt-2">
                    {portfolio.socials
                      .filter((social) => social.url)
                      .map((social) => {
                        const Icon = getSocialIcon(social.platform)
                        return (
                          <motion.button
                            key={social.id}
                            onClick={() => window.open(social.url, "_blank")}
                            className="inline-flex h-8 xs:h-9 w-8 xs:w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:text-neutral-900 hover:border-neutral-400"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Visit ${social.platform}`}
                          >
                            <Icon className="h-3 xs:h-3.5 w-3 xs:w-3.5" />
                          </motion.button>
                        )
                      })}
                  </div>
                )}
              </div>

              {hasProjects && (
                <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                      Selected Work
                    </h2>
                    <p className="text-xs xs:text-sm sm:text-base text-neutral-500">
                      Curated projects showcasing recent capabilities.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                      {visibleRepos.map((repo, index: number) => {
                        const projectSlug = projectSlugMap[repo.id]
                        const projectHref =
                          projectSlug && portfolioSlug
                            ? `/${portfolioSlug}/${projectSlug}`
                            : undefined

                          const descriptionText = truncateWords(repo.customDescription || repo.repository.description, 18)
                          const cardContent = (
                          <motion.article
                              className={`group flex w-full min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer ${repo.technologies ? 'h-full' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true }}
                          >
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
                                    <span className="inline-flex items-center text-[10px] font-semibold rounded-sm px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                      <UsersIcon className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                      {repo.projectUsers.toLocaleString()}
                                    </span>
                                  )}
                                  {repo.projectStatus && (
                                    <span className="inline-flex items-center text-[10px] font-semibold rounded-sm px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                      <span className="mr-1">●</span>
                                      {repo.projectStatus}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Name */}
                              <h3 className="text-sm xs:text-base font-semibold text-neutral-900 break-words mb-2 line-clamp-2">
                                {repo.customName || repo.repository.name}
                              </h3>

                              {/* Description */}
                              {descriptionText && (
                                <p className="text-xs text-neutral-600 leading-relaxed mb-3 line-clamp-2">
                                  {descriptionText}
                                </p>
                              )}

                              {/* Categories */}
                              {repo.projectCategory && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {repo.projectCategory.split(',').map((cat: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {cat.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Tech Stack - Only show if there are technologies/languages to display */}
                              {(() => {
                                let techStackItems: string[] = []
                                
                                if (repo.technologies) {
                                  techStackItems = repo.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
                                } else {
                                  // Fallback to GitHub languages
                                  if (repo.repository.languages) {
                                    try {
                                      techStackItems = JSON.parse(repo.repository.languages)
                                    } catch (e) {
                                      if (repo.repository.language) {
                                        techStackItems = [repo.repository.language]
                                      }
                                    }
                                  } else if (repo.repository.language) {
                                    techStackItems = [repo.repository.language]
                                  }
                                }
                                
                                // Filter out 'web' and empty items
                                techStackItems = techStackItems.filter(lang => lang.toLowerCase() !== 'web' && lang.trim() !== '')
                                
                                // Only render if there are items to show
                                if (techStackItems.length === 0) return null
                                
                                return (
                                  <div className="mb-2">
                                    <div className="flex items-center gap-1 mb-1.5">
                                      <Code2 className="h-3 w-3 text-neutral-500" />
                                      <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-wide">Tech Stack</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {techStackItems.map((tech, idx) => {
                                        const IconComponent = getSkillIcon(tech)
                                        return (
                                          <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium rounded-md px-1.5 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200">
                                            {IconComponent ? (
                                              <SkillIcon skillName={tech} className="h-3 w-3" />
                                            ) : null}
                                            <span>{tech}</span>
                                          </span>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })()}

                            {/* Language badges removed - now shown in Tech Stack section above */}
                          </motion.article>
                        )

                        if (projectHref) {
                          return (
                            <Link
                              key={repo.id}
                              href={projectHref}
                              className="group flex h-full w-full"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cardContent}
                            </Link>
                          )
                        }

                        return (
                          <div key={repo.id} className="group flex h-full w-full">
                            {cardContent}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

                {portfolio.shiplogs && portfolio.shiplogs.length > 0 ? (
                  <div className="rounded-3xl border border-neutral-200 bg-white/95 p-3 xs:p-4 sm:p-5 shadow-sm">
                    <PublicShiplogList shiplogs={portfolio.shiplogs} />
                  </div>
                ) : null}

                {hasGithub && (
                <div className="w-full rounded-3xl border border-neutral-200 bg-white/95 p-3 xs:p-4 sm:p-4 lg:p-6 shadow-sm overflow-hidden">
                  <GitHubActivity username={portfolio.user.githubUsername!} theme="light" />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
