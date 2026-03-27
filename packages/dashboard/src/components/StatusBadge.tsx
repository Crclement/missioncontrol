"use client"

import type { WorkType } from "@missioncontrol/shared"

const STATUS_COLORS: Record<WorkType | "needs-input", string> = {
  coding: "#7c9a72",
  exploring: "#6b8cae",
  planning: "#9b7cb8",
  debugging: "#b85c5c",
  idle: "#6b6b6b",
  running: "#6b9e9e",
  reviewing: "#6b8cae",
  "needs-input": "#c4956a",
}

const STATUS_LABELS: Record<WorkType | "needs-input", string> = {
  coding: "active",
  exploring: "exploring",
  planning: "planning",
  debugging: "debugging",
  idle: "idle",
  running: "running",
  reviewing: "reviewing",
  "needs-input": "needs input",
}

interface StatusBadgeProps {
  workType: WorkType
  needsInput: boolean
}

export function StatusBadge({ workType, needsInput }: StatusBadgeProps) {
  const key = needsInput ? "needs-input" : workType
  const color = STATUS_COLORS[key]
  const label = STATUS_LABELS[key]

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono">
      <span
        className="inline-block w-1.5 h-1.5"
        style={{
          backgroundColor: color,
          borderRadius: "1px",
        }}
      />
      <span style={{ color }}>{label}</span>
    </span>
  )
}
