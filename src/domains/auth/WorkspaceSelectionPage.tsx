import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Link, List, ListItemStandard, Tag } from '@ui5/webcomponents-react'
import SapSignavioBrand from './SapSignavioBrand'
import loginBg from '../../assets/LoginBackground.jpg'
import { useAuth } from '../../contexts/AuthContext'
import s from './LoginPage.module.css'
import ws from './WorkspaceSelectionPage.module.css'

const WORKSPACES = [
  { id: 'demo-innovation', label: 'Demo Innovation Team' },
  { id: 'btm-golden', label: 'BTM Golden Demo' },
  { id: 'demo-sap', label: 'Demo SAP (GA)' },
  { id: 'jm-user-testing', label: 'JM User Testing' },
  { id: 'jira-mining', label: 'Jira Mining' },
  { id: 'plug-gain', label: 'Plug and gain by SAP Signavio - Demo Workspace' },
  { id: 'pre-release', label: 'Pre Release Production 2026' },
  { id: 'global-demo', label: 'SAP Signavio Global Demo Workspace' },
  { id: 'leanix', label: 'SAP Signavio LeanIX Integration' },
  { id: 'modeling', label: 'SAP Signavio Modeling and Governance workspace' },
  { id: 'pe-learning', label: 'SAP Signavio P&E Learning Workspace' },
  { id: 'process-explorer', label: 'SAP Signavio Process Explorer' },
  { id: 'dev-testing', label: 'Signavio (Dev Testing)' },
  { id: 'peyman', label: 'Signavio (Peyman Badakhshan)' },
  { id: 'ai-demo', label: 'Signavio AI Demospace - 1' },
  { id: 'suite-repo', label: 'Suite Repo Problem Space Demo' },
  { id: 'ux-benchmarking', label: 'UX benchmarking (IUF)' },
  { id: 'val-export', label: 'VAL Automated Tests Export' },
  { id: 'val-import', label: 'VAL Automated Tests Import' },
  { id: 'dpp-ngm', label: '[INTERNAL] DPP NGM Workspace' },
  { id: 'customer-ops', label: 'SAP Customer & Operations Lifecycle', sso: true },
  { id: 'sap-playground', label: 'SAP Playground', sso: true },
  { id: 'signavio-production', label: 'Signavio Production', sso: true },
]

export default function WorkspaceSelectionPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('jm-user-testing')

  return (
    <div className={s.page}>
      <div className={s.body}>
        {/* Left: form panel */}
        <div className={s.formPanel}>
          <div className={s.formPanelInner}>
            <div className={s.branding}>
              <SapSignavioBrand height={32} />
            </div>

            <div className={s.formArea}>
              <h1 className={s.cardTitle}>Select a Workspace</h1>

              <div className={ws.listContainer}>
                <List
                  selectionMode="Single"
                  onSelectionChange={(e) => {
                    const item = e.detail.selectedItems[0]
                    if (item) setSelected(item.dataset.id ?? '')
                  }}
                >
                  {WORKSPACES.map(wspace => (
                    <ListItemStandard
                      key={wspace.id}
                      data-id={wspace.id}
                      selected={selected === wspace.id}
                    >
                      {wspace.label}
                      {wspace.sso && (
                        <Tag style={{ marginLeft: '0.5rem' }} design="Neutral" size="S" hideStateIcon>SSO</Tag>
                      )}
                    </ListItemStandard>
                  ))}
                </List>
              </div>

              <div className={ws.wsFooterActions}>
                <Link onClick={() => auth.logout()} style={{ cursor: 'pointer' }}>
                  Sign in to a different account
                </Link>
                <Button design="Emphasized" onClick={() => { auth.selectWorkspace(); navigate('/home?fresh=1') }}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
          <footer className={s.pageFooter}>
            <a href="#" className={s.footerLink}>Privacy</a>
            <a href="#" className={s.footerLink}>Terms of use</a>
            <a href="#" className={s.footerLink}>Copyright</a>
            <a href="#" className={s.footerLink}>Cookie policy</a>
            <a href="#" className={s.footerLink}>Help</a>
          </footer>
        </div>

        {/* Right: branding image */}
        <div className={s.brandingPanel}>
          <div className={s.brandingImageWrapper}>
            <img src={loginBg} alt="" className={s.brandingImage} />
          </div>
        </div>
      </div>
    </div>
  )
}
