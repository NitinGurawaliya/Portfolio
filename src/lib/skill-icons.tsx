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

const skillColorMap: Record<string, string> = {
  // Frontend
  'react': '#61DAFB',
  'vue': '#41B883',
  'angular': '#DD0031',
  'javascript': '#F7DF1E',
  'typescript': '#3178C6',
  'html': '#E34F26',
  'html5': '#E34F26',
  'css': '#1572B6',
  'css3': '#1572B6',
  'sass': '#CC6699',
  'scss': '#CC6699',
  'tailwind': '#38BDF8',
  'tailwindcss': '#38BDF8',
  'bootstrap': '#7952B3',
  'next.js': '#000000',
  'nextjs': '#000000',
  'nuxt': '#00DC82',
  'nuxtjs': '#00DC82',
  'gatsby': '#663399',
  // Backend
  'node.js': '#339933',
  'nodejs': '#339933',
  'express': '#000000',
  'python': '#3776AB',
  'django': '#092E20',
  'flask': '#000000',
  'php': '#777BB3',
  'laravel': '#FF2D20',
  'ruby': '#CC342D',
  'rails': '#CC0000',
  'rubyonrails': '#CC0000',
  'java': '#007396',
  'spring': '#6DB33F',
  'go': '#00ADD8',
  'golang': '#00ADD8',
  'rust': '#000000',
  'c#': '#68217A',
  'csharp': '#68217A',
  'c++': '#00599C',
  'cpp': '#00599C',
  // Databases
  'mysql': '#4479A1',
  'postgresql': '#336791',
  'postgres': '#336791',
  'mongodb': '#47A248',
  'mongo': '#47A248',
  'redis': '#DC382D',
  'firebase': '#FFCA28',
  'supabase': '#3ECF8E',
  // Cloud & DevOps
  'aws': '#FF9900',
  'amazonaws': '#FF9900',
  'docker': '#2496ED',
  'kubernetes': '#326CE5',
  'gcp': '#4285F4',
  'googlecloud': '#4285F4',
  'vercel': '#000000',
  'netlify': '#00C7B7',
  // Tools & Others
  'git': '#F05032',
  'github': '#181717',
  'gitlab': '#FC6D26',
  'figma': '#F24E1E',
  'photoshop': '#31A8FF',
  'adobe': '#FF0000',
  'sketch': '#F7B500',
  'webpack': '#8DD6F9',
  'vite': '#646CFF',
  'npm': '#CB3837',
  'yarn': '#2C8EBB',
  'pnpm': '#F69220',
  'linux': '#FCC624',
  'ubuntu': '#E95420',
  'apple': '#000000',
  'windows': '#0078D6',
  'macos': '#000000',
  'mac': '#000000',
  // UI Libraries
  'chakra': '#319795',
  'chakra ui': '#319795',
  'chakraui': '#319795',
  'mui': '#007FFF',
  'material-ui': '#007FFF',
  'materialui': '#007FFF',
  'antd': '#0170FE',
  'ant design': '#0170FE',
  'antdesign': '#0170FE',
  'semantic ui': '#35BDB2',
  'semanticui': '#35BDB2',
  'bulma': '#00D1B2',
  // Testing
  'jest': '#C21325',
  'cypress': '#17202C',
  'vitest': '#729B1B',
  'stackoverflow': '#F48024',
  'reddit': '#FF4500',
  // Mobile
  'react native': '#61DAFB',
  'reactnative': '#61DAFB',
  'flutter': '#02569B',
  'ionic': '#3880FF',
  'expo': '#000020'
}

// Export the getSkillIcon function for use in other components
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
const getSkillColor = (skillName: string): string | null => {
  const normalizedName = skillName.toLowerCase().trim()

  const findColor = (name: string): string | null => {
    if (skillColorMap[name]) {
      return skillColorMap[name]
    }
    for (const [key, color] of Object.entries(skillColorMap)) {
      if (name.includes(key) || key.includes(name)) {
        return color
      }
    }
    return null
  }

  // Try exact
  let color = findColor(normalizedName)
  if (color) return color

  // Try icon map keys for overlaps
  for (const key of Object.keys(iconMap)) {
    if (normalizedName.includes(key) && skillColorMap[key]) {
      return skillColorMap[key]
    }
  }

  return null
}

export const SkillIcon: React.FC<{ skillName: string; className?: string }> = ({ 
  skillName, 
  className = "" 
}) => {
  const IconComponent = getSkillIcon(skillName)
  const color = getSkillColor(skillName)
  
  if (IconComponent) {
    return (
      <span style={color ? { color } : undefined}>
        <IconComponent className={className} />
      </span>
    )
  }
  
  // Fallback to first letter if no icon found
  return (
    <span className={className} style={color ? { color } : undefined}>
      {skillName.charAt(0).toUpperCase()}
    </span>
  )
}
