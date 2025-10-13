import { NextRequest } from "next/server"
import { ZodSchema } from "zod"
import type { MiddlewareContext } from "./withAuth"

type Handler = (req: NextRequest, ctx: MiddlewareContext) => Promise<Response> | Response

export function validateRequest<T>(schema: ZodSchema<T>, source: "json" | "searchParams" = "json") {
  return function (handler: (req: NextRequest, ctx: MiddlewareContext & { data: T }) => Promise<Response> | Response): Handler {
    return async (req, ctx) => {
      let raw: any
      if (source === "json") {
        raw = await req.json()
      } else {
        const { searchParams } = new URL(req.url)
        raw = Object.fromEntries(searchParams.entries())
      }
      const parsed = schema.safeParse(raw)
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } })
      }
      return handler(req, { ...ctx, data: parsed.data })
    }
  }
}
