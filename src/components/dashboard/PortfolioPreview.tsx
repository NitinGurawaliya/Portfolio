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
  Wrench
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

// Skills database (same as portfolio page)
const skillsDatabase = [
  { name: "Python", category: "Languages", icon: SiPython, color: "#3776AB" },
  { name: "Java", category: "Languages", icon: FaJava, color: "#ED8B00" },
  { name: "JavaScript", category: "Frontend", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", category: "Frontend", icon: SiTypescript, color: "#3178C6" },
  { name: "React", category: "Frontend", icon: SiReact, color: "#61DAFB" },
  { name: "Vue.js", category: "Frontend", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Angular", category: "Frontend", icon: SiAngular, color: "#DD0031" },
  { name: "Next.js", category: "Frontend", icon: SiNextdotjs, color: "#000000" },
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, color: "#339933" },
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#000000" },
  { name: "Django", category: "Backend", icon: SiDjango, color: "#092E20" },
  { name: "Flask", category: "Backend", icon: SiFlask, color: "#000000" },
  { name: "PostgreSQL", category: "Database", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", category: "Database", icon: SiMongodb, color: "#47A248" },
  { name: "Docker", category: "DevOps", icon: SiDocker, color: "#2496ED" },
  { name: "Git", category: "Tools", icon: SiGit, color: "#F05032" },
  { name: "VS Code", category: "Tools", icon: TbBrandVscode, color: "#007ACC" },
]

interface Portfolio {
  id: number
  displayName: string
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
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900/60 to-black rounded-xl">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-2 left-2 w-16 h-16 bg-orange-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-8 right-2 w-20 h-20 bg-amber-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-18 h-18 bg-yellow-500/15 rounded-full blur-xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto" style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none' 
      }}>
          {/* Hero Section */}
          <div className={`w-full ${previewMode === 'mobile' ? 'p-3 pt-4' : 'p-4'}`}>
            <div className={`w-full flex items-center justify-between ${previewMode === 'mobile' ? 'mb-2' : 'mb-4'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full blur-lg"></div>
                <Avatar className={`${previewMode === 'mobile' ? 'w-12 h-12' : previewMode === 'tablet' ? 'w-16 h-16' : 'w-20 h-20'} border border-orange-400/40 backdrop-blur-sm bg-black/20 relative`}>
                  <AvatarImage src={portfolio.profilePic} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-bold">
                    {portfolio.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Social icons in top right */}
              <div className="flex gap-2">
                {portfolio.socials && portfolio.socials
                  .filter((social: any) => social.isPinned)
                  .map((social: any, index: number) => {
                    const Icon = getSocialIcon(social.platform)
                    return (
                      <div
                        key={social.id}
                        className={`${previewMode === 'mobile' ? 'p-1' : previewMode === 'tablet' ? 'p-1.5' : 'p-2'} rounded-lg backdrop-blur-xl bg-transparent border border-orange-500/40 text-orange-400`}
                      >
                        <Icon className={`${previewMode === 'mobile' ? 'h-2.5 w-2.5' : previewMode === 'tablet' ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      </div>
                    )
                  })}
              </div>
            </div>
            
            <h1 className={`${previewMode === 'mobile' ? 'text-base' : previewMode === 'tablet' ? 'text-lg' : 'text-xl'} font-bold mb-1 text-white w-full`}> 
              {portfolio.displayName}
            </h1>
            <p className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} text-orange-100 mb-2 font-medium w-full`}>
              {portfolio.user.company ? `${portfolio.user.company} @${portfolio.user.githubUsername}` : `@${portfolio.user.githubUsername}`}
            </p>
            <p className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} text-gray-200 ${previewMode === 'mobile' ? 'mb-3' : 'mb-4'} w-full`}>
              {portfolio.bio}
            </p>
          </div>

          {/* Skills Section */}
          {portfolio.skills && portfolio.skills.length > 0 && (
            <div className={`w-full ${previewMode === 'mobile' ? 'px-3 py-2' : previewMode === 'tablet' ? 'px-3 py-3' : 'px-4 py-3'}`}>
              <h2 className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-base'} font-bold mb-3 text-white`}>Skills</h2>
              <div className={`w-full grid ${previewMode === 'mobile' ? 'grid-cols-2 gap-1' : 'grid-cols-2 gap-2'}`}>
                {portfolio.skills.map((skill) => {
                  const skillData = getSkillData(skill.name)
                  const IconComponent = skillData?.icon || Wrench
                  
                  return (
                    <div 
                      key={skill.id}
                      className={`w-full flex items-center ${previewMode === 'mobile' ? 'p-1.5' : previewMode === 'tablet' ? 'p-2' : 'p-2'} backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-lg`}
                    >
                      <div className={`flex-shrink-0 ${previewMode === 'mobile' ? 'w-4 h-4 mr-1.5' : 'w-5 h-5 mr-2'} flex items-center justify-center`}>
                        <IconComponent 
                          className={`${previewMode === 'mobile' ? 'w-2.5 h-2.5' : previewMode === 'tablet' ? 'w-3 h-3' : 'w-4 h-4'}`}
                          style={{ color: skillData?.color || '#fb923c' }}
                        />
                      </div>
                      <span className={`${previewMode === 'mobile' ? 'text-[9px]' : previewMode === 'tablet' ? 'text-[10px]' : 'text-sm'} font-medium text-white truncate`}>
                        {skill.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {portfolio.repositories && portfolio.repositories.length > 0 && (
            <div className={`${previewMode === 'mobile' ? 'px-3 py-2' : previewMode === 'tablet' ? 'px-3 py-3' : 'px-4 py-3'}`}>
              <h2 className={`${previewMode === 'mobile' ? 'text-xs' : previewMode === 'tablet' ? 'text-sm' : 'text-base'} font-bold mb-3 text-white`}>Featured Projects</h2>
              <div className={`${previewMode === 'mobile' ? 'space-y-2' : 'space-y-3'}`}>
                {portfolio.repositories
                  .filter(repo => repo.isVisible)
                  .map((repo) => (
                  <div 
                    key={repo.id} 
                    className={`backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-xl ${previewMode === 'mobile' ? 'p-2' : previewMode === 'tablet' ? 'p-2.5' : 'p-3'} hover:bg-black/20 hover:border-orange-400/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-2">
                        <h3 className={`${previewMode === 'mobile' ? 'text-[10px]' : previewMode === 'tablet' ? 'text-xs' : 'text-sm'} font-bold text-white mb-1`}>
                          {previewMode === 'mobile' 
                            ? (repo.repository.name.length > 12 ? `${repo.repository.name.substring(0, 12)}...` : repo.repository.name)
                            : (repo.repository.name.length > 14 ? `${repo.repository.name.substring(0, 14)}...` : repo.repository.name)
                          }
                        </h3>
                        {repo.repository.description && (
                          <p className={`${previewMode === 'mobile' ? 'text-[9px]' : previewMode === 'tablet' ? 'text-[10px]' : 'text-xs'} text-gray-300 line-clamp-1 mb-2`}>
                            {repo.repository.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`${previewMode === 'mobile' ? 'p-0.5' : previewMode === 'tablet' ? 'p-1' : 'p-1.5'} rounded-lg backdrop-blur-sm bg-transparent border border-orange-500/50 text-orange-300`}>
                          <Github className={`${previewMode === 'mobile' ? 'h-2 w-2' : previewMode === 'tablet' ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Language badge */}
                    <div className="flex items-center">
                      {repo.repository.language && (
                        <div className={`flex items-center ${previewMode === 'mobile' ? 'px-1.5 py-0.5' : previewMode === 'tablet' ? 'px-2 py-1' : 'px-2 py-1'} rounded-full backdrop-blur-sm bg-transparent border border-orange-500/50`}>
                          <div className={`${previewMode === 'mobile' ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full ${getLanguageColor(repo.repository.language)} ${previewMode === 'mobile' ? 'mr-1' : 'mr-1.5'}`}></div>
                          <span className={`${previewMode === 'mobile' ? 'text-[8px]' : previewMode === 'tablet' ? 'text-[9px]' : 'text-[10px]'} text-orange-100 font-medium`}>{repo.repository.language}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`${previewMode === 'mobile' ? 'p-2' : previewMode === 'tablet' ? 'p-2.5' : 'p-3'} text-center`}>
            <div className={`backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-xl ${previewMode === 'mobile' ? 'p-1.5' : previewMode === 'tablet' ? 'p-2' : 'p-3'}`}>
              <p className={`${previewMode === 'mobile' ? 'text-[9px]' : previewMode === 'tablet' ? 'text-[10px]' : 'text-xs'} text-gray-300`}>
                Built with ❤️ using <span className="text-white font-bold">Name</span>
              </p>
            </div>
          </div>
      </div>
    </div>
  )
}