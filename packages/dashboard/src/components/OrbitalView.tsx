"use client"

import { useMemo } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import { PixelCreature } from "./PixelCreature"
import { StatusBadge } from "./StatusBadge"
import { ContextMeter } from "./ContextMeter"
import { SubagentList } from "./SubagentList"
import { ResponseInput } from "./ResponseInput"

interface OrbitalViewProps {
  sessions: EnrichedSession[]
  focusedIndex: number
  inputOpen: boolean
  onSendResponse: (sessionId: string, configDir: string, message: string) => void
}

export function OrbitalView({ sessions, focusedIndex, inputOpen, onSendResponse }: OrbitalViewProps) {
  const positions = useMemo(() => {
    const count = sessions.length
    if (count === 0) return []
    if (count === 1) return [{ x: 50, y: 50 }]

    return sessions.map((_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      const radiusX = Math.min(35, 20 + count * 2)
      const radiusY = Math.min(30, 18 + count * 2)
      return {
        x: 50 + Math.cos(angle) * radiusX,
        y: 50 + Math.sin(angle) * radiusY,
      }
    })
  }, [sessions])

  if (sessions.length === 0) return null

  return (
    <div className="flex-1 relative min-h-0 overflow-hidden">
      {sessions.map((session, i) => {
        const pos = positions[i]
        const isSelected = focusedIndex === i
        const needsInput = session.conversation.needsInput
        const isActive = session.workType !== "idle" && !needsInput
        const sessionName = session.terminalTitle ?? session.name ?? session.sessionId.slice(0, 8)
        const repoName = session.git?.repo ?? session.cwd.split("/").pop() ?? "unknown"
        const branchName = session.git?.branch ?? ""
        const orgLabel = session.git
          ? session.git.isPersonal
            ? "personal"
            : session.git.org ?? "org"
          : null

        const baseSize = isActive ? 160 : 140
        const size = isSelected ? 320 : baseSize
        const borderWidth = isActive ? 2 : 1

        return (
          <div
            key={session.pid}
            className="absolute font-mono"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%)`,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: isSelected ? 20 : isActive ? 10 : 1,
            }}
          >
            <div
              className="relative flex flex-col items-center justify-center overflow-hidden"
              style={{
                width: size,
                height: isSelected ? "auto" : size,
                minHeight: isSelected ? size : undefined,
                borderRadius: isSelected ? "16px" : "50%",
                border: needsInput
                  ? `${borderWidth}px dashed #000`
                  : `${borderWidth}px solid #000`,
                backgroundColor: isActive ? "#000" : "#fff",
                color: isActive ? "#fff" : "#000",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: needsInput ? "pulse-border 2s ease-in-out infinite" : undefined,
                padding: isSelected ? "24px" : "12px",
                alignItems: isSelected ? "stretch" : undefined,
              }}
            >
              {/* Number label */}
              <div
                className="absolute font-bold text-xs"
                style={{
                  top: isSelected ? 12 : 8,
                  left: isSelected ? 16 : 12,
                  color: isActive ? "#444" : "#ccc",
                }}
              >
                {i + 1}
              </div>

              {!isSelected ? (
                <>
                  {/* Compact circle view */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PixelCreature workType={session.workType} size={3} inverted={isActive} />
                    <div className="text-xs font-bold text-center truncate max-w-full px-2">
                      {sessionName}
                    </div>
                    <StatusBadge
                      workType={session.workType}
                      needsInput={needsInput}
                      isActive={isActive}
                    />
                  </div>

                  {/* Context ring */}
                  {session.conversation.tokenUsage && (
                    <svg
                      className="absolute inset-0 w-full h-full"
                      style={{ transform: "rotate(-90deg)", pointerEvents: "none" }}
                    >
                      <circle
                        cx="50%"
                        cy="50%"
                        r={size / 2 - 4}
                        fill="none"
                        stroke={isActive ? "#333" : "#e0e0e0"}
                        strokeWidth="2"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r={size / 2 - 4}
                        fill="none"
                        stroke={isActive ? "#fff" : "#000"}
                        strokeWidth="2"
                        strokeDasharray={`${(2 * Math.PI * (size / 2 - 4) * session.conversation.tokenUsage.contextPercentUsed) / 100} ${2 * Math.PI * (size / 2 - 4)}`}
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    </svg>
                  )}
                </>
              ) : (
                <>
                  {/* Expanded detail view */}
                  <div className="flex items-center gap-4 mb-3 mt-4">
                    <PixelCreature workType={session.workType} size={5} inverted={isActive} />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold truncate leading-tight">
                        {sessionName}
                      </h2>
                      <div
                        className="text-sm mt-1"
                        style={{ color: isActive ? "#aaa" : "#666" }}
                      >
                        {repoName}
                        {branchName && <span> @ {branchName}</span>}
                        {orgLabel && <span> · {orgLabel}</span>}
                      </div>
                    </div>
                    <StatusBadge
                      workType={session.workType}
                      needsInput={needsInput}
                      isActive={isActive}
                    />
                  </div>

                  {/* Last message */}
                  {session.conversation.lastUserMessage && (
                    <p
                      className="text-sm leading-relaxed line-clamp-3 mb-3"
                      style={{ color: isActive ? "#ccc" : "#444" }}
                    >
                      &ldquo;
                      {session.conversation.lastUserMessage.length > 140
                        ? session.conversation.lastUserMessage.slice(0, 140) + "..."
                        : session.conversation.lastUserMessage}
                      &rdquo;
                    </p>
                  )}

                  {/* Subagents */}
                  <SubagentList subagents={session.subagents} isActive={isActive} />

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

                  {/* Wispr hint */}
                  {needsInput && !inputOpen && (
                    <div
                      className="text-xs mt-3"
                      style={{ color: isActive ? "#666" : "#999" }}
                    >
                      ◆ Wispr ready
                    </div>
                  )}

                  {/* Response input */}
                  {needsInput && (
                    <ResponseInput
                      onSend={(msg) =>
                        onSendResponse(session.sessionId, session.configDir, msg)
                      }
                      autoFocus={inputOpen}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
