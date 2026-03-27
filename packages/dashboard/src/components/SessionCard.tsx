"use client"

import { forwardRef, useEffect, useRef } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import { PixelCreature } from "./PixelCreature"
import { ContextMeter } from "./ContextMeter"
import { ResponseInput } from "./ResponseInput"

interface SessionCardProps {
  session: EnrichedSession
  index: number
  isFocused: boolean
  inputOpen: boolean
  voiceMode: boolean
  onSendResponse: (sessionId: string, configDir: string, message: string) => void
}

function humanizeTitle(raw: string): string {
  return raw
    .replace(/^claude-code-/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getStatusLabel(session: EnrichedSession): string {
  if (session.conversation.needsInput) return "Awaiting input"
  if (session.workType === "idle") return "Idle"
  const tool = session.conversation.lastToolUse
  if (tool) {
    const m: Record<string, string> = {
      Edit: "Editing",
      Write: "Writing",
      Read: "Reading",
      Bash: "Running",
      Grep: "Searching",
      Glob: "Finding files",
      Agent: "Subagent",
    }
    return m[tool] ?? tool
  }
  return "Working"
}

export const SessionCard = forwardRef<HTMLDivElement, SessionCardProps>(
  function SessionCard({ session, index, isFocused, inputOpen, voiceMode, onSendResponse }, ref) {
    const prevNeedsInputRef = useRef(session.conversation.needsInput)
    const needsInput = session.conversation.needsInput

    useEffect(() => {
      if (needsInput && !prevNeedsInputRef.current) {
        if (typeof window !== "undefined" && Notification.permission === "granted") {
          new Notification("Mission Control", {
            body: `${session.name ?? session.sessionId} needs your input`,
            tag: `mc-${session.pid}`,
          })
        }
      }
      prevNeedsInputRef.current = needsInput
    }, [needsInput, session.name, session.sessionId, session.pid])

    const repoName = session.git?.repo ?? session.cwd.split("/").pop() ?? "unknown"
    const branchName = session.git?.branch ?? ""
    const sessionName = humanizeTitle(session.name ?? "") || session.sessionId.slice(0, 8)

    // AI summary or fallback
    const summary = session.summary || getStatusLabel(session)

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="p-5 flex flex-col overflow-hidden relative"
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "1px solid #000000",
          outline: isFocused ? "3px solid #000000" : "none",
          outlineOffset: "-1px",
        }}
      >
        {/* Row 1: Number + Title + Creature */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl font-mono font-bold leading-none shrink-0 mt-0.5" style={{ color: "#bbb" }}>
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-mono font-bold truncate leading-tight">
              {sessionName}
            </h2>
            <div className="text-xs font-mono mt-1" style={{ color: "#666" }}>
              {repoName}
              {branchName && <span> · {branchName}</span>}
            </div>
          </div>
          <div className="shrink-0">
            <PixelCreature workType={session.workType} size={3} />
          </div>
        </div>

        {/* Row 2: Status + Summary */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block w-1.5 h-1.5 shrink-0"
            style={{ backgroundColor: needsInput ? "#000" : "#bbb" }}
          />
          <span className="text-sm font-mono truncate" style={{ color: "#555" }}>
            {summary}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Context meter */}
        {session.conversation.tokenUsage && (
          <div className="mt-2">
            <ContextMeter
              percentUsed={session.conversation.tokenUsage.contextPercentUsed}
              totalTokens={session.conversation.tokenUsage.totalTokens}
              contextLimit={1_000_000}
            />
          </div>
        )}

        {/* Input area for needs-input sessions */}
        {needsInput && isFocused && inputOpen ? (
          <ResponseInput
            onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
            autoFocus
            voiceMode={voiceMode}
          />
        ) : needsInput && isFocused ? (
          <div className="mt-3 text-sm font-mono font-bold text-black">
            ◆ Press spacebar and speak · Enter to type
          </div>
        ) : null}
      </div>
    )
  },
)
