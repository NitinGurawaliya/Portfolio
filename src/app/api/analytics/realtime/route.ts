import { NextRequest } from "next/server"
import { analyticsEvents } from "@/lib/analytics-events"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const portfolioId = searchParams.get("portfolioId")
    
    if (!portfolioId) {
      return new Response(
        "Missing portfolioId",
        { status: 400 }
      )
    }

    const portfolioIdNum = parseInt(portfolioId)
    
    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const encoder = new TextEncoder()
        const send = (data: string) => {
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error sending SSE message:', error)
          }
        }

        send(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

        // Subscribe to analytics events
        const unsubscribe = analyticsEvents.subscribe(portfolioIdNum, (eventData) => {
          send(`data: ${JSON.stringify(eventData)}\n\n`)
        })

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          send(`: heartbeat\n\n`)
        }, 30000) // Every 30 seconds

        // Cleanup when client disconnects
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          unsubscribe()
          try {
            controller.close()
          } catch (error) {
            console.error('Error closing SSE stream:', error)
          }
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      }
    })
  } catch (error) {
    console.error('Error creating SSE stream:', error)
    return new Response(
      "Error creating stream",
      { status: 500 }
    )
  }
}

