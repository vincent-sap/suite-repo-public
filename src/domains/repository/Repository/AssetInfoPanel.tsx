import React, { useRef, useState, useEffect, type FunctionComponent } from 'react'
import {
  Text, Icon, Button, Bar, Menu, MenuItem, MenuSeparator, Label, Switch, Input, Avatar, MessageStrip, MessageBox,
  Tab, TabContainer, IllustratedMessage, AnalyticalTable, Popover, List, ListItemStandard, ListItemCustom, Select, Option,
  type MenuDomRef,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2, SigRightSidePanel, SigRatingIndicator } from '@signavio/sap-signavio-uixtension'
import { DiagramThumbnail } from './components'
import ActivityFeed from './ActivityFeed'
import { CommentsTab } from './CommentsTab'
import { RelationsTab } from './RelationsTab'
import { ASSET_DETAILS, type FileItem, type OngoingApproval, type InfoPanelAttrGroup, type InfoPanelAttr } from './data'
import type { DictEntry } from './dictionaryData'
import { entryBg, entryIconColor, DICT_ENTRIES, CAT_TYPE_ICON } from './dictionaryData'
import type { SelectedAssetInfo } from '../AllResources'
import type { ViewportHint } from './MagicZoom'
import type { DictCategory, DictCategoryType } from '../../../contexts/WorkspaceContext'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import ProcessAtomInfoPanel from './ProcessAtomInfoPanel'

type Subscription = 'off' | 'daily' | 'weekly' | 'monthly'

