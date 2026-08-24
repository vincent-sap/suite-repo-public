import React, { useState } from 'react'
import { Dialog, Button, Bar, TabContainer, Tab, Text, Link, TextArea, Label, Input, Icon } from '@ui5/webcomponents-react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import type { FileItem } from '../data'

interface EmbedDialogProps {
  file: FileItem
  onClose: () => void
}

export default function EmbedDialog({ file, onClose }: EmbedDialogProps) {
  const [embedShared, setEmbedShared] = useState(false)

  const fakeId = '9a51553a08444896b9cb3bcfd2d03b14'
  const fakeToken = '33edf276ab9ee0cdc6eea029ef97ca9cd71e41e8708cd6d9394c5e8714d5be30'
  const embedHtml = `<h3 class="signavio-title"><a href="https://www.signavio.com">${file.name}</a></h3>\n<script type="text/javascript"\n  src="https://editor.signavio.com/mashup/signavio.js"></script>\n<script type="text/plain">\n{\n  "url": "https://editor.signavio.com/p/model/${fakeId}",\n  "authToken": "${fakeToken}"\n}\n</script>`
  const pngUrl = `https://editor.signavio.com/p/model/${fakeId}/png?inline&authkey=${fakeToken}`

  return (
    <Dialog
      open
      headerText="Embed Diagram"
      onClose={onClose}
      className="no-padding-dialog"
      footer={
        <Bar endContent={<Button design="Transparent" onClick={onClose}>Close</Button>} />
      }
    >
      <div style={{ width: '560px', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
        <Text>
          Click on 'Share read access' and use the displayed HTML code for your wiki or blog.
          Follow the link 'Preview' to view the result. Attention: At the same time you grant
          read access to the diagram '{file.name}' beyond your SAP Signavio workspace.
        </Text>
        <Link onClick={() => setEmbedShared(v => !v)}>
          {embedShared ? 'Stop sharing the diagram for read-only access' : 'Share diagram for read-only access'}
        </Link>
        <TabContainer>
          <Tab text="Embedding">
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid var(--sapList_BorderColor)', background: 'var(--sapBaseColor)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', minHeight: '160px' }}>
                  <SigDomainObject size="L" object={file.type} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'center', wordBreak: 'break-word' }}>{file.name}</Text>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: 'var(--sapList_GroupHeaderBackground)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>HTML code (copy and embed)</Text>
                  </div>
                  <div style={{ flex: 1, padding: '0.75rem', background: 'var(--sapField_Background)' }}>
                    {embedShared ? (
                      <TextArea value={embedHtml} readonly rows={6} style={{ width: '100%', fontSize: 'var(--sapFontSmallSize)' } as React.CSSProperties} />
                    ) : (
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                        This diagram has not been marked for sharing yet. Please click on
                        'Share diagram for read-only access' in order to get the HTML code to embed the diagram.
                      </Text>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Label>Width (pixel)</Label>
                  <Icon name="information" />
                  <Input placeholder="auto" style={{ width: '5rem' } as React.CSSProperties} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Label>Height (pixel)</Label>
                  <Icon name="information" />
                  <Input placeholder="auto" style={{ width: '5rem' } as React.CSSProperties} />
                </div>
                <Link disabled={!embedShared}>Preview</Link>
              </div>
            </div>
          </Tab>
          <Tab text="Simple image">
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid var(--sapList_BorderColor)', background: 'var(--sapBaseColor)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', minHeight: '160px' }}>
                  <SigDomainObject size="L" object={file.type} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'center', wordBreak: 'break-word' }}>{file.name}</Text>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: 'var(--sapList_GroupHeaderBackground)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>Link to the PNG image</Text>
                  </div>
                  <div style={{ flex: 1, padding: '0.75rem', background: 'var(--sapField_Background)' }}>
                    {embedShared ? (
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', wordBreak: 'break-all' }}>{pngUrl}</Text>
                    ) : (
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                        Share the diagram for read-only access to generate the image link.
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tab>
        </TabContainer>
      </div>
    </Dialog>
  )
}
