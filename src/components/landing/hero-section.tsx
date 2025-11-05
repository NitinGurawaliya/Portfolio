"use client";

import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Play } from "lucide-react"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortfolioMobilePreview } from "./portfolio-mobile-preview";

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  
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
    <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-2 lg:gap-3 items-start">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            {/* <div className="mb-4 sm:mb-5 inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1.5 text-xs sm:text-sm backdrop-blur-sm">
              <span className="mr-1.5 sm:mr-2">🔥</span>
              <span className="text-xs sm:text-sm">Free right now - grab it while it's hot</span>
            </div> */}

            <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-balance leading-tight">
              Turn your GitHub into a{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block sm:inline">
                stunning portfolio
              </span>
              {" "}in minutes
            </h1>
            
            <p className="mb-4 sm:mb-5 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty">
              No coding required. Import your projects, customize your theme, and publish. Your portfolio is live in 2 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start mb-3 sm:mb-4 items-center">
            {!isChecking && (
              <>
                {isLoggedIn ? (
                  <Button 
                    size="lg" 
                    className="text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md inline-flex" 
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
                    className="text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md inline-flex" 
                    asChild
                  >
                    <a href="/auth">
                      Claim your page
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="lg" className="text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-8 bg-transparent inline-flex" asChild>
                  <a href="https://devfolio.cc/Nitin" target="_blank" rel="noopener noreferrer">
                    <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    See Demo Portfolio
                  </a>
                </Button>
              </>
            )}
          </div>

            {!isChecking && !isLoggedIn && (
              <div className="flex flex-col items-center lg:items-start mb-4">
                <span 
                  className="text-muted-foreground text-sm underline cursor-pointer hover:text-foreground transition-all" 
                  onClick={() => router.push("/auth")}
                >
                  Already have an account? Login
                </span>
              </div>
            )}

            <div className="mt-8 sm:mt-12 text-sm sm:text-base text-muted-foreground">Used by devs who actually ship stuff</div>
          </div>

          {/* Right Column - Mobile Preview (Desktop) */}
          <div className="hidden lg:flex justify-center items-start -mt-8 lg:-mt-12">
            <PortfolioMobilePreview />
          </div>
        </div>

        {/* Mobile Preview (Mobile/Tablet - Below Hero Text) */}
        <div className="flex lg:hidden justify-center items-center mt-8 sm:mt-12">
          <PortfolioMobilePreview />
        </div>
      </div>
    </section>
  )
}
