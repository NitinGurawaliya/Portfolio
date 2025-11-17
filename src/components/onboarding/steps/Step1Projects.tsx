"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Link as LinkIcon, Github, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Step1ProjectsProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  session: any
}

export function Step1Projects({ data, updateData, onNext, session }: Step1ProjectsProps) {
  const [projectUrl, setProjectUrl] = useState("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [githubRepos, setGithubRepos] = useState<any[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState("")

  const loadGithubRepos = async () => {
    setIsLoadingRepos(true)
    try {
      const response = await fetch("/api/github/repos")
      if (response.ok) {
        const repos = await response.json()
        setGithubRepos(repos)
      }
    } catch (error) {
      console.error("Error loading GitHub repos:", error)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const addProjectFromUrl = async () => {
    if (!projectUrl) return
    
    setIsLoadingUrl(true)
    try {
      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: projectUrl })
      })
      
      if (response.ok) {
        const metadata = await response.json()
        const newProject = {
          id: Date.now(),
          url: projectUrl,
          name: metadata.title || projectUrl,
          description: metadata.description || "",
          favicon: metadata.favicon || "",
          image: metadata.image || "",
          type: "url"
        }
        
        updateData({ projects: [...data.projects, newProject] })
        setProjectUrl("")
      }
    } catch (error) {
      console.error("Error extracting metadata:", error)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const addProjectFromGithub = () => {
    if (!selectedRepo) return
    
    const repo = githubRepos.find(r => r.id.toString() === selectedRepo)
    if (repo) {
      const newProject = {
        id: repo.id,
        name: repo.name,
        description: repo.description || "",
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        type: "github"
      }
      
      updateData({ projects: [...data.projects, newProject] })
      setSelectedRepo("")
    }
  }

  const removeProject = (id: number) => {
    updateData({ projects: data.projects.filter((p: any) => p.id !== id) })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Add Your Projects</h2>
        <p className="text-muted-foreground">
          Showcase your work by adding projects from GitHub or pasting project URLs
        </p>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">
            <LinkIcon className="mr-2 h-4 w-4" />
            Project URL
          </TabsTrigger>
          <TabsTrigger value="github" onClick={loadGithubRepos}>
            <Github className="mr-2 h-4 w-4" />
            From GitHub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectUrl">Project URL</Label>
            <div className="flex gap-2">
              <Input
                id="projectUrl"
                placeholder="https://your-project.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProjectFromUrl()}
              />
              <Button
                onClick={addProjectFromUrl}
                disabled={!projectUrl || isLoadingUrl}
              >
                {isLoadingUrl ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We'll automatically fetch the project details
            </p>
          </div>
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="githubRepo">Select Repository</Label>
            <div className="flex gap-2">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRepos ? "Loading repositories..." : "Choose a repository"} />
                </SelectTrigger>
                <SelectContent>
                  {githubRepos.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.name}</span>
                        {repo.language && (
                          <span className="text-xs text-muted-foreground">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={addProjectFromGithub}
                disabled={!selectedRepo}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Added Projects */}
      {data.projects.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Added Projects ({data.projects.length})</h3>
          <div className="space-y-2">
            {data.projects.map((project: any) => (
              <Card key={project.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.type === "github" && project.language && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.language} • ⭐ {project.stars}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(project.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Skip
        </Button>
        <Button onClick={onNext} disabled={data.projects.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}

