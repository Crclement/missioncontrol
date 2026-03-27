import { homedir } from "node:os"
import { join } from "node:path"

export const DEFAULT_CONFIG_DIR = join(homedir(), ".claude")

export const DEFAULT_WS_PORT = 45557

export const POLL_INTERVAL_MS = 3000

export const DISCOVERY_INTERVAL_MS = 30000

export const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "claude-opus-4-6": 1_000_000,
  "claude-sonnet-4-6": 200_000,
  "claude-haiku-4-5": 200_000,
}

export const TOKEN_PRICING: Record<
  string,
  { inputPerToken: number; outputPerToken: number }
> = {
  "claude-opus-4-6": {
    inputPerToken: 15 / 1_000_000,
    outputPerToken: 75 / 1_000_000,
  },
  "claude-sonnet-4-6": {
    inputPerToken: 3 / 1_000_000,
    outputPerToken: 15 / 1_000_000,
  },
  "claude-haiku-4-5": {
    inputPerToken: 0.8 / 1_000_000,
    outputPerToken: 4 / 1_000_000,
  },
}
