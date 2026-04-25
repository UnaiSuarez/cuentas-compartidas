/**
 * Componente raíz de la aplicación.
 *
 * Estructura de rutas:
 *   /               → Dashboard
 *   /transacciones  → Lista + formulario de transacciones
 *   /liquidacion    → Pagos óptimos + confirmaciones
 *   /estadisticas   → Gráficos y estadísticas
 *   /chat           → Chat del grupo
 *   /ajustes        → Configuración del grupo
 *
 * Flujo de autenticación:
 * - Si `firebaseUser` es undefined → pantalla de carga
 * - Si `firebaseUser` es null      → AuthGate (login/registro)
 * - Si el perfil está incompleto   → AuthGate (pasos de onboarding)
 * - Si todo OK                     → Layout con rutas
 */

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp }    from './context/AppContext'
import AuthGate      from './components/Auth/AuthGate'
import Navbar        from './components/Common/Navbar'
import Dashboard     from './components/Dashboard/Dashboard'
import Transactions  from './components/Transactions/TransactionList'

// Carga diferida para reducir bundle inicial
const Settlement  = lazy(() => import('./components/Settlement/SettlementPage'))
const Statistics  = lazy(() => import('./components/Statistics/StatisticsPage'))
const ChatWindow  = lazy(() => import('./components/Chat/ChatWindow'))
const Settings    = lazy(() => import('./components/Settings/SettingsPage'))

// Pantalla de carga genérica
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
}

export default function App() {
  const { firebaseUser, userProfile, loading } = useApp()

  // Esperando respuesta de Firebase Auth
  if (loading || firebaseUser === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
        </div>
      </div>
    )
  }

  // No autenticado, o perfil/grupo incompleto → flujo de onboarding
  const needsOnboarding = !firebaseUser || !userProfile?.name || !userProfile?.groupId
  if (needsOnboarding) {
    return <AuthGate />
  }

  // Usuario autenticado y con grupo → mostrar la app
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />

        {/* Margen para la sidebar (desktop) y navbar inferior (móvil) */}
        <main className="md:ml-20 lg:ml-56 pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/transacciones"  element={<Transactions />} />
                <Route path="/liquidacion"    element={<Settlement />} />
                <Route path="/estadisticas"   element={<Statistics />} />
                <Route path="/chat"           element={<ChatWindow />} />
                <Route path="/ajustes"        element={<Settings />} />
                <Route path="*"              element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
