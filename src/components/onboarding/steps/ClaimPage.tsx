import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClaimPageProps {
  username: string;
  onNext: (username: string) => void;
}

export const ClaimPage = ({ username: initialUsername, onNext }: ClaimPageProps) => {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    onNext(username);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div className="inline-block">
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Claim your page
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-accent to-orange-500 rounded-full mt-2" />
        </div>
        <p className="text-muted-foreground text-[15px]">
          Choose a unique username for your developer portfolio
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <div className="flex items-center gap-2 group">
          <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">portfolio.dev/</span>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="yourname"
            className="flex-1 transition-all duration-300 focus:shadow-lg focus:shadow-accent/20 border-border/50 focus:border-accent"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-destructive animate-slide-up">{error}</p>
        )}
      </div>

      <Button 
        type="submit" 
        variant="default" 
        className="w-full shadow-lg hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] font-medium" 
        size="lg"
      >
        Continue
      </Button>
    </form>
  );
};
