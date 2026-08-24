import React, { useRef, useState } from 'react'
import { Button, Menu, MenuItem, Icon, Dialog, Bar, Select, Option, type MenuDomRef, IllustratedMessage } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { DictCategory } from '../../../contexts/WorkspaceContext'
import { CreateDictEntryAttributesTab } from './AssetInfoPanel'
import { DiagramThumbnail } from './components'

type ActivityEntry = {
  id: string
  author: string
  initials: string
  action: string
  value?: string
  comment?: string
  timestamp: string
  revision?: number
  type: 'change' | 'comment' | 'publish' | 'create'
  insideCard?: boolean
}

type RevisionGroup = {
  revision: number
  description: string
  createdAt: string
  createdBy?: string
  entries: ActivityEntry[]
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PM_REVISION_GROUPS: RevisionGroup[] = [
  { revision: 4, description: 'Created automatically', createdAt: 'May 20, 2026 · 02:31 PM', createdBy: 'Ludwig Grohe', entries: [
    { id: 'a1', author: 'Ludwig Grohe', initials: 'LG', action: 'published revision 4.', timestamp: 'Today · 10:42 AM', revision: 4, type: 'publish', insideCard: true },
    { id: 'a2', author: 'Ludwig Grohe', initials: 'LG', action: 'updated the Process Owner to:', value: 'Lina Davis', timestamp: 'Today · 10:38 AM', revision: 4, type: 'change', insideCard: true },
    { id: 'a5', author: 'Ludwig Grohe', initials: 'LG', action: 'updated the Status to:', value: 'Published', timestamp: 'Today · 10:42 AM', revision: 4, type: 'change', insideCard: true },
    { id: 'a3', author: 'Marie Carlsen', initials: 'MC', action: 'added a comment:', comment: 'Hi @Ludwig Grohe, the escalation path in step 4 still references the old SLA matrix. Can you update before we publish?', timestamp: 'Today · 09:15 AM', revision: 4, type: 'comment' },
    { id: 'a4', author: 'Ludwig Grohe', initials: 'LG', action: 'updated the Description to:', value: 'Full Procure-to-Pay process from purchase requisition through supplier payment, including three-way match and exception handling.', timestamp: 'Today · 09:10 AM', revision: 4, type: 'change' },
  ]},
  { revision: 3, description: 'Created automatically', createdAt: 'May 14, 2026 · 02:31 PM', createdBy: 'Paul Gray', entries: [
    { id: 'c1', author: 'Paul Gray', initials: 'PG', action: 'published revision 3.', timestamp: 'May 20, 2026 · 02:30 PM', revision: 3, type: 'publish', insideCard: true },
    { id: 'b1', author: 'Paul Gray', initials: 'PG', action: 'updated the Status to:', value: 'Draft', timestamp: 'Yesterday · 04:51 PM', revision: 3, type: 'change', insideCard: true },
    { id: 'b4', author: 'Paul Gray', initials: 'PG', action: 'restored to revision 2.', timestamp: 'Yesterday · 04:00 PM', revision: 3, type: 'change', insideCard: true },
    { id: 'b2', author: 'Lina Davis', initials: 'LD', action: 'updated the Department to:', value: 'Procurement', timestamp: 'Yesterday · 03:20 PM', revision: 3, type: 'change' },
    { id: 'b3', author: 'Tim Green', initials: 'TG', action: 'added a comment:', comment: 'Looks good overall. One question — should the three-way match exception route back to the requisitioner or go straight to AP?', timestamp: 'Yesterday · 11:05 AM', revision: 3, type: 'comment' },
  ]},
  { revision: 2, description: 'Created automatically', createdAt: 'Feb 14, 2024 · 11:22 AM', createdBy: 'Sarah Kim', entries: [
    { id: 'c2', author: 'Paul Gray', initials: 'PG', action: 'published revision 2.', timestamp: 'May 14, 2026 · 02:30 PM', revision: 2, type: 'publish', insideCard: true },
    { id: 'c3', author: 'Saskia Wulf', initials: 'SW', action: 'updated the Responsible Person to:', value: 'Paul Gray', timestamp: 'May 14, 2026 · 01:18 PM', revision: 2, type: 'change', insideCard: true },
    { id: 'c4', author: 'Paul Gray', initials: 'PG', action: 'updated the name to:', value: 'Procure-to-Pay Process', timestamp: 'May 13, 2026 · 09:44 AM', revision: 2, type: 'change' },
  ]},
  { revision: 1, description: 'Created when model was created', createdAt: 'Feb 14, 2024 · 11:20 AM', createdBy: 'Paul Gray', entries: [
    { id: 'c5', author: 'Paul Gray', initials: 'PG', action: 'created this model.', timestamp: 'Feb 14, 2024 · 11:20 AM', revision: 1, type: 'create', insideCard: true },
  ]},
]

const CJ_TODAY: ActivityEntry[] = [
  { id: 'cj1', author: 'Anna Schmidt', initials: 'AS', action: 'updated the Touchpoints to:', value: 'Web, Mobile App, Call Centre, In-Store', timestamp: 'Today · 11:05 AM', type: 'change' },
  { id: 'cj2', author: 'Marc Fontaine', initials: 'MF', action: 'added a comment:', comment: 'The pain-point annotation on step 3 is missing a severity rating. Can someone add it before we share with stakeholders?', timestamp: 'Today · 09:30 AM', type: 'comment' },
]
const CJ_YESTERDAY: ActivityEntry[] = [
  { id: 'cj3', author: 'Anna Schmidt', initials: 'AS', action: 'updated the Status to:', value: 'Draft', timestamp: 'Yesterday · 03:45 PM', type: 'change' },
  { id: 'cj4', author: 'Marc Fontaine', initials: 'MF', action: 'updated the Persona to:', value: 'Returning B2C Customer', timestamp: 'Yesterday · 10:20 AM', type: 'change' },
]
const CJ_EARLIER: ActivityEntry[] = [
  { id: 'cj5', author: 'Anna Schmidt', initials: 'AS', action: 'published revision 1.', timestamp: 'May 10, 2026 · 01:00 PM', type: 'publish' },
  { id: 'cj6', author: 'Anna Schmidt', initials: 'AS', action: 'created this journey.', timestamp: 'Mar 3, 2025 · 09:00 AM', type: 'create' },
]

const NM_TODAY: ActivityEntry[] = [
  { id: 'nm1', author: 'Felix Braun', initials: 'FB', action: 'added a link to:', value: 'Supplier Onboarding Process', timestamp: 'Today · 08:55 AM', type: 'change' },
]
const NM_YESTERDAY: ActivityEntry[] = [
  { id: 'nm2', author: 'Sofia Reyes', initials: 'SR', action: 'updated the Category to:', value: 'Source-to-Pay', timestamp: 'Yesterday · 04:10 PM', type: 'change' },
  { id: 'nm3', author: 'Felix Braun', initials: 'FB', action: 'added a comment:', comment: 'Should we group the finance sub-maps under a separate node? The current flat structure is getting hard to navigate.', timestamp: 'Yesterday · 02:30 PM', type: 'comment' },
]
const NM_EARLIER: ActivityEntry[] = [
  { id: 'nm4', author: 'Sofia Reyes', initials: 'SR', action: 'published revision 2.', timestamp: 'May 12, 2026 · 11:00 AM', type: 'publish' },
  { id: 'nm5', author: 'Felix Braun', initials: 'FB', action: 'created this map.', timestamp: 'Jun 1, 2024 · 10:00 AM', type: 'create' },
]

const VC_TODAY: ActivityEntry[] = [
  { id: 'vc1', author: 'Irene Koch', initials: 'IK', action: 'updated the Owner to:', value: 'Chief Operating Officer', timestamp: 'Today · 10:00 AM', type: 'change' },
]
const VC_YESTERDAY: ActivityEntry[] = [
  { id: 'vc2', author: 'Irene Koch', initials: 'IK', action: 'added a comment:', comment: 'The "Deliver" stage is missing the reverse logistics sub-chain. Adding it next sprint.', timestamp: 'Yesterday · 01:15 PM', type: 'comment' },
  { id: 'vc3', author: 'David Park', initials: 'DP', action: 'updated the Status to:', value: 'Published', timestamp: 'Yesterday · 09:50 AM', type: 'change' },
]
const VC_EARLIER: ActivityEntry[] = [
  { id: 'vc4', author: 'David Park', initials: 'DP', action: 'published revision 1.', timestamp: 'May 8, 2026 · 03:00 PM', type: 'publish' },
  { id: 'vc5', author: 'David Park', initials: 'DP', action: 'created this value chain.', timestamp: 'Oct 15, 2024 · 08:30 AM', type: 'create' },
]

const DB_TODAY: ActivityEntry[] = [
  { id: 'db1', author: 'Laura Tan', initials: 'LT', action: 'updated the Reporting Period to:', value: 'Q2 2026', timestamp: 'Today · 09:45 AM', type: 'change' },
  { id: 'db2', author: 'Laura Tan', initials: 'LT', action: 'added a comment:', comment: 'KPI tile for cycle time is pulling from the wrong data source. @Felix Braun can you fix the mapping?', timestamp: 'Today · 09:40 AM', type: 'comment' },
]
const DB_YESTERDAY: ActivityEntry[] = [
  { id: 'db3', author: 'Felix Braun', initials: 'FB', action: 'updated the Status to:', value: 'Published', timestamp: 'Yesterday · 05:00 PM', type: 'change' },
]
const DB_EARLIER: ActivityEntry[] = [
  { id: 'db4', author: 'Laura Tan', initials: 'LT', action: 'published revision 1.', timestamp: 'May 5, 2026 · 02:00 PM', type: 'publish' },
  { id: 'db5', author: 'Laura Tan', initials: 'LT', action: 'created this dashboard.', timestamp: 'Jan 20, 2025 · 11:00 AM', type: 'create' },
]

const FILE_TODAY: ActivityEntry[] = [
  { id: 'f1', author: 'Chris Jordan', initials: 'CJ', action: 'updated the Description to:', value: 'Updated reference document for Q2 compliance review.', timestamp: 'Today · 10:15 AM', type: 'change' },
]
const FILE_YESTERDAY: ActivityEntry[] = [
  { id: 'f2', author: 'Chris Jordan', initials: 'CJ', action: 'added a comment:', comment: 'Version attached matches the signed-off copy from the audit committee meeting.', timestamp: 'Yesterday · 03:30 PM', type: 'comment' },
]
const FILE_EARLIER: ActivityEntry[] = [
  { id: 'f3', author: 'Chris Jordan', initials: 'CJ', action: 'uploaded this file.', timestamp: 'Apr 10, 2026 · 09:00 AM', type: 'create' },
]

const DE_REVISION_GROUPS: RevisionGroup[] = [
  { revision: 3, description: 'Created automatically', createdAt: '4 Jan 2025 · 11:20 AM', entries: [
    { id: 'de1', author: 'John Miller', initials: 'JM', action: 'restored to revision 2.', timestamp: '4 Jan 2025 · 12:10 PM', type: 'change', insideCard: true },
    { id: 'de1b', author: 'John Miller', initials: 'JM', action: 'updated the status to:', value: 'Published', timestamp: '4 Jan 2025 · 12:05 PM', type: 'change', insideCard: true },
    { id: 'de2', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 · 11:50 AM', type: 'change' },
  ]},
  { revision: 2, description: 'Created automatically', createdAt: '4 Jan 2025 · 11:20 AM', entries: [
    { id: 'de3', author: 'John Miller', initials: 'JM', action: 'changed the title to:', value: 'Procurement Unit', timestamp: '4 Jan 2025 · 11:50 AM', type: 'change', insideCard: true },
    { id: 'de3b', author: 'John Miller', initials: 'JM', action: 'changed the category to:', value: 'Finance', timestamp: '4 Jan 2025 · 11:45 AM', type: 'change', insideCard: true },
    { id: 'de4', author: 'John Miller', initials: 'JM', action: 'changed the description to:', value: 'A procurement org unit responsible for procuring goods and services.', timestamp: '4 Jan 2025 · 11:40 AM', type: 'change' },
    { id: 'de5', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 · 11:35 AM', type: 'change' },
  ]},
  { revision: 1, description: 'Created automatically', createdAt: '4 Jan 2025 · 11:20 AM', entries: [
    { id: 'de6', author: 'John Miller', initials: 'JM', action: 'created the dictionary entry', timestamp: '4 Jan 2025 · 11:27 AM', type: 'create', insideCard: true },
  ]},
]

type FolderRevisionCard = RevisionGroup & { assetName: string; assetType: string; chipStatus?: string }

const FOLDER_TODAY_CARDS: FolderRevisionCard[] = [
  { revision: 4, assetName: 'Procure-to-Pay Process', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Today · 10:42 AM', createdBy: 'Ludwig Grohe', chipStatus: 'Published', entries: [
    { id: 'f1', author: 'Ludwig Grohe', initials: 'LG', action: 'published revision 4.', timestamp: 'Today · 10:42 AM', type: 'publish', insideCard: true },
    { id: 'f1b', author: 'Ludwig Grohe', initials: 'LG', action: 'updated the Process Owner to:', value: 'Lina Davis', timestamp: 'Today · 10:38 AM', type: 'change', insideCard: true },
    { id: 'f2', author: 'Sarah Kim', initials: 'SK', action: 'added a comment:', comment: 'Please review the escalation path before publishing.', timestamp: 'Today · 09:15 AM', type: 'comment' },
  ]},
  { revision: 2, assetName: 'Supplier Onboarding', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Today · 08:30 AM', createdBy: 'Paul Gray', entries: [
    { id: 'f3', author: 'Paul Gray', initials: 'PG', action: 'updated the status to:', value: 'In Review', timestamp: 'Today · 08:30 AM', type: 'change', insideCard: true },
    { id: 'f3b', author: 'Paul Gray', initials: 'PG', action: 'updated the description.', timestamp: 'Today · 08:15 AM', type: 'change' },
  ]},
]
const FOLDER_YESTERDAY_CARDS: FolderRevisionCard[] = [
  { revision: 3, assetName: 'Invoice Validation Flow', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Yesterday · 04:12 PM', createdBy: 'Marie Carlsen', entries: [
    { id: 'f4', author: 'Marie Carlsen', initials: 'MC', action: 'changed the status to:', value: 'In Review', timestamp: 'Yesterday · 04:12 PM', type: 'change', insideCard: true },
    { id: 'f4b', author: 'Marie Carlsen', initials: 'MC', action: 'updated the title to:', value: 'Invoice Validation Flow', timestamp: 'Yesterday · 03:50 PM', type: 'change', insideCard: true },
    { id: 'f5', author: 'Tim Green', initials: 'TG', action: 'added a comment:', comment: 'The three-way match step needs a fallback for partial receipts.', timestamp: 'Yesterday · 03:00 PM', type: 'comment' },
  ]},
  { revision: 1, assetName: 'Catalog-Based Buying', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Yesterday · 02:00 PM', createdBy: 'Paul Gray', entries: [
    { id: 'f6', author: 'Paul Gray', initials: 'PG', action: 'created the process model.', timestamp: 'Yesterday · 02:00 PM', type: 'create', insideCard: true },
  ]},
]
const FOLDER_EARLIER_CARDS: FolderRevisionCard[] = [
  { revision: 2, assetName: 'Purchase Requisition Approval', assetType: 'Process Model', description: 'Created automatically', createdAt: 'May 20, 2026 · 11:30 AM', createdBy: 'Ludwig Grohe', chipStatus: 'Published', entries: [
    { id: 'f7', author: 'Ludwig Grohe', initials: 'LG', action: 'published revision 2.', timestamp: 'May 20, 2026 · 11:30 AM', type: 'publish', insideCard: true },
    { id: 'f7b', author: 'Ludwig Grohe', initials: 'LG', action: 'updated the Responsible Person to:', value: 'Saskia Wulf', timestamp: 'May 20, 2026 · 11:15 AM', type: 'change', insideCard: true },
    { id: 'f7c', author: 'Saskia Wulf', initials: 'SW', action: 'updated the Department to:', value: 'Finance', timestamp: 'May 20, 2026 · 10:50 AM', type: 'change' },
  ]},
]

