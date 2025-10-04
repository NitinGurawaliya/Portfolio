import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
// import { FeaturesSection } from "@/components/landing/features-section"
// import { DemoSection } from "@/components/landing/demo-section"
// import { CalloutSection } from "@/components/landing/callout-section"
// import { SocialProofSection } from "@/components/landing/social-proof-section"
// import { CTASection } from "@/components/landing/cta-section"
// import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        {/* <FeaturesSection />
        <DemoSection />
        <CalloutSection />
        <SocialProofSection />
        <CTASection /> */}
      </main>
      {/* <Footer /> */}
    </div>
  )
}
