"use client"

interface ComparisonRow {
  feature: string
  values: string[]
}

interface ComparisonTableProps {
  headers: string[]
  rows: ComparisonRow[]
  highlightCol?: number
}

export function ComparisonTable({
  headers,
  rows,
  highlightCol = 0,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-xs font-mono"
        style={{
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th
              className="text-left p-3 text-muted uppercase tracking-widest"
              style={{
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
              }}
            >
              Feature
            </th>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left p-3 uppercase tracking-widest"
                style={{
                  backgroundColor: i === highlightCol ? "#1a1f1a" : "#161616",
                  border: "1px solid #2a2a2a",
                  color: i === highlightCol ? "#7c9a72" : "#6b6b6b",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td
                className="p-3 text-[#e0e0e0]"
                style={{
                  backgroundColor: "#0c0c0c",
                  border: "1px solid #2a2a2a",
                }}
              >
                {row.feature}
              </td>
              {row.values.map((v, vi) => (
                <td
                  key={vi}
                  className="p-3"
                  style={{
                    backgroundColor:
                      vi === highlightCol ? "#1a1f1a" : "#0c0c0c",
                    border: "1px solid #2a2a2a",
                    color: v === "Yes" || v === "Full" ? "#7c9a72" : v === "No" || v === "None" ? "#b85c5c" : "#e0e0e0",
                  }}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
