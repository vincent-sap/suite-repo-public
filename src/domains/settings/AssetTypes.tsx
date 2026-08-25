import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  List, ListItemGroup, ListItemCustom,
  Input, ToolbarItem, Icon, Text,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import s from './components/SettingsPage.module.css'

import { ASSET_TYPES } from '../../data/assetTypes'

type Group = { label: string; ids: string[] }

const GROUPS: Group[] = [
  { label: 'Modeling',                  ids: ['bpmn', 'dmn', 'value-chain', 'nav-map'] },
  { label: 'Transformation Management', ids: ['objective', 'initiative', 'insight'] },
  { label: 'Analysis and Mining',       ids: ['dashboard', 'process-semantic-view'] },
]

export default function AssetTypes() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  const filteredGroups = GROUPS.map(g => ({
    ...g,
    items: g.ids
      .map(id => ASSET_TYPES.find(t => t.id === id)!)
      .filter(t => !query || t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)),
  })).filter(g => g.items.length > 0)

  return (
    <PageHeader title="Asset Types" subtitle="Configure attributes and settings for each asset type.">
      <div className={s.narrowContent}>
      <SigTableWrapper
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName="Search asset types"
              placeholder="Search asset types"
              value={search}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
              icon={<Icon slot="icon" name="search" />}
              style={{ width: '240px' }}
            />
          </ToolbarItem>
        }
      >
        <List separators="Inner">
          {filteredGroups.map(group => (
            <ListItemGroup key={group.label} headerText={group.label}>
              {group.items.map(t => (
                <ListItemCustom
                  key={t.id}
                  type="Active"
                  onClick={() => navigate(`/settings/asset-types/${t.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                    {t.id === 'process-semantic-view' ? (
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="SAP-icons-v4/process-data-view" style={{ width: '16px', height: '16px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '16px' }} />
                      </div>
                    ) : (
                      <SigDomainObject object={t.domainObject} size="XS" />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)' }}>{t.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{t.description}</Text>
                    </div>
                  </div>
                </ListItemCustom>
              ))}
            </ListItemGroup>
          ))}
          {filteredGroups.length === 0 && (
            <ListItemCustom key="empty" type="Inactive">
              No asset types match your search.
            </ListItemCustom>
          )}
        </List>
      </SigTableWrapper>
      </div>
    </PageHeader>
  )
}
