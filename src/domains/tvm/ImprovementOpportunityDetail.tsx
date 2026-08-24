import { useParams, useNavigate } from 'react-router-dom'
import { DynamicPage, DynamicPageTitle, Title, Text, Tag, Button, Icon } from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/nav-back.js'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/information.js'
import '@ui5/webcomponents-icons/dist/arrow-right.js'

interface KpiTile {
  title: string
  type: string
  value: string | number
  unit?: string
}

interface OppDetail {
  title: string
  valueLever: string
  lob: string
  about: string
  whatCanISee: string[]
  whyShouldIImprove: string
  howCanIImprove: string
  kpiTiles: KpiTile[]
  correctionIds: string[]
}

const CORRECTIONS_TITLE: Record<string, string> = {
  c1: 'Train users to convert purchase requisition items into purchase order items',
  c2: 'Set the production orders to technically completed',
  c3: 'Check if production orders should proceed or if sales orders should be cancelled',
  c4: 'Close outbound deliveries for which goods issue posting is no longer possible',
  c5: 'Train users to convert stock transport requisition items into stock transport orders',
  c6: 'Check why users are changing net prices from the info record or outline agreement',
  c7: 'Collect outstanding credit memos from suppliers or close overdue items',
  c8: 'Delete old and obsolete error records from automatic goods movements',
  c9: 'Reject sales order items where further delivery is not expected',
}

