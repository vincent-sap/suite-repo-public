import { useState, useRef } from 'react'
import {
  CheckBox, Text,
  Select, Option,
} from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import AudienceSectionBar from './components/AudienceSectionBar'
import s from './components/SettingsPage.module.css'

const COMMENT_MODES = [
  'Create and show comments',
  "Create, but don't show comments",
  "Don't create and don't show comments",
]

export default function Collaboration() {
  const [isDirty, setIsDirty] = useState(false)

  const savedCommentMode = useRef(COMMENT_MODES[0])
  const savedReadConfirmEnabled = useRef(false)

  const [audience, setAudience] = useState('General audience')
  const [commentMode, setCommentMode] = useState(COMMENT_MODES[0])
  const [readConfirmEnabled, setReadConfirmEnabled] = useState(false)

  const handleSave = () => {
    savedCommentMode.current = commentMode
    savedReadConfirmEnabled.current = readConfirmEnabled
    setIsDirty(false)
  }

  const handleReset = () => {
    setCommentMode(savedCommentMode.current)
    setReadConfirmEnabled(savedReadConfirmEnabled.current)
    setIsDirty(false)
  }

  return (
    <PageHeader title="Collaboration" subtitle="Configure collaboration features for each audience." isDirty={isDirty} onSave={handleSave} onReset={handleReset} onDuplicate={() => {}} duplicateSourceAudience={audience}>
      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />
      <SettingsPageLayout gap="1.5rem">

        <SettingsSection title="Commenting">
          <div className={s.rowWide}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text className={s.fieldDesc}>
                Define whether users in this audience can create and see comments on diagrams.
              </Text>
              <Select id="comment-mode" style={{ width: '100%', maxWidth: '20rem' }}
                onChange={e => { setCommentMode((e.detail.selectedOption as HTMLElement).textContent ?? commentMode); setIsDirty(true) }}>
                {COMMENT_MODES.map(m => <Option key={m} selected={m === commentMode}>{m}</Option>)}
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Read Confirmation">
          <div className={s.row}>
            <CheckBox
              checked={readConfirmEnabled}
              text="Enable read confirmation"
              onChange={() => { setReadConfirmEnabled(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
          </div>
        </SettingsSection>

      </SettingsPageLayout>
    </PageHeader>
  )
}
