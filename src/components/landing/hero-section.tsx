"use client";

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortfolioMobilePreview } from "./portfolio-mobile-preview";
import { ClaimUsernameModal } from "./claim-username-modal";

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const router = useRouter();

  const handleClaimSuccess = useCallback((username: string) => {
    setClaimOpen(false)
    router.push(`/auth?username=${encodeURIComponent(username)}`)
  }, [router])
  
  useEffect(() => {
    const checkSession = async () => {
      setIsChecking(true);
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Only set logged in if session is verified and valid
          if (data.success && data.session) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          // Session invalid or expired
          setIsLoggedIn(false);
        }
      } catch (error) {
        // Network error or other issue - be conservative
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkSession();
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="mx-auto w-full max-w-[9rem] -mt-2 sm:mt-0 sm:max-w-[10rem]">
        <a
          href="https://shipsquad.space/saas/1eb0b450-6fb4-44ef-ab2b-ce0ce95e25b9"
          target="_blank"
          rel="noopener"
        >
          <img
            src="https://shipsquad.space/api/badge?id=1eb0b450-6fb4-44ef-ab2b-ce0ce95e25b9&style=light"
            alt="Featured on ShipSquad"
            className="w-full"
          />
        </a>
      </div>
      <div className="container relative mx-auto max-w-[1400px] px-0">
        <div className="grid items-center justify-items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left Column - Text Content */}
          <div className="w-full text-center lg:text-left">
            {/* <div className="mb-4 sm:mb-5 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1.5 text-xs sm:text-sm backdrop-blur-sm">
              <span className="mr-1.5 sm:mr-2">🔥</span>
              <span className="text-xs sm:text-sm">Free right now - grab it while it's hot</span>
            </div> */}
 
              <h1 className="mb-3 text-xl font-semibold leading-tight tracking-tight text-balance sm:mb-4 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              Turn your GitHub into a{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block sm:inline">
                stunning portfolio
              </span>
              {" "}in minutes
            </h1>
 
              <p className="mx-auto mb-4 max-w-2xl text-xs text-muted-foreground text-pretty sm:mb-5 sm:text-sm lg:text-base">
              No coding required. Import your projects, customize your theme, and publish. Your portfolio is live in 2 minutes.
            </p>
 
            <div className="mb-3 flex w-full flex-col items-center justify-center gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-3 lg:justify-start">
                {!isChecking && (
                  <>
                    {isLoggedIn ? (
                      <Button
                        size="lg"
                        className="inline-flex w-full max-w-[16rem] border-0 bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-xs text-white shadow-md hover:from-orange-600 hover:to-orange-700 sm:w-auto sm:max-w-none sm:px-6 sm:text-sm lg:px-8 lg:text-base"
                        asChild
                      >
                        <a href="/dashboard">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="inline-flex w-full max-w-[18rem] border-0 bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-xs text-white shadow-md hover:from-orange-600 hover:to-orange-700 sm:w-auto sm:max-w-none sm:px-6 sm:text-sm lg:px-8 lg:text-base"
                        onClick={() => setClaimOpen(true)}
                      >
                        Claim your page
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className="inline-flex w-full max-w-[16rem] bg-transparent px-4 text-xs sm:w-auto sm:max-w-none sm:px-6 sm:text-sm lg:px-8 lg:text-base"
                      asChild
                    >
                      <a href="https://devfolio.cc/Nitin" target="_blank" rel="noopener noreferrer">
                        <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        See Demo Portfolio
                      </a>
                    </Button>
                  </>
                )}
              </div>
 
              {!isChecking && !isLoggedIn && (
                <div className="mb-4 flex flex-col items-center lg:items-start">
                  <span
                  className="cursor-pointer text-xs sm:text-sm text-muted-foreground underline transition-all hover:text-foreground"
                    onClick={() => router.push("/auth")}
                  >
                    Already have an account? Login
                  </span>
                </div>
              )}
 
              <div className="mt-6 text-xs text-muted-foreground sm:mt-8 sm:text-sm lg:text-base">
                Used by devs who actually ship stuff
              </div>
          </div>
 
          {/* Right Column - Mobile Preview (Desktop) */}
          <div className="hidden lg:flex items-center justify-center">
            <PortfolioMobilePreview />
          </div>
        </div>

        {/* Mobile Preview (Mobile/Tablet - Below Hero Text) */}
          <div className="mt-8 flex items-center justify-center lg:hidden md:mt-12">
          <PortfolioMobilePreview />
        </div>
      </div>
      <ClaimUsernameModal
        open={claimOpen}
        onOpenChange={setClaimOpen}
        onSuccess={handleClaimSuccess}
      />
      </section>
  )
}
