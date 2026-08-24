import { useState } from 'react'
import { FlexBox, FlexBoxAlignItems, FlexBoxDirection, Icon, Text } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js'

type Props = {
  panelIcon: React.ReactNode
  panelTitle: string
  children: React.ReactNode
}

export default function CollapsiblePanel({ panelIcon, panelTitle, children }: Props) {
  const hasContent = !!children
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <FlexBox direction={FlexBoxDirection.Column} style={{ width: '100%', gap: '1rem' }}>
      <FlexBox direction="Row" alignItems={FlexBoxAlignItems.Center}>
        <Icon
          name={hasContent && isExpanded ? 'slim-arrow-down' : 'slim-arrow-right'}
          onClick={() => hasContent && setIsExpanded(p => !p)}
          style={{ height: '2.25rem', padding: '0.5rem', cursor: 'pointer' }}
        />
        {panelIcon}
        <Text style={{ fontFamily: 'var(--sapFontFamily, 72)', fontSize: 'var(--sapFontLargeSize, 1rem)', color: 'var(--sapList_TextColor)', fontWeight: 700, paddingLeft: '0.5rem' }}>
          {panelTitle}
        </Text>
      </FlexBox>
      {hasContent && isExpanded && <div>{children}</div>}
    </FlexBox>
  )
}
