import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, RefreshCw, Palette, Trophy } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Zero Setup Required",
    description: "Connect your GitHub, pick a theme, and you're done. We handle all the heavy lifting.",
  },
  {
    icon: RefreshCw,
    title: "Always Up-to-Date",
    description: "Your portfolio automatically updates when you push new code. Set it and forget it.",
  },
  {
    icon: Palette,
    title: "Multiple Beautiful Themes",
    description: "Choose from professional, creative, minimal, and bold themes. Switch anytime.",
  },
  {
    icon: Trophy,
    title: "Showcase Your Best Work",
    description: "Highlight your projects, skills, and social links in one stunning portfolio.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 xl:py-32">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight">
            Everything you need (and nothing you don't)
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground text-pretty">
            We built this because we were tired of ugly developer portfolios.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mb-3 sm:mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg leading-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
