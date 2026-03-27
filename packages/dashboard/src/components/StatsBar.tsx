"use client"

import type { EnrichedSession } from "@missioncontrol/shared"
import type { ConnectionState } from "@/hooks/useAgent"

interface StatsBarProps {
  sessions: EnrichedSession[]
  connectionState: ConnectionState
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const CONNECTION_COLORS: Record<ConnectionState, string> = {
  connected: "#7c9a72",
  connecting: "#c4956a",
  disconnected: "#b85c5c",
}

export function StatsBar({ sessions, connectionState }: StatsBarProps) {
  const activeSessions = sessions.filter((s) => s.alive).length
  const totalTokens = sessions.reduce(
    (sum, s) => sum + (s.conversation.tokenUsage?.totalTokens ?? 0),
    0,
  )
  const totalCost = sessions.reduce(
    (sum, s) => sum + (s.conversation.tokenUsage?.estimatedCostUsd ?? 0),
    0,
  )

  const dotColor = CONNECTION_COLORS[connectionState]

  return (
    <div
      className="flex items-center gap-6 text-xs font-mono text-muted border-b border-border pb-4 mb-6 flex-wrap"
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5"
          style={{ backgroundColor: dotColor, borderRadius: "1px" }}
        />
        {connectionState}
      </span>

      <span>
        <span className="text-[#e0e0e0]">{activeSessions}</span> sessions
      </span>

      <span>
        <span className="text-[#e0e0e0]">{formatTokens(totalTokens)}</span> tokens
      </span>

      <span>
        <span className="text-[#e0e0e0]">{formatCost(totalCost)}</span> est. cost
      </span>
    </div>
  )
}