function dataForType(assetType: string) {
  switch (assetType) {
    case 'Customer Journey': return { today: CJ_TODAY, yesterday: CJ_YESTERDAY, earlier: CJ_EARLIER }
    case 'Navigation Map':   return { today: NM_TODAY,  yesterday: NM_YESTERDAY,  earlier: NM_EARLIER }
    case 'Value Chain':      return { today: VC_TODAY,  yesterday: VC_YESTERDAY,  earlier: VC_EARLIER }
    case 'Dashboard':        return { today: DB_TODAY,  yesterday: DB_YESTERDAY,  earlier: DB_EARLIER }
    default:                 return { today: FILE_TODAY, yesterday: FILE_YESTERDAY, earlier: FILE_EARLIER }
  }
}

// ── Timeline dot ──────────────────────────────────────────────────────────────

function TimelineDot({ type }: { type: ActivityEntry['type'] }) {
  const base: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, background: 'var(--sapNeutralBackground, #f5f5f5)',
    color: 'var(--sapContent_IconColor)',
  }
  if (type === 'publish') return <div style={base}><Icon name="world" /></div>
  if (type === 'comment') return <div style={base}><Icon name="discussion" /></div>
  if (type === 'create') return <div style={base}><Icon name="add" /></div>
  return <div style={base}><Icon name="edit" /></div>
}

