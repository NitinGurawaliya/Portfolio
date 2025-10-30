import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface ClaimPageProps {
  username: string;
  onNext: (username: string) => void;
}

export const ClaimPage = ({ username: initialUsername, onNext }: ClaimPageProps) => {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState("");
  // 👇 Availablity State
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availMsg, setAvailMsg] = useState("");
  const baseDisplay = (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // --- Debounced Username Availability Checker ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!username || username.length < 3) {
        setIsAvailable(null);
        setAvailMsg("");
        return;
      }
      setIsChecking(true);
      setIsAvailable(null);
      fetch("/api/portfolio/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (data.available) {
            setIsAvailable(true);
            setAvailMsg("Username available");
            setError("");
          } else {
            setIsAvailable(false);
            setAvailMsg(data.message || "Not available");
            setError(data.message || "Username not available");
          }
          setIsChecking(false);
        })
        .catch(() => {
          setIsAvailable(false);
          setAvailMsg("Error checking username");
          setIsChecking(false);
        });
    }, 600);
    return () => clearTimeout(handler);
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username is required");
      return;
    }
    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }
    if (!isAvailable) {
      setError(availMsg || "Username not available");
      return;
    }
    onNext(trimmed);
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
        <div className="flex items-center gap-2 group relative">
          <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">{baseDisplay}/</span>
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
          <span className="absolute right-2">
            {isChecking && <span className="text-gray-400">...</span>}
            {!isChecking && isAvailable === true && <span className="text-green-600 font-bold">✔️</span>}
            {!isChecking && isAvailable === false && <span className="text-red-500 font-bold">❌</span>}
          </span>
        </div>
        {availMsg && (
          <p className={isAvailable ? "text-green-600 text-sm" : "text-red-500 text-sm"}>{availMsg}</p>
        )}
        {error && (
          <p className="text-sm text-destructive animate-slide-up">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="default"
        className="w-full shadow-lg hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] font-medium"
        size="lg"
        disabled={!isAvailable || isChecking}
      >
        Continue
      </Button>
    </form>
  );
};
