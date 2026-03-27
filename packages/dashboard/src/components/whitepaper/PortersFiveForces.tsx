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
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #000000",
      }}
    >
      <p className="text-xs text-[#666666] uppercase tracking-widest mb-4 font-mono">
        Porter&apos;s Five Forces (1-10 threat level)
      </p>
      <div className="space-y-4">
        {forces.map((f, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-[#000000]">
                {f.force}
              </span>
              <span className="text-xs font-mono text-[#000000] font-bold">
                {f.score}/10
              </span>
            </div>
            <div
              className="w-full h-3 mb-1"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${f.score * 10}%`,
                  backgroundColor: "#000000",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p className="text-[10px] font-mono text-[#666666]">{f.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
