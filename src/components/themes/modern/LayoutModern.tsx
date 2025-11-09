"use client"

import { useEffect, useState, type CSSProperties } from "react"
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
import { SkillIcon } from "@/lib/skill-icons"
import { ProjectIcon } from "@/components/ui/project-icon"
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
  description: string
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
  cvUrl?: string | null
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

interface LayoutModernProps {
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

  const visibleRepos = (portfolio.repositories || []).filter((repo: any) => repo.isVisible)
  const hasProjects = visibleRepos.length > 0
  const experiences = portfolio.experiences || []
  const hasExperience = experiences.length > 0
  const hasGithub = Boolean(portfolio.user?.githubUsername)

  const containerPaddingStyle: CSSProperties = {
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
  }

  const projectGridStyles: CSSProperties = {
    gridTemplateColumns: "repeat(auto-fit, minmax(min(17rem, 100%), 1fr))",
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: theme.colors.text }}>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={getBackgroundStyle(portfolio)}
      />

      <div
        className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 md:py-14"
        style={containerPaddingStyle}
      >
          <div className="mx-auto max-w-6xl space-y-6 sm:space-y-9 md:space-y-12">
          {/* Primary Layout */}
            <section className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,2.05fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] items-start">
              <div className="order-2 space-y-6 sm:space-y-7 md:space-y-8 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden"
              >
                  <div className="space-y-5 sm:space-y-6 p-4 sm:p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                      <Avatar className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border border-neutral-200">
                      <AvatarImage src={portfolio.profilePic || "/placeholder.svg"} alt={portfolio.displayName} />
                        <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xl sm:text-2xl md:text-3xl font-semibold">
                        {portfolio.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                      <div className="min-w-0 flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Username</p>
                          <p className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
                          @{portfolio.user?.githubUsername}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Location</p>
                          <p className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
                          {portfolio.user?.location || "Remote"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {portfolio.skills && portfolio.skills.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Capabilities</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {portfolio.skills.map((skill: any) => (
                          <span
                            key={skill.id}
                              className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-neutral-200 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-700"
                          >
                              <SkillIcon skillName={skill.name} className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
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
                    className="rounded-3xl border border-neutral-200 bg-transparent p-4 sm:p-5 md:p-6 shadow-none"
                  >
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-900 tracking-tight">
                    Work Experience
                  </h2>
                    <div className="relative mt-4 sm:mt-6 space-y-4 sm:space-y-5">
                      <span className="pointer-events-none absolute left-4 top-1 bottom-1 hidden sm:block w-px bg-neutral-200" />
                    {experiences.map((exp: any, index: number) => (
                      <motion.div
                        key={index}
                          className="relative pl-6 sm:pl-10"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                          <span className="absolute left-1 top-4 h-2.5 w-2.5 rounded-full border-2 border-white bg-neutral-300 sm:left-4" />
                        <a
                            className={`block rounded-2xl border border-neutral-200 ${exp.companyUrl ? "transition hover:-translate-y-1 hover:shadow-md" : ""} bg-white/80 p-3 sm:p-4 shadow-sm`}
                          {...(exp.companyUrl
                            ? {
                                onClick: () => window.open(exp.companyUrl!, "_blank"),
                                role: "button",
                                tabIndex: 0,
                                "aria-label": `Visit ${exp.companyName}`,
                              }
                            : {})}
                        >
                            <div className="flex items-start gap-2 sm:gap-3">
                            {exp.faviconUrl ? (
                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white">
                                <img
                                  src={exp.faviconUrl || "/placeholder.svg"}
                                  alt={exp.companyName}
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain"
                                />
                              </div>
                            ) : (
                                <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-500">
                                {exp.companyName?.charAt(0) || "•"}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-semibold text-neutral-900">{exp.companyName}</p>
                              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mt-1">
                                {[exp.role, exp.duration].filter(Boolean).join(" • ")}
                              </p>
                              {exp.description && (
                                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
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
              <div className="order-1 space-y-8 sm:space-y-10 lg:order-2">
                <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 text-xs uppercase tracking-[0.35em] text-neutral-400">
                    <span className="h-px w-8 sm:w-10 bg-neutral-300" />
                  Portfolio
                </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 leading-tight break-words">
                    {portfolio.displayName}
                  </h1>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs sm:text-sm md:text-base lg:text-lg text-neutral-500 uppercase tracking-[0.2em]">
                    {portfolio.jobTitle && <span>{portfolio.jobTitle}</span>}
                    {portfolio.user?.company && <span>• {portfolio.user.company}</span>}
                  </div>
                </div>
                  <p className="mx-auto max-w-3xl text-pretty text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-neutral-600 lg:mx-0">
                  {displayedBio}
                  {!isTypingComplete && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-neutral-400 ml-1"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2 sm:gap-3">
                  {portfolio.cvUrl && (
                    <Button
                      onClick={() => window.open(portfolio.cvUrl!, "_blank")}
                        className="h-auto rounded-full bg-neutral-900 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm tracking-wide text-white hover:bg-neutral-700"
                    >
                      Download CV
                        <Download className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  {portfolio.user?.websiteUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(portfolio.user.websiteUrl, "_blank")}
                        className="h-auto rounded-full border-neutral-300 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Portfolio Site
                        <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
                {portfolio.socials && portfolio.socials.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 sm:pt-2 lg:justify-start">
                    {portfolio.socials
                      .filter((social) => social.url)
                      .map((social) => {
                        const Icon = getSocialIcon(social.platform)
                        return (
                          <motion.button
                            key={social.id}
                            onClick={() => window.open(social.url, "_blank")}
                              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Visit ${social.platform}`}
                          >
                              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </motion.button>
                        )
                      })}
                  </div>
                )}
              </div>

              {hasProjects && (
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-900 tracking-tight">
                      Selected Work
                    </h2>
                      <p className="text-xs sm:text-sm md:text-base text-neutral-500">
                      Curated projects showcasing recent capabilities.
                    </p>
                  </div>
                    <div className="grid auto-rows-fr gap-3 sm:gap-4 md:gap-5" style={projectGridStyles}>
                    {visibleRepos.map((repo: any, index: number) => (
                      <motion.article
                        key={repo.id}
                          className="group flex h-full min-w-0 flex-col cursor-pointer rounded-xl border border-neutral-200 bg-white/90 p-3 sm:p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        onClick={() => {
                          trackProjectClick(portfolio.id, repo.id, repo.customName || repo.repository.name)
                          if (repo.deployedUrl) {
                            window.open(repo.deployedUrl, "_blank")
                          } else {
                            const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                            window.open(githubUrl, "_blank")
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${repo.repository.name} project`}
                      >
                          <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:gap-3">
                            <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                            <ProjectIcon
                              favicon={repo.repository.favicon}
                              logo={repo.repository.logo}
                              title={repo.customName || repo.repository.name}
                              size="md"
                            />
                              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-neutral-900 break-words line-clamp-2">
                              {repo.customName || repo.repository.name}
                            </h3>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              trackProjectClick(portfolio.id, repo.id, repo.customName || repo.repository.name)
                              const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                              window.open(githubUrl, "_blank")
                            }}
                              className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:bg-neutral-900 hover:text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`View ${repo.repository.name} on GitHub`}
                          >
                              <SiGithub className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </motion.button>
                        </div>

                        {repo.repository.logo &&
                          (/^https?:/i.test(repo.repository.logo) || /^data:image\//i.test(repo.repository.logo)) && (
                              <div className="mb-3 overflow-hidden rounded-xl border border-neutral-200 sm:mb-4">
                              <img
                                src={repo.repository.logo || "/placeholder.svg"}
                                alt={(repo.customName || repo.repository.name) + " preview"}
                                  className={`aspect-[16/9] w-full ${/^data:image\//i.test(repo.repository.logo) ? "object-cover object-top" : "object-cover"}`}
                                loading="lazy"
                              />
                            </div>
                          )}

                        <div
                            className="flex-1 text-xs sm:text-sm leading-relaxed text-neutral-600 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html:
                              repo.customDescription ||
                              repo.repository.description ||
                              "No description available for this project.",
                          }}
                        />

                          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
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
                              .filter((lang) => lang.toLowerCase() !== "web")
                              .slice(0, 3)
                              .map((lang, idx) => (
                                <span
                                  key={idx}
                                    className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-neutral-600 sm:px-3 sm:py-1"
                                >
                                  {lang}
                                </span>
                              ))
                          })()}
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>
              )}

              {hasGithub && (
                  <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white/95 p-3 sm:p-4 lg:p-6 shadow-sm">
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
