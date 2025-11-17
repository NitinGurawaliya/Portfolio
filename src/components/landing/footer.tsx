import { Github, Twitter, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm sm:text-base">D</span>
              </div>
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                DevFolio
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
              Made for developers, by developers. Transform your GitHub into a stunning portfolio in minutes with multiple themes.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="/auth" className="hover:text-foreground transition-colors">
                  Get Started
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/40 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 DevFolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
