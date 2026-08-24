import { ThemeProvider } from '@ui5/webcomponents-react'
import { ConventionsBody } from '../../shared/components/Shell/ConventionsDialog'

export default function ConventionsStandalone() {
  return (
    <ThemeProvider>
      <div style={{ fontFamily: 'var(--sapFontFamily)', background: 'var(--sapBackgroundColor)', minHeight: '100vh' }}>
        <div style={{
          padding: '1.25rem 1.5rem 0.75rem',
          borderBottom: '1px solid var(--sapList_BorderColor)',
          background: 'var(--sapList_HeaderBackground)',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--sapFontFamily)' }}>
            Modeling Conventions
          </h1>
        </div>
        <ConventionsBody />
      </div>
    </ThemeProvider>
  )
}
