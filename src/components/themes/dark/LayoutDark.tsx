import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building } from "lucide-react"
import { SiGithub, SiX, SiLinkedin, SiInstagram, SiFacebook, SiYoutube, SiGmail, SiStackoverflow, SiReddit } from "react-icons/si"
import { Globe } from "lucide-react"

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

interface LayoutDarkProps {
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

export default function LayoutDark({ theme, portfolio }: LayoutDarkProps) {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: theme.colors.background,
        color: theme.colors.text 
      }}
    >
      {/* Dark Background Gradient */}
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
            {/* Profile Content */}
            <div className="lg:col-span-8">
              {/* Profile Picture and Social Icons */}
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
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all duration-300 -z-10"></div>
                </motion.div>

                {/* Social Icons - Mobile/Tablet */}
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

            {/* Social Icons for Large Screens */}
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
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
              {portfolio.repositories
                .filter(repo => repo.isVisible)
                .map((repo, index) => (
                <motion.article
                  key={repo.id}
                  className="group relative cursor-pointer h-fit w-full"
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
                  <div className="relative bg-transparent border border-orange-500/30 rounded-lg p-4 sm:p-6 hover:border-orange-500/50 transition-all duration-300 h-full flex flex-col w-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300 mb-2 break-words">
                          {repo.repository.name}
                        </h3>
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-3 break-words">
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
              {portfolio.skills.map((skill, index) => (
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
                    <div className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-xs font-bold">{skill.name.charAt(0)}</span>
                    </div>
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-300 text-center leading-tight group-hover:text-white transition-colors duration-300">
                    {skill.name}
                  </span>
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
        className="relative z-10 py-4 lg:py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        aria-label="Footer"
      >
        <div className="mx-auto px-6 lg:px-8 max-w-6xl">
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
