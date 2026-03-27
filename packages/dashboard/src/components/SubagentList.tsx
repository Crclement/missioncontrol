"use client"

import type { SubAgent } from "@missioncontrol/shared"

interface SubagentListProps {
  subagents: SubAgent[]
}

export function SubagentList({ subagents }: SubagentListProps) {
  if (subagents.length === 0) return null

  return (
    <div className="mt-2 space-y-0.5">
      {subagents.map((agent) => (
        <div key={agent.id} className="flex items-center gap-2 text-[11px] font-mono text-muted">
          <span className="text-teal">{agent.agentType}</span>
          <span className="truncate">{agent.description}</span>
        </div>
      ))}
    </div>
  )
}
