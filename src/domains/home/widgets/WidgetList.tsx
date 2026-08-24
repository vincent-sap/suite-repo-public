import { List } from '@ui5/webcomponents-react'
import './widgets.css'

interface WidgetListProps {
  children: React.ReactNode
  onItemClick?: () => void
}

/**
 * Thin wrapper around UI5 List for widget card content areas.
 * UI5 List provides arrow-key navigation, hover/active states, and the
 * inset focus ring (via --_ui5_list_item_focus_offset on .widget-card__list).
 */
export function WidgetList({ children, onItemClick }: WidgetListProps) {
  return (
    <List
      className="widget-card__list"
      separators="None"
      onItemClick={onItemClick ? () => onItemClick() : undefined}
    >
      {children}
    </List>
  )
}
