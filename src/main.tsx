import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DesktopOnly from './components/DesktopOnly.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesktopOnly>
    <App />
    </DesktopOnly>
  </StrictMode>,
)
