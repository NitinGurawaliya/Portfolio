import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateCache, CacheKeys } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: parseInt(portfolioId) },
      select: {
        backgroundColor: true,
        backgroundPattern: true
      }
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      backgroundColor: portfolio.backgroundColor,
      backgroundPattern: portfolio.backgroundPattern
    })

  } catch (error) {
    console.error('Error fetching customization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customization' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolioId, backgroundColor, backgroundPattern } = body

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: parseInt(portfolioId) },
      data: {
        backgroundColor: backgroundColor || null,
        backgroundPattern: backgroundPattern || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        customUsername: true,
        backgroundColor: true,
        backgroundPattern: true,
        user: {
          select: {
            githubUsername: true
          }
        }
      }
    })

    // Invalidate cache for public portfolio pages
    // This ensures background customization changes show up immediately on public pages
    const usernamesToInvalidate: string[] = []
    if (portfolio.customUsername) {
      usernamesToInvalidate.push(`public_${portfolio.customUsername}`)
      usernamesToInvalidate.push(CacheKeys.portfolio(portfolio.customUsername))
    }
    if (portfolio.user?.githubUsername) {
      usernamesToInvalidate.push(`public_${portfolio.user.githubUsername}`)
      usernamesToInvalidate.push(CacheKeys.portfolio(portfolio.user.githubUsername))
    }
    
    // Invalidate all related cache keys
    for (const username of usernamesToInvalidate) {
      invalidateCache(username)
    }

    console.log(`✅ Background customization updated and cache invalidated for:`, usernamesToInvalidate)

    return NextResponse.json({
      success: true,
      message: 'Customization updated successfully',
      customization: {
        backgroundColor: portfolio.backgroundColor,
        backgroundPattern: portfolio.backgroundPattern
      }
    })

  } catch (error) {
    console.error('Error updating customization:', error)
    return NextResponse.json(
      { error: 'Failed to update customization' },
      { status: 500 }
    )
  }
}

