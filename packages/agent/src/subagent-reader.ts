import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { SubAgent } from "@missioncontrol/shared";

function cwdToProjectPath(cwd: string): string {
  return cwd
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/ /g, "-")
    .replace(/\./g, "-");
}

export async function readSubagents(
  configDir: string,
  sessionId: string,
  cwd: string
): Promise<SubAgent[]> {
  const projectPath = cwdToProjectPath(cwd);
  const dir = join(
    configDir,
    "projects",
    projectPath,
    sessionId,
    "subagents"
  );

  const subagents: SubAgent[] = [];

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const files = entries
    .filter((f) => f.startsWith("agent-") && f.endsWith(".meta.json"))
    .map((f) => join(dir, f));

  for (const file of files) {
    try {
      const raw = await readFile(file, "utf-8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      subagents.push({
        id: (data.id as string) ?? "",
        agentType: (data.agentType as string) ?? "unknown",
        description: (data.description as string) ?? "",
      });
    } catch {
      // Skip malformed files
    }
  }

  return subagents;
}
