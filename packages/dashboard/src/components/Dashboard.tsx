"use client"

import { useEffect, useRef, useMemo, createRef } from "react"
import { useAgent } from "@/hooks/useAgent"
import { useKeyboardNav } from "@/hooks/useKeyboardNav"
import { StatsBar } from "./StatsBar"
import { SessionCard } from "./SessionCard"
import { OrbitalView } from "./OrbitalView"

export function Dashboard() {
  const { sessions, connectionState, sendResponse, reconnect, lastUpdated } = useAgent()

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.conversation.needsInput && !b.conversation.needsInput) return -1
      if (!a.conversation.needsInput && b.conversation.needsInput) return 1
      return b.startedAt - a.startedAt
    })
  }, [sessions])

  const count = sortedSessions.length
  const cols = count <= 1 ? 1 : count === 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4

  const {
    focusedIndex,
    showHelp,
    inputOpen,
    voiceMode,
    viewMode,
    initialChar,
    setShowHelp,
    setViewMode,
    setFocusedIndex,
  } = useKeyboardNav({
    sessionCount: count,
    cols,
    onReconnect: reconnect,
    sessionNeedsInput: (i) => sortedSessions[i]?.conversation.needsInput ?? false,
    onEnterSession: (i) => {
      // Open the terminal tab for this session's project
      const session = sortedSessions[i]
      if (!session) return
      const cwd = session.cwd
      // Use osascript to activate the Terminal window for this project
      fetch(`/api/open-terminal?cwd=${encodeURIComponent(cwd)}`).catch(() => {})
    },
  })

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([])
  if (cardRefs.current.length !== sortedSessions.length) {
    cardRefs.current = sortedSessions.map((_, i) => cardRefs.current[i] ?? createRef())
  }

  useEffect(() => {
    if (viewMode === "grid" && focusedIndex >= 0 && focusedIndex < cardRefs.current.length) {
      cardRefs.current[focusedIndex]?.current?.focus()
    }
  }, [focusedIndex, viewMode])

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col font-mono">
      {/* Top bar — edge to edge */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-black/10 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xs font-mono font-bold text-black tracking-[0.2em] uppercase">
            Mission Control
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <button
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "text-black font-bold" : "text-[#aaa]"}
            >
              Grid
            </button>
            <span className="text-[#ccc]">/</span>
            <button
              onClick={() => setViewMode("orbital")}
              className={viewMode === "orbital" ? "text-black font-bold" : "text-[#aaa]"}
            >
              Orbital
            </button>
          </div>
        </div>
        <StatsBar sessions={sortedSessions} connectionState={connectionState} lastUpdated={lastUpdated} />
      </div>

      {/* Content area with padding */}
      <div className="flex-1 overflow-auto flex flex-col p-3 md:p-6 min-h-0">

        {/* Content */}
        {sortedSessions.length > 0 ? (
          viewMode === "grid" ? (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridAutoRows: "minmax(180px, auto)",
              }}
            >
              {sortedSessions.map((session, i) => (
                <SessionCard
                  key={session.pid}
                  ref={cardRefs.current[i]}
                  session={session}
                  index={i}
                  isFocused={focusedIndex === i}
                  inputOpen={inputOpen && focusedIndex === i}
                  voiceMode={voiceMode}
                  initialChar={focusedIndex === i ? initialChar : ""}
                  onSendResponse={sendResponse}
                  onSelect={setFocusedIndex}
                />
              ))}
            </div>
          ) : (
            <OrbitalView
              sessions={sortedSessions}
              focusedIndex={focusedIndex}
              inputOpen={inputOpen && focusedIndex >= 0}
              voiceMode={voiceMode}
              onSendResponse={sendResponse}
              onSelect={setFocusedIndex}
            />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <pre className="text-black text-base leading-relaxed mb-6 font-mono">
{`\u2588\u2580\u2580\u2588
\u2588\u2584\u2584\u2588
 \u2591\u2591
    `}
              </pre>
              <p className="text-black text-base font-mono font-bold">
                No active sessions
              </p>
              <p className="text-muted text-sm font-mono mt-2">
                {connectionState === "connected"
                  ? "Waiting for Claude Code sessions..."
                  : connectionState === "connecting"
                    ? "Connecting to agent..."
                    : "Disconnected \u2014 press r to reconnect"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard help */}
      {showHelp && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-white/95"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="p-10 max-w-md w-full border border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-mono text-black mb-6 font-bold tracking-widest uppercase">
              Keyboard Shortcuts
            </h2>
            <div className="space-y-3 text-sm font-mono">
              {[
                ["\u2190 \u2191 \u2192 \u2193", "Navigate between sessions"],
                ["1-9", "Jump to session"],
                ["Space", "Speak with Wispr Flow"],
                ["Enter", "Type a response"],
                ["v", "Toggle Grid / Orbital view"],
                ["Esc", "Close / unfocus"],
                ["r", "Reconnect"],
                ["?", "This help"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-20 text-center text-black shrink-0 text-xs font-bold border border-black px-2 py-1">
                    {key}
                  </span>
                  <span className="text-secondary">{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-8 font-mono">
              Press ? or Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
