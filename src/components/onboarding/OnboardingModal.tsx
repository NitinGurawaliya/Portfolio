import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ClaimPage } from "@/components/onboarding/steps/ClaimPage";
import { AddProjects } from "@/components/onboarding/steps/AddProjects";
import { AddSkills } from "@/components/onboarding/steps/AddSkills";
import { SharePortfolio } from "@/components/onboarding/steps/SharePortofolio";
import { Github } from "lucide-react";

// TODO: tidy up GithubAuthStep definition and prop typing
type GithubAuthStepProps = {
  onSuccess: () => void;
  onBack: () => void;
};

// GithubAuthStep
const GithubAuthStep = ({ onSuccess, onBack }: GithubAuthStepProps) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding-auth-success")) {
      onSuccess();
    }
  }, [onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 ">
      <h2 className="text-2xl font-bold mb-4">Sign in with GitHub</h2>
      <a
        href={`/api/auth/github`}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 flex items-center text-lg"
      >
        <Github className="mr-3 h-6 w-6" /> Continue with GitHub
      </a>
      <button className="mt-8 text-gray-500 underline" onClick={onBack}>
        Back
      </button>
    </div>
  );
};

interface OnboardingData {
  username: string;
  projects: any[];
  skills: string[];
}
interface OnboardingModalProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
}
export const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Fix: projects initial value should be [] or always contain id
  const [data, setData] = useState<OnboardingData>({
    username: "",
    projects: [], // always Project[] type
    skills: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("onboarding-auth-success")) {
        let restored = data.username;
        try {
          if (!restored) restored = localStorage.getItem("onboardingUsername") || "";
        } catch {}
        if (restored && restored !== data.username) {
          setData(prev => ({ ...prev, username: restored }));
        }
        try { localStorage.removeItem("onboardingUsername"); } catch {}
        setIsAuthenticated(true);
        setStep(3); // Resume directly to AddProjects step
        params.delete("onboarding-auth-success");
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, "", cleanUrl);
      }
    }
  }, []);

  const totalSteps = 5;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-secondary/50">
          <div
            className="h-full bg-gradient-to-r from-accent via-orange-500 to-accent transition-all duration-700 ease-out relative"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>
        {/* Step Content */}
        <div className="p-8 animate-fade-in-up" key={step}>
          {step === 1 && (
            <ClaimPage
              username={data.username}
              onNext={(username) => {
                updateData({ username });
                try { localStorage.setItem("onboardingUsername", username); } catch {}
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <GithubAuthStep
              onSuccess={() => {
                setIsAuthenticated(true);
                setStep(3);
              }}
              onBack={prevStep}
            />
          )}
          {step === 3 && (
            <AddProjects
              projects={data.projects}
              onNext={(projects) => {
                updateData({ projects });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {step === 4 && (
            <AddSkills
              skills={data.skills}
              onNext={(skills) => {
                updateData({ skills });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {step === 5 && (
            <SharePortfolio
              username={data.username}
              onComplete={() => onComplete(data)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