function AttributeGroupsView({ groups }: { groups: InfoPanelAttrGroup[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map(g => [g.id, true]))
  )
  const [search, setSearch] = useState('')

  const query = search.toLowerCase().trim()

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ paddingBottom: '16px' }}>
        <Input
          placeholder="Search for attributes"
          type={'Search' as any}
          value={search}
          onInput={(e: any) => setSearch(e.target?.value ?? '')}
          style={{ width: '100%' }}
        />
      </div>
      {groups.map(group => {
        const visibleAttrs = query
          ? group.attrs.filter(a => a.label.toLowerCase().includes(query) || (a.value ?? '').toLowerCase().includes(query) || (a.values ?? []).some(v => v.toLowerCase().includes(query)))
          : group.attrs
        const isOpen = expanded[group.id] ?? true
        return (
          <div key={group.id}>
            {/* Group header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
              <Button
                icon={isOpen ? 'slim-arrow-down' : 'navigation-right-arrow'}
                design="Transparent"
                onClick={() => toggle(group.id)}
                aria-expanded={isOpen}
              />
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
                {group.name} ({group.attrs.length})
              </Text>
            </div>
            {/* Attributes */}
            {isOpen && visibleAttrs.map(attr => (
              <div key={attr.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                <Label style={{ color: 'var(--sapContent_LabelColor)' }}>{attr.label}</Label>
                {attr.type === 'multiline' && attr.value && (
                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5', wordBreak: 'break-word' }}>
                    {attr.value}
                  </Text>
                )}
                {attr.type === 'text' && attr.value && (
                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                    {attr.value}
                  </Text>
                )}
                {attr.type === 'chips' && attr.values && (
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '6px' }}>
                    {attr.values.map((v, i) => (
                      <SigChipV2 key={i} value={v} />
                    ))}
                  </div>
                )}
                {attr.type === 'boolean' && (
                  <Switch disabled checked={attr.boolValue} />
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Attribute field types for "create new entry" form ───────────────────────
type CreateAttrDef = {
  id: string
  label: string
  type: 'text' | 'multiline' | 'boolean' | 'selection' | 'multi-selection' | 'date' | 'number' | 'duration' | 'user' | 'asset' | 'rating' | 'documents'
  required?: boolean
  value?: string
  values?: string[]
  boolValue?: boolean
  documents?: { name: string; type: 'File' | 'URL' }[]
}

type CreateGroupDef = {
  id: string
  name: string
  attrs: CreateAttrDef[]
}

export function CreateDictEntryAttributesTab({ category, prefilled = false, onDirty, readOnly = false }: { category: DictCategory; prefilled?: boolean; onDirty?: () => void; readOnly?: boolean }) {
  const [search, setSearch] = useState('')
  const query = search.toLowerCase().trim()

  const mainGroup: CreateGroupDef = {
    id: 'main',
    name: 'Main Attributes',
    attrs: [
      { id: 'description', label: 'Description:',  type: 'multiline',       required: false, ...(prefilled ? { value: 'A key business object within the ' + category.name + ' domain. Used to define, classify and govern related processes and data structures across the organization.' } : {}) },
      { id: 'rel-docs',    label: 'Relevant Documents:', type: 'documents', required: false, ...(prefilled ? { documents: [{ name: '[File Name]', type: 'File' as const }, { name: '[File Name]', type: 'File' as const }, { name: '[URL Label/URL]', type: 'URL' as const }] } : {}) },
      { id: 'owner',       label: 'Owner:',         type: 'user',            required: false, ...(prefilled ? { values: ['Claire Westfield'] } : {}) },
      { id: 'status',      label: 'Status:',        type: 'selection',       required: false,  values: ['Draft'], ...(prefilled ? {} : {}) },
      { id: 'approved',    label: 'Approved:',      type: 'boolean',         required: false, ...(prefilled ? { boolValue: true } : {}) },
      { id: 'valid-from',  label: 'Valid From:',    type: 'date',            required: false, ...(prefilled ? { values: ['Jan 1, 2025'] } : {}) },
      { id: 'tags',        label: 'Tags:',           type: 'multi-selection', required: false, ...(prefilled ? { values: ['Finance', 'Procurement'] } : {}) },
      { id: 'ref-doc',     label: 'Reference Document:', type: 'asset',      required: false, ...(prefilled ? { values: ['[Dictionary Entry Name]', '[File Name]', '[URL Label/URL]'] } : {}) },
    ],
  }

  const visibleMainAttrs = query
    ? mainGroup.attrs.filter(a => a.label.toLowerCase().includes(query))
    : mainGroup.attrs

  const renderField = (attr: CreateAttrDef) => {
    if (attr.type === 'multiline') {
      if (attr.value) {
        const truncated = attr.value.length > 160
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapField_TextColor)', lineHeight: '1.5', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {truncated ? attr.value.slice(0, 160) + '...' : attr.value}
              {truncated && <span style={{ color: 'var(--sapLinkColor, #0064d9)', cursor: 'pointer', marginLeft: '4px' }}>More</span>}
            </Text>
            {!readOnly && <Button icon="edit" design="Default" style={{ alignSelf: 'flex-start', height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Edit" />}
          </div>
        )
      }
      if (readOnly) return null
      return <Button icon="edit" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Edit" />
    }
    if (attr.type === 'boolean') {
      return <Switch checked={attr.boolValue ?? false} disabled={readOnly} />
    }
    if (attr.type === 'text') {
      if (attr.value) {
        return <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapField_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{attr.value}</Text>
      }
      return <Button icon="add" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />
    }
    if (attr.type === 'selection' || attr.type === 'user' || attr.type === 'date') {
      if (attr.values?.length) {
        const isOwner = attr.id === 'owner'
        const isStatus = attr.id === 'status'
        const isValidFrom = attr.id === 'valid-from'
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {attr.values.map((v, i) => (
              <SigChipV2
                key={i}
                value={v}
                {...(!readOnly && isOwner ? { endActionIcon: 'decline', onClick: () => {}, onEndActionClick: () => {} } as any : {})}
                {...(!readOnly && isStatus ? { trailingIcon: 'slim-arrow-down' } as any : {})}
                {...(!readOnly && isValidFrom ? { leadingIcon: 'calendar', endActionIcon: 'decline', onClick: () => {}, onEndActionClick: () => {} } as any : {})}
                {...(readOnly && isValidFrom ? { leadingIcon: 'calendar' } : {})}
              />
            ))}
            {!readOnly && !isStatus && <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />}
          </div>
        )
      }
      if (readOnly) return null
      return <Button icon="add" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />
    }
    if (attr.type === 'multi-selection') {
      if (attr.values?.length) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {attr.values.map((v, i) => <SigChipV2 key={i} value={v} />)}
            {!readOnly && <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />}
          </div>
        )
      }
      if (readOnly) return null
      return <Button icon="add" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />
    }
    if (attr.type === 'asset') {
      if (attr.values?.length) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <List selectionMode="None" separators="None">
              {attr.values.map((v, i) => {
                const isFile = v.toLowerCase().includes('file')
                const isUrl = v.toLowerCase().includes('url')
                return (
                <ListItemCustom key={i} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', width: '100%' }}>
                    {isFile || isUrl
                      ? <SigDomainObject size="XS" object={(isFile ? 'File' : 'Link') as never} />
                      : <Avatar icon="SAP-icons-v4/risk" colorScheme="Accent3" size="XS" shape="Square" />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block' }}>
                        {isFile ? 'File' : isUrl ? 'URL' : '[Dict. Category] / [Dict. Sub Category]'}
                      </Text>
                    </div>
                    <div className="ui5-content-density-compact" style={{ display: 'flex' }}>
                      <Button icon="SAP-icons-v4/link" design="Transparent" tooltip="Open" />
                      {!readOnly && <Button icon="decline" design="Transparent" tooltip="Remove" />}
                    </div>
                  </div>
                </ListItemCustom>
                )
              })}
            </List>
            {!readOnly && <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', marginTop: '4px' }} tooltip="Add" />}
          </div>
        )
      }
      if (readOnly) return null
      return <Button icon="add" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />
    }
    if (attr.type === 'documents') {
      const docs = attr.documents ?? []
      const SHOW_LIMIT = 3
      const [showAll, setShowAll] = useState(false)
      const [localDocs, setLocalDocs] = useState(docs)
      const visible = showAll ? localDocs : localDocs.slice(0, SHOW_LIMIT)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {localDocs.length > 0 && (
            <List selectionMode="None" separators="None">
              {visible.map((doc, i) => (
                <ListItemCustom key={i} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', width: '100%' }}>
                    <SigDomainObject size="XS" object={(doc.type === 'URL' ? 'Link' : 'File') as never} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block' }}>{doc.type}</Text>
                    </div>
                    <div className="ui5-content-density-compact" style={{ display: 'flex' }}>
                      <Button icon="SAP-icons-v4/link" design="Transparent" tooltip="Open" />
                      {!readOnly && <Button icon="decline" design="Transparent" tooltip="Remove" onClick={() => setLocalDocs(prev => prev.filter((_, j) => j !== i))} />}
                    </div>
                  </div>
                </ListItemCustom>
              ))}
            </List>
          )}
          {!readOnly && localDocs.length > SHOW_LIMIT && (
            <Button design="Default" style={{ alignSelf: 'flex-start', marginTop: '4px' }} onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show Less' : 'Show More'}
            </Button>
          )}
          {!readOnly && <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', marginTop: '4px' }} tooltip="Add document" />}
        </div>
      )
    }
    return (
      <Button icon="add" design="Default" style={{ height: '24px', minWidth: '24px', padding: '0 6px' }} tooltip="Add" />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} onChange={onDirty}>
      {!readOnly && (
        <div style={{ paddingBottom: '16px' }}>
          <Input
            placeholder="Search for attributes"
            type={'Search' as any}
            value={search}
            onInput={(e: any) => setSearch(e.target?.value ?? '')}
            icon={<Icon slot="icon" name="search" />}
            style={{ width: '100%' }}
          />
        </div>
      )}
      {visibleMainAttrs.map(attr => (
        <div key={attr.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
          <Label showColon required={attr.required}>{attr.label.replace(/:$/, '')}</Label>
          <div style={{ display: 'flex' }}>
            {renderField(attr)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Category Picker Popover ────────────────────────────────────────────────────
function CatPickerPopover({ opener, open, onClose, dictCategories, selectedCategoryId, onSelect }: {
  opener: string; open: boolean; onClose: () => void
  dictCategories: DictCategory[]; selectedCategoryId?: string
  onSelect: (categoryId: string) => void
}) {
  const [search, setSearch] = useState('')
  return (
    <Popover
      opener={opener}
      open={open}
      placement="Bottom"
      horizontalAlign="Start"
      hideArrow
      className="no-padding-popover"
      onClose={onClose}
      style={{ width: '280px' }}
    >
      <div style={{ padding: '8px 8px 4px' }}>
        <Input
          placeholder="Search"
          value={search}
          showClearIcon
          style={{ width: '100%' }}
          onInput={(e: any) => setSearch(e.target?.value ?? '')}
          icon={<Icon slot="icon" name="search" />}
        />
      </div>
      <List selectionMode="Single" separators="None" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {dictCategories
          .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
          .map(c => (
            <ListItemStandard
              key={c.id}
              type="Active"
              selected={c.id === selectedCategoryId}
              icon={CAT_TYPE_ICON[c.type as DictCategoryType] ?? 'document'}
              style={c.parentId ? { paddingInlineStart: '1.5rem' } as React.CSSProperties : undefined}
              onClick={() => { onSelect(c.id); onClose() }}
            >{c.name}</ListItemStandard>
          ))
        }
      </List>
    </Popover>
  )
}

type Props = {
  selectedAsset: FileItem | null
  selectedDictEntry: DictEntry | null
  selectedDictCategory?: DictCategory | null
  dictCategories: DictCategory[]
  externalSelectedAsset: SelectedAssetInfo | null
  pageTitle: string
  selectionCount: number
  zoomViewport: ViewportHint | null
  subscriptions: Record<string, Subscription>
  onSubscriptionChange: (id: string, value: Subscription) => void
  bpmnXml?: string
  onThumbnailEnter: () => void
  onThumbnailLeave: () => void
  onThumbnailMove: (nx: number, ny: number) => void
  onThumbnailClick?: () => void
  onClose: () => void
  onOpenModelDetail: () => void
  onShare?: () => void
  onManageAccess?: () => void
  onCopyLink?: () => void
  onRename?: () => void
  onEmbed?: () => void
  hideHeaderActions?: boolean
  hideRevisionInfo?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isDictView?: boolean
  isModelingFolder?: boolean
  createDictCategoryId?: string | null
  onDiscardCreate?: () => void
  onCreateCategoryChange?: (categoryId: string) => void
  createProcessAtom?: boolean
  onProcessAtomSaved?: (name: string, description: string) => void
  onDictEntrySaved?: (entry: DictEntry) => void
  onDictEntryEdited?: () => void
  onDictEntryMoved?: (entryId: string, newCategoryId: string) => void
}

function ModelAttributesTab({ description }: { description?: string }) {
  const [search, setSearch] = useState('')
  const [mainExpanded, setMainExpanded] = useState(true)
  const [group1Expanded, setGroup1Expanded] = useState(false)
  const [group2Expanded, setGroup2Expanded] = useState(false)
  const [showMoreTags, setShowMoreTags] = useState(false)
  const [showMoreUsers, setShowMoreUsers] = useState(false)
  const [showMoreAssets, setShowMoreAssets] = useState(false)
  const [_showTable, _setShowTable] = useState(false)
  const [_showRiskDetails, _setShowRiskDetails] = useState(false)

  const labelStyle: React.CSSProperties = { fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', marginBottom: '4px' }
  const attrRow: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }
  const boldText: React.CSSProperties = { fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }
  const subText: React.CSSProperties = { fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }

  const tags = ['Finance', 'Procurement', 'SAP S/4HANA', 'P2P', 'Core Process']
  const users = [
    { initials: 'LF', color: 'Accent6' as const, name: 'Leadership Forum', sub: 'User Group' },
    { initials: 'CW', color: 'Accent1' as const, name: 'Claire Westfield', sub: 'claire.westfield@globalcorp.com' },
    { initials: 'SD', color: 'Accent5' as const, name: 'Susann Deuterle', sub: 'susann.deuterle@globalcorp.com' },
    { initials: 'LW', color: 'Accent1' as const, name: 'Lin Webster', sub: 'lin.webster@globalcorp.com' },
    { initials: 'PG', color: 'Accent3' as const, name: 'Paul Gray', sub: 'paul.gray@globalcorp.com' },
  ]
  const assets = [
    { object: 'Process Model' as never, name: 'Procure-to-Pay Process', sub: 'BPMN' },
    { object: 'Risk' as never, name: 'Unauthorized Purchase Risk', sub: 'Risk / Procurement' },
    { object: 'File' as never, name: 'AP Policy Document v2.1', sub: 'File' },
    { object: 'Process Model' as never, name: 'Supplier Onboarding', sub: 'BPMN' },
    { object: 'Link' as never, name: 'SAP Help Portal – P2P', sub: 'URL' },
  ]
  const risks = [
    { object: 'Risk' as never, name: 'Unauthorized Purchase Order Risk', sub: 'Risk', indent: false },
    { object: 'Control' as never, name: 'Three-way Match Control', sub: 'Control', indent: true },
    { object: 'Risk' as never, name: 'Duplicate Invoice Payment Risk', sub: 'Risk', indent: false },
    { object: 'Control' as never, name: 'Invoice De-Duplication Check', sub: 'Control', indent: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingBottom: '16px' }}>
        <Input
          placeholder="Search for attributes"
          type={'Search' as any}
          value={search}
          onInput={(e: any) => setSearch(e.target?.value ?? '')}
          icon={<Icon slot="icon" name="search" />}
          style={{ width: '100%' }}
        />
      </div>

      {/* Main Attributes Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
        <Button icon={mainExpanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setMainExpanded(v => !v)} style={{ width: '24px', height: '24px', minWidth: '24px', padding: 0 }} />
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>Main Attributes (14)</Text>
      </div>

      {mainExpanded && (
        <>
          {/* Description */}
          <div style={attrRow}>
            <Label style={labelStyle}>Description:</Label>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapField_TextColor)', lineHeight: '1.5', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {(description ?? 'This process covers the end-to-end procurement lifecycle from purchase requisition through supplier payment, including three-way match and exception handling. The process owner is responsible for maintaining process documentation and ensuring compliance with corporate procurement policies across all business units.').slice(0, 280)}...
              <span style={{ color: 'var(--sapLinkColor,#0064d9)', cursor: 'pointer', marginLeft: '4px' }}>More</span>
            </Text>
          </div>

          {/* Area of Application (single) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Area of Application:</Label>
            <SigChipV2 value="EMEA" />
          </div>

          {/* Tags (multi) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Tags:</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(showMoreTags ? tags : tags.slice(0, 3)).map(t => <SigChipV2 key={t} value={t} />)}
              {!showMoreTags && tags.length > 3 && <Button design="Default" style={{ alignSelf: 'flex-start' }} onClick={() => setShowMoreTags(true)}>Show More</Button>}
            </div>
          </div>

          {/* Approved (boolean) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Approved:</Label>
            <Switch disabled checked />
          </div>

          {/* Valid From (single date) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Valid From:</Label>
            <SigChipV2 value="Jan 1, 2025" leadingIcon="calendar" />
          </div>

          {/* Review Period (date range) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Review Period:</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <SigChipV2 value="Jan 1, 2025" leadingIcon="calendar" />
              <SigChipV2 value="Dec 31, 2025" leadingIcon="calendar" />
            </div>
          </div>

          {/* Number */}
          <div style={attrRow}>
            <Label style={labelStyle}>Process Cost (€):</Label>
            <SigChipV2 value="12,500 €" />
          </div>

          {/* Duration */}
          <div style={attrRow}>
            <Label style={labelStyle}>Average Duration:</Label>
            <SigChipV2 value="3 Days" />
          </div>

          {/* Rating */}
          <div style={attrRow}>
            <Label style={labelStyle}>Maturity Rating:</Label>
            <SigRatingIndicator max={5} filled={3} readOnly />
          </div>

          {/* Priority (selection) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Priority:</Label>
            <SigChipV2 value="High" />
          </div>

          {/* Responsible (user list) */}
          <div style={attrRow}>
            <Label style={labelStyle}>Responsible:</Label>
            <List separators="None" style={{ width: '100%' }}>
              {(showMoreUsers ? users : users.slice(0, 3)).map(u => (
                <ListItemCustom key={u.name} type="Active" style={{ paddingBlock: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <Avatar initials={u.initials} colorScheme={u.color} size="XS" shape="Circle" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ ...boldText, display: 'block' }}>{u.name}</Text>
                      <Text style={{ ...subText, display: 'block' }}>{u.sub}</Text>
                    </div>
                    <Button icon="email" design="Transparent" />
                  </div>
                </ListItemCustom>
              ))}
            </List>
            {!showMoreUsers && users.length > 3 && <Button design="Default" style={{ alignSelf: 'flex-start' }} onClick={() => setShowMoreUsers(true)}>Show More</Button>}
          </div>

          {/* Related Assets */}
          <div style={attrRow}>
            <Label style={labelStyle}>Related Assets:</Label>
            <List separators="None" style={{ width: '100%' }}>
              {(showMoreAssets ? assets : assets.slice(0, 3)).map((a, i) => (
                <ListItemCustom key={i} type="Active" style={{ paddingBlock: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    {a.object === 'Risk' as never
                      ? <Avatar icon="SAP-icons-v4/risk" colorScheme="Accent3" size="XS" shape="Square" />
                      : <SigDomainObject size="XS" object={a.object} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ ...boldText, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</Text>
                      <Text style={{ ...subText, display: 'block' }}>{a.sub}</Text>
                    </div>
                    <Button icon="SAP-icons-v4/link" design="Transparent" />
                  </div>
                </ListItemCustom>
              ))}
            </List>
            {!showMoreAssets && assets.length > 3 && <Button design="Default" style={{ alignSelf: 'flex-start' }} onClick={() => setShowMoreAssets(true)}>Show More</Button>}
          </div>

          {/* Risk Management */}
          <div style={attrRow}>
            <Label style={labelStyle}>Risk Management:</Label>
            <List separators="None" style={{ width: '100%' }}>
              {risks.map((r, i) => (
                <ListItemCustom key={i} type="Active" style={{ paddingBlock: '8px', paddingInlineStart: r.indent ? '32px' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    {r.object === 'Risk' as never
                      ? <Avatar icon="SAP-icons-v4/risk" colorScheme="Accent3" size="XS" shape="Square" />
                      : <Avatar icon="SAP-icons-v4/overlay-risk-control" colorScheme="Accent8" size="XS" shape="Square" />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ ...boldText, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</Text>
                      <Text style={{ ...subText, display: 'block' }}>{r.sub}</Text>
                    </div>
                    <Button icon="SAP-icons-v4/link" design="Transparent" />
                  </div>
                </ListItemCustom>
              ))}
            </List>
            <Button design="Default" style={{ alignSelf: 'flex-start' }} icon="full-screen">Show Details</Button>
          </div>

          {/* Attribute Table */}
          <div style={attrRow}>
            <Label style={labelStyle}>KPI Table:</Label>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <AnalyticalTable
                data={[
                  { kpi: 'PO Cycle Time', target: '< 2 days', description: 'Time from PR to PO creation' },
                  { kpi: '3-Way Match Rate', target: '> 95%', description: 'Invoices matched without exception' },
                  { kpi: 'Supplier On-Time', target: '> 90%', description: 'On-time delivery rate' },
                ]}
                columns={[
                  { Header: 'KPI', accessor: 'kpi', minWidth: 140 },
                  { Header: 'Target', accessor: 'target', minWidth: 100 },
                  { Header: 'Description', accessor: 'description', minWidth: 200 },
                ]}
                selectionMode="None"
                visibleRows={3}
                minRows={3}
                style={{ width: '440px' }}
                className="ui5-content-density-compact"
              />
            </div>
            <Button design="Default" style={{ alignSelf: 'flex-start' }} icon="full-screen">Show Table</Button>
          </div>
        </>
      )}

      {/* Additional collapsed groups */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
        <Button icon={group1Expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setGroup1Expanded(v => !v)} style={{ width: '24px', height: '24px', minWidth: '24px', padding: 0 }} />
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>Process Details (4)</Text>
      </div>
      {group1Expanded && (
        <div style={{ padding: '0 0 8px 28px' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>No attributes to display</Text>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
        <Button icon={group2Expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setGroup2Expanded(v => !v)} style={{ width: '24px', height: '24px', minWidth: '24px', padding: 0 }} />
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>Governance (3)</Text>
      </div>
      {group2Expanded && (
        <div style={{ padding: '0 0 8px 28px' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>No attributes to display</Text>
        </div>
      )}
    </div>
  )
}

function ApprovalCard({ approval }: { approval: OngoingApproval }) {
  return (
    <MessageStrip
      design="Information"
      hideCloseButton
      style={{ marginBottom: '0.5rem' }}
    >
      Approval: {approval.name} (As Is) (revision {approval.revision}) {approval.date}
    </MessageStrip>
  )
}

export default function AssetInfoPanel({
  selectedAsset,
  selectedDictEntry,
  selectedDictCategory,
  dictCategories,
  externalSelectedAsset,
  pageTitle,
  selectionCount,
  zoomViewport,
  subscriptions: _subscriptions,
  onSubscriptionChange: _onSubscriptionChange,
  onThumbnailEnter,
  onThumbnailLeave,
  onThumbnailMove,
  onThumbnailClick,
  onClose,
  onOpenModelDetail,
  onShare,
  onManageAccess,
  onCopyLink,
  onRename,
  onEmbed,
  createDictCategoryId,
  onDiscardCreate,
  onCreateCategoryChange,
  createProcessAtom,
  onProcessAtomSaved,
  onDictEntrySaved,
  onDictEntryEdited,
  onDictEntryMoved,
  hideRevisionInfo,
  isFavorite,
  onToggleFavorite,
  isDictView,
  isModelingFolder,
  bpmnXml,
}: Props) {
  const { contentLanguages } = useWorkspace()
  const [createLangPopoverOpen, setCreateLangPopoverOpen] = useState(false)
  const [catPickerOpen, setCatPickerOpen] = useState(false)
  const [createCatPickerOpen, setCreateCatPickerOpen] = useState(false)
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)
  const [attrResetKey, setAttrResetKey] = useState(0)
  const [createSelectedLang, setCreateSelectedLang] = useState('')
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false)
  const [duplicateCategoryNames, setDuplicateCategoryNames] = useState<string[]>([])
  // const notifMenuRef = useRef<MenuDomRef>(null)
  const overflowMenuRef = useRef<MenuDomRef>(null)
  const [notifPref, setNotifPref] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Off'>('Off')
  const [dictEntryDirty, setDictEntryDirty] = useState(false)
  const [dictEntryEditName, setDictEntryEditName] = useState('')

  useEffect(() => {
    if (selectedDictEntry) setDictEntryEditName(selectedDictEntry.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDictEntry?.id ?? null])
  const statusMenuRef = useRef<MenuDomRef>(null)
  const [newEntryName, setNewEntryName] = useState('New Dictionary Entry')
  const [newAtomName, setNewAtomName] = useState('New Process Atom')
  const [newAtomDescription, setNewAtomDescription] = useState('')

  const isProcessAtom = externalSelectedAsset?.objectType === 'Process Atoms'
  const atomCanEdit = isProcessAtom && (externalSelectedAsset?.canEdit ?? false)

  const [atomEditName, setAtomEditName] = useState(externalSelectedAsset?.name ?? '')
  useEffect(() => {
    setAtomEditName(externalSelectedAsset?.name ?? '')
  }, [externalSelectedAsset?.id])

  const STATUS_OPTIONS: { value: string; design: string }[] = [
    { value: 'Published', design: 'indication5' },
    { value: 'Draft', design: 'indication10' },
    { value: 'Deprecated', design: 'indication2' },
  ]
  const atomChipDesign = (value: string) =>
    value === 'Published' ? 'indication5' : value === 'Draft' ? 'indication10' : value === 'Deprecated' ? 'indication2' : 'indication10'
  const atomChipIcon = (value: string) =>
    value === 'Published' ? 'SAP-icons-v4/published' : value === 'Draft' ? 'write-new-document' : value === 'Deprecated' ? 'cancel' : undefined
  const initialStatus = externalSelectedAsset?.chips?.[0]
    ? { value: externalSelectedAsset.chips[0].value, design: atomChipDesign(externalSelectedAsset.chips[0].value) }
    : null
  const [atomStatus, setAtomStatus] = useState(initialStatus)
  useEffect(() => {
    const c = externalSelectedAsset?.chips?.[0]
    setAtomStatus(c ? { value: c.value, design: atomChipDesign(c.value) } : null)
  }, [externalSelectedAsset?.id])

  useEffect(() => {
    setDictEntryDirty(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDictEntry?.id ?? null])

  // const getSubscription = (id: string): Subscription => subscriptions[id] ?? 'off'

  const subscribeField = (
    <Select
      value={notifPref === 'Off' ? undefined : notifPref}
      style={{ minWidth: '160px' }}
      onChange={(e: any) => { const v = e.detail?.selectedOption?.value; if (v === 'Cancel subscription') setNotifPref('Off'); else if (v) setNotifPref(v as typeof notifPref) }}
    >
      {notifPref === 'Off' && (
        <span slot="label" style={{ color: 'var(--sapContent_PlaceholderTextColor, #89919a)', fontStyle: 'italic', fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>Select frequency</span>
      )}
      <Option value="Daily">Daily</Option>
      <Option value="Weekly">Weekly</Option>
      <Option value="Monthly">Monthly</Option>
      {notifPref !== 'Off' && <Option value="Cancel subscription">Cancel subscription</Option>}
    </Select>
  )

  const createCategory = createDictCategoryId
    ? dictCategories.find(c => c.id === createDictCategoryId) ?? null
    : null

  const dictEntryCategory = selectedDictEntry
    ? dictCategories.find(c => c.id === (pendingCategoryId ?? selectedDictEntry.categoryId)) ?? null
    : createCategory ?? null
  const objectType = selectedAsset?.type ?? externalSelectedAsset?.objectType ?? (dictEntryCategory?.name ?? 'Folder')
  const objectTypeLabel = selectedAsset?.type ?? externalSelectedAsset?.typeName ?? externalSelectedAsset?.objectType ?? (dictEntryCategory?.name ?? 'Folder')

  const subHeader = selectedAsset ? (
    <>
      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sapPageHeader_BorderColor)', marginBottom: '0.75rem' }}>
        <DiagramThumbnail onClick={onThumbnailClick} onMouseMove={onThumbnailMove} viewport={zoomViewport} bpmnXml={bpmnXml} style={{ cursor: onThumbnailClick ? 'zoom-in' : undefined } as React.CSSProperties} />
      </div>
      {(() => {
        const chipFor = (status: string) => {
          const design = status === 'Published' ? 'indication5' : status === 'Draft' ? 'indication10' : status === 'On Track' ? 'indication4' : status === 'At Risk' ? 'indication2' : status === 'Modified' ? 'indication7' : status === 'Deprecated' ? 'indication2' : 'indication10'
          const icon = status === 'Published' ? 'SAP-icons-v4/published' : status === 'Draft' ? 'write-new-document' : status === 'On Track' ? 'trend-up' : status === 'At Risk' ? 'message-warning' : status === 'Modified' ? 'SAP-icons-v4/published-changed' : status === 'Deprecated' ? 'cancel' : undefined
          return { value: status, design, icon }
        }
        const detail = ASSET_DETAILS[selectedAsset.id]
        const isPublished = selectedAsset.status === 'Published'
        const rows: { label: string; value: string; chips?: { value: string; design: string; icon?: string }[]; variantChip?: { value: string } }[] = []
        if (selectedAsset.type === 'Process Model') {
          rows.push({ label: 'Level:', value: detail?.level ?? 'Level 2' })
        }
        if (!hideRevisionInfo) rows.push({ label: 'Latest Revision:', value: detail ? `${detail.revision}` : (selectedAsset.version ?? '1.0'), chips: selectedAsset.status ? [chipFor(selectedAsset.status)] : [] })
        if (!hideRevisionInfo) rows.push({ label: 'Published Revision:', value: isPublished ? (detail ? `${detail.revision}` : (selectedAsset.version ?? '—')) : '—', chips: isPublished ? [chipFor('Published')] : [] })
        if (selectedAsset.type === 'Process Model') {
          const v = detail?.variants
          const chipValue = v === 'template' ? 'Template' : v ? `${v.count} Variants` : '3 Variants'
          rows.push({ label: 'Variant Management:', value: '', variantChip: { value: chipValue } })
        }
        if (!hideRevisionInfo) rows.push({ label: 'Published:', value: detail?.lastPublished ? `${detail.lastPublished} by ${detail.lastAuthor ?? '—'}` : '—' })
        rows.push({ label: 'Changed:', value: (detail?.lastEditedAt ?? selectedAsset.changed) + (detail?.lastEditedBy ? ` by ${detail.lastEditedBy}` : selectedAsset.changedBy ? ` by ${selectedAsset.changedBy}` : '') })
        rows.push({ label: 'Created:', value: selectedAsset.created + (detail?.lastAuthor ? ` by ${detail.lastAuthor}` : selectedAsset.changedBy ? ` by ${selectedAsset.changedBy}` : '') })
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingBottom: '0.5rem' }}>
            {detail?.ongoingApproval && <ApprovalCard approval={detail.ongoingApproval} />}
            {rows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: hideRevisionInfo ? '4px' : '12px', minHeight: '26px', paddingBottom: '2px' }}>
                <Text style={{ width: hideRevisionInfo ? '80px' : '160px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', paddingTop: '2px' }}>{row.label}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
                  {row.variantChip ? (
                    <SigChipV2 value={row.variantChip.value} design="none" leadingIcon="SAP-icons-v4/variant" condensed />
                  ) : row.chips?.length ? (
                    <>
                      {row.value !== '—' && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>}
                      {row.value === '—' && !row.chips.length && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>—</Text>}
                      {row.chips.map((c, i) => <SigChipV2 key={i} value={c.value} design={c.design as any} {...((c as any).icon ? { leadingIcon: (c as any).icon } : {})} condensed />)}
                    </>
                  ) : (
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value || '—'}</Text>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
              <Text style={{ width: hideRevisionInfo ? '80px' : '160px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Subscribe:</Text>
              {subscribeField}
            </div>
          </div>
        )
      })()}
    </>
  ) : externalSelectedAsset && externalSelectedAsset.objectType !== 'Process Atoms' && externalSelectedAsset.objectType !== 'Initiative' && externalSelectedAsset.objectType !== 'Business Goal' && externalSelectedAsset.objectType !== 'Dashboard' && externalSelectedAsset.objectType !== 'Dictionary Entry' ? (
    <>
      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sapPageHeader_BorderColor)', marginBottom: '0.75rem' }}>
        <DiagramThumbnail onMouseEnter={onThumbnailEnter} onMouseLeave={onThumbnailLeave} onMouseMove={onThumbnailMove} viewport={zoomViewport} bpmnXml={bpmnXml} />
      </div>
      {(() => {
        const isPublished = externalSelectedAsset.chips.some(c => c.value === 'Published')
        const chipFor2 = (status: string) => {
          const design = status === 'Published' ? 'indication5' : status === 'Draft' ? 'indication10' : status === 'On Track' ? 'indication4' : status === 'At Risk' ? 'indication2' : status === 'Modified' ? 'indication7' : 'indication10'
          const icon = status === 'Published' ? 'SAP-icons-v4/published' : status === 'Draft' ? 'write-new-document' : status === 'On Track' ? 'trend-up' : status === 'At Risk' ? 'message-warning' : status === 'Modified' ? 'SAP-icons-v4/published-changed' : undefined
          return { value: status, design, icon }
        }
        const rows: { label: string; value: string; chips?: { value: string; design: string; icon?: string }[] }[] = [
          { label: 'Latest Revision:', value: externalSelectedAsset.version ?? '1.0', chips: externalSelectedAsset.chips.slice(0, 1).map(c => chipFor2(c.value)) },
          { label: 'Published Revision:', value: isPublished ? (externalSelectedAsset.version ?? '—') : '—', chips: isPublished ? [chipFor2('Published')] : [] },
          { label: 'Published:', value: externalSelectedAsset.lastPublished ? `${externalSelectedAsset.lastPublished} by ${externalSelectedAsset.lastUpdateBy ?? '—'}` : '—' },
          { label: 'Changed:', value: externalSelectedAsset.lastUpdateDate ? `${externalSelectedAsset.lastUpdateDate} by ${externalSelectedAsset.lastUpdateBy ?? '—'}` : '—' },
          { label: 'Created:', value: (externalSelectedAsset as any).createdDate ? `${(externalSelectedAsset as any).createdDate} by ${externalSelectedAsset.lastUpdateBy ?? '—'}` : '—' },
        ]
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingBottom: '0.5rem' }}>
            {rows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: hideRevisionInfo ? '4px' : '12px', minHeight: '26px', paddingBottom: '2px' }}>
                <Text style={{ width: hideRevisionInfo ? '80px' : '160px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', paddingTop: '2px' }}>{row.label}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                  {row.chips?.length ? (
                    <>
                      {row.value !== '—' && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>}
                      {row.chips.map((c, i) => <SigChipV2 key={i} value={c.value} design={c.design as any} {...((c as any).icon ? { leadingIcon: (c as any).icon } : {})} condensed />)}
                    </>
                  ) : (
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value || '—'}</Text>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
              <Text style={{ width: hideRevisionInfo ? '80px' : '160px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Subscribe:</Text>
              {subscribeField}
            </div>
          </div>
        )
      })()}
    </>
  ) : selectedDictEntry ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {([
        { label: 'Latest Revision:', value: '1.0', chips: [{ value: selectedDictEntry.status, design: selectedDictEntry.status === 'Published' ? 'indication5' : 'indication10', icon: selectedDictEntry.status === 'Published' ? 'SAP-icons-v4/published' : 'write-new-document' }] },
        { label: 'Published Revision:', value: '—', chips: selectedDictEntry.status === 'Published' ? [{ value: 'Published', design: 'indication5', icon: 'SAP-icons-v4/published' }] : [] },
        { label: 'Published:', value: selectedDictEntry.status === 'Published' ? `${selectedDictEntry.changed} by Claire Westfield` : '—' },
        { label: 'Changed:', value: `${selectedDictEntry.changed} by Claire Westfield` },
        { label: 'Created:', value: `${selectedDictEntry.created} by Claire Westfield` },
      ] as { label: string; value: string; chips?: { value: string; design: string; icon?: string }[] }[]).map(row => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
          <Text style={{ width: '130px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', paddingTop: '2px' }}>{row.label}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
            {row.value !== '—' && !row.chips?.length && (
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>
            )}
            {row.value === '—' && !row.chips?.length && (
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>—</Text>
            )}
            {row.chips?.length ? (
              <>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>
                {row.chips.map((c, i) => <SigChipV2 key={i} value={c.value} design={c.design as any} {...((c as any).icon ? { leadingIcon: (c as any).icon } : {})} condensed />)}
              </>
            ) : null}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
        <Text style={{ width: '130px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Subscribe:</Text>
        {subscribeField}
      </div>
    </div>
  ) : externalSelectedAsset && externalSelectedAsset.objectType === 'Process Atoms' ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '2rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>Revision:</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <SigChipV2 value={externalSelectedAsset.version ?? '—'} condensed />
          {atomStatus && (
            <>
              {atomCanEdit ? (
                <SigChipV2
                  value={atomStatus.value}
                  design={atomStatus.design as any}
                  leadingIcon={atomChipIcon(atomStatus.value) as any}
                  condensed
                  trailingIcon="slim-arrow-down"
                  onClick={(e: any) => {
                    if (statusMenuRef.current) {
                      statusMenuRef.current.opener = e.currentTarget
                      statusMenuRef.current.open = true
                    }
                  }}
                />
              ) : (
                <SigChipV2
                  value={atomStatus.value}
                  design={atomStatus.design as any}
                  leadingIcon={atomChipIcon(atomStatus.value) as any}
                  condensed
                />
              )}
              {atomCanEdit && (
                <Menu
                  ref={statusMenuRef}
                  onItemClick={(e: any) => {
                    const text = e.detail?.text as string | undefined
                    const opt = STATUS_OPTIONS.find(o => o.value === text)
                    if (opt) setAtomStatus({ value: opt.value, design: atomChipDesign(opt.value) })
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem
                      key={opt.value}
                      text={opt.value}
                      icon={atomStatus.value === opt.value ? 'accept' : ''}
                    />
                  ))}
                </Menu>
              )}
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '2rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>Published:</Text>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{externalSelectedAsset.lastPublished ?? '—'}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '2rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>Changed:</Text>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
          {externalSelectedAsset.lastUpdateBy}, {externalSelectedAsset.lastUpdateDate}
        </Text>
      </div>
    </div>
  ) : (externalSelectedAsset?.objectType === 'Initiative' || externalSelectedAsset?.objectType === 'Business Goal' || externalSelectedAsset?.objectType === 'Dashboard') ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {([
        { label: 'Changed:', value: externalSelectedAsset.lastUpdateDate ? `${externalSelectedAsset.lastUpdateDate} by ${externalSelectedAsset.lastUpdateBy ?? '—'}` : '—' },
        { label: 'Created:', value: (externalSelectedAsset as any).createdDate ? `${(externalSelectedAsset as any).createdDate} by ${externalSelectedAsset.lastUpdateBy ?? '—'}` : '—' },
      ]).map(row => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
          <Text style={{ width: '80px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', paddingTop: '2px' }}>{row.label}</Text>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', flex: 1 }}>{row.value}</Text>
        </div>
      ))}
    </div>
  ) : externalSelectedAsset?.objectType === 'Dictionary Entry' ? (() => {
    const matchedEntry = DICT_ENTRIES.find(e => e.name === externalSelectedAsset.name) ?? null
    const status = matchedEntry?.status ?? 'Draft'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {([
          { label: 'Latest Revision:', value: '1.0', chips: [{ value: status, design: status === 'Published' ? 'indication5' : 'indication10', icon: status === 'Published' ? 'SAP-icons-v4/published' : 'write-new-document' }] },
          { label: 'Published Revision:', value: '—', chips: status === 'Published' ? [{ value: 'Published', design: 'indication5', icon: 'SAP-icons-v4/published' }] : [] },
          { label: 'Published:', value: status === 'Published' ? `${matchedEntry?.changed ?? '—'} by Claire Westfield` : '—' },
          { label: 'Changed:', value: `${matchedEntry?.changed ?? externalSelectedAsset.lastUpdateDate ?? '—'} by Claire Westfield` },
          { label: 'Created:', value: `${matchedEntry?.created ?? '—'} by Claire Westfield` },
        ] as { label: string; value: string; chips?: { value: string; design: string; icon?: string }[] }[]).map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minHeight: '26px', paddingBottom: '2px' }}>
            <Text style={{ width: '130px', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', paddingTop: '2px' }}>{row.label}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
              {row.chips?.length ? (
                <>
                  {row.value !== '—' && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>}
                  {row.value === '—' && !row.chips.length && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>—</Text>}
                  {row.chips.map((c, i) => <SigChipV2 key={i} value={c.value} design={c.design as any} {...((c as any).icon ? { leadingIcon: (c as any).icon } : {})} condensed />)}
                </>
              ) : (
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  })() : undefined

  const tabs = selectedAsset ? [
    <Tab text="Attributes" key="attributes">
      {(() => {
        const detail = ASSET_DETAILS[selectedAsset.id]
        return <ModelAttributesTab description={detail?.attributes?.[0]?.value ?? selectedAsset.description} />
      })()}
    </Tab>,
    <Tab text="Relations" key="relations"><RelationsTab /></Tab>,
    <Tab text="Comments" key="comments"><CommentsTab /></Tab>,
    <Tab text="Activity" key="activity"><ActivityFeed assetType={selectedAsset.type} assetName={selectedAsset.name} /></Tab>,
  ] : selectedDictEntry ? [
    <Tab text="Attributes" key="attributes">
      {dictEntryCategory
        ? <CreateDictEntryAttributesTab key={attrResetKey} category={dictEntryCategory} prefilled onDirty={() => setDictEntryDirty(true)} />
        : (() => {
            const groups: InfoPanelAttrGroup[] = ([
              { id: 'main', name: 'Main Attributes', attrs: ([
                { id: 'desc',     label: 'Description:', type: 'multiline' as const, value: selectedDictEntry.description ?? '' },
              ] as InfoPanelAttr[]).filter(a => (a.value ?? '') !== '') },
            ] as InfoPanelAttrGroup[]).filter(g => g.attrs.length > 0)
            return <AttributeGroupsView groups={groups} />
          })()
      }
    </Tab>,
    <Tab text="Relations" key="relations"><RelationsTab variant="dict-entry" entryName={selectedDictEntry?.name} /></Tab>,
    <Tab text="Activity" key="activity"><ActivityFeed assetType="Dictionary Entry" manualPublish={dictEntryCategory?.type === 'Activity'} entryName={selectedDictEntry?.name ?? dictEntryEditName} dictCategory={dictEntryCategory ?? undefined} /></Tab>,
  ] : externalSelectedAsset ? (() => {
    // Dictionary Entry from All Resources — use the same panel as dict entries in Dictionary page
    if (externalSelectedAsset.objectType === 'Dictionary Entry') {
      const matchedEntry = DICT_ENTRIES.find(e => e.name === externalSelectedAsset.name) ?? null
      const matchedCategory = matchedEntry ? dictCategories.find(c => c.id === matchedEntry.categoryId) ?? null : null
      return [
        <Tab text="Attributes" key="attributes">
          {matchedCategory
            ? <CreateDictEntryAttributesTab category={matchedCategory} prefilled />
            : (() => {
                const groups: InfoPanelAttrGroup[] = ([
                  { id: 'main', name: 'Main Attributes', attrs: ([
                    { id: 'desc', label: 'Description:', type: 'multiline' as const, value: externalSelectedAsset.description ?? '' },
                  ] as InfoPanelAttr[]).filter(a => (a.value ?? '') !== '') },
                ] as InfoPanelAttrGroup[]).filter(g => g.attrs.length > 0)
                return <AttributeGroupsView groups={groups} />
              })()
          }
        </Tab>,
        <Tab text="Relations" key="relations"><RelationsTab variant="dict-entry" entryName={externalSelectedAsset.name} /></Tab>,
        <Tab text="Activity" key="activity"><ActivityFeed assetType="Dictionary Entry" manualPublish={dictEntryCategory?.type === 'Activity'} entryName={externalSelectedAsset.name} dictCategory={matchedCategory ?? undefined} /></Tab>,
      ]
    }
    if (externalSelectedAsset.objectType === 'Business Goal' || externalSelectedAsset.objectType === 'Initiative' || externalSelectedAsset.objectType === 'Dashboard') {
      const isObjective = externalSelectedAsset.objectType === 'Business Goal'
      const rawChip = externalSelectedAsset.chips[0]
      const chipDesign = (v: string) => v === 'Published' ? 'indication5' : v === 'Draft' ? 'indication10' : v === 'On Track' ? 'indication4' : v === 'At Risk' ? 'indication2' : v === 'Modified' ? 'indication7' : 'none'
      const statusChip = rawChip ? { ...rawChip, design: chipDesign(rawChip.value) as any } : undefined
      return [
        <Tab text="Attributes" key="attributes">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Group header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
              <Button icon="slim-arrow-down" design="Transparent" style={{ width: '24px', height: '24px', minWidth: '24px', padding: 0 }} />
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
                Main Attributes (9)
              </Text>
            </div>
            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>Description:</Label>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapField_TextColor)', lineHeight: '1.5', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                {externalSelectedAsset.description ?? '—'}
              </Text>
              <Button icon="edit" design="Default" style={{ alignSelf: 'flex-start', height: '24px', padding: '0 6px' }} />
            </div>
            {/* Status */}
            {statusChip && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
                <Label>Status:</Label>
                <SigChipV2 value={statusChip.value} design={statusChip.design as any} trailingIcon="slim-arrow-down" />
              </div>
            )}
            {/* Progress in % */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>Progress in %:</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SigChipV2 value="15" trailingIcon="decline" />
              </div>
            </div>
            {/* Owner */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>Owner:</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <Avatar initials="CW" colorScheme="Accent1" size="XS" shape="Circle" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>Claire Westfield</Text>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>claire.westfield@globalcorp.com</Text>
                </div>
                <Button icon="decline" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
              </div>
            </div>
            {/* Contributors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>Contributors:</Label>
              {[
                { initials: 'LG', color: 'Accent6' as const, name: 'Leadership Forum', subtitle: 'User Group' },
                { initials: 'LW', color: 'Accent1' as const, name: 'Lin Webster', subtitle: 'lin.webster@globalcorp.com' },
                { initials: 'SD', color: 'Accent5' as const, name: 'Susann Deuterle', subtitle: 'susann.deuterle@globalcorp.com' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <Avatar initials={c.initials} colorScheme={c.color} size="XS" shape="Circle" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{c.name}</Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{c.subtitle}</Text>
                  </div>
                  <Button icon="decline" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
                </div>
              ))}
              <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', height: '24px', padding: '0 6px' }} />
            </div>
            {/* Start Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>Start Date:</Label>
              <SigChipV2 value="Apr 1, 2025" leadingIcon="calendar" trailingIcon="decline" />
            </div>
            {/* End Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>End Date:</Label>
              <SigChipV2 value="June 30, 2025" leadingIcon="calendar" trailingIcon="decline" />
            </div>
            {/* Parent Objective (only for Objective) */}
            {isObjective && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
                <Label>Parent Objective:</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <SigDomainObject size="XS" object={'Business Goal' as never} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>Maintain Competitiveness</Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>Objective</Text>
                  </div>
                  <Button icon="SAP-icons-v4/link" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
                  <Button icon="decline" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
                </div>
              </div>
            )}
            {/* Linked Initiatives */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
              <Label>{isObjective ? 'Linked Initiatives:' : 'Linked Objectives:'}</Label>
              {[
                { name: 'Improve Stock Management by 23%', objectType: 'Initiative' },
                { name: 'Set up Performance Incentives & Penalties', objectType: 'Initiative' },
                { name: 'Improve Last-Mile Delivery Challenges by 12%', objectType: 'Initiative' },
              ].map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <SigDomainObject size="XS" object={item.objectType as never} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{item.name}</Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{item.objectType}</Text>
                  </div>
                  <Button icon="SAP-icons-v4/link" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
                  <Button icon="decline" design="Transparent" style={{ height: '24px', minWidth: '24px', padding: 0 }} />
                </div>
              ))}
              <Button icon="add" design="Default" style={{ alignSelf: 'flex-start', height: '24px', padding: '0 6px' }} />
            </div>
          </div>
        </Tab>,
        <Tab text="Details" key="details"><div /></Tab>,
        <Tab text="Comments" key="comments"><CommentsTab /></Tab>,
      ]
    }
    return [
    <Tab text="Attributes" key="attributes">
      {(() => {
        if (externalSelectedAsset.objectType === 'Process Atoms') {
          return <ProcessAtomInfoPanel asset={externalSelectedAsset} />
        }
        // BPMN, Value Chain, Journey Model, Navigation Map — use the rich attribute panel
        return <ModelAttributesTab description={externalSelectedAsset.description} />
      })()}
    </Tab>,
    <Tab text="Relations" key="relations"><RelationsTab /></Tab>,
    <Tab text="Comments" key="comments"><CommentsTab /></Tab>,
    <Tab text="Activity" key="activity"><ActivityFeed assetType={externalSelectedAsset.objectType} /></Tab>,
  ]
  })() : []

  const overflowMenuFile = selectedAsset ?? (externalSelectedAsset ? { ...externalSelectedAsset, id: externalSelectedAsset.name, type: externalSelectedAsset.objectType as FileItem['type'], hasPublished: false, canExecute: false, created: '', changed: '' } as unknown as FileItem : null)

  const overflowMenuItems = selectedDictEntry ? (
    <>
      <MenuItem text="Copy Link" icon="chain-link" />
      <MenuItem text={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} icon={isFavorite ? 'favorite' : 'unfavorite'} />
      <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
      <MenuSeparator />
      <MenuItem text="Print" icon="print" />
      <MenuItem text="Merge" icon="combine" />
      <MenuSeparator />
      <MenuItem text="Delete" icon="delete" />
    </>
  ) : overflowMenuFile?.type === 'Folder' ? (
    <>
      <MenuItem text="Share" icon="share-2" />
      <MenuItem text="Copy Link" icon="chain-link" />
      <MenuItem text="Manage Access" icon="user-settings" />
      <MenuSeparator />
      <MenuItem text={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} icon={isFavorite ? 'favorite' : 'unfavorite'} />
      <MenuSeparator />
      <MenuItem text="Reporting" icon="SAP-icons-v4/report">
        <MenuItem text="Process documentation (PDF)" />
        <MenuItem text="Process documentation (Word)" />
        <MenuItem text="Governance report" />
        <MenuItem text="Process cost analysis" />
        <MenuItem text="Resource consumption analysis" />
        <MenuItem text="Modeling conventions" />
        <MenuItem text="Responsibility assignment matrix / RACI" />
        <MenuItem text="Responsibility handovers matrix" />
        <MenuItem text="Documents usage matrix" />
        <MenuItem text="IT system usage matrix (by diagrams)" />
        <MenuItem text="IT system usage matrix (by roles)" />
        <MenuItem text="Process characteristics with element details" />
        <MenuItem text="Process model metrics" />
        <MenuItem text="Risks & controls report" />
        <MenuItem text="User/Group assignment" />
      </MenuItem>
      <MenuSeparator />
      <MenuItem text="Rename" icon="edit" />
      <MenuItem text="Move to" icon="SAP-icons-v4/file-move" />
      <MenuItem text="Delete" icon="delete" />
    </>
  ) : overflowMenuFile ? (
    <>
      <MenuItem text="Open" icon="full-screen">
        <MenuItem text="Open Latest Revision" />
        <MenuItem text="Open Published Revision" />
      </MenuItem>
      <MenuSeparator />
      <MenuItem text="Edit in Editor" icon="write-new" />
      <MenuItem text="Edit in Modeler" icon="write-new" {...{ disabled: true } as any} />
      <MenuItem text="Edit in QuickModel" icon="SAP-icons-v4/quickmodel" />
      <MenuSeparator />
      <MenuItem text="Share" icon="share-2" />
      <MenuItem text="Copy Link" icon="chain-link" />
      <MenuItem text="Manage Access" icon="user-settings" />
      <MenuSeparator />
      <MenuItem text={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} icon={isFavorite ? 'favorite' : 'unfavorite'} />
      <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
      <MenuSeparator />
      <MenuItem text="Compare Revisions" icon="compare" />
      <MenuItem text="Variant Management" icon="SAP-icons-v4/variant">
        <MenuItem text="Clone to Create Variant" />
        <MenuItem text="Attach to Template" />
        <MenuItem text="Set as Template" />
      </MenuItem>
      <MenuItem text="Simulate" icon="SAP-icons-v4/simulation" />
      <MenuItem text="Reporting" icon="SAP-icons-v4/report">
        <MenuItem text="Process documentation (PDF)" />
        <MenuItem text="Process documentation (Word)" />
        <MenuItem text="Governance report" />
        <MenuItem text="Process cost analysis" />
        <MenuItem text="Resource consumption analysis" />
        <MenuItem text="Modeling conventions" />
        <MenuItem text="Responsibility assignment matrix / RACI" />
        <MenuItem text="Responsibility handovers matrix" />
        <MenuItem text="Documents usage matrix" />
        <MenuItem text="IT system usage matrix (by diagrams)" />
        <MenuItem text="IT system usage matrix (by roles)" />
        <MenuItem text="Process characteristics with element details" />
        <MenuItem text="Process model metrics" />
        <MenuItem text="Risks & controls report" />
        <MenuItem text="User/Group assignment" />
      </MenuItem>
      <MenuSeparator />
      <MenuItem text="Governance" icon="workflow-tasks">
        <MenuItem text={overflowMenuFile.canExecute ? 'Execute Governance Workflow' : 'Create Governance Workflow'} />
        <MenuItem text="Submit for Approval" />
        <MenuItem text="Show Started Approval Workflows" />
        <MenuItem text="Set Expiration Date" />
      </MenuItem>
      <MenuItem text="Read Confirmation" icon="SAP-icons-v4/visible-confirmed" />
      <MenuItem text="Rate process" icon="feedback" />
      <MenuItem text="Publish Revision" icon="SAP-icons-v4/published" />
      <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" disabled />
      <MenuSeparator />
      <MenuItem text="Embed" icon="source-code" />
      <MenuItem text="Export as" icon="SAP-icons-v4/export">
        <MenuItem text="SAP Signavio Archive (SGX)" />
        <MenuItem text="BPMN 2.0 XML" /><MenuItem text="XML" /><MenuItem text="PNG" />
        <MenuItem text="DMN 1.2 XML" /><MenuItem text="SVG" /><MenuItem text="PDF" /><MenuItem text="Drools" />
        <MenuSeparator />
        <MenuItem text="Export Diagram Translations" />
      </MenuItem>
      <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
      <MenuSeparator />
      <MenuItem text="Sync with SAP Cloud ALM" icon="synchronize" />
      <MenuSeparator />
      <MenuItem text="Rename" icon="edit" /><MenuItem text="Move to" icon="SAP-icons-v4/file-move" /><MenuItem text="Copy to" icon="copy" /><MenuItem text="Move to Trash" icon="delete" />
    </>
  ) : null

  const hasAsset = selectedAsset || externalSelectedAsset || selectedDictEntry

  const headerActions: FunctionComponent[] = hasAsset ? [
    () => (
      <>
        {!selectedDictEntry && !isProcessAtom && (
          <Button design="Emphasized" onClick={onOpenModelDetail}>Open</Button>
        )}
        <Button
          id="asset-panel-overflow-btn"
          icon="overflow"
          design="Transparent"
          tooltip="More Options"
          onClick={(e) => {
            if (overflowMenuRef.current) {
              overflowMenuRef.current.opener = e.currentTarget as HTMLElement
              overflowMenuRef.current.open = true
            }
          }}
        />
        <Menu
          ref={overflowMenuRef}
          onItemClick={(e: any) => {
            const text = e?.detail?.text as string | undefined
            if (text === 'Share') onShare?.()
            if (text === 'Manage Access') onManageAccess?.()
            if (text === 'Add to Favorites' || text === 'Remove from Favorites') onToggleFavorite?.()
            if (text === 'Copy Link') onCopyLink?.()
            if (text === 'Rename') onRename?.()
            if (text === 'Embed') onEmbed?.()
            if (text === 'Open Latest Revision' || text === 'Open Published Revision') onOpenModelDetail?.()
            if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') { setNotifPref(text as typeof notifPref); return }
            if (overflowMenuRef.current) overflowMenuRef.current.open = false
          }}
        >{overflowMenuItems}</Menu>
      </>
    )
  ] : []

  // ── Create new Process Atom panel ─────────────────────────────────────────
  if (createProcessAtom) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SigRightSidePanel
          headerTitle={newAtomName}
          editable
          editableTitlePlaceholder="New Process Atom"
          onEditableTitleChange={(value) => setNewAtomName(value)}
          navigationSlot={[
            () => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SigDomainObject size="XXS" object={'Process Atoms' as never} />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>Process Atom</Text>
              </div>
            )
          ]}
          contentActionsSlot={[]}
          wrappingType="Wrap"
          isOpen={true}
          toggleRightSidePanel={onDiscardCreate ?? onClose}
          style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
          tabSlot={[
            <Tab text="Attributes" key="attributes">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
                <Label showColon>Description</Label>
                <Input
                  value={newAtomDescription}
                  placeholder="Describe what this Process Atom does"
                  onInput={(e: any) => setNewAtomDescription(e.target?.value ?? '')}
                  style={{ width: '100%' }}
                />
              </div>
            </Tab>,
          ]}
        >{''}</SigRightSidePanel>
        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
          <Bar design="FloatingFooter">
            <Button
              slot="endContent"
              design="Emphasized"
              onClick={() => {
                onProcessAtomSaved?.(newAtomName, newAtomDescription)
              }}
            >
              Save
            </Button>
            <Button slot="endContent" design="Default" onClick={onDiscardCreate ?? onClose}>Discard Changes</Button>
          </Bar>
        </div>
      </div>
    )
  }

  // ── Create new dictionary entry panel ──────────────────────────────────────
  if (createCategory) {
    const createLangLabel = contentLanguages.find(l => createSelectedLang ? l.label === createSelectedLang : l.isDefault)?.label ?? 'Language'
    const createHeaderActions: FunctionComponent[] = [
      () => (
        <Button
          id="create-dict-entry-lang-btn"
          design="Transparent"
          endIcon="slim-arrow-down"
          onClick={() => setCreateLangPopoverOpen(true)}
        >{createLangLabel}</Button>
      ),
    ]

    const createTabs = [
      <Tab text="Attributes" key="attributes">
        <CreateDictEntryAttributesTab category={createCategory} />
      </Tab>,
      <Tab text="Relations" key="relations"><RelationsTab isEmpty /></Tab>,
      <Tab text="Activity" key="activity"><ActivityFeed assetType={createCategory.name} isEmpty /></Tab>,
    ]

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SigRightSidePanel
          headerTitle={newEntryName}
          editable
          editableTitlePlaceholder="New Dictionary Entry"
          onEditableTitleChange={(value) => setNewEntryName(value)}
          navigationSlot={[
            () => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px',
                  background: entryBg(createCategory.type as DictCategoryType),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={CAT_TYPE_ICON[createCategory.type as DictCategoryType] ?? 'document'} style={{ width: '12px', height: '12px', color: entryIconColor(createCategory.type as DictCategoryType) }} />
                </div>
                <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{createCategory.name}</Text>
                <Button
                  id="create-cat-picker-btn"
                  icon="navigation-down-arrow"
                  design="Transparent"
                  onClick={() => setCreateCatPickerOpen(v => !v)}
                />
              </div>
            )
          ]}
          contentActionsSlot={createHeaderActions}
          wrappingType="Wrap"
          isOpen={true}
          toggleRightSidePanel={onDiscardCreate ?? onClose}
          style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
          tabSlot={createTabs}
        >{''}</SigRightSidePanel>
        <CatPickerPopover
          opener="create-cat-picker-btn"
          open={createCatPickerOpen}
          onClose={() => setCreateCatPickerOpen(false)}
          dictCategories={dictCategories}
          selectedCategoryId={createDictCategoryId ?? undefined}
          onSelect={(id) => { if (onCreateCategoryChange) onCreateCategoryChange(id) }}
        />
        <Popover
          opener="create-dict-entry-lang-btn"
          open={createLangPopoverOpen}
          placement="Bottom"
          horizontalAlign="End"
          hideArrow
          className="no-padding-popover"
          onClose={() => setCreateLangPopoverOpen(false)}
        >
          <List selectionMode="Single" separators="None">
            {contentLanguages.map(lang => (
              <ListItemStandard
                key={lang.code}
                type="Active"
                selected={createSelectedLang ? createSelectedLang === lang.label : lang.isDefault}
                onClick={() => { setCreateSelectedLang(lang.label); setCreateLangPopoverOpen(false) }}
              >{lang.label}</ListItemStandard>
            ))}
          </List>
        </Popover>
        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={() => {
              if (createCategory && onDictEntrySaved) {
                const duplicates = DICT_ENTRIES.filter(e => e.name.toLowerCase() === newEntryName.toLowerCase())
                if (duplicates.length > 0) {
                  const catNames = [...new Set(duplicates.map(e => dictCategories.find(c => c.id === e.categoryId)?.name ?? 'Unknown'))]
                  setDuplicateCategoryNames(catNames)
                  setDuplicateConfirmOpen(true)
                  return
                }
                const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                const newEntry: DictEntry = {
                  id: `de-new-${Date.now()}`,
                  name: newEntryName,
                  categoryId: createCategory.id,
                  status: 'Draft',
                  created: today,
                  changed: today,
                }
                onDictEntrySaved(newEntry)
              }
            }}>Create</Button>
            <Button slot="endContent" design="Default" onClick={onDiscardCreate ?? onClose}>Discard</Button>
          </Bar>
        </div>
        <MessageBox
          open={duplicateConfirmOpen}
          type="Confirm"
          titleText={`New Dictionary Entry ${newEntryName}`}
          actions={['Yes', 'No']}
          emphasizedAction="Yes"
          onClose={(action: any) => {
            setDuplicateConfirmOpen(false)
            if (action === 'Yes' && createCategory && onDictEntrySaved) {
              const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              onDictEntrySaved({
                id: `de-new-${Date.now()}`,
                name: newEntryName,
                categoryId: createCategory.id,
                status: 'Draft',
                created: today,
                changed: today,
              })
            }
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
            <Text>A dictionary entry with the title <strong>{newEntryName}</strong> already exists in the following categories:</Text>
            <ul style={{ margin: '0', paddingLeft: '1.25rem' }}>
              {duplicateCategoryNames.map(name => <li key={name}><Text>{name}</Text></li>)}
            </ul>
            <Text>Do you want to create the dictionary entry anyway?</Text>
          </div>
        </MessageBox>
      </div>
    )
  }

  // ── Dict category panel ───────────────────────────────────────────────────
  if (selectedDictCategory) {
    return (
      <SigRightSidePanel
        headerTitle={selectedDictCategory.name}
        navigationSlot={[]}
        contentActionsSlot={[]}
        wrappingType="Wrap"
        isOpen={true}
        toggleRightSidePanel={onClose}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
      >
        <TabContainer
          contentBackgroundDesign="Translucent"
          headerBackgroundDesign="Solid"
          tabLayout="Standard"
          className="panel-scrollable-tabs"
        >
          <Tab text="Activity" key="activity">
            <ActivityFeed assetType="Dictionary Category" manualPublish={selectedDictCategory.type === 'Activity'} />
          </Tab>
        </TabContainer>
      </SigRightSidePanel>
    )
  }

  // ── Folder panel ─────────────────────────────────────────────────────────
  if (selectedAsset?.type === 'Folder') {
    return (
      <SigRightSidePanel
        headerTitle={selectedAsset.name}
        navigationSlot={[
          () => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SigDomainObject size="XXS" object={'Folder' as never} />
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>Folder</Text>
            </div>
          )
        ]}
        contentActionsSlot={[]}
        wrappingType="Wrap"
        isOpen={true}
        toggleRightSidePanel={onClose}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
        tabSlot={[
          <Tab text="Activity" key="activity"><ActivityFeed assetType="Folder" /></Tab>,
        ]}
      >
        {null}
      </SigRightSidePanel>
    )
  }

  // ── Multi-selection panel ─────────────────────────────────────────────────
  if (selectionCount >= 2) {
    return (
      <SigRightSidePanel
        headerTitle={`${selectionCount} Items Selected`}
        navigationSlot={[]}
        contentActionsSlot={[]}
        wrappingType="Truncate"
        isOpen={true}
        toggleRightSidePanel={onClose}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
        tabSlot={isDictView ? [
          <Tab text="Activity" key="activity"><ActivityFeed assetType="Dictionary Category" manualPublish={dictEntryCategory?.type === 'Activity'} /></Tab>,
        ] : []}
      >
        {!isDictView && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
            <style>{`.panel-multiselect-illustration::part(subtitle) { display: none; }`}</style>
            <IllustratedMessage
              className="panel-multiselect-illustration"
              name="EmptyList"
              design="Spot"
              titleText={`${selectionCount} Items selected`}
              subtitleText=""
            />
          </div>
        )}
      </SigRightSidePanel>
    )
  }

  // ── No selection ──────────────────────────────────────────────────────────
  if (!hasAsset) {
    if (isDictView) {
      return (
        <SigRightSidePanel
          headerTitle={pageTitle}
          navigationSlot={[]}
          contentActionsSlot={[]}
          wrappingType="Truncate"
          isOpen={true}
          toggleRightSidePanel={onClose}
          style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
        >
          <TabContainer
            contentBackgroundDesign="Translucent"
            headerBackgroundDesign="Solid"
            tabLayout="Standard"
            className="panel-scrollable-tabs"
          >
            <Tab text="Activity" key="activity">
              <ActivityFeed assetType="Dictionary Category" />
            </Tab>
          </TabContainer>
        </SigRightSidePanel>
      )
    }
    return (
      <SigRightSidePanel
        headerTitle={pageTitle}
        navigationSlot={[]}
        contentActionsSlot={[]}
        wrappingType="Truncate"
        isOpen={true}
        toggleRightSidePanel={onClose}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
        tabSlot={isModelingFolder ? [
          <Tab text="Activity" key="activity"><ActivityFeed assetType="Folder" /></Tab>,
        ] : []}
      >
        {!isModelingFolder && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <style>{`.panel-noselection-illustration::part(subtitle) { display: none; }`}</style>
          <IllustratedMessage
            className="panel-noselection-illustration"
            name="NoData"
            design="Spot"
            titleText="Select an item to see details."
            subtitleText=""
          />
        </div>
        )}
      </SigRightSidePanel>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <SigRightSidePanel
      headerTitle={atomCanEdit ? atomEditName : selectedDictEntry ? (dictEntryEditName || selectedDictEntry.name) : (selectedAsset ? selectedAsset.name : externalSelectedAsset ? externalSelectedAsset.name : pageTitle)}
      editable={atomCanEdit || !!selectedDictEntry || undefined}
      editableTitlePlaceholder={atomCanEdit ? 'Process Atom name' : selectedDictEntry ? 'Entry name' : undefined}
      onEditableTitleChange={atomCanEdit ? (v: string) => setAtomEditName(v) : selectedDictEntry ? (v: string) => { setDictEntryEditName(v); setDictEntryDirty(true) } : undefined}
      navigationSlot={hasAsset ? [
        () => (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
              {dictEntryCategory ? (
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: entryBg(dictEntryCategory.type as DictCategoryType), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={CAT_TYPE_ICON[dictEntryCategory.type as DictCategoryType] ?? 'document'} style={{ width: '12px', height: '12px', color: entryIconColor(dictEntryCategory.type as DictCategoryType) }} />
                </div>
              ) : (
                <SigDomainObject size="XXS" object={objectType as never} />
              )}
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{objectTypeLabel}</Text>
              {selectedDictEntry && (
                <Button
                  id="cat-picker-btn"
                  icon="navigation-down-arrow"
                  design="Transparent"
                  onClick={() => setCatPickerOpen(v => !v)}
                />
              )}
            </div>
          </>
        )
      ] : []}
      contentActionsSlot={headerActions}
      wrappingType="Wrap"
      isOpen={true}
      toggleRightSidePanel={onClose}
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
    >
      {subHeader && <div className="panel-subheader-scroll">{subHeader}</div>}
      {tabs && tabs.length > 0 && (
        <TabContainer
          contentBackgroundDesign="Translucent"
          headerBackgroundDesign="Solid"
          tabLayout="Standard"
          className="panel-scrollable-tabs"
        >
          {tabs}
        </TabContainer>
      )}
      {!selectedAsset && !externalSelectedAsset && !selectedDictEntry && (
        <></>
      )}
    </SigRightSidePanel>
    {selectedDictEntry && (
      <CatPickerPopover
        opener="cat-picker-btn"
        open={catPickerOpen}
        onClose={() => setCatPickerOpen(false)}
        dictCategories={dictCategories}
        selectedCategoryId={pendingCategoryId ?? selectedDictEntry.categoryId}
        onSelect={(id) => { setPendingCategoryId(id); setDictEntryDirty(true) }}
      />
    )}
    {selectedDictEntry && dictEntryDirty && (
      <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem', zIndex: 10 }}>
        <Bar design="FloatingFooter">
          <Button
            slot="endContent"
            design="Emphasized"
            disabled={!dictEntryDirty}
            onClick={() => {
              if (pendingCategoryId && onDictEntryMoved) {
                onDictEntryMoved(selectedDictEntry.id, pendingCategoryId)
                setPendingCategoryId(null)
              }
              setDictEntryDirty(false)
              onDictEntryEdited?.()
            }}
          >Save</Button>
          <Button
            slot="endContent"
            design="Default"
            onClick={() => {
              setDictEntryDirty(false)
              setPendingCategoryId(null)
              setAttrResetKey(k => k + 1)
              if (selectedDictEntry) setDictEntryEditName(selectedDictEntry.name)
            }}
          >Cancel</Button>
        </Bar>
      </div>
    )}
    </div>
  )
}
