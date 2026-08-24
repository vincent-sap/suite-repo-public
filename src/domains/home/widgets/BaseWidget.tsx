import { useState, useRef, useEffect, type ReactNode } from 'react'
import { SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import { CardMoreMenu } from '../../repository/components/CardMoreMenu'
import './widgets.css'

interface BaseWidgetProps {
  title: string
  children: ReactNode
  /** Enables inline title editing and the "Change title" menu item. */
  onRename?: (newTitle: string) => void
  onRemove?: () => void
  onEdit?: () => void
  /** Rendered inside .widget-card__footer. Omit to hide the footer entirely. */
  footer?: ReactNode
  /** Adds .card__header drag-handle class to the header. Default: true. */
  draggable?: boolean
  /** Grid span hint read by CardGrid — not used in rendering. */
  gridSpan?: number
  style?: React.CSSProperties
}

export function BaseWidget({
  title,
  children,
  onRename,
  onRemove,
  onEdit,
  footer,
  draggable = true,
  style,
}: BaseWidgetProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const titleWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editingTitle) return
    setEditValue(title)
    const section = titleWrapRef.current?.querySelector<HTMLElement>('section[data-component="sig-inline-edit"]')
    section?.click()
  }, [editingTitle])

  const headerClass = ['widget-card__header', draggable ? 'card__header' : ''].filter(Boolean).join(' ')

  return (
    <div className="widget-card" style={style}>
      <div className={headerClass}>
        <div className="widget-card__title-wrap" ref={titleWrapRef}>
          <SigInlineEdit
            text={editingTitle ? editValue : title}
            size="H6"
            level="H6"
            readonly={!editingTitle}
            wrappingType="Truncate"
            onValueChange={(v) => setEditValue(v)}
            onFinalValueChange={(finalText) => {
              setEditingTitle(false)
              onRename?.(finalText || title)
            }}
            onCancel={() => setEditingTitle(false)}
          />
        </div>
        {/* hide more button when no menu actions are provided */}
        {(onRemove || onEdit || onRename) && (
          <CardMoreMenu
            onRemove={onRemove}
            onEdit={onEdit}
            onRename={onRename ? () => setEditingTitle(true) : undefined}
          />
        )}
      </div>

      {children}

      {footer !== undefined && (
        <div className="widget-card__footer">{footer}</div>
      )}
    </div>
  )
}
