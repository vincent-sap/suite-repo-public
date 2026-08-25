import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  Title, Breadcrumbs, BreadcrumbsItem,
  Text, Button, Bar, Toast, Toolbar, ToolbarButton,
  Icon, Menu, MenuItem, MenuSeparator,
} from '@ui5/webcomponents-react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { ASSET_TYPES } from '../../data/assetTypes'
import { SUB_ELEMENTS } from '../../data/assetTypes'
import AttributeEditorPanel, { makeDictCategoryGroups, type AttrGroup } from './components/AttributeEditorPanel'
import { CAT_TYPE_ICON } from '../repository/Repository/dictionaryData'
import type { DictCategoryType } from '../../contexts/WorkspaceContext'
import AudienceSectionBar from './components/AudienceSectionBar'

const ACCENT_TEXT_TO_BG: Record<string, string> = {
  '#a45d00': '#fff3b8', '#aa0808': '#ffd0e7', '#ba066c': '#ffdbe7',
  '#a100c2': '#ffdcf3', '#552cff': '#ded3ff', '#0057d2': '#d1efff',
  '#046c7a': '#c2fcee', '#256f3a': '#ebf5cb', '#6c32a9': '#ddccf0',
  '#556b82': '#eaecee',
}
import { AddDictionaryCategoryDialog } from './components/AddDictionaryCategoryDialog'
import { DeleteCategoryDialog } from './components/DeleteCategoryDialog'


