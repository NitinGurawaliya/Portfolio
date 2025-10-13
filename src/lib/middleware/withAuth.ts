import { NextRequest } from "next/server"

export type SessionUser = {
  id: string
  name?: string
  email?: string
  image?: string
  githubUsername?: string
}

export type MiddlewareContext = Record<string, any> & { user?: SessionUser; data?: any }

type Handler = (req: NextRequest, ctx: MiddlewareContext) => Promise<Response> | Response

export function withAuth(handler: Handler): Handler {
  return async (req, ctx) => {
    const sessionCookie = req.cookies.get("github-session")?.value
    let user: SessionUser | undefined
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie)
        user = {
          id: session.user?.id || session.userId,
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          githubUsername: session.user?.githubUsername,
        }
      } catch {
        // ignore invalid cookie
      }
    }
    return handler(req, { ...ctx, user })
  }
}
