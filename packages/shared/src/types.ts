export interface RawSession {
  pid: number
  sessionId: string
  cwd: string
  startedAt: number
  kind: string
  entrypoint: string
  name?: string
}

export interface GitInfo {
  repo: string
  branch: string
  remote: string
  isPersonal: boolean
  org?: string
}

export interface SubAgent {
  id: string
  agentType: string
  description: string
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  totalTokens: number
  estimatedCostUsd: number
  burnRatePerMinute: number
  contextPercentUsed: number
}

export interface ConversationState {
  lastUserMessage: string
  lastAssistantText: string
  lastMessageRole: "user" | "assistant"
  lastToolUse?: string
  needsInput: boolean
  messageCount: number
  tokenUsage?: TokenUsage
  /** Rolling log of recent activity lines for live terminal display */
  recentOutput: string[]
}

export type WorkType =
  | "coding"
  | "exploring"
  | "planning"
  | "debugging"
  | "idle"
  | "running"
  | "reviewing"

export interface EnrichedSession {
  pid: number
  sessionId: string
  cwd: string
  startedAt: number
  name?: string
  terminalTitle?: string
  configDir: string
  alive: boolean
  git?: GitInfo
  conversation: ConversationState
  subagents: SubAgent[]
  workType: WorkType
  creature: string
  summary?: string
}

export type WSMessage =
  | { type: "sessions"; data: EnrichedSession[] }
  | { type: "session-update"; data: EnrichedSession }
  | { type: "session-removed"; pid: number }
  | { type: "respond"; sessionId: string; configDir: string; message: string }
