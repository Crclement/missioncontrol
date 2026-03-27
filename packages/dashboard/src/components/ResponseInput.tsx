"use client"

import { useState, useRef, useEffect, useCallback } from "react"

type SendState = "idle" | "sending" | "sent" | "error"

interface ResponseInputProps {
  onSend: (message: string) => void
  autoFocus?: boolean
  voiceMode?: boolean
}

export function ResponseInput({ onSend, autoFocus, voiceMode }: ResponseInputProps) {
  const [value, setValue] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [typing, setTyping] = useState(!voiceMode)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus, typing])

  // Sync voiceMode prop
  useEffect(() => {
    setTyping(!voiceMode)
  }, [voiceMode])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
  }, [value])

  // Detect dictation — text appearing rapidly means Wispr is active
  const prevLen = useRef(0)
  useEffect(() => {
    if (value.length > prevLen.current + 3 && !typing) {
      // Dictation detected, switch to visible typing mode
      setTyping(true)
    }
    prevLen.current = value.length
  }, [value, typing])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    setSendState("sending")
    try {
      onSend(trimmed)
      setValue("")
      prevLen.current = 0
      setSendState("sent")
      setTimeout(() => setSendState("idle"), 1500)
    } catch {
      setSendState("error")
      setTimeout(() => setSendState("idle"), 2000)
    }
  }, [value, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let Escape bubble up to the global handler
    if (e.key === "Escape") return

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
      return
    }

    // In voice mode, any printable key (except space) switches to type mode
    if (!typing && e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setTyping(true)
    }

    // Stop other keys from triggering nav
    e.stopPropagation()
  }

  const stateLabel =
    sendState === "sending" ? "..." : sendState === "sent" ? "sent" : sendState === "error" ? "err" : null

  // Voice mode: show a focused textarea styled as a prompt box
  // The textarea is REAL and on-screen so Wispr Flow can target it
  if (!typing) {
    return (
      <div className="mt-4">
        <div
          className="relative w-full border border-current"
          style={{ borderRadius: "2px" }}
        >
          {/* Prompt label centered over the textarea */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm font-mono font-bold animate-blink"
          >
            ◆ Press spacebar and speak
          </div>
          {/* Real textarea — visible but transparent text, so Wispr can type into it */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={() => setTyping(true)}
            rows={1}
            className="w-full py-3 px-4 bg-transparent text-sm font-mono resize-none text-transparent caret-transparent"
            style={{ outline: "none", minHeight: "2.5em" }}
            autoFocus={autoFocus}
          />
        </div>
        {value && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-mono" style={{ color: "inherit", opacity: 0.6 }}>{value.length} chars</span>
            <button
              onClick={handleSend}
              className="text-xs font-mono font-bold"
            >
              Send
            </button>
          </div>
        )}
      </div>
    )
  }

  // Type mode: standard text input
  return (
    <div className="mt-4">
      <div className="flex items-end gap-2">
        <span className="text-current text-sm font-mono font-bold select-none pb-px">&gt;</span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); prevLen.current = e.target.value.length }}
          onKeyDown={handleKeyDown}
          placeholder="type a response..."
          rows={1}
          className="flex-1 bg-transparent text-sm font-mono text-current placeholder:text-[#888] border-b border-current resize-none leading-relaxed"
          style={{ outline: "none", minHeight: "1.5em", maxHeight: "120px" }}
          autoFocus
        />
        {stateLabel ? (
          <span className="text-xs font-mono pb-px" style={{ opacity: 0.6 }}>{stateLabel}</span>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="text-xs font-mono font-bold text-current disabled:opacity-30 pb-px"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
