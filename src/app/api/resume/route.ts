import { NextRequest, NextResponse } from "next/server"
import PDFDocument from "pdfkit"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/session-validator"
import { computeProfileCompletion } from "@/lib/profile-completion"

const PORTFOLIO_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devfolio.vercel.app"

const sanitize = (value?: string | null) => (value ?? "").trim()

const buildSkillLine = (skills: string[]) => {
  if (!skills.length) return "Not specified"
  return skills.join(" • ")
}

const writeSectionTitle = (doc: PDFDocument, title: string) => {
  doc.moveDown(0.6)
  doc.font("Helvetica-Bold").fontSize(12).text(title.toUpperCase(), { characterSpacing: 0.4 })
  doc.moveDown(0.1)
}

const safeArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : [])

const createResumePdf = async ({
  name,
  headline,
  summary,
  contactLine,
  experiences,
  projects,
  skills,
  socials,
}: {
  name: string
  headline: string
  summary: string
  contactLine: string
  experiences: Array<{
    company: string
    role: string
    duration: string
    description: string
  }>
  projects: Array<{
    name: string
    description: string
    metrics?: string
    link?: string
  }>
  skills: string[]
  socials: Array<{ label: string; value: string }>
}) => {
  const doc = new PDFDocument({ size: "A4", margin: 48 })
  const chunks: Buffer[] = []

  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  doc.font("Helvetica-Bold").fontSize(20).text(name)
  doc.font("Helvetica").fontSize(11).text(headline || "Software Engineer")
  doc.moveDown(0.3)
  doc.font("Helvetica").fontSize(9).fillColor("#555555").text(contactLine, { lineGap: 2 })
  doc.fillColor("#000000")

  if (summary) {
    writeSectionTitle(doc, "Professional Summary")
    doc.font("Helvetica").fontSize(10).text(summary, { lineGap: 4 })
  }

  if (experiences.length) {
    writeSectionTitle(doc, "Experience")
    experiences.slice(0, 4).forEach((exp) => {
      doc.font("Helvetica-Bold").fontSize(10).text(`${exp.role} • ${exp.company}`)
      if (exp.duration) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#555555").text(exp.duration)
        doc.fillColor("#000000")
      }
      if (exp.description) {
        doc.font("Helvetica").fontSize(9.5).text(exp.description, { lineGap: 3 })
      }
      doc.moveDown(0.2)
    })
  }

  if (projects.length) {
    writeSectionTitle(doc, "Highlighted Projects")
    projects.slice(0, 3).forEach((project) => {
      doc.font("Helvetica-Bold").fontSize(10).text(project.name)
      if (project.description) {
        doc.font("Helvetica").fontSize(9.5).text(project.description, { lineGap: 3 })
      }
      if (project.metrics) {
        doc.font("Helvetica").fontSize(9).fillColor("#333333").text(project.metrics)
        doc.fillColor("#000000")
      }
      if (project.link) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1f2937").text(project.link)
        doc.fillColor("#000000")
      }
      doc.moveDown(0.2)
    })
  }

  if (skills.length) {
    writeSectionTitle(doc, "Core Skills")
    doc.font("Helvetica").fontSize(9.5).text(buildSkillLine(skills), { lineGap: 3 })
  }

  if (socials.length) {
    writeSectionTitle(doc, "Links")
    socials.slice(0, 5).forEach((link) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(`${link.label}: `, { continued: true })
        .font("Helvetica")
        .text(link.value)
    })
  }

  doc.end()
  return bufferPromise
}

