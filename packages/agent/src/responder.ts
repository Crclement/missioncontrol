import { spawn, execSync } from "child_process"

// Discover the correct claude binary
let claudeBin: string | undefined

function findClaudeBin(): string {
  if (claudeBin) return claudeBin

  // Check common locations
  const candidates = ["claude", "claude-crc", "claude-le"]
  for (const bin of candidates) {
    try {
      execSync(`which ${bin}`, { encoding: "utf-8", timeout: 2000 })
      claudeBin = bin
      return bin
    } catch {
      // not found
    }
  }

  // Fallback: check if there's a CLAUDE_CONFIG_DIR env hint
  claudeBin = "claude"
  return claudeBin
}

export async function respondToSession(
  sessionId: string,
  configDir: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const bin = findClaudeBin()

      console.error(`[respond] Sending to ${sessionId} via ${bin} --resume --print`)

      const child = spawn(bin, ["--resume", sessionId, "--print", "--yes", "-p", message], {
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
          console.error(`[respond] Success: ${stdout.slice(0, 100)}`)
          resolve({ success: true })
        } else {
          console.error(`[respond] Failed (code ${code}): ${stderr.slice(0, 200)}`)
          resolve({
            success: false,
            error: stderr.trim() || `Process exited with code ${code}`,
          })
        }
      })

      // Timeout after 120 seconds
      setTimeout(() => {
        child.kill("SIGTERM")
        resolve({ success: false, error: "Response timed out after 120s" })
      }, 120_000)
    } catch (err) {
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}
