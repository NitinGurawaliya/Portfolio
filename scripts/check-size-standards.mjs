import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")
const exceptionsPath = path.join(rootDir, "config", "component-size-exceptions.json")

const LIMITS = {
  component: 300,
  hook: 200,
  utility: 100,
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/")
}

function readExceptions() {
  if (!fs.existsSync(exceptionsPath)) {
    return { component: [], hook: [], utility: [] }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(exceptionsPath, "utf8"))
    return {
      component: Array.isArray(parsed.component) ? parsed.component : [],
      hook: Array.isArray(parsed.hook) ? parsed.hook : [],
      utility: Array.isArray(parsed.utility) ? parsed.utility : [],
    }
  } catch (error) {
    console.error("Failed to parse component size exceptions file:", error)
    process.exit(1)
  }
}

function walkFiles(directoryPath, collected = []) {
  if (!fs.existsSync(directoryPath)) return collected

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      walkFiles(entryPath, collected)
      continue
    }

    if (!entry.isFile()) continue

    const normalized = normalizePath(path.relative(rootDir, entryPath))
    if (normalized.endsWith(".ts") || normalized.endsWith(".tsx")) {
      collected.push(normalized)
    }
  }

  return collected
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACMR", {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    })

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(normalizePath)
  } catch (error) {
    console.error("Failed to read staged files from git:", error.message)
    process.exit(1)
  }
}

function classifyFile(filePath) {
  if (!filePath.startsWith("src/")) return null

  if (filePath.startsWith("src/components/")) {
    return "component"
  }

  if (filePath.startsWith("src/hooks/")) {
    return "hook"
  }

  if (filePath.startsWith("src/lib/")) {
    return "utility"
  }

  return null
}

function getFileLineCount(filePath) {
  const absolutePath = path.join(rootDir, filePath)
  const content = fs.readFileSync(absolutePath, "utf8")
  return content.split(/\r?\n/).length
}

function main() {
  const checkAllFiles = process.argv.includes("--all")
  const exceptions = readExceptions()

  const candidateFiles = checkAllFiles
    ? walkFiles(path.join(rootDir, "src"))
    : getStagedFiles().filter((filePath) => filePath.startsWith("src/"))

  if (candidateFiles.length === 0) {
    console.log("No matching files to check for size standards.")
    return
  }

  const violations = []

  for (const filePath of candidateFiles) {
    const fileCategory = classifyFile(filePath)
    if (!fileCategory) continue

    const fileLimit = LIMITS[fileCategory]
    if (!fileLimit) continue

    if (exceptions[fileCategory].includes(filePath)) {
      continue
    }

    const lineCount = getFileLineCount(filePath)
    if (lineCount > fileLimit) {
      violations.push({
        filePath,
        fileCategory,
        lineCount,
        fileLimit,
      })
    }
  }

  if (violations.length === 0) {
    console.log(`Size standards passed for ${candidateFiles.length} file(s).`)
    return
  }

  console.error("Component size standard violations found:\n")
  for (const violation of violations) {
    console.error(
      `- ${violation.filePath} (${violation.fileCategory}) has ${violation.lineCount} lines, limit is ${violation.fileLimit}`
    )
  }

  console.error("\nFix file size or add a temporary exception in config/component-size-exceptions.json.")
  process.exit(1)
}

main()
