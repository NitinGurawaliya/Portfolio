import type { SyntheticEvent } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Link as LinkIcon, Loader2, Search } from "lucide-react"
import type { RepositoryLike } from "./types"

interface ProjectBasicInfoSectionProps {
  filteredRepos: RepositoryLike[]
  githubSearchQuery: string
  onGithubSearchQueryChange: (value: string) => void
  onSelectGithubRepo: (repo: RepositoryLike) => void
  projectUrl: string
  onProjectUrlChange: (value: string) => void
  isLoading: boolean
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  favicon: string | null
  logo: string | null
  imageLoading: boolean
  imageLoadError: boolean
  onImageLoadStart: () => void
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => Promise<void> | void
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => Promise<void> | void
  onUploadImage: (file: File) => void
}

export function ProjectBasicInfoSection({
  filteredRepos,
  githubSearchQuery,
  onGithubSearchQueryChange,
  onSelectGithubRepo,
  projectUrl,
  onProjectUrlChange,
  isLoading,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  favicon,
  logo,
  imageLoading,
  imageLoadError,
  onImageLoadStart,
  onImageLoad,
  onImageError,
  onUploadImage,
}: ProjectBasicInfoSectionProps) {
  const handleFilePick = (file?: File) => {
    if (!file) return
    onUploadImage(file)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="mb-2 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="flex h-8 items-center gap-1 rounded-lg px-3">
                  <Github className="h-4 w-4" />
                  Import from GitHub
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" sideOffset={8} className="z-[120] w-[420px] p-0">
                <div className="border-b p-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search repositories..."
                      className="pl-8"
                      value={githubSearchQuery}
                      onChange={(event) => onGithubSearchQueryChange(event.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {filteredRepos.length === 0 && (
                    <div className="px-3 py-4 text-xs text-muted-foreground">No repositories found.</div>
                  )}
                  {filteredRepos.map((repo) => (
                    <DropdownMenuItem key={repo.id} onClick={() => onSelectGithubRepo(repo)} className="py-3">
                      <div className="truncate">
                        <div className="text-sm font-medium">{repo.name}</div>
                        {repo.description && <div className="truncate text-xs text-gray-500">{repo.description}</div>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="https://example.com"
              value={projectUrl}
              onChange={(event) => onProjectUrlChange(event.target.value)}
              className="h-11 rounded-lg pl-9"
            />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />}
          </div>

          <Input placeholder="Name" value={title} onChange={(event) => onTitleChange(event.target.value)} className="h-11 rounded-lg" />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-[120px] rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border bg-gray-50">
              {favicon ? <img src={favicon} alt="favicon" className="h-7 w-7 object-contain" /> : <span className="text-[10px] text-gray-400">N/A</span>}
            </div>
            <div className="text-xs text-gray-500">Preview (OG image)</div>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-background">
            {logo ? (
              <>
                {!imageLoadError && (
                  <img
                    src={logo}
                    alt="preview"
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onLoadStart={onImageLoadStart}
                    onLoad={onImageLoad}
                    onError={onImageError}
                  />
                )}

                {imageLoading && !imageLoadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                )}

                {imageLoadError && (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-4 text-[11px] text-muted-foreground">
                    <p className="mb-2 font-medium">OG Image Not Available</p>
                    <p className="mb-3 text-center text-[10px] text-gray-400">
                      This repository does not have a custom OG image. Upload your own preview image.
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] text-blue-600 hover:text-blue-700">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleFilePick(event.target.files?.[0])}
                      />
                      <span className="rounded-md border border-blue-300 px-3 py-1.5 hover:bg-blue-50">Upload Custom Image</span>
                    </label>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                No OG image found - upload a screenshot
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600">
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFilePick(event.target.files?.[0])} />
              <span className="rounded-md border px-3 py-1.5 hover:bg-gray-50">Upload image</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
