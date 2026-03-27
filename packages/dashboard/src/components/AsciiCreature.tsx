"use client"

import type { WorkType } from "@missioncontrol/shared"

const CREATURE_COLORS: Record<WorkType, string> = {
  coding: "#7c9a72",
  exploring: "#6b8cae",
  planning: "#9b7cb8",
  debugging: "#b85c5c",
  idle: "#6b6b6b",
  running: "#6b9e9e",
  reviewing: "#6b8cae",
}

interface AsciiCreatureProps {
  creature: string
  workType: WorkType
}

export function AsciiCreature({ creature, workType }: AsciiCreatureProps) {
  const color = CREATURE_COLORS[workType] ?? "#6b6b6b"

  return (
    <pre
      className="text-[10px] leading-[1.2] font-mono select-none"
      style={{ color }}
    >
      {creature}
    </pre>
  )
}
