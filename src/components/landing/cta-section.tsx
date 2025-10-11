import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 xl:py-32">
      <div className="container px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 lg:p-12 text-center backdrop-blur">
          <div className="absolute inset-0 grid-bg dark:grid-bg opacity-30" />
          <div className="relative">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight">
              Stop procrastinating. Build your portfolio.
            </h2>
            <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg text-muted-foreground text-pretty">
              Your repos are sitting there doing nothing. Turn them into something that gets you noticed. Takes 2
              minutes, works forever.
            </p>
            <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base" asChild>
              <a href="/auth">
                <Github className="mr-2 h-4 w-4" />
                Yeah, Let's Go
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
