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

  const severityLabel =
    composite <= 2 ? "LOW" : composite <= 4 ? "MODERATE" : "CRITICAL"

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
        borderLeft: composite > 4 ? "3px solid #000000" : "1px solid #000000",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-mono text-[#000000] flex-1">{risk}</p>
        <span
          className="text-[10px] font-mono ml-3 px-2 py-0.5 shrink-0"
          style={{
            color: "#000000",
            backgroundColor: composite > 4 ? "#000000" : "#f5f5f5",
            ...(composite > 4 ? { color: "#ffffff" } : {}),
            border: "1px solid #000000",
          }}
        >
          {severityLabel}
        </span>
      </div>
      <div className="flex gap-4 mb-2">
        <span className="text-[10px] font-mono text-[#666666]">
          Prob: <span className="text-[#000000]">{probability}</span>
        </span>
        <span className="text-[10px] font-mono text-[#666666]">
          Impact: <span className="text-[#000000]">{impact}</span>
        </span>
      </div>
      <p className="text-[10px] font-mono text-[#666666]">
        Mitigation: {mitigation}
      </p>
    </div>
  )
}
