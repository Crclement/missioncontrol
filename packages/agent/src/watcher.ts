import { watchFile, unwatchFile, readdirSync, statSync } from "fs";
import { join } from "path";
import chokidar, { type FSWatcher } from "chokidar";

export function createWatcher(
  configDirs: Set<string>,
  onChange: () => void
): { close: () => void; updateDirs: (dirs: Set<string>) => void } {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const watchers = new Map<string, FSWatcher[]>();
  const watchedJsonl = new Set<string>();

  function debouncedOnChange() {
    if (debounceTimer) clearTimeout(debounceTimer);
    // Very short debounce — near-instant
    debounceTimer = setTimeout(onChange, 50);
  }

  // Use fs.watchFile for JSONL files — more reliable for appends on macOS
  function watchJsonlFile(filePath: string) {
    if (watchedJsonl.has(filePath)) return;
    watchedJsonl.add(filePath);
    watchFile(filePath, { interval: 500 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs || curr.size !== prev.size) {
        debouncedOnChange();
      }
    });
  }

  function unwatchAllJsonl() {
    for (const f of watchedJsonl) {
      unwatchFile(f);
    }
    watchedJsonl.clear();
  }

  // Find and watch all active JSONL files for a config dir
  function watchActiveJsonls(configDir: string) {
    try {
      const sessionsDir = join(configDir, "sessions");
      const files = readdirSync(sessionsDir).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        try {
          const session = JSON.parse(
            require("fs").readFileSync(join(sessionsDir, f), "utf-8")
          );
          const cwd = session.cwd as string;
          const sessionId = session.sessionId as string;
          // Build the project path
          const projectPath =
            "-" +
            cwd
              .replace(/^\//g, "")
              .replace(/\//g, "-")
              .replace(/ /g, "-")
              .replace(/\./g, "-");
          const jsonlPath = join(configDir, "projects", projectPath, `${sessionId}.jsonl`);
          try {
            statSync(jsonlPath);
            watchJsonlFile(jsonlPath);
          } catch {
            // File doesn't exist yet
          }
        } catch {
          // Skip malformed session files
        }
      }
    } catch {
      // Sessions dir may not exist
    }
  }

  function watchDir(configDir: string): FSWatcher[] {
    const dirWatchers: FSWatcher[] = [];

    // Watch sessions directory for new/removed sessions
    const sessionsWatcher = chokidar.watch(join(configDir, "sessions"), {
      ignoreInitial: true,
      depth: 0,
    });
    sessionsWatcher.on("add", () => {
      // New session — watch its JSONL too
      watchActiveJsonls(configDir);
      debouncedOnChange();
    });
    sessionsWatcher.on("change", debouncedOnChange);
    sessionsWatcher.on("unlink", debouncedOnChange);
    dirWatchers.push(sessionsWatcher);

    // Watch for new JSONL files in projects
    const projectsWatcher = chokidar.watch(join(configDir, "projects"), {
      ignoreInitial: true,
      ignored: (path: string) => {
        if (!path.includes(".")) return false;
        return !path.endsWith(".jsonl") && !path.endsWith(".meta.json");
      },
    });
    projectsWatcher.on("add", (path) => {
      if (path.endsWith(".jsonl")) {
        watchJsonlFile(path);
      }
      debouncedOnChange();
    });
    projectsWatcher.on("change", debouncedOnChange);
    dirWatchers.push(projectsWatcher);

    // Watch active JSONL files with fs.watchFile
    watchActiveJsonls(configDir);

    return dirWatchers;
  }

  for (const dir of configDirs) {
    watchers.set(dir, watchDir(dir));
  }

  function close() {
    if (debounceTimer) clearTimeout(debounceTimer);
    unwatchAllJsonl();
    for (const dirWatchers of watchers.values()) {
      for (const w of dirWatchers) {
        w.close();
      }
    }
    watchers.clear();
  }

  function updateDirs(dirs: Set<string>) {
    for (const [dir, dirWatchers] of watchers) {
      if (!dirs.has(dir)) {
        for (const w of dirWatchers) {
          w.close();
        }
        watchers.delete(dir);
      }
    }
    for (const dir of dirs) {
      if (!watchers.has(dir)) {
        watchers.set(dir, watchDir(dir));
      }
    }
  }

  return { close, updateDirs };
}
