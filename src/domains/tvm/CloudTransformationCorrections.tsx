import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  Title, Text, Tag, Icon, Button,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  ToolbarItem,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/unfavorite.js'
import '@ui5/webcomponents-icons/dist/nav-back.js'

interface CorrectionRec {
  id: string
  finding: string
  recommendation: string
  count: number
  relevance: number
  impact: 1 | 2 | 3
  effort: 1 | 2 | 3
  valueDriver: string
  improvementOpp: string
  rootCause: string
}

// The 5 data readiness corrections (Obsolete Data + System Error root causes)
const DATA_READINESS_CORRECTIONS: CorrectionRec[] = [
  { id: 'c2', finding: '892 production orders were found where the scheduled end date is in the past and that are still open', recommendation: 'Set the production orders to technically completed', count: 892, relevance: 1, impact: 3, effort: 2, valueDriver: 'Reduce Overall Supply Chain Planning Cost', improvementOpp: '', rootCause: 'Obsolete Data' },
  { id: 'c3', finding: '199 open production orders were found where the basic end date is in the past', recommendation: 'Check if production orders should proceed or if sales order should be cancelled', count: 199, relevance: 1, impact: 3, effort: 2, valueDriver: 'Improve On-Time Delivery Performance', improvementOpp: 'Improve on-time delivery performance', rootCause: 'Obsolete Data' },
  { id: 'c4', finding: '153 open outbound deliveries were found where the planned goods issue date is in the past', recommendation: 'Close outbound deliveries for which goods issue posting is no longer possible', count: 153, relevance: 1, impact: 2, effort: 2, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data', rootCause: 'Obsolete Data' },
  { id: 'c8', finding: '42 error records were found from automatic goods movement postings', recommendation: 'Delete old and obsolete records', count: 42, relevance: 2, impact: 3, effort: 1, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data', rootCause: 'System Error' },
  { id: 'c9', finding: '38 open sales schedule lines in sales orders were found where the confirmed delivery date is in the past', recommendation: 'Reject sales order items where further delivery is not expected', count: 38, relevance: 1, impact: 2, effort: 2, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data in sales', rootCause: 'Obsolete Data' },
]

function ScoreDots({ score, max = 3, color }: { score: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: i < score ? color : 'var(--sapList_BorderColor)' }} />
      ))}
    </div>
  )
}

export default function CloudTransformationCorrections() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFav = useCallback((id: string) => setFavorites(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  }), [])

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      id: '__fav', Header: '', accessor: 'id', width: 44,
      disableResizing: true, disableSortBy: true,
      Cell: ({ row }: any) => {
        const { id } = row.original as CorrectionRec
        return (
          <Icon
            name={favorites.has(id) ? 'favorite' : 'unfavorite'}
            onClick={(e: any) => { e.stopPropagation(); toggleFav(id) }}
            style={{ cursor: 'pointer', color: favorites.has(id) ? 'var(--sapCriticalColor)' : 'var(--sapContent_LabelColor)', fontSize: '1rem' }}
          />
        )
      },
    },
    {
      Header: 'Finding', accessor: 'finding', minWidth: 200,
      Cell: ({ row }: any) => {
        const { finding } = row.original as CorrectionRec
        return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{finding.length > 90 ? finding.slice(0, 90) + '…' : finding}</Text>
      },
    },
    {
      Header: 'Recommendation', accessor: 'recommendation', minWidth: 200,
      Cell: ({ row }: any) => {
        const rec = row.original as CorrectionRec
        return (
          <Text
            style={{ color: 'var(--sapLinkColor)', cursor: 'pointer', fontSize: 'var(--sapFontSmallSize)' }}
            onClick={(e: any) => { e.stopPropagation(); navigate(`/recommendations/${rec.id}`) }}
          >
            {rec.recommendation.length > 70 ? rec.recommendation.slice(0, 70) + '…' : rec.recommendation}
          </Text>
        )
      },
    },
    {
      Header: 'N', accessor: 'count', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <Text style={{ display: 'block', textAlign: 'right' }}>{value.toLocaleString()}</Text>,
    },
    {
      Header: 'Impact', accessor: 'impact', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <ScoreDots score={value} color="#e9730c" />,
    },
    {
      Header: 'Effort', accessor: 'effort', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <ScoreDots score={value} color="#bb8822" />,
    },
    {
      Header: 'Value Driver', accessor: 'valueDriver', minWidth: 160,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>,
    },
    {
      Header: 'Root Cause', accessor: 'rootCause', width: 140, disableResizing: true,
      Cell: ({ value }: any) => <Tag design="Set2" colorScheme="3" style={{ fontSize: '0.6875rem' }}>{value}</Tag>,
    },
    {
      Header: 'Improvement Opp.', accessor: 'improvementOpp', minWidth: 160,
      Cell: ({ value }: any) => (
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: value ? 'var(--sapLinkColor)' : 'var(--sapContent_LabelColor)' }}>
          {value || '—'}
        </Text>
      ),
    },
  ], [favorites, toggleFav, navigate])

  return (
    <DynamicPage
      style={{ height: '100%' }}
      hidePinButton
      headerPinned
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem href="#/cloud-transformation">Cloud Transformation</SigBreadcrumbItem>
              <SigBreadcrumbItem>Data Readiness Corrections</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
          actionsBar={
            <Button icon="nav-back" design="Transparent" onClick={() => navigate('/cloud-transformation')}>
              Back
            </Button>
          }
        >
          <Title slot="heading" level="H3">Data Readiness Corrections</Title>
          <Tag design="Set2" colorScheme="3">Immediate Actions</Tag>
        </DynamicPageTitle>
      }
    >
      <SigTableWrapper
          titleSlot={
            <ToolbarItem>
              <Text style={{ fontWeight: '600', fontSize: '1rem' }}>
                Data Readiness Corrections ({DATA_READINESS_CORRECTIONS.length})
              </Text>
            </ToolbarItem>
          }
        >
          <AnalyticalTable
            data={DATA_READINESS_CORRECTIONS}
            columns={columns}
            rowHeight={44}
            headerRowHeight={32}
            selectionMode="None"
            visibleRowCountMode="Fixed"
            visibleRows={DATA_READINESS_CORRECTIONS.length}
            scaleWidthMode="Smart"
          />
        </SigTableWrapper>
    </DynamicPage>
  )
}
