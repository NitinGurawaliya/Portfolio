"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  Youtube,
  ExternalLink,
  Star,
  GitFork,
  MapPin,
  Building,
  Globe,
  Wrench,
  Mail
} from "lucide-react"
import {
  SiReact, SiVuedotjs, SiAngular, SiNextdotjs, SiNuxtdotjs, SiSvelte,
  SiHtml5, SiCss3, SiJavascript, SiTypescript, SiSass, SiTailwindcss,
  SiBootstrap, SiMui, SiRedux, SiNodedotjs, SiExpress, SiDjango, SiFlask,
  SiFastapi, SiSpring, SiLaravel, SiRubyonrails, SiDotnet, SiPython,
  SiCplusplus, SiGo, SiRust, SiPhp, SiRuby, SiSwift, SiKotlin, SiDart,
  SiPostgresql, SiMysql, SiMongodb, SiRedis, SiSqlite, SiFirebase, SiSupabase,
  SiGooglecloud, SiVercel, SiNetlify, SiDocker, SiKubernetes, SiGit, SiGithub,
  SiFigma, SiPostman, SiWebpack, SiVite, SiNpm, SiYarn, SiStackoverflow, SiReddit
} from "react-icons/si"
import { FaJava, FaAws, FaMicrosoft } from "react-icons/fa"
import { TbBrandVscode } from "react-icons/tb"

