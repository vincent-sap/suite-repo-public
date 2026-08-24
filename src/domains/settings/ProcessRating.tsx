import { useState, useRef } from 'react'
import {
  CheckBox, Text,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
} from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const RATING_AUDIENCES = [
  { id: 'general', label: 'General audience', rate: false, results: false },
  { id: 'admins', label: 'Administrators', rate: true, results: true },
  { id: 'bagi', label: 'Acme Italy', rate: true, results: true },
  { id: 'seb', label: 'Acme France', rate: true, results: true },
]

const CRITERIA = [
  { id: 'automation', label: 'Automation', description: 'The displayed process uses every possible automation.' },
  { id: 'bottlenecks', label: 'Bottlenecks', description: 'The displayed process has no bottlenecks.' },
  { id: 'clarity', label: 'Clarity', description: 'The displayed process is easy to understand.' },
  { id: 'completeness', label: 'Completeness', description: 'The process fully complies with our internal policies and regulations.' },
  { id: 'ease', label: 'Ease of performance', description: 'The displayed process is easy to perform.' },
]

export default function ProcessRating() {
  const [isDirty, setIsDirty] = useState(false)

  const savedRatingPerms = useRef(
    Object.fromEntries(RATING_AUDIENCES.map(a => [a.id, { rate: a.rate, results: a.results }]))
  )
  const savedSelectedCriteria = useRef<string[]>(['automation', 'bottlenecks', 'clarity', 'completeness', 'ease'])

  const [ratingPerms, setRatingPerms] = useState(
    Object.fromEntries(RATING_AUDIENCES.map(a => [a.id, { rate: a.rate, results: a.results }]))
  )
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(['automation', 'bottlenecks', 'clarity', 'completeness', 'ease'])

  const handleSave = () => {
    savedRatingPerms.current = ratingPerms
    savedSelectedCriteria.current = selectedCriteria
    setIsDirty(false)
  }

  const handleReset = () => {
    setRatingPerms(savedRatingPerms.current)
    setSelectedCriteria(savedSelectedCriteria.current)
    setIsDirty(false)
  }

  const toggleCriterion = (id: string) => {
    setSelectedCriteria(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
    setIsDirty(true)
  }

  return (
    <PageHeader
      title="Process Rating"
      subtitle="Allow others to rate your process models. Their rating scores and comments provide you with quantifiable, measurable feedback."
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
    >
      <SettingsPageLayout gap="1.5rem">

        <SettingsSection
          title="Permissions"
          subtitle="Grant permission to rate process models and view rating results for each audience."
        >
          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>Audience</TableHeaderCell>
                <TableHeaderCell>Rate</TableHeaderCell>
                <TableHeaderCell>View results</TableHeaderCell>
              </TableHeaderRow>
            }
          >
            {RATING_AUDIENCES.map(a => (
              <TableRow key={a.id}>
                <TableCell><Text>{a.label}</Text></TableCell>
                <TableCell>
                  <CheckBox
                    checked={ratingPerms[a.id].rate}
                    accessibleName={`Rate – ${a.label}`}
                    onChange={() => { setRatingPerms(p => ({ ...p, [a.id]: { ...p[a.id], rate: !p[a.id].rate } })); setIsDirty(true) }}
                  />
                </TableCell>
                <TableCell>
                  <CheckBox
                    checked={ratingPerms[a.id].results}
                    accessibleName={`View results – ${a.label}`}
                    onChange={() => { setRatingPerms(p => ({ ...p, [a.id]: { ...p[a.id], results: !p[a.id].results } })); setIsDirty(true) }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </SettingsSection>

        <SettingsSection title="Rating Criteria" subtitle="Choose the criteria for users to rate process models.">
          <div className={s.rowWide}>
            {CRITERIA.map(c => (
              <div key={c.id}>
                <CheckBox
                  checked={selectedCriteria.includes(c.id)}
                  text={c.label}
                  onChange={() => toggleCriterion(c.id)}
                  style={{ marginLeft: '-0.5rem' }}
                />
                <div className={s.checkboxIndent}>
                  <Text className={s.fieldDesc}>{c.description}</Text>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>

      </SettingsPageLayout>
    </PageHeader>
  )
}
