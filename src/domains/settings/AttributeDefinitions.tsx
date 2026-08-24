import { useMemo, useState } from 'react'
import {
  AnalyticalTable,
  ToolbarItem, Input, Text, Title, Button, Menu, MenuItem, Toast, ToggleButton, FlexBox,
  List, ListItemStandard, ListItemGroup, MessageBox,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, useControl } from '@signavio/sap-signavio-uixtension'
import { SortPopover } from './components/SortPopover'
import PageHeader from './components/PageHeader'
import { EditAttributeSelectionDialog, type AttributeSelectionData } from './components/EditAttributeSelectionDialog'
import { CreateAttributeDialog, type AttributeType } from './components/CreateAttributeDialog'
import { ASSET_TYPES } from '../../data/assetTypes'
import { SUB_ELEMENTS } from '../../data/assetTypes'
import { useWorkspace, type DictCategory } from '../../contexts/WorkspaceContext'

type Attribute = {
  name: string; description: string; type: string; usedIn: string
  attrClass: string; technicalId: string; changedOn: string; changedBy: string
}

const NOTATION_IDS = new Set(['bpmn', 'dmn', 'value-chain', 'nav-map'])

function resolveUsedIn(usedIn: string, dictCategories: DictCategory[]): string {
  if (!usedIn) return ''
  const parts = usedIn.split(/[,;]/).map(s => s.trim())
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '__ALL_DICT__') {
      dictCategories.forEach(c => resolved.push(c.name))
    } else if (part.startsWith('__DICT_TYPE__:')) {
      const types = part.slice('__DICT_TYPE__:'.length).split(',').map(s => s.trim())
      dictCategories.filter(c => types.includes(c.type)).forEach(c => resolved.push(c.name))
    } else {
      resolved.push(part)
    }
  }
  // Deduplicate while preserving order
  return [...new Set(resolved)].join(', ')
}

const NO_AUDIENCE_IDS = new Set(['objective', 'initiative', 'insight', 'dashboard', 'process-semantic-view'])
const NOTATION_ASSET_TYPES = ASSET_TYPES.filter(t => NOTATION_IDS.has(t.id))
const TM_AM_ASSET_TYPES = ASSET_TYPES.filter(t => NO_AUDIENCE_IDS.has(t.id))
const ALL_NOTATION_NAMES = NOTATION_ASSET_TYPES.map(t => t.name).join(', ')
const ALL_SUB_ELEMENT_NAMES = Object.values(SUB_ELEMENTS).flat().filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i).map(e => e.name).join(', ')

const MODELING_ATTRS: Attribute[] = [
  { name: 'Name',          description: 'The display name of the element.',              type: 'Single-Line Text', usedIn: `${ALL_NOTATION_NAMES}, ${ALL_SUB_ELEMENT_NAMES}`, attrClass: 'Standard', technicalId: 'name',          changedOn: '', changedBy: '' },
  { name: 'Description',   description: 'A free-text description of the element.',       type: 'Multi-Line Text',  usedIn: `${ALL_NOTATION_NAMES}, ${ALL_SUB_ELEMENT_NAMES}`, attrClass: 'Standard', technicalId: 'desc',          changedOn: '', changedBy: '' },
  { name: 'Status',        description: 'Current lifecycle status of the asset.',        type: 'Selection',        usedIn: ALL_NOTATION_NAMES, attrClass: 'Custom',   technicalId: 'status',        changedOn: '5/1/2026',  changedBy: 'Tom Becker' },
  { name: 'Owner',         description: 'Responsible person or team.',                   type: 'Single-Line Text', usedIn: ALL_NOTATION_NAMES, attrClass: 'Custom',   technicalId: 'owner',         changedOn: '5/1/2026',  changedBy: 'Tom Becker' },
  { name: 'Start Date',    description: 'Planned start date for the initiative.',        type: 'Date',             usedIn: 'BPMN 2.0',         attrClass: 'Custom',   technicalId: 'start',         changedOn: '4/10/2026', changedBy: 'Sophie Müller' },
  { name: 'Due Date',      description: 'Deadline for completion.',                      type: 'Date',             usedIn: 'BPMN 2.0',         attrClass: 'Custom',   technicalId: 'due',           changedOn: '4/11/2026', changedBy: 'Sophie Müller' },
  { name: 'Documentation', description: 'Technical documentation for this element.',    type: 'Multi-Line Text',  usedIn: `${ALL_NOTATION_NAMES}, ${ALL_SUB_ELEMENT_NAMES}`, attrClass: 'Custom',   technicalId: 'documentation', changedOn: '3/5/2026',  changedBy: 'Maria Chen' },
]

