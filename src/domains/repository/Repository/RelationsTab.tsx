import { useState } from 'react'
import { Button, List, ListItemCustom, MessageStrip, Text, IllustratedMessage, Icon, Dialog, Bar } from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { entryBg, entryIconColor, CAT_TYPE_ICON } from './dictionaryData'
import type { DictCategoryType } from '../../../contexts/WorkspaceContext'

// ── Original (file/process model) variant ─────────────────────────────────────

type RelationObject = 'Process Model' | 'Quick Model' | 'Archimate' | 'Org Chart'

interface OriginalRelationItem {
  id: string
  title: string
  subtitle: string
  object: RelationObject
}

interface OriginalRelationGroup {
  id: string
  label: string
  items: OriginalRelationItem[]
}

const ORIGINAL_GROUPS: OriginalRelationGroup[] = [
  {
    id: 'bpmn2',
    label: 'BPMN 2.0',
    items: [
      { id: 'a1', title: 'Receipt of Goods', subtitle: 'Diagram link A', object: 'Process Model' },
      { id: 'a2', title: 'Quick delivery process', subtitle: 'Diagram link B', object: 'Quick Model' },
      { id: 'a3', title: 'Approval Process', subtitle: 'Diagram link C', object: 'Archimate' },
      { id: 'a4', title: 'Organisation Hierarchy', subtitle: 'Diagram link D...', object: 'Org Chart' },
      { id: 'a5', title: 'Invoice to Delivery', subtitle: 'Diagram link E', object: 'Process Model' },
      { id: 'a6', title: 'Inventory Management', subtitle: 'Diagram link G', object: 'Quick Model' },
      { id: 'a7', title: 'Employee Leave Request', subtitle: 'Diagram link H', object: 'Archimate' },
      { id: 'a8', title: 'Product Development Cycle', subtitle: 'Diagram link I', object: 'Org Chart' },
      { id: 'a9', title: 'Sales Funnel', subtitle: 'Diagram link J', object: 'Process Model' },
      { id: 'a10', title: 'IT Support Ticketing', subtitle: 'Diagram link K', object: 'Process Model' },
      { id: 'a11', title: 'Quality Assurance Testing', subtitle: 'Diagram link L', object: 'Quick Model' },
    ],
  },
  {
    id: 'bpmn12',
    label: 'BPMN 1.2',
    items: [
      { id: 'b1', title: 'Receipt of Goods', subtitle: 'Diagram link A', object: 'Process Model' },
      { id: 'b2', title: 'Quick delivery process', subtitle: 'Diagram link B', object: 'Quick Model' },
      { id: 'b3', title: 'Approval Process', subtitle: 'Diagram link C', object: 'Archimate' },
      { id: 'b4', title: 'Organisation Hierarchy', subtitle: 'Diagram link D...', object: 'Org Chart' },
      { id: 'b5', title: 'Invoice to Delivery', subtitle: 'Diagram link E', object: 'Process Model' },
      { id: 'b6', title: 'Inventory Management', subtitle: 'Diagram link G', object: 'Quick Model' },
      { id: 'b7', title: 'Employee Leave Request', subtitle: 'Diagram link H', object: 'Archimate' },
      { id: 'b8', title: 'Product Development Cycle', subtitle: 'Diagram link I', object: 'Org Chart' },
      { id: 'b9', title: 'Sales Funnel', subtitle: 'Diagram link J', object: 'Process Model' },
      { id: 'b10', title: 'IT Support Ticketing', subtitle: 'Diagram link K', object: 'Process Model' },
      { id: 'b11', title: 'Quality Assurance Testing', subtitle: 'Diagram link L', object: 'Quick Model' },
    ],
  },
]

const VISIBLE_COUNT = 5

