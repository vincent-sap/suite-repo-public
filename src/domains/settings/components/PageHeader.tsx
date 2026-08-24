import React, { useState, useEffect, useRef } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Text, Toolbar, ToolbarButton,
  Bar, Button, Toast,
} from '@ui5/webcomponents-react'
import { DuplicateSettingsDialog } from './DuplicateSettingsDialog'
import { useDirtyState } from '../../../contexts/DirtyStateContext'

interface Props {
  title: string
  subtitle?: string
  children?: React.ReactNode
  onSave?: () => void
  onReset?: () => void
  onDuplicate?: () => void
  duplicateSourceAudience?: string
  isDirty?: boolean
}

export default function PageHeader({ title, subtitle, children, onSave, onReset, onDuplicate, duplicateSourceAudience, isDirty }: Props) {
  const [toastOpen, setToastOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const dirtyState = useDirtyState()
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  useEffect(() => {
    if (onSave && onReset) {
      dirtyState.register({
        isDirty: () => isDirtyRef.current ?? false,
        onSave: () => { onSave(); setToastOpen(true) },
        onReset: () => onReset(),
      })
      return () => dirtyState.unregister()
    }
  }, [onSave, onReset]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    onSave?.()
    setToastOpen(true)
  }

  const handleReset = () => {
    onReset?.()
  }

  return (
    <>
      <DynamicPage
        style={{ height: '100%' } as React.CSSProperties}
        hidePinButton
        showFooter={isDirty}
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">{title}</Title>
            {subtitle && <Text slot="subheading" style={{ color: 'var(--sapObjectHeader_Subtitle_TextColor)' }}>{subtitle}</Text>}
            {subtitle && <Text slot="snappedSubheading" style={{ color: 'var(--sapObjectHeader_Subtitle_TextColor)' }}>{subtitle}</Text>}
            {duplicateSourceAudience && (
              <Toolbar slot="actionsBar">
                <ToolbarButton design="Transparent" text="Copy Settings" onClick={() => setDuplicateDialogOpen(true)} />
              </Toolbar>
            )}
          </DynamicPageTitle>
        }
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleReset}>Discard Changes</Button>
          </Bar>
        }
      >
        {children}
      </DynamicPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
      {duplicateSourceAudience && (
        <DuplicateSettingsDialog
          open={duplicateDialogOpen}
          sourceAudience={duplicateSourceAudience}
          onClose={() => setDuplicateDialogOpen(false)}
          onDuplicate={(_audiences, _categories) => {
            setDuplicateDialogOpen(false)
            onDuplicate?.()
          }}
        />
      )}
    </>
  )
}
