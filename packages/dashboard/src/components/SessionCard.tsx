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
  initialChar?: string
  onSendResponse: (sessionId: string, configDir: string, message: string) => void
  onSelect: (index: number) => void
}

function humanizeSlug(raw: string): string {
  return raw
    .replace(/^claude-code-/, "")
    // Split on hyphens, dots, underscores
    .split(/[-._]+/)
    .filter(Boolean)
    .map((w) => {
      // Keep version numbers and short acronyms as-is
      if (/^\d/.test(w) || /^v\d/i.test(w)) return w
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(" ")
}

function getTitle(session: EnrichedSession): string {
  // Best: session name from Claude Code (if set and not generic)
  if (session.name) return humanizeSlug(session.name)
  // Fallback: project directory name
  const dirName = session.cwd.split("/").pop() ?? ""
  if (dirName) return humanizeSlug(dirName)
  return session.sessionId.slice(0, 8)
}


function getStatusInfo(session: EnrichedSession): { label: string; isWorking: boolean } {
  if (session.conversation.needsInput) {
    return { label: "WAITING FOR YOU", isWorking: false }
  }
  if (session.conversation.messageCount === 0) {
    return { label: "IDLE", isWorking: false }
  }
  const tool = session.conversation.lastToolUse
  if (tool) {
    const m: Record<string, string> = {
      Edit: "EDITING", Write: "WRITING", Read: "READING",
      Bash: "RUNNING", Grep: "SEARCHING", Glob: "FINDING FILES",
      Agent: "SUBAGENT",
    }
    return { label: m[tool] ?? "WORKING", isWorking: true }
  }
  if (session.workType === "idle") return { label: "IDLE", isWorking: false }
  return { label: "WORKING", isWorking: true }
}

export const SessionCard = forwardRef<HTMLDivElement, SessionCardProps>(
  function SessionCard({ session, index, isFocused, inputOpen, voiceMode, initialChar, onSendResponse, onSelect }, ref) {
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
    const sessionName = getTitle(session)

    const { label: statusLabel, isWorking } = getStatusInfo(session)

    // Visual states:
    // Focused: black bg, white text
    // Working (not focused): white bg, black left accent bar
    // Waiting (not focused): light bg, dashed left accent
    const bg = isFocused ? "#000" : "#fff"
    const fg = isFocused ? "#fff" : "#000"
    const borderColor = isFocused ? "#000" : needsInput ? "#000" : isWorking ? "#ccc" : "#ddd"

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="flex flex-col overflow-hidden relative cursor-pointer transition-colors duration-150"
        onClick={() => onSelect(index)}
        style={{
          backgroundColor: bg,
          color: fg,
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          outline: "none",
        }}
      >
        {/* Status strip at top */}
        <div
          className="px-5 py-1.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest"
          style={{
            backgroundColor: isFocused
              ? "#222"
              : needsInput
                ? "#000"
                : isWorking
                  ? "#f0f0f0"
                  : "#f8f8f8",
            color: isFocused
              ? "#888"
              : needsInput
                ? "#fff"
                : isWorking
                  ? "#000"
                  : "#aaa",
            borderTopLeftRadius: "11px",
            borderTopRightRadius: "11px",
          }}
        >
          <span>{statusLabel}</span>
          {needsInput && !isFocused && (
            <span className="animate-blink">●</span>
          )}
          {isWorking && !isFocused && (
            <span style={{ color: "#000" }}>↻</span>
          )}
        </div>

        {/* Card body */}
        <div className="p-5 pt-3 flex flex-col flex-1">
          {/* Title + creature */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-mono font-bold leading-tight">
                {sessionName}
              </h2>
              <div className="text-xs font-mono mt-1" style={{ color: isFocused ? "#aaa" : "#888" }}>
                {repoName}
                {branchName && <span> · {branchName}</span>}
              </div>
            </div>
            <div className="shrink-0">
              <PixelCreature workType={session.workType} size={3} inverted={isFocused} variant={index} />
            </div>
          </div>

          {/* Live terminal output */}
          <div
            className="text-[11px] font-mono leading-relaxed overflow-hidden flex-1 min-h-0"
            style={{ color: isFocused ? "#aaa" : "#666" }}
          >
            {session.conversation.recentOutput.length > 0 ? (
              session.conversation.recentOutput.map((line, i) => (
                <div key={i} style={{
                  color: line.startsWith(">")
                    ? (isFocused ? "#888" : "#999")  // user messages dimmer
                    : line.startsWith("●")
                      ? (isFocused ? "#fff" : "#000")  // tool use bold
                      : (isFocused ? "#ccc" : "#444")  // assistant text
                }}>
                  {line}
                </div>
              ))
            ) : (
              <div style={{ color: isFocused ? "#666" : "#bbb" }}>Ready to go</div>
            )}
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

          {/* Input area — always available on focused card */}
          {isFocused && inputOpen ? (
            <ResponseInput
              onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
              autoFocus
              voiceMode={voiceMode}
              initialChar={initialChar}
            />
          ) : isFocused ? (
            <div className="mt-3 text-sm font-mono font-bold animate-blink" style={{ color: "#fff" }}>
              ◆ Spacebar to speak ...or start typing
            </div>
          ) : null}
        </div>
      </div>
    )
  },
)
