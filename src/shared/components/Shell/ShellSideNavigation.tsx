import { useLocation } from 'react-router-dom'
import { SideNavigation, SideNavigationGroup, SideNavigationItem, Tag } from '@ui5/webcomponents-react'

// Single source of truth for nav text → path mapping.
// Adding a new nav item = one entry here + one SideNavigationItem below.
export const NAV_ROUTES: Record<string, string> = {
  'Home': '/home?fresh=1',
  'Newsfeed': '/newsfeed',
  'Favorites': '/favorites',
  'Recent': '/recent',
  'Repository': '/repository',
  'Process Landscape': '/process-landscape',
  'Value Accelerator Library': '/value-accelerator',
  'Discover': '/discover',
  'Strategy Execution': '/strategy-execution',
  'Benchmarking Analytics': '/benchmarking-analytics',
  'Insights': '/insights',
  'Semantic Views': '/semantic-views',
  'Risk Dashboard': '/risk-dashboard',
  'Improvement Opportunities': '/improvement-opportunities',
  'Recommendations': '/recommendations',
  'Cloud Transformation': '/cloud-transformation',
  'Modeler': '/modeler',
  'Reporting': '/reporting',
  'Workspace Settings': '/settings/users',
  'Process Consulting Agent': '/process-consulting-agent',
}

interface Props {
  audience: 'administrators' | 'modelers'
  onSelectionChange: (e: CustomEvent) => void
}

function isActive(pathname: string, path: string): boolean {
  const base = path.split('?')[0]
  return pathname === base || pathname.startsWith(base + '/')
}

export function ShellSideNavigation({ audience, onSelectionChange }: Props) {
  const { pathname } = useLocation()
  const s = (text: string) => isActive(pathname, NAV_ROUTES[text] ?? text)

  return (
    <SideNavigation slot="sideContent" onSelectionChange={onSelectionChange}>
      <SideNavigationItem icon="home" text="Home" selected={s('Home')} />
      <SideNavigationItem icon="SAP-icons-v4/news" text="Newsfeed" selected={s('Newsfeed')} />
      <SideNavigationItem icon="unfavorite" text="Favorites" selected={s('Favorites')} />
      <SideNavigationItem icon="history" text="Recent" selected={s('Recent')} />
      <SideNavigationItem icon="task" text="Tasks" />
      <SideNavigationGroup text="Browse and Manage" expanded>
        <SideNavigationItem icon="folder-blank" text="Repository" selected={s('Repository')} />
        <SideNavigationItem icon="SAP-icons-v4/navigation-map" text="Process Landscape" selected={s('Process Landscape')} />
        <SideNavigationItem icon="SAP-icons-v4/company-memory" text="Company Memory" />
        <SideNavigationItem icon="SAP-icons-v4/rocket" text="Value Accelerator Library" selected={s('Value Accelerator Library')} />
      </SideNavigationGroup>
      <SideNavigationGroup text="Transform and Realize Value" expanded>
        <SideNavigationItem icon="explorer" text="Discover" selected={s('Discover')} />
        {audience === 'administrators' && <SideNavigationItem icon="overview-chart" text="Strategy Execution" selected={s('Strategy Execution')} />}
        {audience === 'administrators' && <SideNavigationItem icon="compare-2" text="Benchmarking Analytics" selected={s('Benchmarking Analytics')} />}
        <SideNavigationItem icon="lightbulb" text="Insights" selected={s('Insights')} />
        <SideNavigationItem icon="alert" text="Risk Dashboard" selected={s('Risk Dashboard')} />
        {audience === 'administrators' && <SideNavigationItem icon="money-bills" text="Improvement Opportunities" selected={s('Improvement Opportunities')} />}
        {audience === 'administrators' && <SideNavigationItem icon="accept" text="Recommendations" selected={s('Recommendations')} />}
        {audience === 'administrators' && <SideNavigationItem icon="cloud" text="Cloud Transformation" selected={s('Cloud Transformation')} />}
      </SideNavigationGroup>
      {audience === 'administrators' && (
        <SideNavigationGroup text="Mine and Analyze" expanded>
          <SideNavigationItem icon="provision" text="Data Management" />
          <SideNavigationItem icon="developer-settings" text="Analysis Configuration" />
          <SideNavigationItem icon="SAP-icons-v4/process-intelligence" text="Process Analysis" />
          <SideNavigationItem icon="workflow-tasks" text="Analysis Workflows" />
          <SideNavigationItem icon="chain-link" text="Semantic Views" selected={s('Semantic Views')} />
        </SideNavigationGroup>
      )}
      <SideNavigationGroup text="Model and Govern" expanded>
        <SideNavigationItem icon="SAP-icons-v4/process-manager" text="Process Manager" />
        <SideNavigationItem icon="write-new" text="Modeler" selected={s('Modeler')}>
          <Tag slot="tag" design="Set2" colorScheme="5" hideStateIcon>Beta</Tag>
        </SideNavigationItem>
        <SideNavigationItem icon="SAP-icons-v4/customer-journey" text="Journey Models" />
        <SideNavigationItem icon="SAP-icons-v4/bpmn-type-service" text="Governance Workflows" />
      </SideNavigationGroup>
      <SideNavigationItem slot="fixedItems" icon="lab" text="Lab Space" />
      {audience === 'administrators' && <SideNavigationItem slot="fixedItems" icon="SAP-icons-v4/report" text="Reporting" selected={s('Reporting')} />}
      {audience === 'administrators' && <SideNavigationItem slot="fixedItems" icon="action-settings" text="Workspace Settings" selected={pathname.startsWith('/settings')} />}
    </SideNavigation>
  )
}
