import { spawn, execSync } from "child_process"

// Find the actual claude binary (not shell aliases)
let claudeBinPath: string | undefined

function findClaudeBin(): string {
  if (claudeBinPath) return claudeBinPath

  // Check the direct binary location first
  const directPaths = [
    "/Users/chrisclement/.local/bin/claude",
    `${process.env.HOME}/.local/bin/claude`,
    "/usr/local/bin/claude",
  ]

  for (const p of directPaths) {
    try {
      execSync(`test -x "${p}"`, { timeout: 1000 })
      claudeBinPath = p
      return p
    } catch {
      // not found
    }
  }

  // Fallback: use `which` to find it (may find alias wrapper)
  try {
    const result = execSync("which claude", { encoding: "utf-8", timeout: 2000 }).trim()
    if (result) {
      claudeBinPath = result
      return result
    }
  } catch {
    // not found
  }

  claudeBinPath = "claude"
  return claudeBinPath
}

export async function respondToSession(
  sessionId: string,
  configDir: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const bin = findClaudeBin()

      console.error(`[respond] ${bin} --resume ${sessionId.slice(0, 8)}... CLAUDE_CONFIG_DIR=${configDir}`)

      const child = spawn(bin, [
        "--resume", sessionId,
        "--print",
        "--dangerously-skip-permissions",
        "-p", message,
      ], {
        env: {
          ...process.env,
          CLAUDE_CONFIG_DIR: configDir,
        },
        stdio: ["pipe", "pipe", "pipe"],
      })

      let stdout = ""
      let stderr = ""

      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString()
      })

      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString()
      })

      child.on("error", (err) => {
        console.error(`[respond] spawn error: ${err.message}`)
        resolve({ success: false, error: err.message })
      })

      child.on("close", (code) => {
        if (code === 0) {
          console.error(`[respond] OK (${stdout.length} chars)`)
          resolve({ success: true })
        } else {
          console.error(`[respond] FAIL code=${code}: ${stderr.slice(0, 200)}`)
          resolve({
            success: false,
            error: stderr.trim() || `exit code ${code}`,
          })
        }
      })

      setTimeout(() => {
        child.kill("SIGTERM")
        resolve({ success: false, error: "timeout 120s" })
      }, 120_000)
    } catch (err) {
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}
