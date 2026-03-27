"use client"

import { useEffect, useRef, useMemo, createRef } from "react"
import { useAgent } from "@/hooks/useAgent"
import { useKeyboardNav } from "@/hooks/useKeyboardNav"
import { StatsBar } from "./StatsBar"
import { SessionCard } from "./SessionCard"

export function Dashboard() {
  const { sessions, connectionState, sendResponse, reconnect } = useAgent()

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      // needs-input first
      if (a.conversation.needsInput && !b.conversation.needsInput) return -1
      if (!a.conversation.needsInput && b.conversation.needsInput) return 1
      // then by most recent start time (newer first)
      return b.startedAt - a.startedAt
    })
  }, [sessions])

  const {
    focusedIndex,
    showHelp,
    inputOpen,
    setShowHelp,
  } = useKeyboardNav({
    sessionCount: sortedSessions.length,
    onReconnect: reconnect,
  })

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  // Refs for keyboard focus
  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([])
  if (cardRefs.current.length !== sortedSessions.length) {
    cardRefs.current = sortedSessions.map((_, i) => cardRefs.current[i] ?? createRef())
  }

  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < cardRefs.current.length) {
      cardRefs.current[focusedIndex]?.current?.focus()
    }
  }, [focusedIndex])

  return (
    <div className="fixed inset-0 overflow-auto">
      <div className="p-4 md:p-12 font-mono">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-sm font-mono text-muted tracking-widest uppercase">
            mission control
          </h1>
        </div>

        {/* Stats bar */}
        <StatsBar sessions={sortedSessions} connectionState={connectionState} />

        {/* Session grid */}
        {sortedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedSessions.map((session, i) => (
              <SessionCard
                key={session.pid}
                ref={cardRefs.current[i]}
                session={session}
                index={i}
                isFocused={focusedIndex === i}
                inputOpen={inputOpen && focusedIndex === i}
                onSendResponse={sendResponse}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <pre className="text-muted text-xs leading-relaxed mb-4 font-mono">
{`  .-----.
  |- _ -|
  |  o  |
    zzZ`}
              </pre>
              <p className="text-muted text-xs font-mono">
                no active sessions
              </p>
              <p className="text-muted text-[10px] font-mono mt-1">
                {connectionState === "connected"
                  ? "waiting for claude code sessions..."
                  : connectionState === "connecting"
                    ? "connecting to agent..."
                    : "disconnected -- press r to reconnect"}
              </p>
            </div>
          </div>
        )}

        {/* Keyboard help overlay */}
        {showHelp && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(12, 12, 12, 0.9)" }}
            onClick={() => setShowHelp(false)}
          >
            <div
              className="p-8 max-w-md w-full"
              style={{
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-sm font-mono text-[#e0e0e0] mb-4 tracking-widest uppercase">
                keyboard shortcuts
              </h2>
              <div className="space-y-2 text-xs font-mono">
                {[
                  ["1-9", "focus session by index"],
                  ["j / k", "move focus down / up"],
                  ["Enter", "open response input"],
                  ["Escape", "close input / help / unfocus"],
                  ["r", "reconnect websocket"],
                  ["?", "toggle this help"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span
                      className="w-16 text-right text-[#e0e0e0] shrink-0"
                      style={{
                        backgroundColor: "#2a2a2a",
                        padding: "2px 6px",
                        borderRadius: "1px",
                      }}
                    >
                      {key}
                    </span>
                    <span className="text-muted">{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted mt-6 font-mono">
                press ? or Escape to close
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
