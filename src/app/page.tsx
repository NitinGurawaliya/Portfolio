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
import { TrustedBySection } from "@/components/landing/trusted-by-section"
import { StatsSection } from "@/components/landing/stats-section"

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
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-12 xl:px-16">
        <HeroSection />
        <TrustedBySection />
        <WallOfFame />

        <StatsSection />
        {/* <FeaturesSection /> */}
        <FeatureShowcase />
        <TestimonialsSection />
        {/* <DemoSection /> */}
        <CTASection />
        {/* <TopContributors /> */}
      </main>
      <Footer />
    </div>
  )
}
