import { Button } from '@ui5/webcomponents-react'

export default function TopBar() {
  return (
    <div style={{
      height: '44px',
      background: 'var(--sapShellColor)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '8px',
      flexShrink: 0,
      color: 'var(--sapShell_TextColor)',
    }}>
      {/* Hamburger */}
      <Button design="Transparent" icon="menu2" style={{ '--ui5-button-text-color': 'var(--sapShell_TextColor)' } as React.CSSProperties} />

      {/* Logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
        <SapLogo />
        <span style={{ color: 'var(--sapShell_TextColor)', fontWeight: 500, fontSize: 'var(--sapFontLargeSize)', letterSpacing: '0.3px' }}>Signavio</span>
      </div>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.4)' }} />

      {/* Workspace */}
      <Button
        design="Transparent"
        style={{ '--ui5-button-text-color': 'var(--sapShell_TextColor)', fontSize: 'var(--sapFontSmallSize)' } as React.CSSProperties}
      >
        Shell Workspace
      </Button>

      {/* Published badge */}
      <Button
        design="Transparent"
        icon="slim-arrow-down"
        endIcon="slim-arrow-down"
        style={{
          '--ui5-button-text-color': 'var(--sapShell_TextColor)',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '16px',
          fontSize: 'var(--sapFontSmallSize)',
          padding: '2px 10px',
        } as React.CSSProperties}
      >
        Published
      </Button>

      <div style={{ flex: 1 }} />

      {/* Right icon buttons */}
      {(['search', 'bell', 'edit', 'cloud', 'shield', 'comment'] as const).map((icon) => (
        <Button
          key={icon}
          design="Transparent"
          icon={icon}
          style={{ '--ui5-button-text-color': 'var(--sapShell_TextColor)' } as React.CSSProperties}
        />
      ))}

      {/* Avatar */}
      <div style={{
        width: '30px', height: '30px',
        borderRadius: '50%',
        background: 'var(--sapShell_TextColor)',
        color: 'var(--sapShellColor)',
        fontSize: 'var(--sapFontSmallSize)',
        fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}>
        SK
      </div>
    </div>
  )
}

function SapLogo() {
  return (
    <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
      <rect width="36" height="18" rx="2" fill="white"/>
      <text x="5" y="13" fontSize="10" fontWeight="bold" fill="var(--sapBrandColor)" fontFamily="Arial">SAP</text>
    </svg>
  )
}
