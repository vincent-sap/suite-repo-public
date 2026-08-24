import { MessageBox } from '@ui5/webcomponents-react'
import type { DictCategory } from '../../../contexts/WorkspaceContext'

type Props = {
  category: DictCategory | undefined
  parent: DictCategory | undefined
  onDelete: () => void
  onMove: () => void
  onCancel: () => void
}

export function DeleteCategoryDialog({ category, parent, onDelete, onMove, onCancel }: Props) {
  const isSubCategory = !!category?.parentId

  const actions = isSubCategory
    ? ['Delete', 'Move', 'Cancel']
    : ['Delete', 'Cancel']

  return (
    <MessageBox
      open={!!category}
      type="Warning"
      titleText="Delete Dictionary Category"
      actions={actions}
      emphasizedAction="Delete"
      style={{ width: '500px' }}
      onClose={(action) => {
        if (action === 'Delete') onDelete()
        else if (action === 'Move') onMove()
        else onCancel()
      }}
    >
      <div style={{ padding: '16px' }}>
        You are about to delete the selected category.
        {category ? <> (<strong>{category.name}</strong>)</> : ''}.
        {isSubCategory
          ? <> Do you want to delete existing dictionary links in this category, or move them to{' '}
              <strong>{parent?.name ?? 'the parent category'}</strong>?</>
          : <> This action cannot be undone.</>
        }
      </div>
    </MessageBox>
  )
}
