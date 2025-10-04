import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-8 lg:py-28">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-sm">
            <span className="mr-2">🔥</span>
            <span>Free right now - grab it while it's hot</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Create stunning portfolios from your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              GitHub profile
            </span>
          </h1>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base" asChild>
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

          <div className="mt-12 text-sm text-muted-foreground">Used by devs who actually ship stuff</div>
        </div>
      </div>
    </section>
  )
}
