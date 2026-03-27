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
              className="text-left p-3 text-[#666666] uppercase tracking-widest"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #000000",
              }}
            >
              Feature
            </th>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left p-3 uppercase tracking-widest"
                style={{
                  backgroundColor: i === highlightCol ? "#000000" : "#f5f5f5",
                  border: "1px solid #000000",
                  color: i === highlightCol ? "#ffffff" : "#666666",
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
                className="p-3 text-[#000000]"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
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
                      vi === highlightCol ? "#f5f5f5" : "#ffffff",
                    border: "1px solid #000000",
                    color: v === "Yes" || v === "Full" ? "#000000" : v === "No" || v === "None" ? "#888888" : "#000000",
                    fontWeight: (v === "Yes" || v === "Full") && vi === highlightCol ? 700 : 400,
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
