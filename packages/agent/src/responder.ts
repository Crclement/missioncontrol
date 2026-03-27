import { spawn } from "child_process";

export async function respondToSession(
  sessionId: string,
  configDir: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const child = spawn("claude", ["--resume", sessionId, "--yes"], {
        env: {
          ...process.env,
          CLAUDE_CONFIG_DIR: configDir,
        },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stderr = "";

      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            error: stderr.trim() || `Process exited with code ${code}`,
          });
        }
      });

      // Pipe the message to stdin and close it
      if (child.stdin) {
        child.stdin.write(message);
        child.stdin.end();
      }
    } catch (err) {
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
