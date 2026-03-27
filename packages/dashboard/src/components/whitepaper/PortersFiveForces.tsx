"use client"

interface ForceItem {
  force: string
  score: number
  note: string
}

interface PortersFiveForcesProps {
  forces: ForceItem[]
}

export function PortersFiveForces({ forces }: PortersFiveForcesProps) {
  const getColor = (score: number) => {
    if (score <= 3) return "#7c9a72"
    if (score <= 6) return "#c4956a"
    return "#b85c5c"
  }

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#161616",
        border: "1px solid #2a2a2a",
        borderRadius: "2px",
      }}
    >
      <p className="text-xs text-muted uppercase tracking-widest mb-4 font-mono">
        Porter&apos;s Five Forces (1-10 threat level)
      </p>
      <div className="space-y-4">
        {forces.map((f, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-[#e0e0e0]">
                {f.force}
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: getColor(f.score) }}
              >
                {f.score}/10
              </span>
            </div>
            <div
              className="w-full h-3 mb-1"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid #2a2a2a",
                borderRadius: "1px",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${f.score * 10}%`,
                  backgroundColor: getColor(f.score),
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted">{f.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
