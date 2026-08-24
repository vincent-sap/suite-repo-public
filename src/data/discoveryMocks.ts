// Mock data for AI-Assisted Initiative Discovery features

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessChallenge {
  id: string
  title: string
  description: string
  mainPoints: string[]
  evidence: string[]
  valueDrivers: string[]
}

export interface SuggestedInitiativeItem {
  id: string
  name: string
  description: string
}

export interface SuggestedInitiative {
  id: string
  title: string
  description: string
  type: 'BUSINESS_CHALLENGE' | 'PULSE_CHECK'
  businessChallenge?: { id: string; name: string }
  e2eProcess?: { id: string; name: string }
  lineOfBusiness?: { id: string; name: string } | null
  valueDriver?: { id: string; name: string }
  dimension?: string
  subDimension?: string
  tasks: SuggestedInitiativeItem[]
  assets: (SuggestedInitiativeItem & { url?: string; assetType?: string })[]
  insights: SuggestedInitiativeItem[]
}

export interface PulseCheckQuestion {
  id: string
  dimension: string
  text: string
  leftLabel: string
  rightLabel: string
}

// ─── Business Challenges ──────────────────────────────────────────────────────

export const BUSINESS_CHALLENGES: BusinessChallenge[] = [
  {
    id: 'bc-1',
    title: 'Improve Operational Efficiency',
    description: 'Reduce process cycle times and eliminate redundant manual steps to free up capacity for higher-value work.',
    mainPoints: [
      'High manual effort in invoice processing (avg. 4.2 touches per invoice)',
      'Duplicate work across AP and procurement teams',
      'Exception handling takes 3× longer than standard process',
    ],
    evidence: ['Process Intelligence analysis', 'Benchmarking data'],
    valueDrivers: ['Reduce Cost', 'Improve Productivity'],
  },
  {
    id: 'bc-2',
    title: 'Accelerate Cash Conversion Cycle',
    description: 'Shorten the time between outgoing cash (supplier payments) and incoming cash (customer receipts) to improve working capital.',
    mainPoints: [
      'Days Payable Outstanding 12% above industry benchmark',
      'Early payment discounts captured at only 23% of available opportunities',
      'Manual reconciliation delays closing cycle by 2 days/month',
    ],
    evidence: ['Benchmarking Analytics', 'Finance team survey'],
    valueDrivers: ['Improve Working Capital', 'Reduce Cost'],
  },
  {
    id: 'bc-3',
    title: 'Strengthen Supplier Reliability',
    description: 'Increase on-time-in-full delivery rates and reduce supply chain disruptions through better supplier performance management.',
    mainPoints: [
      'OTIF rate at 76% vs. 95% industry benchmark',
      '22% of POs have at least one delivery exception',
      'No formal SLA framework for top-20 suppliers',
    ],
    evidence: ['Process Intelligence', 'Supplier scorecard data'],
    valueDrivers: ['Improve Customer Satisfaction', 'Reduce Risk'],
  },
  {
    id: 'bc-4',
    title: 'Reduce Compliance Risk',
    description: 'Close process compliance gaps that expose the organisation to audit findings, financial penalties, and reputational damage.',
    mainPoints: [
      '18% of purchase orders created without approved requisition',
      'Segregation of duties violations detected in 7% of transactions',
      'Audit findings related to AP process up 40% year-on-year',
    ],
    evidence: ['Internal audit report', 'Process Insights'],
    valueDrivers: ['Reduce Risk', 'Improve Compliance'],
  },
  {
    id: 'bc-5',
    title: 'Scale Digital Capabilities',
    description: 'Increase automation rates and leverage intelligent technologies to handle volume growth without proportional headcount increase.',
    mainPoints: [
      'Automation rate at 41% vs. 68% best-in-class',
      'Manual data entry still required for 31% of vendor invoices',
      'OCR/AI adoption limited to pilot stage',
    ],
    evidence: ['Benchmarking Analytics', 'IT roadmap review'],
    valueDrivers: ['Reduce Cost', 'Improve Productivity', 'Enable Growth'],
  },
]

// ─── Suggested Initiatives (Business Challenges flow) ─────────────────────────

