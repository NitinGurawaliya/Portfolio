"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HomeSection } from "@/components/dashboard/HomeSection"
import { ReposSection } from "@/components/dashboard/ReposSection"
import { SkillsSection } from "@/components/dashboard/SkillsSection"
import { SocialsSection } from "@/components/dashboard/SocialsSection"
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection"
import ThemeSelector from "@/components/dashboard/ThemeSelector"
import { DevFolioLoader } from "@/components/ui/DevFolioLoader"
import toast, { Toaster } from "react-hot-toast"
import { useSession } from "@/hooks/useSession"
import { usePortfolio } from "@/hooks/usePortfolio"
import { usePortfolioHandlers } from "@/hooks/usePortfolioHandlers"
import { publishPortfolio } from "@/lib/services/portfolio-service"
import { playNotificationSound } from "@/lib/portfolio-utils"
import { successToastConfig, errorToastConfig } from "@/lib/utils"


export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home")
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Session hook
  const { user, loading } = useSession()
  
  // Portfolio hook
  const portfolio = usePortfolio(user)
  
  // Handlers hook - portfolio data को original data के रूप में pass करें
  const handlers = usePortfolioHandlers(
    portfolio.setPortfolioData,
    portfolio.setSelectedRepos,
    portfolio.setSkills,
    portfolio.setSocials,
    portfolio.setDeployedUrls,
    portfolio.setCustomNames,
    portfolio.setCustomDescriptions,
    portfolio.setGithubUrls,
    portfolio.setImportedProjects,
    portfolio.setRepoOrder,
    portfolio.setSelectedTheme,
    portfolio.originalData,  // Pass original data properly
    user  // Pass user for GitHub username comparison
  )

  // Load existing portfolio data when user is loaded
  useEffect(() => {
    if (user) {
      const initialData = {
        displayName: user.name || user.githubUsername,
        jobTitle: "",
        bio: user.bio || "",
        profilePic: user.avatarUrl,
        customUsername: "", // Don't set GitHub username as default, let loadExistingData handle it
      }
      
      portfolio.setPortfolioData(initialData)
      // Try to load with GitHub username (will search both custom and GitHub usernames)
      portfolio.loadExistingData(user.githubUsername, initialData)
    }
  }, [user])

  // Publish handler
  const handlePublishAll = async () => {
    if (isPublishing) return
    
    // Validate username availability
    const newUsername = portfolio.portfolioData.customUsername?.trim()
    if (newUsername && handlers.usernameAvailability.isAvailable === false) {
      alert("Username is already taken. Please choose a different username.")
      return
    }
    
    if (handlers.usernameAvailability.isChecking) {
      alert("Please wait while we check username availability.")
      return
    }
    
    setIsPublishing(true)
    try {
      const allRepositories = [...(user?.repositories || []), ...portfolio.importedProjects]
      
      await publishPortfolio({
        portfolioData: portfolio.portfolioData,
        selectedRepos: portfolio.selectedRepos,
        skills: portfolio.skills,
        socials: portfolio.socials,
        deployedUrls: portfolio.deployedUrls,
        customNames: portfolio.customNames,
        customDescriptions: portfolio.customDescriptions,
        githubUrls: portfolio.githubUrls,
        selectedTheme: portfolio.selectedTheme,
        repoOrder: portfolio.repoOrder,
        repositories: allRepositories,
        userId: user?.id || 0,
        userData: user
      })

      // Reset after publish
      portfolio.resetAfterPublish()
      
      // Show success toast and play sound
      toast.success("🎉 Portfolio published successfully!", successToastConfig)
      playNotificationSound()
    } catch (error: any) {
      console.error("Error publishing portfolio:", error)
      
      // Show error toast
      toast.error(
        error.message || "Failed to publish portfolio. Please try again.", 
        errorToastConfig
      )
    } finally {
      setIsPublishing(false)
    }
  }

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <HomeSection 
            user={user} 
            portfolioData={portfolio.portfolioData}
            onUpdate={handlers.handleUpdatePortfolioData}
            usernameAvailability={handlers.usernameAvailability}
          />
        )
      case "repos":
        // Use database repositories (importedProjects) as the primary source since they have favicon/logo data
        // Fall back to GitHub repositories only if not found in database
        const allRepositories = [...portfolio.importedProjects, ...(user?.repositories || [])]
        const mergedRepositories = allRepositories.reduce((acc, repo) => {
          const existingIndex = acc.findIndex(r => r.id === repo.id)
          if (existingIndex === -1) {
            acc.push(repo)
          }
          // If repository already exists, keep the first one (database version has priority)
          return acc
        }, [] as any[])
        
        return (
          <ReposSection
            repositories={mergedRepositories}
            selectedRepos={portfolio.selectedRepos}
            deployedUrls={portfolio.deployedUrls}
            customNames={portfolio.customNames}
            customDescriptions={portfolio.customDescriptions}
            githubUrls={portfolio.githubUrls}
            repoOrder={portfolio.repoOrder}
            onToggleRepo={handlers.handleToggleRepo}
            onUpdateDeployedUrl={handlers.handleUpdateDeployedUrl}
            onUpdateCustomName={handlers.handleUpdateCustomName}
            onUpdateCustomDescription={handlers.handleUpdateCustomDescription}
            onUpdateGithubUrl={handlers.handleUpdateGithubUrl}
            onUpdateRepoOrder={handlers.handleUpdateRepoOrder}
            onAddImportedProject={handlers.handleAddImportedProject}
            analytics={portfolio.analytics}
          />
        )
      case "skills":
        return (
          <SkillsSection
            skills={portfolio.skills}
            onAddSkill={handlers.handleAddSkill}
            onRemoveSkill={handlers.handleRemoveSkill}
          />
        )
      case "socials":
        return (
          <SocialsSection
            socials={portfolio.socials}
            onAddSocial={handlers.handleAddSocial}
            onRemoveSocial={handlers.handleRemoveSocial}
            onTogglePin={handlers.handleTogglePin}
            onUpdateSocial={handlers.handleUpdateSocial}
          />
        )
      case "analytics":
        if (portfolio.isLoadingPortfolio) {
          return <div>Loading portfolio data...</div>
        }
        console.log("🔍 Analytics Section - Portfolio ID:", portfolio.originalData?.id)
        console.log("🔍 Dashboard Debug:")
        console.log("📊 selectedRepos:", portfolio.selectedRepos)
        console.log("📊 selectedRepos length:", portfolio.selectedRepos?.length)
        console.log("📊 importedProjects:", portfolio.importedProjects)
        console.log("📊 importedProjects length:", portfolio.importedProjects?.length)
        console.log("📊 customNames:", portfolio.customNames)
        console.log("📊 customDescriptions:", portfolio.customDescriptions)
        return (
          <AnalyticsSection 
            portfolioId={portfolio.originalData?.id || 0}
            analyticsData={portfolio.analytics}
            selectedRepos={portfolio.selectedRepos}
            importedProjects={portfolio.importedProjects}
            customNames={portfolio.customNames}
            customDescriptions={portfolio.customDescriptions}
          />
        )
      case "theme":
        return (
          <ThemeSelector
            currentTheme={portfolio.selectedTheme as any}
            userId={user?.id || 0}
            onThemeChange={handlers.handleThemeChange}
          />
        )
      default:
        return null
    }
  }

  if (loading || portfolio.isLoadingPortfolio) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <DevFolioLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No user data found</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-left" />
      <DashboardLayout 
        user={user} 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        livePortfolio={portfolio.livePortfolio}
        portfolioData={portfolio.portfolioData}
        hasUnsavedChanges={portfolio.hasUnsavedChanges && !portfolio.isInitialLoad}
        onPublish={handlePublishAll}
        isPublishing={isPublishing}
      >
        {renderActiveSection()}
      </DashboardLayout>
    </>
  )
}
