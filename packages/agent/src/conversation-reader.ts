import { open, type FileHandle } from "fs/promises";
import { join } from "path";
import type { ConversationState, TokenUsage } from "@missioncontrol/shared";

async function openWithRetry(filePath: string): Promise<FileHandle> {
  try {
    return await open(filePath, "r");
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EBUSY" || code === "EAGAIN") {
      // File is locked/busy, retry once after 100ms
      await new Promise((r) => setTimeout(r, 100));
      return await open(filePath, "r");
    }
    throw err;
  }
}

const PRICING = {
  inputPerToken: 3 / 1_000_000,
  outputPerToken: 15 / 1_000_000,
  cacheCreationPerToken: 3.75 / 1_000_000,
  cacheReadPerToken: 0.3 / 1_000_000,
};

const CONTEXT_LIMIT = 1_000_000;

function cwdToProjectPath(cwd: string): string {
  // Normalize: collapse double slashes, strip trailing slashes, then convert
  const normalized = cwd
    .replace(/\/+/g, "/")   // collapse multiple slashes
    .replace(/\/$/g, "");   // strip trailing slash
  return (
    "-" +
    normalized
      .replace(/^\//g, "")
      .replace(/\//g, "-")
      .replace(/ /g, "-")
      .replace(/\./g, "-")
  );
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
    needsInput: false,
    messageCount: 0,
    recentOutput: [],
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
    fh = await openWithRetry(filePath);
  } catch {
    return defaultState();
  }

  try {
    const stat = await fh.stat();
    const fileSize = stat.size;

    if (fileSize === 0) {
      return defaultState();
    }

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
    let needsInput = false;
    let messageCount = 0;
    const recentOutput: string[] = []; // rolling log of activity

    let inputTokens = 0;
    let outputTokens = 0;
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;

    for (const obj of objects) {
      const type = obj.type as string | undefined;

      // Skip non-message entries (file-history-snapshot, etc.)
      if (type !== "user" && type !== "assistant") continue;

      // The actual message payload is nested inside obj.message
      const msg = obj.message as Record<string, unknown> | undefined;

      if (type === "user") {
        messageCount++;
        lastMessageRole = "user";
        needsInput = false; // User just sent something, so not waiting

        // User content can be a string or nested in message.content
        const content = msg?.content ?? obj.content;
        if (typeof content === "string") {
          lastUserMessage = content;
          // Strip XML noise for display
          const clean = content.replace(/<[^>]+>[^]*?<\/[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
          if (clean.length > 5) {
            const line = clean;
            recentOutput.push(`> ${line}`);
          }
        } else if (Array.isArray(content)) {
          for (const part of content as Record<string, unknown>[]) {
            if (part.type === "text" && typeof part.text === "string") {
              lastUserMessage = part.text;
              const clean = (part.text as string).replace(/<[^>]+>[^]*?<\/[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
              if (clean.length > 5) {
                const line = clean;
                recentOutput.push(`> ${line}`);
              }
            }
          }
        }
      }

      if (type === "assistant") {
        messageCount++;
        lastMessageRole = "assistant";
        lastToolUse = undefined;

        // stop_reason is on the nested message object
        const stopReason = (
          msg?.stop_reason ?? msg?.stopReason ??
          obj.stop_reason ?? (obj as Record<string, unknown>).stopReason
        ) as string | undefined;

        // Only needs input when the assistant is done talking (end_turn)
        // NOT when it's using tools (tool_use) or still streaming
        needsInput = stopReason === "end_turn";

        const content = msg?.content ?? obj.content;
        if (typeof content === "string") {
          lastAssistantText = content;
          const trimmed = content.trim();
          if (trimmed.length > 0) {
            const line = trimmed;
            recentOutput.push(line);
          }
        } else if (Array.isArray(content)) {
          for (const block of content as Record<string, unknown>[]) {
            if (block.type === "text" && typeof block.text === "string") {
              lastAssistantText = block.text;
              const trimmed = (block.text as string).trim();
              if (trimmed.length > 0) {
                const line = trimmed;
                recentOutput.push(line);
              }
            }
            if (block.type === "tool_use" && typeof block.name === "string") {
              lastToolUse = block.name;
              needsInput = false;
              // Log tool usage with description
              const input = block.input as Record<string, unknown> | undefined;
              const desc = input?.description ?? input?.command ?? input?.pattern ?? input?.file_path ?? "";
              const descStr = typeof desc === "string" ? desc : "";
              const toolLine = descStr
                ? `● ${block.name}: ${descStr}`
                : `● ${block.name}`;
              recentOutput.push(toolLine);
            }
          }
        }

        // Extract token usage from the nested message
        const usage = (msg?.usage ?? obj.usage) as Record<string, number> | undefined;
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
            burnRatePerMinute: 0,
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
      recentOutput: recentOutput.slice(-8), // last 8 lines
    };
  } finally {
    await fh.close();
  }
}

export async function getRecentMessages(
  configDir: string,
  sessionId: string,
  cwd: string
): Promise<string[]> {
  const projectPath = cwdToProjectPath(cwd);
  const filePath = join(configDir, "projects", projectPath, `${sessionId}.jsonl`);

  let fh;
  try {
    fh = await openWithRetry(filePath);
  } catch {
    return [];
  }

  try {
    const stat = await fh.stat();
    const fileSize = stat.size;

    if (fileSize === 0) {
      return [];
    }

    // Read a larger tail to get enough messages
    const readSize = Math.min(100 * 1024, fileSize);
    const position = fileSize - readSize;
    const buffer = Buffer.alloc(readSize);
    await fh.read(buffer, 0, readSize, position);

    const text = buffer.toString("utf-8");
    const objects = extractJsonObjects(text) as Record<string, unknown>[];

    const messages: string[] = [];

    for (const obj of objects) {
      const type = obj.type as string | undefined;
      if (type !== "user" && type !== "assistant") continue;

      const msg = obj.message as Record<string, unknown> | undefined;
      const content = msg?.content ?? obj.content;

      let extracted = "";
      if (typeof content === "string") {
        extracted = content;
      } else if (Array.isArray(content)) {
        for (const block of content as Record<string, unknown>[]) {
          if (block.type === "text" && typeof block.text === "string") {
            extracted = block.text;
          }
        }
      }

      if (extracted) {
        const prefix = type === "user" ? "User: " : "Assistant: ";
        messages.push(prefix + extracted.slice(0, 200));
      }
    }

    // Return the last 10 messages
    return messages.slice(-10);
  } finally {
    await fh.close();
  }
}
