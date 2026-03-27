import type { WorkType } from "./types.js"

// Pixel block creatures using Unicode block elements
// ░ light shade, ▒ medium shade, ▓ dark shade, █ full block
// ▀ upper half, ▄ lower half, ▌ left half, ▐ right half
const creatures: Record<WorkType, string> = {
  coding: [
    "█▀▀█",
    "█▄▄█",
    " ▐▌ ",
    " █▀█",
  ].join("\n"),

  exploring: [
    "█▀▀█",
    "█▄▄█",
    "▐▌░ ",
    "█▀▀▀",
  ].join("\n"),

  planning: [
    "█▀▀█",
    "█▄▄█",
    " ▐▌ ",
    "▀██▀",
  ].join("\n"),

  debugging: [
    "█▀▀█",
    "█░░█",
    " ▐▌ ",
    "░██░",
  ].join("\n"),

  idle: [
    "█▀▀█",
    "█▄▄█",
    " ░░ ",
    "    ",
  ].join("\n"),

  running: [
    "█▀▀█",
    "█▄▄█",
    "░▐▌░",
    "░▌▐░",
  ].join("\n"),

  reviewing: [
    "█▀▀█",
    "█▄▄█",
    " ▐▌ ",
    "▀▀▀▀",
  ].join("\n"),
}

export function getCreature(workType: WorkType): string {
  return creatures[workType] ?? creatures.coding
}
