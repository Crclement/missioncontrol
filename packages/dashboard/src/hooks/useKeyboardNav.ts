"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type ViewMode = "grid" | "orbital"

interface UseKeyboardNavOptions {
  sessionCount: number
  cols: number
  onReconnect: () => void
  onEnterSession?: (index: number) => void
  sessionNeedsInput?: (index: number) => boolean
}

export function useKeyboardNav({ sessionCount, cols, onReconnect, onEnterSession, sessionNeedsInput }: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [showHelp, setShowHelp] = useState(false)
  const [inputOpen, setInputOpen] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [initialChar, setInitialChar] = useState("")

  // Use ref to avoid stale closure — this is the critical fix
  const inputOpenRef = useRef(inputOpen)
  inputOpenRef.current = inputOpen

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      // Escape ALWAYS works
      if (e.key === "Escape") {
        e.preventDefault()
        if (inputOpenRef.current) {
          setInputOpen(false)
          setVoiceMode(false)
          ;(document.activeElement as HTMLElement)?.blur()
          return
        }
        if (showHelp) {
          setShowHelp(false)
          return
        }
        if (focusedIndex >= 0) {
          setFocusedIndex(-1)
          return
        }
        return
      }

      // If typing in an input element OR input panel is open, block all nav
      if (isInput || inputOpenRef.current) return

      if (e.key === "?") {
        e.preventDefault()
        setShowHelp((prev) => !prev)
        return
      }

      if (e.key === "v") {
        e.preventDefault()
        setViewMode((prev) => (prev === "grid" ? "orbital" : "grid"))
        return
      }

      if (e.key === "r") {
        e.preventDefault()
        onReconnect()
        return
      }

      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9 && num <= sessionCount) {
        e.preventDefault()
        setFocusedIndex(num - 1)
        return
      }

      if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return 0
          if (prev < 0) return 0
          return prev < sessionCount - 1 ? prev + 1 : 0
        })
        return
      }

      if (e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return 0
          if (prev < 0) return 0
          return prev > 0 ? prev - 1 : sessionCount - 1
        })
        return
      }

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return 0
          if (prev < 0) return 0
          const next = prev + cols
          return next < sessionCount ? next : prev % cols < sessionCount ? prev % cols : 0
        })
        return
      }

      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return 0
          if (prev < 0) return sessionCount - 1
          const next = prev - cols
          if (next >= 0) return next
          const col = prev % cols
          const lastRowStart = Math.floor((sessionCount - 1) / cols) * cols
          const target = lastRowStart + col
          return target < sessionCount ? target : sessionCount - 1
        })
        return
      }

      // Spacebar = open voice input
      if (e.key === " " && focusedIndex >= 0) {
        e.preventDefault()
        setInputOpen(true)
        setVoiceMode(true)
        return
      }

      // Enter: needs-input → type mode, otherwise → open in Chrome
      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault()
        const needs = sessionNeedsInput?.(focusedIndex) ?? false
        if (needs) {
          setInputOpen(true)
          setVoiceMode(false)
        } else {
          onEnterSession?.(focusedIndex)
        }
        return
      }

      // Any printable character = open type mode with that char
      if (
        focusedIndex >= 0 &&
        e.key.length === 1 &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        e.key !== " "
      ) {
        e.preventDefault()
        setInputOpen(true)
        setVoiceMode(false)
        setInitialChar(e.key)
        return
      }
    },
    [sessionCount, cols, focusedIndex, showHelp, onReconnect, onEnterSession, sessionNeedsInput],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (focusedIndex >= sessionCount) {
      setFocusedIndex(sessionCount > 0 ? sessionCount - 1 : -1)
    }
  }, [sessionCount, focusedIndex])

  return {
    focusedIndex,
    showHelp,
    inputOpen,
    voiceMode,
    viewMode,
    initialChar,
    setShowHelp,
    setInputOpen,
    setVoiceMode,
    setFocusedIndex,
    setViewMode,
    setInitialChar,
  }
}
