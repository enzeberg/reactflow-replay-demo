import { useState, useCallback, useRef } from 'react'
import { ReplayEvent, ReplayState } from '../types/replay'

export const useReplay = () => {
  const [replayState, setReplayState] = useState<ReplayState>({
    events: [],
    isReplaying: false,
    replaySpeed: 1000,
    currentEventIndex: 0,
  })

  const replayTimeoutRef = useRef<number | null>(null)

  const recordEvent = useCallback(
    (eventType: ReplayEvent['eventType'], data: any) => {
      const event: ReplayEvent = {
        timestamp: Date.now(),
        eventType,
        data,
        sessionId: 'demo-session',
      }

      setReplayState((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }))
    },
    []
  )

  const startReplay = useCallback(
    (onApplyEvent: (event: ReplayEvent) => void) => {
      if (replayState.events.length === 0) return

      setReplayState((prev) => ({
        ...prev,
        isReplaying: true,
        currentEventIndex: 0,
      }))

      // 重置到初始状态
      onApplyEvent({
        timestamp: 0,
        eventType: 'snapshot',
        data: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      })

      let eventIndex = 0
      const playNextEvent = () => {
        if (eventIndex >= replayState.events.length) {
          setReplayState((prev) => ({ ...prev, isReplaying: false }))
          return
        }

        const event = replayState.events[eventIndex]
        onApplyEvent(event)

        setReplayState((prev) => ({ ...prev, currentEventIndex: eventIndex }))
        eventIndex++

        replayTimeoutRef.current = setTimeout(
          playNextEvent,
          replayState.replaySpeed
        )
      }

      playNextEvent()
    },
    [replayState.events, replayState.replaySpeed]
  )

  const stopReplay = useCallback(() => {
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current)
      replayTimeoutRef.current = null
    }
    setReplayState((prev) => ({ ...prev, isReplaying: false }))
  }, [])

  const clearEvents = useCallback(() => {
    setReplayState((prev) => ({ ...prev, events: [] }))
  }, [])

  return {
    replayState,
    recordEvent,
    startReplay,
    stopReplay,
    clearEvents,
  }
}
