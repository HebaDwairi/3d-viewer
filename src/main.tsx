import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AnnotationsContextProvider } from './contexts/AnnotationsContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnnotationsContextProvider>
      <App />
    </AnnotationsContextProvider>
  </StrictMode>,
)
