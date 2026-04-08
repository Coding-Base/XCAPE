/**
 * Custom React hook for WebSocket connections to simulation progress updates.
 * 
 * Usage:
 * const progress = useSimulationWebSocket(simulationId)
 * 
 * Returns: { connected, message, status, iteration, error }
 */

import { useEffect, useRef, useCallback, useState } from 'react'

interface ProgressMessage {
  type: 'connection_established' | 'progress_update' | 'simulation_complete' | 'simulation_error'
  message: string
  iteration?: number
  status?: string
  match_quality?: number
  best_iteration?: number
  duration?: number
  timestamp?: string
  error?: string
}

interface WebSocketState {
  connected: boolean
  message: ProgressMessage | null
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
  iteration: number
  error: string | null
}

/**
 * Custom hook to establish WebSocket connection for simulation progress
 * @param simulationId - ID of the simulation to monitor
 * @param enabled - Whether to enable the connection (default: true)
 * @returns WebSocket state object
 */
export const useSimulationWebSocket = (simulationId: number | string | null, enabled: boolean = true): WebSocketState => {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectCount = useRef(0)
  const maxReconnectAttempts = 5

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    message: null,
    status: 'idle',
    iteration: 0,
    error: null,
  })

  // Get WebSocket URL - points to backend server, not frontend dev server
  const getWebSocketUrl = useCallback(() => {
    if (!simulationId) return null

    // Get backend API base URL from environment or default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    // Extract the backend server host from the API URL
    // e.g., 'http://localhost:8000/api' -> 'localhost:8000'
    const apiUrlObj = new URL(apiUrl)
    const backendHost = apiUrlObj.host
    
    // Determine protocol (ws or wss)
    const protocol = apiUrlObj.protocol === 'https:' ? 'wss:' : 'ws:'
    
    return `${protocol}//${backendHost}/ws/simulation/${simulationId}/progress/`
  }, [simulationId])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || !simulationId || ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = getWebSocketUrl()
    if (!wsUrl) return

    try {
      setState((prev) => ({ ...prev, status: 'connecting' }))
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log(`[WebSocket] Connected to ${wsUrl}`)
        setState((prev) => ({
          ...prev,
          connected: true,
          status: 'connected',
          error: null,
        }))
        reconnectCount.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ProgressMessage
          console.log('[WebSocket] Received:', data)
          
          if (data.type === 'simulation_complete') {
            console.log('[WebSocket] ✅ SIMULATION COMPLETE', {
              match_quality: data.match_quality,
              duration: data.duration,
              best_iteration: data.best_iteration,
              message: data.message,
            })
          }

          setState((prev) => {
            let newStatus = prev.status
            
            // Update status based on message type
            if (data.type === 'simulation_error') {
              newStatus = 'error'
            } else if (data.type === 'simulation_complete') {
              newStatus = 'connected' // Keep connected but display will check message type
            } else if (data.type === 'connection_established') {
              newStatus = 'connected'
            } else {
              newStatus = 'connected'
            }

            return {
              ...prev,
              message: data,
              status: newStatus,
              iteration: data.iteration || prev.iteration,
              error: data.type === 'simulation_error' ? data.error || null : null,
            }
          })
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        setState((prev) => ({
          ...prev,
          error: 'WebSocket connection error',
          status: 'error',
        }))
      }

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected')
        setState((prev) => ({
          ...prev,
          connected: false,
          status: 'disconnected',
        }))

        // Attempt to reconnect if enabled and haven't exceeded max attempts
        if (enabled && reconnectCount.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000)
          reconnectCount.current++
          console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${reconnectCount.current})`)

          reconnectTimeout.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error)
      setState((prev) => ({
        ...prev,
        error: String(error),
        status: 'error',
      }))
    }
  }, [enabled, simulationId, getWebSocketUrl])

  // Cleanup and auto-reconnect
  useEffect(() => {
    if (!enabled || !simulationId) {
      // Close connection if disabled
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close()
      }
      return
    }

    connect()

    return () => {
      // Cleanup on unmount
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close()
      }
    }
  }, [enabled, simulationId, connect])

  return state
}
