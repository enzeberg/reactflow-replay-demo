export interface ReplayEvent {
  timestamp: number
  eventType: 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_update' | 'edge_delete' | 'viewport_change' | 'snapshot'
  data: any
  userId?: string
  sessionId?: string
}

export interface ReplayState {
  events: ReplayEvent[]
  isReplaying: boolean
  replaySpeed: number
  currentEventIndex: number
}