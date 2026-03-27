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
  onSelect: (index: number) => void
}

function humanizeTitle(raw: string): string {
  return raw
    .replace(/^claude-code-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function getSummary(session: EnrichedSession): string {
  if (session.summary) return session.summary

  if (session.conversation.messageCount === 0) return "Ready to go"

  // Show the last user message as context if we have it
  if (session.conversation.lastUserMessage) {
    const msg = session.conversation.lastUserMessage
    return msg.length > 80 ? msg.slice(0, 80) + "..." : msg
  }

  return "Ready to go"
}

export const SessionCard = forwardRef<HTMLDivElement, SessionCardProps>(
  function SessionCard({ session, index, isFocused, inputOpen, voiceMode, onSendResponse, onSelect }, ref) {
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
    const summary = getSummary(session)

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="p-5 flex flex-col overflow-hidden relative cursor-pointer transition-colors duration-150"
        onClick={() => onSelect(index)}
        style={{
          backgroundColor: isFocused ? "#000" : "#fff",
          color: isFocused ? "#fff" : "#000",
          border: isFocused ? "1px solid #000" : "1px solid #ccc",
          borderRadius: "12px",
          outline: "none",
        }}
      >
        {/* Title + creature */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-mono font-bold truncate leading-tight">
              {sessionName}
            </h2>
            <div className="text-xs font-mono mt-1" style={{ color: isFocused ? "#aaa" : "#666" }}>
              {repoName}
              {branchName && <span> · {branchName}</span>}
            </div>
          </div>
          <div className="shrink-0">
            <PixelCreature workType={session.workType} size={3} inverted={isFocused} variant={index} />
          </div>
        </div>

        {/* Summary — no bullet */}
        <div className="text-sm font-mono mb-2" style={{ color: isFocused ? "#ccc" : "#555" }}>
          {summary}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Context meter */}
        {session.conversation.tokenUsage && (
          <div className="mt-2">
            <ContextMeter
              totalTokens={session.conversation.tokenUsage.totalTokens}
              contextLimit={1_000_000}
              percentUsed={session.conversation.tokenUsage.contextPercentUsed}
              isActive={isFocused}
            />
          </div>
        )}

        {/* Input area */}
        {needsInput && isFocused && inputOpen ? (
          <ResponseInput
            onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
            autoFocus
            voiceMode={voiceMode}
          />
        ) : isFocused ? (
          <div
            className="mt-3 text-sm font-mono font-bold animate-blink"
            style={{ color: isFocused ? "#fff" : "#000" }}
          >
            ◆ Spacebar to speak · Enter to type
          </div>
        ) : null}
      </div>
    )
  },
)
