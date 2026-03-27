import type { WorkType } from "./types.js"

const creatures: Record<WorkType, string> = {
  coding: [
    "  ._____. ",
    "  |o   o| ",
    "  |  ^  | ",
    "  _|/|\\|_ ",
  ].join("\n"),

  exploring: [
    "   .---.  ",
    "  (o  O)~ ",
    "  /| d |  ",
    "   |/|\\|  ",
  ].join("\n"),

  planning: [
    "  .-----. ",
    "  |*   *| ",
    "  | ___ | ",
    "  [=====] ",
  ].join("\n"),

  debugging: [
    "  .@~~~@. ",
    "  |o _ o| ",
    "  | ? ? | ",
    "  \\-^^^-/ ",
  ].join("\n"),

  idle: [
    "  .-----. ",
    "  |- _ -| ",
    "  |  o  | ",
    "    zzZ   ",
  ].join("\n"),

  running: [
    " >>.___.  ",
    " >>|o o|  ",
    " >>| ^ |  ",
    " >>|/|\\|  ",
  ].join("\n"),

  reviewing: [
    "  .-----. ",
    "  |o   o| ",
    "  | === | ",
    "  |_____| ",
  ].join("\n"),
}

export function getCreature(workType: WorkType): string {
  return creatures[workType] ?? creatures.coding
}
