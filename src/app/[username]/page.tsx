"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { StructuredData } from "@/components/StructuredData"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { 
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
  SiFigma, SiPostman, SiWebpack, SiVite, SiNpm, SiYarn, SiStackoverflow, SiReddit,
  SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiFastify, SiRailway
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
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#68A063" },
  { name: "Django", category: "Backend", icon: SiDjango, color: "#092E20" },
  { name: "Flask", category: "Backend", icon: SiFlask, color: "#FFD43B" },
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
  { name: "Vercel", category: "Cloud", icon: SiVercel, color: "#FFFFFF" },
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
  
  // Additional Backend Frameworks
  { name: "Fastify", category: "Backend", icon: SiFastify, color: "#FFFFFF" },
  { name: "Railway", category: "Cloud", icon: SiRailway, color: "#FFFFFF" },
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
    githubUrl?: string
    language: string
    stargazersCount: number
    forksCount: number
    isImported?: boolean
    favicon?: string
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
      github: SiGithub,
      email: SiGmail,
      twitter: SiX, // Using new X branding
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <DevFolioLoader size="lg" />
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
      {/* Structured Data for SEO */}
      {portfolio && (
        <StructuredData
          type="Person"
          data={{
            name: portfolio.displayName,
            jobTitle: portfolio.jobTitle,
            bio: portfolio.bio,
            image: portfolio.profilePic,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            sameAs: portfolio.socials?.map(s => s.url).filter(Boolean),
            worksFor: portfolio.user.company ? {
              name: portfolio.user.company,
            } : undefined,
            location: portfolio.user.location,
            skills: portfolio.skills?.map(s => s.name),
          }}
        />
      )}
      
      {/* Dark Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 to-black"></div>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 pt-12 md:pt-16 lg:pt-20 pb-8 md:pb-12 lg:pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-label="Profile introduction"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="relative lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Profile Content - Large screens: Left side, Mobile: Full width */}
            <div className="lg:col-span-8">
              {/* Profile Picture and Social Icons - Mobile/Tablet layout */}
              <div className="flex items-center justify-between mb-6 pt-2 md:pt-4 lg:pt-0 lg:mb-8 lg:justify-start">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative group"
                >
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-3 border-orange-500/20 bg-gray-800 relative shadow-2xl group-hover:border-orange-500/40 transition-all duration-300">
                    <AvatarImage 
                      src={portfolio.profilePic} 
                      className="object-cover" 
                      alt={`${portfolio.displayName}'s profile picture`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xl lg:text-3xl font-bold">
                      {portfolio.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all duration-300 -z-10"></div>
                </motion.div>

                {/* Social Icons - Mobile/Tablet only */}
                <motion.div 
                  className="flex gap-3 md:gap-4 lg:hidden"
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
                          className="group p-3 md:p-4 rounded-xl bg-gray-900/50 border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-300 transition-all duration-300 backdrop-blur-sm"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          aria-label={`Visit ${social.platform} profile`}
                        >
                          <Icon className="h-5 w-5 md:h-6 md:w-6 group-hover:drop-shadow-lg" />
                        </motion.button>
                      )
                    })}
                </motion.div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <motion.h1 
                  className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white leading-tight"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {portfolio.displayName}
                </motion.h1>
                
                {portfolio.jobTitle && (
                  <motion.p 
                    className="text-base md:text-lg lg:text-xl text-orange-300 mb-3 font-semibold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    {portfolio.jobTitle}
                  </motion.p>
                )}
                
                {portfolio.user.company && (
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm md:text-base text-gray-400 font-medium">
                      {portfolio.user.company}
                    </span>
                  </motion.div>
                )}
               
                <motion.p 
                  className="text-sm lg:text-base text-gray-300 leading-relaxed max-w-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {portfolio.bio}
                </motion.p>
              </div>
            </div>

            {/* Social Icons for Large Screens - Right side - Horizontal layout */}
            <motion.div 
              className="hidden lg:flex lg:col-span-4 lg:justify-end lg:items-start"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex gap-3">
                {portfolio.socials && portfolio.socials
                  .filter(social => social.isPinned)
                  .map((social, index) => {
                    const Icon = getSocialIcon(social.platform)
                    return (
                      <motion.button
                        key={social.id}
                        onClick={() => window.open(social.url, '_blank')}
                        className="group p-3 rounded-xl bg-transparent border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-300 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        aria-label={`Visit ${social.platform} profile`}
                      >
                        <Icon className="h-5 w-5 group-hover:drop-shadow-lg" />
                      </motion.button>
                    )
                  })}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

       {/* Projects Section */}
      {portfolio.repositories && portfolio.repositories.filter(repo => repo.isVisible).length > 0 && (
        <motion.section 
          className="relative z-10 py-12 md:py-16 lg:py-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-label="Projects showcase"
        >
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <motion.h2 
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Projects I've Made
            </motion.h2>
            {/* Grid layout: Single column on mobile, 2 columns on tablet, 3 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.article
                  key={repo.id}
                  className="group relative cursor-pointer h-fit"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
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
                  <div className="relative bg-transparent border border-orange-500/30 rounded-lg p-4 lg:p-6 hover:border-orange-500/50 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300 mb-2 break-words">
                          {repo.repository.name}
                        </h3>
                        <p className="text-gray-400 text-sm lg:text-base leading-relaxed line-clamp-3 mb-3">
                          {repo.repository.description || "No description available for this project."}
                        </p>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
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
                    
                    {/* Language badge - simple */}
                    <div className="flex items-center mt-auto">
                      {repo.repository.language && (
                        <span className="text-orange-300 text-sm font-medium">
                          {repo.repository.language}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
         </motion.section>
       )}

       {/* Skills Section */}
       {portfolio.skills && portfolio.skills.length > 0 && (
         <motion.section 
           className="relative z-10 py-12 md:py-16 lg:py-20"
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
           aria-label="Technical skills"
         >
           <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
             <motion.h2 
               className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-white text-center"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
             >
               Skills I've Learned
             </motion.h2>
             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
               {portfolio.skills.map((skill, index) => {
                 const skillData = getSkillData(skill.name)
                 const IconComponent = skillData?.icon || Wrench
                 
                 return (
                   <motion.div
                     key={skill.id}
                     className="group relative flex flex-col items-center cursor-pointer"
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: index * 0.05 }}
                     viewport={{ once: true }}
                     whileHover={{ scale: 1.1, y: -4 }}
                     whileTap={{ scale: 0.95 }}
                     aria-label={`${skill.name} skill`}
                   >
                     <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 mb-3 flex items-center justify-center rounded-2xl bg-gray-900/60 border border-gray-700/50 hover:border-orange-500/30 hover:bg-gray-800/80 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm">
                       <IconComponent 
                         className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" 
                         style={{ 
                           color: skillData?.color || '#ffffff',
                         }}
                       />
                     </div>
                     <span className="text-xs md:text-sm font-medium text-gray-300 text-center leading-tight group-hover:text-white transition-colors duration-300">
                       {skill.name}
                     </span>
                   </motion.div>
                 )
               })}
             </div>
           </div>
         </motion.section>
       )}

       {/* Get in Touch Section */}
       {portfolio.socials && portfolio.socials.filter(social => social.username && social.username.trim()).length > 0 && (
        <motion.section 
          className="relative z-10 py-12 md:py-16 lg:py-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          aria-label="Contact and social links"
        >
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <motion.h2 
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              style={{ textShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
            >
              Let's Connect
            </motion.h2>
            <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 flex-wrap max-w-2xl mx-auto">
              {portfolio.socials && portfolio.socials
                .filter(social => social.username && social.username.trim())
                .map((social, index) => {
                  const Icon = getSocialIcon(social.platform)
                  
                  // Enhanced platform-specific colors and styles
                  const platformStyles = {
                    github: { 
                      bg: 'bg-gray-900/80', 
                      border: 'border-gray-700/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-800/90 hover:text-white hover:border-gray-600/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-900/40'
                    },
                    email: { 
                      bg: 'bg-blue-600/80', 
                      border: 'border-blue-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-700/90 hover:text-white hover:border-blue-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-500/40'
                    },
                    twitter: { 
                      bg: 'bg-black/80', 
                      border: 'border-gray-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-900/90 hover:text-white hover:border-gray-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-700/40'
                    },
                    x: { 
                      bg: 'bg-black/80', 
                      border: 'border-gray-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-900/90 hover:text-white hover:border-gray-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-700/40'
                    },
                    instagram: { 
                      bg: 'bg-gradient-to-r from-purple-600 to-pink-600/80', 
                      border: 'border-purple-500/50', 
                      text: 'text-white', 
                      hover: 'hover:from-purple-700 hover:to-pink-700/90 hover:text-white hover:border-purple-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-purple-500/40'
                    },
                    linkedin: { 
                      bg: 'bg-blue-700/80', 
                      border: 'border-blue-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-800/90 hover:text-white hover:border-blue-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-600/40'
                    },
                    facebook: { 
                      bg: 'bg-blue-600/80', 
                      border: 'border-blue-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-700/90 hover:text-white hover:border-blue-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-500/40'
                    },
                    youtube: { 
                      bg: 'bg-red-600/80', 
                      border: 'border-red-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-red-700/90 hover:text-white hover:border-red-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-red-500/40'
                    },
                    stackoverflow: { 
                      bg: 'bg-orange-600/80', 
                      border: 'border-orange-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-orange-700/90 hover:text-white hover:border-orange-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-orange-500/40'
                    },
                    reddit: { 
                      bg: 'bg-orange-500/80', 
                      border: 'border-orange-400/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-orange-600/90 hover:text-white hover:border-orange-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-orange-500/40'
                    }
                  }
                  
                  const style = platformStyles[social.platform as keyof typeof platformStyles] || platformStyles.github
                  const rotations = [5, -5, 3, -3, 7, -7, 4, -4]
                  const rotation = rotations[index % rotations.length]
                  
                  return (
                    <motion.button
                      key={social.id}
                      onClick={() => window.open(social.url, '_blank')}
                      className={`p-5 lg:p-6 rounded-2xl backdrop-blur-xl ${style.bg} border ${style.border} ${style.text} ${style.hover} ${style.shadow} transition-all duration-300`}
                      whileHover={{ scale: 1.1, y: -3, rotate: rotation }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      aria-label={`Visit ${social.platform} profile`}
                    >
                      <Icon className="h-7 w-7 lg:h-8 lg:w-8" />
                    </motion.button>
                  )
                })}
            </div>
          </div>
        </motion.section>
       )}

      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-8 lg:py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-6xl">
          {/* Powered by badge - bottom right */}
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
