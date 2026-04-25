/**
 * Ventana de chat interno del grupo.
 *
 * Características:
 * - Mensajes en tiempo real vía Firestore listener (AppContext)
 * - Historial completo sin límite
 * - Tipos: mensaje normal, recordatorio de pago, notificación del sistema
 * - Badge de mensajes no leídos en la Navbar
 * - Marca como leído al abrir
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import { Send, MessageCircle }          from 'lucide-react'
import { useApp }                       from '../../context/AppContext'
import { useChat }                      from '../../hooks/useChat'
import { getAvatarByKey }               from '../../assets/avatars'
import { formatDate }                   from '../../utils/formatters'

export default function ChatWindow() {
  const { messages, userProfile, groupMembers } = useApp()
  const { sendMessage, markAsRead, sending }    = useChat()
  const [text, setText]    = useState('')
  const bottomRef          = useRef(null)

  // Scroll al último mensaje al abrir o recibir mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Marcar todos los mensajes no leídos al abrir la ventana
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.sender !== userProfile?.id && !msg.readBy?.includes(userProfile?.id)) {
        markAsRead(msg.id)
      }
    })
  }, [messages.length])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    const textToSend = text
    setText('')
    await sendMessage(textToSend)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const getMember = id => groupMembers.find(m => m.id === id)

  // Mensajes en orden cronológico (el listener los devuelve desc, invertimos)
  const chronological = [...messages].reverse()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] max-h-[700px]">
      <h2 className="text-xl font-bold text-white mb-4">Chat del grupo</h2>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0 scrollbar-thin
                      scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {chronological.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={40} className="text-slate-700 mb-3"/>
            <p className="text-slate-400">Aún no hay mensajes.</p>
            <p className="text-slate-600 text-sm mt-1">¡Sé el primero en escribir!</p>
          </div>
        )}

        {chronological.map((msg, i) => {
          const isOwn    = msg.sender === userProfile?.id
          const isSystem = msg.type === 'system' || msg.type === 'payment_reminder'
          const member   = getMember(msg.sender)
          const Av       = member ? getAvatarByKey(member.avatar) : null

          // Mensajes de sistema: centrados, sin avatar
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <p className="text-xs text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full">
                  {msg.text}
                </p>
              </div>
            )
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="shrink-0 self-end">
                {Av
                  ? <Av state="normal" color={member.color || '#2563eb'} size={32}/>
                  : <div className="w-8 h-8 rounded-full bg-slate-700"/>
                }
              </div>

              {/* Burbuja */}
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isOwn && (
                  <p className="text-xs text-slate-500 px-1">{msg.senderName || 'Desconocido'}</p>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm
                                ${isOwn
                                  ? 'bg-blue-600 text-white rounded-tr-md'
                                  : 'bg-slate-800 text-slate-200 rounded-tl-md'
                                }`}>
                  {msg.text}
                </div>
                <p className={`text-xs text-slate-600 px-1 ${isOwn ? 'text-right' : ''}`}>
                  {msg.createdAt?.toDate
                    ? formatDate(msg.createdAt.toDate(), true)
                    : '—'
                  }
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input de envío */}
      <form onSubmit={handleSend} className="flex gap-2 mt-3 pt-3 border-t border-slate-800/60">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl
                     px-4 py-3 text-white placeholder-slate-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                     p-3 rounded-xl transition-all active:scale-95 shrink-0"
        >
          {sending
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <Send size={18}/>
          }
        </button>
      </form>
    </div>
  )
}
