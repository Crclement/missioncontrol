"use client"

import type { SubAgent } from "@missioncontrol/shared"

interface SubagentListProps {
  subagents: SubAgent[]
  isActive?: boolean
}

export function SubagentList({ subagents, isActive }: SubagentListProps) {
  if (subagents.length === 0) return null

  const typeColor = isActive ? "#fff" : "#000"
  const descColor = isActive ? "#999" : "#666"

  return (
    <div className="mt-2 space-y-1">
      {subagents.map((agent) => (
        <div key={agent.id} className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold" style={{ color: typeColor }}>{agent.agentType}</span>
          <span className="truncate" style={{ color: descColor }}>{agent.description}</span>
        </div>
      ))}
    </div>
  )
}
