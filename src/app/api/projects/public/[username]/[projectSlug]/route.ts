import { NextRequest, NextResponse } from "next/server"
import { getPublicProjectPageData } from "@/lib/projects/get-public-project"
import { resolveCurrentUserId } from "@/app/api/feed/utils"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; projectSlug: string }> }
) {
  try {
    const { username, projectSlug } = await params
    const viewerId = await resolveCurrentUserId(req)

    const data = await getPublicProjectPageData(username, projectSlug, viewerId ?? undefined)

    if (!data) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ Public project API failed:", error)
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error))
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { 
        error: "Failed to load project",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

