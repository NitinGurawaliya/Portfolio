"use client"

import { useEffect, useState, type CSSProperties, useMemo } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Globe, MapPin, Building2 } from "lucide-react"
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

interface LayoutNocturneProps {
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

  const subtle = "rgba(14,165,233,0.08)"
  const bold = "rgba(59,130,246,0.12)"

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
        backgroundImage: `radial-gradient(circle at 2px 2px, ${bold} 2px, transparent 0)`,
        backgroundSize: "26px 26px",
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
          radial-gradient(60% 60% at 20% 20%, rgba(14,165,233,0.18) 0%, transparent 65%),
          radial-gradient(50% 50% at 80% 0%, rgba(79,70,229,0.18) 0%, transparent 60%),
          radial-gradient(70% 70% at 30% 80%, rgba(59,130,246,0.15) 0%, transparent 65%)
        `,
        backgroundBlendMode: "screen",
      }
    default:
      return {}
  }
}

export default function LayoutNocturne({ theme, portfolio }: LayoutNocturneProps) {
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
        setBioIndex((prev) => prev + 1)
      }, 18)
      return () => clearTimeout(timeout)
    } else {
      setIsTypingComplete(true)
    }
  }, [bioIndex, portfolio.bio])

  const backgroundStyle = useMemo((): CSSProperties => {
    const base: CSSProperties = {
      background: "linear-gradient(135deg, #050816 0%, #0f172a 55%, #111827 100%)",
    }

    const overrideColor = portfolio.backgroundColor
    if (overrideColor && typeof overrideColor === "string" && overrideColor.trim() !== "") {
      base.background = overrideColor
    }

    const pattern = portfolio.backgroundPattern
    if (pattern && typeof pattern === "string" && pattern.trim() !== "") {
      return {
        ...base,
        ...getPatternStyle(pattern),
      }
    }

    return base
  }, [portfolio.backgroundColor, portfolio.backgroundPattern])

  const visibleRepos = (portfolio.repositories || []).filter((repo: any) => repo.isVisible)
  const experiences = portfolio.experiences || []
  const hasProjects = visibleRepos.length > 0
  const hasExperience = experiences.length > 0
  const hasSkills = (portfolio.skills || []).length > 0
  const hasSocials = (portfolio.socials || []).some((social: any) => Boolean(social.url))
  const hasGithub = Boolean(portfolio.user?.githubUsername)

  const safeAreaStyle: CSSProperties = {
    paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)",
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
  }

  const themeStyles: CSSProperties = {
    color: theme.colors.text,
    ["--accent-color" as any]: theme.colors.accent || "#38bdf8",
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100" style={themeStyles}>
      <div aria-hidden="true" className="absolute inset-0 -z-20" style={backgroundStyle} />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25)_0%,_transparent_55%)]"
      />
      <div
        className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12"
        style={safeAreaStyle}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-14 lg:gap-16">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 shadow-2xl backdrop-blur-xl"
          >
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                    <span className="h-px w-8 bg-slate-700" />
                    Portfolio
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
                    {portfolio.displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-300/90">
                    {portfolio.jobTitle && (
                      <span className="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs sm:text-sm uppercase tracking-widest text-slate-200">
                        {portfolio.jobTitle}
                      </span>
                    )}
                    {portfolio.user?.company && (
                      <span className="inline-flex items-center gap-2 text-slate-300">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {portfolio.user.company}
                      </span>
                    )}
                    {portfolio.user?.location && (
                      <span className="inline-flex items-center gap-2 text-slate-300">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {portfolio.user.location}
                      </span>
                    )}
                  </div>
                  <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300/90 text-pretty">
                    {displayedBio}
                    {!isTypingComplete && (
                      <motion.span
                        className="ml-1 inline-block h-4 w-1.5 rounded-sm bg-slate-300/80"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}
                  </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {portfolio.cvUrl && (
                    <Button
                      onClick={() => window.open(portfolio.cvUrl!, "_blank")}
                      className="h-auto rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium tracking-wide text-slate-900 transition hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      Download CV
                      <Download className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {portfolio.user?.websiteUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(portfolio.user.websiteUrl, "_blank")}
                      className="h-auto rounded-full border-slate-700 bg-transparent px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-900/70"
                    >
                      Portfolio Site
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative border-t border-slate-800/60 lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(56,189,248,0.18),transparent_55%)]" />
                <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border border-slate-700 bg-slate-900">
                      <AvatarImage src={portfolio.profilePic || "/placeholder.svg"} alt={portfolio.displayName} />
                      <AvatarFallback className="bg-slate-800 text-2xl font-semibold text-slate-200">
                        {portfolio.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">GitHub</p>
                        <p className="font-semibold text-slate-100">@{portfolio.user?.githubUsername}</p>
                      </div>
                      {portfolio.user?.websiteUrl && (
                        <button
                          onClick={() => window.open(portfolio.user!.websiteUrl, "_blank")}
                          className="group inline-flex items-center gap-2 text-xs font-medium text-sky-300 transition hover:text-sky-200"
                        >
                          Visit personal site
                          <ExternalLink className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {hasSocials && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connect</p>
                      <div className="flex flex-wrap gap-2">
                        {portfolio.socials
                          .filter((social: any) => Boolean(social.url))
                          .map((social: any) => {
                            const Icon = getSocialIcon(social.platform)
                            return (
                              <motion.button
                                key={social.id}
                                onClick={() => window.open(social.url, "_blank")}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/70 text-slate-200 transition hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`Visit ${social.platform}`}
                              >
                                <Icon className="h-4 w-4" />
                              </motion.button>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {(hasSkills || hasSocials) && (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              {hasSkills && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-100">Core Stack</h2>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                      {portfolio.skills.length} skills
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {portfolio.skills.map((skill: any) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200"
                      >
                        <SkillIcon skillName={skill.name} className="h-4 w-4" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-100">At a Glance</h2>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                    Quick facts
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Location</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {portfolio.user?.location || "Available worldwide"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Company</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {portfolio.user?.company || "Independent"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Open to</p>
                    <p className="mt-1 font-medium text-slate-100">
                      Freelance • Remote • Collaborations
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Contact</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {portfolio.socials?.find((social: any) => social.platform === "email")?.username ||
                        `${portfolio.displayName.split(" ")[0]}@hey.com`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {hasProjects && (
            <section className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50">Selected Work</h2>
                  <p className="text-sm text-slate-400">A curation of recent products and experiments.</p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                  {visibleRepos.length} projects
                </span>
              </motion.div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleRepos.map((repo: any, index: number) => (
                  <motion.article
                    key={repo.id}
                    className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg transition hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-3">
                        <ProjectIcon
                          favicon={repo.repository.favicon}
                          logo={repo.repository.logo}
                          title={repo.customName || repo.repository.name}
                          size="lg"
                        />
                        <h3 className="truncate text-lg font-semibold text-slate-100">
                          {repo.customName || repo.repository.name}
                        </h3>
                        <div
                          className="text-sm leading-relaxed text-slate-300 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html:
                              repo.customDescription ||
                              repo.repository.description ||
                              "No description available for this project.",
                          }}
                        />
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          trackProjectClick(portfolio.id, repo.id, repo.customName || repo.repository.name)
                          const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                          window.open(githubUrl, "_blank")
                        }}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View ${repo.repository.name} on GitHub`}
                      >
                        <SiGithub className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(() => {
                        let languages: string[] = []
                        if (repo.repository.languages) {
                          try {
                            languages = JSON.parse(repo.repository.languages)
                          } catch (error) {
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
                              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-300"
                            >
                              {lang}
                            </span>
                          ))
                      })()}
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          )}

          {hasExperience && (
            <section className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <h2 className="text-2xl font-semibold text-slate-50">Experience</h2>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                  {experiences.length} roles
                </span>
              </motion.div>

              <div className="relative space-y-5 border-l border-slate-800/80 pl-6">
                {experiences.map((exp: any, index: number) => (
                  <motion.div
                    key={`${exp.companyName}-${index}`}
                    className="relative rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5 sm:p-6"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                  >
                    <span className="absolute -left-[30px] top-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-900 bg-sky-400/80 shadow" />
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-semibold text-slate-100">{exp.companyName}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          {[exp.role, exp.duration].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-sm leading-relaxed text-slate-300">{exp.description}</p>
                      )}
                      {exp.companyUrl && (
                        <button
                          onClick={() => window.open(exp.companyUrl!, "_blank")}
                          className="inline-flex w-max items-center gap-2 text-xs font-medium text-sky-300 transition hover:text-sky-200"
                        >
                          Visit company
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {hasGithub && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6 lg:p-8 shadow-2xl"
            >
              <GitHubActivity username={portfolio.user.githubUsername!} theme="dark" />
            </motion.section>
          )}
        </div>
      </div>
    </div>
  )
}