export const SUGGESTED_INITIATIVES: SuggestedInitiative[] = [
  {
    id: 'si-1',
    title: 'Automate Invoice Matching',
    description: 'Implement 3-way match automation to reduce manual invoice processing effort by 60% and eliminate duplicate payments.',
    type: 'BUSINESS_CHALLENGE',
    businessChallenge: { id: 'bc-1', name: 'Improve Operational Efficiency' },
    e2eProcess: { id: 'e2e-1', name: 'Procure to Pay' },
    lineOfBusiness: { id: 'lob-1', name: 'Finance' },
    valueDriver: { id: 'vd-1', name: 'Reduce Cost' },
    insights: [
      { id: 'si-ins-1', name: 'Invoice exception rate 3× above benchmark', description: 'Process Intelligence data shows invoice exception handling takes on average 4.2 manual steps.' },
      { id: 'si-ins-2', name: 'Duplicate payment risk identified', description: 'Analysis of AP data reveals 0.8% of invoices are paid twice due to missing duplicate-check logic.' },
    ],
    assets: [
      { id: 'si-ast-1', name: 'Invoice Matching Process Flow', description: 'BPMN model of the optimised 3-way match workflow.', url: 'https://example.com', assetType: 'PROCESS_FLOW' },
      { id: 'si-ast-2', name: 'Automation ROI Calculator', description: 'Spreadsheet to calculate expected savings from automation.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'si-tsk-1', name: 'Configure tolerance thresholds in SAP', description: 'Set price and quantity tolerance levels to reduce unnecessary mismatches.' },
      { id: 'si-tsk-2', name: 'Cleanse vendor master data', description: 'Fix records with missing IBAN or payment terms.' },
      { id: 'si-tsk-3', name: 'Pilot with top-10 vendors', description: 'Run 90-day pilot and measure exception rate reduction.' },
    ],
  },
  {
    id: 'si-2',
    title: 'Establish Early Payment Discount Programme',
    description: 'Capture early payment discount opportunities with top-20 suppliers to reduce net financing costs by €2M annually.',
    type: 'BUSINESS_CHALLENGE',
    businessChallenge: { id: 'bc-2', name: 'Accelerate Cash Conversion Cycle' },
    e2eProcess: { id: 'e2e-1', name: 'Procure to Pay' },
    lineOfBusiness: { id: 'lob-1', name: 'Finance' },
    valueDriver: { id: 'vd-2', name: 'Improve Working Capital' },
    insights: [
      { id: 'si-ins-3', name: 'Only 23% of discount opportunities captured', description: 'Benchmarking shows peers capture 61% of early payment discounts on average.' },
    ],
    assets: [
      { id: 'si-ast-3', name: 'Dynamic Discounting Framework', description: 'Policy document for supplier discount programme.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'si-tsk-4', name: 'Identify top-20 discount candidates', description: 'Rank suppliers by spend volume and current payment terms.' },
      { id: 'si-tsk-5', name: 'Negotiate discount terms', description: 'Engage procurement and finance to align on discount rate thresholds.' },
    ],
  },
  {
    id: 'si-3',
    title: 'Implement Supplier SLA Framework',
    description: 'Define and enforce SLA-based incentive and penalty structures to drive OTIF rates above 93% within 12 months.',
    type: 'BUSINESS_CHALLENGE',
    businessChallenge: { id: 'bc-3', name: 'Strengthen Supplier Reliability' },
    e2eProcess: { id: 'e2e-2', name: 'Source to Pay' },
    lineOfBusiness: { id: 'lob-2', name: 'Procurement' },
    valueDriver: { id: 'vd-3', name: 'Improve Customer Satisfaction' },
    insights: [
      { id: 'si-ins-4', name: 'OTIF at 76% vs. 95% benchmark', description: '19-point gap vs. industry best practice across all supplier tiers.' },
      { id: 'si-ins-5', name: '22% of POs have delivery exceptions', description: 'Root cause: no formal SLA enforcement mechanism.' },
    ],
    assets: [
      { id: 'si-ast-4', name: 'SLA Contract Template', description: 'Legal-approved template for supplier SLA clauses.', assetType: 'DOCUMENT' },
      { id: 'si-ast-5', name: 'Supplier Performance Dashboard', description: 'Real-time KPI tracking for top-20 suppliers.', url: 'https://example.com', assetType: 'BLOCKER' },
    ],
    tasks: [
      { id: 'si-tsk-6', name: 'Define KPI thresholds', description: 'Agree OTIF, lead time, and quality metrics with procurement leadership.' },
      { id: 'si-tsk-7', name: 'Pilot with 5 suppliers', description: 'Select pilot group and communicate new programme terms.' },
    ],
  },
  {
    id: 'si-4',
    title: 'Close Segregation of Duties Gaps',
    description: 'Remediate SOD violations in the procure-to-pay process to reduce audit risk and ensure compliance with internal controls framework.',
    type: 'BUSINESS_CHALLENGE',
    businessChallenge: { id: 'bc-4', name: 'Reduce Compliance Risk' },
    e2eProcess: { id: 'e2e-1', name: 'Procure to Pay' },
    lineOfBusiness: null,
    valueDriver: { id: 'vd-4', name: 'Reduce Risk' },
    insights: [
      { id: 'si-ins-6', name: 'SOD violations in 7% of transactions', description: 'Same user creating and approving POs detected in 3 business units.' },
    ],
    assets: [],
    tasks: [
      { id: 'si-tsk-8', name: 'Map all SOD-critical role combinations', description: 'Work with security team to enumerate conflicting role pairs.' },
      { id: 'si-tsk-9', name: 'Implement compensating controls', description: 'Add approval workflow step for high-risk combinations.' },
    ],
  },
  {
    id: 'si-5',
    title: 'Deploy AI-Powered OCR for Vendor Invoices',
    description: 'Increase automation rate from 41% to 75% by deploying intelligent OCR and machine learning for invoice data extraction.',
    type: 'BUSINESS_CHALLENGE',
    businessChallenge: { id: 'bc-5', name: 'Scale Digital Capabilities' },
    e2eProcess: { id: 'e2e-1', name: 'Procure to Pay' },
    lineOfBusiness: { id: 'lob-1', name: 'Finance' },
    valueDriver: { id: 'vd-1', name: 'Reduce Cost' },
    insights: [
      { id: 'si-ins-7', name: 'Automation rate 27pp below best-in-class', description: 'Benchmarking shows top performers at 68% automation; current state is 41%.' },
    ],
    assets: [
      { id: 'si-ast-6', name: 'OCR Vendor Evaluation Matrix', description: 'Comparison of 4 OCR/AI vendors on accuracy, cost and integration effort.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'si-tsk-10', name: 'Run OCR vendor proof of concept', description: '60-day PoC with shortlisted vendor using live invoice data.' },
      { id: 'si-tsk-11', name: 'Define training data requirements', description: 'Identify invoice types and formats requiring model training.' },
    ],
  },
]

// ─── PulseCheck Initiatives ───────────────────────────────────────────────────

export const PULSECHECK_INITIATIVES: SuggestedInitiative[] = [
  {
    id: 'pc-1',
    title: 'Establish Process Performance Baseline',
    description: 'Define and measure key process KPIs to create a data-driven foundation for continuous improvement.',
    type: 'PULSE_CHECK',
    dimension: 'Value Practice',
    subDimension: 'Performance Measurement',
    insights: [
      { id: 'pc-ins-1', name: 'No agreed KPI baseline across business units', description: 'Teams report different metrics making cross-unit comparison impossible.' },
    ],
    assets: [
      { id: 'pc-ast-1', name: 'KPI Definition Template', description: 'Standardised template for defining process KPIs.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'pc-tsk-1', name: 'Agree on top-10 process KPIs', description: 'Workshop with process owners to align on KPI definitions and targets.' },
      { id: 'pc-tsk-2', name: 'Set up KPI dashboard', description: 'Connect KPIs to live data sources and publish shared dashboard.' },
    ],
  },
  {
    id: 'pc-2',
    title: 'Build Process Ownership Model',
    description: 'Establish clear end-to-end process ownership to drive accountability and enable faster decision-making.',
    type: 'PULSE_CHECK',
    dimension: 'Value Practice',
    subDimension: 'Governance',
    insights: [
      { id: 'pc-ins-2', name: 'Process ownership unclear in 60% of core processes', description: 'Survey results show ambiguity in who owns cross-functional processes.' },
    ],
    assets: [],
    tasks: [
      { id: 'pc-tsk-3', name: 'Map processes to owners', description: 'Create RACI matrix for all tier-1 processes.' },
      { id: 'pc-tsk-4', name: 'Define owner responsibilities', description: 'Document what process owners are accountable for.' },
    ],
  },
  {
    id: 'pc-3',
    title: 'Launch Process Excellence Training Programme',
    description: 'Upskill teams in process analysis, improvement methodology, and SAP Signavio tooling to scale capability.',
    type: 'PULSE_CHECK',
    dimension: 'Set-Up & Competencies',
    subDimension: 'Skills & Training',
    insights: [
      { id: 'pc-ins-3', name: 'Only 15% of process analysts are certified', description: 'Low certification rate limiting depth of process analysis across the organisation.' },
    ],
    assets: [
      { id: 'pc-ast-2', name: 'Learning Path Catalogue', description: 'Curated training paths for process analyst roles.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'pc-tsk-5', name: 'Identify skill gaps per role', description: 'Run skills assessment across process community.' },
      { id: 'pc-tsk-6', name: 'Enrol analysts in SAP Signavio certification', description: 'Target 60% certification rate within 12 months.' },
    ],
  },
  {
    id: 'pc-4',
    title: 'Implement Continuous Improvement Cycle',
    description: 'Establish a structured cadence for reviewing process performance and prioritising improvements.',
    type: 'PULSE_CHECK',
    dimension: 'Set-Up & Competencies',
    subDimension: 'Improvement Cadence',
    insights: [
      { id: 'pc-ins-4', name: 'No formal improvement review cycle in place', description: 'Process issues are addressed reactively rather than proactively.' },
    ],
    assets: [],
    tasks: [
      { id: 'pc-tsk-7', name: 'Define improvement sprint cadence', description: 'Agree on quarterly improvement sprint rhythm with leadership.' },
      { id: 'pc-tsk-8', name: 'Set up backlog management', description: 'Create shared backlog for improvement ideas and prioritisation criteria.' },
    ],
  },
  {
    id: 'pc-5',
    title: 'Connect Process Data to Business Outcomes',
    description: 'Link process performance metrics to financial and operational business outcomes to demonstrate value.',
    type: 'PULSE_CHECK',
    dimension: 'Business Steering',
    subDimension: 'Value Realisation',
    insights: [
      { id: 'pc-ins-5', name: 'Process improvements not linked to P&L impact', description: 'Leadership cannot quantify the business value of process initiatives.' },
    ],
    assets: [
      { id: 'pc-ast-3', name: 'Value Case Methodology Guide', description: 'Step-by-step guide to quantifying process improvement value.', assetType: 'DOCUMENT' },
    ],
    tasks: [
      { id: 'pc-tsk-9', name: 'Define value case template', description: 'Create standard template linking process KPIs to financial metrics.' },
      { id: 'pc-tsk-10', name: 'Pilot with 2 initiatives', description: 'Run value case calculation for two active initiatives.' },
    ],
  },
  {
    id: 'pc-6',
    title: 'Align Process Strategy with Corporate Goals',
    description: 'Ensure process transformation investments are directly tied to corporate strategy and OKRs.',
    type: 'PULSE_CHECK',
    dimension: 'Business Steering',
    subDimension: 'Strategic Alignment',
    insights: [
      { id: 'pc-ins-6', name: 'Process roadmap not reviewed by C-suite', description: 'Only 30% of organisations report exec-level sponsorship of process programmes.' },
    ],
    assets: [],
    tasks: [
      { id: 'pc-tsk-11', name: 'Map initiatives to corporate OKRs', description: 'Create traceability matrix from process initiatives to company objectives.' },
      { id: 'pc-tsk-12', name: 'Establish exec steering committee', description: 'Set up quarterly steering committee with CFO/COO sponsorship.' },
    ],
  },
]

// ─── PulseCheck Questions ─────────────────────────────────────────────────────

export const PULSECHECK_QUESTIONS: PulseCheckQuestion[] = [
  {
    id: 'q-1',
    dimension: 'Value Practice',
    text: 'How consistently does your organisation measure and review process performance metrics?',
    leftLabel: 'Ad-hoc / not at all',
    rightLabel: 'Systematically across all processes',
  },
  {
    id: 'q-2',
    dimension: 'Value Practice',
    text: 'To what extent are process improvement decisions driven by data rather than intuition?',
    leftLabel: 'Mostly intuition',
    rightLabel: 'Fully data-driven',
  },
  {
    id: 'q-3',
    dimension: 'Set-Up & Competencies',
    text: 'How mature are the process analysis skills and tooling capabilities within your team?',
    leftLabel: 'Basic / early stage',
    rightLabel: 'Advanced / industry-leading',
  },
  {
    id: 'q-4',
    dimension: 'Set-Up & Competencies',
    text: 'How effectively does your organisation manage a continuous improvement backlog?',
    leftLabel: 'No formal process',
    rightLabel: 'Structured backlog with clear prioritisation',
  },
  {
    id: 'q-5',
    dimension: 'Business Steering',
    text: 'How well are your process transformation investments connected to measurable business outcomes?',
    leftLabel: 'Not connected',
    rightLabel: 'Fully connected with tracked ROI',
  },
]
