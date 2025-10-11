import { Button } from "@/components/ui/button"
import { Github, Twitter, User, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6">
        <div className="flex">
          <a className="mr-4 sm:mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              DevFolio
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
              <a href="https://github.com/NitinGurawaliya/Portfolio" target="_blank" rel="noopener noreferrer">
                <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
              <a href="https://x.com/nitin93937331" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm" asChild>
              <a href="/auth">
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Sign In</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
