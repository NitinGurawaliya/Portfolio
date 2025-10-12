import React from 'react'
import { 
  SiReact, SiVuedotjs, SiAngular, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiSass, SiTailwindcss, SiBootstrap, SiNextdotjs, SiNuxtdotjs, SiGatsby,
  SiNodedotjs, SiExpress, SiPython, SiDjango, SiFlask, SiPhp, SiLaravel, SiRuby, SiRubyonrails, SiSpring, SiGo, SiRust, SiSharp, SiCplusplus,
  SiMysql, SiPostgresql, SiMongodb, SiRedis, SiFirebase, SiSupabase,
  SiAmazon, SiDocker, SiKubernetes, SiGooglecloud, SiVercel, SiNetlify,
  SiGit, SiGithub, SiGitlab, SiFigma, SiAdobephotoshop, SiAdobexd, SiSketch, SiWebpack, SiVite, SiNpm, SiYarn, SiPnpm, SiLinux, SiUbuntu, SiApple,
  SiChakraui, SiAntdesign, SiSemanticui, SiBulma,
  SiJest, SiCypress, SiVitest,
  SiFlutter, SiIonic, SiExpo
} from 'react-icons/si'

// Technology icon mappings with real icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Frontend
  'react': SiReact,
  'vue': SiVuedotjs,
  'angular': SiAngular,
  'javascript': SiJavascript,
  'typescript': SiTypescript,
  'html': SiHtml5,
  'html5': SiHtml5,
  'css': SiCss3,
  'css3': SiCss3,
  'sass': SiSass,
  'scss': SiSass,
  'tailwind': SiTailwindcss,
  'tailwindcss': SiTailwindcss,
  'bootstrap': SiBootstrap,
  'next.js': SiNextdotjs,
  'nextjs': SiNextdotjs,
  'nuxt': SiNuxtdotjs,
  'nuxtjs': SiNuxtdotjs,
  'gatsby': SiGatsby,
  
  // Backend
  'node.js': SiNodedotjs,
  'nodejs': SiNodedotjs,
  'express': SiExpress,
  'python': SiPython,
  'django': SiDjango,
  'flask': SiFlask,
  'php': SiPhp,
  'laravel': SiLaravel,
  'ruby': SiRuby,
  'rails': SiRubyonrails,
  'rubyonrails': SiRubyonrails,
  'java': SiSpring, // Using Spring as Java icon
  'spring': SiSpring,
  'go': SiGo,
  'golang': SiGo,
  'rust': SiRust,
  'c#': SiSharp,
  'csharp': SiSharp,
  'c++': SiCplusplus,
  'cpp': SiCplusplus,
  
  // Databases
  'mysql': SiMysql,
  'postgresql': SiPostgresql,
  'postgres': SiPostgresql,
  'mongodb': SiMongodb,
  'mongo': SiMongodb,
  'redis': SiRedis,
  'firebase': SiFirebase,
  'supabase': SiSupabase,
  
  // Cloud & DevOps
  'aws': SiAmazon,
  'amazonaws': SiAmazon,
  'docker': SiDocker,
  'kubernetes': SiKubernetes,
  'azure': SiAmazon, // Using Amazon as fallback for Azure
  'gcp': SiGooglecloud,
  'googlecloud': SiGooglecloud,
  'vercel': SiVercel,
  'netlify': SiNetlify,
  
  // Tools & Others
  'git': SiGit,
  'github': SiGithub,
  'gitlab': SiGitlab,
  'figma': SiFigma,
  'photoshop': SiAdobephotoshop,
  'adobe': SiAdobephotoshop,
  'illustrator': SiAdobexd,
  'sketch': SiSketch,
  'webpack': SiWebpack,
  'vite': SiVite,
  'npm': SiNpm,
  'yarn': SiYarn,
  'pnpm': SiPnpm,
  'linux': SiLinux,
  'ubuntu': SiUbuntu,
  'windows': SiApple, // Using Apple as fallback for Windows
  'macos': SiApple,
  'mac': SiApple,
  
  // UI Libraries
  'chakra': SiChakraui,
  'chakra ui': SiChakraui,
  'chakraui': SiChakraui,
  'material-ui': SiReact, // Using React as Material-UI icon
  'mui': SiReact,
  'materialui': SiReact,
  'antd': SiAntdesign,
  'ant design': SiAntdesign,
  'antdesign': SiAntdesign,
  'semantic ui': SiSemanticui,
  'semanticui': SiSemanticui,
  'bulma': SiBulma,
  
  // Testing
  'jest': SiJest,
  'cypress': SiCypress,
  'playwright': SiCypress, // Using Cypress as Playwright icon
  'vitest': SiVitest,
  
  // Mobile
  'react native': SiReact,
  'reactnative': SiReact,
  'flutter': SiFlutter,
  'ionic': SiIonic,
  'expo': SiExpo
}

