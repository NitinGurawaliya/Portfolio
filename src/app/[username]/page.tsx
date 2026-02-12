import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Portfolio } from "@/interface"
import { getPublicPortfolio } from "@/lib/portfolio/get-public-portfolio"
import { isReservedPortfolioRoute } from "@/lib/portfolio/public-route-utils"
import { PublicPortfolioClient } from "@/components/portfolio/PublicPortfolioClient"
import { PortfolioError } from "./components/PortfolioError"
import { PortfolioLoading } from "./components/PortfolioLoading"
import { PortfolioSEO } from "./components/PortfolioSEO"
import { PortfolioLayout } from "./PortfolioLayout"

// Enable static generation with revalidation
export const revalidate = 300 // Revalidate every 5 minutes

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>
}

async function PortfolioContent({ username }: { username: string }) {
  // Fetch portfolio data on server-side
  const portfolio = await getPublicPortfolio(username)

  if (!portfolio) {
    notFound()
  }

  return (
    <>
      <PortfolioSEO portfolio={portfolio as Portfolio} />
    
      <PortfolioLayout portfolio={portfolio as Portfolio} />
      
      <PublicPortfolioClient portfolio={portfolio as Portfolio} />
    </>
  )
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { username } = await params

  // Check for reserved routes
  if (isReservedPortfolioRoute(username)) {
    return (
      <PortfolioError
        title="Invalid Portfolio URL"
        description="This username is reserved and cannot be used for portfolios."
        showActions={false}
      />
    )
  }

  return (
    <Suspense fallback={<PortfolioLoading />}>
      <div className="scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
        <PortfolioContent username={username} />
      </div>
    </Suspense>
  )
}
