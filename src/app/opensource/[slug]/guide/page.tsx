import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  ExternalLink,
  ListChecks,
  Rocket,
  Star,
  Target,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GuideTimeline, ComingSoonTimeline } from "@/components/open-source/GuideTimeline"
import {
  difficultyLabel,
  formatLastUpdated,
  formatStackLabel,
  formatStars,
} from "@/lib/open-source-format"
import { getRepoBySlug } from "@/lib/open-source-repos"

interface GuidePageProps {
  params: { slug: string }
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const repo = getRepoBySlug(params.slug)
  if (!repo) {
    return {
      title: "Open Source Guide",
    }
  }

  const title = `${repo.name} | Open Source Guide`
  const description = repo.guide?.summary ?? repo.description

  return {
    title,
    description,
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const repo = getRepoBySlug(params.slug)

  if (!repo) {
    notFound()
  }

  const guide = repo.guide

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <Button variant="ghost" className="gap-2 px-0" asChild>
          <Link href="/open-source">
            <ArrowLeft className="size-4" />
            सभी रेपो पर वापस जाएँ
          </Link>
        </Button>
      </div>

      <section className="rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {repo.name}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {repo.description}
              </p>
            </div>
            {repo.highlight ? (
              <div className="bg-muted/70 ring-muted-foreground/10 max-w-2xl rounded-2xl px-5 py-4 text-sm leading-6 text-muted-foreground ring-1">
                {repo.highlight}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="size-4 text-amber-500" />
                {formatStars(repo.stars)} stars
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" />
                Updated {formatLastUpdated(repo.lastUpdated)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Target className="size-4" />
                Focus {repo.tags.slice(0, 2).join(", ")}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="px-4 py-1.5 text-sm">
            {difficultyLabel(repo.difficulty)}
          </Badge>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {repo.stacks.map((stack) => (
            <Badge
              key={stack}
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-medium"
            >
              {formatStackLabel(stack)}
            </Badge>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="default" asChild>
            <Link href={repo.repoUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Open repository
            </Link>
          </Button>
          {guide?.firstIssueUrl ? (
            <Button variant="secondary" asChild>
              <Link href={guide.firstIssueUrl} target="_blank" rel="noreferrer">
                <Rocket className="size-4" />
                Start with a first issue
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {guide ? (
        <>
          <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
            <Card className="h-full">
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpenCheck className="size-5 text-primary" />
                  Guide overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                <p className="leading-6">{guide.summary}</p>
                <div className="rounded-xl bg-muted/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Estimated effort
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {guide.estimatedTime}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="size-5 text-primary" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {guide.prerequisites.map((item) => (
                    <li key={item} className="leading-6">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <GuideTimeline guide={guide} />

          <section className="rounded-3xl border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Resources & links</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use these resources to go deeper, connect with maintainers, or learn the
              project&apos;s roadmap.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {guide.resources.map((resource) => (
                <Card key={resource.url} className="border-muted-foreground/30">
                  <CardHeader className="gap-1 pb-2">
                    <CardTitle className="text-base font-semibold">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {resource.description ? (
                      <p className="leading-6">{resource.description}</p>
                    ) : null}
                    <Button variant="outline" asChild>
                      <Link href={resource.url} target="_blank" rel="noreferrer">
                        Visit resource
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      ) : (
        <ComingSoonTimeline message="हम इस रेपो के लिए विस्तृत योगदान मार्गदर्शिका तैयार कर रहे हैं। अपडेट्स जल्द ही जोड़ दिए जाएंगे।" />
      )}
    </div>
  )
}
