import type { ProcessElement, ProcessHierarchy } from './types'

export type BusinessFunction = { id: string; name: string }

export const BUSINESS_FUNCTIONS: BusinessFunction[] = [
  { id: 'fn-rd',    name: 'R&D' },
  { id: 'fn-mkt',   name: 'Marketing' },
  { id: 'fn-sales', name: 'Sales' },
  { id: 'fn-proc',  name: 'Procurement' },
  { id: 'fn-scm',   name: 'Supply Chain' },
  { id: 'fn-prod',  name: 'Production' },
  { id: 'fn-fin',   name: 'Finance & Controlling' },
  { id: 'fn-hr',    name: 'Human Resources' },
]

export const HIERARCHIES: ProcessHierarchy[] = [
  { id: 'e2e', name: 'Acme End-to-End Processes', description: 'Cross-functional process flows from trigger to outcome.' },
]

// ── E2E Process Hierarchy ──────────────────────────────────────────────────────
// L1 = End-to-End process (line)
// L2 = Value Chain / Process Group (stop on the line)
// L3 = Process (stop shown when L2 is expanded)
//
// Shared L3 nodes appear in two lines simultaneously, connected by an interchange
// edge. Their allHierarchyIds array lists the position chip for each context.

export const E2E_ELEMENTS: ProcessElement[] = [

  // ── Source to Pay (S2P) ────────────────────────────────────────────────────
  {
    id: 'e2e-s2p', hierarchyId: '1.0', name: 'Source to Pay', level: 1,
    description: 'End-to-end flow from supplier selection through invoice payment.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 28, childCount: 5,
  },

  // S2P Value Chains (L2)
  {
    id: 's2p-vc1', hierarchyId: '1.1', name: 'Strategic Sourcing', level: 2,
    description: 'Identify, evaluate, and contract with strategic suppliers.',
    parentId: 'e2e-s2p', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 9, childCount: 3,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-vc2', hierarchyId: '1.2', name: 'Operational Procurement', level: 2,
    description: 'Execute day-to-day purchasing from requisition to goods receipt.',
    parentId: 'e2e-s2p', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 11, childCount: 3,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-vc4', hierarchyId: '1.3', name: 'Supplier Performance Management', level: 2,
    description: 'Monitor, evaluate, and continuously develop the supplier base.',
    parentId: 'e2e-s2p', processType: 'Operating', status: 'Active', ownerId: '14', assetCount: 7, childCount: 3,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-vc5', hierarchyId: '1.4', name: 'Contract Management', level: 2,
    description: 'Draft, execute, and monitor supplier contracts through their lifecycle.',
    parentId: 'e2e-s2p', processType: 'Operating', status: 'Active', ownerId: '15', assetCount: 6, childCount: 3,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-vc3', hierarchyId: '1.5', name: 'Accounts Payable', level: 2,
    description: 'Process supplier invoices through payment and ledger reconciliation.',
    parentId: 'e2e-s2p', processType: 'Operating', status: 'Active', ownerId: '4', assetCount: 8, childCount: 3,
    functionId: 'fn-fin',
  },

  // S2P-1 Processes (L3)
  {
    id: 's2p-1-1', hierarchyId: '1.1.1', name: 'Define Category Strategy', level: 3,
    description: 'Analyse spend and market data to define sourcing strategies per category.',
    parentId: 's2p-vc1', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-1-2', hierarchyId: '1.1.2', name: 'Identify and Qualify Suppliers', level: 3,
    description: 'Research the supply market, issue RFx documents, and evaluate bids.',
    parentId: 's2p-vc1', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 4, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-1-3', hierarchyId: '1.1.3', name: 'Negotiate and Award Contract', level: 3,
    description: 'Negotiate terms, select preferred supplier, and execute a binding contract.',
    parentId: 's2p-vc1', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 2, childCount: 0,
    functionId: 'fn-proc',
    variants: [
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Négocier et Attribuer le Contrat', description: 'Negotiate and award supplier contracts in compliance with Loi Sapin II anti-corruption obligations and mandatory French transparency registry steps.' },
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Vertragsverhandlung und -vergabe', description: 'Execute contract negotiations with full GWB-compliant tender documentation and mandatory award notice publication for above-threshold values.' },
      { scope: { 'ctx-2': 'Brasil' }, deviation: 'changed', description: 'Negotiate and award contracts with notarised signatures, CNPJ verification, and registration in the government supplier portal (SICAF) before execution.' },
      { scope: { 'ctx-1': 'Coffee' }, deviation: 'changed', name: 'Negotiate and Award Green Coffee Contract', description: 'Negotiate multi-crop-year forward contracts with origin farmers or exporters; contract terms must include quality floor specifications, certification clause (Rainforest Alliance/Fairtrade), and price risk hedging references.' },
      { scope: { 'ctx-1': 'Dairy' }, deviation: 'changed', name: 'Negotiate and Award Dairy Supply Contract', description: 'Award contracts include seasonal volume bands, raw milk price formulas tied to market indices, and mandatory quality and welfare audit rights.' },
      { scope: { 'ctx-1': 'Coffee', 'ctx-2': 'France' }, deviation: 'changed', name: 'Négocier le Contrat Café – Marché France', description: 'Combines Loi Sapin II transparency obligations with Rainforest Alliance chain-of-custody clauses; contract must reference French customs origin declarations for specialty coffee import.' },
    ],
  },

  // S2P-2 Processes (L3)
  {
    id: 's2p-2-1', hierarchyId: '1.2.1', name: 'Create Purchase Requisition', level: 3,
    description: 'Capture internal demand and create a purchase requisition for approval.',
    parentId: 's2p-vc2', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 4, childCount: 0,
    functionId: 'fn-proc',
    variants: [
      { scope: { 'ctx-1': 'Coffee' }, deviation: 'changed', name: 'Create Green Coffee Purchase Requisition', description: 'Capture demand for green coffee with mandatory sustainability certification fields (Rainforest Alliance, UTZ, or Fairtrade) and origin traceability codes before approval routing.' },
      { scope: { 'ctx-1': 'Dairy' }, deviation: 'changed', name: 'Create Dairy Ingredient Purchase Requisition', description: 'Include cold-chain logistics requirements, fat/protein specification tolerances, and veterinary compliance declarations in the requisition before forwarding to procurement.' },
      { scope: { 'ctx-1': 'Health & Beauty' }, deviation: 'changed', description: 'Requisitions for active cosmetic or pharmaceutical ingredients must include INCI name, safety data sheet reference, and regulatory classification before approval.' },
      { scope: { 'ctx-1': 'Coffee', 'ctx-2': 'Brasil' }, deviation: 'changed', name: 'Criar Requisição de Compra – Café (BR)', description: 'Direct-trade sourcing from Brazilian fazendas requires MAPA (Ministry of Agriculture) registration of the farm, IPI tax classification, and Rainforest Alliance lot code on the requisition.' },
    ],
  },
  {
    id: 's2p-2-2', hierarchyId: '1.2.2', name: 'Issue Purchase Order', level: 3,
    description: 'Convert approved requisitions into purchase orders and transmit to supplier.',
    parentId: 's2p-vc2', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 5, childCount: 0,
    functionId: 'fn-proc',
  },
  // shared-goods-receipt is PRIMARY in S2P-2 (S2P-2.3) and SECONDARY in F2S-3 (F2S-3.3)
  {
    id: 'shared-goods-receipt', hierarchyId: '1.2.3', name: 'Receive and Inspect Goods', level: 3,
    description: 'Accept delivery, verify quantities and quality against the purchase order, and post goods receipt.',
    parentId: 's2p-vc2', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 6, childCount: 0,
    functionId: 'fn-scm',
    referencedParentIds: ['f2s-vc3'],
    allHierarchyIds: ['1.2.3', '3.5.3'],
  },

  // S2P-4 Processes (L3)
  {
    id: 's2p-4-1', hierarchyId: '1.3.1', name: 'Evaluate Supplier Performance', level: 3,
    description: 'Score suppliers against KPIs covering quality, delivery, cost, and service levels.',
    parentId: 's2p-vc4', processType: 'Operating', status: 'Active', ownerId: '14', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-4-2', hierarchyId: '1.3.2', name: 'Manage Supplier Risk and Compliance', level: 3,
    description: 'Identify and mitigate supplier risks including financial, geopolitical, and ESG factors.',
    parentId: 's2p-vc4', processType: 'Operating', status: 'Active', ownerId: '14', assetCount: 4, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-4-3', hierarchyId: '1.3.3', name: 'Drive Supplier Development Programs', level: 3,
    description: 'Co-invest in capability building and innovation initiatives with strategic suppliers.',
    parentId: 's2p-vc4', processType: 'Operating', status: 'Active', ownerId: '14', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },

  // S2P-5 Processes (L3)
  {
    id: 's2p-5-1', hierarchyId: '1.4.1', name: 'Draft and Negotiate Contract Terms', level: 3,
    description: 'Prepare contract drafts, align on commercial terms, and obtain legal review.',
    parentId: 's2p-vc5', processType: 'Operating', status: 'Active', ownerId: '15', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-5-2', hierarchyId: '1.4.2', name: 'Execute and Repository Contract', level: 3,
    description: 'Obtain signatures, store the executed contract, and activate in the system.',
    parentId: 's2p-vc5', processType: 'Operating', status: 'Active', ownerId: '15', assetCount: 2, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 's2p-5-3', hierarchyId: '1.4.3', name: 'Monitor Contract Obligations and Renewals', level: 3,
    description: 'Track delivery against contractual commitments and manage renewal or renegotiation.',
    parentId: 's2p-vc5', processType: 'Operating', status: 'Active', ownerId: '15', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },

  // S2P-3 Processes (L3)
  {
    id: 's2p-3-1', hierarchyId: '1.5.1', name: 'Match and Validate Supplier Invoice', level: 3,
    description: 'Three-way match invoice against PO and goods receipt; resolve discrepancies.',
    parentId: 's2p-vc3', processType: 'Operating', status: 'Active', ownerId: '4', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 's2p-3-2', hierarchyId: '1.5.2', name: 'Approve and Release Payment', level: 3,
    description: 'Authorise payment run and transfer funds to the supplier.',
    parentId: 's2p-vc3', processType: 'Operating', status: 'Active', ownerId: '4', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  // shared-gl-reconcile is PRIMARY in S2P-3 (S2P-3.3) and SECONDARY in O2C-3 (O2C-3.3)
  {
    id: 'shared-gl-reconcile', hierarchyId: '1.5.3', name: 'Reconcile and Post Sub-ledger', level: 3,
    description: 'Reconcile AP and AR sub-ledger balances and post clearing entries to the general ledger.',
    parentId: 's2p-vc3', processType: 'Operating', status: 'Active', ownerId: '4', assetCount: 4, childCount: 0,
    functionId: 'fn-fin',
    referencedParentIds: ['o2c-vc3'],
    allHierarchyIds: ['1.5.3', '2.5.3'],
  },

  // ── Order to Cash (O2C) ────────────────────────────────────────────────────
  {
    id: 'e2e-o2c', hierarchyId: '2.0', name: 'Order to Cash', level: 1,
    description: 'End-to-end flow from customer order receipt through cash collection.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 24, childCount: 5,
  },

  // O2C Value Chains (L2)
  {
    id: 'o2c-vc4', hierarchyId: '2.1', name: 'Customer and Pricing Management', level: 2,
    description: 'Maintain customer master data, pricing conditions, and credit limits.',
    parentId: 'e2e-o2c', processType: 'Operating', status: 'Active', ownerId: '16', assetCount: 6, childCount: 3,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-vc1', hierarchyId: '2.2', name: 'Order Management', level: 2,
    description: 'Receive, validate, and confirm customer orders.',
    parentId: 'e2e-o2c', processType: 'Operating', status: 'Active', ownerId: '5', assetCount: 7, childCount: 3,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-vc2', hierarchyId: '2.3', name: 'Fulfillment and Shipping', level: 2,
    description: 'Plan, pick, pack, and ship orders to the customer.',
    parentId: 'e2e-o2c', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 9, childCount: 3,
    functionId: 'fn-scm',
  },
  {
    id: 'o2c-vc5', hierarchyId: '2.4', name: 'Returns and Complaints', level: 2,
    description: 'Handle customer returns, issue credit memos, and restock returned goods.',
    parentId: 'e2e-o2c', processType: 'Operating', status: 'Active', ownerId: '17', assetCount: 5, childCount: 3,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-vc3', hierarchyId: '2.5', name: 'Billing and Collections', level: 2,
    description: 'Invoice the customer, collect payment, and close the transaction.',
    parentId: 'e2e-o2c', processType: 'Operating', status: 'Active', ownerId: '7', assetCount: 8, childCount: 3,
    functionId: 'fn-fin',
  },

  // O2C-4 Processes (L3)
  {
    id: 'o2c-4-1', hierarchyId: '2.1.1', name: 'Maintain Customer Master Data', level: 3,
    description: 'Create and update customer records including contact, delivery, and payment data.',
    parentId: 'o2c-vc4', processType: 'Operating', status: 'Active', ownerId: '16', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-4-2', hierarchyId: '2.1.2', name: 'Maintain Pricing and Discount Structures', level: 3,
    description: 'Configure price lists, volume discounts, and promotional pricing conditions.',
    parentId: 'o2c-vc4', processType: 'Operating', status: 'Active', ownerId: '16', assetCount: 3, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-4-3', hierarchyId: '2.1.3', name: 'Set and Review Customer Credit Limits', level: 3,
    description: 'Evaluate customer creditworthiness and set or adjust credit exposure limits.',
    parentId: 'o2c-vc4', processType: 'Operating', status: 'Active', ownerId: '16', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // O2C-1 Processes (L3)
  {
    id: 'o2c-1-1', hierarchyId: '2.2.1', name: 'Create and Validate Sales Order', level: 3,
    description: 'Enter the sales order, validate pricing and availability, and check for duplicates.',
    parentId: 'o2c-vc1', processType: 'Operating', status: 'Active', ownerId: '5', assetCount: 3, childCount: 0,
    functionId: 'fn-sales',
    variants: [
      { scope: { 'ctx-1': 'Snacks' }, deviation: 'changed', name: 'Create and Validate Snacks Sales Order', description: 'Order validation includes automated allergen cross-check (EU Regulation 1169/2011) against the product master; orders for retail customers require Nutri-Score classification on the order confirmation.' },
      { scope: { 'ctx-1': 'Health & Beauty' }, deviation: 'changed', name: 'Create and Validate Health & Beauty Sales Order', description: 'Validate customer authorisation level (pharmacy, professional, retail); controlled ingredients trigger mandatory regulatory approval check before order confirmation.' },
      { scope: { 'ctx-2': 'China' }, deviation: 'changed', description: 'Cross-border e-commerce (CBEC) orders require real-name verification, CIMS customs declaration linkage, and Single Window order reference before confirmation.' },
      { scope: { 'ctx-2': 'Japan' }, deviation: 'changed', description: 'Sales orders must reference the customer\'s JAN code, include Japanese product label data fields, and be transmitted via EDI in JIS X 0505 format to key retailers.' },
      { scope: { 'ctx-1': 'Beverages', 'ctx-2': 'France' }, deviation: 'changed', name: 'Créer la Commande Boissons – France', description: 'Orders for sugar-sweetened or sweetened beverages must flag applicable taxe soda levy amounts per SKU and include Nutriscore product classification to meet French retailer EDI requirements.' },
    ],
  },
  {
    id: 'o2c-1-2', hierarchyId: '2.2.2', name: 'Check Credit and Availability', level: 3,
    description: 'Perform credit limit check and confirm stock availability for the order.',
    parentId: 'o2c-vc1', processType: 'Operating', status: 'Active', ownerId: '5', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-1-3', hierarchyId: '2.2.3', name: 'Confirm Order to Customer', level: 3,
    description: 'Send order acknowledgement and promised delivery date to the customer.',
    parentId: 'o2c-vc1', processType: 'Operating', status: 'Active', ownerId: '5', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },

  // O2C-2 Processes (L3) — shared-quality-check is SECONDARY here (F2S-2.3 primary)
  {
    id: 'o2c-2-1', hierarchyId: '2.3.1', name: 'Plan Outbound Delivery', level: 3,
    description: 'Create delivery document, assign transport resources, and schedule pick-up.',
    parentId: 'o2c-vc2', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 3, childCount: 0,
    functionId: 'fn-scm',
  },
  {
    id: 'o2c-2-2', hierarchyId: '2.3.2', name: 'Pick, Pack and Ship', level: 3,
    description: 'Execute warehouse picking, pack goods, and hand over to the carrier.',
    parentId: 'o2c-vc2', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 4, childCount: 0,
    functionId: 'fn-scm',
  },
  // shared-quality-check (primary F2S-2.3) also appears here as O2C-2.3

  // O2C-5 Processes (L3)
  {
    id: 'o2c-5-1', hierarchyId: '2.4.1', name: 'Capture and Validate Return Request', level: 3,
    description: 'Register customer return, validate eligibility, and create return material authorisation.',
    parentId: 'o2c-vc5', processType: 'Operating', status: 'Active', ownerId: '17', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'o2c-5-2', hierarchyId: '2.4.2', name: 'Process Customer Credit Memo', level: 3,
    description: 'Issue credit memo for approved returns or billing disputes and post to AR.',
    parentId: 'o2c-vc5', processType: 'Operating', status: 'Active', ownerId: '17', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'o2c-5-3', hierarchyId: '2.4.3', name: 'Restock and Disposition Returned Goods', level: 3,
    description: 'Inspect returned items, decide on restocking or disposal, and update inventory.',
    parentId: 'o2c-vc5', processType: 'Operating', status: 'Active', ownerId: '17', assetCount: 2, childCount: 0,
    functionId: 'fn-scm',
  },

  // O2C-3 Processes (L3) — shared-gl-reconcile is SECONDARY here (S2P-3.3 primary)
  {
    id: 'o2c-3-1', hierarchyId: '2.5.1', name: 'Generate Customer Invoice', level: 3,
    description: 'Create and issue a customer invoice based on the confirmed delivery.',
    parentId: 'o2c-vc3', processType: 'Operating', status: 'Active', ownerId: '7', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
    variants: [
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Émettre la Facture Client', description: 'Issue customer invoices through the Chorus Pro e-invoicing platform, mandatory for all B2G transactions and progressively required for B2B under the French e-invoicing reform.' },
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Kundenrechnung erstellen', description: 'Generate invoices in ZUGFeRD or XRechnung format as required by German e-invoicing legislation; public-sector recipients require XRechnung submission via PEPPOL.' },
      { scope: { 'ctx-2': 'Brasil' }, deviation: 'changed', name: 'Emitir Nota Fiscal Eletrônica', description: 'Issue NF-e (Nota Fiscal Eletrônica) via SEFAZ authorisation before goods leave the warehouse. Cancellation and correction follow specific legal windows.' },
      { scope: { 'ctx-2': 'Japan' }, deviation: 'changed', description: 'Issue invoices conforming to the Qualified Invoice System (Inboisu Seido) with registered vendor number, aligned to JIS X 0505 EDI format requirements.' },
      { scope: { 'ctx-1': 'Dairy' }, deviation: 'changed', name: 'Generate Dairy Customer Invoice', description: 'Invoice must include batch number, best-before date, fat and protein percentage, and cold-chain handling surcharge line items as required by EU Dairy Regulation and key retail customer EDI specs.' },
      { scope: { 'ctx-1': 'Beverages', 'ctx-2': 'France' }, deviation: 'changed', name: 'Facturation Boissons – France', description: 'Invoice lines for sugar-sweetened beverages must itemise the taxe soda levy amount separately as a legally required line item; Chorus Pro submission rules apply for public-sector customers.' },
      { scope: { 'ctx-1': 'Health & Beauty', 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Kundenrechnung Health & Beauty (DE)', description: 'Invoices for cosmetics and OTC products must reference the INCI declaration and, where applicable, the BfArM registration number; XRechnung format required for pharmacy chain EDI.' },
    ],
  },
  {
    id: 'o2c-3-2', hierarchyId: '2.5.2', name: 'Collect and Apply Cash', level: 3,
    description: 'Monitor incoming payments and apply cash against open receivables.',
    parentId: 'o2c-vc3', processType: 'Operating', status: 'Active', ownerId: '7', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  // shared-gl-reconcile (primary S2P-3.3) also appears here as O2C-3.3

  // ── Forecast to Stock (F2S) ────────────────────────────────────────────────
  {
    id: 'e2e-f2s', hierarchyId: '3.0', name: 'Forecast to Stock', level: 1,
    description: 'End-to-end flow from demand forecasting through finished goods in warehouse.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 22, childCount: 5,
  },

  // F2S Value Chains (L2)
  {
    id: 'f2s-vc1', hierarchyId: '3.1', name: 'Demand and Supply Planning', level: 2,
    description: 'Translate forecast signals into a balanced production and procurement plan.',
    parentId: 'e2e-f2s', processType: 'Operating', status: 'Active', ownerId: '8', assetCount: 8, childCount: 3,
    functionId: 'fn-scm',
  },
  {
    id: 'f2s-vc2', hierarchyId: '3.2', name: 'Production Execution', level: 2,
    description: 'Release production orders, manufacture, and quality-inspect finished goods.',
    parentId: 'e2e-f2s', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 10, childCount: 3,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-vc4', hierarchyId: '3.3', name: 'Quality Management', level: 2,
    description: 'Define quality standards, manage non-conformances, and ensure regulatory compliance.',
    parentId: 'e2e-f2s', processType: 'Operating', status: 'Active', ownerId: '18', assetCount: 7, childCount: 3,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-vc5', hierarchyId: '3.4', name: 'Material and BOM Management', level: 2,
    description: 'Maintain material master data, bills of materials, and production routings.',
    parentId: 'e2e-f2s', processType: 'Operating', status: 'Active', ownerId: '19', assetCount: 6, childCount: 3,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-vc3', hierarchyId: '3.5', name: 'Logistics and Warehousing', level: 2,
    description: 'Store stock, manage inventory movements, and process outbound shipments.',
    parentId: 'e2e-f2s', processType: 'Operating', status: 'Active', ownerId: '10', assetCount: 7, childCount: 3,
    functionId: 'fn-scm',
  },

  // F2S-1 Processes (L3)
  {
    id: 'f2s-1-1', hierarchyId: '3.1.1', name: 'Forecast Customer Demand', level: 3,
    description: 'Collect sales history and market signals to generate a statistical demand forecast.',
    parentId: 'f2s-vc1', processType: 'Operating', status: 'Active', ownerId: '8', assetCount: 3, childCount: 0,
    functionId: 'fn-scm',
  },
  {
    id: 'f2s-1-2', hierarchyId: '3.1.2', name: 'Create Production Plan', level: 3,
    description: 'Convert net demand into a feasible production schedule aligned to capacity.',
    parentId: 'f2s-vc1', processType: 'Operating', status: 'Active', ownerId: '8', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-1-3', hierarchyId: '3.1.3', name: 'Allocate Capacity and Materials', level: 3,
    description: 'Reserve machine capacity and confirm material availability for the plan.',
    parentId: 'f2s-vc1', processType: 'Operating', status: 'Active', ownerId: '8', assetCount: 2, childCount: 0,
    functionId: 'fn-prod',
  },

  // F2S-2 Processes (L3)
  {
    id: 'f2s-2-1', hierarchyId: '3.2.1', name: 'Create and Release Production Order', level: 3,
    description: 'Generate and release the production order with BOM and routing information.',
    parentId: 'f2s-vc2', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 4, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-2-2', hierarchyId: '3.2.2', name: 'Execute Manufacturing Operations', level: 3,
    description: 'Carry out all production steps, confirm activities, and record actual consumption.',
    parentId: 'f2s-vc2', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 5, childCount: 0,
    functionId: 'fn-prod',
  },
  // shared-quality-check is PRIMARY in F2S-2 (F2S-2.3) and SECONDARY in O2C-2 (O2C-2.3)
  {
    id: 'shared-quality-check', hierarchyId: '3.2.3', name: 'Perform Quality Inspection', level: 3,
    description: 'Inspect finished goods or shipment against quality specifications and record results.',
    parentId: 'f2s-vc2', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 5, childCount: 0,
    functionId: 'fn-prod',
    referencedParentIds: ['o2c-vc2'],
    allHierarchyIds: ['3.2.3', '2.3.3'],
  },

  // F2S-4 Processes (L3)
  {
    id: 'f2s-4-1', hierarchyId: '3.3.1', name: 'Define and Maintain Quality Standards', level: 3,
    description: 'Establish quality specifications, acceptance criteria, and inspection plans.',
    parentId: 'f2s-vc4', processType: 'Operating', status: 'Active', ownerId: '18', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-4-2', hierarchyId: '3.3.2', name: 'Manage Non-Conformances and CAPA', level: 3,
    description: 'Register defects, perform root-cause analysis, and execute corrective and preventive actions.',
    parentId: 'f2s-vc4', processType: 'Operating', status: 'Active', ownerId: '18', assetCount: 4, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-4-3', hierarchyId: '3.3.3', name: 'Conduct Regulatory Compliance Audits', level: 3,
    description: 'Plan and execute internal and external compliance audits and track findings to closure.',
    parentId: 'f2s-vc4', processType: 'Operating', status: 'Active', ownerId: '18', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },

  // F2S-5 Processes (L3)
  {
    id: 'f2s-5-1', hierarchyId: '3.4.1', name: 'Maintain Material Master Data', level: 3,
    description: 'Create and govern material records including classifications, units, and valuation.',
    parentId: 'f2s-vc5', processType: 'Operating', status: 'Active', ownerId: '19', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'f2s-5-2', hierarchyId: '3.4.2', name: 'Manage Bills of Materials', level: 3,
    description: 'Define and version product structures and component quantities in the BOM.',
    parentId: 'f2s-vc5', processType: 'Operating', status: 'Active', ownerId: '19', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  // shared-bom-finalize is SECONDARY in F2S-5 (F2S-5.3); PRIMARY in D2O-2 (D2O-2.4)
  {
    id: 'shared-bom-finalize', hierarchyId: '3.4.3', name: 'Finalise Engineering Bill of Materials', level: 3,
    description: 'Transfer the validated engineering BOM from R&D into the production system as the manufacturing BOM.',
    parentId: 'd2o-vc2', processType: 'Operating', status: 'Active', ownerId: '20', assetCount: 4, childCount: 0,
    functionId: 'fn-rd',
    referencedParentIds: ['f2s-vc5'],
    allHierarchyIds: ['5.2.4', '3.4.3'],
  },

  // F2S-3 Processes (L3) — shared-goods-receipt is SECONDARY here (S2P-2.3 primary)
  {
    id: 'f2s-3-1', hierarchyId: '3.5.1', name: 'Store and Manage Inventory', level: 3,
    description: 'Put finished goods away, maintain bin locations, and perform cycle counts.',
    parentId: 'f2s-vc3', processType: 'Operating', status: 'Active', ownerId: '10', assetCount: 3, childCount: 0,
    functionId: 'fn-scm',
  },
  {
    id: 'f2s-3-2', hierarchyId: '3.5.2', name: 'Process Outbound Shipment', level: 3,
    description: 'Pick stock, stage for despatch, and hand over to carrier for delivery.',
    parentId: 'f2s-vc3', processType: 'Operating', status: 'Active', ownerId: '10', assetCount: 3, childCount: 0,
    functionId: 'fn-scm',
  },
  // shared-goods-receipt (primary S2P-2.3) also appears here as F2S-3.3

  // ── Hire to Retire (H2R) ───────────────────────────────────────────────────
  {
    id: 'e2e-h2r', hierarchyId: '4.0', name: 'Hire to Retire', level: 1,
    description: 'End-to-end flow from talent acquisition through employee offboarding.',
    parentId: null, processType: 'Support', status: 'Active', ownerId: '1', assetCount: 20, childCount: 5,
  },

  // H2R Value Chains (L2)
  {
    id: 'h2r-vc1', hierarchyId: '4.1', name: 'Talent Acquisition', level: 2,
    description: 'Attract, evaluate, and hire candidates to fill open positions.',
    parentId: 'e2e-h2r', processType: 'Support', status: 'Active', ownerId: '11', assetCount: 7, childCount: 3,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-vc2', hierarchyId: '4.2', name: 'Onboarding and Development', level: 2,
    description: 'Integrate new hires and develop employee capabilities over time.',
    parentId: 'e2e-h2r', processType: 'Support', status: 'Active', ownerId: '12', assetCount: 6, childCount: 3,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-vc4', hierarchyId: '4.3', name: 'Employee Relations and Engagement', level: 2,
    description: 'Foster a productive workplace through engagement, mediation, and employee well-being.',
    parentId: 'e2e-h2r', processType: 'Support', status: 'Active', ownerId: '21', assetCount: 5, childCount: 3,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-vc3', hierarchyId: '4.4', name: 'Payroll and Benefits', level: 2,
    description: 'Calculate and process payroll, administer benefits, and meet statutory obligations.',
    parentId: 'e2e-h2r', processType: 'Support', status: 'Active', ownerId: '13', assetCount: 7, childCount: 3,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-vc5', hierarchyId: '4.5', name: 'Offboarding and Alumni', level: 2,
    description: 'Manage employee exit, knowledge transfer, and ongoing alumni relationships.',
    parentId: 'e2e-h2r', processType: 'Support', status: 'Active', ownerId: '22', assetCount: 4, childCount: 3,
    functionId: 'fn-hr',
  },

  // H2R-1 Processes (L3)
  {
    id: 'h2r-1-1', hierarchyId: '4.1.1', name: 'Post Job Requisition', level: 3,
    description: 'Create and approve a job requisition and publish the vacancy on relevant channels.',
    parentId: 'h2r-vc1', processType: 'Support', status: 'Active', ownerId: '11', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-1-2', hierarchyId: '4.1.2', name: 'Screen and Interview Candidates', level: 3,
    description: 'Review applications, shortlist candidates, and conduct structured interviews.',
    parentId: 'h2r-vc1', processType: 'Support', status: 'Active', ownerId: '11', assetCount: 3, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-1-3', hierarchyId: '4.1.3', name: 'Extend and Accept Offer', level: 3,
    description: 'Prepare offer letter, negotiate terms, and obtain signed acceptance.',
    parentId: 'h2r-vc1', processType: 'Support', status: 'Active', ownerId: '11', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },

  // H2R-2 Processes (L3)
  {
    id: 'h2r-2-1', hierarchyId: '4.2.1', name: 'Onboard New Employee', level: 3,
    description: 'Provision systems access, complete compliance tasks, and introduce the new hire.',
    parentId: 'h2r-vc2', processType: 'Support', status: 'Active', ownerId: '12', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-2-2', hierarchyId: '4.2.2', name: 'Assign Training and Development Plan', level: 3,
    description: 'Identify skill gaps, create individual development plans, and enrol in learning paths.',
    parentId: 'h2r-vc2', processType: 'Support', status: 'Active', ownerId: '12', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-2-3', hierarchyId: '4.2.3', name: 'Conduct Performance Review', level: 3,
    description: 'Run structured mid-year and year-end reviews and calibrate ratings.',
    parentId: 'h2r-vc2', processType: 'Support', status: 'Active', ownerId: '12', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },

  // H2R-4 Processes (L3)
  {
    id: 'h2r-4-1', hierarchyId: '4.3.1', name: 'Manage Employee Grievance and Mediation', level: 3,
    description: 'Receive, investigate, and resolve employee grievances through structured mediation.',
    parentId: 'h2r-vc4', processType: 'Support', status: 'Active', ownerId: '21', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-4-2', hierarchyId: '4.3.2', name: 'Conduct Employee Engagement Survey', level: 3,
    description: 'Design, run, and analyse engagement surveys and feed results into action plans.',
    parentId: 'h2r-vc4', processType: 'Support', status: 'Active', ownerId: '21', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-4-3', hierarchyId: '4.3.3', name: 'Administer Disciplinary Process', level: 3,
    description: 'Handle misconduct investigations, issue warnings, and document outcomes.',
    parentId: 'h2r-vc4', processType: 'Support', status: 'Active', ownerId: '21', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },

  // H2R-3 Processes (L3)
  {
    id: 'h2r-3-1', hierarchyId: '4.4.1', name: 'Process Payroll Run', level: 3,
    description: 'Calculate gross and net pay, apply deductions, and post to the general ledger.',
    parentId: 'h2r-vc3', processType: 'Support', status: 'Active', ownerId: '13', assetCount: 3, childCount: 0,
    functionId: 'fn-hr',
    variants: [
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Gehaltsabrechnung Ausführen', description: 'Execute payroll in compliance with collective wage agreements (Tarifvertrag), mandatory social insurance contributions, and ELSTER electronic wage tax reporting.' },
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Traiter la Paie', description: 'Run payroll including specific French social charges (URSSAF, AGIRC-ARRCO), mandatory DSN monthly filing, and net-to-pay certificate generation for employees.' },
      { scope: { 'ctx-2': 'Brasil' }, deviation: 'changed', name: 'Processamento de Folha de Pagamento', description: 'Calculate payroll with FGTS, INSS, and IRRF deductions and transmit all events to eSocial before payment release; 13th salary provisioning is mandatory.' },
      { scope: { 'ctx-2': 'United Kingdom' }, deviation: 'changed', description: 'Process payroll under RTI (Real Time Information) reporting to HMRC, including auto-enrolment pension contributions and National Insurance calculations.' },
      { scope: { 'ctx-1': 'Tea' }, deviation: 'changed', name: 'Process Tea Estate Payroll Run', description: 'Payroll for estate and plantation workers follows estate-specific collective agreements; piece-rate harvesting calculations and mandatory housing/welfare deductions must be applied before net pay posting.' },
      { scope: { 'ctx-1': 'Coffee', 'ctx-2': 'Brasil' }, deviation: 'changed', name: 'Folha de Pagamento – Café Brasil', description: 'Rural labour law (CLT + NR-31) governs plantation workers; payroll must include rural INSS rates, FUNRURAL levy, and seasonal worker contracts with mandatory 13th salary and vacation accrual from day one.' },
    ],
  },
  {
    id: 'h2r-3-2', hierarchyId: '4.4.2', name: 'Administer Benefits Enrollment', level: 3,
    description: 'Manage open-enrollment windows, update plan elections, and reconcile premiums.',
    parentId: 'h2r-vc3', processType: 'Support', status: 'Active', ownerId: '13', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-3-3', hierarchyId: '4.4.3', name: 'File Statutory Reports', level: 3,
    description: 'Prepare and submit payroll tax filings and social-security declarations.',
    parentId: 'h2r-vc3', processType: 'Support', status: 'Active', ownerId: '13', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
    variants: [
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Gesetzliche Meldungen einreichen', description: 'Submit ELStAM wage-tax notifications, Sozialversicherungsmeldungen, and Lohnsteueranmeldungen on statutory deadlines via ELSTER and ITSG channels.' },
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Déposer les Déclarations Sociales', description: 'File the monthly Déclaration Sociale Nominative (DSN) replacing all legacy DADS/DADS-U reports; late filing incurs automatic penalties.' },
      { scope: { 'ctx-2': 'United States' }, deviation: 'changed', description: 'File quarterly Form 941 (federal payroll tax), annual W-2/W-3, and applicable state unemployment (SUTA) returns; ACA employer mandate reporting required for 50+ FTEs.' },
    ],
  },

  // H2R-5 Processes (L3)
  {
    id: 'h2r-5-1', hierarchyId: '4.5.1', name: 'Process Resignation or Termination', level: 3,
    description: 'Accept notice, trigger exit workflows, and update employment status.',
    parentId: 'h2r-vc5', processType: 'Support', status: 'Active', ownerId: '22', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-5-2', hierarchyId: '4.5.2', name: 'Conduct Exit Interview and Knowledge Transfer', level: 3,
    description: 'Capture reasons for departure, document critical knowledge, and hand over responsibilities.',
    parentId: 'h2r-vc5', processType: 'Support', status: 'Active', ownerId: '22', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },
  {
    id: 'h2r-5-3', hierarchyId: '4.5.3', name: 'Revoke Access and Close Employment Record', level: 3,
    description: 'Deactivate all system accounts, collect assets, and finalise personnel file.',
    parentId: 'h2r-vc5', processType: 'Support', status: 'Active', ownerId: '22', assetCount: 2, childCount: 0,
    functionId: 'fn-hr',
  },

  // ── Design to Operate (D2O) ────────────────────────────────────────────────
  {
    id: 'e2e-d2o', hierarchyId: '5.0', name: 'Design to Operate', level: 1,
    description: 'End-to-end flow from market insight and idea generation through product launch and lifecycle.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 32, childCount: 4,
  },

  // D2O Value Chains (L2)
  {
    id: 'd2o-vc1', hierarchyId: '5.1', name: 'Market Intelligence and Innovation', level: 2,
    description: 'Identify market opportunities, generate ideas, and validate new product business cases.',
    parentId: 'e2e-d2o', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 8, childCount: 3,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-vc2', hierarchyId: '5.2', name: 'Product Design and Engineering', level: 2,
    description: 'Translate requirements into validated product designs, prototypes, and engineering BOMs.',
    parentId: 'e2e-d2o', processType: 'Operating', status: 'Active', ownerId: '24', assetCount: 10, childCount: 4,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-vc3', hierarchyId: '5.3', name: 'Product Launch and Go-to-Market', level: 2,
    description: 'Plan and execute launch activities to bring the new product to market.',
    parentId: 'e2e-d2o', processType: 'Operating', status: 'Active', ownerId: '25', assetCount: 7, childCount: 3,
    functionId: 'fn-mkt',
  },
  {
    id: 'd2o-vc4', hierarchyId: '5.4', name: 'Product Lifecycle Management', level: 2,
    description: 'Manage engineering changes, variant proliferation, and end-of-life decisions.',
    parentId: 'e2e-d2o', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 6, childCount: 3,
    functionId: 'fn-rd',
  },

  // D2O-1 Processes (L3)
  {
    id: 'd2o-1-1', hierarchyId: '5.1.1', name: 'Analyse Market Trends and Customer Needs', level: 3,
    description: 'Gather and synthesise voice-of-customer data, competitor intelligence, and technology trends.',
    parentId: 'd2o-vc1', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 3, childCount: 0,
    functionId: 'fn-mkt',
  },
  {
    id: 'd2o-1-2', hierarchyId: '5.1.2', name: 'Generate and Evaluate Innovation Ideas', level: 3,
    description: 'Run ideation workshops, assess technical and commercial feasibility, and prioritise concepts.',
    parentId: 'd2o-vc1', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 3, childCount: 0,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-1-3', hierarchyId: '5.1.3', name: 'Validate Business Case for New Product', level: 3,
    description: 'Build financial model, estimate market size, and obtain investment approval for the concept.',
    parentId: 'd2o-vc1', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // D2O-2 Processes (L3)
  {
    id: 'd2o-2-1', hierarchyId: '5.2.1', name: 'Define Product Requirements and Specifications', level: 3,
    description: 'Translate customer needs into technical specifications and acceptance criteria.',
    parentId: 'd2o-vc2', processType: 'Operating', status: 'Active', ownerId: '24', assetCount: 3, childCount: 0,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-2-2', hierarchyId: '5.2.2', name: 'Design and Prototype Product', level: 3,
    description: 'Create CAD models and physical prototypes; iterate on design through rapid prototyping.',
    parentId: 'd2o-vc2', processType: 'Operating', status: 'Active', ownerId: '24', assetCount: 4, childCount: 0,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-2-3', hierarchyId: '5.2.3', name: 'Conduct Engineering Validation and Testing', level: 3,
    description: 'Execute DVT/PVT test cycles, address failures, and certify the design for manufacturing.',
    parentId: 'd2o-vc2', processType: 'Operating', status: 'Active', ownerId: '24', assetCount: 4, childCount: 0,
    functionId: 'fn-rd',
  },
  // shared-bom-finalize is PRIMARY in D2O-2 (D2O-2.4) and SECONDARY in F2S-5 (F2S-5.3)
  // (node defined above in F2S section with parentId: 'd2o-vc2')

  // D2O-3 Processes (L3)
  {
    id: 'd2o-3-1', hierarchyId: '5.3.1', name: 'Develop Go-to-Market Plan', level: 3,
    description: 'Define target segments, positioning, pricing strategy, and channel approach for launch.',
    parentId: 'd2o-vc3', processType: 'Operating', status: 'Active', ownerId: '25', assetCount: 3, childCount: 0,
    functionId: 'fn-mkt',
  },
  {
    id: 'd2o-3-2', hierarchyId: '5.3.2', name: 'Execute Market Launch Activities', level: 3,
    description: 'Coordinate sales enablement, marketing campaigns, and partner readiness for launch day.',
    parentId: 'd2o-vc3', processType: 'Operating', status: 'Active', ownerId: '25', assetCount: 3, childCount: 0,
    functionId: 'fn-mkt',
  },
  {
    id: 'd2o-3-3', hierarchyId: '5.3.3', name: 'Monitor Post-Launch Product Performance', level: 3,
    description: 'Track sales ramp, customer feedback, and quality signals in the first 90 days after launch.',
    parentId: 'd2o-vc3', processType: 'Operating', status: 'Active', ownerId: '25', assetCount: 2, childCount: 0,
    functionId: 'fn-mkt',
  },

  // D2O-4 Processes (L3)
  {
    id: 'd2o-4-1', hierarchyId: '5.4.1', name: 'Manage Product Variants and Engineering Changes', level: 3,
    description: 'Evaluate change requests, assess impact, and release engineering change orders.',
    parentId: 'd2o-vc4', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 3, childCount: 0,
    functionId: 'fn-rd',
  },
  {
    id: 'd2o-4-2', hierarchyId: '5.4.2', name: 'Plan Product Phase-Out', level: 3,
    description: 'Determine end-of-life timeline, communicate to customers, and run down stock.',
    parentId: 'd2o-vc4', processType: 'Operating', status: 'Active', ownerId: '25', assetCount: 2, childCount: 0,
    functionId: 'fn-mkt',
  },
  {
    id: 'd2o-4-3', hierarchyId: '5.4.3', name: 'Conduct Product Retrospective', level: 3,
    description: 'Capture lessons learned on design, quality, and market fit to feed into the next cycle.',
    parentId: 'd2o-vc4', processType: 'Operating', status: 'Active', ownerId: '23', assetCount: 2, childCount: 0,
    functionId: 'fn-rd',
  },

  // ── Lead to Cash (L2C) ─────────────────────────────────────────────────────
  {
    id: 'e2e-l2c', hierarchyId: '6.0', name: 'Lead to Cash', level: 1,
    description: 'End-to-end flow from marketing campaign and lead generation through signed contract and revenue recognition.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 26, childCount: 4,
  },

  // L2C Value Chains (L2)
  {
    id: 'l2c-vc1', hierarchyId: '6.1', name: 'Marketing and Lead Generation', level: 2,
    description: 'Run campaigns, capture inbound leads, and nurture prospects through the sales funnel.',
    parentId: 'e2e-l2c', processType: 'Operating', status: 'Active', ownerId: '26', assetCount: 8, childCount: 3,
    functionId: 'fn-mkt',
  },
  {
    id: 'l2c-vc2', hierarchyId: '6.2', name: 'Opportunity and Pipeline Management', level: 2,
    description: 'Qualify opportunities, build account strategies, and maintain an accurate pipeline.',
    parentId: 'e2e-l2c', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 7, childCount: 3,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-vc3', hierarchyId: '6.3', name: 'Quoting and Proposal', level: 2,
    description: 'Configure and price solutions, prepare proposals, and negotiate to close.',
    parentId: 'e2e-l2c', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 7, childCount: 3,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-vc4', hierarchyId: '6.4', name: 'Contract and Revenue Recognition', level: 2,
    description: 'Execute sales contracts, recognise revenue, and manage renewals and upsells.',
    parentId: 'e2e-l2c', processType: 'Operating', status: 'Active', ownerId: '28', assetCount: 6, childCount: 3,
    functionId: 'fn-fin',
  },

  // L2C-1 Processes (L3)
  {
    id: 'l2c-1-1', hierarchyId: '6.1.1', name: 'Plan and Execute Marketing Campaign', level: 3,
    description: 'Design multi-channel campaigns, allocate budgets, and track campaign performance.',
    parentId: 'l2c-vc1', processType: 'Operating', status: 'Active', ownerId: '26', assetCount: 3, childCount: 0,
    functionId: 'fn-mkt',
    variants: [
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Planifier et Exécuter la Campagne Marketing', description: 'All digital campaigns require CNIL-compliant cookie consent flows and explicit opt-in for email/SMS; influencer partnerships must include #publi or #sponsorisé disclosure under French ARPP rules.' },
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Marketingkampagne planen und durchführen', description: 'Comparative advertising and health-benefit claims are strictly regulated under UWG; all copy must pass legal review before launch; cold email campaigns require documented prior consent.' },
      { scope: { 'ctx-1': 'Health & Beauty' }, deviation: 'changed', name: 'Plan and Execute Health & Beauty Campaign', description: 'Marketing claims for cosmetics and OTC products must be substantiated per EU Cosmetics Regulation Article 20; medical claims are prohibited unless the product holds medicinal product authorisation.' },
      { scope: { 'ctx-1': 'Snacks' }, deviation: 'changed', description: 'Campaigns targeting consumers under 16 must comply with the EU Pledge restrictions on advertising of HFSS products; Nutri-Score must be visible in digital and TV creatives in applicable markets.' },
      { scope: { 'ctx-1': 'Health & Beauty', 'ctx-2': 'France' }, deviation: 'changed', name: 'Campagne Health & Beauty – France', description: 'ARPP and ANSM guidelines apply simultaneously; health benefit claims require ANSM pre-clearance for borderline products; influencer collaborations need both CNIL consent flows and ARPP health-claim compliance sign-off.' },
    ],
  },
  {
    id: 'l2c-1-2', hierarchyId: '6.1.2', name: 'Capture and Qualify Inbound Leads', level: 3,
    description: 'Collect leads from all channels, score them, and route qualified leads to sales.',
    parentId: 'l2c-vc1', processType: 'Operating', status: 'Active', ownerId: '26', assetCount: 3, childCount: 0,
    functionId: 'fn-mkt',
  },
  {
    id: 'l2c-1-3', hierarchyId: '6.1.3', name: 'Nurture Prospect through Sales Funnel', level: 3,
    description: 'Deliver targeted content and outreach to advance prospects towards a sales conversation.',
    parentId: 'l2c-vc1', processType: 'Operating', status: 'Active', ownerId: '26', assetCount: 2, childCount: 0,
    functionId: 'fn-mkt',
  },

  // L2C-2 Processes (L3)
  {
    id: 'l2c-2-1', hierarchyId: '6.2.1', name: 'Qualify and Create Sales Opportunity', level: 3,
    description: 'Apply BANT or equivalent criteria, confirm fit, and open the opportunity record.',
    parentId: 'l2c-vc2', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-2-2', hierarchyId: '6.2.2', name: 'Develop Account and Win Strategy', level: 3,
    description: 'Map stakeholders, assess competitive landscape, and build a differentiated win plan.',
    parentId: 'l2c-vc2', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 3, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-2-3', hierarchyId: '6.2.3', name: 'Manage Pipeline and Forecast Revenue', level: 3,
    description: 'Maintain opportunity stages, update close probabilities, and produce a reliable sales forecast.',
    parentId: 'l2c-vc2', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },

  // L2C-3 Processes (L3)
  {
    id: 'l2c-3-1', hierarchyId: '6.3.1', name: 'Configure and Price Quotation', level: 3,
    description: 'Use CPQ tooling to select product configuration, apply discounts, and generate a price quote.',
    parentId: 'l2c-vc3', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 3, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-3-2', hierarchyId: '6.3.2', name: 'Submit Proposal and Respond to Objections', level: 3,
    description: 'Present the proposal, handle commercial and technical objections, and revise as needed.',
    parentId: 'l2c-vc3', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },
  {
    id: 'l2c-3-3', hierarchyId: '6.3.3', name: 'Negotiate and Close Deal', level: 3,
    description: 'Align on final commercial terms, obtain approval for any non-standard conditions, and close.',
    parentId: 'l2c-vc3', processType: 'Operating', status: 'Active', ownerId: '27', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },

  // L2C-4 Processes (L3) — shared-revenue-recognition is SECONDARY here (R2R-1.3 primary)
  {
    id: 'l2c-4-1', hierarchyId: '6.4.1', name: 'Draft and Execute Sales Contract', level: 3,
    description: 'Prepare the contract, obtain legal and commercial approvals, and collect signatures.',
    parentId: 'l2c-vc4', processType: 'Operating', status: 'Active', ownerId: '28', assetCount: 3, childCount: 0,
    functionId: 'fn-sales',
  },
  // shared-revenue-recognition (primary R2R-1.3) also appears here as L2C-4.2
  {
    id: 'l2c-4-3', hierarchyId: '6.4.3', name: 'Manage Customer Renewal and Upsell', level: 3,
    description: 'Proactively engage customers ahead of renewal, identify expansion opportunities, and re-contract.',
    parentId: 'l2c-vc4', processType: 'Operating', status: 'Active', ownerId: '28', assetCount: 2, childCount: 0,
    functionId: 'fn-sales',
  },

  // ── Record to Report (R2R) ─────────────────────────────────────────────────
  {
    id: 'e2e-r2r', hierarchyId: '7.0', name: 'Record to Report', level: 1,
    description: 'End-to-end flow from transaction posting through period-end close and statutory reporting.',
    parentId: null, processType: 'Support', status: 'Active', ownerId: '1', assetCount: 30, childCount: 4,
  },

  // R2R Value Chains (L2)
  {
    id: 'r2r-vc1', hierarchyId: '7.1', name: 'Transaction Processing and Posting', level: 2,
    description: 'Record financial transactions, manage intercompany flows, and recognise revenue.',
    parentId: 'e2e-r2r', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 8, childCount: 3,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-vc2', hierarchyId: '7.2', name: 'Period-End Close', level: 2,
    description: 'Execute month-end and year-end close checklists and produce consolidated statements.',
    parentId: 'e2e-r2r', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 9, childCount: 3,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-vc3', hierarchyId: '7.3', name: 'Management Reporting and Analytics', level: 2,
    description: 'Produce management accounts, perform variance analysis, and maintain financial dashboards.',
    parentId: 'e2e-r2r', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 7, childCount: 3,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-vc4', hierarchyId: '7.4', name: 'Tax and Statutory Reporting', level: 2,
    description: 'Prepare tax returns, file statutory accounts, and manage the external audit.',
    parentId: 'e2e-r2r', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 6, childCount: 3,
    functionId: 'fn-fin',
  },

  // R2R-1 Processes (L3)
  {
    id: 'r2r-1-1', hierarchyId: '7.1.1', name: 'Post Journal Entries and Adjustments', level: 3,
    description: 'Record manual and automated journal entries, including accruals and reclassifications.',
    parentId: 'r2r-vc1', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-1-2', hierarchyId: '7.1.2', name: 'Manage Intercompany Transactions', level: 3,
    description: 'Match, eliminate, and reconcile intercompany balances across legal entities.',
    parentId: 'r2r-vc1', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  // shared-revenue-recognition is PRIMARY in R2R-1 (R2R-1.3) and SECONDARY in L2C-4 (L2C-4.2)
  {
    id: 'shared-revenue-recognition', hierarchyId: '7.1.3', name: 'Recognise Revenue', level: 3,
    description: 'Apply revenue recognition policies (IFRS 15 / ASC 606) to contracts and post revenue entries.',
    parentId: 'r2r-vc1', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 4, childCount: 0,
    functionId: 'fn-fin',
    referencedParentIds: ['l2c-vc4'],
    allHierarchyIds: ['7.1.3', '6.4.2'],
  },

  // R2R-2 Processes (L3)
  {
    id: 'r2r-2-1', hierarchyId: '7.2.1', name: 'Execute Month-End Close Checklist', level: 3,
    description: 'Run the structured close calendar: accrue expenses, clear open items, and verify completeness.',
    parentId: 'r2r-vc2', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-2-2', hierarchyId: '7.2.2', name: 'Consolidate Group Financial Statements', level: 3,
    description: 'Aggregate entity results, eliminate intercompany balances, and produce group P&L, BS, and CF.',
    parentId: 'r2r-vc2', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 4, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-2-3', hierarchyId: '7.2.3', name: 'Review and Approve Trial Balance', level: 3,
    description: 'Validate account balances, obtain controller sign-off, and lock the period.',
    parentId: 'r2r-vc2', processType: 'Support', status: 'Active', ownerId: '29', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // R2R-3 Processes (L3)
  {
    id: 'r2r-3-1', hierarchyId: '7.3.1', name: 'Prepare Management Accounts Package', level: 3,
    description: 'Compile monthly P&L, cost-centre reports, and KPI commentary for leadership.',
    parentId: 'r2r-vc3', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-3-2', hierarchyId: '7.3.2', name: 'Analyse Variances and Reforecast', level: 3,
    description: 'Investigate budget versus actual variances and update the rolling forecast.',
    parentId: 'r2r-vc3', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-3-3', hierarchyId: '7.3.3', name: 'Publish Financial Dashboard and Commentary', level: 3,
    description: 'Distribute automated dashboards and written commentary to business-unit owners.',
    parentId: 'r2r-vc3', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // R2R-4 Processes (L3)
  {
    id: 'r2r-4-1', hierarchyId: '7.4.1', name: 'Prepare and File Tax Returns', level: 3,
    description: 'Calculate corporate income tax, VAT, and other levies; file with tax authorities.',
    parentId: 'r2r-vc4', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
    variants: [
      { scope: { 'ctx-2': 'Germany' }, deviation: 'changed', name: 'Steuererklärungen erstellen und einreichen', description: 'Prepare Körperschaftsteuer and Gewerbesteuer returns via ELSTER; advance VAT (Umsatzsteuervoranmeldung) is due monthly or quarterly depending on prior-year liability.' },
      { scope: { 'ctx-2': 'France' }, deviation: 'changed', name: 'Préparer et Déposer les Déclarations Fiscales', description: 'File Impôt sur les Sociétés (IS) and TVA returns via the DGFiP portal (télédéclaration mandatory above €80k revenue); CVAE and CFE local business taxes apply.' },
      { scope: { 'ctx-2': 'Brasil' }, deviation: 'changed', name: 'Apuração e Entrega de Obrigações Fiscais', description: 'Submit SPED Fiscal, IRPJ/CSLL (via ECF), and PIS/COFINS apurations on monthly and annual cycles; SPED Contribuições and EFD-Reinf filings also required.' },
      { scope: { 'ctx-2': 'United States' }, deviation: 'changed', description: 'Prepare federal Form 1120 corporate income tax return plus state income tax filings in each nexus state; quarterly estimated payments required to avoid underpayment penalties.' },
    ],
  },
  {
    id: 'r2r-4-2', hierarchyId: '7.4.2', name: 'File Statutory Financial Statements', level: 3,
    description: 'Prepare annual report, obtain board approval, and submit to company registries.',
    parentId: 'r2r-vc4', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 3, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'r2r-4-3', hierarchyId: '7.4.3', name: 'Manage External Audit Process', level: 3,
    description: 'Coordinate auditor requests, provide substantiation, and track management letter findings.',
    parentId: 'r2r-vc4', processType: 'Support', status: 'Active', ownerId: '30', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // ── Acquire to Decommission (A2D) ──────────────────────────────────────────
  {
    id: 'e2e-a2d', hierarchyId: '8.0', name: 'Acquire to Decommission', level: 1,
    description: 'End-to-end flow from asset investment planning through operations, maintenance, and disposal.',
    parentId: null, processType: 'Support', status: 'Active', ownerId: '1', assetCount: 18, childCount: 4,
  },

  // A2D Value Chains (L2)
  {
    id: 'a2d-vc1', hierarchyId: '8.1', name: 'Asset Planning and Investment Approval', level: 2,
    description: 'Identify asset requirements, build investment cases, and obtain capital expenditure approval.',
    parentId: 'e2e-a2d', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 6, childCount: 3,
    functionId: 'fn-fin',
  },
  {
    id: 'a2d-vc2', hierarchyId: '8.2', name: 'Asset Procurement and Commissioning', level: 2,
    description: 'Procure or build the asset, capitalise it, and transfer it to operational use.',
    parentId: 'e2e-a2d', processType: 'Support', status: 'Active', ownerId: '32', assetCount: 6, childCount: 3,
    functionId: 'fn-proc',
  },
  {
    id: 'a2d-vc3', hierarchyId: '8.3', name: 'Asset Operations and Maintenance', level: 2,
    description: 'Schedule and execute preventive and corrective maintenance; track asset performance.',
    parentId: 'e2e-a2d', processType: 'Support', status: 'Active', ownerId: '33', assetCount: 7, childCount: 3,
    functionId: 'fn-prod',
  },
  {
    id: 'a2d-vc4', hierarchyId: '8.4', name: 'Asset Disposal and Decommissioning', level: 2,
    description: 'Assess retirement candidates, decommission safely, and close the asset record.',
    parentId: 'e2e-a2d', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 4, childCount: 3,
    functionId: 'fn-fin',
  },

  // A2D-1 Processes (L3)
  {
    id: 'a2d-1-1', hierarchyId: '8.1.1', name: 'Identify and Prioritise Asset Requirements', level: 3,
    description: 'Collect asset demand from operations, assess gaps, and prioritise by strategic importance.',
    parentId: 'a2d-vc1', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'a2d-1-2', hierarchyId: '8.1.2', name: 'Evaluate and Approve Investment Case', level: 3,
    description: 'Build NPV/IRR model, assess alternatives, and obtain capital committee approval.',
    parentId: 'a2d-vc1', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'a2d-1-3', hierarchyId: '8.1.3', name: 'Create Asset Plan and CAPEX Budget', level: 3,
    description: 'Define the acquisition schedule, assign budget codes, and open the investment order.',
    parentId: 'a2d-vc1', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // A2D-2 Processes (L3)
  {
    id: 'a2d-2-1', hierarchyId: '8.2.1', name: 'Procure or Construct Asset', level: 3,
    description: 'Run supplier selection or construction tender, award contract, and manage delivery.',
    parentId: 'a2d-vc2', processType: 'Support', status: 'Active', ownerId: '32', assetCount: 3, childCount: 0,
    functionId: 'fn-proc',
  },
  {
    id: 'a2d-2-2', hierarchyId: '8.2.2', name: 'Commission and Capitalise Asset', level: 3,
    description: 'Complete acceptance testing, transfer from AuC to fixed-asset register, and post capitalisation.',
    parentId: 'a2d-vc2', processType: 'Support', status: 'Active', ownerId: '32', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'a2d-2-3', hierarchyId: '8.2.3', name: 'Transfer Asset to Operational Custodian', level: 3,
    description: 'Hand over to the responsible department, update the asset register, and start depreciation.',
    parentId: 'a2d-vc2', processType: 'Support', status: 'Active', ownerId: '32', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // A2D-3 Processes (L3)
  {
    id: 'a2d-3-1', hierarchyId: '8.3.1', name: 'Plan Preventive Maintenance Schedule', level: 3,
    description: 'Define maintenance strategies, create maintenance plans, and schedule work orders.',
    parentId: 'a2d-vc3', processType: 'Support', status: 'Active', ownerId: '33', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'a2d-3-2', hierarchyId: '8.3.2', name: 'Execute Maintenance and Repair Work', level: 3,
    description: 'Dispatch technicians, complete work orders, and record parts and labour consumed.',
    parentId: 'a2d-vc3', processType: 'Support', status: 'Active', ownerId: '33', assetCount: 3, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'a2d-3-3', hierarchyId: '8.3.3', name: 'Track Asset Performance and Depreciation', level: 3,
    description: 'Monitor utilisation, OEE, and condition; run periodic depreciation and revaluation.',
    parentId: 'a2d-vc3', processType: 'Support', status: 'Active', ownerId: '33', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },

  // A2D-4 Processes (L3)
  {
    id: 'a2d-4-1', hierarchyId: '8.4.1', name: 'Assess Asset for Retirement', level: 3,
    description: 'Review asset condition, remaining useful life, and replacement options; recommend retirement.',
    parentId: 'a2d-vc4', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
  {
    id: 'a2d-4-2', hierarchyId: '8.4.2', name: 'Decommission and Safely Dispose of Asset', level: 3,
    description: 'Execute decommissioning safely, arrange disposal or sale, and manage environmental compliance.',
    parentId: 'a2d-vc4', processType: 'Support', status: 'Active', ownerId: '33', assetCount: 2, childCount: 0,
    functionId: 'fn-prod',
  },
  {
    id: 'a2d-4-3', hierarchyId: '8.4.3', name: 'Settle Asset Value and Close Asset Record', level: 3,
    description: 'Post disposal gain/loss, clear accumulated depreciation, and archive the asset record.',
    parentId: 'a2d-vc4', processType: 'Support', status: 'Active', ownerId: '31', assetCount: 2, childCount: 0,
    functionId: 'fn-fin',
  },
]

// Alias so ProcessLandscapeContext can continue to serve both 'apqc' and 'e2e' keys.
export const PROCESS_ELEMENTS: ProcessElement[] = E2E_ELEMENTS

export function getChildren(elements: ProcessElement[], parentId: string | null): ProcessElement[] {
  return elements.filter(e => e.parentId === parentId)
}

export function getElementById(elements: ProcessElement[], id: string): ProcessElement | undefined {
  return elements.find(e => e.id === id)
}
