import { useState, useEffect } from 'react'
import {
  Dialog,
  Bar,
  Button,
  Title,
  Text,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  FlexBoxWrap,
  Icon,
  MessageStrip,
  Link,
  CheckBox,
  Select,
  Option,
  Label,
  TextArea,
  TabContainer,
  Tab,
} from '@ui5/webcomponents-react'

import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

import s from './EnrichDialogAccordion.module.css'

// Icons
import '@ui5/webcomponents-icons/dist/hint.js'
import '@ui5/webcomponents-icons/dist/document.js'
import '@ui5/webcomponents-icons/dist/task.js'
import '@ui5/webcomponents-icons/dist/accept.js'
import '@ui5/webcomponents-icons/dist/lightbulb.js'
import '@ui5/webcomponents-icons/dist/sys-enter-2.js'
import '@ui5/webcomponents-icons/dist/target-group.js'
import '@ui5/webcomponents-icons/dist/ai.js'
import '@ui5/webcomponents-icons/dist/action.js'
import '@ui5/webcomponents-icons/dist/settings.js'
import '@ui5/webcomponents-icons/dist/group.js'
import '@ui5/webcomponents-icons/dist/error.js'
import '@ui5/webcomponents-icons/dist/process.js'

// Source Systems
const SOURCE_SYSTEMS = [
  { id: 's1', name: 'SAP S/4HANA Production' },
  { id: 's2', name: 'SAP S/4HANA Development' },
  { id: 's3', name: 'SAP ECC Production' },
  { id: 's4', name: 'SAP ECC Quality Assurance' },
]

// Simplified E2E Processes (flat array, no LoB nesting)
const E2E_PROCESSES = [
  { id: 'e1', name: 'Order to Cash', code: 'O2C', suggested: true },
  { id: 'e2', name: 'Procure to Pay', code: 'P2P', suggested: false },
  { id: 'e3', name: 'Hire to Retire', code: 'H2R', suggested: false },
  { id: 'e4', name: 'Record to Report', code: 'R2R', suggested: false },
  { id: 'e5', name: 'Plan to Produce', code: 'P2P', suggested: false },
  { id: 'e6', name: 'Source to Pay', code: 'S2P', suggested: false },
  { id: 'e7', name: 'Lead to Cash', code: 'L2C', suggested: false },
  { id: 'e8', name: 'Quote to Cash', code: 'Q2C', suggested: false },
]

// Initiative Analysis from AI
const INITIATIVE_ANALYSIS = {
  summary: '5 insights, 12 assets, 0 value cases have been processed. The initiative focuses on reducing Days Sales Outstanding (DSO) within the Order-to-Cash process. Current DSO is 58 days with a target of 45 days. Key focus areas include invoice accuracy (12% error rate), credit check delays (3-5 days for high-value orders), and dispute resolution time (21 days average). The initiative has clear quantifiable metrics and a defined working capital improvement target of €2.4M.',
  improvementPrompts: [
    'Current breakdown of DSO by sub-process (order processing, invoicing, collections)',
    'Root causes of the 12% invoice error rate',
    'Credit check approval thresholds and escalation criteria',
    'Geographic or customer segment breakdown of DSO performance',
    'Historical trend data on DSO over the past 12 months',
  ],
}

// Loading Dots Component
const LoadingDots = () => (
  <FlexBox alignItems={FlexBoxAlignItems.End} className={s["loading-dots"]}>
    <div className={s['loading-dot'] + ' ' + s['loading-dot--small']} />
    <div className={s['loading-dot'] + ' ' + s['loading-dot--medium']} />
    <div className={s['loading-dot'] + ' ' + s['loading-dot--large']} />
  </FlexBox>
)

// Step 1: Initial Loading State
const Step1Loading = ({ counts }: { counts: { insights: number; assets: number; valueCases: number; tasks: number } }) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    alignItems={FlexBoxAlignItems.Center}
    justifyContent={FlexBoxJustifyContent.Center}
    className={s["loading-state"]}
  >
    <LoadingDots />
    <Title level="H4" className={s["loading-title"]}>Calculating initiative score...</Title>
    <Text className={s["loading-counts"]}>
      Processing {counts.insights} Insights, {counts.assets} Assets, {counts.valueCases} Value Cases, {counts.tasks} Tasks...
    </Text>
  </FlexBox>
)

