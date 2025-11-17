"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

interface Step5ThemeProps {
  data: any
  updateData: (data: any) => void
  onComplete: () => void
  onBack: () => void
}

const themes = [
  { id: "light", name: "Light", preview: "/themes/light-preview.png" },
  { id: "dark", name: "Dark", preview: "/themes/dark-preview.png" },
  { id: "modern", name: "Modern", preview: "/themes/modern-preview.png" },
]

const backgroundColors = [
  { id: "default", name: "Default", color: "" },
  { id: "gradient1", name: "Sunset", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "gradient2", name: "Ocean", color: "linear-gradient(135deg, #667eea 0%, #f093fb 100%)" },
  { id: "gradient3", name: "Forest", color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "gradient4", name: "Fire", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
]

const backgroundPatterns = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
  { id: "waves", name: "Waves" },
]

export function Step5Theme({ data, updateData, onComplete, onBack }: Step5ThemeProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Customize Your Theme</h2>
        <p className="text-muted-foreground">
          Choose a theme and customize colors to match your style
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <Label>Choose Theme</Label>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`cursor-pointer overflow-hidden transition-all ${
                data.selectedTheme === theme.id
                  ? "ring-2 ring-primary"
                  : "hover:ring-2 hover:ring-muted-foreground/50"
              }`}
              onClick={() => updateData({ selectedTheme: theme.id })}
            >
              <div className="relative aspect-video bg-muted">
                {data.selectedTheme === theme.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Preview
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium">{theme.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label>Background Style</Label>
        <div className="grid grid-cols-5 gap-3">
          {backgroundColors.map((bg) => (
            <button
              key={bg.id}
              className={`group relative h-20 rounded-lg border-2 transition-all ${
                data.backgroundColor === bg.id
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              style={{
                background: bg.color || "#f4f4f5"
              }}
              onClick={() => updateData({ backgroundColor: bg.id })}
            >
              {data.backgroundColor === bg.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-primary p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-1">
                <p className="text-xs font-medium">{bg.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="space-y-3">
        <Label>Background Pattern</Label>
        <div className="grid grid-cols-4 gap-3">
          {backgroundPatterns.map((pattern) => (
            <Card
              key={pattern.id}
              className={`cursor-pointer p-4 text-center transition-all ${
                data.backgroundPattern === pattern.id
                  ? "ring-2 ring-primary"
                  : "hover:ring-2 hover:ring-muted-foreground/50"
              }`}
              onClick={() => updateData({ backgroundPattern: pattern.id })}
            >
              {data.backgroundPattern === pattern.id && (
                <Check className="mx-auto mb-1 h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-medium">{pattern.name}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} size="lg">
          Complete Setup
        </Button>
      </div>
    </div>
  )
}