const DETAIL_DATA: Record<string, OppDetail> = {
  '1': {
    title: 'Increase cash by collecting supplier credit memos or gaining discounts',
    valueLever: 'Effectiveness', lob: 'Finance',
    about: 'Use this dashboard to identify open and overdue supplier credit memos, down payments, and supplier discounts. Analyze how much cash could be freed up by collecting or applying these outstanding items before and after the S/4HANA migration.',
    whatCanISee: ['Open supplier credit memo items', 'Overdue down payment items', 'Supplier discount utilization rate'],
    whyShouldIImprove: 'Unresolved supplier credit memos and unused discounts represent cash that is owed to your company or that could reduce your payable amounts. Collecting these items improves your days payable outstanding and frees up working capital. Resolving them before migration also avoids carryover of stale items into the new system.',
    howCanIImprove: 'The correction recommendations for this improvement focus on collecting overdue credit memos and clearing open down payment items with your suppliers.',
    kpiTiles: [
      { title: 'Open supplier credit memo items', type: 'Performance Indicator · Outstanding Items', value: 70, unit: 'items' },
      { title: 'Overdue down payment items', type: 'Performance Indicator · Cash Flow', value: 12, unit: 'items' },
      { title: 'Discount utilization rate', type: 'Performance Indicator · Effectiveness', value: '68', unit: '%' },
    ],
    correctionIds: ['c7'],
  },
  '2': {
    title: 'Increase order management FTE productivity',
    valueLever: 'Efficiency', lob: 'Sales',
    about: 'Use this dashboard to analyze how often your order management processes required manual interventions. You can find out how many sales documents were created manually, and how often sales documents were subsequently changed manually, including which fields were changed. You can also find out how often sales order items are rejected and why.',
    whatCanISee: ['Sales documents created', 'Sales order item creation to outbound delivery item creation', 'Deleted items in sales documents'],
    whyShouldIImprove: 'Automating all order management processes and avoiding manual interventions helps you save costs and be more efficient. To achieve full automation, also known as no-touch processing, you should check if there are processes involving certain sales document types or organizational units that you can automate further. You can also check if you can avoid manual interventions by enhancing the customer master record with master data like delivery plant or tax classification. Additionally, you can analyze why sales order items were rejected in the past and solve the underlying issues, like stock-outs or poor product quality, to avoid further rejections in the future.',
    howCanIImprove: 'The correction recommendations for this improvement focus on automating your order management processes further and updating your master data to avoid manual field changes.',
    kpiTiles: [
      { title: 'Sales documents created', type: 'Performance Indicator · Throughput · Automation Rate', value: '0', unit: '%' },
      { title: 'Sales order items rejected', type: 'Process Flow · Frequent Blocker or Other Information', value: 1, unit: 'items' },
      { title: 'Deleted items in sales documents', type: 'Performance Indicator · Data Quality', value: 0, unit: 'items' },
    ],
    correctionIds: ['c9'],
  },
  '3': {
    title: 'Reduce obsolete or duplicate supplier payments',
    valueLever: 'Effectiveness', lob: 'Finance',
    about: 'Use this dashboard to identify payment proposals that are linked to canceled invoices and to detect potential duplicate payment situations. Learn how to avoid automatic payments for canceled invoices to prevent unnecessary cash outflows.',
    whatCanISee: ['Payment proposals for canceled invoices', 'Potential duplicate payment items', 'Blocked payment documents'],
    whyShouldIImprove: 'Payments triggered for canceled invoices or duplicate invoice entries result in direct cash loss and require manual recovery efforts with suppliers. Identifying and resolving these before migration ensures your accounts payable balances are accurate and reduces financial risk.',
    howCanIImprove: 'The correction recommendations focus on reviewing open payment proposals for canceled invoices and implementing checks to prevent duplicates from being processed during and after migration.',
    kpiTiles: [
      { title: 'Payment proposals for canceled invoices', type: 'Performance Indicator · Data Quality', value: 8, unit: 'items' },
      { title: 'Potential duplicate payments', type: 'Performance Indicator · Risk', value: 3, unit: 'items' },
      { title: 'Payment block rate', type: 'Performance Indicator · Compliance', value: '4.2', unit: '%' },
    ],
    correctionIds: [],
  },
  '4': {
    title: 'Improve operational procurement FTE productivity',
    valueLever: 'Efficiency', lob: 'Sourcing & Procurement',
    about: 'Use this dashboard to analyze the frequency of manual interventions in your operational procurement processes. Find out how often purchase requisitions are converted to purchase orders manually and whether stock transport orders follow the correct item category standards.',
    whatCanISee: ['Purchase requisitions converted to purchase orders', 'Stock transport order items by item category', 'Manual price changes in purchasing documents'],
    whyShouldIImprove: 'Manual procurement processes slow down your operations and increase the risk of errors. Automating the conversion of purchase requisitions to purchase orders and ensuring correct item categories in stock transport orders reduces FTE cost and improves data quality for the migration.',
    howCanIImprove: 'The correction recommendations for this improvement focus on training users to use standard conversion transactions and, where possible, automating the conversion via scheduled background jobs.',
    kpiTiles: [
      { title: 'Purchase requisitions converted to POs', type: 'Performance Indicator · Automation Rate', value: '74', unit: '%' },
      { title: 'Stock transport order items', type: 'Performance Indicator · Item Category Compliance', value: 1164, unit: 'items' },
      { title: 'Manual price changes', type: 'Performance Indicator · Compliance', value: 100, unit: 'items' },
    ],
    correctionIds: ['c1', 'c5'],
  },
  '5': {
    title: 'Improve on-time delivery performance in make to order',
    valueLever: 'Agility', lob: 'Sales',
    about: 'Use this dashboard to identify delays in manufacturing and delivery for your make-to-order scenario. Analyze open production orders with past scheduled or basic end dates, and identify sales orders at risk of late delivery.',
    whatCanISee: ['Open production orders past scheduled end date', 'Open production orders past basic end date', 'On-time delivery rate for make-to-order'],
    whyShouldIImprove: 'Late production and delivery affects customer satisfaction and can result in penalties or lost business. Cleaning up open production orders past their end dates improves data quality in planning and ensures a reliable view of your production backlog in S/4HANA.',
    howCanIImprove: 'The correction recommendations for this improvement focus on technically completing overdue production orders and aligning sales order delivery dates with realistic production timelines.',
    kpiTiles: [
      { title: 'Open production orders past scheduled end date', type: 'Performance Indicator · Backlog', value: 892, unit: 'items' },
      { title: 'Open production orders past basic end date', type: 'Performance Indicator · Backlog', value: 199, unit: 'items' },
      { title: 'On-time delivery rate', type: 'Performance Indicator · Customer Service', value: '82', unit: '%' },
    ],
    correctionIds: ['c2', 'c3'],
  },
  '6': {
    title: 'Increase accounts payable FTE productivity',
    valueLever: 'Efficiency', lob: 'Finance',
    about: 'Analyze the frequency of manual interventions in your accounts payable processes. Identify how often invoices are posted manually versus automatically and where process automation can reduce FTE effort.',
    whatCanISee: ['Invoice posting automation rate', 'Manual payment runs', 'Accounts payable processing time'],
    whyShouldIImprove: 'Manual accounts payable processing is costly and error-prone. Increasing automation reduces FTE cost, speeds up invoice cycles, and reduces late payment risks.',
    howCanIImprove: 'The correction recommendations focus on enabling invoice automation rules and reducing manual posting exceptions.',
    kpiTiles: [
      { title: 'Invoice automation rate', type: 'Performance Indicator · Automation Rate', value: '61', unit: '%' },
      { title: 'Manual payment runs', type: 'Performance Indicator · Throughput', value: 24, unit: 'items' },
      { title: 'Average invoice processing time', type: 'Performance Indicator · Efficiency', value: '4.2', unit: 'days' },
    ],
    correctionIds: [],
  },
  '7': {
    title: 'Reduce maverick buying behavior',
    valueLever: 'Confidence', lob: 'Sourcing & Procurement',
    about: 'Identify non-compliant purchasing and analyze the underlying reasons. Find out how often users are bypassing approved purchasing channels or manually overriding prices set in contracts and info records.',
    whatCanISee: ['Purchasing info records with price variance', 'Purchase orders without reference to contracts', 'Compliance rate by purchasing group'],
    whyShouldIImprove: 'Maverick buying undermines negotiated contract benefits and increases procurement costs. Identifying and addressing the root causes helps enforce purchasing policy compliance and improve spend under management.',
    howCanIImprove: 'The correction recommendations focus on restricting manual price overrides via authorization controls and establishing price deviation tolerance policies.',
    kpiTiles: [
      { title: 'Purchasing info records with price variance', type: 'Performance Indicator · Compliance', value: 100, unit: 'items' },
      { title: 'POs without contract reference', type: 'Performance Indicator · Contract Compliance', value: '18', unit: '%' },
      { title: 'Compliance rate', type: 'Performance Indicator · Purchasing Compliance', value: '82', unit: '%' },
    ],
    correctionIds: ['c6'],
  },
  '8': {
    title: 'Reduce old and obsolete transactional data in sales',
    valueLever: 'Efficiency', lob: 'Sales',
    about: 'Identify old and obsolete sales documents that should be closed and analyze why they remain open. Reducing stale open items improves the quality of your data before migration.',
    whatCanISee: ['Open sales schedule lines past confirmed delivery date', 'Old open sales orders', 'Rejected sales order items pending cleanup'],
    whyShouldIImprove: 'Old and obsolete sales documents inflate your open item lists and can interfere with planning runs and demand forecasting. Cleaning up these records ensures a lean and accurate data set for your S/4HANA migration.',
    howCanIImprove: 'The correction recommendations focus on rejecting open sales schedule lines where delivery is no longer expected.',
    kpiTiles: [
      { title: 'Open sales schedule lines past delivery date', type: 'Performance Indicator · Data Quality', value: 38, unit: 'items' },
      { title: 'Open sales orders older than 12 months', type: 'Performance Indicator · Data Age', value: 67, unit: 'items' },
      { title: 'Sales document cleanup rate', type: 'Performance Indicator · Data Management', value: '45', unit: '%' },
    ],
    correctionIds: ['c9'],
  },
  '9': {
    title: 'Reduce old and obsolete transactional data in supply chain',
    valueLever: 'Efficiency', lob: 'Supply Chain',
    about: 'Identify old and obsolete delivery or transportation documents that should be closed. Stale open outbound deliveries clutter planning views and should be resolved before migration.',
    whatCanISee: ['Open outbound deliveries past planned goods issue date', 'Open inbound deliveries past expected receipt date', 'Transportation orders pending closure'],
    whyShouldIImprove: 'Open delivery documents with past dates cannot be goods-issued and should be closed or archived. Leaving them open pollutes your supply chain planning data and creates unnecessary work during migration.',
    howCanIImprove: 'The correction recommendations focus on closing open outbound deliveries where goods issue is no longer feasible.',
    kpiTiles: [
      { title: 'Open outbound deliveries past GI date', type: 'Performance Indicator · Data Quality', value: 153, unit: 'items' },
      { title: 'Open inbound deliveries past receipt date', type: 'Performance Indicator · Data Quality', value: 41, unit: 'items' },
      { title: 'Delivery document cleanup rate', type: 'Performance Indicator · Data Management', value: '52', unit: '%' },
    ],
    correctionIds: ['c4'],
  },
  '10': {
    title: 'Improve on-time delivery performance in third-party sales',
    valueLever: 'Agility', lob: 'Sales',
    about: 'Identify delays in third-party order fulfillment and analyze supplier-related bottlenecks. Understand how often third-party purchase orders are not confirmed or delivered on time.',
    whatCanISee: ['Third-party purchase order confirmation rate', 'Supplier on-time delivery rate', 'Open third-party sales orders past delivery date'],
    whyShouldIImprove: 'Third-party delivery delays directly affect customer satisfaction. Understanding where delays originate helps you work with suppliers to improve performance.',
    howCanIImprove: 'The correction recommendations focus on improving purchase order confirmation tracking and supplier performance management.',
    kpiTiles: [
      { title: 'Third-party PO confirmation rate', type: 'Performance Indicator · Supplier Performance', value: '71', unit: '%' },
      { title: 'Supplier on-time delivery rate', type: 'Performance Indicator · Customer Service', value: '78', unit: '%' },
      { title: 'Open third-party orders past delivery date', type: 'Performance Indicator · Backlog', value: 22, unit: 'items' },
    ],
    correctionIds: [],
  },
  '11': {
    title: 'Increase usage of negotiated purchasing contracts',
    valueLever: 'Efficiency', lob: 'Sourcing & Procurement',
    about: 'Improve your procurement FTE productivity by using purchasing contracts more effectively. Analyze how often purchases are made against active contracts versus without contract reference.',
    whatCanISee: ['Spend under contract', 'Contract utilization rate by category', 'POs without contract reference'],
    whyShouldIImprove: 'Low contract utilization means your organization is not benefiting from negotiated prices and terms. Increasing contract compliance reduces procurement costs and improves supplier relationships.',
    howCanIImprove: 'The correction recommendations focus on increasing awareness of active contracts and implementing purchasing policy controls to enforce contract use.',
    kpiTiles: [
      { title: 'Contract utilization rate', type: 'Performance Indicator · Contract Compliance', value: '63', unit: '%' },
      { title: 'Spend under contract', type: 'Performance Indicator · Spend Management', value: '€4.1M', unit: '' },
      { title: 'POs without contract reference', type: 'Performance Indicator · Maverick Buying', value: 87, unit: 'items' },
    ],
    correctionIds: [],
  },
  '12': {
    title: 'Reduce early supplier payments',
    valueLever: 'Effectiveness', lob: 'Finance',
    about: "Discover if you're paying your suppliers too early and learn how to reduce early payments. Analyze payment timing against due dates and discount terms to optimize cash flow.",
    whatCanISee: ['Payments made before due date', 'Average days paid early', 'Early payment rate by vendor group'],
    whyShouldIImprove: 'Paying suppliers before the due date unnecessarily reduces your available cash. Aligning payment timing with contractual due dates improves days payable outstanding and working capital.',
    howCanIImprove: 'The correction recommendations focus on configuring payment run parameters to respect due dates and reviewing payment terms with key suppliers.',
    kpiTiles: [
      { title: 'Early payment rate', type: 'Performance Indicator · Cash Flow', value: '23', unit: '%' },
      { title: 'Average days paid early', type: 'Performance Indicator · Payment Timing', value: 4.3, unit: 'days' },
      { title: 'Cash tied up in early payments', type: 'Performance Indicator · Working Capital', value: '€1.2M', unit: '' },
    ],
    correctionIds: [],
  },
  '13': {
    title: 'Reduce old and obsolete transactional data in discrete manufacturing',
    valueLever: 'Efficiency', lob: 'Manufacturing',
    about: 'Identify old and obsolete production orders and order reservations that should be closed. Stale open manufacturing documents interfere with MRP and should be resolved before migration.',
    whatCanISee: ['Open production orders past end date', 'Old open order reservations', 'Technically completed orders pending archiving'],
    whyShouldIImprove: 'Open production orders and reservations that are no longer active inflate your MRP inputs and planning backlogs. Cleaning these up improves planning accuracy and reduces migration effort.',
    howCanIImprove: 'The correction recommendations focus on setting overdue production orders to technically completed status.',
    kpiTiles: [
      { title: 'Open production orders past end date', type: 'Performance Indicator · Data Quality', value: 44, unit: 'items' },
      { title: 'Old order reservations', type: 'Performance Indicator · Data Age', value: 29, unit: 'items' },
      { title: 'Production data cleanup rate', type: 'Performance Indicator · Data Management', value: '38', unit: '%' },
    ],
    correctionIds: ['c2'],
  },
  '14': {
    title: 'Reduce old and obsolete transactional data in sourcing',
    valueLever: 'Efficiency', lob: 'Sourcing & Procurement',
    about: 'Identify old and obsolete purchasing documents that should be closed and analyze why they remain open. Reducing stale purchasing data improves supplier and spend reporting accuracy.',
    whatCanISee: ['Open purchase orders past delivery date', 'Old purchase requisitions without PO conversion', 'Vendor-managed inventory overdue items'],
    whyShouldIImprove: 'Old open purchasing documents distort your spend analytics and create reconciliation issues during migration. Closing or archiving them ensures clean procurement data in S/4HANA.',
    howCanIImprove: 'The correction recommendations focus on closing open purchasing documents past their delivery date and archiving items no longer needed.',
    kpiTiles: [
      { title: 'Open POs past delivery date', type: 'Performance Indicator · Data Quality', value: 61, unit: 'items' },
      { title: 'Old unprocessed purchase requisitions', type: 'Performance Indicator · Data Age', value: 33, unit: 'items' },
      { title: 'Sourcing data cleanup rate', type: 'Performance Indicator · Data Management', value: '49', unit: '%' },
    ],
    correctionIds: [],
  },
  '15': {
    title: 'Reduce slow moving special stock',
    valueLever: 'Effectiveness', lob: 'Supply Chain',
    about: "Find out where you have unnecessary reserved stocks for special purposes that can't be sold or used. Identify slow-moving or stranded special stock categories and take action to release them.",
    whatCanISee: ['Special stock by category and age', 'Slow-moving special stock items', 'Days of supply for special stock'],
    whyShouldIImprove: "Special stocks that are no longer needed tie up working capital and warehouse space. Identifying and releasing these stocks reduces days in inventory and improves your balance sheet before migration.",
    howCanIImprove: 'The correction recommendations focus on reviewing special stock categories and initiating return, repurposing, or write-off processes for slow-moving items.',
    kpiTiles: [
      { title: 'Slow-moving special stock items', type: 'Performance Indicator · Inventory Age', value: 18, unit: 'items' },
      { title: 'Days of supply (special stock)', type: 'Performance Indicator · Inventory Efficiency', value: 94, unit: 'days' },
      { title: 'Special stock value at risk', type: 'Performance Indicator · Working Capital', value: '€340K', unit: '' },
    ],
    correctionIds: [],
  },
}

