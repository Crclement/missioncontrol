import { execSync } from "child_process";
import type { GitInfo } from "@missioncontrol/shared";

interface CachedGitInfo {
  info: GitInfo | undefined;
  branch: string;
  timestamp: number;
}

const cache = new Map<string, CachedGitInfo>();
let cachedUserName: string | undefined;

const CACHE_TTL_MS = 30_000;

function getGlobalUserName(): string {
  if (cachedUserName !== undefined) return cachedUserName;
  try {
    cachedUserName = execSync("git config --global user.name", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();
  } catch {
    cachedUserName = "";
  }
  return cachedUserName;
}

function exec(cmd: string, cwd: string): string {
  return execSync(cmd, {
    encoding: "utf-8",
    timeout: 5000,
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function parseRemoteUrl(remote: string): { org?: string; repo: string } | undefined {
  // SSH: git@github.com:Org/repo.git
  const sshMatch = remote.match(/git@[^:]+:([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (sshMatch) {
    return { org: sshMatch[1], repo: sshMatch[2] };
  }

  // HTTPS: https://github.com/Org/repo.git
  const httpsMatch = remote.match(/https?:\/\/[^/]+\/([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (httpsMatch) {
    return { org: httpsMatch[1], repo: httpsMatch[2] };
  }

  return undefined;
}

export async function getGitInfo(cwd: string): Promise<GitInfo | undefined> {
  try {
    const branch = exec(`git -C "${cwd}" branch --show-current`, cwd);

    // Check cache
    const cached = cache.get(cwd);
    if (
      cached &&
      cached.branch === branch &&
      Date.now() - cached.timestamp < CACHE_TTL_MS
    ) {
      return cached.info;
    }

    let remote = "";
    try {
      remote = exec(`git -C "${cwd}" remote get-url origin`, cwd);
    } catch {
      // No remote configured
    }

    const parsed = remote ? parseRemoteUrl(remote) : undefined;
    const userName = getGlobalUserName();
    const isPersonal = parsed?.org
      ? parsed.org.toLowerCase() === userName.toLowerCase()
      : false;

    const info: GitInfo = {
      repo: parsed?.repo ?? cwd.split("/").pop() ?? "unknown",
      branch,
      remote,
      isPersonal,
      org: parsed?.org,
    };

    cache.set(cwd, { info, branch, timestamp: Date.now() });
    return info;
  } catch {
    // Not a git repo
    cache.set(cwd, { info: undefined, branch: "", timestamp: Date.now() });
    return undefined;
  }
}
