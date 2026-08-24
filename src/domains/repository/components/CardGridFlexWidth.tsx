import { useState, useRef, Children, useEffect, type ReactNode } from 'react';
import { CardPlaceholder } from './CardPlaceholder';

interface CardGridFlexWidthProps {
  children: ReactNode;
  stretch?: boolean;
  draggable?: boolean;
  minCardWidth?: string;
  maxCardWidth?: string;
  onOrderChange?: (draggedIndex: number, dropIndex: number) => void;
  isAnyCardDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function CardGridFlexWidth({ children, stretch = false, draggable = false, minCardWidth = 'max(320px, calc((100% - 5 * var(--spacing-sm)) / 6))', maxCardWidth = '1fr', onOrderChange, isAnyCardDragging = false, onDragStart, onDragEnd }: CardGridFlexWidthProps) {
  const childrenArray = Children.toArray(children);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedSize, setDraggedSize] = useState({ width: 0, height: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (!draggable) return;

    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const visibleHeight = rect.height;

    setDraggedIndex(index);
    setDropIndex(index);
    setDragOffset({ x: offsetX, y: offsetY });
    setMousePos({ x: e.clientX, y: e.clientY });
    setDraggedSize({ width: rect.width, height: visibleHeight });

    if (onDragStart) {
      onDragStart();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedIndex === null || !gridRef.current) return;

    setMousePos({ x: e.clientX, y: e.clientY });

    const cards = gridRef.current.querySelectorAll('[data-card-index]');
    if (cards.length === 0) return;

    interface CardPosition {
      index: number;
      rect: DOMRect;
      row: number;
    }

    const cardPositions: CardPosition[] = [];
    const rowMap: { [key: number]: CardPosition[] } = {};

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const rowKey = Math.round(rect.top / 5) * 5;

      const cardPos: CardPosition = { index: idx, rect, row: rowKey };
      cardPositions.push(cardPos);

      if (!rowMap[rowKey]) {
        rowMap[rowKey] = [];
      }
      rowMap[rowKey].push(cardPos);
    });

    let newDropIndex = draggedIndex;

    Object.keys(rowMap).forEach(rowKey => {
      const rowCards = rowMap[Number(rowKey)];
      if (rowCards.length === 0) return;

      const firstCard = rowCards[0];
      const lastCard = rowCards[rowCards.length - 1];
      const rowTop = firstCard.rect.top;
      const rowBottom = firstCard.rect.bottom;

      if (e.clientY >= rowTop && e.clientY <= rowBottom) {
        if (e.clientX < firstCard.rect.left) {
          newDropIndex = firstCard.index;
          return;
        }

        if (e.clientX > lastCard.rect.right) {
          const gridRect = gridRef.current!.getBoundingClientRect();
          const gridRightEdge = gridRect.right;
          const gapSize = 16;
          const availableSpace = gridRightEdge - lastCard.rect.right - gapSize;

          if (availableSpace >= draggedSize.width) {
            newDropIndex = lastCard.index < draggedIndex ? lastCard.index + 1 : lastCard.index;
          } else {
            newDropIndex = lastCard.index < draggedIndex ? lastCard.index + 1 : lastCard.index;
          }
          return;
        }

        for (const cardPos of rowCards) {
          if (e.clientX >= cardPos.rect.left && e.clientX <= cardPos.rect.right) {
            if (cardPos.index !== draggedIndex) {
              newDropIndex = cardPos.index;
            }
            return;
          }
        }
      }
    });

    if (newDropIndex !== dropIndex) {
      setDropIndex(newDropIndex);
    }
  };

  const handleMouseUp = () => {
    if (draggedIndex === null || dropIndex === null) return;

    if (onOrderChange && draggedIndex !== dropIndex) {
      onOrderChange(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDropIndex(null);

    if (onDragEnd) {
      onDragEnd();
    }
  };

  useEffect(() => {
    if (draggedIndex !== null) {
      document.body.style.setProperty('cursor', '-webkit-grabbing', 'important');
      document.body.style.setProperty('cursor', 'grabbing', 'important');

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.body.style.removeProperty('cursor');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIndex, dropIndex, draggedSize]);

  const displayChildren = [...childrenArray];

  if (draggedIndex !== null && dropIndex !== null && draggedIndex !== dropIndex) {
    displayChildren.splice(draggedIndex, 1);
    displayChildren.splice(dropIndex, 0, 'PLACEHOLDER');
  }

  return (
    <>
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, ${maxCardWidth}))`,
          gap: 'var(--spacing-sm)',
          alignItems: stretch ? 'stretch' : 'start'
        }}
      >
        {displayChildren.map((child, displayIdx) => {
          if (child === 'PLACEHOLDER') {
            return (
              <div
                key="placeholder"
                data-card-index={displayIdx}
                style={{
                  minHeight: 'var(--card-min-height)',
                  minWidth: 'var(--card-min-width)',
                  maxWidth: '560px',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <CardPlaceholder width={draggedSize.width} height={draggedSize.height} />
              </div>
            );
          }

          const originalIndex = childrenArray.indexOf(child);
          const isDragging = draggedIndex === originalIndex;

          if (isDragging) {
            return (
              <div
                key={`dragging-${originalIndex}`}
                data-card-index={displayIdx}
                style={{
                  minHeight: 'var(--card-min-height)',
                  minWidth: 'var(--card-min-width)',
                  maxWidth: '560px',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <CardPlaceholder width={draggedSize.width} height={draggedSize.height} />
              </div>
            );
          }

          return (
            <div
              key={originalIndex}
              data-card-index={displayIdx}
              style={{
                pointerEvents: isAnyCardDragging ? 'none' : 'auto',
                maxWidth: '560px',
                display: 'flex',
                minWidth: 0
              }}
              onMouseDown={(e) => {
                if (!draggable) return;
                const target = e.target as HTMLElement;
                const isButton = target.closest('button, ui5-button');
                if (isButton) return;
                // Don't intercept clicks on the interactive SigInlineEdit title (only present when readonly={false})
                const isInlineEdit = target.closest('[data-component="sig-inline-edit"]');
                if (isInlineEdit) return;
                // Don't intercept clicks on popover/menu items (they bubble up via shadow DOM retargeting)
                const isPopoverItem = target.closest('ui5-li, ui5-popover, [ui5-popup-content]');
                if (isPopoverItem) return;
                const header = target.closest('.card__header');
                if (header) {
                  e.preventDefault();
                  handleMouseDown(e, originalIndex);
                }
              }}
            >
              {child}
            </div>
          );
        })}
      </div>

      {draggedIndex !== null && (
        <div
          className="card-dragging"
          style={{
            position: 'fixed',
            left: mousePos.x - dragOffset.x,
            top: mousePos.y - dragOffset.y,
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 1000,
            width: draggedSize.width || 'auto'
          }}
        >
          {childrenArray[draggedIndex]}
        </div>
      )}
    </>
  );
}