function KpiTileCard({ tile }: { tile: KpiTile }) {
  return (
    <div style={{
      background: 'var(--sapGroup_ContentBackground)',
      border: '1px solid var(--sapList_BorderColor)',
      borderRadius: '0.75rem',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minHeight: 160,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text style={{ fontWeight: 600, fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>{tile.title}</Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', display: 'block', marginTop: 2 }}>{tile.type}</Text>
        </div>
        <Text style={{ fontSize: '0.7rem', color: 'var(--sapContent_LabelColor)' }}>QE4:006 (SAP ECC)</Text>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--sapTextColor)', lineHeight: 1.1 }}>{tile.value}</span>
          {tile.unit && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{tile.unit}</Text>}
        </div>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginTop: '0.25rem' }}>
          Object Count Trend
        </Text>
      </div>
    </div>
  )
}

export default function ImprovementOpportunityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const opp = id ? DETAIL_DATA[id] : undefined

  if (!opp) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Text>Improvement opportunity not found.</Text>
        <Button onClick={() => navigate('/improvement-opportunities')}>Back to Improvement Opportunities</Button>
      </div>
    )
  }

  const shortTitle = opp.title.length > 55 ? opp.title.slice(0, 55) + '…' : opp.title

  return (
    <DynamicPage
      style={{ height: '100%' }}
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem href="#/improvement-opportunities">Improvement Opportunities</SigBreadcrumbItem>
              <SigBreadcrumbItem>{shortTitle}</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
          actionsBar={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button icon="nav-back" design="Transparent" onClick={() => navigate('/improvement-opportunities')}>Back</Button>
              <Icon name="favorite" style={{ cursor: 'pointer', color: 'var(--sapContent_LabelColor)', fontSize: '1.25rem' }} />
            </div>
          }
        >
          <Title slot="heading" level="H2">{opp.title}</Title>
          <Tag design="Set2" colorScheme="6">Improvement Opportunity</Tag>
          <Tag design="Set2" colorScheme={
            opp.valueLever === 'Efficiency' ? '8' :
            opp.valueLever === 'Effectiveness' ? '2' :
            opp.valueLever === 'Agility' ? '4' : '7'
          }>{opp.valueLever}</Tag>
        </DynamicPageTitle>
      }
    >
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Main grid: KPI tiles left + info panel right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {opp.kpiTiles.map(tile => <KpiTileCard key={tile.title} tile={tile} />)}
          </div>

          {/* Right: info panel */}
          <div style={{
            background: 'var(--sapGroup_ContentBackground)',
            border: '1px solid var(--sapList_BorderColor)',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Icon name="information" style={{ color: 'var(--sapInformativeColor)', fontSize: '1.25rem', flexShrink: 0, marginTop: 2 }} />
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                What is this improvement opportunity dashboard about?
              </Text>
            </div>
            <Text style={{ fontSize: 'var(--sapFontSize)', lineHeight: 1.6, color: 'var(--sapTextColor)' }}>{opp.about}</Text>

            <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '0.75rem' }}>
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' }}>What can I see here?</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.375rem' }}>
                This dashboard visualizes metrics from:
              </Text>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {opp.whatCanISee.map(item => (
                  <li key={item}><Text style={{ fontSize: 'var(--sapFontSize)' }}>{item}</Text></li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '0.75rem' }}>
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' }}>Why should I improve?</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', lineHeight: 1.6 }}>{opp.whyShouldIImprove}</Text>
            </div>

            <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '0.75rem' }}>
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' }}>How can I improve?</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', lineHeight: 1.6 }}>{opp.howCanIImprove}</Text>
            </div>
          </div>
        </div>

        {/* Correction Recommendations section */}
        <div style={{
          background: 'var(--sapGroup_ContentBackground)',
          border: '1px solid var(--sapList_BorderColor)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid var(--sapList_BorderColor)',
            background: 'var(--sapList_HeaderBackground)',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--sapButton_Emphasized_Background)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="arrow-right" style={{ color: 'var(--sapButton_Emphasized_TextColor)', fontSize: '1rem' }} />
              </div>
              <div>
                <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', display: 'block' }}>
                  Top 10 Correction Recommendations
                </Text>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)' }}>{opp.title}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>QE4:006 (SAP ECC)</Text>
              <Button design="Transparent" onClick={() => navigate('/recommendations')} style={{ color: 'var(--sapLinkColor)' }}>
                View All <Icon name="arrow-right" style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }} />
              </Button>
            </div>
          </div>

          {opp.correctionIds.length > 0 ? (
            <div>
              {opp.correctionIds.map((cid, i) => (
                <div
                  key={cid}
                  onClick={() => navigate(`/recommendations/${cid}`)}
                  style={{
                    padding: '0.875rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    borderBottom: i < opp.correctionIds.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--sapInformativeColor)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                  }}>
                    {i + 1}
                  </div>
                  <Text style={{ color: 'var(--sapLinkColor)', fontWeight: 500 }}>{CORRECTIONS_TITLE[cid]}</Text>
                  <Icon name="arrow-right" style={{ marginLeft: 'auto', color: 'var(--sapContent_LabelColor)', fontSize: '0.875rem', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                No specific correction recommendations linked yet.{' '}
              </Text>
              <Text
                style={{ color: 'var(--sapLinkColor)', cursor: 'pointer' }}
                onClick={() => navigate('/recommendations')}
              >
                Browse all recommendations →
              </Text>
            </div>
          )}
        </div>

      </div>
    </DynamicPage>
  )
}
