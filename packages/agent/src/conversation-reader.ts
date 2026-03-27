import { open } from "fs/promises";
import { join } from "path";
import type { ConversationState, TokenUsage } from "@missioncontrol/shared";

// Model pricing (per token, in USD)
const PRICING = {
  inputPerToken: 3 / 1_000_000,
  outputPerToken: 15 / 1_000_000,
  cacheCreationPerToken: 3.75 / 1_000_000,
  cacheReadPerToken: 0.3 / 1_000_000,
};

const CONTEXT_LIMIT = 200_000;

function cwdToProjectPath(cwd: string): string {
  return cwd
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/ /g, "-")
    .replace(/\./g, "-");
}

function extractJsonObjects(text: string): unknown[] {
  const objects: unknown[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      objects.push(JSON.parse(trimmed));
    } catch {
      // Partial line at beginning of chunk, skip
    }
  }

  return objects;
}

function defaultState(): ConversationState {
  return {
    lastUserMessage: "",
    lastAssistantText: "",
    lastMessageRole: "user",
    needsInput: true,
    messageCount: 0,
  };
}

export async function readConversation(
  configDir: string,
  sessionId: string,
  cwd: string
): Promise<ConversationState> {
  const projectPath = cwdToProjectPath(cwd);
  const filePath = join(configDir, "projects", projectPath, `${sessionId}.jsonl`);

  let fh;
  try {
    fh = await open(filePath, "r");
  } catch {
    return defaultState();
  }

  try {
    const stat = await fh.stat();
    const fileSize = stat.size;

    // Read only the last 50KB
    const readSize = Math.min(50 * 1024, fileSize);
    const position = fileSize - readSize;
    const buffer = Buffer.alloc(readSize);
    await fh.read(buffer, 0, readSize, position);

    const text = buffer.toString("utf-8");
    const objects = extractJsonObjects(text) as Record<string, unknown>[];

    let lastUserMessage = "";
    let lastAssistantText = "";
    let lastMessageRole: "user" | "assistant" = "user";
    let lastToolUse: string | undefined;
    let needsInput = true;
    let messageCount = 0;

    // Token usage accumulators
    let inputTokens = 0;
    let outputTokens = 0;
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;

    for (const obj of objects) {
      const type = obj.type as string | undefined;
      const role = obj.role as string | undefined;

      if (type === "user" || role === "user") {
        messageCount++;
        lastMessageRole = "user";
        // Extract text content
        const content = obj.content ?? obj.message;
        if (typeof content === "string") {
          lastUserMessage = content;
        } else if (Array.isArray(content)) {
          const textPart = (content as Record<string, unknown>[]).find(
            (c) => c.type === "text"
          );
          if (textPart && typeof textPart.text === "string") {
            lastUserMessage = textPart.text;
          }
        }
      }

      if (type === "assistant" || role === "assistant") {
        messageCount++;
        lastMessageRole = "assistant";
        lastToolUse = undefined;

        const stopReason = (obj.stop_reason ?? (obj as Record<string, unknown>).stopReason) as string | undefined;
        needsInput = stopReason === "end_turn";

        const content = obj.content ?? obj.message;
        if (typeof content === "string") {
          lastAssistantText = content;
        } else if (Array.isArray(content)) {
          for (const block of content as Record<string, unknown>[]) {
            if (block.type === "text" && typeof block.text === "string") {
              lastAssistantText = block.text;
            }
            if (block.type === "tool_use" && typeof block.name === "string") {
              lastToolUse = block.name;
            }
          }
        }

        // Extract token usage
        const usage = obj.usage as Record<string, number> | undefined;
        if (usage) {
          inputTokens += usage.input_tokens ?? 0;
          outputTokens += usage.output_tokens ?? 0;
          cacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
          cacheReadTokens += usage.cache_read_input_tokens ?? 0;
        }
      }
    }

    const totalTokens = inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;

    const estimatedCostUsd =
      inputTokens * PRICING.inputPerToken +
      outputTokens * PRICING.outputPerToken +
      cacheCreationTokens * PRICING.cacheCreationPerToken +
      cacheReadTokens * PRICING.cacheReadPerToken;

    const contextPercentUsed = CONTEXT_LIMIT > 0
      ? Math.min(100, ((inputTokens + cacheReadTokens) / CONTEXT_LIMIT) * 100)
      : 0;

    const tokenUsage: TokenUsage | undefined =
      totalTokens > 0
        ? {
            inputTokens,
            outputTokens,
            cacheCreationTokens,
            cacheReadTokens,
            totalTokens,
            estimatedCostUsd,
            burnRatePerMinute: 0, // Calculated by server with timing info
            contextPercentUsed,
          }
        : undefined;

    return {
      lastUserMessage: lastUserMessage.slice(0, 500),
      lastAssistantText: lastAssistantText.slice(0, 500),
      lastMessageRole,
      lastToolUse,
      needsInput,
      messageCount,
      tokenUsage,
    };
  } finally {
    await fh.close();
  }
}
