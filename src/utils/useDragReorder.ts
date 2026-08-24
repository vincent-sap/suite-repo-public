import { useRef, useState } from 'react'
import { reorderByIndex } from './dragReorder'

export interface DragHandlers {
  dragging: number | null
  onDragStart: (index: number) => React.DragEventHandler
  onDragOver: (index: number) => React.DragEventHandler
  onDragEnd: React.DragEventHandler
}

export function useDragReorder<T>(
  items: T[],
  setItems: (items: T[]) => void,
  onReorder?: () => void,
): DragHandlers {
  const [dragging, setDragging] = useState<number | null>(null)
  const dragIndex = useRef<number | null>(null)

  const onDragStart = (index: number): React.DragEventHandler => (e) => {
    e.dataTransfer.effectAllowed = 'move'
    dragIndex.current = index
    setDragging(index)
  }

  const onDragOver = (index: number): React.DragEventHandler => (e) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === index) return
    setItems(reorderByIndex(items, from, index))
    dragIndex.current = index
    setDragging(index)
    onReorder?.()
  }

  const onDragEnd: React.DragEventHandler = () => {
    dragIndex.current = null
    setDragging(null)
  }

  return { dragging, onDragStart, onDragOver, onDragEnd }
}
