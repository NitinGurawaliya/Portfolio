import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star, Users } from "lucide-react"

const testimonials = [
  {
    name: "Alex Chen",
    role: "Full Stack Developer",
    content: "Honestly didn't think it would be this good. My portfolio actually looks like I know what I'm doing now.",
    avatar: "AC",
  },
  {
    name: "Sarah Kim",
    role: "Frontend Engineer",
    content: "Recruiters went from ignoring me to sliding into my DMs. This thing works.",
    avatar: "SK",
  },
  {
    name: "Marcus Johnson",
    role: "DevOps Engineer",
    content: "The AI actually explains my code better than I do. Kinda embarrassing but also amazing.",
    avatar: "MJ",
  },
]

export function SocialProofSection() {
  return (
    <section id="community" className="py-24 lg:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-4">
            People actually like this thing
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Thousands of devs have ditched their janky portfolios for something that actually works.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{testimonial.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="border-border/40 bg-card/50 backdrop-blur text-center p-6">
            <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">10,000+</div>
            <div className="text-sm text-muted-foreground">Devs using this</div>
          </Card>
          <Card className="border-border/40 bg-card/50 backdrop-blur text-center p-6">
            <Star className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">4.9/5</div>
            <div className="text-sm text-muted-foreground">Stars (not fake)</div>
          </Card>
          <Card className="border-border/40 bg-card/50 backdrop-blur text-center p-6">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-muted-foreground">Discord nerds</div>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Join the Discord chaos
          </Button>
        </div>
      </div>
    </section>
  )
}