// Step 2: E2E Process Selection & Configuration
const Step2SelectProcess = ({
  selectedSourceSystem,
  setSelectedSourceSystem,
  selectedE2E,
  setSelectedE2E,
  contextInput,
  setContextInput,
}: {
  selectedSourceSystem: string | null
  setSelectedSourceSystem: (val: string | null) => void
  selectedE2E: string | null
  setSelectedE2E: (val: string | null) => void
  contextInput: string
  setContextInput: (val: string) => void
  analysisExpanded: boolean
  setAnalysisExpanded: (val: boolean) => void
}) => {
  const handleSourceSystemChange = (e: any) => {
    const newSystem = e.detail.selectedOption?.dataset?.value
    setSelectedSourceSystem(newSystem || null)
  }

  const handleE2EChange = (e: any) => {
    const newE2E = e.detail.selectedOption?.dataset?.value
    setSelectedE2E(newE2E || null)
  }

  const suggestedProcess = E2E_PROCESSES.find(p => p.suggested)
  const remainingChars = 10000 - contextInput.length

  return (
    <FlexBox direction={FlexBoxDirection.Column} className={`${s["page-content"]} ${s["step2-content"]}`}>
      <FlexBox direction={FlexBoxDirection.Column} className={s["process-header"]}>
        <FlexBox alignItems={FlexBoxAlignItems.Center} className={s["ai-header-icon-wrapper"]}>
          <Icon name="process" className={s["process-icon"]} />
        </FlexBox>
        <Title level="H4">Step 1: Core Configuration</Title>
        <Text className={s["process-description"]}>
          Connect the necessary source systems and end-to-end processes to get more tailored recommendations.
        </Text>
      </FlexBox>

      {/* Two-column layout for Source System and E2E Process */}
      <FlexBox className={s["form-row-two-columns"]}>
        <FlexBox direction={FlexBoxDirection.Column} className={s["form-section"]}>
          <Label className={s["section-label"]}>Source System:</Label>
          <Select
            onChange={handleSourceSystemChange}
            className={s["process-select"]}
          >
            <Option data-value="" selected={!selectedSourceSystem}>Select (Optional)</Option>
            {SOURCE_SYSTEMS.map(system => (
              <Option key={system.id} data-value={system.id} selected={selectedSourceSystem === system.id}>
                {system.name}
              </Option>
            ))}
          </Select>
        </FlexBox>

        <FlexBox direction={FlexBoxDirection.Column} className={s["form-section"]}>
          <Label className={s["section-label"]} required>
            End-to-End Process:
          </Label>

          <FlexBox direction={FlexBoxDirection.Column} className={s["e2e-select-wrapper"]}>
            <Select
              onChange={handleE2EChange}
              className={s["process-select"]}
            >
              <Option data-value="" selected={!selectedE2E}>Select End-to-End Process...</Option>
              {E2E_PROCESSES.map(process => (
                <Option key={process.id} data-value={process.id} selected={selectedE2E === process.id}>
                  {process.name} {process.code && `(${process.code})`}
                </Option>
              ))}
            </Select>

            {suggestedProcess && selectedE2E === suggestedProcess.id && (
              <Text className={s["ai-suggestion-inline"]}>
                Suggested by AI. Verify before use.
              </Text>
            )}
          </FlexBox>
        </FlexBox>
      </FlexBox>

      <FlexBox direction={FlexBoxDirection.Column} className={`${s["form-section"]} ${s["additional-context-section"]}`}>
        <Label className={s["section-label"]}>Additional Context (Optional)</Label>

        <Text className={s["section-description"]} style={{ marginBottom: '0.5rem' }}>
          Here are the key observations from the initial analysis:
        </Text>

        {/* MessageStrip-style Initiative Analysis */}
        <FlexBox direction={FlexBoxDirection.Column} className={s["initiative-analysis-messagestrip"]}>
          <FlexBox alignItems={FlexBoxAlignItems.Start} className={s["analysis-header"]}>
            <Icon name="ai" className={s["sparkles-icon"]} />
            <Text className={s["analysis-header-text"]}>Initiative Analysis</Text>
          </FlexBox>

          <FlexBox direction={FlexBoxDirection.Column} className={s["analysis-content"]}>
            <Text className={s["analysis-summary"]}>{INITIATIVE_ANALYSIS.summary}</Text>

            <Text className={s["analysis-subheading"]}>
              Details to include in your response to improve the output in the next step:
            </Text>
            <ul className={s["analysis-bullets"]}>
              {INITIATIVE_ANALYSIS.improvementPrompts.map((prompt, idx) => (
                <li key={idx}>{prompt}</li>
              ))}
            </ul>
          </FlexBox>
        </FlexBox>

        <FlexBox direction={FlexBoxDirection.Column} style={{ marginTop: '1rem' }}>
          <Label className={s["section-label"]}>Your response:</Label>
          <TextArea
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            placeholder="Share additional context here..."
            rows={6}
            maxlength={10000}
            className={s["context-textarea"]}
          />
          <Text className={s["character-counter"]}>
            {remainingChars.toLocaleString()} characters left
          </Text>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  )
}

