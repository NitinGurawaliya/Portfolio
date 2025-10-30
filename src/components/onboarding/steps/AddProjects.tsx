import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: number;
  name: string;
  fullName?: string;
  description: string;
  htmlUrl: string;
  homepage?: string;
  language: string;
  stargazersCount?: number;
  forksCount?: number;
  isPrivate?: boolean;
  isFork?: boolean;
  size?: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  isImported?: boolean;
  favicon?: string;
  logo?: string;
  siteName?: string;
  keywords?: string;
  author?: string;
  url: string; // keep original url for UI display
}

interface AddProjectsProps {
  projects: Project[];
  onNext: (projects: Project[]) => void;
  onBack: () => void;
}

export const AddProjects = ({ projects: initialProjects, onNext, onBack }: AddProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [currentUrl, setCurrentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!data.success || !data.projectData) throw new Error("No metadata found");
      const pd = data.projectData;
      const project: Project = {
        id: pd.id,
        name: pd.name || (data.metadata?.title || url),
        fullName: pd.fullName,
        description: pd.description || "",
        htmlUrl: pd.htmlUrl || url,
        homepage: pd.homepage || url,
        language: pd.language || "",
        stargazersCount: pd.stargazersCount || 0,
        forksCount: pd.forksCount || 0,
        isPrivate: pd.isPrivate || false,
        isFork: pd.isFork || false,
        size: pd.size || 0,
        createdAt: pd.createdAt || new Date().toISOString(),
        updatedAt: pd.updatedAt || new Date().toISOString(),
        pushedAt: pd.pushedAt || new Date().toISOString(),
        isImported: true,
        favicon: pd.favicon || data.metadata?.favicon || "/favicon.ico",
        logo: pd.logo,
        siteName: pd.siteName,
        keywords: pd.keywords,
        author: pd.author,
        url: pd.htmlUrl || url,
      };
      setProjects([...projects, project]);
      setCurrentUrl("");
      toast({
        title: "Project added",
        description: "Your project has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project metadata. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUrl.trim()) return;

    try {
      new URL(currentUrl);
      fetchMetadata(currentUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (projects.length === 0) {
      toast({
        title: "Add at least one project",
        description: "Please add at least one project to continue",
        variant: "destructive",
      });
      return;
    }
    onNext(projects);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-block">
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Add your projects
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-accent to-orange-500 rounded-full mt-2" />
        </div>
        <p className="text-muted-foreground text-[15px]">
          Share your best work by adding project URLs
        </p>
      </div>

      <form onSubmit={handleAddProject} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="project-url" className="text-sm font-medium">Project URL</Label>
          <div className="flex gap-2">
            <Input
              id="project-url"
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              disabled={loading}
              className="transition-all duration-300 focus:shadow-lg focus:shadow-accent/20 border-border/50 focus:border-accent"
            />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={loading || !currentUrl.trim()}
              className="shrink-0 hover:border-accent hover:text-accent transition-all duration-300"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Added Projects ({projects.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 hover:border-accent/50 transition-all duration-300 group animate-slide-up"
                >
                  <img
                    src={project.favicon}
                    alt=""
                    className="w-8 h-8 rounded shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">{project.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.url}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                    onClick={() => removeProject(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack} 
          className="flex-1 hover:border-primary transition-all duration-300"
        >
          Back
        </Button>
        <Button 
          type="button" 
          variant="default" 
          onClick={handleNext} 
          className="flex-1 shadow-lg hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] font-medium"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