function OriginalRelationGroup({ group }: { group: OriginalRelationGroup }) {
  const [expanded, setExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? group.items : group.items.slice(0, VISIBLE_COUNT)

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingTop: '20px', paddingBottom: '2px' }}>
        <Button icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setExpanded(v => !v)} />
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          {group.label}
        </Text>
      </div>
      {expanded && (
        <List separators="None" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleItems.map(item => (
            <ListItemCustom key={item.id} type="Active" style={{ paddingBlock: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <SigDomainObject size="XS" object={item.object as never} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                    {item.title}
                  </Text>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                    {item.subtitle}
                  </Text>
                </div>
                <Button icon="SAP-icons-v4/link" design="Transparent" style={{ flexShrink: 0 }} />
              </div>
            </ListItemCustom>
          ))}
        </List>
      )}
      {expanded && !showAll && group.items.length > VISIBLE_COUNT && (
        <Button design="Default" onClick={() => setShowAll(true)} style={{ marginTop: '4px' }}>Show More</Button>
      )}
    </div>
  )
}

// ── Dictionary entry variant ───────────────────────────────────────────────────

interface DictRelationItem {
  id: string
  title: string
  subtitle: string
  description?: string
  objectType: string
  categoryType?: DictCategoryType
  chip?: { value: string; design?: string; leadingIcon?: string }
}

interface DictRelationGroup {
  id: string
  label: string
  items: DictRelationItem[]
}

const DICT_RELATION_GROUPS: DictRelationGroup[] = [
  {
    id: 'bpmn',
    label: 'BPMN',
    items: [
      { id: 'a1', title: 'Procure-to-Pay Process', subtitle: 'Finance / Procurement', description: 'End-to-end process from purchase requisition to vendor payment.', objectType: 'Process Model', chip: { value: 'Template', design: 'none', leadingIcon: 'SAP-icons-v4/variant' } },
      { id: 'a2', title: 'Supplier Onboarding', subtitle: 'Procurement / Vendor Management', description: 'Steps to qualify, register and activate a new supplier in the system.', objectType: 'Process Model', chip: { value: '3 Variants', design: 'none', leadingIcon: 'SAP-icons-v4/variant' } },
      { id: 'a3', title: 'Invoice Validation Flow', subtitle: 'Finance / Accounts Payable', description: 'Automated and manual checks applied to inbound vendor invoices.', objectType: 'Process Model' },
      { id: 'a4', title: 'Purchase Requisition Approval', subtitle: 'Finance / Procurement', description: 'Multi-level approval routing for purchase requests above threshold.', objectType: 'Process Model' },
      { id: 'a5', title: 'Payment Run Release', subtitle: 'Finance', description: 'Authorisation and execution of scheduled outgoing payment batches.', objectType: 'Process Model' },
      { id: 'a6', title: 'Goods Receipt Confirmation', subtitle: 'Warehouse / Logistics', description: 'Recording of received goods against open purchase orders.', objectType: 'Process Model' },
    ],
  },
  {
    id: 'dict-entry',
    label: 'Dictionary Entry',
    items: [
      { id: 'd1', title: 'Procurement Unit', subtitle: 'Organization · Org unit handling procurement', objectType: 'Dictionary Entry', categoryType: 'Organization' },
      { id: 'd2', title: 'Purchase Order', subtitle: 'Document · Formal request to a supplier', objectType: 'Dictionary Entry', categoryType: 'Document' },
      { id: 'd3', title: 'Goods Receipt', subtitle: 'Activity · Physical receipt of ordered goods', objectType: 'Dictionary Entry', categoryType: 'Activity' },
    ],
  },
  {
    id: 'nav-map',
    label: 'Navigation Map',
    items: [
      { id: 'n1', title: 'Source-to-Pay Overview', subtitle: 'Procurement navigation overview', description: 'High-level landscape of all sourcing and purchasing processes.', objectType: 'Nav Map' },
      { id: 'n2', title: 'Finance Process Landscape', subtitle: 'Finance / Controlling', description: 'Overview of all finance processes including close, reporting and treasury.', objectType: 'Nav Map' },
      { id: 'n3', title: 'End-to-End Logistics Map', subtitle: 'Logistics / Supply Chain', description: 'Navigation view across inbound, outbound and returns logistics.', objectType: 'Nav Map' },
    ],
  },
]

