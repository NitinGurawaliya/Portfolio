import { Metadata } from "next"
import { buildPortfolioFaviconUrl } from "@/lib/portfolio/favicon-utils"
import { isReservedPortfolioRoute } from "@/lib/portfolio/public-route-utils"

interface MetadataPortfolioSkill {
  name?: string | null
}

interface MetadataPortfolioSocial {
  platform?: string | null
  username?: string | null
}

interface MetadataPortfolioRepository {
  repository?: {
    language?: string | null
  } | null
}

interface MetadataPortfolio {
  displayName?: string | null
  jobTitle?: string | null
  bio?: string | null
  profilePic?: string | null
  skills?: MetadataPortfolioSkill[]
  socials?: MetadataPortfolioSocial[]
  repositories?: MetadataPortfolioRepository[]
}

interface PublicPortfolioApiResponse {
  portfolio?: MetadataPortfolio | null
}

function getInvalidPortfolioMetadata(): Metadata {
  return {
    title: "Invalid Portfolio",
    description: "This username is reserved and cannot be used for portfolios.",
    robots: {
      index: false,
      follow: false,
    },
  }
}

function getMissingPortfolioMetadata(username: string): Metadata {
  return {
    title: `${username} | DevFolio`,
    description: "Developer portfolio not found. Create your own stunning portfolio with DevFolio.",
    robots: {
      index: false,
      follow: false,
    },
  }
}

function normalizeCommaList(values: Array<string | null | undefined>): string {
  const uniqueValues = Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))))
  return uniqueValues.join(", ")
}

function getTwitterCreatorHandle(socials?: MetadataPortfolioSocial[]): string {
  const twitterSocial = socials?.find((social) => {
    const platform = social.platform?.toLowerCase()
    return platform === "twitter" || platform === "x"
  })

  if (!twitterSocial?.username) {
    return "@devfolio"
  }

  return `@${twitterSocial.username}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params

  if (isReservedPortfolioRoute(username)) {
    return getInvalidPortfolioMetadata()
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/portfolio/public?username=${username}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return getMissingPortfolioMetadata(username)
    }

    const result = (await response.json()) as PublicPortfolioApiResponse
    const portfolio = result.portfolio
    if (!portfolio) {
      return getMissingPortfolioMetadata(username)
    }

    const displayName = portfolio.displayName || username
    const jobTitle = portfolio.jobTitle || "Developer"
    const bio = portfolio.bio || `Check out ${displayName}'s developer portfolio`
    const profilePic = portfolio.profilePic || `${baseUrl}/default-avatar.png`

    const skills = normalizeCommaList(portfolio.skills?.map((skill) => skill.name || "") || [])
    const languages = normalizeCommaList(
      portfolio.repositories?.map((portfolioRepository) => portfolioRepository.repository?.language || "") || []
    )

    const description = `${displayName}${jobTitle ? ` - ${jobTitle}` : ""}. ${bio}${skills ? ` | Skills: ${skills}` : ""}${languages ? ` | ${languages}` : ""}`

    const ogImageUrl = `${baseUrl}/api/og?username=${encodeURIComponent(username)}&displayName=${encodeURIComponent(displayName)}&jobTitle=${encodeURIComponent(jobTitle)}&bio=${encodeURIComponent(bio.slice(0, 100))}&profilePic=${encodeURIComponent(profilePic)}&v=${Math.floor(Date.now() / 3600000)}`

    const faviconUrl = buildPortfolioFaviconUrl({
      baseUrl,
      username,
      profilePic,
      includeTimestamp: true,
    })

    return {
      title: displayName,
      description: description.slice(0, 160),
      keywords: [
        displayName,
        username,
        "developer portfolio",
        "github portfolio",
        jobTitle,
        ...skills.split(", ").filter(Boolean).slice(0, 10),
        ...languages.split(", ").filter(Boolean),
      ].filter(Boolean),
      authors: [{ name: displayName }],
      creator: displayName,
      openGraph: {
        type: "profile",
        locale: "en_US",
        url: `${baseUrl}/${username}`,
        title: `${displayName}${jobTitle ? ` - ${jobTitle}` : ""} | DevFolio`,
        description: bio,
        siteName: "DevFolio",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${displayName}'s developer portfolio`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName}${jobTitle ? ` - ${jobTitle}` : ""}`,
        description: bio,
        images: [ogImageUrl],
        creator: getTwitterCreatorHandle(portfolio.socials),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      icons: {
        icon: [
          { url: faviconUrl, type: "image/png" },
          { url: faviconUrl, sizes: "32x32", type: "image/png" },
          { url: faviconUrl, sizes: "16x16", type: "image/png" },
        ],
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: `${username} | DevFolio`,
      description: `${username}'s developer portfolio on DevFolio. Showcase your projects and skills with a stunning developer portfolio.`,
    }
  }
}

export default function UsernameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