const DICT_ATTRS_RAW: Attribute[] = [
  { name: 'Name',              description: 'The display name of the category.',             type: 'Single-Line Text', usedIn: '__ALL_DICT__',                   attrClass: 'Standard', technicalId: 'name',          changedOn: '', changedBy: '' },
  { name: 'Description',       description: 'A free-text description.',                      type: 'Multi-Line Text',  usedIn: '__ALL_DICT__',                   attrClass: 'Standard', technicalId: 'desc',          changedOn: '', changedBy: '' },
  { name: 'Relevant Document', description: 'Reference document for this category.',        type: 'Document/URL',     usedIn: '__ALL_DICT__',                   attrClass: 'Standard', technicalId: 'rel-doc',       changedOn: '', changedBy: '' },
  { name: 'Status', description: 'Current lifecycle status.', type: 'Selection', usedIn: `${ALL_NOTATION_NAMES}, __ALL_DICT__`, attrClass: 'Custom', technicalId: 'status', changedOn: '6/1/2026', changedBy: 'Tom Becker' },
  { name: 'Owner', description: 'Responsible person or team.', type: 'Single-Line Text', usedIn: `${ALL_NOTATION_NAMES}, __ALL_DICT__`, attrClass: 'Custom', technicalId: 'owner', changedOn: '6/1/2026', changedBy: 'Tom Becker' },
  { name: 'Approved',          description: 'Whether this category is approved.',            type: 'Checkbox',         usedIn: '__DICT_TYPE__:Organization, Document',  attrClass: 'Custom',   technicalId: 'approved',      changedOn: '5/15/2026', changedBy: 'Tom Becker' },
  { name: 'Valid From',        description: 'Date from which this category is valid.',       type: 'Date',             usedIn: '__ALL_DICT__',                   attrClass: 'Custom',   technicalId: 'valid-from',    changedOn: '4/10/2026', changedBy: 'Sophie Müller' },
  { name: 'Priority',          description: 'Priority level of this category.',              type: 'Selection',        usedIn: '__DICT_TYPE__:Risk, Control, Goal', attrClass: 'Custom', technicalId: 'dict-priority', changedOn: '4/11/2026', changedBy: 'Sophie Müller' },
  { name: 'Tags',              description: 'Tags for classification.',                      type: 'Multi-Line Text',  usedIn: '__ALL_DICT__',                   attrClass: 'Custom',   technicalId: 'tags',          changedOn: '4/10/2026', changedBy: 'Sophie Müller' },
]

// Merge modeling + dict attrs, deduping by technicalId (combine usedIn)
const seenIds = new Map<string, Attribute>()
;[...MODELING_ATTRS, ...DICT_ATTRS_RAW].forEach(a => {
  const existing = seenIds.get(a.technicalId)
  if (existing) {
    existing.usedIn = existing.usedIn === a.usedIn ? existing.usedIn : `${existing.usedIn}; ${a.usedIn}`
  } else {
    seenIds.set(a.technicalId, { ...a })
  }
})
const MODELING_DICT_ATTRS: Attribute[] = [...seenIds.values()]

