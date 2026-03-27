import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before imports
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(() => "/home/testuser"),
}));

import { discoverConfigDirs } from "../src/discovery";
import { execSync } from "child_process";
import { readFile } from "fs/promises";

const mockExecSync = vi.mocked(execSync);
const mockReadFile = vi.mocked(readFile);

describe("discoverConfigDirs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always includes the default ~/.claude directory", async () => {
    mockExecSync.mockReturnValue("");
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const dirs = await discoverConfigDirs();
    expect(dirs).toContain("/home/testuser/.claude");
    expect(dirs.size).toBe(1);
  });

  it("discovers config dirs from running claude processes", async () => {
    mockExecSync.mockReturnValue(
      [
        "  PID COMMAND",
        "12345 /usr/bin/claude --session abc CLAUDE_CONFIG_DIR=/custom/config",
        "12346 /usr/bin/node some-other-process",
        "12347 /usr/bin/claude --session def CLAUDE_CONFIG_DIR=/another/config",
      ].join("\n")
    );
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const dirs = await discoverConfigDirs();
    expect(dirs).toContain("/home/testuser/.claude");
    expect(dirs).toContain("/custom/config");
    expect(dirs).toContain("/another/config");
    expect(dirs.size).toBe(3);
  });

  it("ignores non-claude processes", async () => {
    mockExecSync.mockReturnValue(
      [
        "  PID COMMAND",
        "12345 /usr/bin/node server.js APP_CONFIG_DIR=/should/ignore",
        "12346 /usr/bin/vim file.ts",
      ].join("\n")
    );
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const dirs = await discoverConfigDirs();
    expect(dirs.size).toBe(1);
    expect(dirs).toContain("/home/testuser/.claude");
  });

  it("reads additional dirs from missioncontrol config", async () => {
    mockExecSync.mockReturnValue("");
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        additionalConfigDirs: ["/extra/dir1", "/extra/dir2"],
      })
    );

    const dirs = await discoverConfigDirs();
    expect(dirs).toContain("/home/testuser/.claude");
    expect(dirs).toContain("/extra/dir1");
    expect(dirs).toContain("/extra/dir2");
    expect(dirs.size).toBe(3);
  });

  it("ignores non-string entries in additionalConfigDirs", async () => {
    mockExecSync.mockReturnValue("");
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        additionalConfigDirs: ["/valid/dir", 123, null, true],
      })
    );

    const dirs = await discoverConfigDirs();
    expect(dirs).toContain("/valid/dir");
    expect(dirs.size).toBe(2);
  });

  it("handles ps command failure gracefully", async () => {
    mockExecSync.mockImplementation(() => {
      throw new Error("ps command not found");
    });
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const dirs = await discoverConfigDirs();
    expect(dirs.size).toBe(1);
    expect(dirs).toContain("/home/testuser/.claude");
  });

  it("handles malformed JSON config gracefully", async () => {
    mockExecSync.mockReturnValue("");
    mockReadFile.mockResolvedValue("not valid json {{{");

    const dirs = await discoverConfigDirs();
    expect(dirs.size).toBe(1);
    expect(dirs).toContain("/home/testuser/.claude");
  });

  it("handles config without additionalConfigDirs field", async () => {
    mockExecSync.mockReturnValue("");
    mockReadFile.mockResolvedValue(JSON.stringify({ otherSetting: true }));

    const dirs = await discoverConfigDirs();
    expect(dirs.size).toBe(1);
  });

  it("deduplicates directories across all sources", async () => {
    mockExecSync.mockReturnValue(
      "12345 claude --session abc CLAUDE_CONFIG_DIR=/home/testuser/.claude\n"
    );
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        additionalConfigDirs: ["/home/testuser/.claude"],
      })
    );

    const dirs = await discoverConfigDirs();
    expect(dirs.size).toBe(1);
  });
});
