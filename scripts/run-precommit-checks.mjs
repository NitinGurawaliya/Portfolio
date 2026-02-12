import { execSync, spawnSync } from "child_process"

const LINTABLE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"])

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  })

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function isLintableFile(filePath) {
  const extension = filePath.slice(filePath.lastIndexOf("."))
  return LINTABLE_EXTENSIONS.has(extension)
}

function runCommand(command) {
  execSync(command, { stdio: "inherit" })
}

function runStagedEslint(stagedFiles) {
  const lintFiles = stagedFiles.filter(isLintableFile)
  if (lintFiles.length === 0) {
    console.log("No staged JS/TS files to lint.")
    return
  }

  const result = spawnSync("npx", ["eslint", ...lintFiles], {
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function main() {
  const stagedFiles = getStagedFiles()

  if (stagedFiles.length === 0) {
    console.log("No staged files. Skipping pre-commit quality checks.")
    return
  }

  runCommand("npm run quality:size")
  runStagedEslint(stagedFiles)
}

main()
