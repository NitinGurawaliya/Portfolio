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
    const portfolio = await prisma.portfolio.update({
      where: { userId: user.id },
      data: {
        productHuntUsername: productHuntUsername || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        productHuntUsername: true
      }
    })

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

