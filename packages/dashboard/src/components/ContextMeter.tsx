"use client"

interface ContextMeterProps {
  percentUsed: number
  totalTokens: number
  contextLimit?: number
  isActive?: boolean
}

function formatTokensCompact(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`
  }
  if (n >= 1_000) {
    const val = Math.round(n / 1_000)
    return `${val}K`
  }
  return String(n)
}

export function ContextMeter({ percentUsed, totalTokens, contextLimit = 1_000_000, isActive }: ContextMeterProps) {
  // Recalculate percentage based on actual context limit
  const pct = Math.min(Math.max((totalTokens / contextLimit) * 100, 0), 100)

  const trackColor = isActive ? "#333" : "#e0e0e0"
  const fillColor = isActive ? "#fff" : "#000"
  const textColor = isActive ? "#999" : "#999"

  return (
    <div className="w-full">
      <div
        className="w-full h-1"
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
      <div className="text-xs mt-1 font-mono" style={{ color: textColor }}>
        {formatTokensCompact(totalTokens)} / {formatTokensCompact(contextLimit)}
      </div>
    </div>
  )
}
