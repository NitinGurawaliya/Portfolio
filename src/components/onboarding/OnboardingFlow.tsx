"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepIndicator } from "./StepIndicator"
import { Step1Projects } from "./steps/Step1Projects"
import { Step2Skills } from "./steps/Step2Skills"
import { Step3Socials } from "./steps/Step3Socials"
import { Step4Experience } from "./steps/Step4Experience"
import { Step5Theme } from "./steps/Step5Theme"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface OnboardingFlowProps {
  initialUsername: string | null
  session: any
}

export function OnboardingFlow({ initialUsername, session }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({
    username: initialUsername || "",
    projects: [] as any[],
    skills: [] as any[],
    socials: [] as any[],
    experiences: [] as any[],
    selectedTheme: "light",
    backgroundColor: null as string | null,
    backgroundPattern: null as string | null,
  })

  const totalSteps = 5

  const updateData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // Save all onboarding data and redirect to dashboard
    try {
      // TODO: Save onboarding data to backend
      console.log("Onboarding data:", onboardingData)
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Projects
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            session={session}
          />
        )
      case 2:
        return (
          <Step2Skills
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <Step3Socials
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <Step4Experience
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <Step5Theme
            data={onboardingData}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-lg font-bold text-white">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold">DevFolio Setup</h1>
              <p className="text-sm text-muted-foreground">
                Let's create your portfolio
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Skip for now
          </Button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>
    </div>
  )
}

