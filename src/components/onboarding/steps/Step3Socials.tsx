"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, Github, Linkedin, Twitter, Globe, Mail } from "lucide-react"

interface Step3SocialsProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

const socialPlatforms = [
  { name: "GitHub", icon: Github, placeholder: "username", urlPrefix: "https://github.com/" },
  { name: "LinkedIn", icon: Linkedin, placeholder: "username", urlPrefix: "https://linkedin.com/in/" },
  { name: "Twitter", icon: Twitter, placeholder: "username", urlPrefix: "https://twitter.com/" },
  { name: "Website", icon: Globe, placeholder: "https://yoursite.com", urlPrefix: "" },
  { name: "Email", icon: Mail, placeholder: "email@example.com", urlPrefix: "mailto:" },
]

export function Step3Socials({ data, updateData, onNext, onBack }: Step3SocialsProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const addSocial = (platform: string) => {
    const value = inputs[platform]
    if (!value) return

    const platformData = socialPlatforms.find(p => p.name === platform)
    if (!platformData) return

    // Build URL
    let url = value
    if (!value.startsWith("http") && !value.startsWith("mailto:")) {
      url = platformData.urlPrefix + value
    }

    const newSocial = {
      id: Date.now(),
      platform,
      username: value,
      url,
      isPinned: false
    }

    updateData({ socials: [...data.socials, newSocial] })
    setInputs({ ...inputs, [platform]: "" })
  }

  const removeSocial = (id: number) => {
    updateData({ socials: data.socials.filter((s: any) => s.id !== id) })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Add Social Links</h2>
        <p className="text-muted-foreground">
          Connect your social profiles so people can reach you
        </p>
      </div>

      <div className="space-y-4">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon
          const isAdded = data.socials.some((s: any) => s.platform === platform.name)

          return (
            <div key={platform.name} className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {platform.name}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={platform.placeholder}
                  value={inputs[platform.name] || ""}
                  onChange={(e) => setInputs({ ...inputs, [platform.name]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addSocial(platform.name)}
                  disabled={isAdded}
                />
                <Button
                  onClick={() => addSocial(platform.name)}
                  disabled={!inputs[platform.name] || isAdded}
                >
                  {isAdded ? "Added ✓" : "Add"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Added Socials */}
      {data.socials.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Added Links ({data.socials.length})</h3>
          <div className="space-y-2">
            {data.socials.map((social: any) => {
              const platform = socialPlatforms.find(p => p.name === social.platform)
              const Icon = platform?.icon || Globe

              return (
                <Card key={social.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{social.platform}</p>
                        <p className="text-sm text-muted-foreground">{social.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocial(social.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

