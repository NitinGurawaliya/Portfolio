"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { quizCategories } from "@/lib/quiz/questions"
import { Atom, Brain, Globe, Laptop, Play } from "lucide-react"

const iconFor = (key: string) => {
  switch (key) {
    case "atom":
      return Atom
    case "brain":
      return Brain
    case "globe":
      return Globe
    case "laptop":
    default:
      return Laptop
  }
}

export function PracticeSection() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Practice</h1>
        <p className="text-sm text-muted-foreground">
          Quizzes के साथ practice करो, instant feedback और score के साथ.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quizCategories.map((category) => {
          const Icon = iconFor(category.iconKey)
          return (
            <Card
              key={category.id}
              className="group cursor-pointer border-border/60 bg-card/80 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              onClick={() => router.push(`/quiz/${category.id}`)}
              role="button"
            >
              <CardHeader className="items-center text-center">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-foreground shadow-sm">
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="max-w-[34ch] text-sm">
                  {category.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Button className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Start Quiz
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {category.questions.length} questions
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

