"use client"

import { useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { getQuizCategoryById } from "@/lib/quiz/questions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Target, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.id as string

  // Protect route (same behavior as /dashboard)
  useSession({ redirectOnAuthFailure: true })

  const quiz = useMemo(() => getQuizCategoryById(quizId), [quizId])

  const answersParam = searchParams.get("answers")
  const timeTakenParam = searchParams.get("timeTaken")

  const answers: (number | null)[] = useMemo(() => {
    if (!answersParam) return []
    try {
      const parsed = JSON.parse(answersParam)
      return Array.isArray(parsed) ? (parsed as (number | null)[]) : []
    } catch {
      return []
    }
  }, [answersParam])

  const timeTaken = useMemo(() => {
    const n = timeTakenParam ? Number(timeTakenParam) : 0
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
  }, [timeTakenParam])

  if (!quiz) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">Results not available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">यह quiz उपलब्ध नहीं है.</p>
            <Button onClick={() => router.push("/dashboard?section=practice")}>Back to Practice</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const total = quiz.questions.length
  const normalizedAnswers = quiz.questions.map((_, i) => answers[i] ?? null)
  const correct = normalizedAnswers.reduce<number>((acc, ans, idx) => {
    return acc + (ans === quiz.questions[idx].correctAnswer ? 1 : 0)
  }, 0)
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  const mm = Math.floor(timeTaken / 60)
  const ss = String(timeTaken % 60).padStart(2, "0")

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="gap-2" onClick={() => router.push("/dashboard?section=practice")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Practice
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <h1 className="text-2xl font-semibold text-foreground">Quiz Completed!</h1>
            <p className="mt-1 text-sm text-muted-foreground">{quiz.name}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs font-medium">Score</span>
                </div>
                <div className="text-3xl font-semibold text-foreground">{percentage}%</div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-5">
                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-medium">Correct</span>
                </div>
                <div className="text-3xl font-semibold text-foreground">
                  {correct}/{total}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-5">
                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Time</span>
                </div>
                <div className="text-3xl font-semibold text-foreground">
                  {mm}:{ss}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.push(`/quiz/${quizId}`)}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard?section=practice")}>
                Back to Practice
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-lg">Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {quiz.questions.map((q, idx) => {
              const userAnswer = normalizedAnswers[idx]
              const isCorrect = userAnswer === q.correctAnswer
              return (
                <div
                  key={String(q.id)}
                  className={cn(
                    "rounded-xl border p-4",
                    isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Question {idx + 1}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{q.question}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        isCorrect ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-red-500/15 text-red-700 dark:text-red-300"
                      )}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isRight = optIdx === q.correctAnswer
                      const isChosen = userAnswer === optIdx
                      const highlight =
                        isRight ? "border-emerald-500/40 bg-emerald-500/10" : isChosen && !isCorrect ? "border-red-500/40 bg-red-500/10" : "border-border/60 bg-background"
                      return (
                        <div key={optIdx} className={cn("rounded-lg border p-3 text-sm", highlight)}>
                          <span className="mr-2 font-semibold text-muted-foreground">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="text-foreground">{opt}</span>
                          {isRight ? (
                            <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              ✓ Correct
                            </span>
                          ) : null}
                          {isChosen && !isCorrect ? (
                            <span className="ml-2 text-xs font-semibold text-red-700 dark:text-red-300">
                              ✗ Your answer
                            </span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-3 rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-semibold text-muted-foreground">Explanation</p>
                    <p className="mt-1 text-sm text-foreground/90">{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

