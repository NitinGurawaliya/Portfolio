"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { getQuizCategoryById } from "@/lib/quiz/questions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted/50">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  // Protect route (same behavior as /dashboard)
  useSession({ redirectOnAuthFailure: true })

  const quiz = useMemo(() => getQuizCategoryById(quizId), [quizId])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [startTime, setStartTime] = useState(() => Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now())
  const [perQuestionTime, setPerQuestionTime] = useState<number[]>([])

  useEffect(() => {
    setStartTime(Date.now())
    setAnswers([])
    setPerQuestionTime([])
    setCurrentIndex(0)
    setShowExplanation(false)
    setQuestionStartTime(Date.now())
  }, [quizId])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentIndex])

  if (!quiz) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quiz not found</CardTitle>
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
  const q = quiz.questions[currentIndex]
  const progress = ((currentIndex + 1) / total) * 100
  const selected = answers[currentIndex] ?? null

  const select = (idx: number) => {
    if (showExplanation) return
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = idx
      return next
    })
  }

  const recordTimeForCurrent = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - questionStartTime) / 1000))
    setPerQuestionTime((prev) => {
      const next = [...prev]
      next[currentIndex] = seconds
      return next
    })
  }

  const goNext = () => {
    if (!showExplanation) {
      // first click => reveal explanation
      setShowExplanation(true)
      return
    }

    recordTimeForCurrent()

    if (currentIndex < total - 1) {
      setShowExplanation(false)
      setCurrentIndex((i) => i + 1)
      return
    }

    // finish => results
    const timeTaken = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
    const safeAnswers = quiz.questions.map((_, i) => answers[i] ?? null)
    const qp = new URLSearchParams()
    qp.set("answers", JSON.stringify(safeAnswers))
    qp.set("timeTaken", String(timeTaken))
    router.push(`/results/${quizId}?${qp.toString()}`)
  }

  const hasSelected = selected !== null && selected !== undefined
  const isCorrect = selected === q.correctAnswer

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">{quiz.name}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {total}
          </p>
        </div>

        <div className="mb-8 space-y-2">
          <ProgressBar value={progress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>{quiz.id}</span>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const stateClass = showExplanation
                  ? idx === q.correctAnswer
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : idx === selected
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-border/60 bg-muted/20 opacity-70"
                  : idx === selected
                    ? "border-orange-500/40 bg-orange-500/10"
                    : "border-border/60 bg-background hover:bg-muted/20"

                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => select(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") select(idx)
                    }}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      showExplanation ? "cursor-default" : "cursor-pointer",
                      stateClass
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                          showExplanation
                            ? idx === q.correctAnswer
                              ? "border-emerald-500/60 bg-emerald-500 text-white"
                              : idx === selected
                                ? "border-red-500/60 bg-red-500 text-white"
                                : "border-border/60 text-muted-foreground"
                            : idx === selected
                              ? "border-orange-500/60 bg-orange-500 text-white"
                              : "border-border/60 text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <div className="flex-1 text-sm text-foreground">{opt}</div>

                      {showExplanation ? (
                        <div className="pt-1">
                          {idx === q.correctAnswer ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : idx === selected ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            {showExplanation ? (
              <div
                className={cn(
                  "rounded-xl border p-4",
                  isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p className={cn("text-sm font-semibold", isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                </div>
                <p className="text-sm text-foreground/90">{q.explanation}</p>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              {!showExplanation ? (
                <Button onClick={goNext} disabled={!hasSelected}>
                  {hasSelected ? "Submit Answer" : "Select an answer"}
                </Button>
              ) : (
                <Button onClick={goNext}>
                  {currentIndex < total - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