export async function GET(req: NextRequest) {
  const sessionResult = await validateSession(req)
  if (!sessionResult.valid || !sessionResult.user) {
    return NextResponse.json(
      { error: sessionResult.error || "Not authenticated" },
      { status: 401 },
    )
  }

  const userRecord = sessionResult.user

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: userRecord.id },
    include: {
      skills: true,
      socials: true,
      experiences: true,
      repositories: {
        where: { deletedAt: null },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        include: { repository: true },
      },
    },
  })

  if (!portfolio) {
    return NextResponse.json(
      { error: "Portfolio not found. Add details in the dashboard first." },
      { status: 404 },
    )
  }

  const repositories = safeArray(portfolio.repositories)

  const selectedRepos = repositories.map((repo) =>
    Number(repo.repository?.githubId ?? repo.repositoryId),
  )

  const completion = computeProfileCompletion({
    portfolioData: {
      displayName: portfolio.displayName || userRecord.name || "",
      jobTitle: portfolio.jobTitle || userRecord.company || "",
      bio: portfolio.bio || userRecord.bio || "",
      profilePic: portfolio.profilePic || userRecord.avatarUrl || "",
      customUsername: portfolio.customUsername || userRecord.githubUsername || "",
    },
    selectedRepos,
    repoDetails: {
      deployedUrls: repositories.reduce<Record<number, string>>((acc, repo) => {
        if (repo.repository?.githubId) {
          acc[Number(repo.repository.githubId)] = repo.deployedUrl || ""
        }
        return acc
      }, {}),
      customDescriptions: repositories.reduce<Record<number, string>>((acc, repo) => {
        if (repo.repository?.githubId && repo.customDescription) {
          acc[Number(repo.repository.githubId)] = repo.customDescription
        }
        return acc
      }, {}),
      customNames: repositories.reduce<Record<number, string>>((acc, repo) => {
        if (repo.repository?.githubId && repo.customName) {
          acc[Number(repo.repository.githubId)] = repo.customName
        }
        return acc
      }, {}),
      projectStatuses: repositories.reduce<Record<number, string>>((acc, repo) => {
        if (repo.repository?.githubId && repo.projectStatus) {
          acc[Number(repo.repository.githubId)] = repo.projectStatus
        }
        return acc
      }, {}),
      projectCategories: repositories.reduce<Record<number, string>>((acc, repo) => {
        if (repo.repository?.githubId && repo.projectCategory) {
          acc[Number(repo.repository.githubId)] = repo.projectCategory
        }
        return acc
      }, {}),
    },
    skills: portfolio.skills,
    socials: portfolio.socials,
    experiences: portfolio.experiences,
    cvUrl: portfolio.cvUrl,
  })

  if (completion.overallPercent < 90) {
    return NextResponse.json(
      {
        error: "Profile completion below 90%. Add more details to unlock the ATS resume.",
        progress: completion,
      },
      { status: 403 },
    )
  }

  const experiences = safeArray(portfolio.experiences).map((exp) => ({
    company: sanitize(exp.companyName),
    role: sanitize(exp.role) || "Software Engineer",
    duration: sanitize(exp.duration),
    description: sanitize(exp.description),
  }))

  const projects = repositories.map((repo) => {
    const repoName = repo.customName || repo.repository?.name || "Project"
    const description =
      repo.customDescription ||
      repo.repository?.description ||
      "Key project shipped via DevFolio."
    const metrics = repo.projectUsers
      ? `${repo.projectUsers.toLocaleString()}+ users`
      : repo.projectRevenue
        ? `Generated $${repo.projectRevenue.toLocaleString()} revenue`
        : ""
    const link = repo.deployedUrl || repo.repository?.htmlUrl || repo.repository?.githubUrl || ""
    return {
      name: repoName,
      description,
      metrics,
      link,
    }
  })

  const skills = safeArray(portfolio.skills)
    .map((skill) => sanitize(skill.name))
    .filter(Boolean)
    .slice(0, 12)

  const socials = safeArray(portfolio.socials)
    .filter((social) => sanitize(social.url))
    .map((social) => ({
      label: social.platform,
      value: sanitize(social.url),
    }))

  const portfolioLink = portfolio.customUsername
    ? `${PORTFOLIO_BASE_URL.replace(/\/$/, "")}/${portfolio.customUsername}`
    : ""
  const contactParts = [
    sanitize(userRecord.email),
    sanitize(userRecord.location),
    sanitize(userRecord.websiteUrl),
    sanitize(portfolioLink),
    sanitize(userRecord.twitterUsername ? `https://twitter.com/${userRecord.twitterUsername}` : ""),
    sanitize(userRecord.githubUsername ? `https://github.com/${userRecord.githubUsername}` : ""),
  ].filter(Boolean)

  const pdfBuffer = await createResumePdf({
    name: sanitize(portfolio.displayName) || sanitize(userRecord.name) || "DevFolio User",
    headline: sanitize(portfolio.jobTitle) || "Software Developer",
    summary: sanitize(portfolio.bio || userRecord.bio || "Engineer focused on shipping impactful products."),
    contactLine: contactParts.join(" • "),
    experiences,
    projects,
    skills,
    socials,
  })

  const filenameBase =
    sanitize(portfolio.displayName) ||
    sanitize(userRecord.name) ||
    sanitize(userRecord.githubUsername) ||
    "devfolio"

  const safeFilename =
    filenameBase
      .toLowerCase()
      .replace(/[^a-z0-9\- ]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "devfolio"

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename}-resume.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
