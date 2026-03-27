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

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const detectDictation = useCallback(() => {
    if (value.length > prevValueRef.current.length + 3) {
      setIsListening(true)
      setMode("voice")
    }
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    detectDictation()
  }, [detectDictation])

  useEffect(() => {
    if (!isListening) return
    const timer = setTimeout(() => setIsListening(false), 1500)
    return () => clearTimeout(timer)
  }, [isListening, value])

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
    <div className="mt-4 space-y-2">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMode("voice"); textareaRef.current?.focus() }}
            className={`text-xs font-mono font-bold transition-colors ${
              mode === "voice" ? "text-black" : "text-[#ccc] hover:text-[#999]"
            }`}
          >
            <span className={isListening ? "animate-pulse" : ""}>
              {isListening ? "●" : "○"}
            </span>
            {" "}Wispr
          </button>
          <button
            onClick={() => { setMode("type"); textareaRef.current?.focus() }}
            className={`text-xs font-mono transition-colors ${
              mode === "type" ? "text-black font-bold" : "text-[#ccc] hover:text-[#999]"
            }`}
          >
            Type
          </button>
        </div>
        <span className="text-[10px] text-[#ccc] font-mono">tab</span>
      </div>

      {/* Input */}
      <div className="flex items-end gap-2">
        <span className="text-black text-sm font-mono font-bold select-none pb-px">
          {mode === "voice" ? "◆" : ">"}
        </span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (mode === "voice") setIsListening(false) }}
          placeholder={
            mode === "voice"
              ? "speak with wispr flow..."
              : "type a response..."
          }
          rows={1}
          className="flex-1 bg-transparent text-sm font-mono text-black placeholder:text-[#ccc] border-b border-black focus:border-black transition-colors resize-none leading-relaxed"
          style={{ outline: "none", minHeight: "1.5em", maxHeight: "120px" }}
        />
        {stateLabel ? (
          <span className="text-xs font-mono text-[#999] pb-px">{stateLabel}</span>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="text-xs font-mono font-bold text-black hover:text-black disabled:text-[#ccc] transition-colors pb-px"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
