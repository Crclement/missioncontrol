import { execSync, spawn } from "child_process"
import { writeFileSync } from "fs"

/**
 * Send a message to a Claude Code session by writing to its TTY device.
 * This simulates typing into the terminal where the session is running.
 */
export async function respondToSession(
  sessionId: string,
  configDir: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the PID for this session
    const sessionFiles = execSync(
      `cat "${configDir}/sessions/"*.json 2>/dev/null`,
      { encoding: "utf-8", timeout: 3000 }
    )

    let pid: number | undefined
    // Session files are concatenated, parse each JSON object
    const jsonPattern = /\{[^{}]*"sessionId"\s*:\s*"[^"]*"[^{}]*\}/g
    const matches = sessionFiles.match(jsonPattern) ?? []
    for (const match of matches) {
      try {
        const obj = JSON.parse(match)
        if (obj.sessionId === sessionId) {
          pid = obj.pid
          break
        }
      } catch { /* skip */ }
    }

    if (!pid) {
      return { success: false, error: `No PID found for session ${sessionId.slice(0, 8)}` }
    }

    // Find the TTY device for this PID
    let tty: string | undefined
    try {
      tty = execSync(
        `lsof -p ${pid} 2>/dev/null | grep /dev/ttys | head -1 | awk '{print $NF}'`,
        { encoding: "utf-8", timeout: 3000 }
      ).trim()
    } catch { /* */ }

    if (!tty) {
      return { success: false, error: `No TTY found for PID ${pid}` }
    }

    console.error(`[respond] Writing to ${tty} for PID ${pid}`)

    // Write the message to the TTY device + newline to submit
    // This simulates the user typing into that terminal
    try {
      writeFileSync(tty, message + "\n")
      return { success: true }
    } catch (err) {
      // If direct write fails, try via python
      try {
        execSync(
          `python3 -c "import os; fd=os.open('${tty}', os.O_WRONLY); os.write(fd, b'${message.replace(/'/g, "\\'")}\\n'); os.close(fd)"`,
          { timeout: 3000 }
        )
        return { success: true }
      } catch {
        return {
          success: false,
          error: `Cannot write to ${tty}: ${err instanceof Error ? err.message : String(err)}`,
        }
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
