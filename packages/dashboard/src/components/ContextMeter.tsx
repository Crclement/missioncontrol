"use client"

interface ContextMeterProps {
  percentUsed: number
  totalTokens: number
  isActive?: boolean
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function ContextMeter({ percentUsed, totalTokens, isActive }: ContextMeterProps) {
  const pct = Math.min(Math.max(percentUsed, 0), 100)

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
        {Math.round(pct)}% · {formatTokens(totalTokens)} tokens
      </div>
    </div>
  )
}
