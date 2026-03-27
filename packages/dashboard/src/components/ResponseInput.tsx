"use client"

import { useState, useRef, useEffect } from "react"

type SendState = "idle" | "sending" | "sent" | "error"

interface ResponseInputProps {
  onSend: (message: string) => void
  autoFocus?: boolean
}

export function ResponseInput({ onSend, autoFocus }: ResponseInputProps) {
  const [value, setValue] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return

    setSendState("sending")
    try {
      onSend(trimmed)
      setValue("")
      setSendState("sent")
      setTimeout(() => setSendState("idle"), 1500)
    } catch {
      setSendState("error")
      setTimeout(() => setSendState("idle"), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
    // Stop propagation so keyboard nav doesn't fire
    e.stopPropagation()
  }

  const stateLabel =
    sendState === "sending"
      ? "..."
      : sendState === "sent"
        ? "sent"
        : sendState === "error"
          ? "err"
          : null

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-ochre text-sm font-mono select-none">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="respond..."
        className="flex-1 bg-transparent text-sm font-mono text-[#e0e0e0] placeholder:text-muted border-b border-border focus:border-ochre transition-colors"
        style={{ outline: "none" }}
      />
      {stateLabel ? (
        <span className="text-[10px] font-mono text-muted">{stateLabel}</span>
      ) : (
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className="text-xs font-mono text-muted hover:text-[#e0e0e0] disabled:opacity-30 transition-colors"
        >
          send
        </button>
      )}
    </div>
  )
}
