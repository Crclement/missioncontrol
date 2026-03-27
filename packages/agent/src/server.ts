#!/usr/bin/env node

import { existsSync } from "fs";
import { WebSocketServer, type WebSocket } from "ws";
import type {
  ConversationState,
  EnrichedSession,
  RawSession,
  WorkType,
  WSMessage,
} from "@missioncontrol/shared";
import { discoverConfigDirs } from "./discovery.js";
import { readSessions } from "./session-reader.js";
import { getGitInfo } from "./git-reader.js";
import { readConversation, getRecentMessages } from "./conversation-reader.js";
import { readSubagents } from "./subagent-reader.js";
import { summarizeSession } from "./summarizer.js";
import { respondToSession } from "./responder.js";
import { getTerminalTitle } from "./terminal-title.js";
import { createWatcher } from "./watcher.js";

const PORT = parseInt(process.env.PORT ?? "45557", 10);

// Creature ASCII art pool
const CREATURES = [
  "  /\\_/\\  \n ( o.o ) \n  > ^ <  ",
  "  |\\---/|\n  | o_o |\n   \\_^_/ ",
  "   /\\_/\\\n  ( o o )\n  ==_Y_== ",
  "  .-\"\"\"-.  \n /       \\ \n |  O  O | \n \\  __  / \n  '----'  ",
  "   ^  ^  \n  (o  o) \n  ( -- ) \n  /|  |\\ ",
  "  (\\(\\  \n  ( -.-)  \n  o_(\")(\")",
];

function getCreature(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash + sessionId.charCodeAt(i)) | 0;
  }
  return CREATURES[Math.abs(hash) % CREATURES.length];
}

function classifyWorkType(session: EnrichedSession): WorkType {
  const { conversation } = session;
  const tool = conversation.lastToolUse?.toLowerCase() ?? "";
  const text = conversation.lastAssistantText.toLowerCase();

  if (!conversation.lastAssistantText && !conversation.lastToolUse) return "idle";

  if (tool.includes("bash") || tool.includes("terminal") || tool.includes("execute")) {
    return "running";
  }
  if (tool.includes("edit") || tool.includes("write") || tool.includes("create")) {
    return "coding";
  }
  if (tool.includes("read") || tool.includes("glob") || tool.includes("grep") || tool.includes("search")) {
    return "exploring";
  }
  if (text.includes("review") || text.includes("looks good") || text.includes("lgtm")) {
    return "reviewing";
  }
  if (text.includes("debug") || text.includes("error") || text.includes("fix")) {
    return "debugging";
  }
  if (text.includes("plan") || text.includes("approach") || text.includes("strategy")) {
    return "planning";
  }

  if (conversation.needsInput) return "idle";

  return "coding";
}

// State
let previousSessions = new Map<string, EnrichedSession>();
let configDirs = new Set<string>();

async function enrichSession(
  raw: RawSession,
  configDir: string
): Promise<EnrichedSession> {
  // If CWD doesn't exist, use safe defaults for fs-dependent reads
  const cwdExists = existsSync(raw.cwd);

  const [git, conversation, subagents, recentMessages] = await Promise.all([
    cwdExists ? getGitInfo(raw.cwd).catch(() => undefined) : Promise.resolve(undefined),
    readConversation(configDir, raw.sessionId, raw.cwd).catch((): ConversationState => ({
      lastUserMessage: "",
      lastAssistantText: "",
      lastMessageRole: "user" as const,
      needsInput: false,
      messageCount: 0,
    })),
    readSubagents(configDir, raw.sessionId, raw.cwd).catch(() => []),
    getRecentMessages(configDir, raw.sessionId, raw.cwd).catch(() => []),
  ]);

  const terminalTitle = getTerminalTitle(raw.pid);

  const partial: EnrichedSession = {
    pid: raw.pid,
    sessionId: raw.sessionId,
    cwd: raw.cwd,
    startedAt: raw.startedAt,
    name: raw.name ?? terminalTitle,
    terminalTitle,
    configDir,
    alive: true,
    git,
    conversation,
    subagents,
    workType: "idle",
    creature: getCreature(raw.sessionId),
  };

  partial.workType = classifyWorkType(partial);

  // Generate AI summary (non-blocking, uses cache)
  try {
    partial.summary = await summarizeSession(
      raw.sessionId,
      recentMessages,
      partial.workType,
      conversation.lastToolUse,
      conversation.lastUserMessage,
      conversation.lastAssistantText
    );
  } catch {
    // Summarizer is optional - don't fail the whole enrichment
  }

  return partial;
}

