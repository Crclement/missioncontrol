import { execSync } from "child_process"

// Cache titles for 5 seconds to avoid hammering osascript
let titleCache: Map<number, { title: string; fetchedAt: number }> = new Map()
const CACHE_TTL_MS = 5000

export function getTerminalTitle(pid: number): string | undefined {
  // Check cache
  const cached = titleCache.get(pid)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.title
  }

  try {
    // Try Terminal.app first
    const result = execSync(
      `osascript -e 'tell application "System Events" to get name of every process whose unix id is ${pid}' 2>/dev/null`,
      { encoding: "utf-8", timeout: 2000 }
    ).trim()

    if (result) {
      titleCache.set(pid, { title: result, fetchedAt: Date.now() })
      return result
    }
  } catch {}

  try {
    // Try getting all Terminal.app window names and match
    const result = execSync(
      `osascript -e 'tell application "Terminal" to get name of every window' 2>/dev/null`,
      { encoding: "utf-8", timeout: 2000 }
    ).trim()

    if (result) {
      // Parse comma-separated list, find one containing relevant info
      const names = result.split(", ")
      // Store all names - we'll match by session later
      return names[0] // For now return first
    }
  } catch {}

  // Fallback: try to read the TTY title
  try {
    const tty = execSync(`lsof -p ${pid} 2>/dev/null | grep /dev/ttys | head -1 | awk '{print $NF}'`, {
      encoding: "utf-8",
      timeout: 2000,
    }).trim()

    if (tty) {
      titleCache.set(pid, { title: tty, fetchedAt: Date.now() })
      return tty
    }
  } catch {}

  return undefined
}

// Get all terminal window titles at once (more efficient than per-PID)
export function getAllTerminalTitles(): string[] {
  try {
    const result = execSync(
      `osascript -e 'tell application "Terminal" to get name of every window' 2>/dev/null`,
      { encoding: "utf-8", timeout: 3000 }
    ).trim()
    if (result) return result.split(", ")
  } catch {}

  try {
    // Try iTerm2
    const result = execSync(
      `osascript -e 'tell application "iTerm2" to get name of every window' 2>/dev/null`,
      { encoding: "utf-8", timeout: 3000 }
    ).trim()
    if (result) return result.split(", ")
  } catch {}

  return []
}
