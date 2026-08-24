import { useState, useMemo, useEffect } from 'react'
import {
  Dialog, Bar, Button, Label, Input, MessageStrip, Text, Title,
  FileUploader, SuggestionItem,
  AnalyticalTable, Breadcrumbs, BreadcrumbsItem, ToolbarItem,
  type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { FOLDER_TREE, FOLDER_FILES, type FileItem, type FolderNode } from '../data'

// ── Flatten folder tree into a flat list for suggestion input ─────────────

type FlatFolder = { id: string; name: string }

function flattenFolders(nodes: FolderNode[], result: FlatFolder[] = []): FlatFolder[] {
  for (const n of nodes) {
    result.push({ id: n.id, name: n.name })
    if (n.children) flattenFolders(n.children, result)
  }
  return result
}

const ALL_FOLDERS = flattenFolders(FOLDER_TREE)

// ── Build rows for a given parent ─────────────────────────────────────────

type FolderRow = {
  id: string
  name: string
  type: string
  description: string
  created: string
  changed: string
  _isFolder: boolean
}

function getRowsForParent(parentId: string | null): FolderRow[] {
  const findChildren = (nodes: FolderNode[]): FolderNode[] | null => {
    if (parentId === null) return nodes
    for (const n of nodes) {
      if (n.id === parentId) return n.children ?? []
      if (n.children) { const r = findChildren(n.children); if (r) return r }
    }
    return null
  }
  const folderNodes = findChildren(FOLDER_TREE) ?? []

  const folderRows: FolderRow[] = folderNodes.map(n => ({
    id: n.id,
    name: n.name,
    type: 'Folder',
    description: '',
    created: '',
    changed: '',
    _isFolder: true,
  }))

  const files: FileItem[] = FOLDER_FILES[parentId ?? ''] ?? []
  const fileRows: FolderRow[] = files.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    description: f.description ?? '',
    created: f.created,
    changed: f.changed,
    _isFolder: false,
  }))

  return [...folderRows, ...fileRows]
}

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  defaultFolderName?: string
  onClose: () => void
  onSave: (file: File | null, folderId: string, folderName: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────

export default function UploadFileDialog({ open, defaultFolderName = 'Current Folder', onClose, onSave }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [folderQuery, setFolderQuery] = useState(defaultFolderName)
  const [folderId, setFolderId] = useState('')
  const [selectFolderOpen, setSelectFolderOpen] = useState(false)

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFile(null)
      setFolderQuery(defaultFolderName)
      setFolderId('')
    }
  }, [open, defaultFolderName])

  // Breadcrumb navigation: each entry = { id, name } where id='' means root
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([
    { id: '', name: 'Modeling Files' },
  ])

  const currentEntry = breadcrumb[breadcrumb.length - 1]
  const currentParentId = currentEntry.id || null

  const currentRows = useMemo(() => getRowsForParent(currentParentId), [currentParentId])

  const filteredFolders = folderQuery.trim()
    ? ALL_FOLDERS.filter(f => f.name.toLowerCase().includes(folderQuery.toLowerCase()))
    : ALL_FOLDERS

  const handleSave = () => {
    onSave(selectedFile, folderId, folderQuery)
    onClose()
  }

  const handleSelectCurrentFolder = () => {
    setFolderQuery(currentEntry.name)
    setFolderId(currentEntry.id)
    setSelectFolderOpen(false)
  }

  const navigateInto = (row: FolderRow) => {
    setBreadcrumb(prev => [...prev, { id: row.id, name: row.name }])
  }

  const navigateTo = (index: number) => {
    setBreadcrumb(prev => prev.slice(0, index + 1))
  }

  const openSelectFolder = () => {
    setBreadcrumb([{ id: '', name: 'Modeling Files' }])
    setSelectFolderOpen(true)
  }

  // Column definitions — defined inside component so navigateInto is in scope
  const columns: AnalyticalTableColumnDefinition[] = [
    {
      Header: 'Name',
      accessor: 'name',
      minWidth: 240,
      Cell: ({ row }: any) => {
        const r: FolderRow = row.original
        const dim = !r._isFolder
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: dim ? 0.4 : 1 }}>
            <SigDomainObject size="XXS" object={(r._isFolder ? 'Folder' : r.type) as never} />
            <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--sapTextColor)' }}>
              {r.name}
            </Text>
          </div>
        )
      },
    },
    {
      Header: 'Type', accessor: 'type', width: 130,
      Cell: ({ row, value }: any) => (
        <span style={{ opacity: row.original._isFolder ? 1 : 0.4 }}>{value}</span>
      ),
    },
    {
      Header: 'Description', accessor: 'description', minWidth: 180,
      Cell: ({ row, value }: any) => (
        <span style={{ opacity: row.original._isFolder ? 1 : 0.4 }}>{value}</span>
      ),
    },
    {
      Header: 'Created', accessor: 'created', width: 120,
      Cell: ({ row, value }: any) => (
        <span style={{ opacity: row.original._isFolder ? 1 : 0.4 }}>{value}</span>
      ),
    },
    {
      Header: 'Changed', accessor: 'changed', width: 120,
      Cell: ({ row, value }: any) => (
        <span style={{ opacity: row.original._isFolder ? 1 : 0.4 }}>{value}</span>
      ),
    },
  ]

  return (
    <>
      {/* Upload File dialog */}
      <Dialog
        open={open}
        headerText="Upload File"
        style={{ width: '480px' }}
        footer={
          <Bar design="Footer"
            endContent={
              <>
                <Button design="Emphasized" disabled={!selectedFile} onClick={handleSave}>Save</Button>
                <Button design="Transparent" onClick={onClose}>Cancel</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MessageStrip design="Information" hideCloseButton>
            Storage used: 7.4 MB of 10240 MB.<br />Maximum upload size: 32 MB per file.
          </MessageStrip>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>File</Label>
            <FileUploader
              placeholder="Browse or drop a file"
              style={{ width: '100%' }}
              onChange={(e: any) => {
                const file = e.target?.files?.[0] ?? null
                setSelectedFile(file)
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Save in</Label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input
                value={folderQuery}
                showSuggestions
                style={{ flex: 1 }}
                onInput={(e: any) => setFolderQuery(e.target?.value ?? '')}
                onSelect={(e: any) => {
                  const text = e.detail?.item?.text as string | undefined
                  const matched = ALL_FOLDERS.find(f => f.name === text)
                  if (matched) { setFolderQuery(matched.name); setFolderId(matched.id) }
                }}
              >
                {filteredFolders.map(f => (
                  <SuggestionItem key={f.id} text={f.name} />
                ))}
              </Input>
              <Button design="Default" onClick={openSelectFolder}>Browse Folders</Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Select Folder dialog */}
      {selectFolderOpen && (
        <Dialog
          open
          style={{ width: '900px', height: '600px' }}
          headerText="Select Folder"
          footer={
            <Bar design="Footer"
              endContent={
                <>
                  <Button design="Emphasized" onClick={handleSelectCurrentFolder}>Select</Button>
                  <Button design="Transparent" onClick={() => setSelectFolderOpen(false)}>Cancel</Button>
                </>
              }
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Breadcrumb — hidden on root level but space preserved */}
            <div style={{ padding: '0.75rem 1rem 0', minHeight: '3rem' }}>
              {breadcrumb.length > 1 && (
                <Breadcrumbs
                  design="Standard"
                  onItemClick={(e: any) => {
                    const idx = Number((e.detail?.item as HTMLElement)?.dataset?.idx ?? '-1')
                    if (!isNaN(idx) && idx >= 0) navigateTo(idx)
                  }}
                >
                  {breadcrumb.map((seg, i) => (
                    <BreadcrumbsItem key={seg.id || 'root'} data-idx={String(i)}>
                      {seg.name}
                    </BreadcrumbsItem>
                  ))}
                </Breadcrumbs>
              )}
            </div>

            {/* SigTableWrapper with AnalyticalTable */}
            <SigTableWrapper
              titleSlot={
                <ToolbarItem overflowPriority="NeverOverflow">
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>{currentEntry.name}</Title>
                </ToolbarItem>
              }
              businessActionsSlot={
                <ToolbarItem>
                  <Button design="Transparent">New Folder</Button>
                </ToolbarItem>
              }
            >
              <AnalyticalTable
                data={currentRows}
                columns={columns}
                selectionMode="None"
                visibleRows={currentRows.length || 1}
                minRows={0}
                style={{ width: '100%' }}
                tableHooks={[
                  (hooks: any) => {
                    hooks.getRowProps.push((props: any, { row }: any) => {
                      const isFolder = row?.original?._isFolder
                      return [props, { style: { ...props.style, pointerEvents: isFolder ? undefined : 'none', cursor: isFolder ? 'pointer' : 'default' } }]
                    })
                  },
                ]}
                onRowClick={(e: any) => {
                  const row: FolderRow = e.detail?.row?.original
                  if (row?._isFolder) navigateInto(row)
                }}
              />
            </SigTableWrapper>
          </div>
        </Dialog>
      )}
    </>
  )
}
