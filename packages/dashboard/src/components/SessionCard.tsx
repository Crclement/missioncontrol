"use client"

import { forwardRef, useEffect, useRef } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import { AsciiCreature } from "./AsciiCreature"
import { StatusBadge } from "./StatusBadge"
import { OrgBadge } from "./OrgBadge"
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

    // Fire browser notification when transitioning to needs-input
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

    // Scroll into view when focused
    useEffect(() => {
      if (isFocused && ref && typeof ref !== "function" && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }, [isFocused, ref])

    const borderColor = needsInput
      ? "#c4956a"
      : isFocused
        ? "#6b6b6b"
        : "#2a2a2a"

    const repoName = session.git?.repo ?? session.cwd.split("/").pop() ?? "unknown"
    const branchName = session.git?.branch ?? ""
    const sessionName = session.name ?? session.sessionId.slice(0, 8)

    const lastMessage = session.conversation.lastUserMessage
    const truncatedMessage =
      lastMessage && lastMessage.length > 120
        ? lastMessage.slice(0, 120) + "..."
        : lastMessage

    return (
      <div
        ref={ref}
        tabIndex={-1}
        className="p-4 transition-colors"
        style={{
          backgroundColor: "#161616",
          border: `1px solid ${borderColor}`,
          borderRadius: "2px",
          outline: "none",
        }}
      >
        {/* Top row: creature + session info */}
        <div className="flex items-start gap-3">
          <AsciiCreature creature={session.creature} workType={session.workType} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] text-muted font-mono">{index + 1}</span>
                <span className="text-sm font-mono text-[#e0e0e0] truncate">
                  {sessionName}
                </span>
              </div>
              <StatusBadge workType={session.workType} needsInput={needsInput} />
            </div>

            {/* Repo + branch + org */}
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted">
              <span className="truncate">
                {repoName}
                {branchName && (
                  <span className="text-slate"> @ {branchName}</span>
                )}
              </span>
              {session.git && (
                <OrgBadge
                  isPersonal={session.git.isPersonal}
                  org={session.git.org}
                  remote={session.git.remote}
                />
              )}
            </div>
          </div>
        </div>

        {/* Last user message */}
        {truncatedMessage && (
          <div className="mt-3 text-xs font-mono text-muted leading-relaxed line-clamp-2">
            &ldquo;{truncatedMessage}&rdquo;
          </div>
        )}

        {/* Subagents */}
        <SubagentList subagents={session.subagents} />

        {/* Context meter */}
        {session.conversation.tokenUsage && (
          <div className="mt-3">
            <ContextMeter
              percentUsed={session.conversation.tokenUsage.contextPercentUsed}
              totalTokens={session.conversation.tokenUsage.totalTokens}
            />
          </div>
        )}

        {/* Response input */}
        {needsInput && (isFocused && inputOpen || true) && (
          <ResponseInput
            onSend={(msg) => onSendResponse(session.sessionId, session.configDir, msg)}
            autoFocus={isFocused && inputOpen}
          />
        )}
      </div>
    )
  },
)
