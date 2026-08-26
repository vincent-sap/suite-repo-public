// Settings search — the keyword index is derived from SETTINGS_PAGES
// (src/data/settingsPages.ts), the single source of truth for settings pages.
import { SETTINGS_PAGES } from './data/settingsPages'

/** Returns the set of paths that match a given query string. */
export function searchSettings(query: string): Set<string> {
  const q = query.trim().toLowerCase()
  if (!q) return new Set()

  const result = new Set<string>()
  for (const page of SETTINGS_PAGES) {
    if (page.keywords.some(kw => kw.includes(q))) {
      result.add(page.path)
    }
  }
  return result
}
