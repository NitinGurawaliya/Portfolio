import { notFound } from "next/navigation"
import { StructuredData } from "@/components/StructuredData"
import { Portfolio } from "@/interface"
import { getPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"
import { PublicPortfolioClient } from "./PublicPortfolioClient"
import { PortfolioLayout } from "./PortfolioLayout"

// Enable static generation with revalidation
export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-static'

// Reserved routes that should not be treated as portfolio usernames
const reservedRoutes = ['dashboard', 'auth', 'api', '_next', 'favicon.ico']

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { username } = await params

  // Check for reserved routes
  if (reservedRoutes.includes(username)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Portfolio URL</h1>
          <p className="text-gray-400 mb-6">This username is reserved and cannot be used for portfolios.</p>
        </div>
      </div>
    )
  }

  // Fetch portfolio data on server-side
  const portfolio = await getPublicPortfolio(username)

  if (!portfolio) {
    notFound()
  }

  return (
    <div className="scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Structured Data for SEO */}
      <StructuredData
        type="Person"
        data={{
          name: portfolio.displayName,
          jobTitle: portfolio.jobTitle,
          bio: portfolio.bio,
          image: portfolio.profilePic,
          url: undefined, // URL will be set on client side
          sameAs: portfolio.socials?.map((s: { url?: string }) => s.url).filter(Boolean),
          worksFor: portfolio.user.company ? {
            name: portfolio.user.company,
          } : undefined,
          location: portfolio.user.location,
          skills: portfolio.skills?.map((s: { name: string }) => s.name),
        }}
      />
    
      {/* Dynamic Theme Layout - Client Component */}
      <PortfolioLayout portfolio={portfolio as Portfolio} />
      
      {/* Client component for share button and analytics */}
      <PublicPortfolioClient portfolio={portfolio as Portfolio} />
    </div>
  )
}
