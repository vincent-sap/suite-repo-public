import { useNavigate } from 'react-router-dom'
import './shell.css'

const TEMPLATES = [
  {
    path: 'settings',
    label: 'Settings Page',
    description: 'Narrow form layout. Use for workspace settings, policies, and configuration.',
  },
  {
    path: 'settings-wide',
    label: 'Settings Page — Wide',
    description: 'Full-width table directly in PageHeader. Use for configuration tables and resource lists.',
  },
  {
    path: 'table-settings',
    label: 'Table Settings Page',
    description: 'Narrow form + audience filter + table nested in a SettingsSection.',
  },
  {
    path: 'table-settings-wide',
    label: 'Table Settings Page — Wide',
    description: 'Full-width table with audience filter above. Use for audience-scoped resource lists.',
  },
  {
    path: 'tabbed',
    label: 'Tabbed Page',
    description: 'ObjectPage with mode="IconTabBar". Use for complex detail views with multiple aspects.',
  },
  {
    path: 'two-column',
    label: 'Two-Column — Detail Page',
    description: 'FlexibleColumnLayout with a master list left and a DynamicPage detail on the right.',
  },
  {
    path: 'two-column-panel',
    label: 'Two-Column — Side Panel',
    description: 'FlexibleColumnLayout with a master list left and a SigRightSidePanel on the right.',
  },
  {
    path: 'side-nav',
    label: 'Side Nav + Content',
    description: 'DynamicPage with a left navigation list. Collapses to single column on narrow viewports.',
  },
]

export default function TemplatesIndex() {
  const navigate = useNavigate()

  return (
    <div className="tpl-index-wrap">
      <div className="tpl-index-header">
        <div className="tpl-index-title">Layout Templates</div>
        <div className="tpl-index-subtitle">
          Select a template to see a live example. Each template uses real components with minimal dummy content — ready to rebuild with real APIs.
        </div>
      </div>

      {TEMPLATES.map(t => (
        <div
          key={t.path}
          onClick={() => navigate(`/templates/${t.path}`)}
          className="tpl-index-card"
        >
          <div className="tpl-index-card-body">
            <div className="tpl-index-card-label">{t.label}</div>
            <div className="tpl-index-card-desc">{t.description}</div>
          </div>
          <span className="tpl-index-card-arrow">→</span>
        </div>
      ))}

      <a
        href="https://github.tools.sap/signavio-experience/explorer-sunset/raw/main/src/templates/TEMPLATES.md"
        target="_blank"
        rel="noreferrer"
        className="tpl-index-card tpl-index-card--secondary"
      >
        <div className="tpl-index-card-body">
          <div className="tpl-index-card-label">Intent & Usage Guide</div>
          <div className="tpl-index-card-desc">When to use each layout, component specs, and rebuild instructions for Claude.</div>
        </div>
        <span className="tpl-index-card-arrow">↗</span>
      </a>
    </div>
  )
}
