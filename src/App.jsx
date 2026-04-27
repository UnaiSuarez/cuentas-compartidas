import { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp }       from './context/AppContext'
import AuthGate         from './components/Auth/AuthGate'
import RoomSelector     from './components/Auth/RoomSelector'
import Navbar           from './components/Common/Navbar'
import Dashboard        from './components/Dashboard/Dashboard'
import Transactions     from './components/Transactions/TransactionList'
import TutorialOverlay  from './components/Tutorial/TutorialOverlay'
import SplashScreen     from './components/Common/SplashScreen'

const Settlement = lazy(() => import('./components/Settlement/SettlementPage'))
const Statistics = lazy(() => import('./components/Statistics/StatisticsPage'))
const ChatWindow = lazy(() => import('./components/Chat/ChatWindow'))
const Settings   = lazy(() => import('./components/Settings/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
}

export default function App() {
  const { firebaseUser, userProfile, groupId, loading } = useApp()

  const tutorialKey = userProfile?.id ? `tutorial_seen_${userProfile.id}` : null
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (tutorialKey && groupId && !localStorage.getItem(tutorialKey)) {
      setShowTutorial(true)
    }
  }, [tutorialKey, groupId])

  function handleTutorialDone() {
    if (tutorialKey) localStorage.setItem(tutorialKey, '1')
    setShowTutorial(false)
  }

  // Splash animada mientras carga Firebase
  if (loading || firebaseUser === undefined) {
    return <SplashScreen />
  }

  // Sin cuenta o perfil incompleto
  if (!firebaseUser || !userProfile?.name) {
    return <AuthGate />
  }

  // Perfil OK pero sin sala activa → selector de salas
  if (!groupId) {
    return <RoomSelector />
  }

  // Todo listo → app principal
  return (
    <BrowserRouter>
      {showTutorial && <TutorialOverlay onDone={handleTutorialDone}/>}
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="md:ml-20 lg:ml-56 pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"              element={<Dashboard />} />
                <Route path="/transacciones" element={<Transactions />} />
                <Route path="/liquidacion"   element={<Settlement />} />
                <Route path="/estadisticas"  element={<Statistics />} />
                <Route path="/chat"          element={<ChatWindow />} />
                <Route path="/ajustes"       element={<Settings />} />
                <Route path="*"             element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
