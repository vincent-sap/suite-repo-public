import { useState } from 'react'

/**
 * Manages a drag-and-drop reorderable list for any grid layout engine.
 * Pass `onOrderChange` to CardGrid / CardGridCells / CardGridFlexWidth.
 *
 * @param items - The initial ordered array of items (any type).
 * @returns `orderedItems` reflecting the current user-defined order, and
 *          `onOrderChange(draggedIndex, dropIndex)` to hand to the grid.
 */
export function useCardOrder<T>(items: T[]) {
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i))

  const orderedItems = order.map(i => items[i])

  const onOrderChange = (draggedIndex: number, dropIndex: number) => {
    setOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(draggedIndex, 1)
      next.splice(dropIndex, 0, moved)
      return next
    })
  }

  return { orderedItems, onOrderChange }
}
