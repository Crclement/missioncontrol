import { open } from "fs/promises";
import { join } from "path";

export async function readRecentHistory(
  configDir: string,
  sessionId: string
): Promise<string[]> {
  const filePath = join(configDir, "history.jsonl");

  let fh;
  try {
    fh = await open(filePath, "r");
  } catch {
    return [];
  }

  try {
    const stat = await fh.stat();
    const fileSize = stat.size;

    // Read last 10KB
    const readSize = Math.min(10 * 1024, fileSize);
    const position = fileSize - readSize;
    const buffer = Buffer.alloc(readSize);
    await fh.read(buffer, 0, readSize, position);

    const text = buffer.toString("utf-8");
    const lines = text.split("\n");
    const results: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const entry = JSON.parse(trimmed) as Record<string, unknown>;

        if (entry.sessionId !== sessionId) continue;

        // Build a display string from the history entry
        const type = (entry.type as string) ?? "unknown";
        const message = (entry.message as string) ?? (entry.text as string) ?? "";
        const tool = entry.tool as string | undefined;

        let display: string;
        if (tool) {
          display = `[${type}] ${tool}: ${message}`;
        } else if (message) {
          display = `[${type}] ${message}`;
        } else {
          display = `[${type}]`;
        }

        results.push(display.slice(0, 200));
      } catch {
        // Skip malformed lines
      }
    }

    return results;
  } finally {
    await fh.close();
  }
}
