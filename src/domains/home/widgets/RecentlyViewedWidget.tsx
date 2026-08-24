import { ListWidget } from './ListWidget'
import type { WidgetListItemData } from './WidgetListItem'
import { REPOSITORY_ITEMS, formatAccessed } from '../../../data/DataBase'
import { formatDate, addDays, lastWeekday } from '../../../utils/dates'

function toListItems(items: typeof REPOSITORY_ITEMS): WidgetListItemData[] {
  return items.map(item => ({
    object: item.object,
    title: item.title,
    isFavorite: item.isFavorite,
    type: item.type,
    date: formatAccessed(item.lastAccessed),
  }))
}

// Intentionally different items from REPOSITORY_ITEMS — generic sample data shown
// as a thumbnail in the Widget Catalog dialog before the widget is added to the page.
export function buildRecentlyViewedPreviewItems(): WidgetListItemData[] {
  const today = new Date()
  return [
    { object: 'Customer Journey',    title: 'Lead-to-Cash End-to-End Journey', type: 'Journey',             date: '2 hours ago' },
    { object: 'PDF',                 title: 'New Supplier Contract',           isFavorite: true, type: 'PDF',                 date: '6 hours ago' },
    { object: 'Process Model',       title: 'Procurement of Work Equipment',   isFavorite: true, type: 'BPMN',                date: formatDate(lastWeekday(addDays(today,  -2))) },
    { object: 'Dictionary Category', title: 'Functions and Roles',             type: 'Dictionary category', date: formatDate(lastWeekday(addDays(today, -12))) },
    { object: 'Value Chain',         title: 'Company Overview',                type: 'Value Chain',         date: formatDate(lastWeekday(addDays(today, -24))) },
    { object: 'Dictionary Category', title: 'Performance Management',          isFavorite: true, type: 'Dictionary Entry',    date: formatDate(lastWeekday(addDays(today, -36))) },
  ]
}

interface RecentlyViewedWidgetProps {
  items?: WidgetListItemData[]
  onItemClick?: () => void
  onViewAll?: () => void
  onRemove?: () => void
  gridSpan?: number
  style?: React.CSSProperties
}

export function RecentlyViewedWidget({ items = toListItems(REPOSITORY_ITEMS.slice(0, 6)), ...rest }: RecentlyViewedWidgetProps) {
  return <ListWidget title="Recently Viewed" items={items} {...rest} />
}