const TM_AM_ATTRS: Attribute[] = [
  { name: 'Name',        description: 'The display name of the asset.',       type: 'Single-Line Text', usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View', attrClass: 'Standard', technicalId: 'name',   changedOn: '', changedBy: '' },
  { name: 'Description', description: 'A free-text description of the asset.',type: 'Multi-Line Text',  usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View', attrClass: 'Standard', technicalId: 'desc',   changedOn: '', changedBy: '' },
  { name: 'Start Date',  description: 'Planned start date for the initiative.',type: 'Date',             usedIn: 'Objective, Initiative',                                            attrClass: 'Custom',   technicalId: 'start',  changedOn: '4/10/2026', changedBy: 'Sophie Müller' },
  { name: 'Due Date',    description: 'Deadline for completion.',              type: 'Date',             usedIn: 'Objective, Initiative',                                            attrClass: 'Custom',   technicalId: 'due',    changedOn: '4/11/2026', changedBy: 'Sophie Müller' },
  { name: 'Status',      description: 'Current lifecycle status of the asset.',type: 'Selection',        usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View', attrClass: 'Custom',   technicalId: 'status', changedOn: '5/1/2026',  changedBy: 'Tom Becker' },
  { name: 'Owner',       description: 'Responsible person or team.',          type: 'Single-Line Text', usedIn: 'Objective, Initiative, Insight',                                   attrClass: 'Custom',   technicalId: 'owner',  changedOn: '5/1/2026',  changedBy: 'Tom Becker' },
]

function useTableState(initial: Attribute[]) {
  const [attrs, setAttrs] = useState<Attribute[]>(initial)
  const [search, setSearch] = useState('')
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null)
  const [editAttrDialogAttr, setEditAttrDialogAttr] = useState<Attribute | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState('Name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filterBarOpen, setFilterBarOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [expanded, setExpanded] = useState(true)
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = attrs.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.technicalId.toLowerCase().includes(q)
    )
    const fType = filters.type as string[] | undefined
    const fClass = filters.attrClass as string[] | undefined
    const fChangedBy = filters.changedBy as string[] | undefined
    if (fType?.length) result = result.filter(a => fType.includes(a.type))
    if (fClass?.length) result = result.filter(a => fClass.includes(a.attrClass))
    if (fChangedBy?.length) result = result.filter(a => fChangedBy.includes(a.changedBy))
    result = result.slice().sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'Name') return mult * a.name.localeCompare(b.name)
      if (sortBy === 'Description') return mult * a.description.localeCompare(b.description)
      if (sortBy === 'Technical ID') return mult * a.technicalId.localeCompare(b.technicalId)
      if (sortBy === 'Date Changed') return mult * (a.changedOn ?? '').localeCompare(b.changedOn ?? '')
      if (sortBy === 'Changed By') return mult * (a.changedBy ?? '').localeCompare(b.changedBy ?? '')
      return 0
    })
    return result
  }, [attrs, search, filters, sortBy, sortDir])

  return { attrs, setAttrs, search, setSearch, openOverflowId, setOpenOverflowId, editingAttr, setEditingAttr, editAttrDialogAttr, setEditAttrDialogAttr, createDialogOpen, setCreateDialogOpen, sortBy, setSortBy, sortDir, setSortDir, filterBarOpen, setFilterBarOpen, filters, setFilters, filtered, expanded, setExpanded }
}

function GroupedMultiSelect({ groups }: { groups: { label: string; options: { value: string; label: string }[] }[] }) {
  const { state, setState } = useControl<string[]>('MultiSelect', {
    resolveDisplayText: async (value: string[]) => {
      const all = groups.flatMap(g => g.options)
      const sel = all.filter(o => value.includes(o.value))
      if (sel.length > 3) return `${sel.length} selected`
      if (!sel.length) return ''
      return sel.map(o => o.label).join(', ')
    },
  })
  const toggle = (value: string) => {
    const cur = state ?? []
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
    setState(next.length === 0 ? undefined : next)
  }
  return (
    <List selectionMode="Multiple" separators="Inner">
      {groups.map(group => (
        <ListItemGroup key={group.label} headerText={group.label}>
          {group.options.map(opt => (
            <ListItemStandard key={opt.value} onClick={() => toggle(opt.value)} selected={state?.includes(opt.value)}>
              {opt.label}
            </ListItemStandard>
          ))}
        </ListItemGroup>
      ))}
    </List>
  )
}

