import { useState } from 'react'
import {
  Text, Icon, Button, Input, Label, Switch,
} from '@ui5/webcomponents-react'
import { SigChipV2, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import s from './panels.module.css'

type AttrValue =
  | { type: 'text'; value: string }
  | { type: 'multiline'; value: string; expanded?: boolean }
  | { type: 'chips'; values: string[] }
  | { type: 'boolean'; checked: boolean; subLabel?: string }
  | { type: 'dates'; values: string[] }
  | { type: 'rating'; value: number; max: number }
  | { type: 'users'; values: { name: string; initials: string }[] }

type Attr = { id: string; label: string; required?: boolean; value: AttrValue }

type AttrGroup = { id: string; name: string; attrs: Attr[] }

// ── Static mock data matching the screenshot ──────────────────────────────
const MAIN_GROUPS: AttrGroup[] = [
  {
    id: 'main',
    name: 'Main Attributes',
    attrs: [
      {
        id: 'description',
        label: 'Process Description',
        required: true,
        value: {
          type: 'multiline',
          value:
            'The HR Hiring Process (8.6.1.2) defines the end-to-end workflow for recruiting new employees within the German entity. It begins when a hiring need is identified and an application is received, followed by CV evaluation, candidate interviews, and assessment. Based on interview outcomes the process branches into offer preparation or candidate rejection. The process concludes when the candidate is either formally onboarded or the position is re-opened.',
        },
      },
      {
        id: 'regions',
        label: 'Applicable Regions',
        required: true,
        value: { type: 'chips', values: ['EMEA', 'Germany', 'DACH', 'EU-West', 'Global', '…more'] },
      },
      {
        id: 'gdpr',
        label: 'GDPR Compliant',
        required: true,
        value: { type: 'boolean', checked: true, subLabel: 'Candidate data anonymized after 6 months' },
      },
      {
        id: 'validity',
        label: 'Validity Period',
        required: true,
        value: { type: 'dates', values: ['01.01.2026', '01.01.2026 – 31.12.2026'] },
      },
      {
        id: 'fulfillment-rate',
        label: 'Target Fulfillment Rate',
        required: true,
        value: { type: 'chips', values: ['85 %', '92 %'] },
      },
      {
        id: 'time-to-hire',
        label: 'Target Time-to-Hire',
        required: true,
        value: { type: 'chips', values: ['30 Days', '45 Days'] },
      },
      {
        id: 'priority',
        label: 'Process Priority',
        required: true,
        value: { type: 'text', value: 'High' },
      },
      {
        id: 'channels',
        label: 'Hiring Channels',
        required: true,
        value: { type: 'chips', values: ['LinkedIn', 'SAP SuccessFactors'] },
      },
      {
        id: 'maturity',
        label: 'Process Maturity',
        value: { type: 'rating', value: 3, max: 5 },
      },
      {
        id: 'stakeholders',
        label: 'Process Stakeholders',
        required: true,
        value: { type: 'users', values: [{ name: 'HR Recruiting Team', initials: 'HR' }] },
      },
    ],
  },
]

function AttrRating({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            background: i < value ? 'var(--sapHighlightColor)' : 'var(--sapNeutralBorderColor)',
          }}
        />
      ))}
    </div>
  )
}

