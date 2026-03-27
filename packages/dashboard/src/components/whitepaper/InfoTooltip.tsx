"use client"

import { useState, useRef, useEffect } from "react"

interface InfoTooltipProps {
  term: string
  definition: string
}

export function InfoTooltip({ term, definition }: InfoTooltipProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const [above, setAbove] = useState(false)

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setAbove(rect.top > 200)
    }
  }, [show])

  return (
    <span
      ref={ref}
      className="relative inline-block cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        className="text-slate"
        style={{
          borderBottom: "1px dashed #6b8cae",
        }}
      >
        {term}
      </span>
      {show && (
        <span
          className="absolute z-50 left-0 w-64 p-3 text-xs text-[#e0e0e0] font-mono"
          style={{
            backgroundColor: "#161616",
            border: "1px solid #2a2a2a",
            borderRadius: "2px",
            ...(above ? { bottom: "100%", marginBottom: "4px" } : { top: "100%", marginTop: "4px" }),
          }}
        >
          {definition}
        </span>
      )}
    </span>
  )
}
