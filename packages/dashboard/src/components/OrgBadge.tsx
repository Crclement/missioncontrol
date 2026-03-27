"use client"

interface OrgBadgeProps {
  isPersonal: boolean
  org?: string
  remote?: string
}

export function OrgBadge({ isPersonal, org, remote }: OrgBadgeProps) {
  const label = isPersonal ? "personal" : org ?? "org"
  const color = isPersonal ? "#6b6b6b" : "#6b8cae"

  return (
    <span className="text-xs font-mono" style={{ color }}>
      @ {label}
    </span>
  )
}
