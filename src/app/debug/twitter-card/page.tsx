"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TwitterCardDebugger() {
  const [url, setUrl] = useState('')
  const [debugUrl, setDebugUrl] = useState('')

  const handleDebug = () => {
    if (url) {
      const twitterDebugUrl = `https://cards-dev.twitter.com/validator`
      const encodedUrl = encodeURIComponent(url)
      setDebugUrl(`${twitterDebugUrl}?url=${encodedUrl}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Twitter Card Debugger</CardTitle>
            <p className="text-gray-600">
              Test your portfolio's Twitter card appearance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Portfolio URL
              </label>
              <Input
                type="url"
                placeholder="https://devfolio.cc/yourusername"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            <Button onClick={handleDebug} className="w-full">
              Debug Twitter Card
            </Button>

            {debugUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Click the button below to open Twitter Card Validator:
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(debugUrl, '_blank')}
                >
                  Open Twitter Card Validator
                </Button>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Tips:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Make sure your URL is publicly accessible</li>
                    <li>• Check that OG image is 1200x630px</li>
                    <li>• Verify meta tags are properly set</li>
                    <li>• Test with different portfolio URLs</li>
                    <li>• Main site: <code>devfolio.cc/</code> shows landing page OG</li>
                    <li>• Portfolio pages: Show DevFolio branded OG images</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Common Issues:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>No image:</strong> Check if OG image URL is accessible</li>
                <li>• <strong>Wrong size:</strong> Ensure image is 1200x630px</li>
                <li>• <strong>Cache issues:</strong> Wait 5-10 minutes for Twitter to update</li>
                <li>• <strong>Meta tags missing:</strong> Check page source for og:image tag</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
