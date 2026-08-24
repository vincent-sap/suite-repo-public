import { useState } from 'react'
import {
  Bar,
  Button,
  Dialog,
  Input,
  Label,
  Menu,
  MenuItem,
  MessageStrip,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  Text,
  Title,
  ToolbarItem,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from '../settings/components/PageHeader'

type Connection = {
  id: string
  name: string
  tenantId: string
  targetUrl: string
  createdOn: string
}

const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: '1',
    name: 'Process Insights',
    tenantId: 'a137a632-1973-42bf-bea0-b2ca53a9e77e',
    targetUrl: 'https://signavio-next-prod.eu10.process-insights.cloud.sap',
    createdOn: 'Jan 22, 2025, 3:08 PM',
  },
]

function ConnectDialog({ open, onClose, onConnect }: { open: boolean; onClose: () => void; onConnect: (url: string) => void }) {
  const [url, setUrl] = useState('')

  const handleConnect = () => {
    if (!url.trim()) return
    onConnect(url.trim())
    setUrl('')
  }

  const handleClose = () => {
    setUrl('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      className="ui5-content-density-compact"
      style={{ width: '36rem' }}
      onClose={handleClose}
      header={
        <Bar design="Header" style={{ width: '100%' }}>
          <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
            Connect to Process Insights
          </Text>
        </Bar>
      }
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" onClick={handleConnect} disabled={!url.trim()}>Connect</Button>
              <Button design="Transparent" onClick={handleClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <Label for="pi-url" required>Enter Target URL of the Process Insights Tenant</Label>
          <Input
            id="pi-url"
            value={url}
            placeholder="https://mytenant.eu10.process-insights.cloud.sap"
            style={{ width: '100%', marginTop: '0.25rem' }}
            onInput={e => setUrl((e.target as unknown as HTMLInputElement).value)}
          />
        </div>
        <MessageStrip design="Critical" hideCloseButton={false}>
          If security settings are not properly configured when connecting tenants, users may not be able to view
          process flows in SAP Signavio Process Insights. The browser may block the connected SAP Signavio Process
          Manager tenant, making page unusable.{' '}
          <a href="#" style={{ color: 'inherit' }}>Learn More</a>
        </MessageStrip>
      </div>
    </Dialog>
  )
}

export default function ProcessInsights() {
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [disconnectTarget, setDisconnectTarget] = useState<Connection | null>(null)

  const handleConnect = (url: string) => {
    const id = String(Date.now())
    setConnections(prev => [
      ...prev,
      {
        id,
        name: 'Process Insights',
        tenantId: crypto.randomUUID(),
        targetUrl: url,
        createdOn: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      },
    ])
    setDialogOpen(false)
  }

  const confirmDisconnect = () => {
    if (!disconnectTarget) return
    setConnections(prev => prev.filter(c => c.id !== disconnectTarget.id))
    setDisconnectTarget(null)
  }

  return (
    <PageHeader title="SAP Signavio Process Insights" subtitle="Connect and configure the integration with SAP Signavio Process Insights for your workspace.">
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
              Connected Systems ({connections.length})
            </Title>
          </ToolbarItem>
        }
        businessActionsSlot={
          <ToolbarItem>
            <Button design="Emphasized" onClick={() => setDialogOpen(true)}>
              Add Connection
            </Button>
          </ToolbarItem>
        }
      >
        <Table
          headerRow={
            <TableHeaderRow>
              <TableHeaderCell>Name of the System</TableHeaderCell>
              <TableHeaderCell>Tenant ID</TableHeaderCell>
              <TableHeaderCell>Target Tenant URL</TableHeaderCell>
              <TableHeaderCell>Created On</TableHeaderCell>
              <TableHeaderCell />
            </TableHeaderRow>
          }
        >
          {connections.map(conn => {
            const btnId = `pi-overflow-${conn.id}`
            return (
              <TableRow key={conn.id}>
                <TableCell><Text>{conn.name}</Text></TableCell>
                <TableCell><Text>{conn.tenantId}</Text></TableCell>
                <TableCell><Text>{conn.targetUrl}</Text></TableCell>
                <TableCell><Text>{conn.createdOn}</Text></TableCell>
                <TableCell>
                  <Button
                    id={btnId}
                    design="Transparent"
                    icon="overflow"
                    tooltip="More Options"
                    onClick={(e: any) => { e.stopPropagation(); setOpenOverflowId(openOverflowId === conn.id ? null : conn.id) }}
                  />
                  <Menu
                    opener={btnId}
                    open={openOverflowId === conn.id}
                    onClose={() => setOpenOverflowId(null)}
                    onItemClick={() => {
                      setOpenOverflowId(null)
                      setDisconnectTarget(conn)
                    }}
                  >
                    <MenuItem text="Disconnect" icon="chain-link" />
                  </Menu>
                </TableCell>
              </TableRow>
            )
          })}
        </Table>
      </SigTableWrapper>

      <ConnectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConnect={handleConnect}
      />

      <Dialog
        open={!!disconnectTarget}
        className="ui5-content-density-compact"
        style={{ width: '30rem' }}
        onClose={() => setDisconnectTarget(null)}
        header={
          <Bar design="Header" style={{ width: '100%' }}>
            <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
              Disconnect System
            </Text>
          </Bar>
        }
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Negative" onClick={confirmDisconnect}>Disconnect</Button>
                <Button design="Transparent" onClick={() => setDisconnectTarget(null)}>Cancel</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text>
            Do you want to disconnect <strong>{disconnectTarget?.name}</strong>? Users will no longer be able
            to view process flows from the connected SAP Signavio Process Insights tenant.
          </Text>
          <Text style={{ color: 'var(--sapCriticalColor)', fontSize: 'var(--sapFontSmallSize)' }}>
            This action cannot be undone.
          </Text>
        </div>
      </Dialog>
    </PageHeader>
  )
}
