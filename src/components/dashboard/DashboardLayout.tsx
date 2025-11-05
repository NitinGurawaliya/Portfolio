"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PortfolioPreview } from "./PortfolioPreview"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User,
  Code, 
  Wrench, 
  Users, 
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Loader2,
  LogOut,
  Palette,
  BarChart3,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { DevFolioInlineLoader } from "@/components/ui/DevFolioLoader"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  activeSection: string
  onSectionChange: (section: string) => void
  refreshTrigger?: number
  livePortfolio?: any
  portfolioData?: any
  hasUnsavedChanges?: boolean
  onPublish?: () => Promise<void>
  isPublishing?: boolean
}

export function DashboardLayout({ 
  children, 
  user, 
  activeSection,
  onSectionChange,
  refreshTrigger,
  livePortfolio,
  portfolioData,
  hasUnsavedChanges = false,
  onPublish,
  isPublishing = false
}: DashboardLayoutProps) {
  const [previewMode, setPreviewMode] = useState<"mobile">("mobile")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const sidebarItems = [
    { id: "home", label: "Bio", icon: User },
    { id: "repos", label: "Repos", icon: Code },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "socials", label: "Socials", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "theme", label: "Theme", icon: Palette },
  ]

  const handleLogout = async () => {
    try {
      // Call logout API to clear session cookie server-side
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Also clear client-side cookie (backup)
        document.cookie = 'github-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'github-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
        // Redirect to auth page
        window.location.href = '/'
      } else {
        // Even if API fails, try to clear and redirect
        document.cookie = 'github-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.href = '/auth'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: clear cookies and redirect
      document.cookie = 'github-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.href = '/auth'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
      <div className="h-screen w-full bg-white text-black overflow-hidden min-w-[1024px] flex relative">
      {/* Main Content - Using Flex Layout */}
        {/* Left Sidebar - Instant render */}
        <motion.div 
          className={`bg-gray-50 flex flex-col py-4 overflow-visible relative z-40 flex-shrink-0 transition-all duration-300 ${
            isSidebarExpanded ? 'w-48 px-3' : 'w-12 items-center px-0'
          }`}
          variants={itemVariants}
          initial="visible"
          animate="visible"
        >
          {/* DevFolio Logo */}
          <motion.div
            className={`mb-6 flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            {isSidebarExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarExpanded(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
          
          {/* Expand Button - Only visible when collapsed */}
          {!isSidebarExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarExpanded(true)}
              className="h-8 w-8 p-0 mb-4 text-gray-400 hover:text-black hover:bg-gray-100"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col space-y-2 flex-1">
            {sidebarItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0,
                  delay: 0,
                  ease: "easeOut"
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Instant navigation - no delays
                    onSectionChange(item.id)
                  }}
                  className={`relative z-50 cursor-pointer transition-colors duration-75 ${
                    isSidebarExpanded 
                      ? 'h-9 w-full justify-start px-3 gap-3' 
                      : 'h-8 w-8 p-0 justify-center'
                  } ${
                    isActive 
                      ? "bg-black text-white" 
                      : "text-gray-400 hover:text-black hover:bg-gray-100"
                  }`}
                  style={{ willChange: 'background-color' }}
                >
                    <Icon className={`${isSidebarExpanded ? 'h-4 w-4' : 'h-3 w-3'}`} />
                    {isSidebarExpanded && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {isActive && !isSidebarExpanded && (
                      <motion.div
                        className="absolute -right-1 -top-1 w-2 h-2 bg-orange-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="w-full h-full bg-white rounded-full"
                          animate={{ 
                            scale: [0.5, 0.8, 0.5],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    )}
                </Button>
                
                {/* Tooltip - Only show when collapsed */}
                {!isSidebarExpanded && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-l-0 border-r-[4px] border-t-[3px] border-b-[3px] border-transparent border-r-black" />
                  </div>
                )}
              </motion.div>
            )
          })}
          </div>

          {/* Logout Button */}
          <motion.div
            className="relative group"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0,
              delay: 0,
              ease: "easeOut"
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`relative z-50 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors ${
                isSidebarExpanded 
                  ? 'h-9 w-full justify-start px-3 gap-3' 
                  : 'h-8 w-8 p-0 justify-center'
              }`}
            >
              <LogOut className={`${isSidebarExpanded ? 'h-4 w-4' : 'h-3 w-3'}`} />
              {isSidebarExpanded && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </Button>
            
            {/* Tooltip - Only show when collapsed */}
            {!isSidebarExpanded && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md">
                Logout
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-l-0 border-r-[4px] border-t-[3px] border-b-[3px] border-transparent border-r-black" />
              </div>
            )}
          </motion.div>
        </motion.div>


        {/* Main Dashboard Content Area */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col relative">
          {/* Dashboard Controls at Top */}
          <motion.div 
            className="flex items-center justify-between w-full p-3 bg-white border-b border-gray-100 relative z-50"
            variants={itemVariants}
            initial="visible"
            animate="visible"
          >
            {/* Left - Title */}
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-black">Dashboard</h2>
            </div>

            {/* Right - Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  const currentDomain = window.location.origin
                  const username = livePortfolio?.customUsername || portfolioData?.customUsername || user?.githubUsername || 'username'
                  window.open(`${currentDomain}/${username}`, '_blank')
                }}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
              >
                Visit Profile
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>

              <Button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isPreviewOpen 
                    ? "bg-orange-600 text-white hover:bg-orange-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewOpen ? "Hide Preview" : "Show Preview"}
              </Button>
              
              <Button
                onClick={onPublish}
                disabled={!hasUnsavedChanges || isPublishing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasUnsavedChanges && !isPublishing
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPublishing ? (
                  <DevFolioInlineLoader />
                ) : hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-2">
                    <span>Publish 🔥</span>
                    <span className="hidden md:inline text-[11px] px-1.5 py-0.5 rounded bg-white/15 border border-white/20">
                      Ctrl+S
                    </span>
                  </span>
                ) : (
                  "No Changes"
                )}
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Content - Instant navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div
              key={activeSection}
              className="p-4"
              style={{ willChange: 'contents' }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Preview Sidebar - Slides in from right */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.4
              }}
              className="fixed top-0 right-0 w-[400px] h-screen bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Portfolio Preview</h3>
                <Button
                  onClick={() => setIsPreviewOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>


              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                <div className="w-full h-full overflow-hidden">
                  <PortfolioPreview 
                    username={user?.githubUsername} 
                    previewMode={previewMode}
                    portfolio={livePortfolio}
                    key={`${previewMode}-preview`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}