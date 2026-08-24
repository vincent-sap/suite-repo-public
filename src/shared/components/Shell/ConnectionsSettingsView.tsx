import React, { useState } from 'react'
import {
  UserSettingsView,
  Text,
  Button,
  Input,
  Title,
  List,
  ListItemCustom,
  Dialog,
  Bar,
  Panel,
  SegmentedButton,
  SegmentedButtonItem,
  MessageStrip,
  Toast,
} from '@ui5/webcomponents-react'

const MCP_URL = 'https://mcp.signavio.com/sse'

const TOOL_SETUPS = [
  {
    id: 'joule',
    label: 'Joule Work',
    description: 'Enter this URL when configuring the MCP integration in SAP BTP Cockpit:',
    snippet: MCP_URL,
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    description: 'Add to claude_desktop_config.json (macOS: ~/Library/Application Support/Claude/):',
    snippet: JSON.stringify({ mcpServers: { signavio: { type: 'sse', url: MCP_URL } } }, null, 2),
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    description: 'Run in your terminal:',
    snippet: `claude mcp add --transport sse signavio ${MCP_URL}`,
  },
  {
    id: 'vscode',
    label: 'VS Code',
    description: 'Add to .vscode/mcp.json in your project:',
    snippet: JSON.stringify({ servers: { signavio: { type: 'sse', url: MCP_URL } } }, null, 2),
  },
  {
    id: 'cursor',
    label: 'Cursor',
    description: 'Add to ~/.cursor/mcp.json:',
    snippet: JSON.stringify({ mcpServers: { signavio: { type: 'sse', url: MCP_URL } } }, null, 2),
  },
]

const INITIAL_CONNECTIONS = [
  { id: '1', tool: 'Claude Desktop', lastActive: 'Just now' },
  { id: '2', tool: 'Claude Code', lastActive: '3 hours ago' },
  { id: '3', tool: 'VS Code (GitHub Copilot)', lastActive: 'Yesterday' },
]

const codeBlockStyle: React.CSSProperties = {
  margin: 0,
  padding: '0.625rem 3rem 0.625rem 0.75rem',
  background: 'var(--sapField_Background)',
  border: '1px solid var(--sapField_BorderColor)',
  borderRadius: 'var(--sapElement_BorderCornerRadius)',
  fontFamily: "'72Mono', 'Courier New', monospace",
  fontSize: '12px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: 'var(--sapTextColor)',
}

export function ConnectionsSettingsView() {
  const [urlCopied, setUrlCopied] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState(TOOL_SETUPS[0].id)
  const AnySegItem = SegmentedButtonItem as React.FC<any>
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS)
  const [revokeTarget, setRevokeTarget] = useState<typeof INITIAL_CONNECTIONS[0] | null>(null)
  const [revokeSuccess, setRevokeSuccess] = useState(false)

  const selectedSetup = TOOL_SETUPS.find(t => t.id === selectedTool)!

  const copyUrl = () => {
    navigator.clipboard.writeText(MCP_URL)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const copySnippet = () => {
    navigator.clipboard.writeText(selectedSetup.snippet)
    setCopiedSnippet(selectedTool)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const confirmRevoke = () => {
    if (revokeTarget) {
      setConnections(prev => prev.filter(c => c.id !== revokeTarget.id))
      setRevokeTarget(null)
      setRevokeSuccess(true)
    }
  }

  return (
    <UserSettingsView text="MCP Connections">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 0 1.5rem' }}>

        {/* MCP Server URL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
            Connect AI assistants to your Signavio workspace to search processes, explore diagrams, and get answers through natural language.
          </Text>
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
            Paste this address into your AI tool to connect it to SAP Signavio. You will be prompted to sign in once to authorize access.
          </Text>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <Input value={MCP_URL} readonly style={{ flex: 1 }} />
            <Button icon={urlCopied ? 'accept' : 'copy'} design="Default" onClick={copyUrl}>
              {urlCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Setup Instructions — collapsed by default */}
        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
        <Panel collapsed headerText="Setup Instructions" headerLevel="H5" className="no-shadow" style={{ '--sapFontHeader5Size': 'var(--sapFontSize)' } as React.CSSProperties}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem 0 0.25rem' }}>
            <SegmentedButton>
              {TOOL_SETUPS.map(tool => (
                <AnySegItem
                  key={tool.id}
                  pressed={selectedTool === tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  {tool.label}
                </AnySegItem>
              ))}
            </SegmentedButton>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              {selectedSetup.description}
            </Text>
            <div style={{ position: 'relative' }}>
              <pre style={codeBlockStyle}>{selectedSetup.snippet}</pre>
              <Button
                icon={copiedSnippet === selectedTool ? 'accept' : 'copy'}
                design="Transparent"
                onClick={copySnippet}
                tooltip={copiedSnippet === selectedTool ? 'Copied!' : 'Copy'}
                style={{ position: 'absolute', top: '0.25rem', right: '0.25rem' }}
              />
            </div>
          </div>
        </Panel>
        </div>

        {/* Active Connections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Title level="H4">Active Connections</Title>
          {connections.length === 0 ? (
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
              No active connections. Copy the MCP Server URL above and configure it in your AI tool to get started.
            </Text>
          ) : (
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
              <List separators="Inner">
                {connections.map(conn => (
                  <ListItemCustom key={conn.id} type="Inactive" accessibleName={conn.tool}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.375rem 0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                          {conn.tool}
                        </Text>
                        <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                          Last active: {conn.lastActive}
                        </Text>
                      </div>
                      <Button
                        design="Negative"
                        onClick={() => setRevokeTarget(conn)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </ListItemCustom>
                ))}
              </List>
            </div>
          )}
        </div>
      </div>

      {/* Revoke confirmation dialog */}
      <Dialog
        open={!!revokeTarget}
        headerText="Revoke Connection"
        className="dialog-padding-s"
        onClose={() => setRevokeTarget(null)}
        footer={
          <Bar design="Footer">
            <Button slot="endContent" design="Negative" onClick={confirmRevoke}>Revoke</Button>
            <Button slot="endContent" onClick={() => setRevokeTarget(null)}>Cancel</Button>
          </Bar>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This action cannot be undone.
          </MessageStrip>
          <Text>
            <strong>{revokeTarget?.tool}</strong> will lose access to SAP Signavio immediately. It will need to sign in again to reconnect.
          </Text>
        </div>
      </Dialog>

      <Toast open={revokeSuccess} placement="BottomCenter" onClose={() => setRevokeSuccess(false)}>
        Connection revoked.
      </Toast>
    </UserSettingsView>
  )
}
