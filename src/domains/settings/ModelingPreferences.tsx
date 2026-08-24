import { useState, useRef } from 'react'
import { CheckBox, Text, Link, Popover, ColorPicker, type PopoverDomRef } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const DEFAULT_COLORS = [
  '#000000', '#993300', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333',
  '#800000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#808080',
  '#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#969696',
  '#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF', '#00CCFF', '#993366', '#C0C0C0',
  '#FF99CC', '#FFCC99', '#FFFFCC', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#FFFFFF',
]

export default function ModelingPreferences() {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS)
  const [enforceMatching, setEnforceMatching] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [pickerValue, setPickerValue] = useState('#000000')
  const popoverRef = useRef<PopoverDomRef>(null)
  const swatchRefs = useRef<(HTMLDivElement | null)[]>([])

  const savedRef = useRef<{ colors: string[]; enforceMatching: boolean }>({
    colors: [...DEFAULT_COLORS],
    enforceMatching: true,
  })

  const resetColors = () => {
    setColors(DEFAULT_COLORS)
    setIsDirty(true)
  }

  const openPicker = (index: number) => {
    setEditingIndex(index)
    setPickerValue(colors[index])
    setPickerOpen(true)
  }

  const handleColorChange = (e: CustomEvent) => {
    const newColor: string = (e.target as HTMLElement & { value: string }).value
    if (editingIndex !== null) {
      setColors(prev => prev.map((c, i) => (i === editingIndex ? newColor : c)))
      setPickerValue(newColor)
      setIsDirty(true)
    }
  }

  const handleSave = () => {
    savedRef.current = { colors: [...colors], enforceMatching }
    setIsDirty(false)
  }

  const handleReset = () => {
    setColors([...savedRef.current.colors])
    setEnforceMatching(savedRef.current.enforceMatching)
    setIsDirty(false)
  }

  return (
    <PageHeader title="Modeling Preferences" subtitle="Adjust default modeling behavior and appearance." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="1.5rem">
        <SettingsSection
          title="Color Palette"
          subtitle="Define a color palette for the color selector available when modeling ."
        >
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              You can use colors in the schema of '#008000', 'rgb(0,128,0)' or simple name like 'green'.{' '}
              <Link onClick={resetColors} href="#" style={{ cursor: 'pointer' }}>Reset to the default palette</Link>.
            </Text>
            <div className={s.swatchGrid}>
              {colors.map((color, i) => (
                <div
                  key={i}
                  ref={el => { swatchRefs.current[i] = el }}
                  title={color}
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit color ${color}`}
                  onClick={() => openPicker(i)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(i) } }}
                  className={s.swatch}
                  style={{
                    background: color,
                    boxShadow: editingIndex === i && pickerOpen
                      ? 'inset 0 0 0 2px var(--sapSelectedColor)'
                      : undefined,
                  }}
                />
              ))}
            </div>
            <Popover
              ref={popoverRef}
              opener={editingIndex !== null ? swatchRefs.current[editingIndex] ?? undefined : undefined}
              open={pickerOpen}
              onClose={() => { setPickerOpen(false); setEditingIndex(null) }}
              placement="Bottom"
            >
              <ColorPicker value={pickerValue} onChange={handleColorChange} />
            </Popover>
          </div>
        </SettingsSection>

        <SettingsSection title="Dictionary Item Type Matching">
          <div className={s.rowWide}>
            <CheckBox
              checked={enforceMatching}
              text="Enforce matching dictionary item types"
              onChange={() => { setEnforceMatching(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
            <div className={s.checkboxIndent}>
              <Text className={s.fieldDesc}>
                Decide whether the types of dictionary items (defined by their category) have to fit to the element type.
                Example: BPMN tasks may only link to dictionary items from a category with the type 'Activity'.
              </Text>
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
