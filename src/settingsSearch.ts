// Search index for workspace settings navigation.
// Each entry maps a nav path to keywords users might type to find that page.
// Keywords come from page titles, section headings, card titles, and feature names.

export interface SettingsSearchEntry {
  path: string
  keywords: string[]
}

export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // Users and Access
  {
    path: '/audience',
    keywords: ['audience', 'administrators', 'modelers', 'roles', 'user types', 'segments'],
  },
  {
    path: '/users',
    keywords: ['users', 'user management', 'invite', 'members', 'accounts', 'user list', 'add user', 'remove user', 'license'],
  },
  {
    path: '/groups',
    keywords: ['groups', 'group management', 'auto-add', 'members', 'user groups', 'team', 'organize users'],
  },
  {
    path: '/resource-access',
    keywords: ['content access', 'resource access', 'permissions', 'folder access', 'model access', 'visibility', 'who can see'],
  },
  {
    path: '/feature-access',
    keywords: ['feature access', 'feature permissions', 'feature flags', 'enable features', 'disable features'],
  },

  // Workspace
  {
    path: '/general-settings',
    keywords: [
      'workspace details', 'workspace name', 'identity', 'logo', 'branding',
      'private folder', 'my documents', 'upload documents', 'upload pictures', 'file upload',
      'content subscriptions', 'notifications', 'subscriptions',
      'localization', 'language', 'content language', 'default language',
      'content storage', 'storage', 'transfer ownership', 'ownership',
    ],
  },
  {
    path: '/process-landscape-settings',
    keywords: [
      'process landscape', 'hierarchy', 'level names', 'nomenclature', 'category',
      'process group', 'process', 'activity', 'task', 'navigation maps', 'metro map',
    ],
  },
  {
    path: '/theme',
    keywords: ['theming', 'theme', 'colors', 'branding', 'logo', 'custom colors', 'appearance', 'design'],
  },
  {
    path: '/navigation',
    keywords: [
      'navigation', 'navigation panel', 'sidebar', 'menu', 'newsfeed', 'insights',
      'value accelerator', 'lab space', 'reports', 'improvement opportunities',
      'recommendations', 'cloud transformation', 'variant management', 'view switch',
      'collapsed', 'expanded', 'hub license',
    ],
  },
  {
    path: '/collaboration',
    keywords: [
      'collaboration', 'commenting', 'comments', 'read confirmation',
      'process rating', 'rating', 'star rating', 'permissions', 'criteria',
    ],
  },
  {
    path: '/help-resources',
    keywords: ['help resources', 'help links', 'help menu', 'support links', 'custom links', 'help portal'],
  },

  // Page Layout
  {
    path: '/home-page',
    keywords: [
      'home page', 'home', 'widgets', 'dashboard', 'quick access', 'create items',
      'recently viewed', 'favorites', 'my tasks', 'quick links', 'newsfeed widget',
    ],
  },
  {
    path: '/diagram-page',
    keywords: [
      'model page', 'diagram page', 'header attributes', 'model attributes', 'diagram header',
      'attributes on model', 'show on model',
    ],
  },
  {
    path: '/fact-sheet',
    keywords: [
      'fact sheet', 'factsheet', 'default view', 'fact sheet sections', 'enable fact sheet',
      'show on page',
    ],
  },

  // Assets and Meta Data
  {
    path: '/asset-types',
    keywords: ['asset types', 'asset', 'asset configuration', 'asset settings', 'custom assets'],
  },
  {
    path: '/dictionary-categories',
    keywords: ['dictionary', 'dictionary categories', 'categories', 'glossary', 'taxonomy', 'business terms'],
  },
  {
    path: '/attribute-definitions',
    keywords: [
      'attribute definitions', 'attributes', 'custom attributes', 'attribute types',
      'metadata', 'meta data', 'fields',
    ],
  },

  // Modeling and Governance
  {
    path: '/modeling-preferences',
    keywords: [
      'modeling preferences', 'modeling', 'colors', 'model colors', 'dictionary item types',
      'enforce dictionary', 'matching types',
    ],
  },
  {
    path: '/modeling-languages',
    keywords: [
      'modeling languages', 'languages', 'elements', 'bpmn', 'archiMate', 'epc', 'dmn',
      'quick model', 'org chart', 'journey model', 'enable language', 'disable language',
    ],
  },
  {
    path: '/modeling-conventions',
    keywords: [
      'modeling conventions', 'conventions', 'quality rules', 'naming rules', 'validation',
      'process quality', 'guidelines', 'standards', 'compliance rules',
    ],
  },
  {
    path: '/attribute-visualization',
    keywords: [
      'attribute overlays', 'overlays', 'attribute visualization', 'visual display',
      'appearance', 'rules', 'visibility', 'diagram elements', 'color overlay',
    ],
  },
  {
    path: '/journey-model-approval',
    keywords: [
      'approval workflows', 'approval', 'workflow', 'diagram states', 'participants',
      'approval expiration', 'access permissions', 'governance', 'process governance',
      'sign-off', 'review process', 'workflow access',
    ],
  },

  // SAP-Defined Business Content
  {
    path: '/data-sharing-industry',
    keywords: [
      'data sharing', 'industry', 'industry benchmarking', 'sap business content',
      'sharing settings', 'anonymized data',
    ],
  },
  {
    path: '/data-collection-config',
    keywords: [
      'data collection', 'data collection configuration', 'source systems', 'performance indicators',
      'kpi', 'pi', 'system connections', 'process mining data',
    ],
  },
  {
    path: '/access-configuration',
    keywords: [
      'access configuration', 'access configurations', 'sap data access',
      'business content access', 'content access', 'configure access',
    ],
  },
  {
    path: '/data-privacy-management',
    keywords: [
      'data privacy', 'privacy management', 'gdpr', 'privacy', 'personal data',
      'anonymization', 'data protection',
    ],
  },

  // Integrations
  {
    path: '/process-insights',
    keywords: [
      'process insights', 'sap signavio process insights', 'system connections',
      'integration', 'pi integration', 'connect systems',
    ],
  },
  {
    path: '/cloud-alm',
    keywords: [
      'cloud alm', 'sap cloud alm', 'alm synchronization', 'alm integration',
      'application lifecycle management', 'project management integration',
    ],
  },
  {
    path: '/walkme',
    keywords: [
      'walkme', 'walk me', 'digital adoption', 'digital adoption platform',
      'in-app guidance', 'onboarding integration',
    ],
  },

  // Security
  {
    path: '/authentication',
    keywords: [
      'authentication', 'saml', 'saml 2.0', 'sso', 'single sign-on', 'login',
      'service provider', 'identity provider', 'idp', 'auto-provision', 'user provisioning',
      'sign authentication request', 'new user accounts', 'automatic account creation',
    ],
  },
  {
    path: '/network-privacy',
    keywords: [
      'network', 'privacy', 'ip filtering', 'ip filter', 'whitelist', 'allowlist',
      'network access', 'restrict access', 'ip addresses', 'firewall',
    ],
  },
]

/** Returns the set of paths that match a given query string. */
export function searchSettings(query: string): Set<string> {
  const q = query.trim().toLowerCase()
  if (!q) return new Set()

  const result = new Set<string>()
  for (const entry of SETTINGS_SEARCH_INDEX) {
    for (const kw of entry.keywords) {
      if (kw.includes(q)) {
        result.add(entry.path)
        break
      }
    }
  }
  return result
}
