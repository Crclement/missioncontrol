import { describe, expect, it } from "vitest"
import { classifyWork } from "../work-classifier.js"
import type { ConversationState, SubAgent } from "../types.js"

function makeConversation(overrides: Partial<ConversationState> = {}): ConversationState {
  return {
    lastUserMessage: "",
    lastAssistantText: "",
    lastMessageRole: "assistant",
    needsInput: false,
    messageCount: 1,
    ...overrides,
  }
}

describe("classifyWork", () => {
  it("returns idle when needsInput is true and no recent tool use", () => {
    const conv = makeConversation({ needsInput: true })
    expect(classifyWork(conv, [])).toBe("idle")
  })

  it("returns exploring when an Explore sub-agent is present", () => {
    const conv = makeConversation({ lastToolUse: "Bash" })
    const agents: SubAgent[] = [
      { id: "1", agentType: "Explore", description: "Searching codebase" },
    ]
    expect(classifyWork(conv, agents)).toBe("exploring")
  })

  it("returns planning when a Plan sub-agent is present", () => {
    const conv = makeConversation()
    const agents: SubAgent[] = [
      { id: "2", agentType: "Plan", description: "Creating plan" },
    ]
    expect(classifyWork(conv, agents)).toBe("planning")
  })

  it("returns coding when lastToolUse is Edit", () => {
    const conv = makeConversation({ lastToolUse: "Edit" })
    expect(classifyWork(conv, [])).toBe("coding")
  })

  it("returns coding when lastToolUse is Write", () => {
    const conv = makeConversation({ lastToolUse: "Write" })
    expect(classifyWork(conv, [])).toBe("coding")
  })

  it("returns debugging when lastToolUse is Bash and text contains debug keywords", () => {
    const conv = makeConversation({
      lastToolUse: "Bash",
      lastAssistantText: "Running the test suite to check for errors",
    })
    expect(classifyWork(conv, [])).toBe("debugging")
  })

  it("returns running when lastToolUse is Bash without debug keywords", () => {
    const conv = makeConversation({
      lastToolUse: "Bash",
      lastAssistantText: "Installing dependencies",
    })
    expect(classifyWork(conv, [])).toBe("running")
  })

  it("returns reviewing when lastToolUse is Read", () => {
    const conv = makeConversation({ lastToolUse: "Read" })
    expect(classifyWork(conv, [])).toBe("reviewing")
  })

  it("returns reviewing when lastToolUse is Grep", () => {
    const conv = makeConversation({ lastToolUse: "Grep" })
    expect(classifyWork(conv, [])).toBe("reviewing")
  })

  it("returns reviewing when lastToolUse is Glob", () => {
    const conv = makeConversation({ lastToolUse: "Glob" })
    expect(classifyWork(conv, [])).toBe("reviewing")
  })

  it("defaults to coding when no other conditions match", () => {
    const conv = makeConversation({ lastToolUse: "SomeUnknownTool" })
    expect(classifyWork(conv, [])).toBe("coding")
  })

  it("prioritises sub-agent type over tool use", () => {
    const conv = makeConversation({ lastToolUse: "Edit" })
    const agents: SubAgent[] = [
      { id: "3", agentType: "Explore", description: "Looking around" },
    ]
    expect(classifyWork(conv, agents)).toBe("exploring")
  })
})
