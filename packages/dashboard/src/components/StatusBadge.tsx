"use client"

import type { WorkType } from "@missioncontrol/shared"

const STATUS_LABELS: Record<WorkType | "needs-input", string> = {
  coding: "Active",
  exploring: "Exploring",
  planning: "Planning",
  debugging: "Debugging",
  idle: "Idle",
  running: "Running",
  reviewing: "Reviewing",
  "needs-input": "Needs Input",
}

interface StatusBadgeProps {
  workType: WorkType
  needsInput: boolean
  isActive?: boolean
}

export function StatusBadge({ workType, needsInput, isActive }: StatusBadgeProps) {
  const key = needsInput ? "needs-input" : workType
  const label = STATUS_LABELS[key]

  if (needsInput) {
    return (
      <span
        className="text-xs font-mono font-bold px-2 py-0.5"
        style={{
          border: "1px solid #000",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className="text-xs font-mono px-2 py-0.5"
      style={{
        border: isActive ? "1px solid #666" : "1px solid #000",
        color: isActive ? "#aaa" : "#666",
        backgroundColor: "transparent",
      }}
    >
      {label}
    </span>
  )
}