// Step 3: Generating Recommendations Loading
const Step3GeneratingLoading = ({ selectedE2E }: { selectedSourceSystem: string | null; selectedE2E: string | null }) => {
  const e2eProcess = selectedE2E
    ? E2E_PROCESSES.find(p => p.id === selectedE2E)
    : null

  return (
    <FlexBox
      direction={FlexBoxDirection.Column}
      alignItems={FlexBoxAlignItems.Center}
      justifyContent={FlexBoxJustifyContent.Center}
      className={s["loading-state"]}
    >
      <LoadingDots />
      <Title level="H4" className={s["loading-title"]}>Generating recommendations...</Title>
      <Text className={s["loading-counts"]}>
        Analyzing {e2eProcess?.name || 'selected process'} for relevant suggestions
      </Text>
    </FlexBox>
  )
}

// Mock recommendations data (filtered by E2E process in real implementation)
const getMockRecommendations = (_selectedSourceSystem: string | null, _selectedE2E: string | null) => {
  // In real implementation, this would filter based on the selected process and source system
  return {
    attributes: [
      {
        id: 'attr1',
        title: 'Target DSO',
        description: '45 days (current: 58 days)',
      },
      {
        id: 'attr2',
        title: 'Expected Working Capital Impact',
        description: '€2.4M improvement in cash flow',
      },
      {
        id: 'attr3',
        title: 'Key Performance Indicator',
        description: 'Invoice-to-Payment cycle time reduction by 22%',
      },
    ],
    existingAttributes: [
      {
        id: 'existing1',
        title: 'Initiative Owner',
        description: 'Sarah Chen (Finance Transformation Lead)',
      },
      {
        id: 'existing2',
        title: 'Timeline',
        description: 'Jan 15, 2026 - Sep 30, 2026',
      },
      {
        id: 'existing3',
        title: 'Priority',
        description: 'High - Board-level commitment',
      },
    ],
    suggestedInsights: [
      {
        id: 'i1',
        title: 'Root Cause: Manual Invoice Matching Delays Collections',
        bullets: [
          '47% of invoices require manual 3-way matching (PO, GR, Invoice)',
          'Average matching time: 4.2 days per invoice',
          'Manual matching errors cause 23% of payment disputes'
        ],
        evidence: 'Evidence: S/4HANA FI-AR Analytics - Date Range: Jan-Jul 2026',
      },
      {
        id: 'i2',
        title: 'Bottleneck: Credit Approval Process for Large Orders',
        bullets: [
          'Orders >€50K stuck in approval queue for 3-5 days',
          '34% of high-value orders miss original delivery commitments',
          'Credit team utilization at 87% - near capacity'
        ],
        evidence: 'Evidence: SAP Credit Management - Q2 2026 Analysis',
      },
      {
        id: 'i3',
        title: 'Data Quality: Incomplete Customer Master Data',
        bullets: [
          '18% of customer records missing payment terms',
          '12% have outdated contact information',
          'Results in 2-3 day delays in invoice delivery'
        ],
        evidence: 'Evidence: SAP S/4HANA Customer Master Data Quality Report',
      },
      {
        id: 'i4',
        title: 'Process Deviation: Inconsistent Dunning Procedures',
        bullets: [
          'Dunning execution rate: only 62% adherence to schedule',
          'Average delay in first dunning notice: 5 days post-due date',
          'No standardized escalation path for overdue accounts'
        ],
        evidence: 'Evidence: FI-AR Dunning Run History - Last 6 months',
      },
    ],
    existingInsights: [
      { id: 'e1', title: '12% of invoices contain errors requiring manual correction', description: 'Identified through manual AR review process' },
      { id: 'e2', title: 'Credit checks delayed by 3-5 days for orders above €50K', description: 'Tracked via sales order processing metrics' },
      { id: 'e3', title: 'Missing payment terms in 18% of customer master records', description: 'Customer master data audit findings' },
      { id: 'e4', title: 'Average invoice dispute resolution time: 21 days', description: 'AR dispute tracking system data' },
      { id: 'e5', title: 'Incomplete delivery notes delay invoicing by 2-4 days', description: 'Billing document creation analysis' }
    ],
    tasks: [
      {
        id: 't1',
        title: 'Implement automated 3-way invoice matching rules',
        description: 'Configure tolerance limits and matching rules in S/4HANA to reduce manual intervention from 47% to <15%',
        type: 'Process Automation',
        e2eProcess: 'Order-to-Cash'
      },
      {
        id: 't2',
        title: 'Redesign credit approval workflow for large orders',
        bullets: [
          'Define clear approval thresholds (€50K, €100K, €250K+)',
          'Implement parallel approval for orders €50-100K',
          'Establish backup approvers to reduce queue time'
        ],
        e2eProcess: 'Order-to-Cash'
      },
      {
        id: 't3',
        title: 'Execute customer master data cleansing project',
        description: 'Clean and complete payment terms, contact info, and bank details for top 200 customers (80% of revenue)',
        type: 'Data Quality Initiative',
        e2eProcess: 'Order-to-Cash'
      },
      {
        id: 't4',
        title: 'Standardize dunning procedures across all company codes',
        description: 'Define and implement consistent dunning schedules (30/60/90 days) with escalation paths',
        type: 'Process Standardization',
        e2eProcess: 'Order-to-Cash'
      },
      {
        id: 't5',
        title: 'Deploy AR dashboard for real-time DSO monitoring',
        description: 'Create executive dashboard showing DSO trends, aging buckets, and collection effectiveness by region',
        type: 'Reporting & Analytics',
        e2eProcess: 'Order-to-Cash'
      },
    ],
    assets: [
      {
        id: 'a1',
        title: 'Sales Order to Invoice Creation Process Flow',
        subtitle: 'Average cycle time: 6.2 days (industry benchmark: 3.5 days)',
        description: 'End-to-end process from order entry to billing document creation',
        type: 'Process Flow'
      },
      {
        id: 'a2',
        title: 'Invoice Dispute Root Cause Analysis',
        subtitle: 'Total disputed invoices: €4.2M (8% of monthly billings)',
        description: 'Breakdown: 42% pricing errors, 31% quantity mismatches, 27% delivery issues',
        type: 'Metric',
        isBlocker: true
      },
      {
        id: 'a3',
        title: 'Credit Check Processing Time by Order Value',
        subtitle: 'Orders >€50K: 4.3 days avg | Orders <€50K: 0.8 days avg',
        type: 'Metric'
      },
      {
        id: 'a4',
        title: 'Payment Collection Performance by Customer Segment',
        subtitle: 'Enterprise customers: 52 days DSO | SMB customers: 48 days DSO | Retail: 38 days DSO',
        type: 'Benchmark'
      },
      {
        id: 'a5',
        title: 'Opportunity: Automated Dunning Execution',
        subtitle: 'Potential DSO reduction: 8-10 days | Expected cash flow improvement: €1.2M',
        description: 'Implementing automated dunning with AI-powered prioritization',
        type: 'Improvement Opportunity'
      },
      {
        id: 'a6',
        title: 'Invoice Accuracy Rate Trend',
        subtitle: 'Jan 2026: 92% accurate | Jul 2026: 88% accurate (declining)',
        type: 'Metric',
        isBlocker: true
      },
      {
        id: 'a7',
        title: 'Customer Master Data Completeness Score',
        subtitle: 'Current score: 73/100 (target: 95/100)',
        description: 'Missing fields impacting: payment terms, bank details, dunning procedures',
        type: 'Data Quality Metric'
      },
    ],
    existingAssets: [
      { id: 'ea1', title: 'Order-to-Cash Process Model (Current State)', description: 'BPMN process model documented in Q4 2025' },
      { id: 'ea2', title: 'DSO Trend Dashboard (Tableau)', description: 'Monthly DSO tracking by region and customer segment' },
      { id: 'ea3', title: 'AR Aging Report Template', description: 'Standard 30/60/90/120+ day aging buckets' }
    ],
  }
}

