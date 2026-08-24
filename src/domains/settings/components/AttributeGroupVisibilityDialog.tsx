import { useState, useEffect } from 'react'
import { Dialog, Button, Bar, Text, Select, Option, Label, RadioButton, FlexBox } from '@ui5/webcomponents-react'
import { AUDIENCES } from './AttributeEditorPanel'

type VisValue = 'Visible' | 'Invisible'

interface Props {
  open: boolean
  groupName: string
  initialVisibility: Record<string, boolean>
  onClose: () => void
  onSave: (visibility: Record<string, boolean>) => void
}

type Mode = 'all' | 'individual'

function deriveMode(vis: Record<string, boolean>): Mode {
  const values = AUDIENCES.map(a => vis[a] ?? true)
  return values.every(v => v === values[0]) ? 'all' : 'individual'
}

export function AttributeGroupVisibilityDialog({ open, groupName, initialVisibility, onClose, onSave }: Props) {
  const [mode, setMode] = useState<Mode>('all')
  const [allVisible, setAllVisible] = useState<VisValue>('Visible')
  const [perAudience, setPerAudience] = useState<Record<string, VisValue>>({})

  useEffect(() => {
    if (!open) return
    const m = deriveMode(initialVisibility)
    setMode(m)
    const firstVal = initialVisibility[AUDIENCES[0]] ?? true
    setAllVisible(firstVal ? 'Visible' : 'Invisible')
    setPerAudience(Object.fromEntries(AUDIENCES.map(a => [a, (initialVisibility[a] ?? true) ? 'Visible' : 'Invisible'])))
  }, [open, initialVisibility])

  const handleSave = () => {
    let result: Record<string, boolean>
    if (mode === 'all') {
      result = Object.fromEntries(AUDIENCES.map(a => [a, allVisible === 'Visible']))
    } else {
      result = Object.fromEntries(AUDIENCES.map(a => [a, perAudience[a] === 'Visible']))
    }
    onSave(result)
  }

  return (
    <Dialog
      open={open}
      className="ui5-content-density-compact"
      style={{ width: '26rem' }}
      onClose={onClose}
      header={
        <Bar design="Header" style={{ width: '100%' }}>
          <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
            Set Visibility for {groupName}
          </Text>
        </Bar>
      }
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" onClick={handleSave}>Save</Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <RadioButton
            text="Apply to All Audiences"
            checked={mode === 'all'}
            onChange={() => setMode('all')}
            style={{ marginLeft: '-0.5rem' }}
          />
          {mode === 'all' && (
            <div style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <Select
                style={{ width: '10rem' }}
                onChange={e => setAllVisible((e.detail as any).selectedOption.value as VisValue)}
              >
                <Option value="Visible" selected={allVisible === 'Visible'}>Visible</Option>
                <Option value="Invisible" selected={allVisible === 'Invisible'}>Invisible</Option>
              </Select>
            </div>
          )}
        </div>

        <div>
          <RadioButton
            text="Set for Audience"
            checked={mode === 'individual'}
            onChange={() => setMode('individual')}
            style={{ marginLeft: '-0.5rem' }}
          />
          {mode === 'individual' && (
            <div style={{ marginTop: '0.5rem', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {AUDIENCES.map(audience => (
                <FlexBox key={audience} alignItems="Center" style={{ gap: '0.75rem' }}>
                  <Label style={{ minWidth: '8rem', color: 'var(--sapTextColor)' }}>{audience}</Label>
                  <Select
                    style={{ width: '10rem' }}
                    onChange={e => setPerAudience(prev => ({ ...prev, [audience]: (e.detail as any).selectedOption.value as VisValue }))}
                  >
                    <Option value="Visible" selected={perAudience[audience] === 'Visible'}>Visible</Option>
                    <Option value="Invisible" selected={perAudience[audience] === 'Invisible'}>Invisible</Option>
                  </Select>
                </FlexBox>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
