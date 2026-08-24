import { Button } from '@ui5/webcomponents-react'
import { BaseWidget } from './BaseWidget'
import { WidgetList } from './WidgetList'
import { WidgetListItem } from './WidgetListItem'
import type { WidgetListItemData } from './WidgetListItem'

interface ListWidgetProps {
  title: string
  items: WidgetListItemData[]
  onItemClick?: () => void
  onViewAll?: () => void
  onRemove?: () => void
  /** Grid span read by CardGrid — not used in rendering. */
  gridSpan?: number
  style?: React.CSSProperties
}

export function ListWidget({ title, items, onItemClick, onViewAll, onRemove, gridSpan, style }: ListWidgetProps) {
  return (
    <BaseWidget
      title={title}
      onRemove={onRemove}
      footer={onViewAll && <Button design="Transparent" onClick={onViewAll}>View All</Button>}
      gridSpan={gridSpan}
      style={style}
    >
      <WidgetList onItemClick={onItemClick}>
        {items.map((item, i) => (
          <WidgetListItem key={i} {...item} />
        ))}
      </WidgetList>
    </BaseWidget>
  )
}
