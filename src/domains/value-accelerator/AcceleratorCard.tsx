import '@ui5/webcomponents-icons/dist/car-rental.js'
import '@ui5/webcomponents-icons/dist/world.js'
import '@ui5/webcomponents-icons/dist/stethoscope.js'
import '@ui5/webcomponents-icons/dist/retail-store.js'
import '@ui5/webcomponents-icons/dist/decision.js'
import '@ui5/webcomponents-icons/dist/loan.js'
import '@ui5/webcomponents-icons/dist/factory.js'
import '@ui5/webcomponents-icons/dist/question-mark.js'
import { Card, Avatar, Text, FlexBox } from '@ui5/webcomponents-react'
import type { AcceleratorPackage } from './mockData'
import s from './AcceleratorCard.module.css'

const INDUSTRY_ICON_MAP: Record<string, string> = {
  'automotive': 'car-rental',
  'cross industry': 'world',
  'healthcare': 'stethoscope',
  'retail': 'retail-store',
  'multiple industries': 'decision',
  'financial services': 'loan',
  'industrial manufacturing': 'factory',
}

function getIconByIndustry(industry?: string): string {
  if (!industry) return 'question-mark'
  return INDUSTRY_ICON_MAP[industry.toLowerCase()] ?? 'question-mark'
}

interface AcceleratorCardProps {
  pkg: AcceleratorPackage
}

export function AcceleratorCard({ pkg }: AcceleratorCardProps) {
  const icon = getIconByIndustry(pkg.industry)

  return (
    <Card className={s.card}>
      <FlexBox className={s.container} direction="Column">
          <div className={s.header}>
            <Avatar size="XS" shape="Square" icon={`sap-icon://${icon}`} />
            <Text className={s.industryText}>{pkg.industry ?? 'Industry not specified'}</Text>
          </div>
          <div className={s.body}>
            <Text className={s.title} maxLines={6}>{pkg.name}</Text>
            <Text className={s.company}>by {pkg.publisher}</Text>
          </div>
          <div className={s.footer}>
            {pkg.lob && (
              <div className={s.metaGroup}>
                <Text className={s.metaLabel}>Line Of Business:</Text>
                <Text className={s.metaValue} maxLines={2}>{pkg.lob}</Text>
              </div>
            )}
            {pkg.system && (
              <div className={s.metaGroup}>
                <Text className={s.metaLabel}>System:</Text>
                <Text className={s.metaValue} maxLines={2}>{pkg.system}</Text>
              </div>
            )}
            {pkg.type && (
              <div className={s.metaGroup}>
                <Text className={s.metaLabel}>Type:</Text>
                <Text className={s.metaValue} maxLines={2}>{pkg.type}</Text>
              </div>
            )}
          </div>
        </FlexBox>
    </Card>
  )
}
