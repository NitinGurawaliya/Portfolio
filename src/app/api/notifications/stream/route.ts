import { NextRequest } from "next/server"
import { resolveCurrentUserId } from "@/app/api/feed/utils"
import { getNotificationHub } from "@/lib/server/notificationHub"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("WebSocket upgrade required", { status: 426 })
  }

  const userId = await resolveCurrentUserId(req)
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const pair = createWebSocketPair()
  if (!pair) {
    return new Response("WebSocket not supported in this environment", { status: 500 })
  }

  const { client, server } = pair
  const serverSocket = server as ServerWebSocket
  const hub = getNotificationHub()

  const cleanup = () => {
    hub.removeClient(userId, server)
  }

  serverSocket.accept?.()
  hub.addClient(userId, server)

  serverSocket.addEventListener("close", cleanup)
  serverSocket.addEventListener("error", cleanup)

  serverSocket.addEventListener("message", (event: any) => {
    if (event.data === "ping") {
      try {
        serverSocket.send("pong")
      } catch (error) {
        console.error("🔔 Failed to send pong:", error)
      }
    }
  })

  return new Response(null, {
    status: 101,
    // @ts-expect-error `webSocket` is available in the runtime even though TypeScript doesn't recognise it yet
    webSocket: client,
  })
}

type WebSocketPairResult = { client: WebSocket; server: WebSocket } | null

function createWebSocketPair(): WebSocketPairResult {
  const globalAny = globalThis as unknown as {
    WebSocketPair?: new () => { 0: WebSocket; 1: WebSocket }
  }

  if (!globalAny.WebSocketPair) {
    console.error("🔔 WebSocketPair is not available in this runtime.")
    return null
  }

  const pair = new globalAny.WebSocketPair()
  const client = pair[0]
  const server = pair[1]

  if (!client || !server) {
    console.error("🔔 Failed to initialise WebSocketPair correctly.")
    return null
  }

  return { client, server }
}

type ServerWebSocket = WebSocket & {
  accept?: () => void
}