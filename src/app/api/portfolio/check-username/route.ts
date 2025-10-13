import { NextRequest, NextResponse } from "next/server"
import { withErrorHandling } from "@/lib/middleware"
import { validateRequest } from "@/lib/middleware"
import { usernameCheckSchema } from "@/lib/validators"
import { checkUsernameAvailability } from "@/lib/services"

export const POST = withErrorHandling(
  validateRequest(usernameCheckSchema)(async (_req: NextRequest, ctx) => {
    const { username, currentUserId } = ctx.data
    const result = await checkUsernameAvailability({ username, currentUserId })
    return NextResponse.json(result)
  })
)
