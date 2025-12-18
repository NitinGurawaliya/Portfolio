import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/session-validator'

export async function PATCH(request: NextRequest) {
  try {
    const sessionValidation = await validateSession(request)
    
    if (!sessionValidation.valid || !sessionValidation.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productHuntUsername } = body

    // Use validated user from session
    const user = sessionValidation.user

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update portfolio with ProductHunt username
    const normalizedUsername =
      typeof productHuntUsername === 'string' && productHuntUsername.trim() !== ''
        ? productHuntUsername.trim()
        : null

    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      update: {
        productHuntUsername: normalizedUsername,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        displayName: user.name || '',
        productHuntUsername: normalizedUsername,
        isPublished: false
      },
      select: {
        id: true,
        productHuntUsername: true
      }
    })

    // If user clears username, treat as disconnect and remove stored token as well
    if (!normalizedUsername) {
      await prisma.oAuthToken.deleteMany({
        where: { userId: user.id, platform: 'producthunt' }
      })
    }

    return NextResponse.json({
      success: true,
      productHuntUsername: portfolio.productHuntUsername,
      message: 'ProductHunt username updated successfully'
    })

  } catch (error) {
    console.error('Error updating ProductHunt username:', error)
    return NextResponse.json(
      { error: 'Failed to update ProductHunt username' },
      { status: 500 }
    )
  }
}

