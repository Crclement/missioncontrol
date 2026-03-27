"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { EnrichedSession, WSMessage } from "@missioncontrol/shared"

export type ConnectionState = "connecting" | "connected" | "disconnected"

const WS_URL = "ws://localhost:45557"
const MAX_BACKOFF_MS = 30_000
const BASE_BACKOFF_MS = 1_000

export function useAgent() {
  const [sessions, setSessions] = useState<EnrichedSession[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected")
  const wsRef = useRef<WebSocket | null>(null)
  const backoffRef = useRef(BASE_BACKOFF_MS)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionState("connecting")

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionState("connected")
      backoffRef.current = BASE_BACKOFF_MS
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)

        switch (msg.type) {
          case "sessions":
            setSessions(msg.data)
            break

          case "session-update":
            setSessions((prev) => {
              const idx = prev.findIndex((s) => s.pid === msg.data.pid)
              if (idx === -1) return [...prev, msg.data]
              const next = [...prev]
              next[idx] = msg.data
              return next
            })
            break

          case "session-removed":
            setSessions((prev) => prev.filter((s) => s.pid !== msg.pid))
            break
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnectionState("disconnected")
      wsRef.current = null
      scheduleReconnect()
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS)
      connect()
    }, backoffRef.current)
  }, [connect])

  const sendResponse = useCallback(
    (sessionId: string, configDir: string, message: string) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return

      const msg: WSMessage = {
        type: "respond",
        sessionId,
        configDir,
        message,
      }
      wsRef.current.send(JSON.stringify(msg))
    },
    [],
  )

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    wsRef.current?.close()
    backoffRef.current = BASE_BACKOFF_MS
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  return { sessions, connectionState, sendResponse, reconnect }
}
