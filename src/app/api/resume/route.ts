import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateSession } from "@/lib/session-validator"
import { computeProfileCompletion } from "@/lib/profile-completion"

const PORTFOLIO_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devfolio.vercel.app"

const sanitize = (value?: string | null) => (value ?? "").trim()

const buildSkillLine = (skills: string[]) => {
  if (!skills.length) return "Not specified"
  return skills.join(", ")
}

const categorizeSkills = (skills: Array<{ name: string; category?: string | null }>) => {
  const categories: Record<string, string[]> = {
    Languages: [],
    Frontend: [],
    Backend: [],
    Database: [],
    Tools: [],
    Other: []
  }

  skills.forEach(skill => {
    const name = skill.name.trim()
    const category = skill.category?.toLowerCase() || ''
    
    // Auto-categorize based on common tech
    if (category.includes('language') || ['C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby'].some(lang => name.toLowerCase().includes(lang.toLowerCase()))) {
      categories.Languages.push(name)
    } else if (category.includes('frontend') || ['React', 'Next.js', 'Vue', 'Angular', 'Tailwind', 'CSS', 'HTML', 'Redux', 'Svelte'].some(tech => name.toLowerCase().includes(tech.toLowerCase()))) {
      categories.Frontend.push(name)
    } else if (category.includes('backend') || ['Node.js', 'Express', 'Hono', 'Django', 'Flask', 'FastAPI', 'Spring', 'NestJS', 'Worker'].some(tech => name.toLowerCase().includes(tech.toLowerCase()))) {
      categories.Backend.push(name)
    } else if (category.includes('database') || ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma', 'SQL', 'Firebase'].some(db => name.toLowerCase().includes(db.toLowerCase()))) {
      categories.Database.push(name)
    } else if (category.includes('tool') || ['Git', 'Docker', 'AWS', 'Azure', 'CI/CD', 'Linux', 'Kubernetes'].some(tool => name.toLowerCase().includes(tool.toLowerCase()))) {
      categories.Tools.push(name)
    } else {
      categories.Other.push(name)
    }
  })

  return categories
}

const safeArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : [])

