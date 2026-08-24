import { useState, useRef } from 'react'
import {
  Text, Button, Icon, Input, Link,
  Menu, MenuItem,
  Dialog, Bar, Label,
  List, ListItemCustom,
} from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import { useWorkspace, type HelpLink } from '../../contexts/WorkspaceContext'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
// import { StickyNote } from '../../shared/components/StickyNote' // R27 Q2

export default function HelpResources() {
  const { helpLinks: links, setHelpLinks: setLinks } = useWorkspace()
  const [isDirty, setIsDirty] = useState(false)
  const savedLinks = useRef(links)

  const mutateLinks = (updater: (prev: typeof links) => typeof links) => {
    setLinks(updater)
    setIsDirty(true)
  }

  const handleSave = () => {
    savedLinks.current = links
    setIsDirty(false)
  }

  const handleReset = () => {
    setLinks(savedLinks.current)
    setIsDirty(false)
  }

  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLabel, setCreateLabel] = useState('')
  const [createUrl, setCreateUrl] = useState('')

  const [editLink, setEditLink] = useState<HelpLink | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const openEditDialog = (link: HelpLink) => {
    setEditLink(link)
    setEditLabel(link.label)
    setEditUrl(link.url)
  }

  const handleCreate = () => {
    mutateLinks(prev => [...prev, { id: Date.now().toString(), label: createLabel, url: createUrl }])
    setCreateOpen(false)
    setCreateLabel('')
    setCreateUrl('')
  }

  const handleSaveEdit = () => {
    if (!editLink) return
    mutateLinks(prev => prev.map(l => l.id === editLink.id ? { ...l, label: editLabel, url: editUrl } : l))
    setEditLink(null)
  }

  const moveLink = (id: string, direction: 'up' | 'down') => {
    mutateLinks(prev => {
      const index = prev.findIndex(l => l.id === id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setOpenMenu(null)
  }

  const deleteLink = (id: string) => mutateLinks(prev => prev.filter(l => l.id !== id))

  return (
    <PageHeader
      title="Help Resources"
      subtitle="Define custom help links that appear in the help menu."
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
    >
      <Dialog open={createOpen} headerText="Create Help Link" onClose={() => setCreateOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '26rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <Label for="create-label">Help Menu Text:</Label>
            <Input id="create-label" placeholder="Descriptive name for the link" value={createLabel}
              onInput={e => setCreateLabel((e.target as unknown as HTMLInputElement).value)} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <Label for="create-url">Help Link:</Label>
            <Input id="create-url" placeholder="Paste or type a URL" value={createUrl}
              onInput={e => setCreateUrl((e.target as unknown as HTMLInputElement).value)} style={{ width: '100%' }} />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleCreate}>Create</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setCreateOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <Dialog open={editLink !== null} headerText="Edit Help Link" onClose={() => setEditLink(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '26rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <Label for="edit-label">Help Menu Text:</Label>
            <Input id="edit-label" value={editLabel}
              onInput={e => setEditLabel((e.target as unknown as HTMLInputElement).value)} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <Label for="edit-url">Help Link:</Label>
            <Input id="edit-url" value={editUrl}
              onInput={e => setEditUrl((e.target as unknown as HTMLInputElement).value)} style={{ width: '100%' }} />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleSaveEdit}>Save</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setEditLink(null)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* R27 Q2: audience notice — hidden until audience-specific help links are introduced
      <StickyNote
        position="right"
        text="Help Resources are currently <strong>not audience-specific</strong>: the same links are shown to all audiences, so modeler help is also shown to the general audience.<br><br>If audience-specific help links are introduced, the <b>Copy Settings</b> dialog would also need a Help Resources section."
      />
      */}
      <SettingsPageLayout>

        <SettingsSection
          title="Help Links"
          subtitle="Define custom entries for the help menu."
          action={<Button icon="add" design="Emphasized" onClick={() => setCreateOpen(true)}>Create Help Link</Button>}
        >
          {links.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No help links configured</Text>
            </div>
          )}
          <List
            onMoveOver={e => e.preventDefault()}
            onMove={e => {
              const sourceId = (e.detail.source.element as HTMLElement).dataset.id ?? ''
              const destId = (e.detail.destination.element as HTMLElement).dataset.id ?? ''
              const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
              if (!sourceId || !destId || placement === 'On') return
              mutateLinks(prev => {
                const from = prev.findIndex(l => l.id === sourceId)
                const to = prev.findIndex(l => l.id === destId)
                if (from === -1 || to === -1) return prev
                const next = [...prev]
                const [item] = next.splice(from, 1)
                const insertAt = placement === 'Before' ? (to > from ? to - 1 : to) : (to < from ? to + 1 : to)
                next.splice(insertAt, 0, item)
                return next
              })
              setIsDirty(true)
            }}
          >
            {links.map((link, idx) => (
              <ListItemCustom
                key={link.id}
                movable
                data-id={link.id}
                type="Inactive"
                style={{ padding: 0 }}
              >
                {/*
                  pointer-events: none on the outer div lets drag events reach the
                  shadow <li> (which is draggable when movable is set). Without this,
                  e.target in ListItem._ondragstart is our div, not the shadow <li>,
                  so the drag guard `e.target === this._listItem` fails and DnD breaks.
                  Interactive zones override to pointer-events: auto.
                */}
                <div style={{
                  display: 'flex', alignItems: 'center', width: '100%',
                  height: '3.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem',
                  gap: '0.75rem', boxSizing: 'border-box', pointerEvents: 'none',
                }}>
                  <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</Text>
                    <Link href={`https://${link.url}`} target="_blank" style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', pointerEvents: 'auto' }}>
                      {link.url}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto', flexShrink: 0 }}>
                    <Button icon="edit" design="Transparent" accessibleName="Edit" tooltip="Edit"
                      onClick={e => { e.stopPropagation(); openEditDialog(link) }} />
                    <Button icon="delete" design="Transparent" accessibleName="Delete" tooltip="Delete"
                      onClick={e => { e.stopPropagation(); deleteLink(link.id) }} />
                    <Button
                      id={`overflow-${link.id}`}
                      icon="overflow"
                      design="Transparent"
                      accessibleName="More Options"
                      tooltip="More Options"
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === link.id ? null : link.id) }}
                    />
                  </div>
                </div>
                <Menu
                  opener={`overflow-${link.id}`}
                  open={openMenu === link.id}
                  onClose={() => setOpenMenu(null)}
                  onItemClick={e => {
                    const text = (e.detail.item as HTMLElement).getAttribute('text') ?? ''
                    if (text === 'Move Up') moveLink(link.id, 'up')
                    else if (text === 'Move Down') moveLink(link.id, 'down')
                    setOpenMenu(null)
                  }}
                >
                  <MenuItem text="Move Up" icon="slim-arrow-up" disabled={idx === 0} />
                  <MenuItem text="Move Down" icon="slim-arrow-down" disabled={idx === links.length - 1} />
                </Menu>
              </ListItemCustom>
            ))}
          </List>
        </SettingsSection>

      </SettingsPageLayout>
    </PageHeader>
  )
}
