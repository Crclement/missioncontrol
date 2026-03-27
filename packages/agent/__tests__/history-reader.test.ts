import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  open: vi.fn(),
}));

import { readRecentHistory } from "../src/history-reader";
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

describe("readRecentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when history file does not exist", async () => {
    mockOpen.mockRejectedValue(new Error("ENOENT"));

    const result = await readRecentHistory("/config", "session-1");
    expect(result).toEqual([]);
  });

  it("reads history entries matching the session ID", async () => {
    const content = [
      JSON.stringify({ sessionId: "session-1", type: "user", message: "Fix bug" }),
      JSON.stringify({ sessionId: "session-2", type: "user", message: "Other session" }),
      JSON.stringify({ sessionId: "session-1", type: "tool", tool: "Read", message: "/src/app.ts" }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "session-1");
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("[user] Fix bug");
    expect(result[1]).toBe("[tool] Read: /src/app.ts");
  });

  it("filters out entries from other sessions", async () => {
    const content = [
      JSON.stringify({ sessionId: "other-session", type: "user", message: "Hello" }),
      JSON.stringify({ sessionId: "other-session", type: "assistant", message: "Hi" }),
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "session-1");
    expect(result).toEqual([]);
  });

  it("handles entries with tool field", async () => {
    const content = JSON.stringify({
      sessionId: "s1",
      type: "tool_use",
      tool: "Edit",
      message: "Updated file.ts",
    });

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result[0]).toBe("[tool_use] Edit: Updated file.ts");
  });

  it("handles entries without message using text field", async () => {
    const content = JSON.stringify({
      sessionId: "s1",
      type: "user",
      text: "Alternative text field",
    });

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result[0]).toBe("[user] Alternative text field");
  });

  it("handles entries with no message or text", async () => {
    const content = JSON.stringify({
      sessionId: "s1",
      type: "heartbeat",
    });

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result[0]).toBe("[heartbeat]");
  });

  it("defaults type to 'unknown' when missing", async () => {
    const content = JSON.stringify({
      sessionId: "s1",
      message: "Something happened",
    });

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result[0]).toBe("[unknown] Something happened");
  });

  it("truncates long display strings to 200 characters", async () => {
    const longMessage = "x".repeat(300);
    const content = JSON.stringify({
      sessionId: "s1",
      type: "user",
      message: longMessage,
    });

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result[0].length).toBe(200);
  });

  it("skips malformed JSON lines", async () => {
    const content = [
      "not valid json",
      JSON.stringify({ sessionId: "s1", type: "user", message: "Hello" }),
      "{broken",
    ].join("\n");

    mockOpen.mockResolvedValue(createMockFileHandle(content) as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("[user] Hello");
  });

  it("handles empty file", async () => {
    mockOpen.mockResolvedValue(createMockFileHandle("") as any);

    const result = await readRecentHistory("/config", "s1");
    expect(result).toEqual([]);
  });

  it("opens the correct file path", async () => {
    mockOpen.mockRejectedValue(new Error("ENOENT"));

    await readRecentHistory("/home/user/.claude", "s1");
    expect(mockOpen).toHaveBeenCalledWith("/home/user/.claude/history.jsonl", "r");
  });

  it("closes file handle after reading", async () => {
    const handle = createMockFileHandle(
      JSON.stringify({ sessionId: "s1", type: "user", message: "test" })
    );
    mockOpen.mockResolvedValue(handle as any);

    await readRecentHistory("/config", "s1");
    expect(handle.close).toHaveBeenCalled();
  });
});
