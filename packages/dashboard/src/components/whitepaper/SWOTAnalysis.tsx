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
    marker: string
  }[] = [
    { key: "strengths", label: "Strengths", marker: "S" },
    { key: "weaknesses", label: "Weaknesses", marker: "W" },
    { key: "opportunities", label: "Opportunities", marker: "O" },
    { key: "threats", label: "Threats", marker: "T" },
  ]

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{
        border: "1px solid #000000",
      }}
    >
      {quadrants.map((q, i) => (
        <div
          key={q.key}
          className="p-4"
          style={{
            backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f5f5",
            borderRight: i % 2 === 0 ? "1px solid #000000" : "none",
            borderBottom: i < 2 ? "1px solid #000000" : "none",
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-3 font-mono text-[#000000] font-bold">
            {q.label}
          </p>
          <ul className="space-y-2">
            {data[q.key].map((item, j) => (
              <li key={j} className="text-xs font-mono text-[#000000] flex gap-2">
                <span className="text-[#666666]">{q.marker}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
