"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
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

// Skills database with icons and colors (same as SkillsSection)
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
  { name: "Next.js", category: "Frontend", icon: SiNextdotjs, color: "#000000" },
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
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#000000" },
  { name: "Django", category: "Backend", icon: SiDjango, color: "#092E20" },
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
  { name: "Vercel", category: "Cloud", icon: SiVercel, color: "#000000" },
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

export default function PublicPortfolioPage() {
  const params = useParams()
  const username = params.username as string
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Prevent conflicts with app routes
  const reservedRoutes = ['dashboard', 'auth', 'api', '_next', 'favicon.ico']
  if (reservedRoutes.includes(username)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Portfolio URL</h1>
          <p className="text-gray-400 mb-6">This username is reserved and cannot be used for portfolios.</p>
        </div>
      </div>
    )
  }
  
  // Move useScroll to top level to avoid conditional hook calls
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, 50])

  useEffect(() => {
    fetchPortfolio()
  }, [username])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`/api/portfolio/publish?username=${username}`)
      const result = await response.json()

      if (response.ok) {
        setPortfolio(result.portfolio)
      } else {
        setError(result.error || "Portfolio not found")
      }
    } catch (err) {
      setError("Failed to load portfolio")
    } finally {
      setLoading(false)
    }
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'frontend': '🎨',
      'backend': '⚙️',
      'database': '🗄️',
      'tools': '🔧',
      'languages': '💻',
    }
    return icons[category] || '💻'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "This portfolio doesn't exist or hasn't been published yet."}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              className="bg-white text-black hover:bg-gray-200 w-full"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => window.open('/dashboard', '_blank')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Dark Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 to-black"></div>

      {/* Hero Section */}
      <motion.div 
        className="relative z-10 pt-8 md:pt-12 pb-4 md:pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto px-4 sm:px-6 max-w-screen-lg">
          <div className="relative">
            {/* Profile Picture and Social Icons - Same Row */}
            <div className="flex items-center justify-between mb-4 pt-6 md:pt-8">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-700 bg-gray-800 relative shadow-lg">
                  <AvatarImage src={portfolio.profilePic} className="object-cover" />
                  <AvatarFallback className="bg-gray-900 text-white text-xl font-bold">
                {portfolio.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
              </motion.div>

              {/* Social Icons - Aligned with Profile Picture */}
              <motion.div 
                className="flex gap-2 md:gap-3"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {portfolio.socials && portfolio.socials
                  .filter(social => social.isPinned)
                  .map((social, index) => {
                    const Icon = getSocialIcon(social.platform)
                    return (
                      <motion.button
                        key={social.id}
                        onClick={() => window.open(social.url, '_blank')}
                        className="group p-3 rounded-xl bg-transparent border border-orange-500/30 text-orange-400 hover:bg-black/20 hover:border-orange-500/50 hover:text-orange-300 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Icon className="h-5 w-5 md:h-6 md:w-6 group-hover:drop-shadow-lg" />
                      </motion.button>
                    )
                  })}
              </motion.div>
            </div>

            {/* Profile Content */}
            <div>
              
               <motion.h1 
                 className="text-lg md:text-xl font-medium mb-1 text-white"
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
               >
                 {portfolio.displayName}
               </motion.h1>
               
               {portfolio.jobTitle && (
                 <motion.p 
                   className="text-base md:text-lg text-orange-300 mb-2 font-bold"
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ duration: 0.8, delay: 0.5 }}
                 >
                   {portfolio.jobTitle}
                 </motion.p>
               )}
               
               {portfolio.user.company && (
                 <motion.p 
                   className="text-sm md:text-base text-gray-400 mb-2 font-medium"
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ duration: 0.8, delay: 0.6 }}
                 >
                   {portfolio.user.company}
                 </motion.p>
               )}
              
              <motion.p 
                className="text-sm text-gray-400 mb-4 leading-relaxed max-w-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {portfolio.bio}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

       {/* Projects Section */}
      {portfolio.repositories && portfolio.repositories.length > 0 && (
        <motion.div 
          className="relative z-10 py-4 md:py-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-3 sm:px-4 max-w-lg">
            <motion.h2 
              className="text-md md:text-xl font-semibold mb-3 md:mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Featured Projects
            </motion.h2>
            <div className="space-y-3">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.div
                  key={repo.id}
                  className="group relative cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.005, y: -1 }}
                  onClick={() => {
                    if (repo.deployedUrl) {
                      window.open(repo.deployedUrl, '_blank')
                    } else {
                      window.open(repo.repository.htmlUrl, '_blank')
                    }
                  }}
                >
                  <div className="relative bg-transparent border border-orange-500/30 rounded-lg p-4 hover:bg-black/20 hover:border-orange-500/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors duration-200 mb-2">
                          {repo.repository.name.length > 14 ? `${repo.repository.name.substring(0, 14)}...` : repo.repository.name}
                      </h3>
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
                          {repo.repository.description || "No description available for this project."}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(repo.repository.htmlUrl, '_blank')
                          }}
                          className="p-2 rounded-lg bg-transparent border border-orange-500/40 text-orange-300 hover:bg-black/30 hover:text-white transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Language badge at bottom where stars/forks were */}
                    <div className="flex items-center">
                        {repo.repository.language && (
                        <div className="flex items-center px-3 py-1 rounded-full bg-transparent border border-orange-500/40">
                          <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.repository.language)} mr-2`}></div>
                          <span className="text-gray-200 text-sm font-medium">{repo.repository.language}</span>
                          </div>
                        )}
                        </div>
                      </div>
                </motion.div>
              ))}
            </div>
          </div>
         </motion.div>
       )}

       {/* Skills Section */}
       {portfolio.skills && portfolio.skills.length > 0 && (
         <motion.div 
           className="relative z-10 py-4 md:py-6"
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
         >
           <div className="mx-auto px-3 sm:px-4 max-w-screen-md">
             <motion.h2 
               className="text-md md:text-xl font-semibold mb-3 md:mb-4 text-white"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
             >
               Skills
             </motion.h2>
             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4">
               {portfolio.skills.map((skill, index) => {
                 const skillData = getSkillData(skill.name)
                 const IconComponent = skillData?.icon || Wrench
                 
                 return (
                   <motion.div
                     key={skill.id}
                     className="group relative flex flex-col items-center"
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: index * 0.05 }}
                     viewport={{ once: true }}
                     whileHover={{ scale: 1.05 }}
                   >
                     <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 mb-2 flex items-center justify-center">
                       <IconComponent 
                         className="w-6 h-6 md:w-8 md:h-8 drop-shadow-lg" 
                         style={{ 
                           color: skillData?.color || '#00ffff',
                           filter: 'drop-shadow(0 0 12px rgba(0, 255, 255, 0.4))'
                         }}
                       />
                     </div>
                     <span className="text-xs md:text-sm font-medium text-white text-center">
                       {skill.name}
                     </span>
                   </motion.div>
                 )
               })}
             </div>
           </div>
         </motion.div>
       )}

       {/* Get in Touch Section */}
        <motion.div 
          className="relative z-10 py-6 md:py-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
          <div className="mx-auto px-4 sm:px-6 max-w-screen-lg">
          <motion.h2 
              className="text-md md:text-2xl font-semibold mb-4 md:mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            style={{ textShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
          >
            Get in touch
          </motion.h2>
          <div className="flex justify-center gap-5 md:gap-6 flex-wrap">
            {portfolio.socials && portfolio.socials
              .filter(social => social.username && social.username.trim())
              .map((social, index) => {
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
                  <motion.button
                    key={social.id}
                    onClick={() => window.open(social.url, '_blank')}
                    className={`p-3 md:p-4 rounded-2xl backdrop-blur-xl ${style.bg} border ${style.border} ${style.text} ${style.hover} ${style.shadow} transition-all duration-300`}
                    whileHover={{ scale: 1.1, y: -2, rotate: rotation }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </motion.button>
                )
              })}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-6 max-w-md text-center">
          <div className="backdrop-blur-xl bg-transparent border border-orange-500/30 rounded-2xl p-6">
            <motion.p 
              className="text-gray-300 text-base font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Built with{" "}
              <motion.span
                className="text-red-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              {" "}using{" "}
              <span className="text-white font-bold">
                Portfolio
              </span>
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
