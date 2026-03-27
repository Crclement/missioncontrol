"use client"

import { useState, useRef, useEffect, useCallback } from "react"

type SendState = "idle" | "sending" | "sent" | "error"
type InputMode = "voice" | "type"

interface ResponseInputProps {
  onSend: (message: string) => void
  autoFocus?: boolean
}

export function ResponseInput({ onSend, autoFocus }: ResponseInputProps) {
  const [value, setValue] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [mode, setMode] = useState<InputMode>("voice")
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevValueRef = useRef("")

  // Auto-focus in voice mode: focus the textarea so Wispr Flow can type into it
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Detect Wispr Flow dictation: value changes without keyboard events
  // When Wispr is active, text appears rapidly without keydown events
  const detectDictation = useCallback(() => {
    if (value.length > prevValueRef.current.length + 3) {
      // Multiple characters appeared at once - likely dictation
      setIsListening(true)
      setMode("voice")
    }
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    detectDictation()
  }, [detectDictation])

  // Clear listening state after dictation pauses
  useEffect(() => {
    if (!isListening) return
    const timer = setTimeout(() => setIsListening(false), 1500)
    return () => clearTimeout(timer)
  }, [isListening, value])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }, [value])

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      setMode(mode === "voice" ? "type" : "voice")
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
    <div className="mt-3 space-y-1">
      {/* Mode indicator - voice is primary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode("voice")
              textareaRef.current?.focus()
            }}
            className={`flex items-center gap-1 text-[10px] font-mono transition-colors ${
              mode === "voice" ? "text-ochre" : "text-muted hover:text-[#888]"
            }`}
          >
            <span className={isListening ? "animate-pulse" : ""}>
              {isListening ? "◉" : "○"}
            </span>
            wispr
          </button>
          <span className="text-[10px] text-[#333]">|</span>
          <button
            onClick={() => {
              setMode("type")
              textareaRef.current?.focus()
            }}
            className={`text-[10px] font-mono transition-colors ${
              mode === "type" ? "text-muted" : "text-[#444] hover:text-[#666]"
            }`}
          >
            type
          </button>
        </div>
        <span className="text-[10px] text-[#333] font-mono">tab to switch</span>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <span className="text-ochre text-sm font-mono select-none pb-px">
          {mode === "voice" ? "◆" : ">"}
        </span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (mode === "voice") setIsListening(false)
          }}
          placeholder={
            mode === "voice"
              ? "speak with wispr flow..."
              : "type a response..."
          }
          rows={1}
          className="flex-1 bg-transparent text-sm font-mono text-[#e0e0e0] placeholder:text-[#444] border-b border-border focus:border-ochre transition-colors resize-none leading-relaxed"
          style={{ outline: "none", minHeight: "1.5em", maxHeight: "120px" }}
        />
        {stateLabel ? (
          <span className="text-[10px] font-mono text-muted pb-px">{stateLabel}</span>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="text-xs font-mono text-muted hover:text-[#e0e0e0] disabled:opacity-30 transition-colors pb-px"
          >
            send
          </button>
        )}
      </div>
    </div>
  )
}
