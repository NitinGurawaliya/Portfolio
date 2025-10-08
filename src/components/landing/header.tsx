import { Button } from "@/components/ui/button"
import { Github, Twitter, User, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="m-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              DevFolio
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/NitinGurawaliya/Portfolio" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="https://x.com/nitin93937331" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
            {/* <ThemeToggle /> */}
            <Button variant="outline" size="sm" asChild>
              <a href="/auth">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
