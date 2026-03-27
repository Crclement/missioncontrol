import { execSync } from "child_process";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export async function discoverConfigDirs(): Promise<Set<string>> {
  const dirs = new Set<string>();
  const defaultDir = join(homedir(), ".claude");

  // 1. Always include default
  dirs.add(defaultDir);

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
    // ps may fail on some systems -- we still have the default dir
  }

  // 3. Check optional missioncontrol config for additional dirs
  try {
    const configPath = join(homedir(), ".missioncontrol", "config.json");
    const raw = await readFile(configPath, "utf-8");
    let config: unknown;
    try {
      config = JSON.parse(raw);
    } catch {
      // Malformed JSON in config -- skip it entirely
      config = null;
    }
    if (config && typeof config === "object" && config !== null) {
      const obj = config as Record<string, unknown>;
      if (Array.isArray(obj.additionalConfigDirs)) {
        for (const dir of obj.additionalConfigDirs) {
          if (typeof dir === "string") {
            dirs.add(dir);
          }
        }
      }
    }
  } catch {
    // Config file may not exist
  }

  // 4. Filter out dirs that don't exist on disk
  const validDirs = new Set<string>();
  for (const dir of dirs) {
    try {
      if (existsSync(dir)) {
        validDirs.add(dir);
      }
    } catch {
      // Skip inaccessible dirs
    }
  }

  // Always return at least the default dir (even if it doesn't exist yet)
  if (validDirs.size === 0) {
    validDirs.add(defaultDir);
  }

  return validDirs;
}
