import chokidar, { type FSWatcher } from "chokidar";
import { join } from "path";

export function createWatcher(
  configDirs: Set<string>,
  onChange: () => void
): { close: () => void; updateDirs: (dirs: Set<string>) => void } {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const watchers = new Map<string, FSWatcher[]>();

  function debouncedOnChange() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, 100);
  }

  function watchDir(configDir: string): FSWatcher[] {
    const dirWatchers: FSWatcher[] = [];

    // Watch sessions directory
    const sessionsWatcher = chokidar.watch(join(configDir, "sessions"), {
      ignoreInitial: true,
      depth: 0,
    });
    sessionsWatcher.on("add", debouncedOnChange);
    sessionsWatcher.on("change", debouncedOnChange);
    sessionsWatcher.on("unlink", debouncedOnChange);
    dirWatchers.push(sessionsWatcher);

    // Watch projects directory (recursive, only jsonl and meta.json)
    const projectsWatcher = chokidar.watch(join(configDir, "projects"), {
      ignoreInitial: true,
      ignored: (path: string) => {
        // Allow directories to be traversed
        if (!path.includes(".")) return false;
        // Only watch .jsonl and .meta.json files
        return !path.endsWith(".jsonl") && !path.endsWith(".meta.json");
      },
    });
    projectsWatcher.on("add", debouncedOnChange);
    projectsWatcher.on("change", debouncedOnChange);
    dirWatchers.push(projectsWatcher);

    // Watch history.jsonl
    const historyWatcher = chokidar.watch(join(configDir, "history.jsonl"), {
      ignoreInitial: true,
    });
    historyWatcher.on("change", debouncedOnChange);
    dirWatchers.push(historyWatcher);

    return dirWatchers;
  }

  // Start watching initial dirs
  for (const dir of configDirs) {
    watchers.set(dir, watchDir(dir));
  }

  function close() {
    if (debounceTimer) clearTimeout(debounceTimer);
    for (const dirWatchers of watchers.values()) {
      for (const w of dirWatchers) {
        w.close();
      }
    }
    watchers.clear();
  }

  function updateDirs(dirs: Set<string>) {
    // Remove watchers for dirs no longer in set
    for (const [dir, dirWatchers] of watchers) {
      if (!dirs.has(dir)) {
        for (const w of dirWatchers) {
          w.close();
        }
        watchers.delete(dir);
      }
    }

    // Add watchers for new dirs
    for (const dir of dirs) {
      if (!watchers.has(dir)) {
        watchers.set(dir, watchDir(dir));
      }
    }
  }

  return { close, updateDirs };
}
