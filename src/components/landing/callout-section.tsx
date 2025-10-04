import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function CalloutSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <Card className="border-border/40 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Plot twist: It's actually smart
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Our AI reads your code and writes descriptions that don't suck. So when recruiters land on your portfolio,
              they actually understand what you built (instead of wondering what "blockchain-todo-app" does).
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
