export interface UpvoteNotificationMessage {
  type: "project-upvote"
  data: {
    notificationId: string
    projectId: number
    projectName: string
    totalUpvotes: number
    actor?: {
      id: number
      name: string | null
      githubUsername: string | null
      avatarUrl: string | null
    }
    createdAt: string
  }
}

type ClientSocket = WebSocket & {
  readyState: number
  send: (data: string) => void
}

class NotificationHub {
  private clientMap = new Map<number, Set<ClientSocket>>()

  addClient(userId: number, socket: ClientSocket) {
    const existing = this.clientMap.get(userId)
    if (existing) {
      existing.add(socket)
    } else {
      this.clientMap.set(userId, new Set([socket]))
    }
  }

  removeClient(userId: number, socket: ClientSocket) {
    const clients = this.clientMap.get(userId)
    if (!clients) return

    clients.delete(socket)
    if (clients.size === 0) {
      this.clientMap.delete(userId)
    }
  }

  send(userId: number, message: UpvoteNotificationMessage) {
    const clients = this.clientMap.get(userId)
    if (!clients || clients.size === 0) return

    const payload = JSON.stringify(message)
    for (const socket of clients) {
      if (socket.readyState === socket.OPEN) {
        try {
          socket.send(payload)
        } catch (error) {
          console.error("🔔 Failed to send notification over websocket:", error)
        }
      }
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __notificationHub: NotificationHub | undefined
}

export function getNotificationHub() {
  if (!globalThis.__notificationHub) {
    globalThis.__notificationHub = new NotificationHub()
  }
  return globalThis.__notificationHub
}
