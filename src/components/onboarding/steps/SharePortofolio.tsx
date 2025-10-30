import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Twitter, Linkedin, Facebook, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SharePortfolioProps {
  username: string;
  onComplete: () => void;
}

export const SharePortfolio = ({ username, onComplete }: SharePortfolioProps) => {
  const [copied, setCopied] = useState(false);
  const [publishedOnce, setPublishedOnce] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const portfolioUrl = `${baseUrl}/${username}`;

  // Auto-publish when this step mounts
  useEffect(() => {
    if (!publishedOnce) {
      setPublishedOnce(true);
      try {
        onComplete();
      } catch (e) {
        // no-op; toast inside publisher will show error if any
      }
    }
  }, [publishedOnce, onComplete]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Portfolio link copied to clipboard",
    });
  };

  const shareOnTwitter = () => {
    const text = `Check out my developer portfolio! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-center">
        <div className="relative w-20 h-20 mx-auto mb-2 animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-accent to-orange-500 rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-accent to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Portfolio Published! 🎉
          </h2>
          <p className="text-muted-foreground text-[15px]">
            Your developer portfolio is now live and ready to share
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl space-y-3 border border-border/50">
          <p className="text-sm font-medium text-foreground">Your Portfolio URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-background/80 px-4 py-2.5 rounded-lg border border-border/50 font-medium">
              {portfolioUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0 hover:border-accent hover:text-accent transition-all duration-300"
            >
              {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Share on social media</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={shareOnTwitter}
              className="flex items-center gap-2 hover:border-accent hover:text-accent hover:scale-105 transition-all duration-300"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={shareOnLinkedIn}
              className="flex items-center gap-2 hover:border-accent hover:text-accent hover:scale-105 transition-all duration-300"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              onClick={shareOnFacebook}
              className="flex items-center gap-2 hover:border-accent hover:text-accent hover:scale-105 transition-all duration-300"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>
        </div>
      </div>

      <Button 
        variant="default" 
        onClick={() => { window.location.assign("/dashboard") }} 
        className="w-full shadow-lg hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] font-medium" 
        size="lg"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};