function AttrField({ attr }: { attr: Attr }) {
  const [expanded, setExpanded] = useState(false)
  const v = attr.value

  if (v.type === 'text') {
    return <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{v.value}</Text>
  }

  if (v.type === 'multiline') {
    const text = v.value
    const threshold = 160
    const isTruncable = text.length > threshold
    return (
      <div>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5', wordBreak: 'break-word' }}>
          {isTruncable && !expanded ? `${text.slice(0, threshold)}…` : text}
        </Text>
        {isTruncable && (
          <Button design="Transparent" style={{ fontSize: 'var(--sapFontSmallSize)', padding: '0', height: '1.5rem' }}
            onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Less' : 'More'}
          </Button>
        )}
        <Button icon="edit" design="Transparent" style={{ height: '1.75rem', width: '1.75rem', padding: 0, marginTop: '4px' }} tooltip="Edit" />
      </div>
    )
  }

  if (v.type === 'chips') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {v.values.map((val, i) => (
          <SigChipV2 key={i} value={val} condensed />
        ))}
        <Button icon="add" design="Transparent" style={{ height: '1.75rem', width: '1.75rem', padding: 0 }} tooltip="Add" />
      </div>
    )
  }

  if (v.type === 'boolean') {
    return (
      <div>
        <Switch checked={v.checked} />
        {v.subLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <input type="checkbox" checked readOnly style={{ accentColor: 'var(--sapHighlightColor)' }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>{v.subLabel}</Text>
          </div>
        )}
      </div>
    )
  }

  if (v.type === 'dates') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {v.values.map((val, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              border: '1px solid var(--sapNeutralBorderColor)',
              borderRadius: '4px',
              background: 'var(--sapBaseColor)',
              fontSize: 'var(--sapFontSmallSize)',
            }}
          >
            <Icon name="calendar" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapContent_IconColor)' }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{val}</Text>
            <Button icon="decline" design="Transparent" style={{ height: '1rem', width: '1rem', padding: 0 }} />
          </div>
        ))}
        <Button icon="add" design="Transparent" style={{ height: '1.75rem', width: '1.75rem', padding: 0 }} tooltip="Add" />
      </div>
    )
  }

  if (v.type === 'rating') {
    return <AttrRating value={v.value} max={v.max} />
  }

  if (v.type === 'users') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {v.values.map((u, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SigDomainObject size="XS" object={'User Groups' as never} />
            <div>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>{u.name}</Text>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                User Group
              </Text>
            </div>
            <Button icon="decline" design="Transparent" style={{ height: '1.5rem', width: '1.5rem', padding: 0, marginLeft: 'auto' }} />
          </div>
        ))}
        <Button icon="add" design="Transparent" style={{ height: '1.75rem', padding: '0 0.5rem', fontSize: 'var(--sapFontSmallSize)' }}>
          Add Stakeholder
        </Button>
      </div>
    )
  }

  return null
}

function AttrGroupSection({ group }: { group: AttrGroup }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button className={s.groupHeader} onClick={() => setOpen(o => !o)}>
        <Icon
          name={open ? 'slim-arrow-down' : 'navigation-right-arrow'}
          style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }}
        />
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
          {group.name} ({group.attrs.length})
        </Text>
        <Button
          icon="sort-ascending"
          design="Transparent"
          style={{ marginLeft: 'auto', height: '1.5rem', width: '1.5rem', padding: 0 }}
          tooltip="Reorder attributes"
        />
      </button>

      {open && (
        <div className={s.attrList}>
          {group.attrs.map(attr => (
            <div key={attr.id} className={s.attrRow}>
              <Label required={attr.required} style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                {attr.label}
              </Label>
              <AttrField attr={attr} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type Props = {
  onClose?: () => void
}

export default function DiagramAttributesPanel({ onClose: _onClose }: Props) {
  const [search, setSearch] = useState('')

  const filteredGroups = MAIN_GROUPS.map(g => ({
    ...g,
    attrs: search
      ? g.attrs.filter(a => a.label.toLowerCase().includes(search.toLowerCase()))
      : g.attrs,
  })).filter(g => g.attrs.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '0 0 12px' }}>
        <Input
          placeholder="Search for attributes"
          type={'Search' as any}
          value={search}
          onInput={(e: any) => setSearch(e.target?.value ?? '')}
          icon={<Icon slot="icon" name="search" />}
          style={{ width: '100%' }}
        />
      </div>
      {filteredGroups.map(g => <AttrGroupSection key={g.id} group={g} />)}
    </div>
  )
}
