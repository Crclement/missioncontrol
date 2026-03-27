"use client"

interface RiskItemProps {
  risk: string
  probability: "Low" | "Medium" | "High"
  impact: "Low" | "Medium" | "High"
  mitigation: string
}

export function RiskItem({ risk, probability, impact, mitigation }: RiskItemProps) {
  const scoreMap = { Low: 1, Medium: 2, High: 3 }
  const composite = scoreMap[probability] * scoreMap[impact]

  const severityColor =
    composite <= 2 ? "#7c9a72" : composite <= 4 ? "#c4956a" : "#b85c5c"

  const severityLabel =
    composite <= 2 ? "LOW" : composite <= 4 ? "MODERATE" : "CRITICAL"

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#161616",
        border: "1px solid #2a2a2a",
        borderLeft: `3px solid ${severityColor}`,
        borderRadius: "2px",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-mono text-[#e0e0e0] flex-1">{risk}</p>
        <span
          className="text-[10px] font-mono ml-3 px-2 py-0.5 shrink-0"
          style={{
            color: severityColor,
            backgroundColor: "#0c0c0c",
            border: `1px solid ${severityColor}`,
            borderRadius: "1px",
          }}
        >
          {severityLabel}
        </span>
      </div>
      <div className="flex gap-4 mb-2">
        <span className="text-[10px] font-mono text-muted">
          Prob: <span className="text-[#e0e0e0]">{probability}</span>
        </span>
        <span className="text-[10px] font-mono text-muted">
          Impact: <span className="text-[#e0e0e0]">{impact}</span>
        </span>
      </div>
      <p className="text-[10px] font-mono text-muted">
        Mitigation: {mitigation}
      </p>
    </div>
  )
}
