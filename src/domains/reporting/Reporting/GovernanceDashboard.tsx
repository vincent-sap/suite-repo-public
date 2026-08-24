import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Text, Icon, Button,
  Breadcrumbs, BreadcrumbsItem,
} from '@ui5/webcomponents-react'
import { SigFilterBar, SigFilter, MultiSelect } from '@signavio/sap-signavio-uixtension'
import type { FilterValues } from '@signavio/sap-signavio-uixtension'
import { GovSection, GovSubLabel, StatTile, StatGrid } from '../../../shared/components/dashboard'

const GOV_DATE_OPTIONS = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
]

const GOV_DIAGRAMS_PUBLISHING = [
  { label: 'Not published', value: 1790 },
  { label: 'Published in older revision', value: 17 },
  { label: 'Published in latest revision', value: 62 },
]
const GOV_DIAGRAMS_TYPES = [
  { label: 'Business Decision Diagram (DMN 1.2)', value: 9 },
  { label: 'Business Process Diagram (BPMN 2.0)', value: 1670 },
  { label: 'Customer journey map', value: 1 },
  { label: 'Navigation map', value: 7 },
  { label: 'Value Chain', value: 186 },
]
const GOV_COMMENTS_STATE = [
  { label: 'New', value: 138 },
  { label: 'Ignored', value: 5 },
  { label: 'Factored in', value: 12 },
]
const GOV_DICT_PUBLISHING = [
  { label: 'Not published', value: 4 },
  { label: 'Published in older revision', value: 0 },
  { label: 'Published in latest revision', value: 19849 },
]
const GOV_DICT_CATEGORY_TYPES = [
  { label: 'Activities', value: 10247 },
  { label: 'Controls', value: 3 },
  { label: 'Documents', value: 214 },
  { label: 'Events', value: 68 },
  { label: 'IT Systems', value: 13 },
  { label: 'Organizational Units', value: 148 },
  { label: 'Others', value: 5488 },
  { label: 'Processes', value: 3661 },
  { label: 'Risks', value: 11 },
]
const GOV_FILES_PUBLISHING = [
  { label: 'Not published', value: 16 },
  { label: 'Published in older revision', value: 0 },
  { label: 'Published in latest revision', value: 4 },
]
const GOV_FILES_TYPES = [
  { label: 'bpmn', value: 2 },
  { label: 'csv', value: 1 },
  { label: 'docx', value: 2 },
  { label: 'jpg', value: 1 },
  { label: 'pdf', value: 4 },
  { label: 'png', value: 10 },
  { label: 'pptx', value: 1 },
]

export default function GovernanceDashboard({ onBack }: { onBack: () => void }) {
  const [filters, setFilters] = useState<FilterValues>({})
  const [hubOpen, setHubOpen] = useState(true)
  const [diagramsOpen, setDiagramsOpen] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(true)
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [filesOpen, setFilesOpen] = useState(false)

  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Breadcrumbs slot="breadcrumbs">
          <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>
          <BreadcrumbsItem>Workspace Analytics</BreadcrumbsItem>
        </Breadcrumbs>
        <Title slot="heading" level="H3">Workspace Analytics</Title>
        <div slot="actions">
          <Button icon="search">Search for These Items</Button>
        </div>
      </DynamicPageTitle>
    }>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '900px' }}>

        <SigFilterBar filters={filters} onFiltersChange={setFilters} defaultFilters={{}} showManageFilters>
          <SigFilter filterKey="dateRange" label="Date Range">
            <MultiSelect options={GOV_DATE_OPTIONS} />
          </SigFilter>
        </SigFilterBar>

        <GovSection title="SAP Signavio Process Collaboration Hub" count={9080} expanded={hubOpen} onToggle={() => setHubOpen(!hubOpen)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <GovSubLabel>Page visits (since January 13, 2021)</GovSubLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <StatTile label="Overall" value={9080} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  <StatTile label="Last year" value={3833} />
                  <StatTile label="Current year" value={138} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  <StatTile label="Last month" value={38} />
                  <StatTile label="Current month" value={13} />
                </div>
              </div>
            </div>
            <div>
              <GovSubLabel>Unique users (since January 13, 2021)</GovSubLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <StatTile label="Overall" value={76} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  <StatTile label="Last year" value={26} />
                  <StatTile label="Current year" value={16} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                  <StatTile label="Last month" value="—" />
                  <StatTile label="Current month" value="—" />
                </div>
              </div>
            </div>
          </div>
        </GovSection>

        <GovSection title="Diagrams" count={1873} expanded={diagramsOpen} onToggle={() => setDiagramsOpen(!diagramsOpen)}>
          <GovSubLabel>Publishing state</GovSubLabel>
          <StatGrid items={GOV_DIAGRAMS_PUBLISHING} />
          <GovSubLabel>Type</GovSubLabel>
          <StatGrid items={GOV_DIAGRAMS_TYPES} />
        </GovSection>

        <GovSection title="Comments" count={155} expanded={commentsOpen} onToggle={() => setCommentsOpen(!commentsOpen)}>
          <GovSubLabel>Commenting state</GovSubLabel>
          <StatGrid items={GOV_COMMENTS_STATE} />
        </GovSection>

        <GovSection title="Dictionary items" count={19853} expanded={dictionaryOpen} onToggle={() => setDictionaryOpen(!dictionaryOpen)}>
          <GovSubLabel>Publishing state</GovSubLabel>
          <StatGrid items={GOV_DICT_PUBLISHING} />
          <GovSubLabel>Dictionary category type</GovSubLabel>
          <StatGrid items={GOV_DICT_CATEGORY_TYPES} />
        </GovSection>

        <GovSection title="Files" count={21} expanded={filesOpen} onToggle={() => setFilesOpen(!filesOpen)}>
          <GovSubLabel>Publishing state</GovSubLabel>
          <StatGrid items={GOV_FILES_PUBLISHING} />
          <GovSubLabel>Type</GovSubLabel>
          <StatGrid items={GOV_FILES_TYPES} />
        </GovSection>

        <div style={{
          border: '1px solid var(--sapList_BorderColor)',
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          background: 'var(--sapGroup_ContentBackground)',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginTop: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="hint" style={{ color: 'var(--sapInformativeColor)', flexShrink: 0 }} />
            <Text style={{ fontWeight: '600' }}>Note</Text>
          </div>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Displayed amounts are counted without regard to access rights. The linked search depends on your current access rights.
          </Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            In addition, the contents of all "My Documents" folders are included in the displayed numbers.
          </Text>
        </div>

      </div>
    </DynamicPage>
  )
}
