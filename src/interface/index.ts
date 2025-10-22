import { FaAws, FaJava } from "react-icons/fa"
import {  SiPython,
         SiNuxtdotjs, 
         SiNextdotjs, 
         SiAngular, 
         SiVuedotjs, 
         SiReact, SiDart, SiKotlin, SiSwift, SiPhp, SiRust, SiGo, SiCplusplus, SiJavascript, SiTypescript, SiDotnet, SiRuby, SiRubyonrails, SiSupabase, SiFirebase, SiSqlite, SiRedis, SiMongodb, SiMysql, SiFastapi, SiFlask, SiSass, SiTailwindcss, SiDjango, SiExpress, SiMui, SiNodedotjs, SiRedux, SiSvelte, SiHtml5, SiCss3, SiBootstrap, SiLaravel, SiPostgresql, SiRailway, SiFastify, SiYarn } from "react-icons/si"
import { SiGithub, SiVercel, SiNetlify, SiDocker, SiKubernetes, SiGit, SiFigma, SiPostman, SiWebpack, SiVite, SiNpm } from "react-icons/si"
import { TbBrandVscode } from "react-icons/tb"
import { FaMicrosoft } from "react-icons/fa"
import { SiGooglecloud } from "react-icons/si"
import { SiSpring } from "react-icons/si"


export interface User {
  id: number
  name: string
  email: string
  githubUsername: string
  avatarUrl: string
  bio: string
  location: string
  websiteUrl: string
  twitterUsername: string
  company: string
  publicRepos: number
  followers: number
  following: number
  repositories: Repository[]
}

export interface Repository {
  id: number
  name: string
  fullName: string
  description: string
  htmlUrl: string
  homepage?: string
  language: string
  languages?: string[] // All languages used in the repo
  stargazersCount: number
  forksCount: number
  isPrivate: boolean
  isFork: boolean
  size: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  isImported?: boolean
  favicon?: string
  logo?: string
  githubUrl?: string
  siteName?: string
  keywords?: string
  author?: string
}

export interface Skill {
  id: string
  name: string
  category: string
}

export interface Social {
  id: number
  platform: string
  username: string
  url: string
  isPinned: boolean
}

// Portfolio State Types
export interface PortfolioData {
  displayName: string
  jobTitle: string
  bio: string
  profilePic: string
  customUsername: string
}

export interface PortfolioState {
  portfolioData: PortfolioData
  selectedRepos: number[]
  skills: Skill[]
  socials: Social[]
  deployedUrls: Record<number, string>
  customNames: Record<number, string>
  customDescriptions: Record<number, string>
  githubUrls: Record<number, string>
  importedProjects: Repository[]
  selectedTheme: string
  repoOrder: number[]
}

export interface UsernameAvailability {
  isChecking: boolean
  isAvailable: boolean | null
  message: string
}


export interface Portfolio {
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
  
  
  export interface PortfolioRepository {
    id: number
    deployedUrl: string
    customName?: string
    customDescription?: string
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
      logo?: string
    }
  }

  export const skillsDatabase = [
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
  