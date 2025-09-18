"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  X, 
  Wrench,
  ChevronDown,
  Plus
} from "lucide-react"
import {
  // Frontend & Web Technologies
  SiReact, SiVuedotjs, SiAngular, SiNextdotjs, SiNuxtdotjs, SiSvelte,
  SiHtml5, SiCss3, SiJavascript, SiTypescript, SiSass, SiTailwindcss,
  SiBootstrap, SiMui, SiChakraui, SiAntdesign, SiStyledcomponents,
  
  // Backend Frameworks
  SiNodedotjs, SiExpress, SiFastify, SiNestjs, SiDjango, SiFlask,
  SiFastapi, SiSpring, SiLaravel, SiRubyonrails, SiDotnet,
  
  // Programming Languages
  SiPython, SiCplusplus, SiGo, SiRust,
  SiPhp, SiRuby, SiSwift, SiKotlin, SiDart, SiScala,
  
  // Databases
  SiPostgresql, SiMysql, SiMongodb, SiRedis, SiSqlite,
  SiFirebase, SiSupabase, SiElasticsearch,
  
  // Cloud & DevOps
  SiGooglecloud, SiVercel,
  SiNetlify, SiHeroku, SiDigitalocean, SiRailway,
  
  // DevOps Tools
  SiDocker, SiKubernetes, SiJenkins, SiGithubactions,
  SiGitlab, SiTerraform, SiAnsible, SiNginx, SiApache,
  
  // Development Tools
  SiGit, SiGithub, SiGitlab as SiGitlabAlt,
  SiIntellijidea, SiWebstorm, SiFigma, SiAdobexd, SiSketch,
  SiPostman, SiInsomnia,
  
  // Mobile Development
  SiReact as SiReactNative, SiFlutter, SiIonic,
  SiAndroid, SiIos,
  
  // Testing
  SiJest, SiCypress, SiSelenium, SiVitest,
  SiTestinglibrary, SiMocha,
  
  // State Management & Build Tools
  SiRedux, SiWebpack, SiVite, SiEsbuild,
  
  // Additional Popular Tools
  SiYarn, SiNpm, SiPnpm, SiEslint, SiPrettier, SiBabel,
  SiStorybook, SiJira, SiSlack, SiDiscord, SiNotion
} from "react-icons/si"

// Import additional icons from other icon sets
import { FaJava, FaAws, FaMicrosoft } from "react-icons/fa"
import { TbBrandVscode } from "react-icons/tb"

interface Skill {
  id: string
  name: string
  category: string
}

interface SkillsSectionProps {
  skills: Skill[]
  onAddSkill: (skill: Omit<Skill, 'id'>) => void
  onRemoveSkill: (skillId: string) => void
}

