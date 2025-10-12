"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { StructuredData } from "@/components/StructuredData"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import { THEMES, getTheme, ThemeKey } from "@/lib/theme-config"
import { getLayoutComponent } from "@/lib/theme-layouts"
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
  selectedTheme?: string
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

  // Dynamic theme rendering
  const themeKey = (portfolio.selectedTheme as ThemeKey) || 'dark'
  const theme = getTheme(themeKey)
  const Layout = getLayoutComponent(theme.layout)

  return (
    <>
      {/* Structured Data for SEO */}
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
      
      {/* Dynamic Theme Layout */}
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><DevFolioLoader size="lg" /></div>}>
        <Layout theme={theme} portfolio={portfolio} />
      </Suspense>
    </>
  )
}
