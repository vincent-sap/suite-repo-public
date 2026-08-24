import { ListItemCustom, Icon, Text } from '@ui5/webcomponents-react'
import { BaseWidget } from './BaseWidget'
import { WidgetList } from './WidgetList'
import './widgets.css'

// Sanitize a URL before putting it in an href attribute.
//
// The threat: a URL like `javascript:alert('XSS')` would execute JS when the
// user clicks the link, bypassing the `target="_blank"` sandbox entirely —
// because `javascript:` is evaluated in the current page's context regardless
// of the target attribute.
//
// Defence: only allow URLs that start with a known-safe scheme (https/http).
// www. URLs are normalised to https:// first. Anything else — javascript:,
// data:, vbscript:, or any other scheme — is replaced with a safe no-op ('#')
// so the link element is inert rather than dangerous.
function safeHref(url: string): string {
  if (!url) return '#'
  // Normalise www. shorthand → https://
  const absolute = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : url.startsWith('www.')
      ? 'https://' + url
      : url
  // Allow only http(s); block javascript:, data:, vbscript:, etc.
  if (absolute.startsWith('http://') || absolute.startsWith('https://')) return absolute
  return '#'
}

export interface QuickLinkItem {
  icon: string
  title: string
  description?: string
  url: string
}

const PREVIEW_ITEMS: QuickLinkItem[] = [
  { icon: 'study-leave',                  title: 'Onboarding Training',               description: 'Learn how to work with the Signavio Process Transformation Suite',    url: 'https://example.com' },
  { icon: 'learning-assistant',           title: 'Process Transformation Initiative', description: 'Find related documents for our process transformation initiative',    url: 'https://example.com' },
  { icon: 'discussion-2',                 title: 'Process Transformation Wiki',       description: 'Share ideas about our Signavio process transformation initiative',    url: 'https://example.com' },
  { icon: 'world',                        title: 'Company Website',                   description: 'Quick access to our company website',                                url: 'https://example.com' },
  { icon: 'group',                        title: 'Signavio Expert Group',             description: 'Signavio user forum',                                                url: 'https://example.com' },
  { icon: 'SAP-icons-v4/link',            title: 'Link without description text',                                                                                        url: 'https://example.com' },
]

export function buildQuickLinksPreviewItems(): QuickLinkItem[] {
  return PREVIEW_ITEMS
}

interface QuickLinksWidgetProps {
  instanceLabel: number
  /** Custom title — falls back to "Quick Links {instanceLabel}" if not set. */
  title?: string
  items?: QuickLinkItem[]
  onRemove?: () => void
  onEdit?: () => void
  onRename?: (newTitle: string) => void
  /** When used inside the edit dialog: index of the currently selected item. */
  selectedIndex?: number
  /** When used inside the edit dialog: callback when user clicks an item. */
  onItemSelect?: (index: number) => void
  /** Grid span read by CardGrid — not used in rendering. */
  gridSpan?: number
}

export function QuickLinksWidget({ instanceLabel, title, items = [], onRemove, onEdit, onRename, selectedIndex, onItemSelect, gridSpan }: QuickLinksWidgetProps) {
  const displayTitle = title ?? `Quick Links ${instanceLabel}`

  return (
    <BaseWidget
      title={displayTitle}
      onRemove={onRemove}
      onEdit={onEdit}
      onRename={onRename}
      gridSpan={gridSpan}
    >
      {items.length > 0 ? (
        <WidgetList>
          {items.map((item, i) => (
            <ListItemCustom
              key={i}
              className="ql-item"
              selected={selectedIndex === i}
              onClick={onItemSelect ? () => onItemSelect(i) : undefined}
            >
              <a
                href={onItemSelect ? undefined : safeHref(item.url)}
                target={onItemSelect ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="ql-item__inner ql-item__link"
                onClick={onItemSelect ? (e) => { e.preventDefault(); onItemSelect(i) } : undefined}
              >
                <div className="ql-item__icon-wrap">
                  <Icon name={item.icon} className="task-group-item__icon" />
                </div>
                <div className="ql-item__text">
                  <span className="ql-item__title">{item.title}</span>
                  {item.description && <Text maxLines={3} className="ql-item__description">{item.description}</Text>}
                </div>
              </a>
            </ListItemCustom>
          ))}
        </WidgetList>
      ) : (
        <div className="widget-card__list widget-card__list--centered" />
      )}
    </BaseWidget>
  )
}
