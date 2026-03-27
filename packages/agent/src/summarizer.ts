import Anthropic from "@anthropic-ai/sdk"

let client: Anthropic | undefined
try {
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic()
  }
} catch {
  // SDK init can fail if key is malformed
}

const summaryCache = new Map<string, { summary: string; fetchedAt: number }>()
const CACHE_TTL = 30_000
const API_TIMEOUT_MS = 5_000

/**
 * Clean raw messages: strip XML tags, system-reminders, task-notifications,
 * and other noise that makes summaries useless.
 */
function cleanMessages(messages: string[]): string[] {
  return messages
    .map((m) => {
      // Strip leading "User: " or "Assistant: " prefix
      let cleaned = m.replace(/^(User|Assistant): /i, "")
      // Remove XML-like blocks (task-notifications, system-reminders)
      cleaned = cleaned.replace(/<[^>]+>[^]*?<\/[^>]+>/g, "").trim()
      cleaned = cleaned.replace(/<[^>]+\/>/g, "").trim()
      // Remove lines that are just XML tags
      cleaned = cleaned
        .split("\n")
        .filter((line) => !line.trim().startsWith("<") && line.trim().length > 0)
        .join("\n")
        .trim()
      return cleaned
    })
    .filter((m) => m.length > 5) // Drop empty/tiny fragments
}

/**
 * Build a useful summary from whatever data we have.
 * Priority:
 * 1. AI summary (if API key set and messages are meaningful)
 * 2. Last real user request (stripped of noise)
 * 3. Last assistant output (what was done)
 * 4. Tool-based description
 * 5. "Ready to go"
 */
export async function summarizeSession(
  sessionId: string,
  lastMessages: string[],
  workType: string,
  lastToolUse?: string,
  lastUserMessage?: string,
  lastAssistantText?: string
): Promise<string> {
  try {
    const cached = summaryCache.get(sessionId)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.summary
    }

    // Clean the messages first
    const cleaned = cleanMessages(lastMessages)

    // Try local summary first — it's instant and often good enough
    const local = buildLocalSummary(cleaned, lastToolUse, lastUserMessage, lastAssistantText)

    // Only call API if we have meaningful content AND a client
    if (client && cleaned.length >= 2) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

        const response = await client.messages.create(
          {
            model: "claude-haiku-4-5-20251001",
            max_tokens: 40,
            messages: [{
              role: "user",
              content: `You are summarizing a Claude Code session for a dashboard. Write a 6-10 word status of what this session is working on. Be specific. No fluff.\n\nLast user request: ${cleanText(lastUserMessage, 200)}\nLast assistant action: ${cleanText(lastAssistantText, 200)}\nActive tool: ${lastToolUse ?? "none"}\nActivity: ${cleaned.slice(-3).join(" | ")}\n\nStatus:`
            }]
          },
          { signal: controller.signal }
        )

        clearTimeout(timeout)

        const summary = response.content[0]?.type === "text"
          ? response.content[0].text.trim().replace(/^["']|["']$/g, "")
          : local

        summaryCache.set(sessionId, { summary, fetchedAt: Date.now() })
        return summary
      } catch {
        // API failed — use local summary
      }
    }

    summaryCache.set(sessionId, { summary: local, fetchedAt: Date.now() })
    return local
  } catch {
    return "Ready to go"
  }
}

function cleanText(text: string | undefined, maxLen: number): string {
  if (!text) return "(none)"
  // Strip XML
  let cleaned = text.replace(/<[^>]+>[^]*?<\/[^>]+>/g, "").trim()
  cleaned = cleaned.replace(/<[^>]+>/g, "").trim()
  if (cleaned.length === 0) return "(none)"
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen - 3) + "..." : cleaned
}

function buildLocalSummary(
  cleanedMessages: string[],
  lastToolUse?: string,
  lastUserMessage?: string,
  lastAssistantText?: string
): string {
  // Best source: the actual user request (what they asked for)
  if (lastUserMessage) {
    const clean = cleanText(lastUserMessage, 80)
    if (clean !== "(none)" && clean.length > 10) return clean
  }

  // Second: assistant's last text output (what was done)
  if (lastAssistantText) {
    const clean = cleanText(lastAssistantText, 80)
    if (clean !== "(none)" && clean.length > 10) return clean
  }

  // Third: last meaningful cleaned message
  if (cleanedMessages.length > 0) {
    const last = cleanedMessages[cleanedMessages.length - 1]
    return last.length > 80 ? last.slice(0, 77) + "..." : last
  }

  // Fourth: tool description
  if (lastToolUse) {
    const tools: Record<string, string> = {
      Edit: "Editing files",
      Write: "Writing files",
      Read: "Reading code",
      Bash: "Running commands",
      Grep: "Searching codebase",
      Glob: "Finding files",
      Agent: "Running subagent",
    }
    return tools[lastToolUse] ?? `Using ${lastToolUse}`
  }

  return "Ready to go"
}
