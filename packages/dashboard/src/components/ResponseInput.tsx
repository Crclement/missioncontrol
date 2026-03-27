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
  const hiddenRef = useRef<HTMLTextAreaElement>(null)

  // Voice mode: focus hidden textarea for Wispr Flow
  useEffect(() => {
    if (!autoFocus) return
    if (typing) {
      textareaRef.current?.focus()
    } else {
      hiddenRef.current?.focus()
    }
  }, [autoFocus, typing])

  // If voiceMode prop changes, sync
  useEffect(() => {
    setTyping(!voiceMode)
  }, [voiceMode])

  // Detect dictation in hidden field
  const prevLen = useRef(0)
  const handleHiddenChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setValue(v)
    if (v.length > prevLen.current + 2) {
      // Dictation detected - show the textarea with dictated text
      setTyping(true)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
    prevLen.current = v.length
  }, [])

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
  }, [value])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    setSendState("sending")
    try {
      onSend(trimmed)
      setValue("")
      prevLen.current = 0
      setTyping(false)
      setSendState("sent")
      setTimeout(() => setSendState("idle"), 1500)
    } catch {
      setSendState("error")
      setTimeout(() => setSendState("idle"), 2000)
    }
  }, [value, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    e.stopPropagation()
  }

  const handleHiddenKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    // Any printable character → switch to type mode
    if (e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setTyping(true)
      setValue((prev) => prev + e.key)
      e.preventDefault()
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
    e.stopPropagation()
  }

  const stateLabel =
    sendState === "sending" ? "..." : sendState === "sent" ? "sent" : sendState === "error" ? "err" : null

  // Voice mode: show prompt, no visible input
  if (!typing) {
    return (
      <div className="mt-4">
        <div
          className="w-full py-3 text-sm font-mono font-bold border border-current text-center cursor-pointer select-none"
          onClick={() => {
            setTyping(true)
            setTimeout(() => textareaRef.current?.focus(), 0)
          }}
        >
          ◆ Press spacebar and speak to respond
        </div>
        {/* Hidden textarea for Wispr Flow */}
        <textarea
          ref={hiddenRef}
          value={value}
          onChange={handleHiddenChange}
          onKeyDown={handleHiddenKeyDown}
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          tabIndex={-1}
        />
      </div>
    )
  }

  // Type mode: show text input
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
          <span className="text-xs font-mono text-[#666] pb-px">{stateLabel}</span>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="text-xs font-mono font-bold text-current disabled:text-[#bbb] pb-px"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
