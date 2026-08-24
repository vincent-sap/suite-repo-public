import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-react/dist/Assets.js'
import '@ui5/webcomponents-icons/dist/AllIcons.js'
import '@ui5/webcomponents-icons-tnt/dist/AllIcons.js'
import '@ui5/webcomponents-icons-business-suite/dist/AllIcons.js'
import '@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js'
import './icons/registerIcons'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!
rootEl.classList.add('ui5-content-density-compact')
createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
