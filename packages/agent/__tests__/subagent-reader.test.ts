import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readSubagents } from "../src/subagent-reader";
import { readdir, readFile } from "fs/promises";

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);

describe("readSubagents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when subagents directory does not exist", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toEqual([]);
  });

  it("reads subagent meta files", async () => {
    mockReaddir.mockResolvedValue([
      "agent-abc.meta.json",
      "agent-def.meta.json",
    ] as any);

    mockReadFile
      .mockResolvedValueOnce(
        JSON.stringify({
          id: "abc",
          agentType: "coder",
          description: "Working on auth module",
        })
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          id: "def",
          agentType: "reviewer",
          description: "Reviewing PR #42",
        })
      );

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "abc",
      agentType: "coder",
      description: "Working on auth module",
    });
    expect(result[1]).toEqual({
      id: "def",
      agentType: "reviewer",
      description: "Reviewing PR #42",
    });
  });

  it("only reads files matching agent-*.meta.json pattern", async () => {
    mockReaddir.mockResolvedValue([
      "agent-abc.meta.json",
      "other-file.json",
      "agent-def.txt",
      "readme.md",
      "session.json",
    ] as any);

    mockReadFile.mockResolvedValueOnce(
      JSON.stringify({ id: "abc", agentType: "coder", description: "test" })
    );

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toHaveLength(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
  });

  it("handles missing fields with defaults", async () => {
    mockReaddir.mockResolvedValue(["agent-abc.meta.json"] as any);
    mockReadFile.mockResolvedValueOnce(JSON.stringify({}));

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "",
      agentType: "unknown",
      description: "",
    });
  });

  it("skips malformed JSON files", async () => {
    mockReaddir.mockResolvedValue([
      "agent-good.meta.json",
      "agent-bad.meta.json",
    ] as any);

    mockReadFile
      .mockResolvedValueOnce(
        JSON.stringify({ id: "good", agentType: "coder", description: "OK" })
      )
      .mockResolvedValueOnce("not valid json");

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("good");
  });

  it("skips files that fail to read", async () => {
    mockReaddir.mockResolvedValue([
      "agent-ok.meta.json",
      "agent-fail.meta.json",
    ] as any);

    mockReadFile
      .mockResolvedValueOnce(
        JSON.stringify({ id: "ok", agentType: "coder", description: "Fine" })
      )
      .mockRejectedValueOnce(new Error("EACCES"));

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toHaveLength(1);
  });

  it("handles empty directory", async () => {
    mockReaddir.mockResolvedValue([] as any);

    const result = await readSubagents("/config", "session-1", "/project");
    expect(result).toEqual([]);
  });

  it("constructs correct directory path from cwd", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));

    await readSubagents("/config", "session-1", "/home/user/my project");
    // cwd: /home/user/my project -> home-user-my-project
    expect(mockReaddir).toHaveBeenCalledWith(
      "/config/projects/home-user-my-project/session-1/subagents"
    );
  });

  it("handles cwd with dots in path", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"));

    await readSubagents("/config", "s1", "/home/user/.config/project");
    // dots replaced with hyphens
    expect(mockReaddir).toHaveBeenCalledWith(
      "/config/projects/home-user--config-project/s1/subagents"
    );
  });
});
