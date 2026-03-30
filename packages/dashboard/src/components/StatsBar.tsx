"use client"

import { useState, useEffect } from "react"
import type { EnrichedSession } from "@missioncontrol/shared"
import type { ConnectionState } from "@/hooks/useAgent"

interface StatsBarProps {
  sessions: EnrichedSession[]
  connectionState: ConnectionState
  lastUpdated: number
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatAgo(ts: number): string {
  if (ts === 0) return "never"
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 2) return "live"
  if (sec < 60) return `${sec}s ago`
  return `${Math.floor(sec / 60)}m ago`
}

export function StatsBar({ sessions, connectionState, lastUpdated }: StatsBarProps) {
  const [, setTick] = useState(0)
  const activeSessions = sessions.filter((s) => s.alive).length
  const totalTokens = sessions.reduce(
    (sum, s) => sum + (s.conversation.tokenUsage?.totalTokens ?? 0),
    0,
  )
  const totalCost = sessions.reduce(
    (sum, s) => sum + (s.conversation.tokenUsage?.estimatedCostUsd ?? 0),
    0,
  )

  // Tick every second to keep "Xs ago" fresh
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const isConnected = connectionState === "connected"
  const ago = formatAgo(lastUpdated)
  const isLive = ago === "live"

  return (
    <div className="flex items-center gap-6 text-xs font-mono text-secondary">
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block w-2 h-2"
          style={{ backgroundColor: isConnected ? (isLive ? "#000" : "#888") : "#888" }}
        />
        <span style={{ color: isConnected ? "#000" : "#888" }}>
          {isConnected ? ago : connectionState}
        </span>
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
