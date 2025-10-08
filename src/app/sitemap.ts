import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Fetch all published portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isPublished: true,
      },
      select: {
        customUsername: true,
        updatedAt: true,
        user: {
          select: {
            githubUsername: true,
          },
        },
      },
    })

    // Dynamic portfolio routes
    const portfolioRoutes: MetadataRoute.Sitemap = portfolios.map((portfolio) => ({
      url: `${baseUrl}/${portfolio.customUsername || portfolio.user.githubUsername}`,
      lastModified: portfolio.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...portfolioRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return only static routes if database fetch fails
    return staticRoutes
  }
}
