import Anthropic from "@anthropic-ai/sdk"

let client: Anthropic | undefined
try {
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic()
  }
} catch {
  // SDK init can fail if key is malformed; leave client undefined
}

// Cache summaries across refreshes (module-level Map persists for process lifetime)
const summaryCache = new Map<string, { summary: string; fetchedAt: number }>()
const CACHE_TTL = 30_000
const API_TIMEOUT_MS = 5_000

export async function summarizeSession(
  sessionId: string,
  lastMessages: string[], // last 5-10 user+assistant messages as strings
  workType: string,
  lastToolUse?: string
): Promise<string> {
  try {
    const cached = summaryCache.get(sessionId)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.summary
    }

    if (!lastMessages || lastMessages.length === 0) {
      return "Ready to go"
    }

    if (!client) {
      // No API key or client init failed -- fall back to last user message
      return fallbackSummary(lastMessages, lastToolUse)
    }

    // Race the API call against a timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    try {
      const response = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 60,
          messages: [{
            role: "user",
            content: `Summarize what this coding session is doing in 8 words or less. Be specific about the task, not generic.\n\nRecent activity:\n${lastMessages.slice(-5).join('\n')}\n\nCurrent tool: ${lastToolUse ?? 'none'}\nWork type: ${workType}\n\nSummary:`
          }]
        },
        { signal: controller.signal }
      )

      clearTimeout(timeout)

      const summary = response.content[0]?.type === 'text'
        ? response.content[0].text.trim()
        : 'Working...'

      summaryCache.set(sessionId, { summary, fetchedAt: Date.now() })
      return summary
    } catch {
      clearTimeout(timeout)
      return fallbackSummary(lastMessages, lastToolUse)
    }
  } catch {
    // Outermost catch -- absolutely nothing escapes
    return fallbackSummary(lastMessages, lastToolUse)
  }
}

function fallbackSummary(
  lastMessages?: string[],
  lastToolUse?: string
): string {
  // Find the most recent user message — it best describes what the session is working on
  if (lastMessages && lastMessages.length > 0) {
    const userMessages = lastMessages.filter((m) => m.startsWith("User: "))
    if (userMessages.length > 0) {
      const last = userMessages[userMessages.length - 1].replace(/^User: /i, "")
      return last.length > 80 ? last.slice(0, 77) + "..." : last
    }
    // No user prefix found — try last message raw
    const last = lastMessages[lastMessages.length - 1].replace(/^(User|Assistant): /i, "")
    return last.length > 80 ? last.slice(0, 77) + "..." : last
  }
  if (lastToolUse) return `Using ${lastToolUse}`
  return "Ready to go"
}
