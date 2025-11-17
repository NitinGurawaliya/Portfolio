import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { githubId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } })
    if (!portfolio) return NextResponse.json({ experiences: [] }, { status: 200 })

    const experiences = await prisma.experience.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ experiences })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, experience } = body || {}
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    if (!experience?.companyName) return NextResponse.json({ error: 'companyName is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { githubId: userId.toString() } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const portfolio = await prisma.portfolio.upsert({
      where: { userId: user.id },
      create: { userId: user.id, selectedTheme: 'light' },
      update: {}
    })

    const created = await prisma.experience.create({
      data: {
        portfolioId: portfolio.id,
        companyName: experience.companyName,
        companyUrl: experience.companyUrl || null,
        faviconUrl: experience.faviconUrl || null,
        role: experience.role || null,
        duration: experience.duration || null,
        description: experience.description || null,
      }
    })
    return NextResponse.json({ success: true, experience: created })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, experience } = body || {}
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    if (!experience?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { githubId: userId.toString() } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } })
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })

    const updated = await prisma.experience.update({
      where: { id: experience.id },
      data: {
        companyName: experience.companyName,
        companyUrl: experience.companyUrl || null,
        faviconUrl: experience.faviconUrl || null,
        role: experience.role || null,
        duration: experience.duration || null,
        description: experience.description || null,
      }
    })
    return NextResponse.json({ success: true, experience: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const id = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { githubId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const deleted = await prisma.experience.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true, experience: deleted })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 })
  }
}


