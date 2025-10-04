import { Github, Twitter, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded bg-gradient-to-r from-orange-500 to-orange-600" />
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Portfolio
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Made for developers, by developers. Transform your GitHub into a stunning portfolio in minutes with multiple themes.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">Discord</span>
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-foreground transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="#themes" className="hover:text-foreground transition-colors">
                  Themes
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-foreground transition-colors">
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/auth" className="hover:text-foreground transition-colors">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-foreground transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Portfolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
