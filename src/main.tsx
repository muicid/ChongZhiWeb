import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/chrome.css'
import './styles/sections.css'
import './styles/pricing.css'
import './styles/motion.css'
import './styles/detail.css'
import './styles/responsive.css'
import './styles/flow.css'
import './styles/preparation.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
