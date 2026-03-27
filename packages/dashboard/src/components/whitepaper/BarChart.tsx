"use client"

interface BarChartItem {
  label: string
  value: number
  color?: string
  suffix?: string
}

interface BarChartProps {
  items: BarChartItem[]
  maxValue?: number
  title?: string
}

export function BarChart({ items, maxValue, title }: BarChartProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value))

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#161616",
        border: "1px solid #2a2a2a",
        borderRadius: "2px",
      }}
    >
      {title && (
        <p className="text-xs text-muted uppercase tracking-widest mb-4 font-mono">
          {title}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.max((item.value / max) * 100, 2)
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#e0e0e0]">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-muted">
                  {item.value.toLocaleString()}
                  {item.suffix ?? ""}
                </span>
              </div>
              <div
                className="w-full h-4"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid #2a2a2a",
                  borderRadius: "1px",
                }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color ?? "#6b8cae",
                    borderRadius: "0px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
