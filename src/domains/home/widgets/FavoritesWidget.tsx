import { ListWidget } from './ListWidget'
import type { WidgetListItemData } from './WidgetListItem'
import { REPOSITORY_ITEMS } from '../../../data/DataBase'

function toListItems(items: typeof REPOSITORY_ITEMS): WidgetListItemData[] {
  return items.map(item => ({
    object: item.object,
    title: item.title,
    isFavorite: item.isFavorite,
    type: item.type,
  }))
}

// Intentionally different items from REPOSITORY_ITEMS — generic sample data shown
// as a thumbnail in the Widget Catalog dialog before the widget is added to the page.
export function buildFavoritesPreviewItems(): WidgetListItemData[] {
  return [
    { object: 'Value Chain',         title: 'Company Overview',                isFavorite: true, type: 'Value Chain'         },
    { object: 'Process Model',       title: 'Procurement of Work Equipment',   isFavorite: true, type: 'BPMN'                },
    { object: 'Dictionary Category', title: 'Performance Management',          isFavorite: true, type: 'Dictionary Entry'    },
    { object: 'Customer Journey',    title: 'Lead-to-Cash End-to-End Journey', isFavorite: true, type: 'Journey'             },
    { object: 'Dictionary Category', title: 'Functions and Roles',             isFavorite: true, type: 'Dictionary category' },
    { object: 'PDF',                 title: 'New Supplier Contract',           isFavorite: true, type: 'PDF'                 },
  ]
}

interface FavoritesWidgetProps {
  items?: WidgetListItemData[]
  onItemClick?: () => void
  onViewAll?: () => void
  onRemove?: () => void
  gridSpan?: number
}

export function FavoritesWidget({ items = toListItems(REPOSITORY_ITEMS.filter(i => i.isFavorite).slice(0, 6)), ...rest }: FavoritesWidgetProps) {
  return <ListWidget title="Favorites" items={items} {...rest} />
}
