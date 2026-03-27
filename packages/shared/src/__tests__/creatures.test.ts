import { describe, expect, it } from "vitest"
import { getCreature } from "../creatures.js"
import type { WorkType } from "../types.js"

const workTypes: WorkType[] = [
  "coding",
  "exploring",
  "planning",
  "debugging",
  "idle",
  "running",
  "reviewing",
]

describe("getCreature", () => {
  it.each(workTypes)("returns a non-empty string for work type '%s'", (wt) => {
    const creature = getCreature(wt)
    expect(typeof creature).toBe("string")
    expect(creature.length).toBeGreaterThan(0)
  })

  it("returns distinct creatures for each work type", () => {
    const results = workTypes.map((wt) => getCreature(wt))
    const unique = new Set(results)
    expect(unique.size).toBe(workTypes.length)
  })

  it("creatures have multiple lines", () => {
    for (const wt of workTypes) {
      const lines = getCreature(wt).split("\n")
      expect(lines.length).toBeGreaterThanOrEqual(3)
      expect(lines.length).toBeLessThanOrEqual(4)
    }
  })
})
