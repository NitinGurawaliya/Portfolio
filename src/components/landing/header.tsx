import { Button } from "@/components/ui/button"
import { Github, Twitter, User, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"

export function Header() {
  return (
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:h-14 sm:flex-nowrap sm:px-6 lg:px-12">
          <a className="flex items-center gap-2.5" href="/">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm sm:h-8 sm:w-8">
              <span className="text-base font-bold text-white sm:text-lg">D</span>
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
              DevFolio
            </span>
          </a>
          <div className="flex w-full flex-1 items-center justify-end gap-1 sm:w-auto sm:flex-none sm:gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-9 sm:w-9" asChild>
              <a href="https://github.com/NitinGurawaliya/Portfolio" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-9 sm:w-9" asChild>
              <a href="https://x.com/nitin93937331" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs sm:text-sm" asChild>
              <a href="/auth" className="flex items-center gap-1.5">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </a>
            </Button>
          </div>
        </div>
      </header>
  )
}
