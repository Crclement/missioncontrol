"use client"

interface ContextMeterProps {
  percentUsed: number
  totalTokens: number
  contextLimit?: number
  isActive?: boolean
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

export function ContextMeter({ totalTokens, contextLimit = 1_000_000 }: ContextMeterProps) {
  const pct = Math.min(Math.max((totalTokens / contextLimit) * 100, 0), 100)

  return (
    <div className="w-full">
      <div className="w-full h-1" style={{ backgroundColor: "#e0e0e0" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#000" }}
        />
      </div>
      <div className="text-xs mt-1 font-mono" style={{ color: "#888" }}>
        {formatCompact(totalTokens)} / {formatCompact(contextLimit)}
      </div>
    </div>
  )
}