function DictRelationGroup({ group }: { group: DictRelationGroup }) {
  const [expanded, setExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? group.items : group.items.slice(0, VISIBLE_COUNT)

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingTop: '12px', paddingBottom: '4px' }}>
        <Button icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setExpanded(v => !v)} />
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          {group.label}
        </Text>
      </div>
      {expanded && (
        <List separators="None" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleItems.map((item) => {
            const isDictEntry = item.objectType === 'Dictionary Entry'
            return (
              <ListItemCustom key={item.id} type="Active" style={{ paddingBlock: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                  {isDictEntry ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: item.categoryType ? entryBg(item.categoryType) : 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={item.categoryType ? (CAT_TYPE_ICON[item.categoryType] ?? 'document') : 'document'} style={{ width: '16px', height: '16px', color: item.categoryType ? entryIconColor(item.categoryType) : 'var(--sapAvatar_6_TextColor)' }} />
                    </div>
                  ) : (
                    <SigDomainObject size="XS" object={item.objectType as never} style={{ flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                      {item.title}
                    </Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                      {item.description ?? item.subtitle}
                    </Text>
                  </div>
                  {item.chip && (
                    <SigChipV2 value={item.chip.value} design={(item.chip.design ?? 'none') as any} condensed {...(item.chip.leadingIcon ? { leadingIcon: item.chip.leadingIcon } : {})} />
                  )}
                  <Button icon="SAP-icons-v4/link" design="Transparent" style={{ flexShrink: 0 }} tooltip="Open" />
                </div>
              </ListItemCustom>
            )
          })}
        </List>
      )}
      {expanded && !showAll && group.items.length > VISIBLE_COUNT && (
        <Button design="Default" onClick={() => setShowAll(true)} style={{ marginTop: '4px' }}>Show More</Button>
      )}
    </div>
  )
}

// ── Exports ────────────────────────────────────────────────────────────────────

export function RelationsTab({ variant = 'default', isEmpty = false, entryName }: { variant?: 'default' | 'dict-entry'; isEmpty?: boolean; entryName?: string }) {
  const [usageGraphOpen, setUsageGraphOpen] = useState(false)
  if (isEmpty) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <IllustratedMessage name="NoData" titleText="No Relations" subtitleText="Relations will appear here once the entry is created." />
      </div>
    )
  }
  if (variant === 'dict-entry') {
    return (
      <div style={{ width: '100%', boxSizing: 'border-box', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', paddingBottom: '4px' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            Used In
          </Text>
          <Button design="Default" onClick={() => setUsageGraphOpen(true)}>Open Usage Graph</Button>
        </div>
        {DICT_RELATION_GROUPS.map(group => (
          <DictRelationGroup key={group.id} group={group} />
        ))}
        <Dialog
          open={usageGraphOpen}
          onClose={() => setUsageGraphOpen(false)}
          headerText={`Usage Graph for ${entryName ?? 'Dictionary Entry'}`}
          style={{ width: '600px', minHeight: '400px' }}
        >
          <div style={{ padding: '1rem', minHeight: '300px' }} />
          <Bar slot="footer" design="Footer">
            <Button slot="endContent" design="Transparent" onClick={() => setUsageGraphOpen(false)}>Close</Button>
          </Bar>
        </Dialog>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', paddingBottom: '16px' }}>
      <MessageStrip design="Information" hideCloseButton>
        Showing published data only.
      </MessageStrip>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapShell_TextColor, #1d2d3e)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          Sorted by Date Created (Newest First)
        </Text>
      </div>
      {ORIGINAL_GROUPS.map(group => (
        <OriginalRelationGroup key={group.id} group={group} />
      ))}
    </div>
  )
}
