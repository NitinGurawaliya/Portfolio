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
    <section id="features" className="py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Everything you need (and nothing you don't)
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            We built this because we were tired of ugly developer portfolios.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
