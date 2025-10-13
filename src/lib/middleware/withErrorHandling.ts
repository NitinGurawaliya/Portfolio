import { NextRequest, NextResponse } from "next/server"

type AnyContext = Record<string, any>

type Handler = (req: NextRequest, ctx: AnyContext) => Promise<Response | NextResponse> | Response | NextResponse

export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (error: any) {
      console.error("API Error:", error)
      const status = error?.status || 500
      const message = error?.message || "Internal Server Error"
      return NextResponse.json({ error: message }, { status })
    }
  }
}
