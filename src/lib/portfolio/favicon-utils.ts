interface BuildPortfolioFaviconUrlParams {
  baseUrl: string
  username: string
  profilePic?: string | null
  includeTimestamp?: boolean
}

export function generateCacheBuster(value: string): string {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    const characterCode = value.charCodeAt(index)
    hash = (hash << 5) - hash + characterCode
    hash |= 0
  }

  return Math.abs(hash).toString(36).slice(0, 8)
}

export function buildPortfolioFaviconUrl({
  baseUrl,
  username,
  profilePic,
  includeTimestamp = false,
}: BuildPortfolioFaviconUrlParams): string {
  if (!profilePic || !profilePic.startsWith("http")) {
    return `${baseUrl}/favicon-d.svg`
  }

  const cacheBuster = generateCacheBuster(profilePic)
  const timestampSegment = includeTimestamp ? `&t=${Date.now()}` : ""

  return `${baseUrl}/api/favicon?url=${encodeURIComponent(profilePic)}&username=${encodeURIComponent(username)}&hash=${cacheBuster}${timestampSegment}&v=2`
}

export function replaceDocumentFavicons(faviconUrl: string): void {
  const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
  existingIcons.forEach((icon) => icon.remove())

  const createFaviconLink = (rel: string, type?: string) => {
    const link = document.createElement("link")
    link.rel = rel
    if (type) {
      link.type = type
    }
    link.href = faviconUrl
    document.head.appendChild(link)
  }

  createFaviconLink("icon", "image/png")
  createFaviconLink("shortcut icon", "image/png")
  createFaviconLink("apple-touch-icon")
}
