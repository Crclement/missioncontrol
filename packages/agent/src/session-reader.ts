import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { RawSession } from "@missioncontrol/shared";

export async function readSessions(configDir: string): Promise<RawSession[]> {
  const sessionsDir = join(configDir, "sessions");
  const alive: RawSession[] = [];

  let files: string[];
  try {
    files = await readdir(sessionsDir);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  for (const file of jsonFiles) {
    try {
      const raw = await readFile(join(sessionsDir, file), "utf-8");
      const session: RawSession = JSON.parse(raw);

      // Validate PID is alive
      try {
        process.kill(session.pid, 0);
      } catch {
        // Process is dead, skip
        continue;
      }

      alive.push(session);
    } catch {
      // Malformed JSON or read error, skip
    }
  }

  return alive;
}
