"use client"

import { useMemo } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import { PixelCreature } from "./PixelCreature"
import { ResponseInput } from "./ResponseInput"

interface OrbitalViewProps {
  sessions: EnrichedSession[]
  focusedIndex: number
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
  if (session.conversation.lastUserMessage) {
    const msg = session.conversation.lastUserMessage
    return msg.length > 60 ? msg.slice(0, 60) + "..." : msg
  }
  return "Ready to go"
}

interface Position {
  x: number
  y: number
}

function computePositions(count: number): Position[] {
  if (count === 0) return []
  if (count === 1) return [{ x: 0, y: 0 }]

  // 1-3: horizontal row
  if (count <= 3) {
    const spacing = 260
    const startX = -((count - 1) * spacing) / 2
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * spacing,
      y: 0,
    }))
  }

  // 4-6: single circle
  if (count <= 6) {
    const radius = count <= 4 ? 200 : 240
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }
    })
  }

  // 7+: concentric circles
  const innerCount = Math.min(6, Math.floor(count / 2))
  const outerCount = count - innerCount
  const innerRadius = 180
  const outerRadius = 340
  const positions: Position[] = []

  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2 - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * innerRadius,
      y: Math.sin(angle) * innerRadius,
    })
  }

  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * outerRadius,
      y: Math.sin(angle) * outerRadius,
    })
  }

  return positions
}

const CIRCLE_SIZE = 200

function ContextRing({
  size,
  percentUsed,
  isSelected,
}: {
  size: number
  percentUsed: number
  isSelected: boolean
}) {
  const radius = size / 2 - 4
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isSelected ? "#333" : "#eee"}
        strokeWidth="2"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isSelected ? "#fff" : "#000"}
        strokeWidth="2"
        strokeDasharray={`${(circumference * percentUsed) / 100} ${circumference}`}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  )
}

export function OrbitalView({
  sessions,
  focusedIndex,
  inputOpen,
  voiceMode,
  onSendResponse,
  onSelect,
}: OrbitalViewProps) {
  const positions = useMemo(() => computePositions(sessions.length), [sessions.length])

  if (sessions.length === 0) return null

  // Compute bounding box to size the inner container
  const bounds = useMemo(() => {
    if (positions.length === 0) return { width: 0, height: 0 }
    const margin = CIRCLE_SIZE / 2 + 80 // extra room for labels below circles
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of positions) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    return {
      width: (maxX - minX) + margin * 2,
      height: (maxY - minY) + margin * 2,
    }
  }, [positions])

  return (
    <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: bounds.width,
          height: bounds.height,
          minWidth: bounds.width,
          minHeight: bounds.height,
        }}
      >
        {sessions.map((session, i) => {
          const pos = positions[i]
          const isSelected = focusedIndex === i
          const needsInput = session.conversation.needsInput
          const sessionName = humanizeTitle(session.name ?? "") || session.sessionId.slice(0, 8)
          const repoName = session.git?.repo ?? session.cwd.split("/").pop() ?? "unknown"
          const branchName = session.git?.branch ?? ""
          const summary = getSummary(session)
          const contextPct = session.conversation.tokenUsage?.contextPercentUsed ?? 0

          return (
            <div
              key={session.pid}
              className="absolute font-mono flex flex-col items-center"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.05 : 1})`,
                transition: "transform 0.3s ease",
                zIndex: isSelected ? 20 : 1,
              }}
            >
              {/* The circle */}
              <div
                onClick={() => onSelect(i)}
                className="relative flex flex-col items-center justify-center cursor-pointer rounded-full"
                style={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  backgroundColor: isSelected ? "#000" : "#fff",
                  color: isSelected ? "#fff" : "#000",
                  border: isSelected ? "1px solid #000" : "1px solid #ccc",
                  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                }}
              >
                {/* Context ring */}
                {contextPct > 0 && (
                  <ContextRing
                    size={CIRCLE_SIZE}
                    percentUsed={contextPct}
                    isSelected={isSelected}
                  />
                )}

                {/* Number badge */}
                {i < 9 && (
                  <div
                    className="absolute text-[10px] font-bold"
                    style={{
                      top: 12,
                      left: 16,
                      color: isSelected ? "#666" : "#aaa",
                    }}
                  >
                    {i + 1}
                  </div>
                )}

                {/* Creature */}
                <div className="mb-1">
                  <PixelCreature workType={session.workType} size={5} inverted={isSelected} variant={i} />
                </div>

                {/* Session name */}
                <div
                  className="text-xs font-bold text-center truncate px-4"
                  style={{ maxWidth: CIRCLE_SIZE - 24 }}
                >
                  {sessionName}
                </div>

                {/* Summary */}
                <div
                  className="text-[10px] text-center mt-0.5 px-4 leading-tight"
                  style={{
                    maxWidth: CIRCLE_SIZE - 24,
                    color: isSelected ? "#aaa" : "#666",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {summary}
                </div>

                {/* Repo + branch */}
                <div
                  className="text-[9px] mt-1"
                  style={{ color: isSelected ? "#888" : "#888" }}
                >
                  {repoName}
                  {branchName && <span> · {branchName}</span>}
                </div>
              </div>

              {/* Below the circle: action prompt when selected + needs input */}
              {isSelected && needsInput && !inputOpen && (
                <div
                  className="mt-3 text-sm font-mono font-bold animate-blink text-center whitespace-nowrap"
                  style={{ color: "#000" }}
                >
                  ◆ Spacebar to speak · Enter to type
                </div>
              )}

              {/* Response input below the selected circle */}
              {isSelected && needsInput && inputOpen && (
                <div className="mt-3" style={{ width: 400, maxWidth: "90vw" }}>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "1px solid #000",
                    }}
                  >
                    <ResponseInput
                      onSend={(msg) =>
                        onSendResponse(session.sessionId, session.configDir, msg)
                      }
                      autoFocus
                      voiceMode={voiceMode}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
