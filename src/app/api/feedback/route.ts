import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

// Email configuration
const FEEDBACK_EMAIL = "hopesalive.1947@gmail.com"

// Create nodemailer transporter
function createTransporter() {
  // Using Gmail SMTP
  // Note: You'll need to set up app-specific password for Gmail
  // or use another SMTP service
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your app password
    },
  })
}

// Fallback transporter for development/testing
function createFallbackTransporter() {
  // If email credentials are not set, use a test account
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "test@ethereal.email",
      pass: "test",
    },
  })
}

const ratingLabels: Record<string, string> = {
  disappointed: "😔 Disappointed",
  okay: "😐 Okay",
  good: "👌 Good",
  great: "👍 Great",
  amazing: "🔥 Amazing",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, experience, features } = body

    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      )
    }

    // Get user info from session if available
    let userId = null
    let userEmail = null

    try {
      const sessionCookie = request.cookies.get("github-session")
      if (sessionCookie) {
        const sessionResponse = await fetch(
          `${request.nextUrl.origin}/api/session`,
          {
            headers: {
              cookie: `github-session=${sessionCookie.value}`,
            },
          }
        )
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          if (session.user) {
            userId = session.user.id
            userEmail = session.user.email
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch user session:", error)
    }

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        rating,
        experience: experience || null,
        features: features || null,
        userId,
        userEmail,
      },
    })

    // Send email notification
    try {
      let transporter
      try {
        transporter = createTransporter()
      } catch (error) {
        console.log("Using fallback email transporter")
        transporter = createFallbackTransporter()
      }

      const ratingLabel = ratingLabels[rating] || rating

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .rating {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .section {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .section h3 {
              margin-top: 0;
              color: #667eea;
            }
            .metadata {
              font-size: 12px;
              color: #666;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 New Feedback Received!</h1>
            <p>DevFolio User Feedback</p>
          </div>
          <div class="content">
            <div class="rating">
              ${ratingLabel}
            </div>
            
            ${
              experience
                ? `
            <div class="section">
              <h3>Overall Experience</h3>
              <p>${experience.replace(/\n/g, "<br>")}</p>
            </div>
            `
                : ""
            }
            
            ${
              features
                ? `
            <div class="section">
              <h3>Feature Requests</h3>
              <p>${features.replace(/\n/g, "<br>")}</p>
            </div>
            `
                : ""
            }
            
            <div class="metadata">
              <p><strong>Submitted by:</strong> ${userEmail || "Anonymous"}</p>
              <p><strong>User ID:</strong> ${userId || "N/A"}</p>
              <p><strong>Feedback ID:</strong> ${feedback.id}</p>
              <p><strong>Date:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: process.env.EMAIL_USER || "feedback@devfolio.app",
        to: FEEDBACK_EMAIL,
        subject: `New Feedback: ${ratingLabel} - DevFolio`,
        html: emailHtml,
        text: `
New Feedback Received!

Rating: ${ratingLabel}

${experience ? `Overall Experience:\n${experience}\n\n` : ""}
${features ? `Feature Requests:\n${features}\n\n` : ""}

Submitted by: ${userEmail || "Anonymous"}
User ID: ${userId || "N/A"}
Feedback ID: ${feedback.id}
Date: ${new Date(feedback.createdAt).toLocaleString()}
        `,
      })

      console.log("Feedback email sent successfully")
    } catch (emailError) {
      console.error("Failed to send feedback email:", emailError)
      // Don't fail the request if email fails, feedback is still saved
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        feedbackId: feedback.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
