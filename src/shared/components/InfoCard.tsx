import React from 'react'
import { Icon, Text } from '@ui5/webcomponents-react'

interface InfoItem {
  icon: 'theme' | 'home' | 'list'
  text: React.ReactNode
}

const iconNames: Record<string, string> = {
  theme: 'palette',
  home: 'home',
  list: 'list',
}

export default function InfoCard({ items }: { items: InfoItem[] }) {
  return (
    <div style={{
      width: '300px',
      background: 'var(--sapBaseColor)',
      borderRadius: '8px',
      border: '1px solid var(--sapGroup_ContentBorderColor)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flexShrink: 0,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Icon
            name={iconNames[item.icon]}
            style={{ flexShrink: 0, marginTop: '1px', color: 'var(--sapBrandColor)', width: '18px', height: '18px' }}
          />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', lineHeight: 1.5 }}>
            {item.text}
          </Text>
        </div>
      ))}
    </div>
  )
}
