import { useState } from 'react'
import { DynamicPage, DynamicPageTitle, Title, Text, Toolbar, ToolbarButton, ToolbarItem, Button, Bar, Dialog, Input, Label, TextArea } from '@ui5/webcomponents-react'
import { useWorkspace, type SmartFolder } from '../../contexts/WorkspaceContext'
import SearchResultsPanel from './components/SearchResultsPanel'
import { type SelectedAssetInfo } from './AllResources'


type Props = {
  folder?: SmartFolder
  onDeleted?: () => void
  onUpdated?: (updated: SmartFolder) => void
  onAssetClick?: (asset: SelectedAssetInfo) => void
}

export default function SmartFolderPage({ folder: folderProp, onDeleted, onUpdated, onAssetClick }: Props) {
  const { updateSmartFolder, deleteSmartFolder, smartFolders } = useWorkspace()
  const folder = folderProp ?? smartFolders[0]

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const openEdit = () => {
    setEditName(folder.name)
    setEditDesc(folder.description ?? '')
    setEditOpen(true)
  }

  const handleSave = () => {
    if (!editName.trim()) return
    const patch = { name: editName.trim(), description: editDesc.trim() || undefined }
    updateSmartFolder(folder.id, patch)
    onUpdated?.({ ...folder, ...patch })
    setEditOpen(false)
  }

  const handleDelete = () => {
    deleteSmartFolder(folder.id)
    onDeleted?.()
  }

  return (
    <DynamicPage style={{ height: '100%', flex: 1 }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Title slot="heading" level="H3">{folder.name}</Title>
        {(folder.description) && (
          <Text slot="content" style={{ color: 'var(--sapObjectHeader_Subtitle_TextColor)' }}>
            {folder.description}
          </Text>
        )}
        <Toolbar slot="actionsBar">
          <ToolbarButton design="Transparent" icon="edit" text="Edit" onClick={openEdit} />
          <ToolbarItem>
            <Button icon="delete" design="Transparent" onClick={handleDelete}>Delete</Button>
          </ToolbarItem>
        </Toolbar>
      </DynamicPageTitle>
    }>

      <SearchResultsPanel query={folder.query} onAssetClick={onAssetClick} filters={{}} onFiltersChange={() => {}} authorSearch="" onAuthorSearchChange={() => {}} />

      <Dialog
        open={editOpen}
        headerText="Edit Pinned View"
        onClose={() => setEditOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '360px', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label for="sf-edit-name" required>Name</Label>
            <Input
              id="sf-edit-name"
              value={editName}
              style={{ width: '100%' }}
              onInput={e => setEditName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label for="sf-edit-desc">Description</Label>
            <TextArea
              id="sf-edit-desc"
              value={editDesc}
              rows={6}
              style={{ width: '100%' }}
              onInput={e => setEditDesc((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={!editName.trim()} onClick={handleSave}>Save</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setEditOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>
    </DynamicPage>
  )
}
