import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building } from "lucide-react"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"
import { SkillIcon } from "@/lib/skill-icons"

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
  user: {
    githubUsername: string
    location: string
    company: string
    websiteUrl: string
  }
}

interface LayoutLightProps {
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

export default function LayoutLight({ theme, portfolio }: LayoutLightProps) {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: theme.colors.background,
        color: theme.colors.text 
      }}
    >
      {/* Light Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-50 to-white"></div>

      {/* Hero Section - Centered Layout */}
      <motion.section 
        className="relative z-10 pt-16 md:pt-20 lg:pt-24 pb-12 md:pb-16 lg:pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-label="Profile introduction"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center space-y-4">
            {/* Profile Picture */}
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Avatar className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 border-4 border-cyan-400/30 bg-white shadow-2xl">
                <AvatarImage 
                  src={portfolio.profilePic} 
                  className="object-cover" 
                  alt={`${portfolio.displayName}'s profile picture`}
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 text-3xl lg:text-4xl font-bold">
                  {portfolio.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Name */}
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {portfolio.displayName}
            </motion.h1>

            {/* Job Title */}
            {portfolio.jobTitle && (
              <motion.p 
                className="text-xl md:text-2xl lg:text-3xl text-purple-600 font-semibold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {portfolio.jobTitle}
              </motion.p>
            )}

            {/* Bio */}
            <motion.p 
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {portfolio.bio}
            </motion.p>

            {/* Social Icons - Centered */}
            <motion.div 
              className="flex justify-center gap-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {portfolio.socials && portfolio.socials
                .filter(social => social.isPinned)
                .map((social, index) => {
                  const Icon = getSocialIcon(social.platform)
                  return (
                    <motion.button
                      key={social.id}
                      onClick={() => window.open(social.url, '_blank')}
                      className="group p-4 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      aria-label={`Visit ${social.platform} profile`}
                    >
                      <Icon className="h-6 w-6 group-hover:drop-shadow-lg" />
                    </motion.button>
                  )
                })}
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
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-gray-900 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Projects I've Made
            </motion.h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.article
                  key={repo.id}
                  className="group relative cursor-pointer w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -2 }}
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
                  <div className="relative bg-gray-100 rounded-lg p-4 sm:p-6 hover:bg-gray-200 transition-all duration-300 border border-gray-200 w-full">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">
                          {repo.customName || repo.repository.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                          {repo.customDescription || repo.repository.description || "No description available for this project."}
                        </p>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          const githubUrl = repo.repository.githubUrl || repo.repository.htmlUrl
                          window.open(githubUrl, '_blank')
                        }}
                        className="flex-shrink-0 p-1.5 rounded-md bg-transparent text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-all duration-300 ml-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`View ${repo.repository.name} on GitHub`}
                      >
                        <SiGithub className="h-4 w-4" />
                      </motion.button>
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
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-gray-900 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Skills I've Learned
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto px-4">
              {portfolio.skills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`${skill.name} skill`}
                >
                  <div className="bg-black text-white px-3 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-gray-700">
                    {skill.name}
                  </div>
                </motion.div>
              ))}
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
              className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-gray-900 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
            >
              Let's Connect
            </motion.h2>
            <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 flex-wrap max-w-2xl mx-auto">
              {portfolio.socials && portfolio.socials
                .filter(social => social.username && social.username.trim())
                .map((social, index) => {
                  const Icon = getSocialIcon(social.platform)
                  
                  const platformStyles = {
                    github: { 
                      bg: 'bg-gray-800/90', 
                      border: 'border-gray-700/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-900/90 hover:text-white hover:border-gray-600/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-900/40'
                    },
                    email: { 
                      bg: 'bg-blue-600/90', 
                      border: 'border-blue-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-700/90 hover:text-white hover:border-blue-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-500/40'
                    },
                    twitter: { 
                      bg: 'bg-black/90', 
                      border: 'border-gray-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-900/90 hover:text-white hover:border-gray-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-700/40'
                    },
                    x: { 
                      bg: 'bg-black/90', 
                      border: 'border-gray-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-gray-900/90 hover:text-white hover:border-gray-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-gray-700/40'
                    },
                    instagram: { 
                      bg: 'bg-gradient-to-r from-purple-600 to-pink-600/90', 
                      border: 'border-purple-500/50', 
                      text: 'text-white', 
                      hover: 'hover:from-purple-700 hover:to-pink-700/90 hover:text-white hover:border-purple-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-purple-500/40'
                    },
                    linkedin: { 
                      bg: 'bg-blue-700/90', 
                      border: 'border-blue-600/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-800/90 hover:text-white hover:border-blue-500/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-600/40'
                    },
                    facebook: { 
                      bg: 'bg-blue-600/90', 
                      border: 'border-blue-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-blue-700/90 hover:text-white hover:border-blue-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-blue-500/40'
                    },
                    youtube: { 
                      bg: 'bg-red-600/90', 
                      border: 'border-red-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-red-700/90 hover:text-white hover:border-red-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-red-500/40'
                    },
                    stackoverflow: { 
                      bg: 'bg-orange-600/90', 
                      border: 'border-orange-500/50', 
                      text: 'text-white', 
                      hover: 'hover:bg-orange-700/90 hover:text-white hover:border-orange-400/70',
                      shadow: 'hover:shadow-xl hover:shadow-orange-500/40'
                    },
                    reddit: { 
                      bg: 'bg-orange-500/90', 
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
        className="relative z-10 py-6 lg:py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-4xl">
          <div className="flex justify-center">
            <motion.a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Visit DevFolio homepage"
            >
              <p className="text-sm font-medium">
                <span className="text-gray-300">Powered by </span>
                <span className="text-blue-400 font-semibold">DevFolio</span>
              </p>
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
