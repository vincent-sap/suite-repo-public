import React, { useState } from 'react'
import {
  Panel,
  Button,
  Text,
  Popover,
  CheckBox,
  Link,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { DiagramThumbnail } from '../../repository/Repository/components'

// ── Data ──────────────────────────────────────────────────────────────────────

const OVERLAY_OPTIONS = [
  { id: 'overlay-1', label: 'Process Performance Indicators' },
  { id: 'overlay-2', label: 'Risks and Controls' },
]

const VIEW_OPTIONS = ['Full', 'Compact', 'Minimal']

const ACTIVITIES = [
  { id: '1', name: 'Enter Cash Desk Application',                        responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '2', name: 'Cash Payment Lot is created',                        responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '3', name: 'Transfer to GL',                                     responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '4', name: 'Clearing rules determine open items to be cleared',  responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '5', name: 'Contract Account is validated and payment is saved', responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '6', name: 'Payment search via Contract Account',                responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '7', name: 'Receipe printed',                                    responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '8', name: 'Customer Account is updated',                        responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { id: '9', name: 'Payment Presented',                                  responsible: 'Accounts Payable and Receivable Accountant (FI-CA)' },
]

const ATTRIBUTES = [
  { label: 'Expression language', value: 'http://www.w3.org/TR/XPath' },
  { label: 'Name',                value: '0ac02b68-47cf-4cc9-8cf4-c70ea1b47ae5' },
  { label: 'Target namespace',    value: 'http://www.sap.com/bpmn2/' },
  { label: 'Type language',       value: 'http://www.w3.org/2001/XMLSchema' },
  { label: '_orientation',        value: 'horizontal' },
  {
    label: 'Activities',
    value: ACTIVITIES.map((a, i) => `${i + 1}. ${a.name}`).join('\n'),
    multiline: true,
  },
  { label: 'Roles',           value: 'Accounts Payable and Receivable Accountant (FI-CA)' },
  { label: 'IT Systems',      value: '—' },
  { label: 'Process result',  value: '1.  End Event' },
  { label: 'Process trigger', value: '1.  Start Event' },
  { label: 'Process level',   value: '1' },
]

const rowBorder = '1px solid var(--sapList_BorderColor)'

// ── Diagram section ───────────────────────────────────────────────────────────

function DiagramSection() {
  const [viewMode, setViewMode] = useState('Full')
  const [overlaysVisible, setOverlaysVisible] = useState<Record<string, boolean>>({})
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false)
  const [overlayPopoverOpen, setOverlayPopoverOpen] = useState(false)
  const [legendPopoverOpen, setLegendPopoverOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [minimapVisible, setMinimapVisible] = useState(true)

  const viewBtnRef = React.useRef<unknown>(null)
  const overlayBtnRef = React.useRef<unknown>(null)
  const legendBtnRef = React.useRef<unknown>(null)

  const visibleCount = Object.values(overlaysVisible).filter(Boolean).length

  return (
    <Panel
      headerText="Diagram"
      header={
        <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'flex-end' }}>
          <Button design="Transparent" icon="comment" style={{ fontSize: 'var(--sapFontSmallSize)' }}>
            No comments
          </Button>

          <Button ref={viewBtnRef as React.Ref<any>} design="Transparent" icon="slim-arrow-down" endIcon="slim-arrow-down" onClick={() => setViewPopoverOpen(v => !v)}>
            View ({viewMode})
          </Button>
          <Popover opener={viewBtnRef.current as HTMLElement ?? undefined} open={viewPopoverOpen} onClose={() => setViewPopoverOpen(false)} placement="Bottom">
            <div style={{ padding: '0.5rem 0', minWidth: '10rem' }}>
              {VIEW_OPTIONS.map(opt => (
                <div key={opt} onClick={() => { setViewMode(opt); setViewPopoverOpen(false) }} style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: viewMode === opt ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent', fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSize)' }}>
                  {opt}
                </div>
              ))}
            </div>
          </Popover>

          <Button ref={overlayBtnRef as React.Ref<any>} design="Transparent" icon="slim-arrow-down" endIcon="slim-arrow-down" onClick={() => setOverlayPopoverOpen(v => !v)}>
            Overlays ({visibleCount}/{OVERLAY_OPTIONS.length} visible)
          </Button>
          <Popover opener={overlayBtnRef.current as HTMLElement ?? undefined} open={overlayPopoverOpen} onClose={() => setOverlayPopoverOpen(false)} placement="Bottom">
            <div style={{ padding: '0.5rem 1rem', minWidth: '14rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {OVERLAY_OPTIONS.map(opt => (
                <CheckBox key={opt.id} text={opt.label} checked={!!overlaysVisible[opt.id]} onChange={() => setOverlaysVisible(prev => ({ ...prev, [opt.id]: !prev[opt.id] }))} />
              ))}
            </div>
          </Popover>

          <Button ref={legendBtnRef as React.Ref<any>} design="Transparent" icon="slim-arrow-down" endIcon="slim-arrow-down" onClick={() => setLegendPopoverOpen(v => !v)}>
            Legend
          </Button>
          <Popover opener={legendBtnRef.current as HTMLElement ?? undefined} open={legendPopoverOpen} onClose={() => setLegendPopoverOpen(false)} placement="Bottom">
            <div style={{ padding: '1rem', minWidth: '12rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>No legend available for this diagram type.</Text>
            </div>
          </Popover>
        </div>
      }
    >
      <div style={{ position: 'relative', height: '400px', background: 'var(--sapBackgroundColor)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '1rem' }}>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}>
            <DiagramThumbnail />
          </div>
        </div>

        {/* Zoom controls — standalone vertical strip */}
        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'var(--sapList_Background)', border: rowBorder, borderRadius: 'var(--sapElement_BorderCornerRadius)', padding: '0.25rem' }}>
          <Button design="Transparent" icon="full-screen" tooltip="Fit to screen" onClick={() => setZoom(100)} />
          <Button design="Transparent" icon="sys-find" tooltip="Fit page" />
          <div style={{ padding: '0.25rem 0.5rem', textAlign: 'center', fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>{zoom}%</div>
          <Button design="Transparent" icon="add" tooltip="Zoom in" onClick={() => setZoom(z => Math.min(z + 10, 200))} />
          <Button design="Transparent" icon="less" tooltip="Zoom out" onClick={() => setZoom(z => Math.max(z - 10, 20))} />
          <Button
            design={minimapVisible ? 'Emphasized' : 'Transparent'}
            icon="map"
            tooltip="Toggle minimap"
            onClick={() => setMinimapVisible(v => !v)}
          />
        </div>

        {/* Minimap — separate floating panel, bottom-right */}
        {minimapVisible && (
          <div style={{ position: 'absolute', right: '4rem', bottom: '1rem', width: '200px', background: 'var(--sapList_Background)', border: rowBorder, borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <DiagramThumbnail />
          </div>
        )}
      </div>
    </Panel>
  )
}

// ── Activities section ────────────────────────────────────────────────────────

function ActivitiesSection() {
  const [overlayPopoverOpen, setOverlayPopoverOpen] = useState(false)
  const overlayBtnRef = React.useRef<HTMLElement>(null)

  return (
    <Panel
      headerText="Activities"
      header={
        <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'flex-end' }}>
          <Button ref={overlayBtnRef as React.Ref<any>} design="Transparent" icon="slim-arrow-down" endIcon="slim-arrow-down" onClick={() => setOverlayPopoverOpen(v => !v)}>
            Overlays (0/2 visible)
          </Button>
          <Popover opener={overlayBtnRef.current as HTMLElement ?? undefined} open={overlayPopoverOpen} onClose={() => setOverlayPopoverOpen(false)} placement="Bottom">
            <div style={{ padding: '0.5rem 1rem', minWidth: '14rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {OVERLAY_OPTIONS.map(opt => (
                <CheckBox key={opt.id} text={opt.label} checked={false} />
              ))}
            </div>
          </Popover>
          <Link style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', marginLeft: '0.25rem' }}>Export RACI matrix</Link>
        </div>
      }
    >
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: rowBorder }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Filters</Text>
        <SigChipV2 value="Role" trailingIcon="slim-arrow-down" />
        <SigChipV2 value="Responsibility" trailingIcon="slim-arrow-down" />
        <Button design="Transparent" icon="add" style={{ fontSize: 'var(--sapFontSmallSize)' }}>Add Filter</Button>
      </div>

      {/* Count */}
      <div style={{ padding: '0.375rem 1rem', borderBottom: rowBorder }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          {ACTIVITIES.length} Activities
        </Text>
      </div>

      {/* Activity cards */}
      {ACTIVITIES.map((activity, idx) => (
        <div key={activity.id} style={{ padding: '0.625rem 1rem', borderBottom: idx < ACTIVITIES.length - 1 ? rowBorder : 'none' }}>
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.25rem' }}>
            {activity.name}
          </Text>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: '600' }}>Responsible</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{activity.responsible}</Text>
          </div>
        </div>
      ))}
    </Panel>
  )
}

// ── Attributes section ────────────────────────────────────────────────────────

function AttributesSection() {
  return (
    <Panel headerText="Attributes">
      {ATTRIBUTES.map((attr, idx) => (
        <div key={attr.label} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', padding: '0.5rem 1rem', borderBottom: idx < ATTRIBUTES.length - 1 ? rowBorder : 'none', alignItems: 'start' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)' }}>
            {attr.label}
          </Text>
          {attr.multiline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {attr.value.split('\n').map((line, i) => (
                <Text key={i} style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{line}</Text>
              ))}
            </div>
          ) : (
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr.value}</Text>
          )}
        </div>
      ))}
    </Panel>
  )
}

// ── Variant Group section ─────────────────────────────────────────────────────

function VariantGroupSection() {
  return (
    <Panel
      collapsed
      header={
        <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Variant Group:</Text>
          <SigChipV2 value="0 variants" leadingIcon="split" condensed />
        </div>
      }
    >
      <div style={{ padding: '1rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          No variants available for this process.
        </Text>
      </div>
    </Panel>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DiagramTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      <DiagramSection />
      <ActivitiesSection />
      <AttributesSection />
      <VariantGroupSection />
    </div>
  )
}
