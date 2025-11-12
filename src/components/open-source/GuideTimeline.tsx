import { CheckCircle2, Circle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpenSourceGuide } from "@/lib/open-source-repos"

interface GuideTimelineProps {
  guide: OpenSourceGuide
}

export function GuideTimeline({ guide }: GuideTimelineProps) {
  return (
    <section className="space-y-6">
      {guide.steps.map((step, index) => (
        <Card
          key={step.title}
          className="relative border-l-4 border-l-primary/30 pl-6"
        >
          <span className="bg-primary text-primary-foreground absolute left-[-1.35rem] top-6 flex size-8 items-center justify-center rounded-full text-sm font-semibold shadow-md">
            {index + 1}
          </span>
          <CardHeader className="gap-2 pb-2">
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="leading-6">{step.description}</p>
            {step.actionItems ? (
              <ul className="space-y-2">
                {step.actionItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

interface ComingSoonTimelineProps {
  message?: string
}

export function ComingSoonTimeline({
  message = "Guide content is on the way. Check back soon for a curated walkthrough.",
}: ComingSoonTimelineProps) {
  return (
    <div className="relative rounded-2xl border border-dashed border-muted-foreground/30 bg-card/40 p-10 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-muted-foreground/40 bg-background">
        <Circle className="size-7 text-muted-foreground" />
      </div>
      <div className="mt-6 space-y-2">
        <h2 className="text-2xl font-semibold">Guide coming soon</h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
