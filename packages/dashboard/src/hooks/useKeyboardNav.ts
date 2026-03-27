"use client"

import { useState, useEffect, useCallback } from "react"

export type ViewMode = "grid" | "orbital"

interface UseKeyboardNavOptions {
  sessionCount: number
  onReconnect: () => void
}

export function useKeyboardNav({ sessionCount, onReconnect }: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [showHelp, setShowHelp] = useState(false)
  const [inputOpen, setInputOpen] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      if (e.key === "Escape") {
        if (inputOpen) {
          setInputOpen(false)
          setVoiceMode(false)
          return
        }
        if (showHelp) {
          setShowHelp(false)
          return
        }
        setFocusedIndex(-1)
        return
      }

      // Don't handle other keys when typing in an input
      if (isInput) return

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

      // Number keys 1-9 to focus session
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9 && num <= sessionCount) {
        e.preventDefault()
        setFocusedIndex(num - 1)
        setInputOpen(false)
        setVoiceMode(false)
        return
      }

      // Arrow keys + j/k for navigation
      if (e.key === "j" || e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return -1
          return prev < sessionCount - 1 ? prev + 1 : 0
        })
        setInputOpen(false)
        setVoiceMode(false)
        return
      }

      if (e.key === "k" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return -1
          return prev > 0 ? prev - 1 : sessionCount - 1
        })
        setInputOpen(false)
        setVoiceMode(false)
        return
      }

      // Spacebar = open voice input (Wispr Flow)
      if (e.key === " " && focusedIndex >= 0) {
        e.preventDefault()
        setInputOpen(true)
        setVoiceMode(true)
        return
      }

      // Enter = open type input
      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault()
        setInputOpen(true)
        setVoiceMode(false)
        return
      }
    },
    [sessionCount, focusedIndex, showHelp, inputOpen, onReconnect],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Clamp focused index when session count changes
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
    setShowHelp,
    setInputOpen,
    setVoiceMode,
    setFocusedIndex,
    setViewMode,
  }
}
