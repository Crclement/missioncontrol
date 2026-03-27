"use client"

import { useState, useRef, useEffect, useCallback } from "react"

type SendState = "idle" | "sending" | "sent" | "error"
type InputMode = "voice" | "type"

interface ResponseInputProps {
  onSend: (message: string) => void
  autoFocus?: boolean
  voiceMode?: boolean
}

export function ResponseInput({ onSend, autoFocus, voiceMode: initialVoiceMode }: ResponseInputProps) {
  const [value, setValue] = useState("")
  const [sendState, setSendState] = useState<SendState>("idle")
  const [mode, setMode] = useState<InputMode>(initialVoiceMode ? "voice" : "type")
  const [dictationVisible, setDictationVisible] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hiddenRef = useRef<HTMLTextAreaElement>(null)
  const prevValueRef = useRef("")

  // Sync mode when voiceMode prop changes
  useEffect(() => {
    setMode(initialVoiceMode ? "voice" : "type")
  }, [initialVoiceMode])

  // Auto-focus based on mode
  useEffect(() => {
    if (!autoFocus) return
    if (mode === "type") {
      textareaRef.current?.focus()
    } else if (mode === "voice") {
      // Focus hidden textarea to activate Wispr Flow
      hiddenRef.current?.focus()
    }
  }, [autoFocus, mode])

  // Detect dictation: text appearing rapidly in hidden textarea
  const handleHiddenChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value
    setValue(newVal)
    if (newVal.length > prevValueRef.current.length + 3) {
      setDictationVisible(true)
    }
    prevValueRef.current = newVal
  }, [])

  // Auto-resize visible textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }, [value])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return

    setSendState("sending")
    try {
      onSend(trimmed)
      setValue("")
      setDictationVisible(false)
      prevValueRef.current = ""
      setSendState("sent")
      // Return to voice mode after sending
      setMode("voice")
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
    if (e.key === "Tab") {
      e.preventDefault()
      setMode(mode === "voice" ? "type" : "voice")
    }
    e.stopPropagation()
  }

  const handleHiddenKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      setMode("type")
    }
    // Any character key (not space, not modifier) switches to type mode
    if (e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setMode("type")
      setValue((prev) => prev + e.key)
      e.preventDefault()
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
    e.stopPropagation()
  }

  const switchToType = () => {
    setMode("type")
    setTimeout(() => textareaRef.current?.focus(), 0)
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
    <div className="mt-4">
      {mode === "voice" && !dictationVisible ? (
        /* Voice mode: large clear button */
        <div>
          <button
            onClick={switchToType}
            className="w-full py-3 text-sm font-mono font-bold border border-black flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
          >
            <span>&#9670;</span> Press Space to Talk
          </button>
          {/* Hidden textarea for Wispr Flow activation */}
          <textarea
            ref={hiddenRef}
            value={value}
            onChange={handleHiddenChange}
            onKeyDown={handleHiddenKeyDown}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            style={{ position: "absolute", left: "-9999px" }}
            tabIndex={-1}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#999] font-mono">
              Tab to type
            </span>
          </div>
        </div>
      ) : mode === "voice" && dictationVisible ? (
        /* Voice mode with dictation visible */
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono font-bold animate-pulse">&#9679;</span>
            <span className="text-xs font-mono text-[#999]">Listening...</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-black text-sm font-mono font-bold select-none pb-px">&#9670;</span>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-1 bg-transparent text-sm font-mono text-black placeholder:text-[#ccc] border-b border-black focus:border-black transition-colors resize-none leading-relaxed"
              style={{ outline: "none", minHeight: "1.5em", maxHeight: "120px" }}
              autoFocus
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
      ) : (
        /* Type mode */
        <div>
          <div className="flex items-end gap-2">
            <span className="text-black text-sm font-mono font-bold select-none pb-px">&gt;</span>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type a response..."
              rows={1}
              className="flex-1 bg-transparent text-sm font-mono text-black placeholder:text-[#ccc] border-b border-black focus:border-black transition-colors resize-none leading-relaxed"
              style={{ outline: "none", minHeight: "1.5em", maxHeight: "120px" }}
              autoFocus
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
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#999] font-mono">
              Tab for voice
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