// ── Activity item ─────────────────────────────────────────────────────────────

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <TimelineDot type={entry.type} />
      <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
        <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          <span style={{ fontWeight: '700' }}>{entry.author}</span>
          {' '}
          <span>{entry.action}</span>
        </div>
        {entry.value && (
          <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapTextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            {entry.value}
          </div>
        )}
        {entry.comment && (
          <div style={{
            marginTop: '6px', paddingLeft: '12px',
            borderLeft: '3px solid var(--sapNeutralBorderColor, #d9d9d9)',
            fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)",
          }}>
            {entry.comment.split(/@([^\s,]+)/g).map((part, i) =>
              i % 2 === 1
                ? <span key={i} style={{ color: 'var(--sapLinkColor, #0064d9)', fontWeight: '700' }}>@{part}</span>
                : <span key={i}>{part}</span>
            )}
          </div>
        )}
        <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '4px', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          {entry.timestamp}
        </div>
      </div>
    </div>
  )
}

// ── Revision card ─────────────────────────────────────────────────────────────

function RevisionCard({ group, isPublished, showRestoreButton, restoreDisabled, assetName, assetType: assetTypeProp, manualPublish, entryName, isDictEntry, dictCategory, entries }: {
  group: RevisionGroup; isPublished?: boolean; showRestoreButton?: boolean; restoreDisabled?: boolean
  assetName?: string; assetType?: string; manualPublish?: boolean; entryName?: string; isDictEntry?: boolean; dictCategory?: DictCategory
  entries?: ActivityEntry[]
}) {
  const menuRef = useRef<MenuDomRef>(null)
  const btnId = `revision-menu-${group.revision}-${assetName ?? entryName ?? ''}`
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [previewRevision, setPreviewRevision] = useState(group.revision)
  const latestPublished = Math.max(...PM_REVISION_GROUPS.filter(r => r.entries.some(e => e.type === 'publish')).map(r => r.revision), -Infinity)
  const [compareRevisionLeft, setCompareRevisionLeft] = useState(group.revision)
  const [compareRevisionRight, setCompareRevisionRight] = useState(latestPublished)
  const dialogTitle = `${entryName ?? assetName ?? 'Entry'} · Revision ${group.revision}`
  const [expanded, setExpanded] = useState(true)
  const innerEntries = (entries ?? []).filter(e => e.insideCard)
  const outerEntries = (entries ?? []).filter(e => !e.insideCard)
  const hasEntries = innerEntries.length > 0 || outerEntries.length > 0

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          border: '1px solid var(--sapGroup_ContentBorderColor, #e0e0e0)',
          borderRadius: '12px',
          padding: '12px 16px',
          background: 'var(--sapList_Background, #fff)',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {/* Row 1: expand toggle + title + chip + action buttons + overflow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasEntries && (
              <Button
                design="Transparent"
                icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
                onClick={() => setExpanded(v => !v)}
                style={{ flexShrink: 0, marginLeft: '-8px' }}
              />
            )}
            <span style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", flex: 1, minWidth: 0 }}>
              {assetName ? `${assetName} · ` : ''}{assetTypeProp ? `${assetTypeProp} · ` : ''}Revision {group.revision}
            </span>
            {isPublished && <SigChipV2 value="Published" design="indication5" condensed leadingIcon="SAP-icons-v4/published" />}
            {!showRestoreButton && (
              <Button design="Transparent" icon="show" tooltip="Preview" onClick={() => { setPreviewRevision(group.revision); setCompareMode(false); setPreviewOpen(true) }} />
            )}
            <Button id={btnId} icon="overflow" design="Transparent" onClick={(e: any) => {
              if (menuRef.current) { menuRef.current.opener = e.currentTarget; menuRef.current.open = true }
            }} />
            <Menu ref={menuRef} onItemClick={(e: any) => { if (e?.detail?.text === 'Revision Details') setDetailsOpen(true) }}>
              {manualPublish && <MenuItem text={isPublished ? 'Unpublish' : 'Publish'} icon={isPublished ? 'write-new-document' : 'SAP-icons-v4/published'} />}
              {!manualPublish && !showRestoreButton && <MenuItem text="Open" icon="full-screen" />}
              {!manualPublish && !showRestoreButton && <MenuItem text="Edit in Editor" icon="write-new" />}
              {!manualPublish && !showRestoreButton && <MenuItem text="Compare" icon="compare" />}
              <MenuItem text="Restore" icon="undo" disabled={!!restoreDisabled} />
              {!manualPublish && !showRestoreButton && <MenuItem text="Publish" icon="world" />}
              <MenuItem text="Revision Details" icon="message-information" />
            </Menu>
          </div>
          {/* Row 2: creator */}
          <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            {group.createdBy ? `Created by ${group.createdBy}` : group.description}
          </div>
          {/* Row 3: date */}
          <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            {group.createdAt}
          </div>
          {showRestoreButton && (
            <div style={{ marginTop: '8px' }}>
              <Button design="Default" icon="undo" disabled={restoreDisabled}>Restore</Button>
            </div>
          )}
          {/* Inner entries: publish / create events — shown inside the card */}
          {innerEntries.length > 0 && expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--sapGroup_ContentBorderColor, #e0e0e0)' }}>
              {innerEntries.map(e => <ActivityItem key={e.id} entry={e} />)}
            </div>
          )}
        </div>
        {/* Outer entries: changes / comments — always visible below the card */}
        {outerEntries.length > 0 && outerEntries.map(e => <ActivityItem key={e.id} entry={e} />)}
      </div>
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} headerText={dialogTitle} style={{ width: '560px' }}>
        {isDictEntry && dictCategory
          ? <div style={{ padding: '8px 1rem' }}><CreateDictEntryAttributesTab category={dictCategory} prefilled readOnly /></div>
          : <div style={{ padding: '1rem', minHeight: '200px' }} />
        }
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Transparent" onClick={() => setDetailsOpen(false)}>Close</Button>
        </Bar>
      </Dialog>
      <Dialog open={previewOpen} onClose={() => { setPreviewOpen(false); setCompareMode(false) }}
        style={{ width: compareMode ? '95vw' : '90vw', maxWidth: compareMode ? '1800px' : '1400px' }}
        headerText={compareMode ? 'Compare Revisions' : (assetName ?? entryName ?? 'Revision Preview')}
        className="no-padding-dialog"
      >
        {compareMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '75vh', minHeight: '500px' }}>
            {/* Info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--sapList_Background, #fff)', borderBottom: '1px solid var(--sapPageHeader_BorderColor, #e0e0e0)', flexShrink: 0 }}>
              <span style={{ fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", color: 'var(--sapTextColor)' }}>
                <strong>9</strong> changes from{' '}
                <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>Revision {compareRevisionLeft}</span>{' '}to{' '}
                <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>Revision {compareRevisionRight}</span>{' '}of the diagram{' '}
                <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>{assetName ?? 'Process'}</span>
              </span>
              <Icon name="information" style={{ color: 'var(--sapContent_LabelColor)', cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1 }} />
              <Button design="Default" icon="compare">Choose revisions/diagrams</Button>
            </div>
            {/* Per-panel headers */}
            <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--sapPageHeader_BorderColor, #e0e0e0)', background: 'var(--sapList_Background, #fff)' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRight: '1px solid var(--sapPageHeader_BorderColor, #e0e0e0)' }}>
                <Select value={String(compareRevisionLeft)} onChange={(e: any) => setCompareRevisionLeft(Number(e.detail?.selectedOption?.value ?? compareRevisionLeft))} style={{ minWidth: '150px' }}>
                  {PM_REVISION_GROUPS.map(g => (
                    <Option key={g.revision} value={String(g.revision)} selected={g.revision === compareRevisionLeft}>
                      Revision {g.revision}{g.revision === latestPublished ? ' — Published' : ''}
                    </Option>
                  ))}
                </Select>
                {(() => { const g = PM_REVISION_GROUPS.find(r => r.revision === compareRevisionLeft); return g?.createdBy ? <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>from {g.createdBy} · {g.createdAt}</span> : null })()}
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px' }}>
                <Select value={String(compareRevisionRight)} onChange={(e: any) => setCompareRevisionRight(Number(e.detail?.selectedOption?.value ?? compareRevisionRight))} style={{ minWidth: '150px' }}>
                  {PM_REVISION_GROUPS.map(g => (
                    <Option key={g.revision} value={String(g.revision)} selected={g.revision === compareRevisionRight}>
                      Revision {g.revision}{g.revision === latestPublished ? ' — Published' : ''}
                    </Option>
                  ))}
                </Select>
                {(() => { const g = PM_REVISION_GROUPS.find(r => r.revision === compareRevisionRight); return g?.createdBy ? <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>from {g.createdBy} · {g.createdAt}</span> : null })()}
              </div>
            </div>
            {/* Side-by-side diagrams */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--sapBackgroundColor, #f5f6f7)' }}>
              <div style={{ flex: 1, overflow: 'hidden', borderRight: '2px solid var(--sapPageHeader_BorderColor, #e0e0e0)' }}>
                <DiagramThumbnail style={{ width: '100%', height: '100%' } as React.CSSProperties} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <DiagramThumbnail style={{ width: '100%', height: '100%' } as React.CSSProperties} />
              </div>
            </div>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 16px', background: 'var(--sapList_Background, #fff)', borderTop: '1px solid var(--sapPageHeader_BorderColor, #e0e0e0)', flexShrink: 0, flexWrap: 'wrap' }}>
              {([
                { label: 'Added (6)',                       color: '#0070f2' },
                { label: 'Attribute changed',               color: '#df6e0c' },
                { label: 'Dictionary link changed (3)',     color: '#0b6e4f' },
                { label: 'Element moved/role changed',      color: '#6c32a0' },
                { label: 'Deleted',                        color: '#bb0000' },
              ] as const).map(({ label, color }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", color: 'var(--sapTextColor)' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: color, width: '14px', height: '14px', cursor: 'pointer' }} />
                  <span style={{ color }}>{label}</span>
                </label>
              ))}
              <div style={{ flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", color: 'var(--sapTextColor)' }}>
                <input type="checkbox" defaultChecked style={{ width: '14px', height: '14px', cursor: 'pointer' }} />
                Synchronized scrolling
              </label>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '65vh', minHeight: '400px', background: 'var(--sapBackgroundColor, #f5f6f7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: 'var(--sapList_Background, #fff)', borderBottom: '1px solid var(--sapPageHeader_BorderColor, #e0e0e0)', flexShrink: 0 }}>
              <Select
                value={String(previewRevision)}
                onChange={(e: any) => setPreviewRevision(Number(e.detail?.selectedOption?.value ?? previewRevision))}
                style={{ minWidth: '160px' }}
              >
                {PM_REVISION_GROUPS.map(g => (
                  <Option key={g.revision} value={String(g.revision)} selected={g.revision === previewRevision}>
                    Revision {g.revision}{g.revision === latestPublished ? ' — Published' : ''}
                  </Option>
                ))}
              </Select>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <DiagramThumbnail style={{ width: '100%', height: '100%' } as React.CSSProperties} />
            </div>
          </div>
        )}
        <Bar slot="footer" design="Footer">
          {!compareMode && (
            <Button slot="endContent" icon="compare" design="Default" onClick={() => { setCompareRevisionLeft(previewRevision); setCompareRevisionRight(latestPublished); setCompareMode(true) }}>Compare</Button>
          )}
          <Button slot="endContent" design="Transparent" onClick={() => { setPreviewOpen(false); setCompareMode(false) }}>Close</Button>
        </Bar>
      </Dialog>
    </>
  )
}

// ── Date section ──────────────────────────────────────────────────────────────

function DateSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '8px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '12px', width: '100%' }}>
        <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", flex: 1 }}>
          {label}
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

type Props = { assetType?: string; isEmpty?: boolean; manualPublish?: boolean; entryName?: string; assetName?: string; dictCategory?: DictCategory }

export default function ActivityFeed({ assetType = 'File', isEmpty = false, manualPublish = false, entryName, assetName: assetNameProp, dictCategory }: Props) {
  const [showMore, setShowMore] = useState(false)

  if (isEmpty) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <IllustratedMessage name="NoActivities" titleText="No Activity" subtitleText="Activity will appear here once the entry is created." />
      </div>
    )
  }

  if (assetType === 'Process Model' || assetType === 'Value Chain' || assetType === 'Navigation Map' || assetType === 'Dictionary Category') {
    const sections = [
      { label: 'Today',     groups: [PM_REVISION_GROUPS[0]] },
      { label: 'Yesterday', groups: [PM_REVISION_GROUPS[1]] },
      { label: 'Earlier',   groups: PM_REVISION_GROUPS.slice(2) },
    ]
    const latestPublished = Math.max(...PM_REVISION_GROUPS.filter(g => g.entries.some(e => e.type === 'publish')).map(g => g.revision), -Infinity)
    const visible = showMore ? sections : sections.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visible.map(({ label, groups }) => (
          <DateSection key={label} label={label}>
            {groups.map(group => (
              <RevisionCard key={group.revision} group={group} isPublished={group.revision === latestPublished} assetName={assetNameProp} manualPublish={manualPublish} entries={group.entries} />
            ))}
          </DateSection>
        ))}

        {sections.length > 2 && (
          <Button design="Transparent" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
            {showMore ? 'Show Less' : 'Show More'}

          </Button>
        )}
      </div>
    )
  }

  if (assetType === 'Folder') {
    const sections = [
      { label: 'Today',     cards: FOLDER_TODAY_CARDS },
      { label: 'Yesterday', cards: FOLDER_YESTERDAY_CARDS },
      { label: 'Earlier',   cards: FOLDER_EARLIER_CARDS },
    ]
    const visible = showMore ? sections : sections.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visible.map(({ label, cards }) => (
          <DateSection key={label} label={label}>
            {cards.map(card => (
              <RevisionCard key={`${card.assetName}-${card.revision}`} group={card} isPublished={card.chipStatus === 'Published'} assetName={card.assetName} assetType={card.assetType} entries={card.entries} />
            ))}
          </DateSection>
        ))}
        <Button design="Transparent" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  }

  const isDictEntry = assetType === 'Dictionary Entry' || assetType.endsWith(' Entry')
  if (isDictEntry) {
    const sections = [
      { label: 'Today',     group: DE_REVISION_GROUPS[0] },
      { label: 'Yesterday', group: DE_REVISION_GROUPS[1] },
      { label: 'Earlier',   group: DE_REVISION_GROUPS[2] },
    ]
    const visible = showMore ? sections : sections.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {visible.map(({ label, group }, i) => (
          <DateSection key={label} label={label}>
            <RevisionCard group={group} showRestoreButton={!manualPublish} isPublished={group.revision === 3} restoreDisabled={i === 0} manualPublish={manualPublish} entryName={entryName} isDictEntry dictCategory={dictCategory} entries={group.entries} />
          </DateSection>
        ))}
        <Button design="Transparent" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  }

  const { today, yesterday, earlier } = dataForType(assetType)
  const allSections = [
    { label: 'Today',     entries: today },
    { label: 'Yesterday', entries: yesterday },
    { label: 'Earlier',   entries: earlier },
  ]
  const visible = showMore ? allSections : allSections.slice(0, 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {visible.map(({ label, entries }) => entries.length > 0 && (
        <DateSection key={label} label={label}>
          {entries.map(e => <ActivityItem key={e.id} entry={e} />)}
        </DateSection>
      ))}
      <Button design="Transparent" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
        {showMore ? 'Show less' : 'Show more'}
      </Button>
    </div>
  )
}
