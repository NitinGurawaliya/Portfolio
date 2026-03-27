"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { 
  FolderKanban, 
  Ship, 
  Trophy, 
  Briefcase,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Portfolio",
    path: "/portfolio",
    icon: Briefcase,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Shiplogs",
    path: "/shiplogs",
    icon: Ship,
  },
  {
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
]

interface PortfolioSidebarProps {
  className?: string
}

export function PortfolioSidebar({ className }: PortfolioSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Get current theme (handles system theme)
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileOpen(false)
  }

  const sidebarStyles = isDark
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-200 text-gray-900"

  const itemActiveStyles = isDark
    ? "bg-gray-800 text-white border-l-4 border-blue-500"
    : "bg-gray-100 text-gray-900 border-l-4 border-blue-500"

  const itemHoverStyles = isDark
    ? "hover:bg-gray-800 hover:text-white"
    : "hover:bg-gray-50 hover:text-gray-900"

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={cn(
            "rounded-full shadow-lg",
            isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
          )}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 w-64 h-full border-r transition-transform duration-300 z-30",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          sidebarStyles,
          className
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo/Header */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
            <h2 className={cn(
              "text-xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              DevFolio
            </h2>
          </div>

          {/* Navigation Items - Scrollable */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    isActive ? itemActiveStyles : itemHoverStyles,
                    isDark && !isActive ? "text-gray-300" : "",
                    !isDark && !isActive ? "text-gray-600" : ""
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive 
                      ? (isDark ? "text-blue-400" : "text-blue-600")
                      : (isDark ? "text-gray-400" : "text-gray-500")
                  )} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t flex-shrink-0" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
            <p className={cn(
              "text-xs text-center",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              © 2024 DevFolio
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

