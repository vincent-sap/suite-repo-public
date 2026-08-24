import { Select, Option, Text, FlexBox } from '@ui5/webcomponents-react'
import { useWorkspace } from '../../../contexts/WorkspaceContext'

type Props = {
  value: string
  onChange: (audience: string) => void
  className?: string
  subtitle?: string
}

export default function AudienceSectionBar({ value, onChange, className, subtitle }: Props) {
  const { audiences } = useWorkspace()

  return (
    <div className={className}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        marginTop: '0.5rem',
        background: 'var(--sapInformationBackground)',
        border: '1px solid var(--sapMessage_InformationBorderColor)',
        borderRadius: 'var(--sapElement_BorderCornerRadius)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '12rem' }}>
        <FlexBox direction="Column" style={{ gap: '1px' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
            Audience-Specific Settings
          </Text>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
            {subtitle ?? 'Settings below apply only to the selected audience'}
          </Text>
        </FlexBox>
      </div>
      <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
        <Select
          id="audience-section-bar-select"
          style={{ minWidth: '14rem' }}
          onChange={e => onChange((e.detail.selectedOption as HTMLElement).textContent ?? value)}
        >
          {audiences.map(a => (
            <Option key={a.id} selected={a.name === value}>{a.name}</Option>
          ))}
        </Select>
      </FlexBox>
      </div>
    </div>
  )
}
