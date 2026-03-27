"use client"

// Deprecated: use PixelCreature instead
import type { WorkType } from "@missioncontrol/shared"
import { PixelCreature } from "./PixelCreature"

interface AsciiCreatureProps {
  creature: string
  workType: WorkType
  isActive?: boolean
}

export function AsciiCreature({ workType, isActive }: AsciiCreatureProps) {
  return <PixelCreature workType={workType} size={4} inverted={isActive} />
}
