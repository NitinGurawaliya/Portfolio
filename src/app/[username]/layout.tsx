import { Metadata } from "next"

// This is a server component that generates dynamic metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { username: string } 
}): Promise<Metadata> {
  const { username } = params
  
  // Reserved routes should not have custom metadata
  const reservedRoutes = ['dashboard', 'auth', 'api', '_next', 'favicon.ico']
  if (reservedRoutes.includes(username)) {
    return {
      title: "Invalid Portfolio",
      description: "This username is reserved and cannot be used for portfolios.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  try {
    // Fetch portfolio data to generate metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/portfolio/publish?username=${username}`, {
      cache: 'no-store' // Always fetch fresh data for metadata
    })

    if (!response.ok) {
      return {
        title: `${username} | DevFolio`,
        description: "Developer portfolio not found. Create your own stunning portfolio with DevFolio.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    const result = await response.json()
    const portfolio = result.portfolio

    if (!portfolio) {
      return {
        title: `${username} | DevFolio`,
        description: "Developer portfolio not found. Create your own stunning portfolio with DevFolio.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    // Generate rich metadata from portfolio data
    const displayName = portfolio.displayName || username
    const jobTitle = portfolio.jobTitle || "Developer"
    const bio = portfolio.bio || `Check out ${displayName}'s developer portfolio`
    const profilePic = portfolio.profilePic || `${baseUrl}/default-avatar.png`
    
    // Extract skills for keywords
    const skills = portfolio.skills?.map((s: any) => s.name).join(", ") || ""
    const languages = portfolio.repositories
      ?.map((r: any) => r.repository.language)
      .filter((l: string) => l)
      .filter((l: string, i: number, arr: string[]) => arr.indexOf(l) === i)
      .join(", ") || ""

    // Create comprehensive description
    const description = `${displayName}${jobTitle ? ` - ${jobTitle}` : ""}. ${bio}${skills ? ` | Skills: ${skills}` : ""}${languages ? ` | ${languages}` : ""}`

    return {
      title: displayName,
      description: description.slice(0, 160), // Limit to 160 chars for SEO
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
        url: `/${username}`,
        title: `${displayName}${jobTitle ? ` - ${jobTitle}` : ""} | DevFolio`,
        description: bio,
        siteName: "DevFolio",
        images: [
          {
            url: profilePic,
            width: 400,
            height: 400,
            alt: `${displayName}'s profile picture`
          }
        ],
      },
      twitter: {
        card: "summary",
        title: `${displayName}${jobTitle ? ` - ${jobTitle}` : ""}`,
        description: bio,
        images: [profilePic],
        creator: portfolio.socials?.find((s: any) => s.platform === 'twitter')?.username 
          ? `@${portfolio.socials.find((s: any) => s.platform === 'twitter').username}` 
          : "@devfolio"
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
