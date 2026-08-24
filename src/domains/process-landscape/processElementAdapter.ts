import type { FileItem } from '../repository/Repository/data'
import type { ProcessElement } from './types'

const STATUS_MAP: Record<ProcessElement['status'], string> = {
  'Active':     'Published',
  'In Review':  'In Review',
  'Draft':      'Draft',
  'Deprecated': 'Deprecated',
}

export function processElementToFileItem(element: ProcessElement): FileItem {
  return {
    id:         element.id,
    name:       element.name,
    type:       'Process Model',
    description: element.description,
    status:     STATUS_MAP[element.status],
    version:    '1.0',
    created:    'Jan 12, 2022',
    changed:    'May 10, 2026',
    changedBy:  'Claire Westfield',
    hasPublished: element.status === 'Active',
  }
}
