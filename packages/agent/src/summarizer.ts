import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic() // auto-reads ANTHROPIC_API_KEY

// Cache summaries for 30 seconds per session
const summaryCache = new Map<string, { summary: string; fetchedAt: number }>()
const CACHE_TTL = 30_000

export async function summarizeSession(
  sessionId: string,
  lastMessages: string[], // last 5-10 user+assistant messages as strings
  workType: string,
  lastToolUse?: string
): Promise<string> {
  const cached = summaryCache.get(sessionId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.summary
  }

  if (lastMessages.length === 0) {
    return "Starting up..."
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      messages: [{
        role: "user",
        content: `Summarize what this coding session is doing in 8 words or less. Be specific about the task, not generic.\n\nRecent activity:\n${lastMessages.slice(-5).join('\n')}\n\nCurrent tool: ${lastToolUse ?? 'none'}\nWork type: ${workType}\n\nSummary:`
      }]
    })

    const summary = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : 'Working...'

    summaryCache.set(sessionId, { summary, fetchedAt: Date.now() })
    return summary
  } catch {
    return lastToolUse ? `Using ${lastToolUse}...` : 'Working...'
  }
}
