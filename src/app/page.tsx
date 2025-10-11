import { Metadata } from "next"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoSection } from "@/components/landing/demo-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

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
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        {/* <DemoSection /> */}
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
