"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Loader2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PortfolioNavbarProps {
  user: any
  portfolioData: {
    displayName: string
    profilePic: string
  }
  hasUnsavedChanges: boolean
  isPublishing: boolean
  isPortfolioPublished: boolean
  onPublish: () => void
  onVisitProfile: () => void
  breadcrumb?: string
}

export function PortfolioNavbar({
  user,
  portfolioData,
  hasUnsavedChanges,
  isPublishing,
  isPortfolioPublished,
  onPublish,
  onVisitProfile,
  breadcrumb = "Portfolio",
}: PortfolioNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isSubPage = pathname !== "/portfolio"

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Back Arrow or Logo with Breadcrumb */}
          <div className="flex items-center gap-3">
            {isSubPage ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/portfolio")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Button>
            ) : (
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src="/devfolio-high-resolution-logo.png"
                  alt="DevFolio"
                  width={120}
                  height={30}
                  className="h-6 w-auto"
                />
              </Link>
            )}
            {/* Breadcrumb */}
            <span className="text-sm text-gray-600 font-medium">{breadcrumb}</span>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Publish Button */}
            <Button
              onClick={onPublish}
              disabled={isPublishing || (!hasUnsavedChanges && isPortfolioPublished)}
              className={`${
                hasUnsavedChanges
                  ? "bg-orange-500 hover:bg-orange-600"
                  : isPortfolioPublished
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              } text-white`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : hasUnsavedChanges ? (
                "Publish Changes 🔥"
              ) : isPortfolioPublished ? (
                "Published ✓"
              ) : (
                "Publish 🔥"
              )}
            </Button>

            {/* Visit Profile Button */}
            {isPortfolioPublished && (
              <Button
                onClick={onVisitProfile}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Profile
              </Button>
            )}

            {/* User Avatar */}
            <Avatar className="h-8 w-8 border border-gray-300">
              <AvatarImage
                src={portfolioData.profilePic || user?.avatarUrl || ""}
                alt={portfolioData.displayName || user?.githubUsername || "User"}
              />
              <AvatarFallback>
                {(portfolioData.displayName || user?.githubUsername || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  )
}