async function collectAllSessions(): Promise<EnrichedSession[]> {
  const allSessions: EnrichedSession[] = [];

  for (const dir of configDirs) {
    try {
      const rawSessions = await readSessions(dir);
      const enriched = await Promise.all(
        rawSessions.map((raw) => enrichSession(raw, dir))
      );
      allSessions.push(...enriched);
    } catch (err) {
      console.error(`Error reading sessions from ${dir}:`, err);
    }
  }

  return allSessions;
}

function sessionsEqual(a: EnrichedSession, b: EnrichedSession): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffAndBroadcast(
  sessions: EnrichedSession[],
  clients: Set<WebSocket>
) {
  const currentMap = new Map<string, EnrichedSession>();
  for (const s of sessions) {
    currentMap.set(s.sessionId, s);
  }

  // Find removed sessions
  for (const [id, prev] of previousSessions) {
    if (!currentMap.has(id)) {
      const msg: WSMessage = { type: "session-removed", pid: prev.pid };
      broadcast(clients, msg);
    }
  }

  // Find new or updated sessions
  for (const [id, session] of currentMap) {
    const prev = previousSessions.get(id);
    if (!prev || !sessionsEqual(prev, session)) {
      const msg: WSMessage = { type: "session-update", data: session };
      broadcast(clients, msg);
    }
  }

  previousSessions = currentMap;
}

function broadcast(clients: Set<WebSocket>, msg: WSMessage) {
  const payload = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(payload);
    }
  }
}

async function main() {
  // Global error handlers -- log to stderr, never crash
  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });

  const wss = new WebSocketServer({ port: PORT });
  const clients = new Set<WebSocket>();

  // Initial discovery
  configDirs = await discoverConfigDirs();

  // Startup banner
  const pkg = { version: "0.1.0" };
  console.error("====================================");
  console.error(`  Mission Control Agent v${pkg.version}`);
  console.error(`  ws://localhost:${PORT}`);
  console.error(`  Sessions dirs: ${configDirs.size} discovered`);
  console.error("====================================");
  console.error(`Config dirs:`, [...configDirs]);

  // Set up file watcher
  let refreshQueued = false;

  async function refresh() {
    if (refreshQueued) return;
    refreshQueued = true;

    // Small delay to batch rapid changes
    setTimeout(async () => {
      refreshQueued = false;
      try {
        const sessions = await collectAllSessions();
        diffAndBroadcast(sessions, clients);
      } catch (err) {
        console.error("Error during refresh:", err);
      }
    }, 50);
  }

  const watcher = createWatcher(configDirs, refresh);

  // Re-discover config dirs every 30s
  setInterval(async () => {
    try {
      const newDirs = await discoverConfigDirs();
      if ([...newDirs].some((d) => !configDirs.has(d)) ||
          [...configDirs].some((d) => !newDirs.has(d))) {
        configDirs = newDirs;
        watcher.updateDirs(configDirs);
        console.error(`Updated config dirs (${configDirs.size}):`, [...configDirs]);
        refresh();
      }
    } catch (err) {
      console.error("Error during discovery:", err);
    }
  }, 30_000);

  // Periodic refresh every 3s
  setInterval(refresh, 3000);

  // Handle WebSocket connections
  wss.on("connection", async (ws: WebSocket) => {
    clients.add(ws);
    console.error(`Client connected (${clients.size} total)`);

    // Send full session list to new client
    try {
      const sessions = await collectAllSessions();
      previousSessions = new Map(sessions.map((s) => [s.sessionId, s]));
      const msg: WSMessage = { type: "sessions", data: sessions };
      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.error("Error sending initial sessions:", err);
    }

    ws.on("message", async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString()) as WSMessage;
        if (msg.type === "respond") {
          const { sessionId, configDir, message } = msg;
          console.error(`Responding to session ${sessionId}: "${message.slice(0, 50)}..."`);
          const result = await respondToSession(sessionId, configDir, message);
          if (!result.success) {
            console.error(`Failed to respond: ${result.error}`);
          }
          // Trigger a refresh after responding
          setTimeout(refresh, 500);
        }
      } catch (err) {
        console.error("Error handling client message:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.error(`Client disconnected (${clients.size} total)`);
    });

    ws.on("error", (err) => {
      console.error("WebSocket client error:", err);
      clients.delete(ws);
    });
  });

  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  // Initial refresh
  refresh();

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.error("\nShutting down...");
    watcher.close();
    wss.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    watcher.close();
    wss.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
