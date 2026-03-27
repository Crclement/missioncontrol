"use client"

interface SWOTData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface SWOTAnalysisProps {
  data: SWOTData
}

export function SWOTAnalysis({ data }: SWOTAnalysisProps) {
  const quadrants: {
    key: keyof SWOTData
    label: string
    color: string
    bgTint: string
  }[] = [
    { key: "strengths", label: "Strengths", color: "#7c9a72", bgTint: "#141a14" },
    { key: "weaknesses", label: "Weaknesses", color: "#b85c5c", bgTint: "#1a1414" },
    { key: "opportunities", label: "Opportunities", color: "#6b8cae", bgTint: "#14171a" },
    { key: "threats", label: "Threats", color: "#c4956a", bgTint: "#1a1714" },
  ]

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{
        border: "1px solid #2a2a2a",
        borderRadius: "2px",
      }}
    >
      {quadrants.map((q, i) => (
        <div
          key={q.key}
          className="p-4"
          style={{
            backgroundColor: q.bgTint,
            borderRight: i % 2 === 0 ? "1px solid #2a2a2a" : "none",
            borderBottom: i < 2 ? "1px solid #2a2a2a" : "none",
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3 font-mono"
            style={{ color: q.color }}
          >
            {q.label}
          </p>
          <ul className="space-y-2">
            {data[q.key].map((item, j) => (
              <li key={j} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
                <span style={{ color: q.color }}>+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
