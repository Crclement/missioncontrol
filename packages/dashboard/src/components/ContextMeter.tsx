"use client"

interface ContextMeterProps {
  percentUsed: number
  totalTokens: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function ContextMeter({ percentUsed, totalTokens }: ContextMeterProps) {
  const pct = Math.min(Math.max(percentUsed, 0), 100)

  let fillColor = "#7c9a72" // sage green < 50%
  if (pct >= 80) fillColor = "#b85c5c" // red > 80%
  else if (pct >= 50) fillColor = "#c4956a" // ochre 50-80%

  return (
    <div className="w-full">
      <div
        className="w-full h-1.5"
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "1px",
        }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
            borderRadius: "1px",
          }}
        />
      </div>
      <div className="text-[10px] text-muted mt-1 font-mono">
        {Math.round(pct)}% context | {formatTokens(totalTokens)} tokens
      </div>
    </div>
  )
}
