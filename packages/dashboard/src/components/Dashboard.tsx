"use client"

import { useEffect, useRef, useMemo, createRef } from "react"
import { useAgent } from "@/hooks/useAgent"
import { useKeyboardNav } from "@/hooks/useKeyboardNav"
import { StatsBar } from "./StatsBar"
import { SessionCard } from "./SessionCard"
import { OrbitalView } from "./OrbitalView"

export function Dashboard() {
  const { sessions, connectionState, sendResponse, reconnect } = useAgent()

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.conversation.needsInput && !b.conversation.needsInput) return -1
      if (!a.conversation.needsInput && b.conversation.needsInput) return 1
      return b.startedAt - a.startedAt
    })
  }, [sessions])

  const {
    focusedIndex,
    showHelp,
    inputOpen,
    voiceMode,
    viewMode,
    setShowHelp,
    setViewMode,
  } = useKeyboardNav({
    sessionCount: sortedSessions.length,
    onReconnect: reconnect,
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

  const count = sortedSessions.length
  const cols = count <= 1 ? 1 : count === 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      <div className="p-4 md:p-12 flex flex-col h-full font-mono">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8 shrink-0 border-b border-black pb-4">
          <div className="flex items-baseline gap-6">
            <h1 className="text-lg font-mono font-bold text-black tracking-widest uppercase">
              Mission Control
            </h1>
            {/* View toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("grid")}
                className={`text-xs font-mono transition-colors ${
                  viewMode === "grid"
                    ? "text-black font-bold"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                Grid
              </button>
              <span className="text-[#ccc] text-xs">/</span>
              <button
                onClick={() => setViewMode("orbital")}
                className={`text-xs font-mono transition-colors ${
                  viewMode === "orbital"
                    ? "text-black font-bold"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                Orbital
              </button>
              <span className="text-[10px] text-[#ccc] font-mono ml-1">[v]</span>
            </div>
          </div>
          <StatsBar sessions={sortedSessions} connectionState={connectionState} />
        </div>

        {/* Content */}
        {sortedSessions.length > 0 ? (
          viewMode === "grid" ? (
            <div
              className="flex-1 grid gap-0 min-h-0"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${Math.ceil(count / cols)}, 1fr)`,
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
                  onSendResponse={sendResponse}
                />
              ))}
            </div>
          ) : (
            <OrbitalView
              sessions={sortedSessions}
              focusedIndex={focusedIndex}
              inputOpen={inputOpen && focusedIndex >= 0}
              onSendResponse={sendResponse}
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
                ["Space", "Dictate with Wispr Flow"],
                ["Enter", "Type a response"],
                ["Tab", "Switch voice / type mode"],
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
