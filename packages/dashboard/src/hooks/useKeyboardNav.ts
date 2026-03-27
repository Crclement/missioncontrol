"use client"

import { useState, useEffect, useCallback } from "react"

interface UseKeyboardNavOptions {
  sessionCount: number
  onReconnect: () => void
}

export function useKeyboardNav({ sessionCount, onReconnect }: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [showHelp, setShowHelp] = useState(false)
  const [inputOpen, setInputOpen] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      if (e.key === "Escape") {
        if (inputOpen) {
          setInputOpen(false)
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
        return
      }

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return -1
          return prev < sessionCount - 1 ? prev + 1 : 0
        })
        setInputOpen(false)
        return
      }

      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (sessionCount === 0) return -1
          return prev > 0 ? prev - 1 : sessionCount - 1
        })
        setInputOpen(false)
        return
      }

      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault()
        setInputOpen(true)
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
    setShowHelp,
    setInputOpen,
    setFocusedIndex,
  }
}
