"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PortfolioPreview } from "./PortfolioPreview"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  Code, 
  Wrench, 
  Users, 
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Sparkles,
  Zap,
  Loader2,
  Save,
  LogOut
} from "lucide-react"

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
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const sidebarItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "repos", label: "Repos", icon: Code },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "socials", label: "Socials", icon: Users },
  ]

  const handleLogout = () => {
    // Clear session cookie
    document.cookie = 'github-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // Redirect to auth page
    window.location.href = '/auth'
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
    <div className="h-screen w-full bg-white text-black overflow-hidden min-w-[1024px] flex">
      {/* Main Content - Using Flex Layout */}
        {/* Left Sidebar */}
        <motion.div 
          className="w-12 bg-gray-50 flex flex-col items-center py-4 overflow-hidden relative z-40 flex-shrink-0"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Navigation Items */}
          <div className="flex flex-col space-y-4 flex-1">
            {sidebarItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <motion.div
                key={item.id}
                className="relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onSectionChange(item.id)}
                    className={`h-8 w-8 p-0 relative z-50 cursor-pointer ${
                      isActive 
                        ? "bg-black text-white " 
                        : "text-gray-600 hover:text-black hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {isActive && (
                      <motion.div
                        className="absolute -right-1 -top-1 w-2 h-2 bg-black rounded-full"
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
                </motion.div>
                
                {/* Tooltip - repositioned and clamped to viewport */}
                <motion.div
                  className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/95 text-white px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md max-w-[200px] truncate"
                  initial={{ x: -6, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                >
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-black/95" />
                </motion.div>
              </motion.div>
            )
          })}
          </div>

          {/* Logout Button */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: 0.5,
              ease: "easeOut"
            }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.1,
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 w-8 p-0 relative z-50 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </motion.div>
            
            {/* Tooltip */}
            <motion.div
              className="absolute left-14 top-1/2 -translate-y-1/2 bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md"
              initial={{ x: -6, opacity: 0 }}
              whileHover={{ x: 0, opacity: 1 }}
            >
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-red-600" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Left Content - Full Height */}
        <div 
          key={`scroll-container-${activeSection}`}
          className="w-[520px] p-3 md:p-4 overflow-y-auto overflow-x-hidden scrollbar-hide bg-white h-screen relative z-30 flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              variants={containerVariants}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Preview Pane with Controls */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          {/* Preview Controls at Top */}
          <motion.div 
            className="flex items-center justify-between w-full p-3 bg-white border-b border-gray-100 relative z-50"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left - Portfolio URL Component */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative z-10"
            >
              <div
                onClick={() => {
                  const currentDomain = window.location.origin
                  window.open(`${currentDomain}/${portfolioData?.customUsername || user?.githubUsername || 'username'}`, '_blank')
                }}
                className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 min-w-[180px]"
              >
                <div className="flex items-center">
                  <span className="text-gray-600 text-xs font-medium">
                    {typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/
                  </span>
                  <span className="text-blue-600 text-xs font-semibold">
                    {portfolioData?.customUsername || user?.githubUsername || 'username'}
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 ml-1.5" />
              </div>
            </motion.div>

            {/* Center - Preview Mode Toggle */}
            <motion.div 
              className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 relative z-10"
              variants={itemVariants}
            >
              {[
                { mode: "desktop", icon: Monitor },
                { mode: "tablet", icon: Tablet },
                { mode: "mobile", icon: Smartphone }
              ].map(({ mode, icon: Icon }) => (
                <motion.div key={mode}>
                  <Button
                    variant={previewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewMode(mode as any)}
                    className={`h-7 w-7 p-0 relative z-20 cursor-pointer ${
                      previewMode === mode 
                        ? "bg-black text-white " 
                        : "text-gray-600 hover:text-black hover:bg-white"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Icon className="h-3 w-3" />
                    </motion.div>
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Right - Publish Button */}
            <motion.div
              whileHover={{ scale: hasUnsavedChanges && !isPublishing ? 1.02 : 1 }}
              whileTap={{ scale: hasUnsavedChanges && !isPublishing ? 0.98 : 1 }}
              className="relative z-10"
            >
              <Button
                onClick={onPublish}
                disabled={!hasUnsavedChanges || isPublishing}
                className={`group relative overflow-hidden transition-all duration-500 font-semibold text-sm px-6 py-2.5 h-10 rounded-xl border backdrop-blur-sm ${
                  hasUnsavedChanges && !isPublishing
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white border-emerald-400/50 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 hover:border-emerald-300/70 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:shadow-xl cursor-pointer"
                    : "bg-gray-800/50 text-gray-500 border-gray-600/30 cursor-not-allowed backdrop-blur-sm"
                }`}
              >
                {/* Animated background gradient */}
                {hasUnsavedChanges && !isPublishing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Button content */}
                <motion.div
                  className="relative flex items-center justify-center gap-2"
                  whileHover={{ x: hasUnsavedChanges && !isPublishing ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span className="text-white font-medium">Deploying...</span>
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <motion.div
                        className="flex items-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Sparkles className="h-4 w-4 text-white" />
                      </motion.div>
                      <span className="text-white font-medium">Deploy Portfolio</span>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="h-4 w-4 text-yellow-300" />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-500">No Changes</span>
                    </>
                  )}
                </motion.div>

                {/* Pulse effect for active state */}
                {hasUnsavedChanges && !isPublishing && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-emerald-400/50"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Shimmer effect on hover */}
                {hasUnsavedChanges && !isPublishing && (
                  <motion.div
                    className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Preview Content */}
          <div className="flex-1 flex justify-center overflow-hidden pt-3 pl-3 pr-2 pb-2">
            <div className={`${
              previewMode === "mobile" 
                ? "w-[280px]" 
                : previewMode === "tablet"
                ? "w-[420px]"
                : "w-full max-w-[1200px]"
            } h-full bg-gray-50 overflow-hidden rounded-xl shadow-lg border border-gray-200`}>
              <PortfolioPreview 
                username={user?.githubUsername} 
                previewMode={previewMode}
                portfolio={livePortfolio}
                key={`${previewMode}-preview`}
              />
            </div>
          </div>
        </div>
      </div>
  )
}