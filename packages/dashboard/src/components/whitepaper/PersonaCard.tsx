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
  color = "#6b8cae",
}: PersonaCardProps) {
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#161616",
        border: "1px solid #2a2a2a",
        borderRadius: "2px",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-2 h-2"
          style={{ backgroundColor: color, borderRadius: "1px" }}
        />
        <h4
          className="text-sm font-mono uppercase tracking-widest"
          style={{ color }}
        >
          {name}
        </h4>
      </div>
      <p className="text-xs font-mono text-muted mb-4">{description}</p>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
          Pain Points
        </p>
        <ul className="space-y-1">
          {painPoints.map((p, i) => (
            <li key={i} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
              <span className="text-danger">-</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
          Goals
        </p>
        <ul className="space-y-1">
          {goals.map((g, i) => (
            <li key={i} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
              <span className="text-sage">+</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="pt-3 mt-3"
        style={{ borderTop: "1px solid #2a2a2a" }}
      >
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">
          Willingness to Pay
        </p>
        <p className="text-xs font-mono text-ochre">{wtp}</p>
      </div>
    </div>
  )
}
