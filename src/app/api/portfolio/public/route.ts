import { NextRequest, NextResponse } from "next/server"
import { getPublicPortfolio, type PublicPortfolioRepositoryRecord, type SerializedPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"
import { getRepositoryLogo } from "@/lib/github-og-image-utils"

export const revalidate = 60

function normalizeRepositoryDescription(description: string | null | undefined): string {
  if (!description) return ""

  const githubDefaultDescriptionPattern = /^Contribute to .* development by creating an account on GitHub\.?$/i
  if (githubDefaultDescriptionPattern.test(description.trim())) {
    return ""
  }

  return description
}

function normalizeRepositoryFavicon(favicon: string | null | undefined, isImported: boolean): string | null {
  if (!favicon) return null
  if (favicon.includes("github.com") && !isImported) return null
  return favicon
}

function normalizeRepositoryLanguages(rawLanguages: unknown, fallbackLanguage: string | null | undefined): string[] {
  if (Array.isArray(rawLanguages)) {
    return rawLanguages.filter((language): language is string => typeof language === "string" && Boolean(language))
  }

  if (typeof rawLanguages === "string") {
    try {
      const parsed = JSON.parse(rawLanguages)
      if (Array.isArray(parsed)) {
        return parsed.filter((language): language is string => typeof language === "string" && Boolean(language))
      }
    } catch {
      // Fall back to single language value.
    }
  }

  if (fallbackLanguage) {
    return [fallbackLanguage]
  }

  return []
}

function normalizePortfolioForPublicApi(portfolio: SerializedPublicPortfolio): SerializedPublicPortfolio {
  if (!Array.isArray(portfolio.repositories)) {
    return portfolio
  }

  const normalizedRepositories: PublicPortfolioRepositoryRecord[] = portfolio.repositories.map((portfolioRepository) => {
    const repository = portfolioRepository.repository || {}
    const isImported = Boolean(repository.isImported)

    const logo = getRepositoryLogo({
      logo: typeof repository.logo === "string" ? repository.logo : null,
      favicon: typeof repository.favicon === "string" ? repository.favicon : null,
      htmlUrl: typeof repository.htmlUrl === "string" ? repository.htmlUrl : null,
      fullName: typeof repository.fullName === "string" ? repository.fullName : null,
      isImported,
    })

    const githubId = repository.githubId ? repository.githubId.toString() : repository.githubId
    const favicon = normalizeRepositoryFavicon(
      typeof repository.favicon === "string" ? repository.favicon : null,
      isImported
    )
    const description = normalizeRepositoryDescription(
      typeof repository.description === "string" ? repository.description : null
    )
    const languages = normalizeRepositoryLanguages(repository.languages, typeof repository.language === "string" ? repository.language : null)

    return {
      ...portfolioRepository,
      repository: {
        ...repository,
        githubId,
        logo,
        favicon,
        description,
        languages,
      },
    }
  })

  return {
    ...portfolio,
    repositories: normalizedRepositories,
  }
}

export async function GET(req: NextRequest) {
  const startTime = performance.now()

  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const portfolio = await getPublicPortfolio(username)
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const responseData = {
      success: true,
      portfolio: normalizePortfolioForPublicApi(portfolio),
    }

    const totalTime = performance.now() - startTime
    const headers = new Headers()
    headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")

    console.log(`⚡ Public portfolio API: ${username}`, {
      totalTime: `${totalTime.toFixed(2)}ms`,
    })

    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("Error fetching public portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}
