import { execSync } from "child_process";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export async function discoverConfigDirs(): Promise<Set<string>> {
  const dirs = new Set<string>();

  // 1. Always include default
  dirs.add(join(homedir(), ".claude"));

  // 2. Parse running claude processes for CLAUDE_CONFIG_DIR
  try {
    const output = execSync("ps eww -o pid,command", {
      encoding: "utf-8",
      timeout: 5000,
    });

    for (const line of output.split("\n")) {
      // Look for claude processes
      if (!/claude/i.test(line)) continue;

      // Extract CLAUDE_CONFIG_DIR=... from the environment portion
      const match = line.match(/CLAUDE_CONFIG_DIR=([^\s]+)/);
      if (match) {
        dirs.add(match[1]);
      }
    }
  } catch {
    // ps may fail on some systems, that's okay
  }

  // 3. Check optional missioncontrol config for additional dirs
  try {
    const configPath = join(homedir(), ".missioncontrol", "config.json");
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    if (Array.isArray(config.additionalConfigDirs)) {
      for (const dir of config.additionalConfigDirs) {
        if (typeof dir === "string") {
          dirs.add(dir);
        }
      }
    }
  } catch {
    // Config file may not exist
  }

  return dirs;
}
