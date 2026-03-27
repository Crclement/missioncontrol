import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";

const mockExecSync = vi.mocked(execSync);

describe("getGitInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  function setupExecSync(responses: Record<string, string>) {
    mockExecSync.mockImplementation((cmd: string) => {
      for (const [pattern, result] of Object.entries(responses)) {
        if (cmd.includes(pattern)) return result;
      }
      throw new Error(`Unexpected command: ${cmd}`);
    });
  }

  async function loadGetGitInfo() {
    const mod = await import("../src/git-reader");
    return mod.getGitInfo;
  }

  it("returns git info for SSH remote", async () => {
    setupExecSync({
      "branch --show-current": "feature/my-branch",
      "remote get-url origin": "git@github.com:MyOrg/my-repo.git",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project");
    expect(info).toEqual({
      repo: "my-repo",
      branch: "feature/my-branch",
      remote: "git@github.com:MyOrg/my-repo.git",
      isPersonal: false,
      org: "MyOrg",
    });
  });

  it("returns git info for HTTPS remote", async () => {
    setupExecSync({
      "branch --show-current": "main",
      "remote get-url origin": "https://github.com/SomeOrg/some-repo.git",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project");
    expect(info).toEqual({
      repo: "some-repo",
      branch: "main",
      remote: "https://github.com/SomeOrg/some-repo.git",
      isPersonal: false,
      org: "SomeOrg",
    });
  });

  it("detects personal repos when org matches username", async () => {
    setupExecSync({
      "branch --show-current": "main",
      "remote get-url origin": "git@github.com:testuser/my-repo.git",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project");
    expect(info?.isPersonal).toBe(true);
  });

  it("case-insensitive comparison for personal repo detection", async () => {
    setupExecSync({
      "branch --show-current": "main",
      "remote get-url origin": "git@github.com:TestUser/my-repo.git",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project");
    expect(info?.isPersonal).toBe(true);
  });

  it("handles repos without a remote", async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (typeof cmd === "string" && cmd.includes("branch --show-current")) return "main";
      if (typeof cmd === "string" && cmd.includes("remote get-url")) throw new Error("No remote");
      if (typeof cmd === "string" && cmd.includes("git config")) return "testuser";
      return "";
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/local-repo");
    expect(info).toBeDefined();
    expect(info?.repo).toBe("local-repo");
    expect(info?.remote).toBe("");
    expect(info?.isPersonal).toBe(false);
  });

  it("returns undefined for non-git directories", async () => {
    mockExecSync.mockImplementation(() => {
      throw new Error("fatal: not a git repository");
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/not-a-repo");
    expect(info).toBeUndefined();
  });

  it("falls back to directory name for repo when no remote", async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (typeof cmd === "string" && cmd.includes("branch --show-current")) return "main";
      if (typeof cmd === "string" && cmd.includes("remote get-url")) throw new Error("No remote");
      if (typeof cmd === "string" && cmd.includes("git config")) return "";
      return "";
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/projects/cool-project");
    expect(info?.repo).toBe("cool-project");
  });

  it("parses SSH remote without .git suffix", async () => {
    setupExecSync({
      "branch --show-current": "dev",
      "remote get-url origin": "git@github.com:MyOrg/my-repo",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project2");
    expect(info?.repo).toBe("my-repo");
    expect(info?.org).toBe("MyOrg");
  });

  it("parses HTTPS remote without .git suffix", async () => {
    setupExecSync({
      "branch --show-current": "dev",
      "remote get-url origin": "https://github.com/Org/repo-name",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project3");
    expect(info?.repo).toBe("repo-name");
    expect(info?.org).toBe("Org");
  });

  it("handles empty git username gracefully", async () => {
    mockExecSync.mockImplementation((cmd: string) => {
      if (typeof cmd === "string" && cmd.includes("branch --show-current")) return "main";
      if (typeof cmd === "string" && cmd.includes("remote get-url"))
        return "git@github.com:Org/repo.git";
      if (typeof cmd === "string" && cmd.includes("git config")) throw new Error("not set");
      return "";
    });

    const getGitInfo = await loadGetGitInfo();
    const info = await getGitInfo("/home/user/project4");
    expect(info?.isPersonal).toBe(false);
  });

  it("uses cache when branch has not changed within TTL", async () => {
    setupExecSync({
      "branch --show-current": "main",
      "remote get-url origin": "git@github.com:Org/repo.git",
      "git config --global user.name": "testuser",
    });

    const getGitInfo = await loadGetGitInfo();
    const info1 = await getGitInfo("/home/user/cached-project");
    const info2 = await getGitInfo("/home/user/cached-project");

    expect(info1).toEqual(info2);
    // branch --show-current called twice, but remote only once (cached)
    const branchCalls = mockExecSync.mock.calls.filter(
      (c) => typeof c[0] === "string" && c[0].includes("branch --show-current")
    );
    const remoteCalls = mockExecSync.mock.calls.filter(
      (c) => typeof c[0] === "string" && c[0].includes("remote get-url")
    );
    expect(branchCalls.length).toBe(2);
    expect(remoteCalls.length).toBe(1);
  });
});
