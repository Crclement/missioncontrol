import { execSync } from "child_process"

// Cache titles for 5 seconds to avoid hammering osascript
const titleCache: Map<number, { title: string | undefined; fetchedAt: number }> = new Map()
const CACHE_TTL_MS = 5000

export function getTerminalTitle(pid: number): string | undefined {
  // Check cache
  const cached = titleCache.get(pid)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.title
  }

  let title: string | undefined

  // 1. Try getting the process name via System Events (works for any app)
  try {
    const result = execSync(
      `osascript -e 'tell application "System Events" to get name of every process whose unix id is ${pid}' 2>/dev/null`,
      { encoding: "utf-8", timeout: 2000 }
    ).trim()

    if (result) {
      title = result
    }
  } catch {
    // osascript timeout or not available
  }

  // 2. Try Terminal.app window names
  if (!title) {
    try {
      const result = execSync(
        `osascript -e 'tell application "Terminal" to get name of every window' 2>/dev/null`,
        { encoding: "utf-8", timeout: 2000 }
      ).trim()

      if (result) {
        const names = result.split(", ")
        title = names[0]
      }
    } catch {
      // Terminal.app not running or not available
    }
  }

  // 3. Try iTerm2 window names
  if (!title) {
    try {
      const result = execSync(
        `osascript -e 'tell application "iTerm2" to get name of every window' 2>/dev/null`,
        { encoding: "utf-8", timeout: 2000 }
      ).trim()

      if (result) {
        const names = result.split(", ")
        title = names[0]
      }
    } catch {
      // iTerm2 not running or not available
    }
  }

  // 4. Fallback: get process name via ps (works for any terminal emulator)
  if (!title) {
    try {
      const result = execSync(
        `ps -p ${pid} -o comm= 2>/dev/null`,
        { encoding: "utf-8", timeout: 1000 }
      ).trim()

      if (result) {
        // Extract just the binary name (strip path)
        title = result.split("/").pop() || result
      }
    } catch {
      // ps failed
    }
  }

  titleCache.set(pid, { title, fetchedAt: Date.now() })
  return title
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