const createResumePdf = async ({
  name,
  headline,
  summary,
  contactLine,
  experiences,
  projects,
  categorizedSkills,
  socials,
  education,
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
    technologies?: string
  }>
  categorizedSkills: Record<string, string[]>
  socials: Array<{ label: string; value: string }>
  education?: {
    institution: string
    degree: string
    duration: string
    location?: string
  }
}) => {
  try {
    // Dynamic import to handle font loading issues in Next.js
    const PDFDocument = (await import("pdfkit")).default
    
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 48,
      bufferPages: true,
      autoFirstPage: true
    })
    const chunks: Buffer[] = []

    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)
    })

    // Helper function to safely handle fonts
    const safeFont = (fontName: string) => {
      try {
        doc.font(fontName)
      } catch (error) {
        // If font fails, continue with default font
        console.warn(`Font ${fontName} not available, using default`)
      }
      return doc
    }

    const writeSectionTitle = (title: string) => {
      doc.moveDown(0.7)
      safeFont("Helvetica-Bold")
        .fontSize(11)
        .text(title.toUpperCase(), { characterSpacing: 0.8 })
      // Add underline
      const y = doc.y
      doc.moveTo(doc.page.margins.left, y + 2)
         .lineTo(doc.page.width - doc.page.margins.right, y + 2)
         .lineWidth(0.5)
         .stroke()
      doc.moveDown(0.4)
    }

    const writeBulletPoint = (text: string) => {
      const x = doc.x
      safeFont("Helvetica").fontSize(9).text("• ", x, doc.y, {
        continued: true,
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right
      })
      doc.text(text, { align: "left", lineGap: 2 })
      doc.moveDown(0.1)
    }

    // Header - Name centered and bold
    safeFont("Helvetica-Bold")
      .fontSize(24)
      .text(name.toUpperCase(), { align: "center" })
    
    // Contact line centered
    doc.moveDown(0.2)
    safeFont("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text(contactLine, { align: "center", lineGap: 1 })
    doc.fillColor("#000000")
    doc.moveDown(0.3)

    // Education Section
    if (education) {
      writeSectionTitle("Education")
      safeFont("Helvetica-Bold").fontSize(10).text(education.institution)
      if (education.duration || education.location) {
        const rightText = education.duration || ""
        const currentY = doc.y
        safeFont("Helvetica-Oblique").fontSize(9).fillColor("#555555")
        
        if (education.location) {
          const locationWidth = doc.widthOfString(education.location)
          doc.text(education.location, doc.page.width - doc.page.margins.right - locationWidth, currentY, {
            width: locationWidth,
            align: "right"
          })
        }
        
        doc.text(rightText, doc.page.margins.left, currentY)
        doc.fillColor("#000000")
      }
      if (education.degree) {
        doc.moveDown(0.1)
        safeFont("Helvetica").fontSize(9.5).text(education.degree)
      }
      doc.moveDown(0.2)
    }

    // Work Experience
    if (experiences.length) {
      writeSectionTitle("Work Experience")
      experiences.slice(0, 4).forEach((exp, idx) => {
        // Company name with link icon and duration on right
        const companyLine = `${exp.company} | ${exp.role}`
        const duration = exp.duration
        
        const currentY = doc.y
        safeFont("Helvetica-Bold").fontSize(10).text(companyLine, doc.page.margins.left, currentY)
        
        if (duration) {
          const durationWidth = safeFont("Helvetica-Oblique").fontSize(9).widthOfString(duration)
          safeFont("Helvetica-Oblique")
            .fontSize(9)
            .fillColor("#555555")
            .text(duration, doc.page.width - doc.page.margins.right - durationWidth, currentY)
          doc.fillColor("#000000")
        }
        
        doc.moveDown(0.3)
        
        // Description as bullet points
        if (exp.description) {
          const points = exp.description.split(/[.•]/).filter(p => p.trim().length > 10)
          if (points.length > 0) {
            points.slice(0, 4).forEach(point => {
              writeBulletPoint(point.trim())
            })
          } else {
            writeBulletPoint(exp.description)
          }
        }
        
        if (idx < experiences.length - 1) {
          doc.moveDown(0.2)
        }
      })
    }

    // Projects
    if (projects.length) {
      writeSectionTitle("Projects")
      projects.slice(0, 3).forEach((project, idx) => {
        // Project name with link
        const projectTitle = project.link ? `${project.name} ↗` : project.name
        safeFont("Helvetica-Bold").fontSize(10).text(projectTitle)
        
        // Tech Stack
        if (project.technologies) {
          doc.moveDown(0.1)
          safeFont("Helvetica-Bold").fontSize(9).text("Tech Stack: ", { continued: true })
          safeFont("Helvetica").text(project.technologies)
        }
        
        doc.moveDown(0.2)
        
        // Description and achievements as bullets
        if (project.description) {
          const points = project.description.split(/[.•]/).filter(p => p.trim().length > 15)
          if (points.length > 1) {
            points.slice(0, 3).forEach(point => {
              writeBulletPoint(point.trim())
            })
          } else {
            writeBulletPoint(project.description)
          }
        }
        
        if (project.metrics) {
          writeBulletPoint(project.metrics)
        }
        
        if (project.link) {
          doc.moveDown(0.05)
          safeFont("Helvetica").fontSize(8).fillColor("#555555").text(project.link)
          doc.fillColor("#000000")
        }
        
        if (idx < projects.length - 1) {
          doc.moveDown(0.3)
        }
      })
    }

    // Technologies & Skills
    const hasSkills = Object.values(categorizedSkills).some(arr => arr.length > 0)
    if (hasSkills) {
      writeSectionTitle("Technologies & Skills")
      
      const skillCategories = [
        { name: 'Languages', key: 'Languages' },
        { name: 'Frontend', key: 'Frontend' },
        { name: 'Backend', key: 'Backend' },
        { name: 'Database', key: 'Database' },
        { name: 'Tools', key: 'Tools' },
      ]
      
      skillCategories.forEach(({ name, key }) => {
        const skills = categorizedSkills[key]
        if (skills && skills.length > 0) {
          safeFont("Helvetica-Bold").fontSize(9.5).text(`${name}: `, { continued: true })
          safeFont("Helvetica").text(buildSkillLine(skills))
          doc.moveDown(0.15)
        }
      })
      
      // Other skills if any
      if (categorizedSkills.Other && categorizedSkills.Other.length > 0) {
        safeFont("Helvetica-Bold").fontSize(9.5).text("Other: ", { continued: true })
        safeFont("Helvetica").text(buildSkillLine(categorizedSkills.Other))
      }
    }

    // Keep links minimal or remove as they're in header
    // Links section removed to keep resume clean

    doc.end()
    return await bufferPromise
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
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
      "A key project demonstrating technical expertise and problem-solving abilities."
    const metrics = repo.projectUsers
      ? `Serves ${repo.projectUsers.toLocaleString()}+ active users`
      : repo.projectRevenue
        ? `Generated $${repo.projectRevenue.toLocaleString()} in revenue`
        : repo.projectMrr
          ? `Achieved $${repo.projectMrr.toLocaleString()} MRR`
          : ""
    const link = repo.deployedUrl || repo.repository?.htmlUrl || repo.repository?.githubUrl || ""
    const technologies = repo.technologies || repo.repository?.language || ""
    return {
      name: repoName,
      description,
      metrics,
      link,
      technologies,
    }
  })

  const categorizedSkills = categorizeSkills(
    safeArray(portfolio.skills)
      .filter((skill) => sanitize(skill.name))
      .slice(0, 20)
  )

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
    sanitize(userRecord.location),
    sanitize(userRecord.email),
    sanitize(userRecord.githubUsername ? `github.com/${userRecord.githubUsername}` : ""),
    sanitize(userRecord.twitterUsername ? `twitter.com/${userRecord.twitterUsername}` : ""),
    sanitize(portfolioLink ? portfolioLink.replace('https://', '').replace('http://', '') : ""),
  ].filter(Boolean)

  // Create education section from available data
  const education = portfolio.bio || userRecord.company
    ? {
        institution: userRecord.company || "Self-taught Developer",
        degree: portfolio.jobTitle || "Computer Science / Software Engineering",
        duration: "Present",
        location: sanitize(userRecord.location) || undefined,
      }
    : undefined

  try {
    const pdfBuffer = await createResumePdf({
      name: sanitize(portfolio.displayName) || sanitize(userRecord.name) || "DevFolio User",
      headline: sanitize(portfolio.jobTitle) || "Software Developer",
      summary: sanitize(portfolio.bio || userRecord.bio || "Passionate software engineer focused on building impactful products and solving complex problems."),
      contactLine: contactParts.join(" • "),
      experiences,
      projects,
      categorizedSkills,
      socials,
      education,
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
  } catch (error) {
    console.error("Resume generation failed:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate resume PDF. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    )
  }
}
