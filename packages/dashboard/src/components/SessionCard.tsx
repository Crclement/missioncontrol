"use client"

import { forwardRef, useEffect, useRef } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import { PixelCreature } from "./PixelCreature"
import { StatusBadge } from "./StatusBadge"
import { SubagentList } from "./SubagentList"
import { ContextMeter } from "./ContextMeter"
import { ResponseInput } from "./ResponseInput"

interface SessionCardProps {
  session: EnrichedSession
  index: number
  isFocused: boolean
  inputOpen: boolean
  onSendResponse: (sessionId: string, configDir: string, message: string) => void
}

export const SessionCard = forwardRef<HTMLDivElement, SessionCardProps>(
  function SessionCard({ session, index, isFocused, inputOpen, onSendResponse }, ref) {
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
    const sessionName = session.terminalTitle ?? session.name ?? session.sessionId.slice(0, 8)
    const orgLabel = session.git
      ? session.git.isPersonal
        ? "personal"
        : session.git.org ?? "org"
      : null

    const lastMessage = session.conversation.lastUserMessage
    const truncatedMessage =
      lastMessage && lastMessage.length > 140
        ? lastMessage.slice(0, 140) + "..."
        : lastMessage

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="p-6 flex flex-col overflow-hidden transition-colors relative"
        style={{
          backgroundColor: isActive ? "#000000" : "#ffffff",
          color: isActive ? "#ffffff" : "#000000",
          border: needsInput ? "1px dashed #000000" : "1px solid #000000",
          outline: isFocused ? "2px solid #000000" : "none",
          outlineOffset: "-3px",
          animation: needsInput ? "pulse-border 2s ease-in-out infinite" : undefined,
        }}
      >
        {/* Number key - large bold corner */}
        <div
          className="absolute top-4 right-4 text-2xl font-mono font-bold leading-none"
          style={{ color: isActive ? "#333" : "#ddd" }}
        >
          {index + 1}
        </div>

        {/* Title - full width, large and bold */}
        <div className="flex items-start gap-4 mb-1 pr-10">
          <h2 className="text-lg font-mono font-bold truncate leading-tight flex-1">
            {sessionName}
          </h2>
        </div>

        {/* Repo @ branch . org */}
        <div
          className="flex items-center gap-2 text-sm font-mono mb-4"
          style={{ color: isActive ? "#aaa" : "#666" }}
        >
          <span className="truncate">
            {repoName}
            {branchName && <span> @ {branchName}</span>}
          </span>
          {orgLabel && (
            <span className="shrink-0">· {orgLabel}</span>
          )}
        </div>

        {/* Creature + Status row */}
        <div className="flex items-center gap-4 mb-4">
          <PixelCreature workType={session.workType} size={4} inverted={isActive} />
          <StatusBadge workType={session.workType} needsInput={needsInput} isActive={isActive} />
        </div>

        {/* Last user message */}
        {truncatedMessage && (
          <p
            className="text-sm font-mono leading-relaxed line-clamp-2 mb-3"
            style={{ color: isActive ? "#ccc" : "#444" }}
          >
            &ldquo;{truncatedMessage}&rdquo;
          </p>
        )}

        {/* Subagents */}
        <SubagentList subagents={session.subagents} isActive={isActive} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Wispr hint when focused */}
        {isFocused && !inputOpen && needsInput && (
          <div
            className="text-xs font-mono mt-3 font-bold"
            style={{ color: isActive ? "#666" : "#999" }}
          >
            ◆ Space to dictate · Enter to type
          </div>
        )}

        {/* Context meter */}
        {session.conversation.tokenUsage && (
          <div className="mt-3">
            <ContextMeter
              percentUsed={session.conversation.tokenUsage.contextPercentUsed}
              totalTokens={session.conversation.tokenUsage.totalTokens}
              isActive={isActive}
            />
          </div>
        )}

        {/* Response input */}
        {needsInput && (
          <ResponseInput
            onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
            autoFocus={isFocused && inputOpen}
          />
        )}
      </div>
    )
  },
)
