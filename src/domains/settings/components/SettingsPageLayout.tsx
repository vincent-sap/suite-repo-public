import { Children, type ReactNode, type CSSProperties } from 'react'
import { Title } from '@ui5/webcomponents-react'
import s from './SettingsPage.module.css'

interface SettingsPageLayoutProps {
  children: ReactNode
  gap?: CSSProperties['gap']
  flush?: boolean
  wide?: boolean
}

export default function SettingsPageLayout({ children, gap, flush, wide }: SettingsPageLayoutProps) {
  const cls = [s.layout, flush ? s.layoutFlush : '', wide ? s.layoutWide : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} style={gap ? { gap } : undefined}>
      {children}
    </div>
  )
}

interface SettingsSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  headerExtra?: ReactNode
}

export function SettingsSection({ title, subtitle, children, action, headerExtra }: SettingsSectionProps) {
  const childArray = Children.toArray(children).filter(Boolean)
  return (
    <div className={s.section}>
      {(title || action || headerExtra) && (
        <div className={s.sectionHeader}>
          <div className={s.sectionHeaderText}>
            {title && <Title level="H4" className={s.sectionTitle}>{title}</Title>}
            {subtitle && <div className={s.sectionSubtitle}>{subtitle}</div>}
            {headerExtra}
          </div>
          {action}
        </div>
      )}
      {childArray.map((child, i) => (
        <div key={i} className={s.sectionChild}>
          {child}
        </div>
      ))}
    </div>
  )
}

/** @deprecated Use SettingsSection instead */
export function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={s.section} style={style}>
      {children}
    </div>
  )
}

/** @deprecated Use SettingsSection title/subtitle props instead */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className={s.sectionHeader} style={{ alignItems: subtitle ? 'flex-start' : 'center' }}>
      <div className={s.sectionHeaderText}>
        <div className={s.sectionTitle}>{title}</div>
        {subtitle && <div className={s.sectionSubtitle}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}
