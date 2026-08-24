import { useParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  Title, Text, Tag, Button, TabContainer, Tab, Icon,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/nav-back.js'
import '@ui5/webcomponents-icons/dist/favorite.js'

interface RecDetail {
  title: string
  impact: 1 | 2 | 3
  effort: 1 | 2 | 3
  objects: number
  finding: string
  rootCauseLabel: string
  valueDriver: string
  relatedKPI: string
  improvementOpp: string
  recommendedActionText: string
}

const DETAIL_DATA: Record<string, RecDetail> = {
  c1: {
    title: 'Train users to convert purchase requisition items into purchase order items',
    impact: 3, effort: 2, objects: 1164,
    finding: 'Less than 80% of purchase order items with a planning-relevant material have an item category of standard or third-party',
    rootCauseLabel: 'Missing end user training',
    valueDriver: 'Improve Procurement FTE Productivity',
    relatedKPI: 'Purchase order items created',
    improvementOpp: 'Improve operational procurement FTE productivity',
    recommendedActionText: 'Users should use the planning proposals from the Material Requirements Planning instead of creating purchase order items without reference to a purchase requisition. Aim to train your users to use transaction ME59N to convert purchase requisition items into purchase order items. Or if possible, automate this conversion task by using ABAP report RM06BB30, which should be scheduled to run regularly as a background job with a suitable variant.',
  },
  c2: {
    title: 'Set the production orders to technically completed',
    impact: 3, effort: 2, objects: 892,
    finding: '892 production orders were found where the scheduled end date is in the past and that are still open',
    rootCauseLabel: 'Production orders past scheduled end date',
    valueDriver: 'Reduce Overall Supply Chain Planning Cost',
    relatedKPI: 'Open production orders',
    improvementOpp: '',
    recommendedActionText: 'Use transaction CO02 or COHV to mass-update production orders past their scheduled end date to "Technically Completed" (TECO) status. This ensures they no longer appear in planning runs or backlogs. Consider scheduling a periodic review of open production orders to catch these early and maintain data cleanliness before the S/4HANA migration.',
  },
  c3: {
    title: 'Check if production orders should proceed or if sales orders should be cancelled',
    impact: 3, effort: 2, objects: 199,
    finding: '199 open production orders were found where the basic end date is in the past',
    rootCauseLabel: 'Past basic end date without status update',
    valueDriver: 'Improve On-Time Delivery Performance',
    relatedKPI: 'Open production orders past end date',
    improvementOpp: 'Improve on-time delivery performance',
    recommendedActionText: 'Review all open production orders where the basic end date has passed. Determine whether production should still proceed or if the associated sales orders should be rejected or cancelled. Use transaction CO26 to get an overview. Coordinate with sales and production planning teams to align on priorities and update order statuses accordingly.',
  },
  c4: {
    title: 'Close outbound deliveries for which goods issue posting is no longer possible',
    impact: 2, effort: 2, objects: 153,
    finding: '153 open outbound deliveries were found where the planned goods issue date is in the past',
    rootCauseLabel: 'Past planned goods issue date',
    valueDriver: 'Reduce Data Management Cost',
    relatedKPI: 'Open outbound deliveries',
    improvementOpp: 'Reduce old and obsolete transactional data',
    recommendedActionText: 'Use transaction VL09 or VL06O to identify and close open outbound deliveries where the planned goods issue date is in the past and posting is no longer feasible. Coordinate with the logistics team to cancel or archive these deliveries. Establish a periodic review process to prevent accumulation of stale delivery documents ahead of the migration.',
  },
  c5: {
    title: 'Train users to convert stock transport requisition items into stock transport orders',
    impact: 3, effort: 2, objects: 114,
    finding: 'Less than 80% of stock transport order items with a planning-relevant material have an item category of standard',
    rootCauseLabel: 'Missing end user training',
    valueDriver: 'Improve Procurement FTE Productivity',
    relatedKPI: 'Stock transport order items created',
    improvementOpp: 'Improve operational procurement FTE productivity',
    recommendedActionText: 'Users should follow standard processes for converting stock transport requisitions into stock transport orders using item category standard. Train users on transaction ME27 or ME59N for conversion. Consider enabling workflow-based automation for routine conversions to reduce manual effort and improve compliance rates.',
  },
  c6: {
    title: 'Check why users are changing net prices from the info record or outline agreement',
    impact: 2, effort: 1, objects: 100,
    finding: '12 purchasing info records for single materials were found with different net prices from different vendors',
    rootCauseLabel: 'Manual price overrides in purchasing',
    valueDriver: 'Improve User Compliance',
    relatedKPI: 'Purchasing info records with price variance',
    improvementOpp: 'Reduce maverick buying behavior',
    recommendedActionText: 'Investigate why users are manually changing net prices that should be derived from purchasing info records or outline agreements. Use transaction ME23N to review price history per purchasing document. Consider restricting manual price changes via authorization objects and establishing a price deviation tolerance policy to prevent maverick buying.',
  },
  c7: {
    title: 'Collect outstanding credit memos from suppliers or close overdue items',
    impact: 2, effort: 2, objects: 70,
    finding: '70 open and overdue supplier credit memo items not related to returns are pending',
    rootCauseLabel: 'Unresolved supplier credit memos',
    valueDriver: 'Improve Days Payable Outstanding',
    relatedKPI: 'Open supplier credit memo items',
    improvementOpp: 'Increase cash by collecting supplier credit memos',
    recommendedActionText: "Review all open and overdue supplier credit memo items using transaction MR11 or FBL1N. For each item, determine whether collection from the supplier is still feasible. If collection is not possible, initiate the write-off process following your company's financial policy. Coordinate with accounts payable and procurement teams to resolve all outstanding credit memos before the system migration.",
  },
  c8: {
    title: 'Delete old and obsolete error records from automatic goods movements',
    impact: 3, effort: 1, objects: 42,
    finding: '42 error records were found from automatic goods movement postings',
    rootCauseLabel: 'System errors in automatic postings',
    valueDriver: 'Reduce Data Management Cost',
    relatedKPI: 'Error records in goods movement',
    improvementOpp: 'Reduce old and obsolete transactional data',
    recommendedActionText: 'Use transaction MB22 or the error log in MIGO to review and resolve automatic goods movement posting errors. For records that cannot be reprocessed, initiate deletion following your archiving and data retention policy. Establish monitoring alerts for new error records to ensure they are addressed within a defined SLA and do not accumulate ahead of migration.',
  },
  c9: {
    title: 'Reject sales order items where further delivery is not expected',
    impact: 2, effort: 2, objects: 38,
    finding: '38 open sales schedule lines in sales orders were found where the confirmed delivery date is in the past',
    rootCauseLabel: 'Confirmed delivery dates passed without closure',
    valueDriver: 'Reduce Data Management Cost',
    relatedKPI: 'Open sales schedule lines past delivery date',
    improvementOpp: 'Reduce old and obsolete transactional data in sales',
    recommendedActionText: 'Use transaction VA02 or the mass change functionality in VA05 to identify open sales schedule lines with confirmed delivery dates in the past. Reject items where no further delivery is expected using the appropriate rejection reason code. Communicate changes to affected customers and update demand forecasting accordingly to avoid discrepancies after migration.',
  },
}

function ScoreDots({ score, max = 3, color }: { score: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 2, background: i < score ? color : 'var(--sapList_BorderColor)' }} />
      ))}
    </div>
  )
}

