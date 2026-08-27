import React from 'react'
import { Button } from '@ui5/webcomponents-react'
import s from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
  action?: React.ReactNode
}

export function SectionHeader({ title, onSeeAll, action }: SectionHeaderProps) {
  return (
    <div className={s['section-header']}>
      <span className={s['section-header__title']}>{title}</span>
      {action}
      {onSeeAll && (
        <Button design="Transparent" onClick={onSeeAll}>See All</Button>
      )}
    </div>
  )
}