// Comprehensive skills database with real technology icons
const skillsDatabase = [
  // Frontend Frameworks & Libraries
  { name: "React", category: "Frontend", icon: SiReact, color: "#61DAFB" },
  { name: "Vue.js", category: "Frontend", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Angular", category: "Frontend", icon: SiAngular, color: "#DD0031" },
  { name: "Next.js", category: "Frontend", icon: SiNextdotjs, color: "#000000" },
  { name: "Nuxt.js", category: "Frontend", icon: SiNuxtdotjs, color: "#00DC82" },
  { name: "Svelte", category: "Frontend", icon: SiSvelte, color: "#FF3E00" },
  
  // Core Web Technologies
  { name: "HTML5", category: "Frontend", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", category: "Frontend", icon: SiCss3, color: "#1572B6" },
  { name: "JavaScript", category: "Frontend", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", category: "Frontend", icon: SiTypescript, color: "#3178C6" },
  { name: "Sass", category: "Frontend", icon: SiSass, color: "#CC6699" },
  { name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Bootstrap", category: "Frontend", icon: SiBootstrap, color: "#7952B3" },
  { name: "Material UI", category: "Frontend", icon: SiMui, color: "#007FFF" },
  { name: "Chakra UI", category: "Frontend", icon: SiChakraui, color: "#319795" },
  { name: "Ant Design", category: "Frontend", icon: SiAntdesign, color: "#0170FE" },
  { name: "Styled Components", category: "Frontend", icon: SiStyledcomponents, color: "#DB7093" },
  
  // Backend Frameworks
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, color: "#339933" },
  { name: "Express.js", category: "Backend", icon: SiExpress, color: "#000000" },
  { name: "Fastify", category: "Backend", icon: SiFastify, color: "#000000" },
  { name: "NestJS", category: "Backend", icon: SiNestjs, color: "#E0234E" },
  { name: "Django", category: "Backend", icon: SiDjango, color: "#092E20" },
  { name: "Flask", category: "Backend", icon: SiFlask, color: "#000000" },
  { name: "FastAPI", category: "Backend", icon: SiFastapi, color: "#009688" },
  { name: "Spring Boot", category: "Backend", icon: SiSpring, color: "#6DB33F" },
  { name: "Laravel", category: "Backend", icon: SiLaravel, color: "#FF2D20" },
  { name: "Ruby on Rails", category: "Backend", icon: SiRubyonrails, color: "#CC0000" },
  { name: "ASP.NET", category: "Backend", icon: SiDotnet, color: "#512BD4" },
  
  // Programming Languages
  { name: "Python", category: "Languages", icon: SiPython, color: "#3776AB" },
  { name: "Java", category: "Languages", icon: FaJava, color: "#ED8B00" },
  { name: "C++", category: "Languages", icon: SiCplusplus, color: "#00599C" },
  { name: "C#", category: "Languages", icon: SiDotnet, color: "#239120" },
  { name: "Go", category: "Languages", icon: SiGo, color: "#00ADD8" },
  { name: "Rust", category: "Languages", icon: SiRust, color: "#000000" },
  { name: "PHP", category: "Languages", icon: SiPhp, color: "#777BB4" },
  { name: "Ruby", category: "Languages", icon: SiRuby, color: "#CC342D" },
  { name: "Swift", category: "Languages", icon: SiSwift, color: "#FA7343" },
  { name: "Kotlin", category: "Languages", icon: SiKotlin, color: "#0095D5" },
  { name: "Dart", category: "Languages", icon: SiDart, color: "#0175C2" },
  { name: "Scala", category: "Languages", icon: SiScala, color: "#DC322F" },
  
  // Databases
  { name: "PostgreSQL", category: "Database", icon: SiPostgresql, color: "#4169E1" },
  { name: "MySQL", category: "Database", icon: SiMysql, color: "#4479A1" },
  { name: "MongoDB", category: "Database", icon: SiMongodb, color: "#47A248" },
  { name: "Redis", category: "Database", icon: SiRedis, color: "#DC382D" },
  { name: "SQLite", category: "Database", icon: SiSqlite, color: "#003B57" },
  { name: "Firebase", category: "Database", icon: SiFirebase, color: "#FFCA28" },
  { name: "Supabase", category: "Database", icon: SiSupabase, color: "#3ECF8E" },
  { name: "Elasticsearch", category: "Database", icon: SiElasticsearch, color: "#005571" },
  
  // Cloud Platforms
  { name: "AWS", category: "Cloud", icon: FaAws, color: "#FF9900" },
  { name: "Google Cloud", category: "Cloud", icon: SiGooglecloud, color: "#4285F4" },
  { name: "Azure", category: "Cloud", icon: FaMicrosoft, color: "#0078D4" },
  { name: "Vercel", category: "Cloud", icon: SiVercel, color: "#000000" },
  { name: "Netlify", category: "Cloud", icon: SiNetlify, color: "#00C7B7" },
  { name: "Heroku", category: "Cloud", icon: SiHeroku, color: "#430098" },
  { name: "DigitalOcean", category: "Cloud", icon: SiDigitalocean, color: "#0080FF" },
  { name: "Railway", category: "Cloud", icon: SiRailway, color: "#0B0D0E" },
  
  // DevOps Tools
  { name: "Docker", category: "DevOps", icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", category: "DevOps", icon: SiKubernetes, color: "#326CE5" },
  { name: "Jenkins", category: "DevOps", icon: SiJenkins, color: "#D24939" },
  { name: "GitHub Actions", category: "DevOps", icon: SiGithubactions, color: "#2088FF" },
  { name: "GitLab CI", category: "DevOps", icon: SiGitlab, color: "#FC6D26" },
  { name: "Terraform", category: "DevOps", icon: SiTerraform, color: "#7B42BC" },
  { name: "Ansible", category: "DevOps", icon: SiAnsible, color: "#EE0000" },
  { name: "Nginx", category: "DevOps", icon: SiNginx, color: "#009639" },
  { name: "Apache", category: "DevOps", icon: SiApache, color: "#D22128" },
  
  // Development Tools
  { name: "Git", category: "Tools", icon: SiGit, color: "#F05032" },
  { name: "GitHub", category: "Tools", icon: SiGithub, color: "#181717" },
  { name: "GitLab", category: "Tools", icon: SiGitlabAlt, color: "#FC6D26" },
  { name: "VS Code", category: "Tools", icon: TbBrandVscode, color: "#007ACC" },
  { name: "IntelliJ IDEA", category: "Tools", icon: SiIntellijidea, color: "#000000" },
  { name: "WebStorm", category: "Tools", icon: SiWebstorm, color: "#000000" },
  { name: "Figma", category: "Tools", icon: SiFigma, color: "#F24E1E" },
  { name: "Adobe XD", category: "Tools", icon: SiAdobexd, color: "#FF61F6" },
  { name: "Sketch", category: "Tools", icon: SiSketch, color: "#F7B500" },
  { name: "Postman", category: "Tools", icon: SiPostman, color: "#FF6C37" },
  { name: "Insomnia", category: "Tools", icon: SiInsomnia, color: "#4000BF" },
  
  // Mobile Development
  { name: "React Native", category: "Mobile", icon: SiReactNative, color: "#61DAFB" },
  { name: "Flutter", category: "Mobile", icon: SiFlutter, color: "#02569B" },
  { name: "Ionic", category: "Mobile", icon: SiIonic, color: "#3880FF" },
  { name: "Android", category: "Mobile", icon: SiAndroid, color: "#3DDC84" },
  { name: "iOS", category: "Mobile", icon: SiIos, color: "#000000" },
  
  // Testing Frameworks
  { name: "Jest", category: "Testing", icon: SiJest, color: "#C21325" },
  { name: "Cypress", category: "Testing", icon: SiCypress, color: "#17202C" },
  { name: "Selenium", category: "Testing", icon: SiSelenium, color: "#43B02A" },
  { name: "Vitest", category: "Testing", icon: SiVitest, color: "#6E9F18" },
  { name: "Testing Library", category: "Testing", icon: SiTestinglibrary, color: "#E33332" },
  { name: "Mocha", category: "Testing", icon: SiMocha, color: "#8D6748" },
  
  // State Management & Build Tools
  { name: "Redux", category: "State Management", icon: SiRedux, color: "#764ABC" },
  { name: "Webpack", category: "Build Tools", icon: SiWebpack, color: "#8DD6F9" },
  { name: "Vite", category: "Build Tools", icon: SiVite, color: "#646CFF" },
  { name: "ESBuild", category: "Build Tools", icon: SiEsbuild, color: "#FFCF00" },
  
  // Package Managers & Additional Tools
  { name: "npm", category: "Tools", icon: SiNpm, color: "#CB3837" },
  { name: "Yarn", category: "Tools", icon: SiYarn, color: "#2C8EBB" },
  { name: "pnpm", category: "Tools", icon: SiPnpm, color: "#F69220" },
  { name: "ESLint", category: "Tools", icon: SiEslint, color: "#4B32C3" },
  { name: "Prettier", category: "Tools", icon: SiPrettier, color: "#F7B93E" },
  { name: "Babel", category: "Tools", icon: SiBabel, color: "#F9DC3E" },
  { name: "Storybook", category: "Tools", icon: SiStorybook, color: "#FF4785" },
]

export function SkillsSection({ skills, onAddSkill, onRemoveSkill }: SkillsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  // Filter skills based on search term
  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return skillsDatabase
    return skillsDatabase.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Get skills that are already added
  const addedSkillNames = useMemo(() => 
    new Set(skills.map(skill => skill.name.toLowerCase()))
  , [skills])

  const handleAddSkill = (skillData: { name: string; category: string }) => {
    if (!addedSkillNames.has(skillData.name.toLowerCase())) {
      onAddSkill(skillData)
      setSearchTerm("")
      setIsDropdownOpen(false)
    }
  }


  // Track mouse position for cursor-following tooltips
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white   transition-all duration-300">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-black font-bold flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wrench className="h-5 w-5 mr-2" />
              </motion.div>
            Skills & Technologies
          </CardTitle>
            <p className="text-gray-600 font-medium text-sm">
              Search and add your technical skills to showcase your expertise
          </p>
        </CardHeader>
      </Card>
      </motion.div>

      {/* Search and Add Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-white   transition-all duration-300">
        <CardContent className="pt-2 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search for skill..."
                  className="pl-10 pr-10 bg-gray-50  text-black font-medium text-sm focus:bg-white"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
            </div>

              {/* Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white  rounded-lg  z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="p-4">
                      <div 
                        className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3"
                        onMouseMove={handleMouseMove}
                      >
                        {filteredSkills.slice(0, 60).map((skill, index) => {
                          const isAdded = addedSkillNames.has(skill.name.toLowerCase())
                          const IconComponent = skill.icon
                  return (
                            <motion.div
                              key={skill.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.01 }}
                              className="relative group"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => !isAdded && handleAddSkill(skill)}
                                disabled={isAdded}
                                onMouseEnter={() => setHoveredSkill(skill.name)}
                                onMouseLeave={() => setHoveredSkill(null)}
                                className={`h-12 w-12 p-0 rounded-lg border-2 transition-all duration-200 ${
                                  isAdded
                                    ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                                    : "bg-gray-50 border-gray-200  hover:bg-white hover:shadow-md hover:scale-105"
                                }`}
                              >
                                <IconComponent 
                                  className="w-6 h-6" 
                                  style={{ color: isAdded ? '#9CA3AF' : skill.color }}
                                />
                              </Button>
                            </motion.div>
                          )
                        })}
                      </div>
                      
                      {filteredSkills.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No skills found matching "{searchTerm}"</p>
                        </div>
                      )}
                      
                      {filteredSkills.length > 60 && (
                        <div className="text-center mt-4 py-2 border-t border-gray-200">
                          <p className="text-sm text-gray-500">
                            Showing first 60 results. Refine your search for more specific results.
                          </p>
                        </div>
                      )}
            </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>
          
        </CardContent>
      </Card>
      </motion.div>

      {/* Selected Skills */}
      {skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white transition-all duration-300">
              <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black font-bold flex items-center justify-between">
                <span>Selected Skills</span>
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                  {skills.length}
                </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
              <div 
                className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-3"
                onMouseMove={handleMouseMove}
              >
                {skills.map((skill, index) => {
                  const skillData = skillsDatabase.find(s => s.name === skill.name)
                  const IconComponent = skillData?.icon || Wrench
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="relative group"
                    >
                      <div 
                        className="relative h-10 w-10 bg-gray-50  rounded-lg flex items-center justify-center  hover:bg-white hover:shadow-md transition-all duration-200"
                        onMouseEnter={() => setHoveredSkill(skill.name)}
                        onMouseLeave={() => setHoveredSkill(null)}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: skillData?.color || '#000000' }}
                        />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSkill(skill.id)}
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                </div>
                    </motion.div>
          )
        })}
      </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {skills.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white   transition-all duration-300">
          <CardContent className="pt-6">
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-600 mb-2 font-medium text-lg">No skills added yet</p>
              <p className="text-gray-500 text-sm">
                  Use the search box above to find and add your skills
              </p>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Cursor-following tooltip */}
      <AnimatePresence>
        {hoveredSkill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-black text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none z-[9999] "
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y - 35,
              transform: 'translateZ(0)', // Force hardware acceleration
            }}
          >
            {hoveredSkill}
            <div className="absolute left-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
