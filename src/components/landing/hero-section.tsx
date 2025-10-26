import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-8 lg:py-28">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative px-4 sm:px-6 mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 sm:mb-8 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs sm:text-sm">
            <span className="mr-1 sm:mr-2">🔥</span>
            <span className="text-xs sm:text-sm">Free right now - grab it while it's hot</span>
          </div>

          <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight">
            Create stunning portfolios from your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block sm:inline">
              GitHub profile
            </span>
          </h1>
          
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-sm sm:text-base w-full sm:w-auto" asChild>
              <a href="/auth">
                <Github className="mr-2 h-4 w-4" />
                Let's Do This
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {/* <Button variant="outline" size="lg" className="text-base bg-transparent" asChild>
              <a href="#demo">
                <Play className="mr-2 h-4 w-4" />
                Show Me How
              </a>
            </Button> */}
          </div>

          <div className="mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground">Used by devs who actually ship stuff</div>
        </div>
      </div>
    </section>
  )
}
