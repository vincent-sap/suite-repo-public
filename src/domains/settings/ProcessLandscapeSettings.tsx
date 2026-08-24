import { useState, useRef } from 'react'
import { Label, Text, Input } from '@ui5/webcomponents-react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import type { ProcessLevelNames } from '../process-landscape/types'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const LEVEL_ORDER: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5]

export default function ProcessLandscapeSettings() {
  const { levelNames, setLevelNames } = useWorkspace()

  const [draft, setDraft] = useState<ProcessLevelNames>(levelNames)
  const saved = useRef<ProcessLevelNames>(levelNames)
  const [isDirty, setIsDirty] = useState(false)

  const updateLevel = (level: 1 | 2 | 3 | 4 | 5, value: string) => {
    setDraft(prev => ({ ...prev, [level]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    setLevelNames(draft)
    saved.current = draft
    setIsDirty(false)
  }

  const handleReset = () => {
    setDraft(saved.current)
    setIsDirty(false)
  }

  return (
    <PageHeader title="Process Landscape" isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout>
        <SettingsSection
          title="Level Names"
          subtitle="Rename the hierarchy levels used across the Process Landscape."
        >
          {LEVEL_ORDER.map(level => {
            const bpmnOnly = level >= 4
            return (
              <div className={s.rowWide} key={level}>
                <Label for={`level-name-${level}`} showColon className={s.fieldLabel}>
                  Level {level}
                </Label>
                <Input
                  id={`level-name-${level}`}
                  value={draft[level]}
                  className={s.fieldFull}
                  onInput={e => updateLevel(level, (e.target as unknown as HTMLInputElement).value)}
                />
                {bpmnOnly && (
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                    Used for BPMN detail — not rendered in landscape views.
                  </Text>
                )}
              </div>
            )
          })}
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
