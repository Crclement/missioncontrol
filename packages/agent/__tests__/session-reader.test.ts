import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readSessions } from "../src/session-reader";
import { readdir, readFile } from "fs/promises";

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);

describe("readSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: process.kill(pid, 0) succeeds (process is alive)
    vi.spyOn(process, "kill").mockImplementation(() => true);
  });

  it("returns empty array if sessions directory does not exist", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));

    const result = await readSessions("/home/user/.claude");
    expect(result).toEqual([]);
  });

  it("reads and returns sessions with alive processes", async () => {
    const session1 = {
      pid: 12345,
      sessionId: "abc-123",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
      name: "my-session",
    };
    const session2 = {
      pid: 12346,
      sessionId: "def-456",
      cwd: "/home/user/other-project",
      startedAt: Date.now(),
      kind: "headless",
      entrypoint: "api",
    };

    mockReaddir.mockResolvedValue(["abc-123.json", "def-456.json"] as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(session1))
      .mockResolvedValueOnce(JSON.stringify(session2));

    const result = await readSessions("/home/user/.claude");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(session1);
    expect(result[1]).toEqual(session2);
  });

  it("filters out non-JSON files", async () => {
    const session = {
      pid: 12345,
      sessionId: "abc-123",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
    };

    mockReaddir.mockResolvedValue([
      "abc-123.json",
      "readme.txt",
      ".DS_Store",
      "notes.md",
    ] as any);
    mockReadFile.mockResolvedValueOnce(JSON.stringify(session));

    const result = await readSessions("/home/user/.claude");
    expect(result).toHaveLength(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
  });

  it("skips sessions with dead processes", async () => {
    const aliveSession = {
      pid: 12345,
      sessionId: "alive-session",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
    };
    const deadSession = {
      pid: 99999,
      sessionId: "dead-session",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
    };

    mockReaddir.mockResolvedValue(["alive.json", "dead.json"] as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(aliveSession))
      .mockResolvedValueOnce(JSON.stringify(deadSession));

    vi.spyOn(process, "kill").mockImplementation((pid: number) => {
      if (pid === 99999) throw new Error("ESRCH");
      return true;
    });

    const result = await readSessions("/home/user/.claude");
    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe("alive-session");
  });

  it("skips files with malformed JSON", async () => {
    const validSession = {
      pid: 12345,
      sessionId: "valid",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
    };

    mockReaddir.mockResolvedValue(["valid.json", "broken.json"] as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(validSession))
      .mockResolvedValueOnce("not valid json {{{");

    const result = await readSessions("/home/user/.claude");
    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe("valid");
  });

  it("handles empty sessions directory", async () => {
    mockReaddir.mockResolvedValue([] as any);

    const result = await readSessions("/home/user/.claude");
    expect(result).toEqual([]);
  });

  it("handles file read errors for individual sessions", async () => {
    const validSession = {
      pid: 12345,
      sessionId: "valid",
      cwd: "/home/user/project",
      startedAt: Date.now(),
      kind: "interactive",
      entrypoint: "cli",
    };

    mockReaddir.mockResolvedValue(["valid.json", "unreadable.json"] as any);
    mockReadFile
      .mockResolvedValueOnce(JSON.stringify(validSession))
      .mockRejectedValueOnce(new Error("EACCES"));

    const result = await readSessions("/home/user/.claude");
    expect(result).toHaveLength(1);
  });
});