export default function DictionaryCategoryDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { dictCategories, addDictCategory, updateDictCategory, deleteDictCategory, deleteDictCategoryMoveChildren } = useWorkspace()

  const category = dictCategories.find(c => c.id === id)
  const parent = category?.parentId ? dictCategories.find(c => c.id === category.parentId) : undefined

  const [attrGroups, setAttrGroups] = useState<AttrGroup[]>(makeDictCategoryGroups)
  const [dirty, setDirty] = useState(false)
  const [saveToast, setSaveToast] = useState(false)
  const [actionToast, setActionToast] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createSubOpen, setCreateSubOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null)
  const [dictAudience, setDictAudience] = useState<string>('General audience')

  const isEnabled = pendingEnabled !== null ? pendingEnabled : (category?.enabled ?? true)

  useEffect(() => {
    const msg = (location.state as any)?.toast
    if (msg) { setActionToast(msg); window.history.replaceState({}, '') }
  }, [location.state])

  const markDirty = () => { if (!dirty) setDirty(true) }
  const handleSave = () => {
    if (pendingEnabled !== null) updateDictCategory(id, { enabled: pendingEnabled })
    setPendingEnabled(null)
    setDirty(false)
    setSaveToast(true)
  }
  const handleCancel = () => { setPendingEnabled(null); setDirty(false) }

  if (!category) {
    return (
      <div style={{ padding: '2rem' }}>
        <Text>Category not found</Text>
        <Button design="Transparent" onClick={() => navigate('/settings/dictionary-categories')}>Back to Dictionary Categories</Button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <DynamicPage style={{ height: '100%' }} hidePinButton showFooter={dirty}
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleCancel}>Cancel</Button>
          </Bar>
        }
        titleArea={
        <DynamicPageTitle>
          <Breadcrumbs slot="breadcrumbs">
            <BreadcrumbsItem onClick={() => navigate('/settings/dictionary-categories')} style={{ cursor: 'pointer' }}>
              Dictionary Categories
            </BreadcrumbsItem>
            {parent && (
              <BreadcrumbsItem onClick={() => navigate(`/settings/dictionary-categories/${parent.id}`)} style={{ cursor: 'pointer' }}>
                {parent.name}
              </BreadcrumbsItem>
            )}
            <BreadcrumbsItem>{category.name}</BreadcrumbsItem>
          </Breadcrumbs>
          <div slot="heading" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div aria-hidden="true" style={{
              width: '2rem', height: '2rem', borderRadius: '8px',
              background: category.color, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isEnabled ? 1 : 0.4,
            }}>
              <Icon
                name={CAT_TYPE_ICON[category.type as DictCategoryType] ?? 'SAP-icons-v4/process-manager'}
                style={{ color: ACCENT_TEXT_TO_BG[category.color] ?? '#fff', width: '1rem', height: '1rem', fontSize: '1rem' }}
              />
            </div>
            <Title level="H3" style={{ fontSize: 'var(--sapObjectHeader_Title_FontSize)', opacity: isEnabled ? 1 : 0.4 }}>{category.name}</Title>
            {!isEnabled && (
              <Icon name="hide" style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0 }} />
            )}
          </div>
          <Toolbar slot="actionsBar">
            <ToolbarButton text="Edit" onClick={() => setEditDialogOpen(true)} />
            <ToolbarButton id="dict-cat-detail-overflow" icon="overflow" design="Transparent" onClick={() => setOverflowOpen(true)} />
          </Toolbar>
        </DynamicPageTitle>
      }>

        <AudienceSectionBar
          value={dictAudience}
          onChange={setDictAudience}
          subtitle="Visibility settings apply to the selected audience only. All other settings apply to all audiences."
        />
        <AttributeEditorPanel
          attrGroups={attrGroups}
          setAttrGroups={setAttrGroups}
          markDirty={markDirty}
          hideRequiredColumn
          hideCreateGroup
          dictCategoryMode
          dictMode
          dictCategories={dictCategories}
          defaultAssignedTo={[category.name]}
          assignableAssetTypes={[
            ...ASSET_TYPES.filter(t => t.notation).map(t => ({ id: t.id, name: t.name })),
            ...dictCategories.map(c => ({ id: c.id, name: c.name })),
          ]}
          modelingSubElements={Object.values(SUB_ELEMENTS).flat().filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)}
          singleAudienceMode
          viewingAudience={dictAudience}
        />
      </DynamicPage>

      <Menu
        opener="dict-cat-detail-overflow"
        open={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        onItemClick={(e: any) => {
          const text = e.detail?.item?.text ?? e.detail?.item?.textContent
          if (text === 'Create Sub Category') setCreateSubOpen(true)
          else if (text === 'Enable' || text === 'Disable') { setPendingEnabled(!isEnabled); markDirty() }
          else if (text === 'Delete') setDeleteDialogOpen(true)
          setOverflowOpen(false)
        }}
      >
        <MenuItem text="Create Sub Category" icon="add" />
        <MenuSeparator />
        <MenuItem text={isEnabled ? 'Disable' : 'Enable'} icon={isEnabled ? 'SAP-icons-v4/invisible' : 'show'} />
        <MenuItem text="Delete" icon="delete" />
      </Menu>

      <AddDictionaryCategoryDialog
        open={editDialogOpen}
        categories={dictCategories}
        editCategory={category}
        onClose={() => setEditDialogOpen(false)}
        onAdd={(name, parentId, color, type) => addDictCategory({ name, parentId, color: color ?? '#3B6CC7', enabled: true, type: type ?? 'Others', createdAt: '', changedAt: '' })}
        onEdit={(editId, patch) => { updateDictCategory(editId, patch); setEditDialogOpen(false); setActionToast('Dictionary category updated') }}
      />

      <AddDictionaryCategoryDialog
        open={createSubOpen}
        categories={dictCategories}
        initialParentId={id}
        onClose={() => setCreateSubOpen(false)}
        onAdd={(name, parentId, color, type) => {
          const newId = addDictCategory({ name, parentId, color: color ?? '#3B6CC7', enabled: true, type: type ?? 'Others', createdAt: '', changedAt: '' })
          setCreateSubOpen(false)
          navigate(`/settings/dictionary-categories/${newId}`, { state: { toast: 'Dictionary category added' } })
        }}
        onEdit={() => {}}
      />

      <DeleteCategoryDialog
        category={deleteDialogOpen ? category : undefined}
        parent={parent}
        onDelete={() => {
          deleteDictCategory(id)
          setDeleteDialogOpen(false)
          navigate('/settings/dictionary-categories', { state: { toast: 'Dictionary category deleted' } })
        }}
        onMove={() => {
          deleteDictCategoryMoveChildren(id)
          setDeleteDialogOpen(false)
          navigate('/settings/dictionary-categories', { state: { toast: 'Dictionary category deleted' } })
        }}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <Toast open={saveToast} placement="BottomCenter" onClose={() => setSaveToast(false)}>Changes saved</Toast>
      <Toast open={!!actionToast} placement="BottomCenter" onClose={() => setActionToast(null)}>{actionToast}</Toast>
    </div>
  )
}
