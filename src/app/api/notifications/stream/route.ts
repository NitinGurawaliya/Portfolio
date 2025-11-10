import { NextRequest, NextResponse } from "next/server"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { getNotificationHub } from "@/lib/server/notificationHub"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (req.headers.get("upgrade") !== "websocket") {
    return NextResponse.json({ error: "WebSocket upgrade required" }, { status: 400 })
  }

  const userId = await resolveCurrentUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { socket, response } = NextResponse.upgrade(req)
  const hub = getNotificationHub()

  const cleanup = () => {
    hub.removeClient(userId, socket as WebSocket)
  }

  socket.accept?.()

  hub.addClient(userId, socket as WebSocket)

  socket.addEventListener("close", cleanup)
  socket.addEventListener("error", cleanup)

  socket.addEventListener("message", (event: MessageEvent) => {
    if (event.data === "ping") {
      try {
        socket.send("pong")
      } catch (error) {
        console.error("🔔 Failed to send pong:", error)
      }
    }
  })

  return response
}
