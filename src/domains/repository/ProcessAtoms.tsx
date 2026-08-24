import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { SplitButton, Menu, MenuItem, Button, ToolbarItem, Avatar } from '@ui5/webcomponents-react'
import ResourceView from './components/ResourceView'
import type { ResultItem } from '../../data/allResourcesMockData'
import type { SelectedAssetInfo } from './AllResources'

import { INITIAL_PROCESS_ATOMS, PROCESS_ATOMS } from '../../data/processAtoms'
export { INITIAL_PROCESS_ATOMS, PROCESS_ATOMS }

const PA_STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'deprecated', label: 'Deprecated' },
]

type Props = {
  onAssetClick?: (asset: SelectedAssetInfo) => void
  contentOnly?: boolean
  publishedOnly?: boolean
  onShareSelected?: (item: ResultItem) => void
  onCreateClick?: () => void
  items?: ResultItem[]
}

export default function ProcessAtoms({ onAssetClick, contentOnly, publishedOnly, onShareSelected, onCreateClick, items }: Props) {
  const splitBtnId = 'pa-create-split-btn'
  const menuRef = useRef<any>(null)

  const createButton = (
    <>
      <SplitButton
        id={splitBtnId}
        design="Emphasized"
        onClick={onCreateClick}
        onArrowClick={() => {
          if (menuRef.current) {
            menuRef.current.opener = splitBtnId
            menuRef.current.open = true
          }
        }}
      >
        Create
      </SplitButton>
      {createPortal(
        <Menu
          ref={menuRef}
          onItemClick={(e: any) => {
            // placeholder handlers for Import / Extract
            console.log('Menu item:', e.detail?.text)
          }}
        >
          <MenuItem text="Import" icon="upload" />
          <MenuItem text="Extract from Process" icon="process" />
        </Menu>,
        document.body
      )}
    </>
  )

  const selectionActions = (
    <>
      <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/file-move">Move To</Button></ToolbarItem>
      <ToolbarItem><Button design="Transparent" icon="delete">Delete</Button></ToolbarItem>
    </>
  )

  return (
    <ResourceView
      title="Process Atoms"
      headerAvatar={<Avatar icon="SAP-icons-v4/value-any" colorScheme="Accent6" size="S" shape="Circle" />}
      items={items ?? INITIAL_PROCESS_ATOMS}
      showFolder={false}
      onAssetClick={onAssetClick}
      contentOnly={contentOnly}
      publishedOnly={publishedOnly}
      onShareSelected={onShareSelected}
      createButtonOverride={createButton}
      selectionActionsOverride={selectionActions}
      hideFilters={['type', 'location']}
      statusOptions={PA_STATUS_OPTIONS}
    />
  )
}
