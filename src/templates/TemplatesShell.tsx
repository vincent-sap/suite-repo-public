import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './shell.css'

const GROUPS = [
  {
    label: 'Settings Page',
    variants: [
      { path: 'settings',      label: 'Narrow' },
      { path: 'settings-wide', label: 'Wide' },
    ],
  },
  {
    label: 'Table Settings Page',
    variants: [
      { path: 'table-settings',      label: 'Narrow' },
      { path: 'table-settings-wide', label: 'Wide' },
    ],
  },
  { label: 'Tabbed Page',              variants: [{ path: 'tabbed',      label: 'Tabbed Page' }] },
  { label: 'Two-Column Master–Detail', variants: [
    { path: 'two-column',       label: 'Detail Page' },
    { path: 'two-column-panel', label: 'Side Panel' },
  ]},
  { label: 'Side Nav + Content', variants: [
    { path: 'side-nav',      label: 'Narrow' },
    { path: 'side-nav-wide', label: 'Wide' },
  ]},
]

function currentPath(pathname: string) {
  return GROUPS.flatMap(g => g.variants).find(v => pathname.endsWith('/' + v.path))?.path ?? null
}

export default function TemplatesShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isOverview = location.pathname === '/templates' || location.pathname === '/templates/'
  const active = currentPath(location.pathname)
  const activeGroup = active ? GROUPS.find(g => g.variants.some(v => v.path === active)) : null
  const hasSubRow = activeGroup && activeGroup.variants.length > 1

  return (
    <div className="tpl-shell">

      {/* Row 1 — group tabs */}
      <div className="tpl-shell-row1">
        <span
          onClick={() => navigate('/templates')}
          className="tpl-shell-home"
          style={{
            background: isOverview ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: isOverview ? '#fff' : 'rgba(255,255,255,0.6)',
          }}
        >
          Overview
        </span>
        <span className="tpl-shell-separator" />
        {GROUPS.map(g => {
          const isActive = !!active && g.variants.some(v => v.path === active)
          return (
            <button
              key={g.label}
              onClick={() => navigate(`/templates/${g.variants[0].path}`)}
              className="tpl-shell-btn"
              style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* Row 2 — variant tabs (only when group has multiple variants) */}
      {hasSubRow && (
        <div className="tpl-shell-row2">
          {activeGroup.variants.map(v => {
            const isActive = active === v.path
            return (
              <button
                key={v.path}
                onClick={() => navigate(`/templates/${v.path}`)}
                className="tpl-shell-btn-sub"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div
        className="tpl-shell-content"
        style={{ height: `calc(100vh - 2.75rem${hasSubRow ? ' - 2.75rem' : ''})` }}
      >
        <Outlet />
      </div>

    </div>
  )
}