function AttributeTable({
  title, state, assignableAssetTypes, defaultAssignedTo, dictMode, modelingMode, hideAudience, dictCategories, modelingDictMode, modelingSubElements, toastCb,
}: {
  title: string
  state: ReturnType<typeof useTableState>
  assignableAssetTypes?: { id: string; name: string }[]
  defaultAssignedTo?: string[]
  dictMode?: boolean
  modelingMode?: boolean
  hideAudience?: boolean
  dictCategories?: { id: string; name: string; parentId?: string }[]
  modelingDictMode?: boolean
  modelingSubElements?: { id: string; name: string }[]
  toastCb: (msg: string) => void
}) {
  const { attrs, setAttrs, search, setSearch, openOverflowId, setOpenOverflowId, editingAttr, setEditingAttr, editAttrDialogAttr, setEditAttrDialogAttr, createDialogOpen, setCreateDialogOpen, sortBy, setSortBy, sortDir, setSortDir, filterBarOpen, setFilterBarOpen, filters, setFilters, filtered: filteredBase, expanded, setExpanded } = state
  const [deleteAttrPending, setDeleteAttrPending] = useState<Attribute | null>(null)

  // Apply usedIn filter here where dictCategories is available
  const fUsedIn = filters.usedIn as string[] | undefined
  const filtered = useMemo(() => {
    if (!fUsedIn?.length) return filteredBase
    return filteredBase.filter(a => {
      const resolved = resolveUsedIn(a.usedIn, (dictCategories ?? []) as DictCategory[])
      const vals = resolved.split(',').map(s => s.trim())
      return fUsedIn.some(u => vals.includes(u))
    })
  }, [filteredBase, fUsedIn, dictCategories])

  const typeOptions = useMemo(() => [...new Set(attrs.map(a => a.type))].map(v => ({ value: v, label: v })), [attrs])
  const usedInOptions = useMemo(() => [...new Set(attrs.flatMap(a => a.usedIn.split(/[,;]/).map(s => s.trim())))].filter(v => v && !v.startsWith('__')).map(v => ({ value: v, label: v })), [attrs])
  const changedByOptions = useMemo(() => [...new Set(attrs.map(a => a.changedBy).filter(Boolean))].map(v => ({ value: v, label: v })), [attrs])

  const usedInGroups = useMemo(() => {
    if (!modelingDictMode) return null
    // Expand tokens to real names using dictCategories
    const expandedValues = [...new Set(attrs.flatMap(a => {
      const resolved = resolveUsedIn(a.usedIn, (dictCategories ?? []) as DictCategory[])
      return resolved.split(',').map(s => s.trim())
    }))].filter(Boolean)
    const notationNames = new Set(NOTATION_ASSET_TYPES.map(t => t.name))
    const subElementNames = new Set(Object.values(SUB_ELEMENTS).flat().map(e => e.name))
    const modelingAssetItems = expandedValues.filter(v => notationNames.has(v)).map(v => ({ value: v, label: v }))
    const modelingElementItems = expandedValues.filter(v => subElementNames.has(v)).map(v => ({ value: v, label: v }))
    const dictItems = expandedValues.filter(v => !notationNames.has(v) && !subElementNames.has(v)).map(v => ({ value: v, label: v }))
    const groups = []
    if (modelingAssetItems.length) groups.push({ label: 'Modeling Asset Types', options: modelingAssetItems })
    if (modelingElementItems.length) groups.push({ label: 'Modeling Elements', options: modelingElementItems })
    if (dictItems.length) groups.push({ label: 'Dictionary Categories', options: dictItems })
    return groups
  }, [attrs, modelingDictMode, dictCategories])

  const columns = useMemo(() => [
    {
      Header: 'Attribute Name', accessor: 'name', minWidth: 160,
      Cell: ({ value, row }: { value: string; row: { original: Attribute } }) => (
        <span onClick={() => setEditingAttr(row.original)} style={{ color: 'var(--sapTextColor)', fontWeight: '600', cursor: 'pointer' }}>{value}</span>
      ),
    },
    {
      Header: 'Description', accessor: 'description', minWidth: 200, disableGroupBy: true,
      Cell: ({ value }: { value: string }) => (
        <Text style={{ color: value ? undefined : 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{value || '—'}</Text>
      ),
    },
    { Header: 'Type', accessor: 'type', minWidth: 140 },
    { Header: 'Used In', accessor: 'usedIn', minWidth: 160,
      Cell: ({ value }: { value: string }) => {
        const resolved = resolveUsedIn(value, (dictCategories ?? []) as DictCategory[])
        return <Text title={resolved} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{resolved || '—'}</Text>
      },
    },
    {
      Header: 'Attribute Class', accessor: 'attrClass', minWidth: 120,
      Cell: ({ value }: { value: string }) => <Text>{value}</Text>,
    },
    {
      Header: 'Technical ID', accessor: 'technicalId', minWidth: 160, disableGroupBy: true,
      Cell: ({ value }: { value: string }) => <Text>{value}</Text>,
    },
    {
      Header: 'Changed On', accessor: 'changedOn', minWidth: 100, disableGroupBy: true,
      Cell: ({ value, row }: any) => <Text>{(row.original as Attribute).attrClass === 'Standard' ? '' : (value || '—')}</Text>,
    },
    {
      Header: 'Changed By', accessor: 'changedBy', minWidth: 130,
      Cell: ({ value, row }: any) => <Text>{(row.original as Attribute).attrClass === 'Standard' ? '' : (value || '—')}</Text>,
    },
    {
      id: '__actions', Header: '', accessor: 'technicalId',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => {
        const attr = row.original as Attribute
        if (attr.attrClass === 'Standard') return null
        const btnId = `attr-overflow-${title.replace(/\s+/g, '-')}-${attr.technicalId}`
        return (
          <>
            <Button
              id={btnId}
              icon="overflow"
              design="Transparent"
              tooltip="More options"
              onClick={(e: any) => { e.stopPropagation(); setOpenOverflowId(openOverflowId === attr.technicalId ? null : attr.technicalId) }}
            />
            <Menu
              opener={btnId}
              open={openOverflowId === attr.technicalId}
              onClose={() => setOpenOverflowId(null)}
              onItemClick={(e: any) => {
                const text = e.detail?.item?.text
                if (text === 'Edit') setEditAttrDialogAttr(attr)
                if (text === 'Delete') setDeleteAttrPending(attr)
                setOpenOverflowId(null)
              }}
            >
              <MenuItem text="Edit" icon="edit" />
              <MenuItem text="Delete" icon="delete" />
            </Menu>
          </>
        )
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [openOverflowId]) as any[]

  return (
    <>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <Button
                icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
                design="Transparent"
                aria-expanded={expanded}
                onClick={() => setExpanded(v => !v)}
              />
              <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                {title} ({filtered.length})
              </Title>
            </FlexBox>
          </ToolbarItem>
        }
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName={`Search ${title}`}
              placeholder="Search attributes"
              value={search}
              showClearIcon
              style={{ width: '280px' }}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
            />
          </ToolbarItem>
        }
        businessActionsSlot={
          <ToolbarItem>
            <Button design="Emphasized" onClick={() => setCreateDialogOpen(true)}>Create Attribute</Button>
          </ToolbarItem>
        }
        sortSlot={
          <ToolbarItem>
            <SortPopover
              anchorId={`sort-chip-${title.replace(/\s+/g, '-')}`}
              sortBy={sortBy}
              sortDir={sortDir}
              options={[
                { key: 'Name', type: 'text' },
                { key: 'Description', type: 'text' },
                { key: 'Technical ID', type: 'text' },
                { key: 'Date Changed', type: 'date' },
                { key: 'Changed By', type: 'text' },
              ]}
              onSortByChange={k => setSortBy(k)}
              onSortDirChange={d => setSortDir(d)}
            />
          </ToolbarItem>
        }
        filterBarToggleButton={
          <ToolbarItem>
            <ToggleButton icon="filter" design="Transparent" pressed={filterBarOpen} onClick={() => setFilterBarOpen(v => !v)}>
              {(() => { const count = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length; return count > 0 ? String(count) : '' })()}
            </ToggleButton>
          </ToolbarItem>
        }
        filterBarSlot={filterBarOpen ? (
          <SigFilterBar filters={filters} onFiltersChange={setFilters} defaultFilters={{}}>
            <SigFilter filterKey="type" label="Type">
              <MultiSelect options={typeOptions} />
            </SigFilter>
            <SigFilter filterKey="usedIn" label="Used In">
              {usedInGroups ? <GroupedMultiSelect groups={usedInGroups} /> : <MultiSelect options={usedInOptions} />}
            </SigFilter>
            <SigFilter filterKey="attrClass" label="Class">
              <MultiSelect options={[{ value: 'Standard', label: 'Standard' }, { value: 'Custom', label: 'Custom' }]} />
            </SigFilter>
            <SigFilter filterKey="changedBy" label="Changed By">
              <MultiSelect options={changedByOptions} />
            </SigFilter>
          </SigFilterBar>
        ) : undefined}
      >
        {expanded && (
        <AnalyticalTable
          data={filtered}
          columns={columns}
          visibleRows={Math.max(filtered.length, 3)}
          minRows={0}
          noDataText="No attributes match your search."
          scaleWidthMode="Smart"
        />
        )}
      </SigTableWrapper>

      <EditAttributeSelectionDialog
        open={editingAttr?.type === 'Selection' && editingAttr !== null}
        initialData={editingAttr ? {
          name: editingAttr.name,
          description: editingAttr.description,
          assignedTo: editingAttr.usedIn === 'All' ? [] : [editingAttr.usedIn],
        } : undefined}
        onClose={() => setEditingAttr(null)}
        onSave={(_data: AttributeSelectionData) => setEditingAttr(null)}
      />

      <CreateAttributeDialog
        open={createDialogOpen}
        dialogTitle="Create Attribute"
        hidePickerLabel
        dictMode={dictMode}
        modelingMode={modelingMode}
        modelingDictMode={modelingDictMode}
        hideAudience={hideAudience}
        dictCategories={dictCategories}
        defaultAssignedTo={defaultAssignedTo}
        assignableAssetTypes={assignableAssetTypes}
        modelingSubElements={modelingSubElements}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(type: AttributeType, name: string) => {
          const newAttr: Attribute = {
            name, description: '', type,
            usedIn: '',
            attrClass: 'Custom',
            technicalId: name.toLowerCase().replace(/\s+/g, '-'),
            changedOn: new Date().toLocaleDateString(),
            changedBy: 'Current User',
          }
          setAttrs(prev => [...prev, newAttr])
          setCreateDialogOpen(false)
          toastCb('Attribute added')
        }}
      />

      <CreateAttributeDialog
        open={editAttrDialogAttr !== null}
        editMode
        hidePickerLabel
        initialType={editAttrDialogAttr?.type as AttributeType | undefined}
        initialName={editAttrDialogAttr?.name}
        initialDescription={editAttrDialogAttr?.description}
        dictMode={dictMode}
        modelingMode={modelingMode}
        modelingDictMode={modelingDictMode}
        hideAudience={hideAudience}
        dictCategories={dictCategories}
        defaultAssignedTo={defaultAssignedTo}
        assignableAssetTypes={assignableAssetTypes}
        modelingSubElements={modelingSubElements}
        onClose={() => setEditAttrDialogAttr(null)}
        onCreate={(type: AttributeType, name: string) => {
          setAttrs(prev => prev.map(a => a === editAttrDialogAttr ? { ...a, name, type } : a))
          setEditAttrDialogAttr(null)
          toastCb('Attribute updated')
        }}
      />
      <MessageBox
        open={deleteAttrPending !== null}
        type="Warning"
        titleText={`Delete Attribute ${deleteAttrPending?.name ?? ''}`}
        actions={['Delete', 'Cancel']}
        emphasizedAction="Delete"
        onClose={(action) => {
          if (action === 'Delete' && deleteAttrPending) {
            setAttrs(prev => prev.filter(a => a !== deleteAttrPending))
            toastCb('Attribute deleted')
          }
          setDeleteAttrPending(null)
        }}
      >
        <div style={{ padding: '16px' }}>Delete the attribute?</div>
      </MessageBox>
    </>
  )
}

export default function AttributeDefinitions() {
  const { dictCategories } = useWorkspace()
  const [actionToast, setActionToast] = useState<string | null>(null)

  const modelingDictState = useTableState(MODELING_DICT_ATTRS)
  const tmAmState = useTableState(TM_AM_ATTRS)

  return (
    <>
      <PageHeader
        title="Attribute Definitions"
        subtitle="View and manage all attribute definitions across asset types."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AttributeTable
            title="Modeling and Dictionary Attributes"
            state={modelingDictState}
            modelingDictMode
            dictCategories={dictCategories}
            assignableAssetTypes={[
              ...NOTATION_ASSET_TYPES,
              ...dictCategories.map(c => ({ id: c.id, name: c.name })),
            ]}
            modelingSubElements={Object.values(SUB_ELEMENTS).flat().filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)}
            toastCb={setActionToast}
          />
          <AttributeTable
            title="Transformation Manager and Analysis and Mining Attributes"
            state={tmAmState}
            hideAudience
            assignableAssetTypes={TM_AM_ASSET_TYPES}
            toastCb={setActionToast}
          />
        </div>
      </PageHeader>

      <Toast open={!!actionToast} placement="BottomCenter" onClose={() => setActionToast(null)}>
        {actionToast}
      </Toast>
    </>
  )
}
