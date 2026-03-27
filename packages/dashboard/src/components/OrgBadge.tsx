"use client"

interface OrgBadgeProps {
  isPersonal: boolean
  org?: string
  remote?: string
}

export function OrgBadge({ isPersonal, org }: OrgBadgeProps) {
  const label = isPersonal ? "personal" : org ?? "org"

  return (
    <span className="text-sm font-mono text-secondary">
      · {label}
    </span>
  )
}
