import { useState, useMemo } from 'react'
import {
  ObjectPage, ObjectPageSection, ObjectPageTitle,
  Input, Title, ToolbarItem,
} from '@ui5/webcomponents-react'
import {
  SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import { AcceleratorCard } from './AcceleratorCard'
import { PUBLISHED_PACKAGES, INDUSTRIES, TYPES, SYSTEMS } from './mockData'
import s from './ValueAcceleratorGallery.module.css'

const INDUSTRY_OPTIONS = INDUSTRIES.map(v => ({ value: v, label: v }))
const TYPE_OPTIONS = TYPES.map(v => ({ value: v, label: v }))
const SYSTEM_OPTIONS = SYSTEMS.map(v => ({ value: v, label: v }))

const DEFAULT_FILTERS = { industry: [], type: [], system: [] }

interface Props {
  embedded?: boolean
}

export function ValueAcceleratorGallery({ embedded = false }: Props) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    const industry = filters.industry as string[] ?? []
    const type = filters.type as string[] ?? []
    const system = filters.system as string[] ?? []
    return PUBLISHED_PACKAGES.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.publisher.toLowerCase().includes(search.toLowerCase())) return false
      if (industry.length > 0 && (!p.industry || !industry.includes(p.industry))) return false
      if (type.length > 0 && (!p.type || !type.includes(p.type))) return false
      if (system.length > 0 && (!p.system || !system.includes(p.system))) return false
      return true
    })
  }, [search, filters])

  const gallery = (
    <SigTableWrapper
      activeView="card"
      titleSlot={
        <ToolbarItem>
          <Title level="H3" style={{ fontSize: '1rem' }}>{filtered.length} Accelerators</Title>
        </ToolbarItem>
      }
      searchSlot={
        <ToolbarItem>
          <Input
            type={'Search' as any}
            placeholder="Search"
            showClearIcon
            value={search}
            onInput={e => setSearch((e.target as any).value)}
          />
        </ToolbarItem>
      }
      filterBarSlot={
        <SigFilterBar
          filters={filters}
          defaultFilters={DEFAULT_FILTERS}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters(DEFAULT_FILTERS)}
        >
          <SigFilter filterKey="industry" label="Industry">
            <MultiSelect options={INDUSTRY_OPTIONS} />
          </SigFilter>
          <SigFilter filterKey="type" label="Type">
            <MultiSelect options={TYPE_OPTIONS} />
          </SigFilter>
          <SigFilter filterKey="system" label="System">
            <MultiSelect options={SYSTEM_OPTIONS} />
          </SigFilter>
        </SigFilterBar>
      }
    >
      <div className={s.cardGrid}>
        {filtered.map(pkg => (
          <AcceleratorCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </SigTableWrapper>
  )

  if (embedded) return gallery

  return (
    <ObjectPage
      mode="IconTabBar"
      hidePinButton
      titleArea={
        <ObjectPageTitle
          header="Value Accelerator Library"
          subHeader="Ready-to-use accelerators that support your business process transformation and continuous improvement journey."
        />
      }
    >
      <ObjectPageSection id="gallery" titleText="Gallery" hideTitleText>
        {gallery}
      </ObjectPageSection>
    </ObjectPage>
  )
}