// Skills database with icons and colors (same as portfolio page)
const skillsDatabase = [
  // Programming Languages
  { name: "Python", category: "Languages", icon: SiPython, color: "#3776AB" },
  { name: "Java", category: "Languages", icon: FaJava, color: "#ED8B00" },
  { name: "JavaScript", category: "Frontend", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", category: "Frontend", icon: SiTypescript, color: "#3178C6" },
  { name: "C++", category: "Languages", icon: SiCplusplus, color: "#00599C" },
  { name: "C#", category: "Languages", icon: SiDotnet, color: "#239120" },
  { name: "Go", category: "Languages", icon: SiGo, color: "#00ADD8" },
  { name: "Rust", category: "Languages", icon: SiRust, color: "#000000" },
  { name: "PHP", category: "Languages", icon: SiPhp, color: "#777BB4" },
  { name: "Ruby", category: "Languages", icon: SiRuby, color: "#CC342D" },
  { name: "Swift", category: "Languages", icon: SiSwift, color: "#FA7343" },
  { name: "Kotlin", category: "Languages", icon: SiKotlin, color: "#0095D5" },
  { name: "Dart", category: "Languages", icon: SiDart, color: "#0175C2" },
  
  // Frontend Frameworks & Libraries
  { name: "React", category: "Frontend", icon: SiReact, color: "#61DAFB" },
  { name: "Vue.js", category: "Frontend", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Angular", category: "Frontend", icon: SiAngular, color: "#DD0031" },
  { name: "Next.js", category: "Frontend", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Nuxt.js", category: "Frontend", icon: SiNuxtdotjs, color: "#00DC82" },
  { name: "Svelte", category: "Frontend", icon: SiSvelte, color: "#FF3E00" },
  { name: "HTML5", category: "Frontend", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", category: "Frontend", icon: SiCss3, color: "#1572B6" },
  { name: "Sass", category: "Frontend", icon: SiSass, color: "#CC6699" },
  { name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Bootstrap", category: "Frontend", icon: SiBootstrap, color: "#7952B3" },
  { name: "Material UI", category: "Frontend", icon: SiMui, color: "#007FFF" },
  { name: "Redux", category: "State Management", icon: SiRedux, color: "#764ABC" },
  
  // Backend Frameworks
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, color: "#339933" },
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#ffffff" },
  { name: "Django", category: "Backend", icon: SiDjango, color: "#ffffff" },
  { name: "Flask", category: "Backend", icon: SiFlask, color: "#000000" },
  { name: "FastAPI", category: "Backend", icon: SiFastapi, color: "#009688" },
  { name: "Spring Boot", category: "Backend", icon: SiSpring, color: "#6DB33F" },
  { name: "Laravel", category: "Backend", icon: SiLaravel, color: "#FF2D20" },
  { name: "Ruby on Rails", category: "Backend", icon: SiRubyonrails, color: "#CC0000" },
  { name: "ASP.NET", category: "Backend", icon: SiDotnet, color: "#512BD4" },
  
  // Databases
  { name: "PostgreSQL", category: "Database", icon: SiPostgresql, color: "#4169E1" },
  { name: "MySQL", category: "Database", icon: SiMysql, color: "#4479A1" },
  { name: "MongoDB", category: "Database", icon: SiMongodb, color: "#47A248" },
  { name: "Redis", category: "Database", icon: SiRedis, color: "#DC382D" },
  { name: "SQLite", category: "Database", icon: SiSqlite, color: "#003B57" },
  { name: "Firebase", category: "Database", icon: SiFirebase, color: "#FFCA28" },
  { name: "Supabase", category: "Database", icon: SiSupabase, color: "#3ECF8E" },
  
  // Cloud & DevOps
  { name: "AWS", category: "Cloud", icon: FaAws, color: "#FF9900" },
  { name: "Google Cloud", category: "Cloud", icon: SiGooglecloud, color: "#4285F4" },
  { name: "Azure", category: "Cloud", icon: FaMicrosoft, color: "#0078D4" },
  { name: "Docker", category: "DevOps", icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", category: "DevOps", icon: SiKubernetes, color: "#326CE5" },
  { name: "Vercel", category: "Cloud", icon: SiVercel, color: "#ffffff" },
  { name: "Netlify", category: "Cloud", icon: SiNetlify, color: "#00C7B7" },
  
  // Tools
  { name: "Git", category: "Tools", icon: SiGit, color: "#F05032" },
  { name: "GitHub", category: "Tools", icon: SiGithub, color: "#181717" },
  { name: "VS Code", category: "Tools", icon: TbBrandVscode, color: "#007ACC" },
  { name: "Figma", category: "Tools", icon: SiFigma, color: "#F24E1E" },
  { name: "Postman", category: "Tools", icon: SiPostman, color: "#FF6C37" },
  { name: "Webpack", category: "Build Tools", icon: SiWebpack, color: "#8DD6F9" },
  { name: "Vite", category: "Build Tools", icon: SiVite, color: "#646CFF" },
  { name: "npm", category: "Tools", icon: SiNpm, color: "#CB3837" },
  { name: "Yarn", category: "Tools", icon: SiYarn, color: "#2C8EBB" },
]

interface Portfolio {
  id: number
  displayName: string
  jobTitle?: string
  bio: string
  profilePic: string
  skills: Skill[]
  socials: Social[]
  repositories: PortfolioRepository[]
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

interface Social {
  id: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

interface Skill {
  id: number
  name: string
  category: string
}

interface PortfolioRepository {
  id: number
  deployedUrl: string
  isVisible: boolean
  repository: {
    id: number
    name: string
    description: string
    htmlUrl: string
    language: string
    stargazersCount: number
    forksCount: number
  }
}

interface PortfolioPreviewProps {
  username?: string
  previewMode: "desktop" | "tablet" | "mobile"
  portfolio: Portfolio | null
}

export function PortfolioPreview({ username, previewMode, portfolio }: PortfolioPreviewProps) {
  if (!portfolio) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900/60 to-black rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white text-sm">Loading preview...</p>
        </div>
      </div>
    )
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'React': 'bg-cyan-500',
      'Vue': 'bg-emerald-500',
      'Angular': 'bg-red-500',
      'Node.js': 'bg-green-600',
      'Go': 'bg-cyan-600',
      'Rust': 'bg-orange-600',
      'C++': 'bg-blue-600',
      'C#': 'bg-purple-500',
    }
    return colors[language] || 'bg-gray-500'
  }

  const getSkillData = (skillName: string) => {
    return skillsDatabase.find(skill => skill.name === skillName)
  }

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      github: Github,
      email: Mail,
      twitter: Twitter,
      linkedin: Linkedin,
      instagram: Instagram,
      facebook: Facebook,
      youtube: Youtube,
      stackoverflow: SiStackoverflow,
      reddit: SiReddit,
    }
    return icons[platform] || Globe
  }

  return (
    <div className="w-full h-full overflow-hidden bg-black rounded-xl">
      {/* Dark Background - only for preview container */}
      <div className="absolute inset-0 z-0  rounded-xl"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto" style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none' 
      }}>
          {/* Hero Section */}
          <div className={`relative z-10 ${previewMode === 'mobile' ? 'pt-2 pb-1' : previewMode === 'tablet' ? 'pt-3 pb-2' : 'pt-4 pb-2'}`}>
            <div className={`${previewMode === 'mobile' ? 'px-2' : previewMode === 'tablet' ? 'px-3' : 'px-4'} ${previewMode === 'mobile' ? 'max-w-[280px]' : previewMode === 'tablet' ? 'max-w-[420px]' : 'max-w-full'} mx-auto`}>
              <div className="relative">
                {/* Profile Picture and Social Icons - Same Row */}
                <div className={`flex items-center justify-between ${previewMode === 'mobile' ? 'mb-2' : 'mb-3'}`}>
                  <div className="relative">
                    <Avatar className={`${previewMode === 'mobile' ? 'w-12 h-12' : previewMode === 'tablet' ? 'w-16 h-16' : 'w-20 h-20'} border-2 border-gray-700 bg-gray-800 relative shadow-lg`}>
                      <AvatarImage src={portfolio.profilePic} className="object-cover" />
                      <AvatarFallback className="bg-gray-900 text-white text-xl font-bold">
                        {portfolio.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Social Icons - Aligned with Profile Picture */}
                  <div className={`flex ${previewMode === 'mobile' ? 'gap-1' : 'gap-2'}`}>
                    {portfolio.socials && portfolio.socials
                      .filter((social: any) => social.isPinned)
                      .map((social: any, index: number) => {
                        const Icon = getSocialIcon(social.platform)
                        return (
                          <div
                            key={social.id}
                            className={`${previewMode === 'mobile' ? 'p-1.5' : 'p-2'} rounded-xl bg-transparent border border-orange-500/30 text-orange-400 hover:bg-black/20 hover:border-orange-500/50 hover:text-orange-300 transition-all duration-300`}
                          >
                            <Icon className={`${previewMode === 'mobile' ? 'h-3 w-3' : previewMode === 'tablet' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Profile Content */}
                <div>
                  <h1 className={`${previewMode === 'mobile' ? 'text-sm' : previewMode === 'tablet' ? 'text-base' : 'text-lg'} font-medium mb-1 text-white`}>
                    {portfolio.displayName}
                  </h1>
                  
                  {portfolio.jobTitle && (
                    <p className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-base'} text-orange-300 mb-1 font-bold`}>
                      {portfolio.jobTitle}
                    </p>
                  )}
                  
                  {portfolio.user.company && (
                    <p className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} text-gray-400 mb-1 font-medium`}>
                      {portfolio.user.company}
                    </p>
                  )}
                  
                  <p className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} text-gray-400 ${previewMode === 'mobile' ? 'mb-2' : 'mb-3'} leading-relaxed max-w-xl`}>
                    {portfolio.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {portfolio.skills && portfolio.skills.length > 0 && (
            <div className={`relative z-10 ${previewMode === 'mobile' ? 'py-1' : previewMode === 'tablet' ? 'py-2' : 'py-2'}`}>
              <div className={`${previewMode === 'mobile' ? 'px-2' : previewMode === 'tablet' ? 'px-3' : 'px-4'} ${previewMode === 'mobile' ? 'max-w-[280px]' : previewMode === 'tablet' ? 'max-w-[420px]' : 'max-w-full'} mx-auto`}>
                <h2 className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-md'} font-semibold ${previewMode === 'mobile' ? 'mb-2' : 'mb-3'} text-white`}>
                  Skills
                </h2>
                <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-3 gap-1' : previewMode === 'tablet' ? 'grid-cols-4 gap-2' : 'grid-cols-4 gap-2'}`}>
                  {portfolio.skills.map((skill) => {
                    const skillData = getSkillData(skill.name)
                    const IconComponent = skillData?.icon || Wrench
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`group relative flex flex-col items-center ${previewMode === 'mobile' ? 'p-1' : 'p-1.5'} backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-lg hover:bg-black/20 hover:border-orange-500/50 transition-all duration-200`}
                      >
                        <div className={`flex-shrink-0 ${previewMode === 'mobile' ? 'w-6 h-6 mb-1' : previewMode === 'tablet' ? 'w-8 h-8 mb-1' : 'w-10 h-10 mb-1'} flex items-center justify-center`}>
                          <IconComponent 
                            className={`${previewMode === 'mobile' ? 'w-3 h-3' : previewMode === 'tablet' ? 'w-4 h-4' : 'w-5 h-5'} drop-shadow-lg`}
                            style={{ 
                              color: skillData?.color || '#00ffff',
                              filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))'
                            }}
                          />
                        </div>
                        <span className={`${previewMode === 'mobile' ? 'text-[8px]' : previewMode === 'tablet' ? 'text-[9px]' : 'text-xs'} font-medium text-white text-center`}>
                          {skill.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {portfolio.repositories && portfolio.repositories.length > 0 && (
            <div className={`relative z-10 ${previewMode === 'mobile' ? 'py-1' : previewMode === 'tablet' ? 'py-2' : 'py-2'}`}>
              <div className={`${previewMode === 'mobile' ? 'px-2' : previewMode === 'tablet' ? 'px-3' : 'px-4'} ${previewMode === 'mobile' ? 'max-w-[280px]' : previewMode === 'tablet' ? 'max-w-[420px]' : 'max-w-full'} mx-auto`}>
                <h2 className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-md'} font-semibold ${previewMode === 'mobile' ? 'mb-2' : 'mb-3'} text-white`}>
                  Featured Projects
                </h2>
                <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-1 gap-2' : previewMode === 'tablet' ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-4'}`}>
                  {portfolio.repositories
                    .filter(repo => repo.isVisible)
                    .map((repo) => (
                    <div 
                      key={repo.id} 
                      className={`group relative cursor-pointer bg-transparent border border-orange-500/30 rounded-lg ${previewMode === 'mobile' ? 'p-2' : previewMode === 'tablet' ? 'p-2.5' : 'p-3'} hover:bg-black/20 hover:border-orange-500/50 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 mr-2">
                          <h3 className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} font-bold text-white group-hover:text-gray-200 transition-colors duration-200 mb-1`}>
                            {previewMode === 'mobile' 
                              ? (repo.repository.name.length > 12 ? `${repo.repository.name.substring(0, 12)}...` : repo.repository.name)
                              : (repo.repository.name.length > 14 ? `${repo.repository.name.substring(0, 14)}...` : repo.repository.name)
                            }
                          </h3>
                          {repo.repository.description && (
                            <p className={`${previewMode === 'mobile' ? 'text-[9px]' : previewMode === 'tablet' ? 'text-[10px]' : 'text-xs'} text-gray-400 line-clamp-1 mb-2`}>
                              {repo.repository.description || "No description available for this project."}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`${previewMode === 'mobile' ? 'p-1' : previewMode === 'tablet' ? 'p-1.5' : 'p-2'} rounded-lg bg-transparent border border-orange-500/40 text-orange-300 hover:bg-black/30 hover:text-white transition-all duration-200`}>
                            <Github className={`${previewMode === 'mobile' ? 'h-2.5 w-2.5' : previewMode === 'tablet' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Language badge */}
                      <div className="flex items-center">
                        {repo.repository.language && (
                          <div className={`flex items-center ${previewMode === 'mobile' ? 'px-1.5 py-0.5' : previewMode === 'tablet' ? 'px-2 py-1' : 'px-2 py-1'} rounded-full bg-transparent border border-orange-500/40`}>
                            <div className={`${previewMode === 'mobile' ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full ${getLanguageColor(repo.repository.language)} ${previewMode === 'mobile' ? 'mr-1' : 'mr-1.5'}`}></div>
                            <span className={`${previewMode === 'mobile' ? 'text-[8px]' : previewMode === 'tablet' ? 'text-[9px]' : 'text-[10px]'} text-gray-200 font-medium`}>{repo.repository.language}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Get in Touch Section */}
          <div className={`relative z-10 ${previewMode === 'mobile' ? 'py-2' : previewMode === 'tablet' ? 'py-3' : 'py-4'}`}>
            <div className={`${previewMode === 'mobile' ? 'px-2' : previewMode === 'tablet' ? 'px-3' : 'px-4'} ${previewMode === 'mobile' ? 'max-w-[280px]' : previewMode === 'tablet' ? 'max-w-[420px]' : 'max-w-full'} mx-auto`}>
              <h2 className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-md'} font-semibold ${previewMode === 'mobile' ? 'mb-2' : 'mb-3'} text-white`}>
                Get in touch
              </h2>
              <div className={`flex justify-center ${previewMode === 'mobile' ? 'gap-2' : 'gap-3'} flex-wrap`}>
                {portfolio.socials && portfolio.socials
                  .filter((social: any) => social.username && social.username.trim())
                  .map((social: any, index: number) => {
                    const Icon = getSocialIcon(social.platform)
                    
                    // Platform-specific colors and styles
                    const platformStyles = {
                      github: { 
                        bg: 'bg-gray-800/60', 
                        border: 'border-gray-500/30', 
                        text: 'text-gray-300', 
                        hover: 'hover:bg-gray-700/60 hover:text-white hover:border-gray-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-gray-500/20'
                      },
                      email: { 
                        bg: 'bg-slate-700/60', 
                        border: 'border-slate-500/30', 
                        text: 'text-slate-300', 
                        hover: 'hover:bg-slate-600/60 hover:text-white hover:border-slate-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-slate-500/20'
                      },
                      twitter: { 
                        bg: 'bg-blue-800/60', 
                        border: 'border-blue-500/30', 
                        text: 'text-blue-300', 
                        hover: 'hover:bg-blue-700/60 hover:text-blue-200 hover:border-blue-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-blue-500/20'
                      },
                      instagram: { 
                        bg: 'bg-pink-800/60', 
                        border: 'border-pink-500/30', 
                        text: 'text-pink-300', 
                        hover: 'hover:bg-pink-700/60 hover:text-pink-200 hover:border-pink-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-pink-500/20'
                      },
                      linkedin: { 
                        bg: 'bg-blue-900/60', 
                        border: 'border-blue-600/30', 
                        text: 'text-blue-300', 
                        hover: 'hover:bg-blue-800/60 hover:text-blue-200 hover:border-blue-500/50',
                        shadow: 'hover:shadow-lg hover:shadow-blue-600/20'
                      },
                      facebook: { 
                        bg: 'bg-blue-700/60', 
                        border: 'border-blue-500/30', 
                        text: 'text-blue-300', 
                        hover: 'hover:bg-blue-600/60 hover:text-blue-200 hover:border-blue-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-blue-500/20'
                      },
                      youtube: { 
                        bg: 'bg-red-800/60', 
                        border: 'border-red-500/30', 
                        text: 'text-red-300', 
                        hover: 'hover:bg-red-700/60 hover:text-red-200 hover:border-red-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-red-500/20'
                      },
                      stackoverflow: { 
                        bg: 'bg-orange-800/60', 
                        border: 'border-orange-500/30', 
                        text: 'text-orange-300', 
                        hover: 'hover:bg-orange-700/60 hover:text-orange-200 hover:border-orange-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-orange-500/20'
                      },
                      reddit: { 
                        bg: 'bg-orange-700/60', 
                        border: 'border-orange-500/30', 
                        text: 'text-orange-300', 
                        hover: 'hover:bg-orange-600/60 hover:text-orange-200 hover:border-orange-400/50',
                        shadow: 'hover:shadow-lg hover:shadow-orange-500/20'
                      }
                    }
                    
                    const style = platformStyles[social.platform as keyof typeof platformStyles] || platformStyles.github
                    const rotations = [5, -5, 3, -3, 7, -7, 4, -4]
                    const rotation = rotations[index % rotations.length]
                    
                    return (
                      <div
                        key={social.id}
                        className={`${previewMode === 'mobile' ? 'p-1.5' : 'p-2'} rounded-2xl backdrop-blur-xl ${style.bg} border ${style.border} ${style.text} ${style.hover} ${style.shadow} transition-all duration-300`}
                      >
                        <Icon className={`${previewMode === 'mobile' ? 'h-3 w-3' : previewMode === 'tablet' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`relative z-10 ${previewMode === 'mobile' ? 'py-2' : previewMode === 'tablet' ? 'py-3' : 'py-4'}`}>
            <div className={`${previewMode === 'mobile' ? 'px-2' : previewMode === 'tablet' ? 'px-3' : 'px-4'} ${previewMode === 'mobile' ? 'max-w-[280px]' : previewMode === 'tablet' ? 'max-w-[420px]' : 'max-w-full'} mx-auto text-center`}>
              <div className={`backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-2xl ${previewMode === 'mobile' ? 'p-2' : previewMode === 'tablet' ? 'p-3' : 'p-4'}`}>
                <p className={`${previewMode === 'mobile' ? 'text-[9px]' : previewMode === 'tablet' ? 'text-[10px]' : 'text-xs'} text-gray-300 font-medium`}>
                  Built with{" "}
                  <span className="text-red-400">
                    ❤️
                  </span>
                  {" "}using{" "}
                  <span className="text-white font-bold">
                    Portfolio
                  </span>
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}