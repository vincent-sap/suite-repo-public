import React from 'react'
import { Card, Text, Icon } from '@ui5/webcomponents-react'
import { ProgressIndicator } from '@ui5/webcomponents-react'

export function StatTile({ label, value }: { label: string; value: number | string }) {
  const display = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <Card style={{ boxSizing: 'border-box' }}>
      <div style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: '64px',
        gap: '0.25rem',
      }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{label}</Text>
        <Text style={{ fontSize: '1.75rem', fontWeight: '400', color: 'var(--sapLinkColor)', lineHeight: 1 }}>{display}</Text>
      </div>
    </Card>
  )
}

export function StatGrid({ items, cols = 3 }: { items: { label: string; value: number | string }[]; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.375rem' }}>
      {items.map(t => <StatTile key={t.label} label={t.label} value={t.value} />)}
    </div>
  )
}

export function GovSection({ title, count, expanded, onToggle, children }: {
  title: string; count: number; expanded: boolean;
  onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--sapList_BorderColor)', marginBottom: '0.25rem' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 0', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <Text style={{ flex: 1, fontWeight: '500' }}>
          {title} ({count.toLocaleString()})
        </Text>
        <Icon name={expanded ? 'slim-arrow-up' : 'slim-arrow-down'} style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
      </div>
      {expanded && <div style={{ paddingBottom: '1rem' }}>{children}</div>}
    </div>
  )
}

export function GovSubLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', margin: '0.75rem 0 0.5rem' }}>
      {children}
    </Text>
  )
}

export function MetricCard({ label, value, subLabel }: { label: string; value: string | number; subLabel?: string }) {
  return (
    <div style={{
      border: '1px solid var(--sapList_BorderColor)',
      borderRadius: 'var(--sapElement_BorderCornerRadius)',
      background: 'var(--sapGroup_ContentBackground)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      minWidth: '160px',
    }}>
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{label}</Text>
      <Text style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>{value}</Text>
      {subLabel && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{subLabel}</Text>}
    </div>
  )
}

export function SparkLine({ data, color = 'var(--sapChart_OrderedColor_1)' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const w = 200
  const h = 48
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function BarRow({ label, value, max }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 40px', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</Text>
      <ProgressIndicator value={pct} style={{ height: '12px' }} />
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{value}</Text>
    </div>
  )
}

export function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid var(--sapList_BorderColor)',
      borderRadius: 'var(--sapElement_BorderCornerRadius)',
      background: 'var(--sapGroup_ContentBackground)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        background: 'var(--sapList_HeaderBackground)',
      }}>
        <Text style={{ fontWeight: '600', flex: 1 }}>{title}</Text>
        {action}
      </div>
      <div style={{ padding: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

export function GovItemCard({ label, value, iconName, iconBg, onClick }: {
  label: string; value: number; iconName?: string; iconBg?: string; onClick?: () => void
}) {
  const [hovered, setHovered] = React.useState(false)
  const hasIcon = !!iconName && !!iconBg

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      onClick={onClick}
      style={{
        border: `1px solid ${hovered ? 'var(--sapLinkColor)' : 'var(--sapList_BorderColor)'}`,
        borderRadius: '0.75rem',
        background: hovered ? 'var(--sapList_Hover_Background)' : 'var(--sapGroup_ContentBackground)',
        padding: '1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s', outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {hasIcon && (
          <div style={{
            width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
            background: iconBg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name={iconName} style={{ fontSize: '1rem', color: '#fff' }} />
          </div>
        )}
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{label}</Text>
      </div>
      <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>
        {value.toLocaleString()}
      </Text>
    </div>
  )
}

export function GovItemGrid({ items }: { items: { label: string; value: number; iconName?: string; iconBg?: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
      {items.map(item => <GovItemCard key={item.label} {...item} />)}
    </div>
  )
}

export function AccessBadge({ adminOnly }: { adminOnly: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <Icon
        name={adminOnly ? 'locked' : 'unlocked'}
        style={{ fontSize: '1rem', color: adminOnly ? 'var(--sapContent_NonInteractiveIconColor)' : 'var(--sapPositiveColor)' }}
      />
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
        {adminOnly ? 'Accessible by Admins only' : 'Accessible by all users'}
      </Text>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === 'Active' ? 'var(--sapPositiveColor)' : status === 'Error' ? 'var(--sapNegativeColor)' : 'var(--sapContent_LabelColor)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{status}</Text>
    </div>
  )
}
