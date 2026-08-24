import { useState, useMemo, useRef } from 'react'
import {
  FlexibleColumnLayout,
  DynamicPage, DynamicPageTitle,
  AnalyticalTable,
  Panel, List, ListItemCustom,
  FlexBox, CheckBox, Icon,
  Button, Text, Title,
  Bar, MessageStrip, ToolbarItem, ToolbarButton,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import s from './FeatureAccess.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockFeatureSet {
  key: string
  name: string
  description?: string
  tag?: 'Base AI' | 'Premium AI'
  disabled?: boolean
}

interface MockGroup {
  key: string
  name: string
  subgroupKey?: string
  closedByDefault?: boolean
  items: MockFeatureSet[]
}

type IndicationColorDesign = 'indication7' | 'indication8'

const TAG_CONFIG: Record<NonNullable<MockFeatureSet['tag']>, { design: IndicationColorDesign; leadingIcon: string }> = {
  'Base AI':    { design: 'indication8', leadingIcon: 'ai' },
  'Premium AI': { design: 'indication7', leadingIcon: 'ai' },
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_GROUPS: MockGroup[] = [
  {
    key: 'suite',
    name: 'Shared Feature Sets',
    items: [
      { key: 'myPage',                          name: 'Access My Page',                                         description: 'Customizable home experience for advanced users.' },
      { key: 'aiEmbBaseProcessConsultingAgent', name: 'Access Process Consulting Agent (with usage limit)',      description: 'Explore your process performance in plain language with a monthly usage limit. Manageable in AI Services.', tag: 'Base AI', disabled: true },
      { key: 'aiEmbPremProcessConsultingAgent', name: 'Access Process Consulting Agent',                        description: 'Explore your process performance in plain language. Manageable in AI Services.', tag: 'Premium AI', disabled: true },
      { key: 'signavioLabs',                    name: 'Access SAP Signavio Lab Space',                          description: 'Access early-stage prototypes to test and validate innovations.' },
    ],
  },
  {
    key: 'modeling',
    name: 'Modeling',
    items: [
      { key: 'bpm',           name: 'Create and Edit BPMN Models',         description: 'When this option is disabled, other types of models can still be edited.' },
      { key: 'dataToProcess', name: 'Access AI-Assisted Process Modeler',  description: 'Create a BPMN model from a text description of a business process. Manageable in AI Services.', tag: 'Premium AI', disabled: true },
      { key: 'processToText', name: 'Joule: Generate Process Description', description: 'Get a description of a given process.', tag: 'Base AI' },
    ],
  },
  {
    key: 'modeling/decisionManager',
    name: 'Decision Manager',
    subgroupKey: 'modeling',
    items: [
      { key: 'dlm',           name: 'Create DMN Models',              description: 'Full DMN modeling: decision requirements, decision logic, simulation, test lab, and import/export.' },
      { key: 'drm',           name: 'Create DMN Requirements Models', description: 'Decision requirements modeling only, without decision logic.' },
      { key: 'technicaluser', name: 'Export Drools',                  description: 'Export decision tables and models as drools rules.' },
    ],
  },
  {
    key: 'browsing',
    name: 'Browsing and Asset Management',
    items: [
      { key: 'myProcessOverview',       name: 'Access My Process Overview',                               description: 'Get a snapshot of your resources depending on your role.' },
      { key: 'modelimportexport',       name: 'Import/Export Models',                                     description: 'Import and export models in formats that can be transferred between workspaces and tools.' },
      { key: 'dictionaryimport',        name: 'Import/Export Dictionary Entries',                         description: 'Import and export dictionary entries from spreadsheets.' },
      { key: 'fileupload',              name: 'Upload Files',                                             description: 'Upload files to the workspace. Uses up workspace storage.' },
      { key: 'processDescription',      name: 'Joule: Ask Specific Questions About Processes',            description: 'Ask questions about any published BPMN model, including its attributes, description, and the process model itself.', tag: 'Base AI' },
      { key: 'processComparison',       name: 'Joule: Compare Two Processes',                            description: 'Compare two different process models, or compare the latest published revision with an earlier revision of the same process model.', tag: 'Base AI' },
      { key: 'piRecommendations',       name: 'Access AI-Assisted Performance Indicators Recommender',   description: 'Provides recommendations on process performance indicators (PPIs). Manageable in AI Services.', tag: 'Premium AI', disabled: true },
      { key: 'processRecommendations',  name: 'Access AI-Assisted Process Recommender',                  description: 'Recommends process models from your workspace or a pre-configured database. Manageable in AI Services.', tag: 'Premium AI', disabled: true },
    ],
  },
  {
    key: 'browsing/variantManagement',
    name: 'Variant Management',
    subgroupKey: 'browsing',
    closedByDefault: true,
    items: [
      { key: 'vmCreateVariantFromNormalDiagram', name: 'Cloning: Clone to Create a Variant from a Normal Model' },
      { key: 'vmCreateVariantFromTemplate',      name: 'Cloning: Clone to Create a Variant from a Template' },
      { key: 'vmCreateVariantFromVariant',       name: 'Cloning: Clone to Create a Variant from a Variant' },
      { key: 'vmManageExistingDimensions',       name: 'Managing Dimensions and Values: Manage Existing Dimensions' },
      { key: 'vmManageValuesForVariantGroups',   name: 'Managing Dimensions and Values: Manage Values for Variant Groups' },
      { key: 'vmPromoteVariantToTemplate',       name: 'Managing Templates: Promote a Variant to Template' },
      { key: 'vmReplaceTemplate',                name: 'Managing Templates: Replace a Template' },
      { key: 'vmRevertTemplate',                 name: 'Managing Templates: Revert a Template' },
      { key: 'vmSetAsTemplate',                  name: 'Managing Templates: Set as Template' },
      { key: 'vmAttachDiagramAsVariant',         name: 'Managing Variants: Attach Model as Variant' },
      { key: 'vmDetachVariantFromTemplate',      name: 'Managing Variants: Detach a Variant from a Template' },
      { key: 'vmDetachAllVariantsFromTemplate',  name: 'Managing Variants: Detach All Variants from the Template' },
    ],
  },
  {
    key: 'miningAnalysis',
    name: 'Process Mining and Analysis',
    items: [
      { key: 'pex',                          name: 'Access SAP Signavio Process Intelligence' },
      { key: 'pexCreateProcess',             name: 'Create Analysis Configuration',                                      description: 'Create and use an analysis configuration to evaluate, benchmark, and measure your business process performance.' },
      { key: 'piPdmDataIntegration',         name: 'Access Data Integration',                                            description: 'Access customizable data connections, source data sets, and on-premises extractors.' },
      { key: 'piPdmDataModeling',            name: 'Access Data Modeling',                                               description: 'Access data pipelines to model and transform data for custom process analysis.' },
      { key: 'signalODataToken',             name: 'Access SIGNAL OData API',                                            description: 'Access analytical results in SAP Signavio Process Intelligence via third-party systems.' },
      { key: 'pexCsvExport',                 name: 'Export Widget Data',                                                 description: 'Export data shown in widgets to a CSV file.' },
      { key: 'piProcessAtoms',               name: 'Access Process Atoms',                                               description: 'Apply governed, reusable business rules to analyze whether real process behavior conforms to defined expectations.' },
      { key: 'aiEmbBaseTextToInsight',       name: 'Access AI-Assisted Process Analyzer, Text-to-Insights',              description: 'Create insights by using AI to interpret user prompts. Manageable in AI Services.', tag: 'Base AI', disabled: true },
      { key: 'aiEmbBaseTextToWidget',        name: 'Access AI-Assisted Process Analyzer, Text-to-Widget',                description: 'Create dashboard widgets by using AI to interpret user prompts. Manageable in AI Services.', tag: 'Base AI', disabled: true },
      { key: 'aiEmbPremContextAnalyzer',     name: 'Access AI-Assisted Context Analyzer',                                description: 'Enhance process mining analysis by incorporating contextual, process-related text data. Manageable in AI Services.', tag: 'Premium AI', disabled: true },
      { key: 'aiEmbBaseRootCauseAnalysis',   name: 'Access AI-Assisted Root Cause Analysis',                             description: 'Access AI interpretations of analysis results and receive recommendations to improve your metrics. Manageable in AI Services.', tag: 'Base AI', disabled: true },
    ],
  },
  {
    key: 'miningAnalysis/sapDefinedContent',
    name: 'SAP-Defined Business Content',
    subgroupKey: 'miningAnalysis',
    items: [
      { key: 'piSapDefinedContentBusinessUser',  name: 'Access Business Content',           description: 'Access data for SAP-defined business content for all end-to-end processes and lines of business.' },
      { key: 'aiEmbBaseContentSearch',           name: 'Access AI-Assisted Content Search', description: 'Access the AI-assisted capability to search for SAP-defined business content using the suite global search. Manageable in AI Services.', tag: 'Base AI', disabled: true },
      { key: 'piSapDefContentMonetaryValues',    name: 'Access Monetary Values',            description: 'Access monetary information in SAP-defined business content data.' },
      { key: 'piSapDefContentPersonalDataView',  name: 'Access Personal Data',              description: 'Access personal data, such as customer, supplier, or user IDs in SAP-defined business content.' },
      { key: 'piSapDefContentValueAnalysisAdm',  name: 'Manage Value Cases',                description: 'Create, edit, and delete value cases in value analysis based on SAP-defined business content.' },
      { key: 'piSapDefinedContentAdmin',         name: 'Access Administration Options',     description: 'Access the administration options for features based on SAP-defined business content.' },
      { key: 'piSapDefContentDataPrivacyAdmin',  name: 'Manage Data Privacy',               description: 'Manage data privacy for SAP-defined business content data.' },
    ],
  },
  {
    key: 'transformation',
    name: 'Transformation',
    items: [
      { key: 'aiEmbBaseInsightDescGeneration', name: 'Access AI-Assisted Insights Description Generator',                description: 'Generate clear, consistent, and business-friendly descriptions for insights. Manageable in AI Services.', tag: 'Base AI', disabled: true },
      { key: 'aiEmbBaseTransformationAdvisor', name: 'Access AI-Assisted Transformation Advisory, Initiative Builder',   description: 'Use business documents to automatically extract key challenges and transform them into initiatives. Manageable in AI Services.', tag: 'Base AI', disabled: true },
    ],
  },
  {
    key: 'reporting',
    name: 'Reporting',
    items: [
      { key: 'basicreports',       name: 'Generate Basic Reports',            description: 'Generate reports except for Process cost analysis and Resource consumption.' },
      { key: 'costresourcereport', name: 'Generate Cost and Resource Reports', description: 'Generate Process cost analysis and Resource consumption reports.' },
    ],
  },
]

const ALL_ITEMS = MOCK_GROUPS.flatMap(g => g.items)
const ENABLED_FEATURE_KEYS = ALL_ITEMS.filter(i => !i.disabled).map(i => i.key)

const USER_GROUPS = [
  'Administrators',
  'Analysts',
  'Human Resources',
  'Modelers',
  'Process Owners',
  'Business Architects',
  'Compliance Officers',
  'External Reviewers',
  'Finance Controllers',
  'IT Operations',
  'Legal Team',
  'Process Viewers',
]

const BUSINESS_ARCHITECTS_DEFAULTS = new Set([
  'bpm', 'modelimportexport', 'fileupload', 'dlm', 'drm', 'technicaluser',
  'pex', 'pexCreateProcess', 'processDescription', 'processComparison', 'basicreports',
])

const initialGroupFeatures = (): Record<string, Set<string>> =>
  USER_GROUPS.reduce((acc, g) => ({
    ...acc,
    [g]: g === 'Administrators'
      ? new Set(ENABLED_FEATURE_KEYS)
      : g === 'Business Architects'
        ? new Set(ENABLED_FEATURE_KEYS.filter(k => BUSINESS_ARCHITECTS_DEFAULTS.has(k)))
        : new Set<string>(),
  }), {} as Record<string, Set<string>>)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGroupSelectionState = (keys: string[], selectedKeys: Set<string>): { checked: boolean; indeterminate: boolean } => {
  const enabledKeys = keys.filter(k => !ALL_ITEMS.find(i => i.key === k)?.disabled)
  const selectedCount = enabledKeys.filter(k => selectedKeys.has(k)).length
  if (selectedCount === 0) return { checked: false, indeterminate: false }
  if (selectedCount === enabledKeys.length) return { checked: true, indeterminate: false }
  return { checked: false, indeterminate: true }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ItemListProps {
  items: MockFeatureSet[]
  isAdminGroup: boolean
  selectedKeys: Set<string>
  onToggle: (key: string) => void
}

const ItemList = ({ items, isAdminGroup, selectedKeys, onToggle }: ItemListProps) => (
  <List
    selectionMode="Multiple"
    separators="None"
    className={s.list}
    onSelectionChange={(e) => {
      const key = (e.detail.targetItem as HTMLElement).dataset.id
      if (key) onToggle(key)
    }}
  >
    {items.map(item => {
      const isSelected = isAdminGroup || selectedKeys.has(item.key)
      const isDisabled = isAdminGroup || !!item.disabled
      return (
        <ListItemCustom
          key={item.key}
          data-id={item.key}
          selected={isSelected}
          type={isDisabled ? 'Inactive' : 'Active'}
          className={`${s.listItem}${isSelected ? ` ${s.listItemSelected}` : ''}${isDisabled ? ` ${s.listItemInactive}` : ''}`}
        >
          <div className={s.listItemContent}>
            <FlexBox direction="Column" style={{ flex: 1, minWidth: 0 }}>
              <Text className={s.listItemName}>{item.name}</Text>
              {item.description && (
                <Text className={s.listItemDescription}>{item.description}</Text>
              )}
              {item.tag && (
                <SigChipV2
                  condensed
                  value={item.tag}
                  design={TAG_CONFIG[item.tag].design}
                  leadingIcon={TAG_CONFIG[item.tag].leadingIcon}
                  className={s.chip}
                />
              )}
            </FlexBox>
          </div>
        </ListItemCustom>
      )
    })}
  </List>
)

interface SubGroupSectionProps {
  group: MockGroup
  isAdminGroup: boolean
  selectedKeys: Set<string>
  onToggle: (key: string) => void
  onToggleGroup: (keys: string[], selectAll: boolean) => void
}

const SubGroupSection = ({ group, isAdminGroup, selectedKeys, onToggle, onToggleGroup }: SubGroupSectionProps) => {
  const [collapsed, setCollapsed] = useState(group.closedByDefault ?? false)
  const keys = group.items.map(i => i.key)
  const { checked, indeterminate } = getGroupSelectionState(keys, selectedKeys)

  return (
    <div className={s.subSection}>
      <List selectionMode="None" separators="None">
        <ListItemCustom onClick={() => setCollapsed(c => !c)}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Icon
              name={collapsed ? 'navigation-right-arrow' : 'navigation-down-arrow'}
              className={s.subGroupHeaderIcon}
            />
            <CheckBox
              checked={checked}
              indeterminate={indeterminate}
              disabled={isAdminGroup}
              onChange={() => onToggleGroup(keys, !checked)}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
            <Text className={s.subGroupHeaderText}>{group.name}</Text>
          </div>
        </ListItemCustom>
      </List>
      {!collapsed && group.items.length > 0 && (
        <ItemList items={group.items} isAdminGroup={isAdminGroup} selectedKeys={selectedKeys} onToggle={onToggle} />
      )}
    </div>
  )
}

interface GroupSectionProps {
  group: MockGroup
  subgroups: MockGroup[]
  isAdminGroup: boolean
  selectedKeys: Set<string>
  onToggle: (key: string) => void
  onToggleGroup: (keys: string[], selectAll: boolean) => void
}

const GroupSection = ({ group, subgroups, isAdminGroup, selectedKeys, onToggle, onToggleGroup }: GroupSectionProps) => {
  const allKeys = [...group.items.map(i => i.key), ...subgroups.flatMap(s => s.items.map(i => i.key))]
  const { checked, indeterminate } = getGroupSelectionState(allKeys, selectedKeys)

  return (
    <Panel
      header={
        <div className={s.groupPanelHeader}>
          <CheckBox
            checked={checked}
            indeterminate={indeterminate}
            disabled={isAdminGroup}
            onChange={() => onToggleGroup(allKeys, !checked)}
          />
          <Title level="H4" className={s.groupPanelTitle}>{group.name}</Title>
        </div>
      }
      collapsed={false}
      className={s.groupPanel}
    >
      {group.items.length > 0 && (
        <ItemList items={group.items} isAdminGroup={isAdminGroup} selectedKeys={selectedKeys} onToggle={onToggle} />
      )}
      {subgroups.map(sub => (
        <SubGroupSection
          key={sub.key}
          group={sub}
          isAdminGroup={isAdminGroup}
          selectedKeys={selectedKeys}
          onToggle={onToggle}
          onToggleGroup={onToggleGroup}
        />
      ))}
    </Panel>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FeatureAccess() {
  const [selectedGroup, setSelectedGroup] = useState('Business Architects')
  const [groupFeatures, setGroupFeatures] = useState<Record<string, Set<string>>>(initialGroupFeatures)
  const [isDirty, setIsDirty] = useState(false)
  const savedFeatures = useRef<Record<string, Set<string>>>(initialGroupFeatures())

  const isAdminGroup = selectedGroup === 'Administrators'
  const selectedKeys = groupFeatures[selectedGroup] ?? new Set<string>()
  const enabledTotal = ENABLED_FEATURE_KEYS.length
  const selectedCount = isAdminGroup ? enabledTotal : ENABLED_FEATURE_KEYS.filter(k => selectedKeys.has(k)).length

  const mutate = (updater: (prev: Record<string, Set<string>>) => Record<string, Set<string>>) => {
    setGroupFeatures(updater)
    setIsDirty(true)
  }

  const handleToggle = (key: string) => {
    if (isAdminGroup) return
    mutate(prev => {
      const next = new Set(prev[selectedGroup])
      next.has(key) ? next.delete(key) : next.add(key)
      return { ...prev, [selectedGroup]: next }
    })
  }

  const handleToggleGroup = (keys: string[], selectAll: boolean) => {
    if (isAdminGroup) return
    const enabledKeys = keys.filter(k => !ALL_ITEMS.find(i => i.key === k)?.disabled)
    mutate(prev => {
      const next = new Set(prev[selectedGroup])
      enabledKeys.forEach(k => selectAll ? next.add(k) : next.delete(k))
      return { ...prev, [selectedGroup]: next }
    })
  }

  const handleSave = () => {
    savedFeatures.current = Object.fromEntries(Object.entries(groupFeatures).map(([k, v]) => [k, new Set(v)]))
    setIsDirty(false)
  }

  const handleCancel = () => {
    setGroupFeatures(Object.fromEntries(Object.entries(savedFeatures.current).map(([k, v]) => [k, new Set(v)])))
    setIsDirty(false)
  }

  const topLevelGroups = MOCK_GROUPS.filter(g => !g.subgroupKey)

  const tableData = useMemo(() => USER_GROUPS.map(name => ({ name })), [])
  const tableColumns = useMemo(() => [{
    accessor: 'name',
    Header: () => (
      <div style={{ padding: '0 0 0 0.5rem', width: '100%' }}>
        <Title level="H3" style={{ fontSize: 'var(--sapFontHeader5Size)' }}>
          User Groups ({USER_GROUPS.length})
        </Title>
      </div>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cell: ({ value }: any) => (
      <span style={{ paddingLeft: '0.5rem' }}>{value}</span>
    ),
    disableSortBy: true,
    disableResizing: true,
    disableFilters: true,
  }], [])

  const businessActions = (
    <>
      <Button design="Transparent" disabled={isAdminGroup} onClick={() => mutate(prev => ({ ...prev, [selectedGroup]: new Set(ENABLED_FEATURE_KEYS) }))}>
        Select All
      </Button>
      <Button design="Transparent" disabled={isAdminGroup} onClick={() => mutate(prev => ({ ...prev, [selectedGroup]: new Set<string>() }))}>
        Deselect All
      </Button>
    </>
  )

  return (
    <FlexibleColumnLayout
      layout="TwoColumnsMidExpanded"
      disableResizing
      layoutsConfiguration={{
        desktop: { TwoColumnsMidExpanded: { layout: ['30%', '70%', '0px'] } },
        tablet:  { TwoColumnsMidExpanded: { layout: ['30%', '70%', '0px'] } },
      }}
      style={{ height: '100%' }}
      startColumn={
        <DynamicPage slot="startColumn" className={s.leftDynamicPage}>
          <DynamicPageTitle
            slot="titleArea"
            className={s.leftDynamicPageTitle}
            heading={<Title level="H2">Feature Access</Title>}
          />
          <AnalyticalTable
            data={tableData}
            columns={tableColumns}
            selectionMode="None"
            filterable={false}
            onRowClick={(e) => {
              const row = (e as unknown as CustomEvent).detail?.row
              if (row) setSelectedGroup((row.original as { name: string }).name)
            }}
            withNavigationHighlight
            markNavigatedRow={(row) => (row.original as { name: string }).name === selectedGroup}
            headerRowHeight={42}
            visibleRows={USER_GROUPS.length}
            reactTableOptions={{ autoResetSelectedRows: false, disableFilters: true }}
            className={s.userGroupsTable}
          />
        </DynamicPage>
      }
      midColumn={
        <DynamicPage
          slot="midColumn"
          hidePinButton
          showFooter={isDirty}
          titleArea={
            <DynamicPageTitle
              slot="titleArea"
              className={s.rightDynamicPageTitle}
              heading={<Title level="H2" className={s.rightHeading}>{selectedGroup}</Title>}
              subheading={
                isAdminGroup ? (
                  <MessageStrip
                    design="ColorSet2"
                    colorScheme="10"
                    hideCloseButton
                    className={s.dynamicPageSubHeading}
                  >
                    Administrator groups have full access to all features and cannot be modified.
                  </MessageStrip>
                ) : (
                  <Text className={s.dynamicPageSubHeading}>
                    Select the feature sets a user group can access.
                  </Text>
                )
              }
              navigationBar={
                <ToolbarButton
                  design="Transparent"
                  icon="decline"
                  slot="heading"
                  onClick={() => {}}
                />
              }
            />
          }
          footerArea={
            <Bar design="FloatingFooter">
              <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
              <Button slot="endContent" design="Transparent" onClick={handleCancel}>Cancel</Button>
            </Bar>
          }
        >
          <SigTableWrapper
            activeView="card"
            titleSlot={
              <ToolbarItem>
                <Title level="H3" style={{ fontSize: 'var(--sapFontHeader5Size)' }}>
                  Feature Sets ({selectedCount} / {enabledTotal})
                </Title>
              </ToolbarItem>
            }
            businessActionsSlot={businessActions}
          >
            <FlexBox direction="Column" className={s.groupsWrapper} style={{ gap: '1rem' }}>
              {topLevelGroups.map(group => {
                const subgroups = MOCK_GROUPS.filter(g => g.subgroupKey === group.key)
                const hasContent = group.items.length > 0 || subgroups.some(sg => sg.items.length > 0)
                if (!hasContent) return null
                return (
                  <GroupSection
                    key={group.key}
                    group={group}
                    subgroups={subgroups}
                    isAdminGroup={isAdminGroup}
                    selectedKeys={selectedKeys}
                    onToggle={handleToggle}
                    onToggleGroup={handleToggleGroup}
                  />
                )
              })}
            </FlexBox>
          </SigTableWrapper>
        </DynamicPage>
      }
    />
  )
}
