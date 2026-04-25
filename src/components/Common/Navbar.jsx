/**
 * Barra de navegación.
 * - Desktop: sidebar fija izquierda (colapsable)
 * - Móvil: barra inferior fija
 *
 * Muestra el perfil del usuario autenticado y badges de mensajes no leídos.
 */

import { NavLink }  from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Scale,
  BarChart2, MessageCircle, Settings, LogOut, Sun, Moon,
} from 'lucide-react'
import { useApp }  from '../../context/AppContext'
import { useChat } from '../../hooks/useChat'
import { getAvatarByKey } from '../../assets/avatars'

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/transacciones', icon: ArrowLeftRight,  label: 'Transacciones' },
  { to: '/liquidacion',   icon: Scale,           label: 'Liquidación'   },
  { to: '/estadisticas',  icon: BarChart2,        label: 'Estadísticas'  },
  { to: '/chat',          icon: MessageCircle,   label: 'Chat'          },
  { to: '/ajustes',       icon: Settings,        label: 'Ajustes'       },
]

export default function Navbar() {
  const { userProfile, groupMembers, darkMode, toggleDarkMode, logout } = useApp()
  const { unreadCount } = useChat()

  // Avatar del usuario autenticado
  const MyAvatar = userProfile ? getAvatarByKey(userProfile.avatar) : null

  return (
    <>
      {/* ── Sidebar desktop ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-20 lg:w-56 h-screen
                        bg-slate-900/95 border-r border-slate-800/60
                        fixed left-0 top-0 z-40 py-6 gap-1">

        {/* Logo */}
        <div className="px-4 mb-4">
          <span className="hidden lg:block text-lg font-bold text-white truncate">💰 Cuentas</span>
          <span className="lg:hidden text-2xl">💰</span>
        </div>

        {/* Perfil del usuario autenticado */}
        {userProfile && (
          <div className="px-3 mb-3">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-800/40">
              {MyAvatar && (
                <div className="shrink-0 w-8 h-8">
                  <MyAvatar state="normal" color={userProfile.color || '#2563eb'} size={32}/>
                </div>
              )}
              <div className="hidden lg:block min-w-0">
                <p className="text-sm text-white font-medium truncate">{userProfile.name}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Miembros del grupo */}
        {groupMembers.length > 1 && (
          <div className="px-3 mb-3">
            <p className="hidden lg:block text-xs text-slate-600 px-1 mb-1.5 uppercase tracking-wider">
              Grupo
            </p>
            <div className="flex flex-col gap-1">
              {groupMembers
                .filter(m => m.id !== userProfile?.id)
                .map(member => {
                  const Av = getAvatarByKey(member.avatar)
                  return (
                    <div key={member.id} className="flex items-center gap-2 px-2 py-1 rounded-lg">
                      <div className="shrink-0 w-6 h-6">
                        <Av state="normal" color={member.color || '#10b981'} size={24}/>
                      </div>
                      <span className="hidden lg:block text-xs text-slate-400 truncate">
                        {member.name}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        <div className="mx-4 border-t border-slate-800/60 mb-1"/>

        {/* Navegación */}
        <nav className="flex flex-col gap-0.5 px-2 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                 ${isActive
                   ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                   : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                 }`
              }
            >
              <Icon size={20} className="shrink-0"/>
              <span className="hidden lg:block text-sm font-medium">{label}</span>
              {/* Badge de mensajes no leídos */}
              {label === 'Chat' && unreadCount > 0 && (
                <span className="absolute right-2 top-2 bg-red-500 text-white text-xs
                                 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Acciones inferiores */}
        <div className="px-2 flex flex-col gap-0.5">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            <span className="hidden lg:block text-sm">
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20}/>
            <span className="hidden lg:block text-sm">Salir</span>
          </button>
        </div>
      </aside>

      {/* ── Navbar móvil inferior ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40
                      bg-slate-900/95 border-t border-slate-800/60
                      flex justify-around items-center py-1.5 px-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-xl relative transition-colors
               ${isActive ? 'text-blue-400' : 'text-slate-500'}`
            }
          >
            <Icon size={21}/>
            <span className="text-[10px]">{label.split(' ')[0]}</span>
            {label === 'Chat' && unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs
                               rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
