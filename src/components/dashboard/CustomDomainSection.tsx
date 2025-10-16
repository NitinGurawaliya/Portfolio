"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

interface CustomDomainSectionProps {
  portfolioId: number
  isPublished: boolean
}

interface DomainStatus {
  hasDomain: boolean
  domain: string | null
  verified: boolean
  id?: string
  createdAt?: string
  lastCheckedAt?: string | null
}

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl: number
}

export function CustomDomainSection({ portfolioId, isPublished }: CustomDomainSectionProps) {
  const [domainInput, setDomainInput] = useState("")
  const [domainStatus, setDomainStatus] = useState<DomainStatus | null>(null)
  const [dnsRecords, setDnsRecords] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showDNSConfig, setShowDNSConfig] = useState(false)

  // Fetch domain status on mount
  useEffect(() => {
    if (portfolioId && portfolioId !== 0) {
      fetchDomainStatus()
    }
  }, [portfolioId])

  const fetchDomainStatus = async () => {
    try {
      const response = await fetch(`/api/custom-domain/status?portfolioId=${portfolioId}`)
      const data = await response.json()
      
      if (data.success) {
        setDomainStatus(data)
        if (data.hasDomain && !data.verified) {
          setShowDNSConfig(true)
        }
      }
    } catch (error) {
      console.error("Error fetching domain status:", error)
    }
  }

  const handleAddDomain = async () => {
    if (!domainInput.trim()) {
      toast.error("Please enter a domain")
      return
    }

    if (!isPublished) {
      toast.error("Please publish your portfolio first")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/custom-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domainInput,
          portfolioId: portfolioId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Domain added! Please configure your DNS records.")
        setDnsRecords(data.dnsRecords)
        setShowDNSConfig(true)
        setDomainInput("")
        await fetchDomainStatus()
      } else {
        toast.error(data.error || "Failed to add domain")
      }
    } catch (error) {
      console.error("Error adding domain:", error)
      toast.error("An error occurred while adding domain")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!domainStatus?.id) return

    setIsVerifying(true)
    try {
      const response = await fetch(`/api/custom-domain/${domainStatus.id}/verify`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        if (data.verified) {
          toast.success("🎉 Domain verified successfully! Your portfolio is now live.")
          await fetchDomainStatus()
          setShowDNSConfig(false)
        } else {
          toast.error(data.message || "Domain verification failed. Please check your DNS records.")
        }
      } else {
        toast.error(data.error || "Verification failed")
      }
    } catch (error) {
      console.error("Error verifying domain:", error)
      toast.error("An error occurred during verification")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!domainStatus?.id) return

    if (!confirm("Are you sure you want to remove this custom domain?")) {
      return
    }

    setIsRemoving(true)
    try {
      const response = await fetch(`/api/custom-domain/${domainStatus.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Domain removed successfully")
        setDomainStatus(null)
        setDnsRecords(null)
        setShowDNSConfig(false)
        await fetchDomainStatus()
      } else {
        toast.error(data.error || "Failed to remove domain")
      }
    } catch (error) {
      console.error("Error removing domain:", error)
      toast.error("An error occurred while removing domain")
    } finally {
      setIsRemoving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  if (!isPublished) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <p className="text-zinc-400 text-center">
            Please publish your portfolio before adding a custom domain.
          </p>
        </Card>
      </div>
    )
  }

  if (!portfolioId || portfolioId === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">
              Portfolio information not loaded yet.
            </p>
            <p className="text-zinc-500 text-sm mb-4">
              Please refresh the page to load your portfolio data.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Custom Domain</h2>
        <p className="text-zinc-400">
          Connect your own domain to your portfolio (e.g., nitin.com)
        </p>
      </div>

      {/* Domain Status Card */}
      {domainStatus?.hasDomain ? (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-white">
                {domainStatus.domain}
              </div>
              {domainStatus.verified ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  ✓ Verified & Live
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  ⏳ Pending Verification
                </Badge>
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveDomain}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove Domain"}
            </Button>
          </div>

          {!domainStatus.verified && (
            <div className="space-y-3">
              <Button
                onClick={handleVerifyDomain}
                disabled={isVerifying}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isVerifying ? "Checking DNS..." : "Verify Domain"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowDNSConfig(!showDNSConfig)}
                className="w-full border-zinc-700 hover:bg-zinc-800"
              >
                {showDNSConfig ? "Hide" : "Show"} DNS Configuration
              </Button>
            </div>
          )}

          {domainStatus.verified && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                🎉 Your portfolio is now live at{" "}
                <a
                  href={`http://${domainStatus.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  {domainStatus.domain}
                </a>
              </p>
            </div>
          )}
        </Card>
      ) : (
        /* Add Domain Form */
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Enter your domain
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g., nitin.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddDomain()
                    }
                  }}
                />
                <Button
                  onClick={handleAddDomain}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? "Adding..." : "Add Domain"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-zinc-400">
              <p className="font-semibold mb-2">Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You must own the domain</li>
                <li>Access to domain DNS settings</li>
                <li>Portfolio must be published</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* DNS Configuration Instructions */}
      {showDNSConfig && dnsRecords && (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            DNS Configuration
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            Add these DNS records at your domain provider (GoDaddy, Namecheap, etc.):
          </p>

          <div className="space-y-4">
            {/* A Record */}
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">
                  Record 1: A Record (Required for apex domain)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(dnsRecords.apex.value)}
                >
                  Copy Value
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-zinc-500">Type:</span>
                  <p className="text-white font-mono">{dnsRecords.apex.type}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Name:</span>
                  <p className="text-white font-mono">{dnsRecords.apex.name}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Value:</span>
                  <p className="text-white font-mono">{dnsRecords.apex.value}</p>
                </div>
              </div>
            </div>

            {/* CNAME Record */}
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">
                  Record 2: CNAME (Required for www subdomain)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(dnsRecords.www.value)}
                >
                  Copy Value
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-zinc-500">Type:</span>
                  <p className="text-white font-mono">{dnsRecords.www.type}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Name:</span>
                  <p className="text-white font-mono">{dnsRecords.www.name}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Value:</span>
                  <p className="text-white font-mono">{dnsRecords.www.value}</p>
                </div>
              </div>
            </div>

            {/* TXT Record */}
            <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">
                  Record 3: TXT (Verification - temporary)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(dnsRecords.verification.value)}
                >
                  Copy Value
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-zinc-500">Type:</span>
                  <p className="text-white font-mono">{dnsRecords.verification.type}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Name:</span>
                  <p className="text-white font-mono">{dnsRecords.verification.name}</p>
                </div>
                <div className="col-span-1">
                  <span className="text-zinc-500">Value:</span>
                  <p className="text-white font-mono text-xs truncate">
                    {dnsRecords.verification.value}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Next steps:</strong>
            </p>
            <ol className="list-decimal list-inside text-blue-400 text-sm mt-2 space-y-1">
              <li>Copy these records to your domain provider's DNS settings</li>
              <li>Wait 5-10 minutes for DNS propagation (may take up to 24 hours)</li>
              <li>Click "Verify Domain" button above</li>
              <li>Once verified, your portfolio will be live at your domain!</li>
            </ol>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <p><strong>Where do I add DNS records?</strong></p>
          <p>Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and look for "DNS Management" or "DNS Settings".</p>
          
          <p className="mt-3"><strong>How long does DNS propagation take?</strong></p>
          <p>Usually 5-10 minutes, but can take up to 24-48 hours in some cases.</p>
          
          <p className="mt-3"><strong>What about SSL/HTTPS?</strong></p>
          <p>SSL is handled by your domain provider or CDN (like Cloudflare). Make sure SSL is enabled on your domain.</p>
        </div>
      </Card>
    </div>
  )
}

