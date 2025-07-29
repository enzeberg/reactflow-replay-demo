import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Viewport,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useReplay } from './hooks/useReplay'
import { ReplayEvent } from './types/replay'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

let nodeId = 0
const getId = () => `node_${nodeId++}`

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })

  const { replayState, recordEvent, startReplay, stopReplay, clearEvents } =
    useReplay()

  const initialNodesRef = useRef<Node[]>([])
  const initialEdgesRef = useRef<Edge[]>([])

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes)

      // 记录节点变化事件
      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false) {
          recordEvent('node_update', {
            nodeId: change.id,
            position: change.position,
          })
        }
      })
    },
    [onNodesChange, recordEvent]
  )

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes)

      // 记录边变化事件
      changes.forEach((change) => {
        if (change.type === 'remove') {
          recordEvent('edge_delete', { edgeId: change.id })
        }
      })
    },
    [onEdgesChange, recordEvent]
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge_${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle || null,
        targetHandle: connection.targetHandle || null,
      }

      setEdges((eds) => addEdge(newEdge, eds))
      recordEvent('edge_add', newEdge)
    },
    [setEdges, recordEvent]
  )

  const onViewportChange = useCallback(
    (newViewport: Viewport) => {
      setViewport(newViewport)
      recordEvent('viewport_change', newViewport)
    },
    [recordEvent]
  )

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: getId(),
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: { label: `Node ${nodeId}` },
      type: 'default',
    }

    setNodes((nds) => [...nds, newNode])
    recordEvent('node_add', newNode)
  }, [setNodes, recordEvent])

  const handleReplay = useCallback(() => {
    if (replayState.isReplaying) {
      stopReplay()
      return
    }

    // 保存当前状态作为初始状态
    initialNodesRef.current = [...nodes]
    initialEdgesRef.current = [...edges]

    const applyEvent = (event: ReplayEvent) => {
      switch (event.eventType) {
        case 'snapshot':
          setNodes(event.data.nodes || [])
          setEdges(event.data.edges || [])
          setViewport(event.data.viewport || { x: 0, y: 0, zoom: 1 })
          break
        case 'node_add':
          setNodes((nds) => [...nds, event.data])
          break
        case 'node_update':
          setNodes((nds) =>
            nds.map((node) =>
              node.id === event.data.nodeId
                ? { ...node, position: event.data.position }
                : node
            )
          )
          break
        case 'node_delete':
          setNodes((nds) => nds.filter((node) => node.id !== event.data.nodeId))
          break
        case 'edge_add':
          setEdges((eds) => [...eds, event.data])
          break
        case 'edge_delete':
          setEdges((eds) => eds.filter((edge) => edge.id !== event.data.edgeId))
          break
        case 'viewport_change':
          setViewport(event.data)
          break
      }
    }

    startReplay(applyEvent)
  }, [
    replayState.isReplaying,
    nodes,
    edges,
    startReplay,
    stopReplay,
    setNodes,
    setEdges,
  ])

  const handleClear = useCallback(() => {
    setNodes([])
    setEdges([])
    clearEvents()
    nodeId = 0
  }, [setNodes, setEdges, clearEvents])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          background: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <button
          onClick={addNode}
          disabled={replayState.isReplaying}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: replayState.isReplaying ? '#f5f5f5' : '#fff',
            cursor: replayState.isReplaying ? 'not-allowed' : 'pointer',
          }}
        >
          Add node
        </button>
        <button
          onClick={handleReplay}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: replayState.isReplaying ? '#ff6b6b' : '#4dabf7',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {replayState.isReplaying ? 'Stop replay' : 'Replay'}
        </button>
        <button
          onClick={handleClear}
          disabled={replayState.isReplaying}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            background: replayState.isReplaying ? '#f5f5f5' : '#fff',
            cursor: replayState.isReplaying ? 'not-allowed' : 'pointer',
          }}
        >
          Clear all
        </button>
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginLeft: '10px',
            padding: '4px 8px',
            background: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          Events: {replayState.events.length}
          {replayState.isReplaying && (
            <div style={{ marginTop: '2px' }}>
              Replaying: {replayState.currentEventIndex + 1}/
              {replayState.events.length}
            </div>
          )}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onViewportChange={onViewportChange}
        viewport={viewport}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default App