export const getSkillIcon = (skillName: string) => {
  const normalizedName = skillName.toLowerCase().trim()
  
  // Try exact match first
  if (iconMap[normalizedName]) {
    return iconMap[normalizedName]
  }
  
  // Try partial matches for compound names
  for (const [key, IconComponent] of Object.entries(iconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return IconComponent
    }
  }
  
  // Special case mappings for common variations and concatenated names
  const specialMappings: Record<string, React.ComponentType<{ className?: string }>> = {
    'react': SiReact,
    'react.js': SiReact,
    'reactjs': SiReact,
    'next': SiNextdotjs,
    'next.js': SiNextdotjs,
    'nextjs': SiNextdotjs,
    'css': SiCss3,
    'css3': SiCss3,
    'javascript': SiJavascript,
    'js': SiJavascript,
    'node': SiNodedotjs,
    'node.js': SiNodedotjs,
    'nodejs': SiNodedotjs,
    'typescript': SiTypescript,
    'ts': SiTypescript,
    'html': SiHtml5,
    'html5': SiHtml5,
    'python': SiPython,
    'py': SiPython,
    'java': SiSpring,
    'spring': SiSpring,
    'go': SiGo,
    'golang': SiGo,
    'rust': SiRust,
    'php': SiPhp,
    'mysql': SiMysql,
    'postgresql': SiPostgresql,
    'postgres': SiPostgresql,
    'mongodb': SiMongodb,
    'mongo': SiMongodb,
    'redis': SiRedis,
    'docker': SiDocker,
    'kubernetes': SiKubernetes,
    'aws': SiAmazon,
    'amazon': SiAmazon,
    'git': SiGit,
    'github': SiGithub,
    'gitlab': SiGitlab,
    'figma': SiFigma,
    'vscode': SiApple, // Using Apple as fallback
    'vs code': SiApple,
    'webpack': SiWebpack,
    'vite': SiVite,
    'npm': SiNpm,
    'yarn': SiYarn,
    'linux': SiLinux,
    'ubuntu': SiUbuntu,
    'windows': SiApple, // Using Apple as fallback
    'macos': SiApple,
    'mac': SiApple
  }
  
  // Try special mappings
  if (specialMappings[normalizedName]) {
    return specialMappings[normalizedName]
  }
  
  // Handle concatenated skill names (like "ReacNext.JCSS3")
  // Try to find partial matches in concatenated strings
  for (const [key, IconComponent] of Object.entries(iconMap)) {
    if (normalizedName.includes(key)) {
      return IconComponent
    }
  }
  
  for (const [key, IconComponent] of Object.entries(specialMappings)) {
    if (normalizedName.includes(key)) {
      return IconComponent
    }
  }
  
  // Fallback to null if no match found
  return null
}

// Component for rendering skill icons
export const SkillIcon: React.FC<{ skillName: string; className?: string }> = ({ 
  skillName, 
  className = "" 
}) => {
  const IconComponent = getSkillIcon(skillName)
  
  if (IconComponent) {
    return <IconComponent className={className} />
  }
  
  // Fallback to first letter if no icon found
  return (
    <span className={className}>
      {skillName.charAt(0).toUpperCase()}
    </span>
  )
}
