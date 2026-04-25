/**
 * Punto de entrada de la aplicación React.
 * Envuelve todo con el AppProvider para dar acceso al contexto global.
 */

import { StrictMode }  from 'react'
import { createRoot }  from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App             from './App.jsx'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
)
