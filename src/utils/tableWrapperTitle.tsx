import { Title, ToolbarItem } from '@ui5/webcomponents-react'

export function allItemsTitle(count: number) {
  return <ToolbarItem><Title level="H5">All Items ({count})</Title></ToolbarItem>
}
