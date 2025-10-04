import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 to-primary/5 p-12 text-center backdrop-blur">
          <div className="absolute inset-0 grid-bg dark:grid-bg opacity-30" />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Stop procrastinating. Build your portfolio.
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
              Your repos are sitting there doing nothing. Turn them into something that gets you noticed. Takes 2
              minutes, works forever.
            </p>
            <Button size="lg" className="text-base" asChild>
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
