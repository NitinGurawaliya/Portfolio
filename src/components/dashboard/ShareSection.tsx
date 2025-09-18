"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Copy, 
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Check
} from "lucide-react"

interface ShareSectionProps {
  portfolioUrl: string
  username: string
}

export function ShareSection({ portfolioUrl, username }: ShareSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=Check out my portfolio!&url=${encodeURIComponent(portfolioUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`,
    email: `mailto:?subject=Check out my portfolio&body=Check out my portfolio: ${portfolioUrl}`
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Share2 className="h-6 w-6 mr-2" />
            Share Your Portfolio
          </CardTitle>
          <p className="text-gray-400">
            Share your portfolio with the world and get more visibility
          </p>
        </CardHeader>
      </Card>

      {/* Portfolio URL */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-lg text-white">Your Portfolio URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolioUrl" className="text-white">Public URL</Label>
            <div className="flex space-x-2">
              <Input
                id="portfolioUrl"
                value={portfolioUrl}
                readOnly
                className="bg-gray-800  text-white"
              />
              <Button
                onClick={handleCopyUrl}
                className="bg-white text-black hover:bg-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              This is your public portfolio URL. Share it with employers, clients, and colleagues.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Sharing */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-lg text-white">Share on Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-black text-white hover:bg-gray-800 border "
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={() => handleShare('linkedin')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => handleShare('email')}
              variant="outline"
              className=" text-gray-300 hover:bg-gray-800"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-lg text-white">Embed in Website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedCode" className="text-white">Embed Code</Label>
            <textarea
              id="embedCode"
              value={`<iframe src="${portfolioUrl}" width="100%" height="600" frameborder="0"></iframe>`}
              readOnly
              className="w-full h-20 px-3 py-2 bg-gray-800 border  rounded-md text-white text-sm font-mono resize-none"
            />
            <p className="text-sm text-gray-400">
              Use this code to embed your portfolio in any website or blog.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-lg text-white">QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-gray-400 text-xs text-center">
                QR Code<br />Placeholder
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Scan this QR code to quickly access your portfolio on mobile devices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card className="bg-gray-900 ">
        <CardHeader>
          <CardTitle className="text-lg text-white">Portfolio Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Visitors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Shares</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Clicks</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Analytics will be available after your portfolio is published
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