export default function RecommendationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const rec = id ? DETAIL_DATA[id] : undefined

  if (!rec) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Text>Recommendation not found.</Text>
        <Button onClick={() => navigate('/recommendations')}>Back to Recommendations</Button>
      </div>
    )
  }

  const shortTitle = rec.title.length > 55 ? rec.title.slice(0, 55) + '…' : rec.title

  return (
    <DynamicPage
      style={{ height: '100%' }}
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem href="#/recommendations">Recommendations</SigBreadcrumbItem>
              <SigBreadcrumbItem href="#/recommendations">Correction Recommendations</SigBreadcrumbItem>
              <SigBreadcrumbItem>{shortTitle}</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
          actionsBar={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button icon="nav-back" design="Transparent" onClick={() => navigate('/recommendations')}>Back</Button>
              <Icon name="favorite" style={{ cursor: 'pointer', color: 'var(--sapContent_LabelColor)', fontSize: '1.25rem' }} />
            </div>
          }
        >
          <Title slot="heading" level="H2">{rec.title}</Title>
          <Tag design="Set2" colorScheme="3">Correction Recommendation</Tag>
        </DynamicPageTitle>
      }
    >
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Impact / Effort / Objects */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Impact</Text>
            <ScoreDots score={rec.impact} color="#e9730c" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Effort</Text>
            <ScoreDots score={rec.effort} color="#e9730c" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Objects</Text>
            <Text style={{ fontSize: '1.375rem', fontWeight: '700', lineHeight: 1 }}>{rec.objects.toLocaleString()}</Text>
          </div>
        </div>

        {/* 3-column info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--sapList_BorderColor)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Finding</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', lineHeight: 1.5 }}>{rec.finding}</Text>
            </div>
            <div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Potential Root Cause</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{rec.rootCauseLabel}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Value Driver Affected</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{rec.valueDriver}</Text>
            </div>
            <div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Related Performance Indicator</Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapLinkColor)', cursor: 'pointer' }}>{rec.relatedKPI}</Text>
            </div>
          </div>
          <div>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapLinkColor)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Improvement Opportunity</Text>
            <Text style={{
              fontSize: 'var(--sapFontSize)',
              color: rec.improvementOpp ? 'var(--sapLinkColor)' : 'var(--sapContent_LabelColor)',
              cursor: rec.improvementOpp ? 'pointer' : 'default',
            }}>
              {rec.improvementOpp || '—'}
            </Text>
          </div>
        </div>

        {/* Tabs */}
        <TabContainer collapsed={false}>
          <Tab text="Recommended Action" selected>
            <div style={{
              marginTop: '1rem',
              padding: '1.25rem 1.5rem',
              background: 'var(--sapBaseColor)',
              border: '1px solid var(--sapList_BorderColor)',
              borderRadius: '0.5rem',
            }}>
              <Text style={{ fontSize: 'var(--sapFontSize)', lineHeight: 1.7 }}>{rec.recommendedActionText}</Text>
            </div>
          </Tab>
          <Tab text="Details">
            <div style={{ padding: '1.5rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No additional details available.</Text>
            </div>
          </Tab>
        </TabContainer>

      </div>
    </DynamicPage>
  )
}
