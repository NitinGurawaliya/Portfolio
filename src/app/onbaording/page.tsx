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

  useEffect(() => {
    // अगर user already portfolio बना चुका - (authenticated, repositories[] present) - सीधा डैशबोर्ड भेज दो
    if (!loading && user && user.id && user.repositories && user.repositories.length > 0) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // अब अगर user null भी हो तो onboarding modal चलता रहेगा
  const handleComplete = async (data: any) => {
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
      const payload = {
        portfolioData,
        skills: mappedSkills,
        selectedRepos: [],
        socials: [],
        deployedUrls: {},
        customNames: {},
        customDescriptions: {},
        githubUrls: {},
        selectedTheme: "light",
        repoOrder: [],
        repositories: data.projects,
        userId: user.id,
        userData: user,
        logoOverrides: {},
      };
      const res = await fetch("/api/portfolio/publish-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "पोर्टफोलियो बन गया!", description: "आपका devfolio लाइव है!", variant: "default" });
        router.push(`/${data.username}`);
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
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 text-xl shadow-lg">पोर्टफोलियो सेव किया जा रहा है...</div>
        </div>
      )}
    </div>
  );
}
