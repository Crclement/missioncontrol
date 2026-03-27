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

  const isConnected = connectionState === "connected"

  return (
    <div className="flex items-center gap-6 text-sm font-mono text-secondary">
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block w-2 h-2"
          style={{ backgroundColor: isConnected ? "#000" : "#888" }}
        />
        <span style={{ color: isConnected ? "#000" : "#888" }}>{connectionState}</span>
      </span>

      <span>
        <span className="text-black font-bold">{activeSessions}</span> sessions
      </span>

      <span>
        <span className="text-black font-bold">{formatTokens(totalTokens)}</span> tokens
      </span>

      <span>
        <span className="text-black font-bold">{formatCost(totalCost)}</span> est.
      </span>
    </div>
  )
}
