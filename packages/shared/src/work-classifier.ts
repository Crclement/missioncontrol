import type { ConversationState, SubAgent, WorkType } from "./types.js"

const DEBUG_KEYWORDS = /\b(test|debug|error|fail|assert|exception|stack\s?trace|bug|broken|crash)\b/i

export function classifyWork(
  conversation: ConversationState,
  subagents: SubAgent[],
): WorkType {
  // Idle: needs input and no recent activity
  if (conversation.needsInput && !conversation.lastToolUse) {
    return "idle"
  }

  // Sub-agent overrides
  if (subagents.some((a) => a.agentType === "Explore")) {
    return "exploring"
  }
  if (subagents.some((a) => a.agentType === "Plan")) {
    return "planning"
  }

  // Tool-based classification
  const tool = conversation.lastToolUse

  if (tool === "Edit" || tool === "Write") {
    return "coding"
  }

  if (tool === "Bash") {
    if (DEBUG_KEYWORDS.test(conversation.lastAssistantText)) {
      return "debugging"
    }
    return "running"
  }

  if (tool === "Read" || tool === "Grep" || tool === "Glob") {
    return "reviewing"
  }

  // Default
  return "coding"
}
