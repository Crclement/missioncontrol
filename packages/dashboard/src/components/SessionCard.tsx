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

function getWorkSummary(session: EnrichedSession): string {
  const { needsInput } = session.conversation
  const { workType } = session
  const lastToolUse = session.conversation.lastToolUse

  if (needsInput) {
    const text = session.conversation.lastAssistantText
    if (text) {
      return text.length > 80 ? text.slice(0, 80) + "..." : text
    }
    return "Awaiting your response"
  }

  if (lastToolUse) {
    const toolMap: Record<string, string> = {
      Edit: "Editing files...",
      Write: "Writing files...",
      Read: "Reading files...",
      Bash: "Running command...",
      Grep: "Searching code...",
      Glob: "Finding files...",
      ToolSearch: "Searching tools...",
    }
    return toolMap[lastToolUse] ?? `Using ${lastToolUse}...`
  }

  const typeMap: Record<string, string> = {
    coding: "Writing code...",
    exploring: "Exploring codebase...",
    planning: "Planning approach...",
    debugging: "Debugging issue...",
    running: "Running tasks...",
    reviewing: "Reviewing code...",
    idle: "Idle",
  }
  return typeMap[workType] ?? "Working..."
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

    useEffect(() => {
      if (isFocused && ref && typeof ref !== "function" && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }, [isFocused, ref])

    const isActive = session.workType !== "idle" && !needsInput
    const repoName = session.git?.repo ?? session.cwd.split("/").pop() ?? "unknown"
    const branchName = session.git?.branch ?? ""
    const sessionName = session.name ?? session.sessionId.slice(0, 8)
    const orgLabel = session.git
      ? session.git.isPersonal
        ? "personal"
        : session.git.org ?? "org"
      : null

    const summary = getWorkSummary(session)

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="p-6 flex flex-col overflow-hidden transition-colors relative"
        style={{
          backgroundColor: isActive ? "#000000" : needsInput ? "#f8f8f5" : "#ffffff",
          color: isActive ? "#ffffff" : "#000000",
          border: "1px solid #000000",
          outline: isFocused ? "2px solid #000000" : "none",
          outlineOffset: "-4px",
        }}
      >
        {/* Number key - large, top-left corner */}
        <div
          className="absolute top-4 left-4 text-2xl font-mono font-bold leading-none"
          style={{ color: isActive ? "#333" : "#ddd" }}
        >
          {index + 1}
        </div>

        {/* Pixel creature - small, top-right */}
        <div className="absolute top-4 right-4">
          <PixelCreature workType={session.workType} size={3} inverted={isActive} />
        </div>

        {/* Title - full width, large and bold */}
        <div className="pl-8 pr-14 mb-1">
          <h2 className="text-lg font-mono font-bold truncate leading-tight">
            {sessionName}
          </h2>
        </div>

        {/* One-line summary */}
        <div
          className="pl-8 pr-14 mb-2 text-sm font-mono truncate"
          style={{ color: isActive ? "#aaa" : "#666" }}
        >
          {needsInput && (
            <span
              className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
              style={{ backgroundColor: isActive ? "#aaa" : "#999" }}
            />
          )}
          {summary}
        </div>

        {/* Repo . branch . org */}
        <div
          className="pl-8 flex items-center gap-2 text-xs font-mono mb-4"
          style={{ color: isActive ? "#666" : "#999" }}
        >
          <span className="truncate">
            {repoName}
            {branchName && <span> · {branchName}</span>}
          </span>
          {orgLabel && (
            <span className="shrink-0">· {orgLabel}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Wispr hint when focused */}
        {isFocused && !inputOpen && needsInput && (
          <div
            className="text-xs font-mono mt-3 font-bold"
            style={{ color: isActive ? "#666" : "#999" }}
          >
            &#9670; Space to dictate · Enter to type
          </div>
        )}

        {/* Context meter */}
        {session.conversation.tokenUsage && (
          <div className="mt-3">
            <ContextMeter
              percentUsed={session.conversation.tokenUsage.contextPercentUsed}
              totalTokens={session.conversation.tokenUsage.totalTokens}
              contextLimit={1_000_000}
              isActive={isActive}
            />
          </div>
        )}

        {/* Response input */}
        {needsInput && (
          <ResponseInput
            onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
            autoFocus={isFocused && inputOpen}
            voiceMode={voiceMode}
          />
        )}
      </div>
    )
  },
)
