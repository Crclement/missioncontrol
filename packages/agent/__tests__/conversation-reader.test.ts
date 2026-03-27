import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  open: vi.fn(),
}));

import { readConversation } from "../src/conversation-reader";
import { open } from "fs/promises";

const mockOpen = vi.mocked(open);

function createMockFileHandle(content: string) {
  const buffer = Buffer.from(content);
  return {
    stat: vi.fn().mockResolvedValue({ size: buffer.length }),
    read: vi.fn().mockImplementation(
      (buf: Buffer, offset: number, length: number, position: number) => {
        buffer.copy(buf, 0, position, position + length);
        return Promise.resolve({ bytesRead: length, buffer: buf });
      }
    ),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

describe("readConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default state when file does not exist", async () => {
    mockOpen.mockRejectedValue(new Error("ENOENT"));

    const result = await readConversation("/config", "session-1", "/project");
    expect(result).toEqual({
      lastUserMessage: "",
      lastAssistantText: "",
      lastMessageRole: "user",
      needsInput: false,
      messageCount: 0,
    });
  });

  it("parses user and assistant messages from JSONL", async () => {
    const content = [
      JSON.stringify({ type: "user", content: "Fix the bug in auth.ts" }),
      JSON.stringify({
        type: "assistant",
        content: [{ type: "text", text: "I found the issue in the auth module." }],
        stop_reason: "end_turn",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "session-1", "/project");
    expect(result.lastUserMessage).toBe("Fix the bug in auth.ts");
    expect(result.lastAssistantText).toBe("I found the issue in the auth module.");
    expect(result.lastMessageRole).toBe("assistant");
    expect(result.needsInput).toBe(true);
    expect(result.messageCount).toBe(2);
  });

  it("detects needsInput=true when stop_reason is end_turn", async () => {
    const content = [
      JSON.stringify({ type: "user", content: "What files are in this project?" }),
      JSON.stringify({
        type: "assistant",
        content: "Here are the files.",
        stop_reason: "end_turn",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.needsInput).toBe(true);
  });

  it("detects needsInput=false when stop_reason is not end_turn", async () => {
    const content = [
      JSON.stringify({ type: "user", content: "Refactor the code" }),
      JSON.stringify({
        type: "assistant",
        content: [
          { type: "text", text: "Let me look at the code." },
          { type: "tool_use", name: "Read", id: "123" },
        ],
        stop_reason: "tool_use",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.needsInput).toBe(false);
    expect(result.lastToolUse).toBe("Read");
  });

  it("extracts token usage and computes cost", async () => {
    const content = [
      JSON.stringify({ type: "user", content: "Hello" }),
      JSON.stringify({
        type: "assistant",
        content: "Hi there!",
        stop_reason: "end_turn",
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          cache_creation_input_tokens: 200,
          cache_read_input_tokens: 80,
        },
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.tokenUsage).toBeDefined();
    expect(result.tokenUsage!.inputTokens).toBe(100);
    expect(result.tokenUsage!.outputTokens).toBe(50);
    expect(result.tokenUsage!.cacheCreationTokens).toBe(200);
    expect(result.tokenUsage!.cacheReadTokens).toBe(80);
    expect(result.tokenUsage!.totalTokens).toBe(430);
    expect(result.tokenUsage!.estimatedCostUsd).toBeGreaterThan(0);
  });

  it("computes context percentage used correctly", async () => {
    const content = [
      JSON.stringify({
        type: "assistant",
        content: "response",
        stop_reason: "end_turn",
        usage: {
          input_tokens: 100_000,
          output_tokens: 1000,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 50_000,
        },
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    // contextPercentUsed = min(100, ((100000 + 50000) / 1_000_000) * 100) = 15%
    expect(result.tokenUsage!.contextPercentUsed).toBe(15);
  });

  it("caps context percentage at 100", async () => {
    const content = [
      JSON.stringify({
        type: "assistant",
        content: "response",
        stop_reason: "end_turn",
        usage: {
          input_tokens: 900_000,
          output_tokens: 5000,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 200_000,
        },
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.tokenUsage!.contextPercentUsed).toBe(100);
  });

  it("handles array content with text parts for user messages", async () => {
    const content = [
      JSON.stringify({
        type: "user",
        content: [
          { type: "text", text: "Please review this code" },
          { type: "image", data: "base64..." },
        ],
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.lastUserMessage).toBe("Please review this code");
  });

  it("truncates long messages to 500 characters", async () => {
    const longMessage = "x".repeat(1000);
    const content = [
      JSON.stringify({ type: "user", content: longMessage }),
      JSON.stringify({
        type: "assistant",
        content: longMessage,
        stop_reason: "end_turn",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.lastUserMessage.length).toBe(500);
    expect(result.lastAssistantText.length).toBe(500);
  });

  it("handles empty JSONL file", async () => {
    mockOpen.mockResolvedValue(createMockFileHandle("") as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.messageCount).toBe(0);
    expect(result.needsInput).toBe(false);
  });

  it("skips malformed JSON lines", async () => {
    const content = [
      "not valid json",
      JSON.stringify({ type: "user", content: "Hello" }),
      "{broken",
      JSON.stringify({
        type: "assistant",
        content: "Hi!",
        stop_reason: "end_turn",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.messageCount).toBe(2);
    expect(result.lastUserMessage).toBe("Hello");
    expect(result.lastAssistantText).toBe("Hi!");
  });

  it("accumulates tokens across multiple assistant messages", async () => {
    const content = [
      JSON.stringify({
        type: "assistant",
        content: "First response",
        stop_reason: "tool_use",
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
      JSON.stringify({
        type: "assistant",
        content: "Second response",
        stop_reason: "end_turn",
        usage: { input_tokens: 200, output_tokens: 100 },
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.tokenUsage!.inputTokens).toBe(300);
    expect(result.tokenUsage!.outputTokens).toBe(150);
    expect(result.tokenUsage!.totalTokens).toBe(450);
  });

  it("converts cwd to project path correctly", async () => {
    mockOpen.mockRejectedValue(new Error("ENOENT"));

    // The function prepends "-" and replaces leading / with empty, then remaining / with -
    await readConversation("/config", "session-1", "/home/user/my project");
    expect(mockOpen).toHaveBeenCalledWith(
      "/config/projects/-home-user-my-project/session-1.jsonl",
      "r"
    );
  });

  it("returns no tokenUsage when there are zero tokens", async () => {
    const content = [
      JSON.stringify({ type: "user", content: "Hello" }),
      JSON.stringify({
        type: "assistant",
        content: "Hi!",
        stop_reason: "end_turn",
      }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readConversation("/config", "s1", "/project");
    expect(result.tokenUsage).toBeUndefined();
  });

  it("closes the file handle even on error", async () => {
    const handle = createMockFileHandle("");
    handle.stat.mockRejectedValue(new Error("stat failed"));
    mockOpen.mockResolvedValue(handle as any);

    // The function should still close the handle via finally
    await expect(
      readConversation("/config", "s1", "/project")
    ).rejects.toThrow();
    expect(handle.close).toHaveBeenCalled();
  });
});
