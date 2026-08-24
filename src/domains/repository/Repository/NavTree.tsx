import React from 'react'
import { Tree, TreeItem, TreeItemCustom, Icon } from '@ui5/webcomponents-react'
import { renderFolderNodes } from './components'
import { FOLDER_TREE, MY_MODELING_TREE, findFolderPath } from './data'
import type { SmartFolder, DictCategory, DictCategoryType } from '../../../contexts/WorkspaceContext'
import { catBg, catIconColor, CAT_TYPE_ICON } from './dictionaryData'

const TYPE_ICON_MAP = CAT_TYPE_ICON

function DictAvatar({ type }: { type: DictCategoryType }) {
  return (
    <div style={{
      width: '18px',
      height: '18px',
      borderRadius: '5px',
      background: catBg(type),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon
        name={TYPE_ICON_MAP[type] ?? 'SAP-icons-v4/process-manager'}
        style={{ width: '10px', height: '10px', color: catIconColor(type) }}
      />
    </div>
  )
}

interface NavTreeProps {
  rootExpanded: boolean
  setRootExpanded: React.Dispatch<React.SetStateAction<boolean>>
  myModelingExpanded: boolean
  setMyModelingExpanded: React.Dispatch<React.SetStateAction<boolean>>
  dataModelingExpanded: boolean
  setDataModelingExpanded: React.Dispatch<React.SetStateAction<boolean>>
  dictionaryExpanded: boolean
  setDictionaryExpanded: React.Dispatch<React.SetStateAction<boolean>>
  selectedRoot: 'modeling' | 'my-modeling' | 'data-modeling' | 'dictionary' | 'process-atoms'
  selectedFolderLeafId?: string
  selectedFolderPath: { id: string; name: string }[] | null
  showAllResources: boolean
  showTrash: boolean
  showVariantManagement: boolean
  isModelingFiles: boolean
  selectedSmartFolderId: string | null
  smartFolders: SmartFolder[]
  dictCategories: DictCategory[]
  selectedDictCategoryPath: { id: string; name: string }[]
  onSelectAllResources: () => void
  onSelectTrash: () => void
  onSelectVariantManagement: () => void
  onSelectRoot: () => void
  onSelectMyModeling: () => void
  onSelectDataModeling: () => void
  onSelectProcessAtoms: () => void
  onSelectDictionary: () => void
  onSelectDictCategory: (path: { id: string; name: string }[]) => void
  onSelectFolderPath: (path: { id: string; name: string }[]) => void
  onSelectSmartFolder: (sf: SmartFolder) => void
}

function buildDictPath(categories: DictCategory[], targetId: string): { id: string; name: string }[] | null {
  function walk(catId: string, ancestors: { id: string; name: string }[]): { id: string; name: string }[] | null {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return null
    const path = [...ancestors, { id: cat.id, name: cat.name }]
    if (cat.id === targetId) return path
    for (const child of categories.filter(c => c.parentId === catId)) {
      const found = walk(child.id, path)
      if (found) return found
    }
    return null
  }
  for (const root of categories.filter(c => !c.parentId)) {
    const found = walk(root.id, [])
    if (found) return found
  }
  return null
}

function renderDictNodes(
  categories: DictCategory[],
  parentId: string | undefined,
  selectedLeafId: string | undefined,
  expandedIds?: Set<string>,
): React.ReactNode {
  return categories
    .filter(c => c.parentId === parentId)
    .map(cat => {
      const hasChildren = categories.some(c => c.parentId === cat.id)
      return (
        <TreeItemCustom
          key={cat.id}
          data-id={`dict-cat:${cat.id}`}
          selected={selectedLeafId === cat.id}
          hasChildren={hasChildren}
          expanded={expandedIds?.has(cat.id) || undefined}
          content={
            <div
              slot="content"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden', width: '100%' }}
            >
              <DictAvatar type={cat.type} />
              <span style={{
                fontSize: 'var(--sapFontSize)',
                color: 'var(--sapList_TextColor)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}>
                {cat.name}
              </span>
            </div>
          }
        >
          {hasChildren && renderDictNodes(categories, cat.id, selectedLeafId, expandedIds)}
        </TreeItemCustom>
      )
    })
}

export default function NavTree({
  rootExpanded, setRootExpanded,
  myModelingExpanded, setMyModelingExpanded,
  dataModelingExpanded, setDataModelingExpanded,
  dictionaryExpanded, setDictionaryExpanded,
  selectedRoot, selectedFolderLeafId, selectedFolderPath,
  showAllResources, showTrash, showVariantManagement, isModelingFiles, selectedSmartFolderId,
  smartFolders, dictCategories, selectedDictCategoryPath,
  onSelectAllResources, onSelectTrash, onSelectVariantManagement,
  onSelectRoot, onSelectMyModeling, onSelectDataModeling, onSelectProcessAtoms, onSelectDictionary,
  onSelectDictCategory, onSelectFolderPath, onSelectSmartFolder,
}: NavTreeProps) {

  const selectedDictLeafId = selectedDictCategoryPath[selectedDictCategoryPath.length - 1]?.id

  // Build set of folder IDs that should be expanded based on current path
  const expandedFolderIds = new Set(selectedFolderPath?.map(seg => seg.id) ?? [])

  return (
    <div style={{ height: '100%', width: '100%', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--sapList_BorderColor)' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Tree
          className="nav-tree-flat"
          selectionMode="None"
          onItemClick={(e) => {
            // @ts-ignore
            const item = e.detail?.item
            if (!item) return
            const id = item.getAttribute?.('data-id') ?? ''
            if (id === 'all-resources') { onSelectAllResources(); return }
          }}
        >
          <TreeItem text="All Resources" icon="list" data-id="all-resources" selected={showAllResources} />
        </Tree>

        <div style={{ padding: '0.5rem 0.75rem 0.25rem', marginTop: '1.25rem', fontSize: 'var(--sapFontSmallSize)', fontWeight: '600', color: 'var(--sapContent_LabelColor)', userSelect: 'none' as const, letterSpacing: '0.04em', fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>
          Libraries
        </div>

        <Tree
          selectionMode="None"
          accessibleName="Library folder tree"
          onItemClick={(e) => {
            // @ts-ignore
            const item = e.detail?.item
            if (!item) return
            const id = item.getAttribute?.('data-id') ?? ''
            if (id === 'modeling') { onSelectRoot(); return }
            if (id === 'my-modeling') { onSelectMyModeling(); return }
            if (id === 'data-modeling') { onSelectDataModeling(); return }
            if (id === 'process-atoms') { onSelectProcessAtoms(); return }
            if (id === 'dictionary') { onSelectDictionary(); return }
            if (id.startsWith('dict-cat:')) {
              const catId = id.slice('dict-cat:'.length)
              const path = buildDictPath(dictCategories, catId)
              if (path) onSelectDictCategory(path)
              return
            }
            const path = findFolderPath(FOLDER_TREE, id) ?? findFolderPath(MY_MODELING_TREE, id)
            if (path) onSelectFolderPath(path)
          }}
          onItemToggle={(e) => {
            // @ts-ignore
            const item = e.detail?.item
            if (!item) return
            const id = item.getAttribute?.('data-id') ?? ''
            if (id === 'modeling') setRootExpanded(v => !v)
            else if (id === 'my-modeling') setMyModelingExpanded(v => !v)
            else if (id === 'data-modeling') setDataModelingExpanded(v => !v)
            else if (id === 'dictionary') setDictionaryExpanded(v => !v)
          }}
        >
          <TreeItem
            text="Modeling Files"
            icon="folder-blank"
            data-id="modeling"
            expanded={rootExpanded || (!!selectedFolderPath?.length && selectedRoot === 'modeling')}
            hasChildren
            selected={isModelingFiles && !selectedFolderPath && selectedRoot === 'modeling'}
          >
            {renderFolderNodes(FOLDER_TREE, selectedFolderLeafId, expandedFolderIds)}
          </TreeItem>

          <TreeItem
            text="Private Modeling Files"
            icon="folder-blank"
            data-id="my-modeling"
            expanded={myModelingExpanded || (!!selectedFolderPath?.length && selectedRoot === 'my-modeling')}
            hasChildren
            selected={isModelingFiles && !selectedFolderPath && selectedRoot === 'my-modeling'}
          >
            {renderFolderNodes(MY_MODELING_TREE, selectedFolderLeafId, expandedFolderIds)}
          </TreeItem>

          <TreeItem
            text="Data Management Files"
            icon="folder-blank"
            data-id="data-modeling"
            expanded={dataModelingExpanded}
            hasChildren
            selected={isModelingFiles && selectedRoot === 'data-modeling'}
          />

          <TreeItem
            text="Dictionary"
            icon="course-book"
            data-id="dictionary"
            expanded={dictionaryExpanded || (selectedDictCategoryPath.length > 0 && selectedRoot === 'dictionary')}
            hasChildren
            selected={isModelingFiles && selectedRoot === 'dictionary' && selectedDictCategoryPath.length === 0}
          >
            {renderDictNodes(dictCategories, undefined, selectedDictLeafId, new Set(selectedDictCategoryPath.map(s => s.id)))}
          </TreeItem>

          <TreeItem
            text="Process Atoms"
            icon="SAP-icons-v4/value-any"
            data-id="process-atoms"
            selected={selectedRoot === 'process-atoms' && isModelingFiles}
          />
        </Tree>

        {smartFolders.length > 0 && (
          <>
            <div style={{ padding: '0.5rem 0.75rem 0.25rem', marginTop: '1.25rem', fontSize: 'var(--sapFontSmallSize)', fontWeight: '600', color: 'var(--sapContent_LabelColor)', userSelect: 'none' as const, letterSpacing: '0.04em', fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>
              Pinned Views
            </div>
            <Tree
              className="nav-tree-smart-folders"
              selectionMode="None"
              accessibleName="Smart folders"
              onItemClick={(e) => {
                // @ts-ignore
                const item = e.detail?.item
                if (!item) return
                const id = item.getAttribute?.('data-id') ?? ''
                const sf = smartFolders.find(s => s.id === id)
                if (sf) onSelectSmartFolder(sf)
              }}
            >
              {smartFolders.map(sf => (
                <TreeItem
                  key={sf.id}
                  text={sf.name}
                  icon="search"
                  data-id={sf.id}
                  selected={selectedSmartFolderId === sf.id}
                />
              ))}
            </Tree>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--sapList_BorderColor)' }}>
        <Tree className="nav-tree-flat" selectionMode="None" onItemClick={(e) => {
          // @ts-ignore
          const item = e.detail?.item
          if (!item) return
          const id = item.getAttribute?.('data-id') ?? ''
          if (id === 'variant-management') onSelectVariantManagement()
          if (id === 'trash') onSelectTrash()
        }}>
          <TreeItem text="Variant Management" icon="SAP-icons-v4/variant" data-id="variant-management" selected={showVariantManagement} />
          <TreeItem text="Trash" icon="delete" data-id="trash" selected={showTrash} />
        </Tree>
      </div>
    </div>
  )
}
