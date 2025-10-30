import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ClaimPage } from "@/components/onboarding/steps/ClaimPage";
import { AddProjects } from "@/components/onboarding/steps/AddProjects";
import { AddSkills } from "@/components/onboarding/steps/AddSkills";
import { SharePortfolio } from "@/components/onboarding/steps/SharePortofolio";
import { Github } from "lucide-react";

// एक नया कम्पोनेंट - Github Auth Step
const GithubAuthStep = ({ onSuccess, onBack }) => {
  // लॉगिन प्रोसेस ट्रैक करने के लिए URL क्वेरी स्टेट
  useEffect(() => {
    // Github oauth callback आने पे session देखो और ऑनसक्सेस करो
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding-auth-success")) {
      onSuccess();
    }
  }, [onSuccess]);

  // Auth redirect में दिखाने वाला UI
  return (
    <div className="flex flex-col items-center justify-center space-y-8 ">
      <h2 className="text-2xl font-bold mb-4">GitHub से लॉगिन करें</h2>
      <a
        href={`/api/auth/github?onboarding-redirect=1`}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 flex items-center text-lg"
      >
        <Github className="mr-3 h-6 w-6" /> Github से लॉगिन करें
      </a>
      <button className="mt-8 text-gray-500 underline" onClick={onBack}>
        वापिस जाएं
      </button>
    </div>
  );
};

interface OnboardingData {
  username: string;
  projects: Array<{
    url: string;
    title: string;
    description: string;
    favicon: string;
  }>;
  skills: string[];
}
interface OnboardingModalProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
}
export const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  // तीनों state में एक नया: isAuthenticated
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    username: "",
    projects: [],
    skills: [],
  });

  // Login के बाद step अपडेट करें
  useEffect(() => {
    // OAuth redirect के बाद (window.location) क्वेरी से मिआता है
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("onboarding-auth-success")) {
        setIsAuthenticated(true);
        setStep(3); // सीधे projects पर
        // Query string साफ कर दो UX के लिए
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

  // Component rendering per step
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
