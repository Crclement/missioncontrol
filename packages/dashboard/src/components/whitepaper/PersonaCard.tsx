"use client"

interface PersonaCardProps {
  name: string
  description: string
  painPoints: string[]
  goals: string[]
  wtp: string
  color?: string
}

export function PersonaCard({
  name,
  description,
  painPoints,
  goals,
  wtp,
}: PersonaCardProps) {
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-2 h-2"
          style={{ backgroundColor: "#000000" }}
        />
        <h4 className="text-sm font-mono uppercase tracking-widest text-[#000000] font-bold">
          {name}
        </h4>
      </div>
      <p className="text-xs font-mono text-[#666666] mb-4">{description}</p>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
          Pain Points
        </p>
        <ul className="space-y-1">
          {painPoints.map((p, i) => (
            <li key={i} className="text-xs font-mono text-[#000000] flex gap-2">
              <span className="text-[#888888]">-</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
          Goals
        </p>
        <ul className="space-y-1">
          {goals.map((g, i) => (
            <li key={i} className="text-xs font-mono text-[#000000] flex gap-2">
              <span className="text-[#666666]">+</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="pt-3 mt-3"
        style={{ borderTop: "1px solid #000000" }}
      >
        <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">
          Willingness to Pay
        </p>
        <p className="text-xs font-mono text-[#000000] font-bold">{wtp}</p>
      </div>
    </div>
  )
}
