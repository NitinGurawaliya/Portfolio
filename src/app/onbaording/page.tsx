"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // कोई भी redirectOnAuthFailure Option pass मत करो (default: false)
  const { user, session, loading } = useSession();
  // flag: क्या url में onboarding-auth-success है?
  const [isOnboardingCallback, setIsOnboardingCallback] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsOnboardingCallback(!!params.get("onboarding-auth-success"));
      console.log("[Onboarding] onboarding-auth-success query:", params.get("onboarding-auth-success"));
    }
  }, []);

  useEffect(() => {
    console.log("[Onboarding] useEffect:", { loading, user, isOnboardingCallback });
    // अगर user पुराना है और ये onboarding callback नहीं है, तबही डैशबोर्ड भेजो
    if (!loading && user && user.id && user.repositories && user.repositories.length > 0 && !isOnboardingCallback) {
      console.log("[Onboarding] Redirecting to dashboard because user is old and not from onboarding callback");
      router.replace("/dashboard");
    } else {
      console.log("[Onboarding] Staying on onboarding. Cond:", { loading, user, isOnboardingCallback });
    }
  }, [user, loading, router, isOnboardingCallback]);

  // अब अगर user null भी हो तो onboarding modal चलता रहेगा
  const handleComplete = async (data: any) => {
    console.log("[Onboarding] handleComplete payload:", { data, user });
    if (!user || !user.id) {
      toast({
        title: "Login Required",
        description: "Please login with Github before continuing onboarding.",
        variant: "destructive",
      });
      // onboarding modal में Auth Step रहेगा — redirect की जरूरत नहीं
      return;
    }
    setSubmitting(true);
    try {
      const portfolioData = {
        displayName: user.name || "",
        jobTitle: user.company || "",
        bio: user.bio || "",
        profilePic: user.avatarUrl || "",
        customUsername: data.username,
      };
      const mappedSkills = data.skills.map((name: string) => ({ name, category: "custom" }));
      const selectedRepos = data.projects?.map((p: any) => p.id).filter(Boolean) || [];
      const payload = {
        portfolioData,
        skills: mappedSkills,
        selectedRepos, // --- This is mandatory for publish-all repository-portfolio mapping ---
        socials: [],
        deployedUrls: {},
        customNames: {},
        customDescriptions: {},
        githubUrls: {},
        selectedTheme: "light",
        repoOrder: selectedRepos, // keep order same as selectedRepos
        repositories: data.projects,
        userId: user.id,
        userData: user,
        logoOverrides: {},
      };
      console.log("[Onboarding] publish-all payload:", payload);
      const res = await fetch("/api/portfolio/publish-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log("[Onboarding] publish-all result:", json);
      if (json.success) {
        toast({ title: "Portfolio published!", description: "Your portfolio is live.", variant: "default" });
        console.log("[Onboarding] Publish complete. Staying on Share step");
        setSubmitting(false);
        // Do not redirect here; Share step has a button to go to dashboard
      } else {
        throw new Error(json.error || "Server error");
      }
    } catch (err: any) {
      toast({ title: "Error", description: (err.message || "Unable to save."), variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <OnboardingModal open={open} onComplete={handleComplete} />
      {submitting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 text-xl shadow-lg">Saving your portfolio...</div>
        </div>
      )}
    </div>
  );
}
