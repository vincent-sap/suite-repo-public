import { Dialog, Text, Button, Bar, Link, Avatar } from '@ui5/webcomponents-react'

type Owner = { name: string; email: string; initials: string; colorScheme: string }

type Props = {
  open: boolean
  onClose: () => void
  additionalInfo?: string
  owner?: Owner
}

const labelStyle: React.CSSProperties = {
  color: 'var(--sapContent_LabelColor)',
  fontSize: 'var(--sapFontSmallSize)',
  display: 'block',
  marginBottom: '0.2rem',
}

const rowStyle: React.CSSProperties = {
  padding: '0.75rem 0',
}

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--sapList_BorderColor)',
}

export default function AboutDialog({ open, onClose, additionalInfo, owner }: Props) {
  return (
    <Dialog
      open={open}
      headerText="About"
      onClose={onClose}
      className="dialog-padding-s"
      style={{ width: '26rem' }}
    >
      <div>

        <div style={rowStyle}>
          <Text style={labelStyle}>Workspace ID</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Text style={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', fontSize: 'var(--sapFontSmallSize)' }}>
              a2f2b6be2c084ff99680a2afa8f7e2a8
            </Text>
            <Button
              icon="copy"
              design="Transparent"
              tooltip="Copy"
              onClick={() => navigator.clipboard.writeText('a2f2b6be2c084ff99680a2afa8f7e2a8')}
            />
          </div>
        </div>

        <div style={dividerStyle} />

        <div style={rowStyle}>
          <Text style={labelStyle}>Version</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Text style={{ flex: 1 }}>v4.14.17</Text>
            <Button
              icon="copy"
              design="Transparent"
              tooltip="Copy"
              onClick={() => navigator.clipboard.writeText('v4.14.17')}
            />
          </div>
        </div>

        {owner && (
          <>
            <div style={dividerStyle} />
            <div style={rowStyle}>
              <Text style={labelStyle}>Workspace Owner</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
                <Avatar initials={owner.initials} colorScheme={owner.colorScheme as any} size="XS" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
                  <Text style={{ lineHeight: '1.2' }}>{owner.name}</Text>
                  <Link href={`mailto:${owner.email}`}>{owner.email}</Link>
                </div>
                <Button
                  icon="copy"
                  design="Transparent"
                  tooltip="Copy Email Address"
                  onClick={() => navigator.clipboard.writeText(owner.email)}
                />
              </div>
            </div>
          </>
        )}

        {additionalInfo && (
          <>
            <div style={dividerStyle} />
            <div style={rowStyle}>
              <Text style={labelStyle}>Additional Information</Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{additionalInfo}</Text>
            </div>
          </>
        )}

      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" onClick={onClose}>Close</Button>
      </Bar>
    </Dialog>
  )
}
