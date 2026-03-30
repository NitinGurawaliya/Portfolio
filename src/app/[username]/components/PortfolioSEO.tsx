import { StructuredData } from "@/components/StructuredData"
import type { Portfolio } from "@/interface"

interface PortfolioSEOProps {
  portfolio: Portfolio
}

export function PortfolioSEO({ portfolio }: PortfolioSEOProps) {
  const sameAs = portfolio.socials?.map((social) => social.url).filter(Boolean)
  const skills = portfolio.skills?.map((skill) => skill.name)

  return (
    <StructuredData
      type="Person"
      data={{
        name: portfolio.displayName,
        jobTitle: portfolio.jobTitle,
        bio: portfolio.bio,
        image: portfolio.profilePic,
        url: undefined,
        sameAs,
        worksFor: portfolio.user?.company
          ? {
              name: portfolio.user.company,
            }
          : undefined,
        location: portfolio.user?.location,
        skills,
      }}
    />
  )
}
