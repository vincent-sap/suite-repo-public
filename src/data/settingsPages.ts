// Single source of truth for Workspace Settings pages.
// Both the settings sidebar nav (SettingsSidebar.tsx) and the settings search
// index (settingsSearch.ts) are derived from this list.
//
// To add a new settings page:
//   1. Add an entry here (path, text, group, keywords)
//   2. Add the matching <Route> in src/App.tsx under <Route path="settings">
// The sidebar and search index update automatically.

export interface SettingsPage {
  path: string
  text: string
  group: string
  keywords: string[]
}

export const SETTINGS_PAGES: SettingsPage[] = [
  // Users and Access
  { path: '/settings/users', text: 'Users', group: 'Users and Access', keywords: ['users', 'user management', 'invite', 'members', 'accounts', 'user list', 'add user', 'remove user', 'license'] },
  { path: '/settings/groups', text: 'Groups', group: 'Users and Access', keywords: ['groups', 'group management', 'auto-add', 'members', 'user groups', 'team', 'organize users'] },
  { path: '/settings/audience', text: 'Audiences', group: 'Users and Access', keywords: ['audience', 'administrators', 'modelers', 'roles', 'user types', 'segments'] },
  { path: '/settings/resource-access', text: 'Resource Access', group: 'Users and Access', keywords: ['content access', 'resource access', 'permissions', 'folder access', 'model access', 'visibility', 'who can see'] },
  { path: '/settings/feature-access', text: 'Feature Access', group: 'Users and Access', keywords: ['feature access', 'feature permissions', 'feature flags', 'enable features', 'disable features'] },

  // Workspace
  { path: '/settings/general-settings', text: 'Workspace Details', group: 'Workspace', keywords: ['workspace details', 'workspace name', 'identity', 'logo', 'branding', 'private folder', 'my documents', 'upload documents', 'upload pictures', 'file upload', 'content subscriptions', 'notifications', 'subscriptions', 'localization', 'language', 'content language', 'default language', 'content storage', 'storage', 'transfer ownership', 'ownership'] },
  { path: '/settings/process-landscape-settings', text: 'Process Landscape', group: 'Workspace', keywords: ['process landscape', 'hierarchy', 'level names', 'nomenclature', 'category', 'process group', 'process', 'activity', 'task', 'navigation maps', 'metro map'] },
  { path: '/settings/theme', text: 'Theming', group: 'Workspace', keywords: ['theming', 'theme', 'colors', 'branding', 'logo', 'custom colors', 'appearance', 'design'] },
  { path: '/settings/navigation', text: 'Navigation', group: 'Workspace', keywords: ['navigation', 'navigation panel', 'sidebar', 'menu', 'newsfeed', 'insights', 'value accelerator', 'lab space', 'reports', 'improvement opportunities', 'recommendations', 'cloud transformation', 'variant management', 'view switch', 'collapsed', 'expanded', 'hub license'] },
  { path: '/settings/collaboration', text: 'Collaboration', group: 'Workspace', keywords: ['collaboration', 'commenting', 'comments', 'read confirmation', 'process rating', 'rating', 'star rating', 'permissions', 'criteria'] },
  { path: '/settings/help-resources', text: 'Help Resources', group: 'Workspace', keywords: ['help resources', 'help links', 'help menu', 'support links', 'custom links', 'help portal'] },

  // Page Layout
  { path: '/settings/home-page', text: 'Home Page', group: 'Page Layout', keywords: ['home page', 'home', 'widgets', 'dashboard', 'quick access', 'create items', 'recently viewed', 'favorites', 'my tasks', 'quick links', 'newsfeed widget'] },
  { path: '/settings/diagram-page', text: 'Model Page', group: 'Page Layout', keywords: ['model page', 'diagram page', 'header attributes', 'model attributes', 'diagram header', 'attributes on model', 'show on model'] },
  { path: '/settings/fact-sheet', text: 'Fact Sheet', group: 'Page Layout', keywords: ['fact sheet', 'factsheet', 'default view', 'fact sheet sections', 'enable fact sheet', 'show on page'] },

  // Assets and Attributes
  { path: '/settings/asset-types', text: 'Asset Types', group: 'Assets and Attributes', keywords: ['asset types', 'asset', 'asset configuration', 'asset settings', 'custom assets'] },
  { path: '/settings/dictionary-categories', text: 'Dictionary Categories', group: 'Assets and Attributes', keywords: ['dictionary', 'dictionary categories', 'categories', 'glossary', 'taxonomy', 'business terms'] },
  { path: '/settings/attribute-definitions', text: 'Attribute Definitions', group: 'Assets and Attributes', keywords: ['attribute definitions', 'attributes', 'custom attributes', 'attribute types', 'metadata', 'meta data', 'fields'] },

  // Modeling and Governance
  { path: '/settings/modeling-preferences', text: 'Modeling Preferences', group: 'Modeling and Governance', keywords: ['modeling preferences', 'modeling', 'colors', 'model colors', 'dictionary item types', 'enforce dictionary', 'matching types'] },
  { path: '/settings/modeling-languages', text: 'Modeling Languages and Elements', group: 'Modeling and Governance', keywords: ['modeling languages', 'languages', 'elements', 'bpmn', 'archiMate', 'epc', 'dmn', 'quick model', 'org chart', 'journey model', 'enable language', 'disable language'] },
  { path: '/settings/modeling-conventions', text: 'Modeling Conventions', group: 'Modeling and Governance', keywords: ['modeling conventions', 'conventions', 'quality rules', 'naming rules', 'validation', 'process quality', 'guidelines', 'standards', 'compliance rules'] },
  { path: '/settings/attribute-visualization', text: 'Attribute Overlays', group: 'Modeling and Governance', keywords: ['attribute overlays', 'overlays', 'attribute visualization', 'visual display', 'appearance', 'rules', 'visibility', 'diagram elements', 'color overlay'] },
  { path: '/settings/journey-model-approval', text: 'Approval Workflows', group: 'Modeling and Governance', keywords: ['approval workflows', 'approval', 'workflow', 'diagram states', 'participants', 'approval expiration', 'access permissions', 'governance', 'process governance', 'sign-off', 'review process', 'workflow access'] },
  { path: '/settings/process-rating', text: 'Process Rating', group: 'Modeling and Governance', keywords: ['process rating', 'rating', 'star rating', 'quality', 'feedback'] },

  // SAP-Defined Business Content
  { path: '/settings/data-sharing-industry', text: 'Data Sharing and Industry', group: 'SAP-Defined Business Content', keywords: ['data sharing', 'industry', 'industry benchmarking', 'sap business content', 'sharing settings', 'anonymized data'] },
  { path: '/settings/data-collection-config', text: 'Data Collection Configuration', group: 'SAP-Defined Business Content', keywords: ['data collection', 'data collection configuration', 'source systems', 'performance indicators', 'kpi', 'pi', 'system connections', 'process mining data'] },
  { path: '/settings/access-configuration', text: 'Access Configuration', group: 'SAP-Defined Business Content', keywords: ['access configuration', 'access configurations', 'sap data access', 'business content access', 'content access', 'configure access'] },
  { path: '/settings/data-privacy-management', text: 'Data Privacy Management', group: 'SAP-Defined Business Content', keywords: ['data privacy', 'privacy management', 'gdpr', 'privacy', 'personal data', 'anonymization', 'data protection'] },

  // Integrations
  { path: '/settings/process-insights', text: 'SAP Signavio Process Insights', group: 'Integrations', keywords: ['process insights', 'sap signavio process insights', 'system connections', 'integration', 'pi integration', 'connect systems'] },
  { path: '/settings/cloud-alm', text: 'SAP Cloud ALM', group: 'Integrations', keywords: ['cloud alm', 'sap cloud alm', 'alm synchronization', 'alm integration', 'application lifecycle management', 'project management integration'] },
  { path: '/settings/walkme', text: 'WalkMe Digital Adoption Platform', group: 'Integrations', keywords: ['walkme', 'walk me', 'digital adoption', 'digital adoption platform', 'in-app guidance', 'onboarding integration'] },

  // Security
  { path: '/settings/authentication', text: 'Authentication', group: 'Security', keywords: ['authentication', 'saml', 'saml 2.0', 'sso', 'single sign-on', 'login', 'service provider', 'identity provider', 'idp', 'auto-provision', 'user provisioning', 'sign authentication request', 'new user accounts', 'automatic account creation'] },
  { path: '/settings/network-privacy', text: 'Network and Privacy', group: 'Security', keywords: ['network', 'privacy', 'ip filtering', 'ip filter', 'whitelist', 'allowlist', 'network access', 'restrict access', 'ip addresses', 'firewall'] },
]

// Group order preserved from the first appearance of each group in SETTINGS_PAGES.
export const SETTINGS_GROUPS: { title: string; items: SettingsPage[] }[] = (() => {
  const groups: { title: string; items: SettingsPage[] }[] = []
  for (const page of SETTINGS_PAGES) {
    let group = groups.find(g => g.title === page.group)
    if (!group) { group = { title: page.group, items: [] }; groups.push(group) }
    group.items.push(page)
  }
  return groups
})()
