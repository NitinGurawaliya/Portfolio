import { execSync } from "child_process"

function main() {
  execSync("git config core.hooksPath .githooks", {
    stdio: "inherit",
  })
  console.log("Git hooks path configured: .githooks")
}

main()
