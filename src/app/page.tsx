import { Metadata } from "next"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoSection } from "@/components/landing/demo-section"
import { WallOfFame } from "@/components/landing/wall-of-fame"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { FeatureShowcase } from "@/components/landing/feature-showcase"
import { SessionRedirect } from "@/components/SessionRedirect"
import TopContributors from "@/components/landing/contribiuters"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import CommunityStats from "@/components/landing/community-stats"

export const metadata: Metadata = {
  title: "DevFolio - Build Your Developer Portfolio in Minutes",
  description: "Create stunning developer portfolios by importing projects from GitHub. Showcase your work and share your developer journey.",
  openGraph: {
    title: "DevFolio - Build Your Developer Portfolio in Minutes",
    description: "Create stunning developer portfolios by importing projects from GitHub. Showcase your work and share your developer journey.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* <SessionRedirect />  -- REMOVE AUTO-REDIRECT! */}
      <Header />
      <main className="px-6 sm:px-8 lg:px-14">
        <HeroSection />
        <CommunityStats />
        {/* <FeaturesSection /> */}
        <FeatureShowcase />
        <WallOfFame limit={3} />
        <TestimonialsSection />
        {/* <DemoSection /> */}
        {/* <CTASection /> */}
        <TopContributors />
      </main>
      <Footer />
    </div>
  )
}
