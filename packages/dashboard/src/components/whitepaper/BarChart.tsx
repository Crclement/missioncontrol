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
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
      }}
    >
      {title && (
        <p className="text-xs text-[#666666] uppercase tracking-widest mb-4 font-mono">
          {title}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.max((item.value / max) * 100, 2)
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#000000]">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-[#666666]">
                  {item.value.toLocaleString()}
                  {item.suffix ?? ""}
                </span>
              </div>
              <div
                className="w-full h-4"
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color ?? "#000000",
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
