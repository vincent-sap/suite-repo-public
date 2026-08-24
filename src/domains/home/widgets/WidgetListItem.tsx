import { ListItemCustom, Icon } from '@ui5/webcomponents-react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import './widgets.css'

import type { DomainObjects } from '../../../data/DataBase'

export interface WidgetListItemData {
  /** Domain object type — drives icon + chip color via SigDomainObject */
  object: DomainObjects
  title: string
  isFavorite?: boolean
  /** First secondary label, e.g. "BPMN", "Folder" */
  type: string
  /** Second secondary label, e.g. "1 day ago", "Organizational Units" */
  date?: string
  onClick?: () => void
}

export function WidgetListItem({ object, title, isFavorite, type, date, onClick }: WidgetListItemData) {
  return (
    <ListItemCustom className="widget-list-item" onClick={onClick}>
      <div className="widget-list-item__inner">
        <SigDomainObject object={object} size="XS" />
        <div className="widget-list-item__text">
          <div className="widget-list-item__title-row">
            <span className="widget-list-item__title">{title}</span>
            {isFavorite && <Icon name="favorite" className="widget-list-item__favorite-icon" />}
          </div>
          <div className="widget-list-item__secondary">
            <span>{type}</span>
            {date && (
              <>
                <span className="widget-list-item__dot" aria-hidden>·</span>
                <span>{date}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </ListItemCustom>
  )
}
