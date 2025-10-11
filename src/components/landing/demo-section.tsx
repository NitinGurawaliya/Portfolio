import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function DemoSection() {
  return (
    <section id="themes" className="py-16 sm:py-20 lg:py-24 xl:py-32 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-4 leading-tight">
            Choose your style → customize in seconds → share instantly
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty">
            Preview different themes and see how your portfolio will look.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 sm:p-6">
              <div className="h-full rounded-lg bg-background/80 backdrop-blur p-3 sm:p-4">
                <div className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 rounded bg-blue-500" />
                <div className="mb-2 h-3 w-3/4 sm:h-4 rounded bg-foreground/20" />
                <div className="mb-3 sm:mb-4 h-2 w-1/2 sm:h-3 rounded bg-foreground/10" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 sm:h-16 rounded bg-foreground/5" />
                  <div className="h-12 sm:h-16 rounded bg-foreground/5" />
                </div>
              </div>
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Modern</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Clean and minimal design</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-green-500/20 to-teal-500/20 p-4 sm:p-6">
              <div className="h-full rounded-lg bg-background/80 backdrop-blur p-3 sm:p-4">
                <div className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 rounded bg-green-500" />
                <div className="mb-2 h-3 w-3/4 sm:h-4 rounded bg-foreground/20" />
                <div className="mb-3 sm:mb-4 h-2 w-1/2 sm:h-3 rounded bg-foreground/10" />
                <div className="space-y-1 sm:space-y-2">
                  <div className="h-2 w-full sm:h-3 rounded bg-foreground/5" />
                  <div className="h-2 w-4/5 sm:h-3 rounded bg-foreground/5" />
                  <div className="h-2 w-3/5 sm:h-3 rounded bg-foreground/5" />
                </div>
              </div>
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Terminal</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Developer-focused theme</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 sm:p-6">
              <div className="h-full rounded-lg bg-background/80 backdrop-blur p-3 sm:p-4">
                <div className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 rounded bg-orange-500" />
                <div className="mb-2 h-3 w-3/4 sm:h-4 rounded bg-foreground/20" />
                <div className="mb-3 sm:mb-4 h-2 w-1/2 sm:h-3 rounded bg-foreground/10" />
                <div className="flex gap-1 sm:gap-2">
                  <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-foreground/5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 rounded bg-foreground/5" />
                    <div className="h-2 w-1/2 rounded bg-foreground/5" />
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Creative</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Bold and expressive</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base" asChild>
            <a href="/auth">
              Start Building Your Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
