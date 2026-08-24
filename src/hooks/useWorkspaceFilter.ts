import type { MockItem } from '../data/DataBase'

// Always returns 'preview' mode — state chips always show in this prototype.
export function useWorkspaceMode(): 'preview' | 'published' {
  return 'preview'
}

// Returns items as-is; content filtering is handled per-page via contentFilter state.
export function useWorkspaceFilter(items: MockItem[]): MockItem[] {
  return items
}
