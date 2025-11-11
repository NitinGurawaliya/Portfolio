"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PortfolioPreview } from "./PortfolioPreview"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Code,
  Wrench,
  Users,
  ExternalLink,
  LogOut,
  Palette,
  BarChart3,
    Eye,
  X,
  ChevronLeft,
  ChevronRight,
    Newspaper,
    Menu,
} from "lucide-react"
import { DevFolioInlineLoader } from "@/components/ui/DevFolioLoader"
import { cn } from "@/lib/utils"
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

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
  notificationBell?: React.ReactNode
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
  isPublishing = false,
  notificationBell,
}: DashboardLayoutProps) {
    const [previewMode, setPreviewMode] = useState<"mobile">("mobile")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
    const [isSidebarPinned, setIsSidebarPinned] = useState(true)
    const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  const isSidebarExpanded = isSidebarPinned || isSidebarHovered

    const sidebarItems = [
    { id: "home", label: "Bio", icon: User },
    { id: "repos", label: "Projects", icon: Code },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "socials", label: "Socials", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "theme", label: "Theme", icon: Palette },
  ]

    const communityItem = { id: "feed", label: "Community Feed", icon: Newspaper }
    const CommunityIcon = communityItem.icon

    const notificationButton = notificationBell ? (
      <div className="order-1 flex w-full justify-end sm:order-none sm:w-auto">{notificationBell}</div>
    ) : null

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
    <>
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:w-[320px]">
          <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-base font-semibold text-white shadow-sm">
                D
              </div>
              DevFolio
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onSectionChange(item.id)
                    setIsMobileNavOpen(false)
                  }}
                  className="h-10 justify-start gap-3 rounded-xl text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
            <Button
              variant={activeSection === communityItem.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                onSectionChange(communityItem.id)
                setIsMobileNavOpen(false)
              }}
              className="h-10 justify-start gap-3 rounded-xl text-sm font-medium"
            >
              <CommunityIcon className="h-4 w-4" />
              {communityItem.label}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMobileNavOpen(false)
                void handleLogout()
              }}
              className="h-10 justify-start gap-3 rounded-xl text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative grid min-h-screen w-full bg-background text-foreground text-[0.95rem] md:grid-cols-[minmax(0,260px)_1fr]">
        <motion.aside
          onMouseEnter={() => {
            if (!isSidebarPinned) {
              setIsSidebarHovered(true)
            }
          }}
          onMouseLeave={() => {
            if (!isSidebarPinned) {
              setIsSidebarHovered(false)
            }
          }}
          variants={itemVariants}
          initial="visible"
          animate="visible"
          className={cn(
            "relative hidden h-full flex-col border-r border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-200 md:sticky md:top-0 md:z-40 md:flex md:min-h-screen",
            isSidebarExpanded ? "md:w-[16rem] md:px-3" : "md:w-16 md:items-center md:px-2"
          )}
        >
          <motion.div
            className={cn(
              "sticky top-0 z-10 flex items-center gap-3 bg-card/90",
              isSidebarExpanded ? "justify-start px-1 pt-6 pb-4" : "justify-center pt-6 pb-4"
            )}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-base font-semibold text-white shadow-sm">
              D
            </div>
            {isSidebarExpanded && (
              <span className="text-sm font-semibold tracking-wide text-foreground/80">
                DevFolio
              </span>
            )}
          </motion.div>

          <div
            className={cn(
              "flex w-full",
              isSidebarExpanded ? "justify-end px-1" : "justify-center"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSidebarPinned((prev) => !prev)
                if (isSidebarPinned) {
                  setIsSidebarHovered(false)
                }
              }}
              className={cn(
                "h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                !isSidebarExpanded && "hover:bg-muted/60"
              )}
              aria-label={isSidebarPinned ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarPinned ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto pb-6">
            <div className="flex flex-col space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <motion.div
                    key={item.id}
                    className="relative group"
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "relative cursor-pointer rounded-xl transition-all duration-150",
                        isSidebarExpanded
                          ? "h-10 w-full justify-start gap-3 px-3"
                          : "h-10 w-10 justify-center",
                        isActive
                          ? "bg-gray-100 text-black shadow-sm dark:bg-card/80 dark:text-[#E5E7EB] dark:hover:bg-card/80"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {isSidebarExpanded && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {isActive && !isSidebarExpanded && (
                        <motion.span
                          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Button>
                    {!isSidebarExpanded && (
                      <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <div
              className={cn(
                "mt-6",
                isSidebarExpanded
                  ? "space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-3"
                  : "flex justify-center"
              )}
            >
              {isSidebarExpanded ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSectionChange(communityItem.id)}
                  className="relative h-11 w-full justify-start gap-3 rounded-xl bg-card px-3 text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-card/80"
                >
                  <Newspaper className="h-4 w-4" />
                  <div className="flex flex-1 flex-col items-start">
                    <span className="text-sm font-semibold text-foreground">Community Feed</span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Discover published projects
                    </span>
                  </div>
                </Button>
              ) : (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionChange(communityItem.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-all duration-150 hover:bg-muted/60"
                  >
                    <Newspaper className="h-4 w-4" />
                  </Button>
                  <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                    Community Feed
                  </div>
                </div>
              )}
            </div>
          </nav>

          <motion.div
            className="sticky bottom-0 z-10 pt-4 pb-6"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "rounded-xl transition-all duration-150",
                isSidebarExpanded
                  ? "h-10 w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-destructive hover:text-white"
                  : "h-10 w-10 justify-center text-muted-foreground hover:text-destructive"
              )}
            >
              <LogOut className="h-4 w-4" />
              {isSidebarExpanded && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </Button>
          </motion.div>
        </motion.aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <motion.header
            className="relative z-30 flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6"
            variants={itemVariants}
            initial="visible"
            animate="visible"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
              <h2 className="text-base font-semibold">Dashboard</h2>
            </div>
            <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
              {notificationButton}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const currentDomain = window.location.origin
                  const username =
                    livePortfolio?.customUsername ||
                    portfolioData?.customUsername ||
                    user?.githubUsername ||
                    "username"
                  window.open(`${currentDomain}/${username}`, "_blank")
                }}
                className="order-2 w-full rounded-lg px-3 text-xs font-semibold sm:order-none sm:w-auto"
              >
                Visit Profile
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={isPreviewOpen ? "default" : "outline"}
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="order-3 w-full rounded-lg px-3 text-xs font-semibold sm:order-none sm:w-auto"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                {isPreviewOpen ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button
                size="sm"
                onClick={onPublish}
                disabled={!hasUnsavedChanges || isPublishing}
                variant={hasUnsavedChanges && !isPublishing ? "default" : "secondary"}
                className={cn(
                  "order-4 w-full rounded-lg px-3 text-xs font-semibold transition-colors sm:order-none sm:w-auto",
                  hasUnsavedChanges && !isPublishing
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                    : ""
                )}
              >
                {isPublishing ? (
                  <DevFolioInlineLoader />
                ) : hasUnsavedChanges ? (
                  <span className="inline-flex items-center gap-2">
                    <span>Publish 🔥</span>
                    <span className="hidden rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] md:inline">
                      Ctrl+S
                    </span>
                  </span>
                ) : (
                  "No Changes"
                )}
              </Button>
            </div>
          </motion.header>

          <div className="flex-1 overflow-y-auto bg-muted/20 scrollbar-hide">
            <div
              key={activeSection}
              className="px-4 py-5 sm:px-6"
              style={{ willChange: "contents" }}
            >
              {children}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isPreviewOpen && (
            <>
              <motion.div
                key="preview-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setIsPreviewOpen(false)}
              />
              <motion.div
                key="preview-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  duration: 0.4,
                }}
                className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-border/60 bg-card shadow-2xl sm:max-w-[420px] lg:w-[400px]"
              >
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Portfolio Preview
                  </h3>
                  <Button
                    onClick={() => setIsPreviewOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted/60"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto bg-background">
                  <PortfolioPreview
                    username={user?.githubUsername}
                    previewMode={previewMode}
                    portfolio={livePortfolio}
                    key={`${previewMode}-preview`}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}