// Recommendation Item Component
const RecommendationItem = ({ item, selected, onToggle, showViewButton = false }: { item: any; selected: boolean; onToggle: () => void; showViewButton?: boolean }) => (
  <FlexBox
    className={`${s['recommendation-item']} ${selected ? s['recommendation-item--selected'] : ''}`}
    alignItems={FlexBoxAlignItems.Start}
  >
    <CheckBox
      checked={selected}
      onChange={onToggle}
      className={s["recommendation-checkbox"]}
    />
    <FlexBox direction={FlexBoxDirection.Column} className={s["recommendation-item-content"]}>
      <Text className={s["recommendation-item-title"]}>{item.title}</Text>
      {item.subtitle && (
        <Text className={s["recommendation-item-subtitle"]}>{item.subtitle}</Text>
      )}
      {item.description && (
        <Text className={s["recommendation-item-description"]}>{item.description}</Text>
      )}
      {item.bullets && (
        <ul className={s["recommendation-item-bullets"]}>
          {item.bullets.map((bullet: string, idx: number) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      )}
      {item.evidence && (
        <Text className={s["recommendation-item-evidence"]}>{item.evidence}</Text>
      )}
      <FlexBox className={s["recommendation-item-chips"]} wrap={FlexBoxWrap.Wrap}>
        {item.isBlocker && <SigChipV2 value="Blocker" design="negative" leadingIcon="error" />}
        {item.type && <SigChipV2 value={item.type} />}
        {item.e2eProcess && <SigChipV2 value={`End to End Process: ${item.e2eProcess}`} />}
      </FlexBox>
    </FlexBox>
    {showViewButton && (
      <Button
        design="Transparent"
        icon="action"
        className={s["recommendation-view-btn"]}
        onClick={() => window.open('#', '_blank')}
      >
        View
      </Button>
    )}
  </FlexBox>
)

// Existing Item Component (for read-only existing tasks/assets)
const ExistingItem = ({ item }: { item: any }) => (
  <FlexBox
    direction={FlexBoxDirection.Column}
    className={s["existing-item"]}
  >
    <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween}>
      <Text className={s["existing-item-title"]}>{item.title}</Text>
      <Link className={s["view-link"]}>View</Link>
    </FlexBox>
    {item.description && (
      <Text className={s["existing-item-description"]}>{item.description}</Text>
    )}
  </FlexBox>
)

// Step 4: Select Recommendations
const Step4Recommendations = ({
  selectedSourceSystem,
  selectedE2E,
  selectedAttributes,
  setSelectedAttributes,
  selectedInsights,
  setSelectedInsights,
  selectedTasks,
  setSelectedTasks,
  selectedAssets,
  setSelectedAssets,
}: {
  selectedSourceSystem: string | null
  selectedE2E: string | null
  selectedAttributes: string[]
  setSelectedAttributes: (val: string[]) => void
  selectedInsights: string[]
  setSelectedInsights: (val: string[]) => void
  selectedTasks: string[]
  setSelectedTasks: (val: string[]) => void
  selectedAssets: string[]
  setSelectedAssets: (val: string[]) => void
}) => {
  const [activeTab, setActiveTab] = useState('attributes')
  const recommendations = getMockRecommendations(selectedSourceSystem, selectedE2E)

  const toggleItem = (id: string, selected: string[], setSelected: (ids: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const toggleSelectAll = (items: { id: string }[], selected: string[], setSelected: (ids: string[]) => void) => {
    if (selected.length === items.length) {
      setSelected([])
    } else {
      setSelected(items.map(i => i.id))
    }
  }

  return (
    <FlexBox direction={FlexBoxDirection.Column} className={`${s["page-content"]} ${s["page2-content"]}`}>
      {/* Header */}
      <FlexBox direction={FlexBoxDirection.Column} className={s["recommendations-header"]}>
        <Title level="H4">Step 2: Recommendations</Title>
      </FlexBox>

      {/* Tab Container */}
      <TabContainer
        className={s["recommendations-tabs"]}
        onTabSelect={(e) => {
          const tabName = e.detail.tab.dataset.tabName || 'attributes'
          setActiveTab(tabName)
        }}
      >
        <Tab
          text={`Attributes (${recommendations.attributes.length})`}
          selected={activeTab === 'attributes'}
          data-tab-name="attributes"
        >
          <FlexBox direction={FlexBoxDirection.Column} className={s["tab-content"]}>
            {/* Suggested Attributes Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["suggestion-section"]}>
              <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} className={s["section-header"]}>
                <Title level="H5">Suggested Attributes ({recommendations.attributes.length})</Title>
              </FlexBox>

              <MessageStrip design="Information" hideCloseButton className={s["ai-notice-strip"]}>
                Created with AI. Verify results before use.
              </MessageStrip>

              <CheckBox
                text="Select All"
                checked={selectedAttributes.length === recommendations.attributes.length}
                onChange={() => toggleSelectAll(recommendations.attributes, selectedAttributes, setSelectedAttributes)}
                className={s["select-all-checkbox"]}
              />

              <Text className={s["selected-count"]}>
                {selectedAttributes.length} selected
              </Text>

              <FlexBox direction={FlexBoxDirection.Column} className={s["recommendation-list"]}>
                {recommendations.attributes.map(item => (
                  <RecommendationItem
                    key={item.id}
                    item={item}
                    selected={selectedAttributes.includes(item.id)}
                    onToggle={() => toggleItem(item.id, selectedAttributes, setSelectedAttributes)}
                  />
                ))}
              </FlexBox>
            </FlexBox>

            {/* Existing Attributes Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["existing-section"]}>
              <Title level="H5">Existing Attributes ({recommendations.existingAttributes.length})</Title>

              <FlexBox direction={FlexBoxDirection.Column} className={s["existing-attributes-list"]}>
                {recommendations.existingAttributes.map(item => (
                  <FlexBox key={item.id} direction={FlexBoxDirection.Column} className={s["existing-attribute-item"]}>
                    <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween}>
                      <Text className={s["existing-attribute-title"]}>{item.title}</Text>
                      <Link className={s["view-link"]}>View</Link>
                    </FlexBox>
                    <Text className={s["existing-attribute-description"]}>{item.description}</Text>
                  </FlexBox>
                ))}
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </Tab>

        <Tab
          text={`Insights (${recommendations.suggestedInsights.length + recommendations.existingInsights.length})`}
          selected={activeTab === 'insights'}
          data-tab-name="insights"
        >
          <FlexBox direction={FlexBoxDirection.Column} className={s["tab-content"]}>
            {/* Suggested Insights Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["suggestion-section"]}>
              <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} className={s["section-header"]}>
                <Title level="H5">Suggested Insights ({recommendations.suggestedInsights.length})</Title>
              </FlexBox>

              <MessageStrip design="Information" hideCloseButton className={s["ai-notice-strip"]}>
                Created with AI. Verify results before use.
              </MessageStrip>

              <CheckBox
                text="Select All"
                checked={selectedInsights.length === recommendations.suggestedInsights.length}
                onChange={() => toggleSelectAll(recommendations.suggestedInsights, selectedInsights, setSelectedInsights)}
                className={s["select-all-checkbox"]}
              />

              <Text className={s["selected-count"]}>
                {selectedInsights.length} selected
              </Text>

              <FlexBox direction={FlexBoxDirection.Column} className={s["recommendation-list"]}>
                {recommendations.suggestedInsights.map(item => (
                  <RecommendationItem
                    key={item.id}
                    item={item}
                    selected={selectedInsights.includes(item.id)}
                    onToggle={() => toggleItem(item.id, selectedInsights, setSelectedInsights)}
                  />
                ))}
              </FlexBox>
            </FlexBox>

            {/* Existing Insights Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["existing-section"]}>
              <Title level="H5">Existing Insights ({recommendations.existingInsights.length})</Title>

              <FlexBox direction={FlexBoxDirection.Column} className={s["existing-attributes-list"]}>
                {recommendations.existingInsights.map(item => (
                  <FlexBox key={item.id} direction={FlexBoxDirection.Column} className={s["existing-attribute-item"]}>
                    <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween}>
                      <Text className={s["existing-attribute-title"]}>{item.title}</Text>
                      <Link className={s["view-link"]}>View</Link>
                    </FlexBox>
                    <Text className={s["existing-attribute-description"]}>{item.description}</Text>
                  </FlexBox>
                ))}
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </Tab>

        <Tab
          text={`Assets (${recommendations.assets.length})`}
          selected={activeTab === 'assets'}
          data-tab-name="assets"
        >
          <FlexBox direction={FlexBoxDirection.Column} className={s["tab-content"]}>
            {/* Suggested Assets Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["suggestion-section"]}>
              <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} className={s["section-header"]}>
                <Title level="H5">Suggested Assets ({recommendations.assets.length})</Title>
              </FlexBox>

              <MessageStrip design="Information" hideCloseButton className={s["ai-notice-strip"]}>
                Created with AI. Verify results before use.
              </MessageStrip>

              <CheckBox
                text="Select All"
                checked={selectedAssets.length === recommendations.assets.length}
                onChange={() => toggleSelectAll(recommendations.assets, selectedAssets, setSelectedAssets)}
                className={s["select-all-checkbox"]}
              />

              <Text className={s["selected-count"]}>
                {selectedAssets.length} selected
              </Text>

              <FlexBox direction={FlexBoxDirection.Column} className={s["recommendation-list"]}>
                {recommendations.assets.map(item => (
                  <RecommendationItem
                    key={item.id}
                    item={item}
                    selected={selectedAssets.includes(item.id)}
                    onToggle={() => toggleItem(item.id, selectedAssets, setSelectedAssets)}
                    showViewButton
                  />
                ))}
              </FlexBox>
            </FlexBox>

            {/* Existing Assets Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["existing-section"]}>
              <Title level="H5">Existing Assets ({recommendations.existingAssets?.length || 0})</Title>

              <FlexBox direction={FlexBoxDirection.Column} className={s["existing-items-list"]}>
                {recommendations.existingAssets?.map(item => (
                  <ExistingItem key={item.id} item={item} />
                ))}
              </FlexBox>
            </FlexBox>
          </FlexBox>
        </Tab>

        <Tab
          text={`Tasks (${recommendations.tasks.length})`}
          selected={activeTab === 'tasks'}
          data-tab-name="tasks"
        >
          <FlexBox direction={FlexBoxDirection.Column} className={s["tab-content"]}>
            {/* Suggested Tasks Section */}
            <FlexBox direction={FlexBoxDirection.Column} className={s["suggestion-section"]}>
              <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} className={s["section-header"]}>
                <Title level="H5">Suggested Tasks ({recommendations.tasks.length})</Title>
              </FlexBox>

              <MessageStrip design="Information" hideCloseButton className={s["ai-notice-strip"]}>
                Created with AI. Verify results before use.
              </MessageStrip>

              <CheckBox
                text="Select All"
                checked={selectedTasks.length === recommendations.tasks.length}
                onChange={() => toggleSelectAll(recommendations.tasks, selectedTasks, setSelectedTasks)}
                className={s["select-all-checkbox"]}
              />

              <Text className={s["selected-count"]}>
                {selectedTasks.length} selected
              </Text>

              <FlexBox direction={FlexBoxDirection.Column} className={s["recommendation-list"]}>
                {recommendations.tasks.map(item => (
                  <RecommendationItem
                    key={item.id}
                    item={item}
                    selected={selectedTasks.includes(item.id)}
                    onToggle={() => toggleItem(item.id, selectedTasks, setSelectedTasks)}
                    showViewButton
                  />
                ))}
              </FlexBox>
            </FlexBox>

          </FlexBox>
        </Tab>
      </TabContainer>
    </FlexBox>
  )
}


// Import Initiative type
import type { Initiative } from '../../../../data/ptm'

// Interface for enriched data to be applied
interface EnrichedData {
  attributes: any[]
  insights: any[]
  assets: any[]
  tasks: any[]
}

// Props interface
interface EnrichDialogAccordionProps {
  open: boolean
  onClose: () => void
  initiative: Initiative
  onApply: (enrichedData: EnrichedData) => void
}

// Main Dialog Component - Wizard Flow
const EnrichDialogAccordion = ({ open, onClose, initiative, onApply }: EnrichDialogAccordionProps) => {
  // Wizard steps: 'step1Loading' -> 'step2SelectProcess' -> 'step3GeneratingLoading' -> 'step4Recommendations'
  const [wizardStep, setWizardStep] = useState<'step1Loading' | 'step2SelectProcess' | 'step3GeneratingLoading' | 'step4Recommendations'>('step1Loading')

  // Step 2: Core Configuration state
  const [selectedSourceSystem, setSelectedSourceSystem] = useState<string | null>(null)
  const [selectedE2E, setSelectedE2E] = useState<string | null>('e1') // Default to suggested "Hire to Retire"
  const [contextInput, setContextInput] = useState<string>('')

  // Step 4: Recommendations selection state - all selected by default
  const recommendations = getMockRecommendations('', '')
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(recommendations.attributes.map(a => a.id))
  const [selectedInsights, setSelectedInsights] = useState<string[]>(recommendations.suggestedInsights.map(i => i.id))
  const [selectedTasks, setSelectedTasks] = useState<string[]>(recommendations.tasks.map(t => t.id))
  const [selectedAssets, setSelectedAssets] = useState<string[]>(recommendations.assets.map(a => a.id))

  // Initial loading when dialog opens
  useEffect(() => {
    if (open) {
      setWizardStep('step1Loading')

      const timer = setTimeout(() => {
        setWizardStep('step2SelectProcess')
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [open])

  const handleNext = () => {
    if (wizardStep === 'step2SelectProcess') {
      // Start generating recommendations
      setWizardStep('step3GeneratingLoading')
      setTimeout(() => {
        setWizardStep('step4Recommendations')
      }, 2500)
    } else if (wizardStep === 'step4Recommendations') {
      // Apply selected items
      const enrichedData: EnrichedData = {
        attributes: recommendations.attributes.filter(a => selectedAttributes.includes(a.id)),
        insights: recommendations.suggestedInsights.filter(i => selectedInsights.includes(i.id)),
        assets: recommendations.assets.filter(a => selectedAssets.includes(a.id)),
        tasks: recommendations.tasks.filter(t => selectedTasks.includes(t.id))
      }
      onApply(enrichedData)
    }
  }

  const handleBack = () => {
    if (wizardStep === 'step4Recommendations') {
      setWizardStep('step2SelectProcess')
    }
  }

  const handleClose = () => {
    // Reset all state
    setWizardStep('step1Loading')
    setSelectedSourceSystem(null)
    setSelectedE2E('e1')
    setContextInput('')
    const recs = getMockRecommendations('', '')
    setSelectedAttributes(recs.attributes.map(a => a.id))
    setSelectedInsights(recs.suggestedInsights.map(i => i.id))
    setSelectedTasks(recs.tasks.map(t => t.id))
    setSelectedAssets(recs.assets.map(a => a.id))
    onClose()
  }

  const isLoading = wizardStep === 'step1Loading' || wizardStep === 'step3GeneratingLoading'
  const canProceedFromStep2 = selectedE2E // Only E2E process is required
  const showBackButton = wizardStep === 'step4Recommendations'

  const getNextButtonText = () => {
    switch (wizardStep) {
      case 'step2SelectProcess': return 'Generate Recommendations'
      case 'step4Recommendations': return 'Apply'
      default: return 'Next'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      headerText="Enrich Initiative"
      stretch
      className="no-padding-dialog"
      footer={
        <Bar
          design="Footer"
          startContent={
            isLoading ? (
              <Link onClick={handleClose} className={s["footer-link"]}>Cancel</Link>
            ) : showBackButton ? (
              <Link onClick={handleBack} className={s["footer-link"]}>Back</Link>
            ) : null
          }
          endContent={
            isLoading ? (
              <Link onClick={handleClose} className={s["footer-link"]}>Cancel</Link>
            ) : (
              <FlexBox className={s["dialog-footer-actions"]}>
                <Button
                  design="Emphasized"
                  onClick={handleNext}
                  disabled={wizardStep === 'step2SelectProcess' && !canProceedFromStep2}
                >
                  {getNextButtonText()}
                </Button>
                <Link onClick={handleClose} className={s["footer-link"]}>Cancel</Link>
              </FlexBox>
            )
          }
        />
      }
    >
      <FlexBox direction={FlexBoxDirection.Column} className={s["dialog-content-wrapper"]}>
        {/* Step 1: Initial Loading */}
        {wizardStep === 'step1Loading' && (
          <Step1Loading counts={{
            insights: initiative.insightCount,
            assets: 0, // TVM doesn't track asset count in Initiative interface
            valueCases: initiative.valueCaseCount,
            tasks: 0, // TVM doesn't track task count in Initiative interface
          }} />
        )}

        {/* Step 2: Select E2E Process */}
        {wizardStep === 'step2SelectProcess' && (
          <Step2SelectProcess
            selectedSourceSystem={selectedSourceSystem}
            setSelectedSourceSystem={setSelectedSourceSystem}
            selectedE2E={selectedE2E}
            setSelectedE2E={setSelectedE2E}
            contextInput={contextInput}
            setContextInput={setContextInput}
            analysisExpanded={false}
            setAnalysisExpanded={() => {}}
          />
        )}

        {/* Step 3: Generating Loading */}
        {wizardStep === 'step3GeneratingLoading' && (
          <Step3GeneratingLoading
            selectedSourceSystem={selectedSourceSystem}
            selectedE2E={selectedE2E}
          />
        )}

        {/* Step 4: Select Recommendations */}
        {wizardStep === 'step4Recommendations' && (
          <Step4Recommendations
            selectedSourceSystem={selectedSourceSystem}
            selectedE2E={selectedE2E}
            selectedAttributes={selectedAttributes}
            setSelectedAttributes={setSelectedAttributes}
            selectedInsights={selectedInsights}
            setSelectedInsights={setSelectedInsights}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            selectedAssets={selectedAssets}
            setSelectedAssets={setSelectedAssets}
          />
        )}

      </FlexBox>
    </Dialog>
  )
}

export default EnrichDialogAccordion
