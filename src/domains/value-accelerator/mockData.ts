export interface AcceleratorPackage {
  id: string
  name: string
  publisher: string
  industry?: string
  lob?: string
  system?: string
  type?: string
  status: 'RELEASED' | 'DRAFT'
  publishedDate: string
}

export interface CreatedPackage {
  id: string
  name: string
  description: string
  createdDate: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  version: string
}

export const PUBLISHED_PACKAGES: AcceleratorPackage[] = [
  {
    id: 'pkg-001',
    name: 'SAP Best Practices for SAP S/4HANA Cloud',
    publisher: 'SAP',
    industry: 'Cross Industry',
    lob: 'Finance, Procurement',
    system: 'SAP S/4HANA Cloud',
    type: 'Best Practice',
    status: 'RELEASED',
    publishedDate: '2024-09-12',
  },
  {
    id: 'pkg-002',
    name: 'SAP Activate Accelerator for S/4HANA Migration',
    publisher: 'SAP',
    industry: 'Cross Industry',
    lob: 'IT',
    system: 'SAP S/4HANA',
    type: 'Methodology',
    status: 'RELEASED',
    publishedDate: '2024-07-03',
  },
  {
    id: 'pkg-003',
    name: 'Automotive Process Reference Framework',
    publisher: 'SAP',
    industry: 'Automotive',
    lob: 'Manufacturing, Supply Chain',
    system: 'SAP S/4HANA Cloud',
    type: 'Reference Model',
    status: 'RELEASED',
    publishedDate: '2024-05-20',
  },
  {
    id: 'pkg-004',
    name: 'Lead to Close – Salesforce by PwC',
    publisher: 'PricewaterhouseCoopers',
    industry: 'Cross Industry',
    lob: 'Sales',
    system: 'Salesforce',
    type: 'Best Practice',
    status: 'RELEASED',
    publishedDate: '2024-04-15',
  },
  {
    id: 'pkg-005',
    name: 'APQC Process Classification Framework',
    publisher: 'APQC',
    industry: 'Multiple Industries',
    lob: 'Operations, Finance',
    system: undefined,
    type: 'Reference Model',
    status: 'RELEASED',
    publishedDate: '2024-03-08',
  },
  {
    id: 'pkg-006',
    name: 'Financial Services Compliance Accelerator',
    publisher: 'Deloitte',
    industry: 'Financial Services',
    lob: 'Finance, Risk & Compliance',
    system: 'SAP S/4HANA Cloud',
    type: 'Best Practice',
    status: 'RELEASED',
    publishedDate: '2024-02-22',
  },
  {
    id: 'pkg-007',
    name: 'Retail & Consumer Products Process Suite',
    publisher: 'SAP',
    industry: 'Retail',
    lob: 'Sales, Supply Chain',
    system: 'SAP S/4HANA Cloud',
    type: 'Reference Model',
    status: 'RELEASED',
    publishedDate: '2023-12-11',
  },
  {
    id: 'pkg-008',
    name: 'Healthcare Process Standards Framework',
    publisher: 'SAP',
    industry: 'Healthcare',
    lob: 'Operations',
    system: 'SAP S/4HANA Cloud',
    type: 'Reference Model',
    status: 'RELEASED',
    publishedDate: '2023-11-05',
  },
]

export const CREATED_PACKAGES: CreatedPackage[] = [
  {
    id: 'cp-001',
    name: 'Procurement Excellence Package',
    description: 'Internal procurement process standardization',
    createdDate: '2024-10-01',
    status: 'SUCCESS',
    version: '1.2.0',
  },
  {
    id: 'cp-002',
    name: 'HR Onboarding Accelerator',
    description: 'Streamlined onboarding across all departments',
    createdDate: '2024-09-14',
    status: 'SUCCESS',
    version: '2.0.1',
  },
  {
    id: 'cp-003',
    name: 'Finance Close Accelerator',
    description: 'Month-end close process templates',
    createdDate: '2024-08-22',
    status: 'PENDING',
    version: '0.9.0',
  },
]

export const INDUSTRIES = ['Cross Industry', 'Automotive', 'Financial Services', 'Healthcare', 'Multiple Industries', 'Retail']
export const TYPES = ['Best Practice', 'Methodology', 'Reference Model']
export const SYSTEMS = ['SAP S/4HANA Cloud', 'SAP S/4HANA', 'Salesforce']
