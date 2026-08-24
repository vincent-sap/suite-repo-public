import { Title, Option, FlexBox, MessageStrip } from '@ui5/webcomponents-react'
import { SigSelect } from '@signavio/sap-signavio-uixtension'
import s from '../../../domains/settings/components/SettingsPage.module.css'

const AUDIENCES = ['Everyone', 'Modelers', 'Administrators', 'Guests']

type Props = {
  value: string
  onChange: (audience: string) => void
  className?: string
}

export default function AudienceSectionBar({ value, onChange, className }: Props) {
  return (
    <div className={`${s.audienceBarWrapper}${className ? ` ${className}` : ''}`}>
      <MessageStrip hideCloseButton hideIcon design="Information" className={s.audienceBar}>
        <FlexBox alignItems="Center" justifyContent="SpaceBetween" className={s.audienceBarInner}>
          <FlexBox direction="Column" className={s.audienceBarLabels}>
            <Title level="H3" size="H5">Audience-Specific Settings</Title>
            <span className={s.sectionSubtitle}>Settings below apply only to the selected audience.</span>
          </FlexBox>
          <SigSelect
            style={{ background: 'var(--sapField_Background)' }}
            onChange={e => onChange((e.detail.selectedOption as HTMLElement).textContent ?? value)}
          >
            {AUDIENCES.map(a => (
              <Option key={a} selected={a === value}>{a}</Option>
            ))}
          </SigSelect>
        </FlexBox>
    </MessageStrip>
    </div>
  )
}
