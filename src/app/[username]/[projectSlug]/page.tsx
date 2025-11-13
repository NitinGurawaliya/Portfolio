import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies, headers } from "next/headers"
import ProjectPageClient from "@/components/projects/ProjectPageClient"
import type { PublicProjectPageData } from "@/types/public-project"

type PageParams = {
  username: string
  projectSlug: string
}

async function buildBaseUrl() {
  const headerList = await headers()
  const proto =
    headerList.get("x-forwarded-proto") ||
    process.env.NEXT_PUBLIC_SITE_PROTOCOL ||
    "http"
  const host =
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    process.env.VERCEL_URL

  if (host) {
    return `${proto}://${host}`
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

async function fetchProjectPageDataFromApi(
  username: string,
  projectSlug: string
): Promise<PublicProjectPageData | null> {
  const cookieStore = await cookies()
  const serializedCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  const baseUrl = await buildBaseUrl()
  const response = await fetch(
    `${baseUrl}/api/projects/public/${encodeURIComponent(
      username
    )}/${encodeURIComponent(projectSlug)}`,
    {
      headers: serializedCookies ? { Cookie: serializedCookies } : undefined,
      cache: "no-store",
    }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to load project data")
  }

  const payload = await response.json()
  return payload?.data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { username, projectSlug } = await params

  const data = await fetchProjectPageDataFromApi(username, projectSlug)
  if (!data) {
    return {
      title: "Project Not Found | DevFolio",
      description:
        "Project not found on DevFolio. Discover launch-ready developer portfolios and shiplogs.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const baseUrl = await buildBaseUrl()

  const pageUrl = `${baseUrl}/${data.portfolio.slug}/${data.slug}`
  const ogImage = data.project.logo || `${baseUrl}/og-image.png`
  const favicon =
    data.project.favicon ||
    data.project.logo ||
    data.portfolio.profilePic ||
    `${baseUrl}/favicon.ico`

  const description = data.project.description
    ? data.project.description.replace(/<[^>]+>/g, "").slice(0, 160)
    : `${data.project.title} by ${data.portfolio.name} on DevFolio`

  return {
    title: `${data.project.title} • ${data.portfolio.name} | DevFolio`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
    openGraph: {
      title: `${data.project.title} • ${data.portfolio.name}`,
      description,
      url: pageUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${data.project.title} preview`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.project.title} • ${data.portfolio.name}`,
      description,
      images: [ogImage],
    },
  }
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { username, projectSlug } = await params
  const data = await fetchProjectPageDataFromApi(username, projectSlug)

  if (!data) {
    notFound()
  }

  return <ProjectPageClient data={data} />
}

