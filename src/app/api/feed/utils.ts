import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function resolveCurrentUserId(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("github-session")?.value
    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie)
    const githubId = session?.user?.id
    if (!githubId) {
      return null
    }

    const userRecord = await prisma.user.findUnique({
      where: { githubId: githubId.toString() },
      select: { id: true },
    })

    return userRecord?.id ?? null
  } catch (error) {
    console.error("❌ Feed: Error resolving session user:", error)
    return null
  }
}
