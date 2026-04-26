/**
 * Galería de 18 avatares SVG 2D.
 * Props: state ('normal'|'happy'|'dead'), color (hex), size (px, default 80)
 * Algunos avatares incluyen animaciones SVG nativas (parpadeo, flotación).
 */

export const Avatar0 = ({ state = 'normal', color = '#2563eb', size = 80 }) => {
  const expression = {
    normal: <><ellipse cx="28" cy="44" rx="5" ry="3" fill="#1a1a1a"/><ellipse cx="52" cy="44" rx="5" ry="3" fill="#1a1a1a"/><path d="M32 56 Q40 62 48 56" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    happy:  <><ellipse cx="28" cy="44" rx="5" ry="4" fill="#1a1a1a"/><ellipse cx="52" cy="44" rx="5" ry="4" fill="#1a1a1a"/><path d="M28 56 Q40 66 52 56" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    dead:   <><line x1="23" y1="40" x2="33" y2="48" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="33" y1="40" x2="23" y2="48" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="47" y1="40" x2="57" y2="48" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="57" y1="40" x2="47" y2="48" stroke="#1a1a1a" strokeWidth="2.5"/><path d="M32 58 Q40 54 48 58" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="68" rx="18" ry="8" fill={color} opacity="0.3"/>
      <rect x="26" y="55" width="28" height="18" rx="8" fill={color}/>
      <circle cx="40" cy="35" r="22" fill="#FBBF82"/>
      <circle cx="40" cy="35" r="22" fill={color} opacity="0.15"/>
      <ellipse cx="40" cy="14" rx="20" ry="8" fill={color}/>
      <rect x="20" y="39" width="14" height="10" rx="5" fill="none" stroke="#334155" strokeWidth="2"/>
      <rect x="46" y="39" width="14" height="10" rx="5" fill="none" stroke="#334155" strokeWidth="2"/>
      <line x1="34" y1="44" x2="46" y2="44" stroke="#334155" strokeWidth="2"/>
      {expression[state]}
      {state === 'dead' && <text x="36" y="30" fontSize="12">💀</text>}
    </svg>
  )
}

export const Avatar1 = ({ state = 'normal', color = '#2563eb', size = 80 }) => {
  const eyeColor = state === 'dead' ? '#ef4444' : state === 'happy' ? '#10b981' : color
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.3"/>
      <rect x="28" y="54" width="24" height="16" rx="4" fill="#64748b"/>
      <rect x="18" y="20" width="44" height="36" rx="8" fill="#94a3b8"/>
      <rect x="18" y="20" width="44" height="36" rx="8" fill={color} opacity="0.2"/>
      <rect x="14" y="26" width="6" height="14" rx="3" fill="#64748b"/>
      <rect x="60" y="26" width="6" height="14" rx="3" fill="#64748b"/>
      <line x1="40" y1="20" x2="40" y2="10" stroke="#64748b" strokeWidth="3"/>
      <circle cx="40" cy="8" r="4" fill={eyeColor}>
        <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <rect x="24" y="30" width="12" height="10" rx="3" fill={eyeColor} opacity="0.9"/>
      <rect x="44" y="30" width="12" height="10" rx="3" fill={eyeColor} opacity="0.9"/>
      {state !== 'dead' && <rect x="27" y="33" width="4" height="4" rx="1" fill="white" opacity="0.8"/>}
      {state !== 'dead' && <rect x="47" y="33" width="4" height="4" rx="1" fill="white" opacity="0.8"/>}
      {state === 'happy'  && <rect x="28" y="44" width="24" height="6" rx="3" fill={color}/>}
      {state === 'normal' && <rect x="30" y="45" width="20" height="4" rx="2" fill="#475569"/>}
      {state === 'dead'   && <><rect x="30" y="44" width="20" height="4" rx="2" fill="#ef444460"/><text x="32" y="55" fontSize="10">ERROR</text></>}
    </svg>
  )
}

export const Avatar2 = ({ state = 'normal', color = '#10b981', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="28" y="55" width="24" height="16" rx="6" fill={color} opacity="0.8"/>
      <ellipse cx="40" cy="34" rx="24" ry="26" fill="#86efac"/>
      <ellipse cx="40" cy="34" rx="24" ry="26" fill={color} opacity="0.3"/>
      <line x1="28" y1="12" x2="20" y2="4" stroke={color} strokeWidth="3"/>
      <circle cx="19" cy="3" r="3" fill={color}/>
      <line x1="52" y1="12" x2="60" y2="4" stroke={color} strokeWidth="3"/>
      <circle cx="61" cy="3" r="3" fill={color}/>
      <ellipse cx="28" cy="32" rx="9" ry="10" fill="black"/>
      <ellipse cx="52" cy="32" rx="9" ry="10" fill="black"/>
      <ellipse cx="26" cy="29" rx="3" ry="4" fill="white" opacity="0.9"/>
      <ellipse cx="50" cy="29" rx="3" ry="4" fill="white" opacity="0.9"/>
      {state === 'dead' && <line x1="24" y1="28" x2="32" y2="36" stroke="#ef4444" strokeWidth="2"/>}
      {state === 'dead' && <line x1="32" y1="28" x2="24" y2="36" stroke="#ef4444" strokeWidth="2"/>}
      {state === 'dead' && <line x1="48" y1="28" x2="56" y2="36" stroke="#ef4444" strokeWidth="2"/>}
      {state === 'dead' && <line x1="56" y1="28" x2="48" y2="36" stroke="#ef4444" strokeWidth="2"/>}
      {state === 'happy'  && <path d="M26 48 Q40 58 54 48" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="30" y1="50" x2="50" y2="50" stroke="black" strokeWidth="2.5"/>}
      {state === 'dead'   && <path d="M28 52 Q40 46 52 52" stroke="black" strokeWidth="2.5" fill="none"/>}
    </svg>
  )
}

export const Avatar3 = ({ state = 'normal', color = '#8b5cf6', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="72" rx="14" ry="5" fill={color} opacity="0.15"/>
      <g>
        {state === 'normal' && <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="3s" repeatCount="indefinite"/>}
        <path d="M18 70 Q18 28 40 20 Q62 28 62 70 L58 65 L54 70 L50 65 L46 70 L42 65 L38 70 L34 65 L30 70 L26 65 Z" fill="white" opacity="0.9"/>
        <path d="M18 70 Q18 28 40 20 Q62 28 62 70 L58 65 L54 70 L50 65 L46 70 L42 65 L38 70 L34 65 L30 70 L26 65 Z" fill={color} opacity="0.2"/>
        <ellipse cx="30" cy="42" rx="6" ry="7" fill="#1e293b"/>
        <ellipse cx="50" cy="42" rx="6" ry="7" fill="#1e293b"/>
        {state !== 'dead' && <ellipse cx="28" cy="39" rx="2" ry="3" fill="white" opacity="0.8"/>}
        {state !== 'dead' && <ellipse cx="48" cy="39" rx="2" ry="3" fill="white" opacity="0.8"/>}
        {state === 'dead' && <line x1="26" y1="38" x2="34" y2="46" stroke="#ef4444" strokeWidth="2"/>}
        {state === 'dead' && <line x1="34" y1="38" x2="26" y2="46" stroke="#ef4444" strokeWidth="2"/>}
        {state === 'dead' && <line x1="46" y1="38" x2="54" y2="46" stroke="#ef4444" strokeWidth="2"/>}
        {state === 'dead' && <line x1="54" y1="38" x2="46" y2="46" stroke="#ef4444" strokeWidth="2"/>}
        {state === 'happy'  && <path d="M30 54 Q40 62 50 54" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
        {state === 'normal' && <ellipse cx="40" cy="55" rx="5" ry="4" fill="#1e293b"/>}
        {state === 'dead'   && <path d="M32 56 Q40 52 48 56" stroke="#1e293b" strokeWidth="2.5" fill="none"/>}
      </g>
    </svg>
  )
}

export const Avatar4 = ({ state = 'normal', color = '#f59e0b', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="#b45309"/>
      <circle cx="40" cy="36" r="22" fill="#FCD5A5"/>
      <ellipse cx="40" cy="16" rx="22" ry="5" fill="#1e293b"/>
      <rect x="22" y="6" width="36" height="12" rx="4" fill="#1e293b"/>
      <path d="M38 8 L40 4 L42 8" fill={color}/>
      <ellipse cx="28" cy="35" rx="8" ry="7" fill="#1e293b"/>
      <line x1="20" y1="30" x2="36" y2="30" stroke="#1e293b" strokeWidth="3"/>
      {state === 'dead' ? <><line x1="46" y1="32" x2="54" y2="40" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="32" x2="46" y2="40" stroke="#1a1a1a" strokeWidth="2.5"/></> : <ellipse cx="50" cy="36" rx="5" ry="5" fill="#1a1a1a"/>}
      {state !== 'dead' && <ellipse cx="48" cy="33" rx="2" ry="2" fill="white" opacity="0.8"/>}
      <path d="M54 28 L58 38" stroke="#ef444480" strokeWidth="2"/>
      {state === 'happy'  && <path d="M30 50 Q40 58 50 50" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <path d="M32 50 Q40 54 48 50" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M32 52 Q40 48 48 52" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const Avatar5 = ({ state = 'normal', color = '#ef4444', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="#1e293b"/>
      <circle cx="40" cy="36" r="22" fill="#1e293b"/>
      <rect x="18" y="20" width="44" height="10" rx="2" fill={color}/>
      <rect x="18" y="30" width="44" height="22" rx="2" fill="#0f172a"/>
      {state === 'dead' ? (
        <><line x1="26" y1="36" x2="34" y2="44" stroke={color} strokeWidth="2.5"/><line x1="34" y1="36" x2="26" y2="44" stroke={color} strokeWidth="2.5"/><line x1="46" y1="36" x2="54" y2="44" stroke={color} strokeWidth="2.5"/><line x1="54" y1="36" x2="46" y2="44" stroke={color} strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="40" rx="5" ry="4" fill={state === 'happy' ? '#10b981' : 'white'}/><ellipse cx="50" cy="40" rx="5" ry="4" fill={state === 'happy' ? '#10b981' : 'white'}/></>
      )}
    </svg>
  )
}

export const Avatar6 = ({ state = 'normal', color = '#8b5cf6', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill={color} opacity="0.8"/>
      <circle cx="40" cy="36" r="22" fill="#FCD5A5"/>
      <ellipse cx="40" cy="16" rx="24" ry="5" fill="#1e293b"/>
      <polygon points="40,1 26,16 54,16" fill="#1e293b"/>
      <rect x="26" y="13" width="28" height="5" fill={color}/>
      <text x="34" y="12" fontSize="9" fill={color}>⭐</text>
      {state === 'dead' ? (
        <><line x1="26" y1="33" x2="34" y2="41" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="33" x2="26" y2="41" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="33" x2="54" y2="41" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="33" x2="46" y2="41" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="37" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="50" cy="37" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="28" cy="35" rx="2" ry="2" fill="white" opacity="0.8"/><ellipse cx="48" cy="35" rx="2" ry="2" fill="white" opacity="0.8"/></>
      )}
      <path d="M40 42 L37 48 L43 48 Z" fill="#e29b6b"/>
      {state === 'happy'  && <path d="M28 52 Q40 62 52 52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <path d="M31 52 Q40 56 49 52" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M30 54 Q40 50 50 54" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const Avatar7 = ({ state = 'normal', color = '#06b6d4', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="24" y="52" width="32" height="20" rx="10" fill="#94a3b8"/>
      <circle cx="40" cy="34" r="24" fill="#cbd5e1"/>
      <circle cx="40" cy="34" r="24" fill={color} opacity="0.15"/>
      <ellipse cx="40" cy="34" rx="16" ry="14" fill="#0f172a"/>
      <ellipse cx="40" cy="34" rx="16" ry="14" fill={color} opacity="0.3"/>
      <ellipse cx="32" cy="27" rx="5" ry="4" fill="white" opacity="0.25"/>
      {state === 'dead' ? (
        <><line x1="32" y1="30" x2="38" y2="36" stroke="white" strokeWidth="2"/><line x1="38" y1="30" x2="32" y2="36" stroke="white" strokeWidth="2"/><line x1="42" y1="30" x2="48" y2="36" stroke="white" strokeWidth="2"/><line x1="48" y1="30" x2="42" y2="36" stroke="white" strokeWidth="2"/></>
      ) : (
        <><ellipse cx="35" cy="33" rx="4" ry="4" fill="white"/><ellipse cx="45" cy="33" rx="4" ry="4" fill="white"/><ellipse cx="34" cy="31" rx="1.5" ry="1.5" fill="#0f172a"/><ellipse cx="44" cy="31" rx="1.5" ry="1.5" fill="#0f172a"/></>
      )}
      {state === 'happy'  && <path d="M32 40 Q40 46 48 40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="34" y1="41" x2="46" y2="41" stroke="white" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M32 42 Q40 38 48 42" stroke="white" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const Avatar8 = ({ state = 'normal', color = '#dc2626', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.2"/>
      <rect x="24" y="54" width="32" height="18" rx="8" fill="#1e1e2e"/>
      <path d="M24 54 L16 74 L40 62 L64 74 L56 54 Z" fill={color} opacity="0.3"/>
      <circle cx="40" cy="35" r="22" fill="#e2d5f0"/>
      <path d="M18 30 Q20 14 40 12 Q60 14 62 30 Q55 18 50 22 Q45 16 40 18 Q35 16 30 22 Q25 18 18 30Z" fill="#1e1e2e"/>
      {state === 'dead' ? (
        <><line x1="26" y1="33" x2="34" y2="41" stroke={color} strokeWidth="2.5"/><line x1="34" y1="33" x2="26" y2="41" stroke={color} strokeWidth="2.5"/><line x1="46" y1="33" x2="54" y2="41" stroke={color} strokeWidth="2.5"/><line x1="54" y1="33" x2="46" y2="41" stroke={color} strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="37" rx="5" ry="5" fill={state === 'happy' ? color : '#1e1e2e'}/><ellipse cx="50" cy="37" rx="5" ry="5" fill={state === 'happy' ? color : '#1e1e2e'}/></>
      )}
      <path d="M36 50 L38 56 L40 50" fill="white" stroke="#94a3b8" strokeWidth="0.5"/>
      <path d="M40 50 L42 56 L44 50" fill="white" stroke="#94a3b8" strokeWidth="0.5"/>
      {state === 'happy'  && <path d="M28 50 Q40 60 52 50" stroke="#1e1e2e" strokeWidth="2" fill="none"/>}
      {state === 'normal' && <line x1="32" y1="50" x2="48" y2="50" stroke="#1e1e2e" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M30 52 Q40 48 50 52" stroke="#1e1e2e" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const Avatar9 = ({ state = 'normal', color = '#10b981', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="#e2e8f0"/>
      <circle cx="40" cy="35" r="22" fill="#FDE68A"/>
      <path d="M18 25 Q14 14 22 12 Q20 20 26 18 Q24 10 32 10 Q30 18 36 16 Q36 8 40 10 Q40 18 44 16 Q44 8 48 10 Q46 18 54 18 Q50 10 58 12 Q66 14 62 25" fill={color} opacity="0.8"/>
      <circle cx="28" cy="36" r="8" fill="none" stroke="#1e293b" strokeWidth="2.5"/>
      <circle cx="52" cy="36" r="8" fill="none" stroke="#1e293b" strokeWidth="2.5"/>
      <line x1="36" y1="36" x2="44" y2="36" stroke="#1e293b" strokeWidth="2"/>
      <line x1="20" y1="36" x2="14" y2="34" stroke="#1e293b" strokeWidth="2"/>
      <line x1="60" y1="36" x2="66" y2="34" stroke="#1e293b" strokeWidth="2"/>
      {state === 'dead' ? (
        <><line x1="24" y1="32" x2="32" y2="40" stroke="#1a1a1a" strokeWidth="2"/><line x1="32" y1="32" x2="24" y2="40" stroke="#1a1a1a" strokeWidth="2"/><line x1="48" y1="32" x2="56" y2="40" stroke="#1a1a1a" strokeWidth="2"/><line x1="56" y1="32" x2="48" y2="40" stroke="#1a1a1a" strokeWidth="2"/></>
      ) : (
        <><ellipse cx="28" cy="36" rx="4" ry="4" fill={state === 'happy' ? color : '#1a1a1a'}/><ellipse cx="52" cy="36" rx="4" ry="4" fill={state === 'happy' ? color : '#1a1a1a'}/></>
      )}
      <path d="M32 48 Q40 52 48 48" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
      {state === 'happy'  && <path d="M30 54 Q40 62 50 54" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="32" y1="54" x2="48" y2="54" stroke="#1a1a1a" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M32 56 Q40 52 48 56" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const Avatar10 = ({ state = 'normal', color = '#f59e0b', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="22" y="52" width="36" height="20" rx="8" fill="#292524"/>
      <rect x="16" y="52" width="12" height="10" rx="4" fill={color}/>
      <rect x="52" y="52" width="12" height="10" rx="4" fill={color}/>
      <circle cx="40" cy="34" r="22" fill="#FCD5A5"/>
      <ellipse cx="40" cy="16" rx="22" ry="8" fill="#1c1917"/>
      <rect x="18" y="14" width="44" height="8" rx="2" fill="#1c1917"/>
      <path d="M22 22 L18 32" stroke={color} strokeWidth="3"/>
      <path d="M58 22 L62 32" stroke={color} strokeWidth="3"/>
      <rect x="34" y="10" width="12" height="8" rx="2" fill={color}/>
      <rect x="22" y="36" width="36" height="20" rx="4" fill="#292524" opacity="0.7"/>
      {state === 'dead' ? (
        <><line x1="28" y1="36" x2="36" y2="44" stroke={color} strokeWidth="2.5"/><line x1="36" y1="36" x2="28" y2="44" stroke={color} strokeWidth="2.5"/><line x1="44" y1="36" x2="52" y2="44" stroke={color} strokeWidth="2.5"/><line x1="52" y1="36" x2="44" y2="44" stroke={color} strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="32" cy="40" rx="5" ry="4" fill={state === 'happy' ? color : '#f97316'}/><ellipse cx="48" cy="40" rx="5" ry="4" fill={state === 'happy' ? color : '#f97316'}/></>
      )}
    </svg>
  )
}

export const Avatar11 = ({ state = 'normal', color = '#ec4899', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill={color} opacity="0.6"/>
      <circle cx="40" cy="36" r="22" fill="#fce7f3"/>
      <polygon points="40,4 36,18 44,18" fill={color}/>
      <path d="M18 22 Q10 36 14 50" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M20 20 Q10 34 12 50" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M22 18 Q12 32 14 48" stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="20" cy="20" rx="5" ry="7" fill="#fce7f3" transform="rotate(-20 20 20)"/>
      <ellipse cx="60" cy="20" rx="5" ry="7" fill="#fce7f3" transform="rotate(20 60 20)"/>
      <ellipse cx="20" cy="20" rx="3" ry="5" fill={color} opacity="0.5" transform="rotate(-20 20 20)"/>
      {state === 'dead' ? (
        <><line x1="26" y1="34" x2="34" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="34" x2="26" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="34" x2="54" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="34" x2="46" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="38" rx="6" ry="6" fill="#1a1a1a"/><ellipse cx="50" cy="38" rx="6" ry="6" fill="#1a1a1a"/><ellipse cx="28" cy="35" rx="2.5" ry="2.5" fill="white" opacity="0.9"/><ellipse cx="48" cy="35" rx="2.5" ry="2.5" fill="white" opacity="0.9"/></>
      )}
      <ellipse cx="22" cy="46" rx="5" ry="3" fill={color} opacity="0.4"/>
      <ellipse cx="58" cy="46" rx="5" ry="3" fill={color} opacity="0.4"/>
      {state === 'happy'  && <path d="M28 50 Q40 60 52 50" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <path d="M32 50 Q40 54 48 50" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M30 52 Q40 48 50 52" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 12 – Gato (con parpadeo animado)
export const Avatar12 = ({ state = 'normal', color = '#f97316', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill={color} opacity="0.7"/>
      <circle cx="40" cy="36" r="22" fill="#FDE68A"/>
      <circle cx="40" cy="36" r="22" fill={color} opacity="0.15"/>
      {/* Orejas de gato */}
      <polygon points="18,22 24,6 32,20" fill={color}/>
      <polygon points="62,22 56,6 48,20" fill={color}/>
      <polygon points="20,21 25,9 30,20" fill="#fce7f3"/>
      <polygon points="60,21 55,9 50,20" fill="#fce7f3"/>
      {/* Ojos */}
      {state === 'dead' ? (
        <><line x1="26" y1="34" x2="34" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="34" x2="26" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="34" x2="54" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="34" x2="46" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <>
          <ellipse cx="30" cy="38" rx="6" ry="6" fill="#1a1a1a">
            {state === 'normal' && <animate attributeName="ry" values="6;0.5;6" dur="4s" begin="1s" repeatCount="indefinite"/>}
          </ellipse>
          <ellipse cx="50" cy="38" rx="6" ry="6" fill="#1a1a1a">
            {state === 'normal' && <animate attributeName="ry" values="6;0.5;6" dur="4s" begin="1s" repeatCount="indefinite"/>}
          </ellipse>
          {state !== 'dead' && <ellipse cx="28" cy="35" rx="2" ry="2.5" fill="white" opacity="0.9"/>}
          {state !== 'dead' && <ellipse cx="48" cy="35" rx="2" ry="2.5" fill="white" opacity="0.9"/>}
        </>
      )}
      {/* Nariz y bigotes */}
      <ellipse cx="40" cy="46" rx="3" ry="2" fill={color}/>
      <line x1="22" y1="44" x2="37" y2="46" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="22" y1="48" x2="37" y2="47" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="58" y1="44" x2="43" y2="46" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="58" y1="48" x2="43" y2="47" stroke="#94a3b8" strokeWidth="1"/>
      {state === 'happy'  && <path d="M30 52 Q40 60 50 52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <path d="M36 50 L40 53 L44 50" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M32 54 Q40 50 48 54" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 13 – Chef (con gorro animado)
export const Avatar13 = ({ state = 'normal', color = '#ef4444', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="#1e293b"/>
      <circle cx="40" cy="36" r="22" fill="#FBBF82"/>
      {/* Gorro de chef */}
      <rect x="24" y="14" width="32" height="14" rx="4" fill="white"/>
      <ellipse cx="40" cy="12" rx="18" ry="10" fill="white">
        {state === 'happy' && <animate attributeName="ry" values="10;12;10" dur="1s" repeatCount="indefinite"/>}
      </ellipse>
      <rect x="24" y="22" width="32" height="4" fill="#e2e8f0"/>
      {/* Ojos */}
      {state === 'dead' ? (
        <><line x1="26" y1="34" x2="34" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="34" x2="26" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="34" x2="54" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="34" x2="46" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="38" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="50" cy="38" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="28" cy="36" rx="2" ry="2" fill="white" opacity="0.8"/><ellipse cx="48" cy="36" rx="2" ry="2" fill="white" opacity="0.8"/></>
      )}
      {/* Bigote */}
      <path d="M30 48 Q35 52 40 49 Q45 52 50 48" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
      {state === 'happy'  && <path d="M28 54 Q40 64 52 54" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="32" y1="54" x2="48" y2="54" stroke="#1a1a1a" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M30 56 Q40 52 50 56" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 14 – Dinosaurio (con cola que se mueve)
export const Avatar14 = ({ state = 'normal', color = '#22c55e', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.3"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill={color}/>
      {/* Cola */}
      <path d="M62 60 Q72 50 68 38" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round">
        {state !== 'dead' && <animate attributeName="d" values="M62 60 Q72 50 68 38;M62 60 Q74 55 72 42;M62 60 Q72 50 68 38" dur="1.5s" repeatCount="indefinite"/>}
      </path>
      {/* Cabeza */}
      <ellipse cx="40" cy="34" rx="22" ry="20" fill={color}/>
      {/* Escamas */}
      <path d="M30 14 L34 8 L38 14" fill="#16a34a"/>
      <path d="M38 12 L42 6 L46 12" fill="#16a34a"/>
      <path d="M46 14 L50 8 L54 14" fill="#16a34a"/>
      {/* Ojos */}
      {state === 'dead' ? (
        <><line x1="26" y1="30" x2="34" y2="38" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="30" x2="26" y2="38" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="30" x2="54" y2="38" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="30" x2="46" y2="38" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="34" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="50" cy="34" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="28" cy="32" rx="2" ry="2" fill="white" opacity="0.9"/><ellipse cx="48" cy="32" rx="2" ry="2" fill="white" opacity="0.9"/></>
      )}
      {/* Dientes */}
      <path d="M28 46 L30 50 L32 46 L34 50 L36 46 L38 50 L40 46 L42 50 L44 46 L46 50 L48 46 L50 50 L52 46" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
      {state === 'happy'  && <path d="M26 48 Q40 56 54 48" stroke="#16a34a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M28 50 Q40 46 52 50" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 15 – Ángel (con halo flotante)
export const Avatar15 = ({ state = 'normal', color = '#fbbf24', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.2"/>
      {/* Alas */}
      <ellipse cx="18" cy="50" rx="14" ry="10" fill="white" opacity="0.8" transform="rotate(-20 18 50)"/>
      <ellipse cx="62" cy="50" rx="14" ry="10" fill="white" opacity="0.8" transform="rotate(20 62 50)"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="white" opacity="0.9"/>
      <circle cx="40" cy="36" r="22" fill="#FDE68A"/>
      {/* Halo animado */}
      <ellipse cx="40" cy="10" rx="14" ry="4" fill="none" stroke={color} strokeWidth="3">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Ojos */}
      {state === 'dead' ? (
        <><line x1="26" y1="34" x2="34" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="34" y1="34" x2="26" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="46" y1="34" x2="54" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/><line x1="54" y1="34" x2="46" y2="42" stroke="#1a1a1a" strokeWidth="2.5"/></>
      ) : (
        <><ellipse cx="30" cy="38" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="50" cy="38" rx="5" ry="5" fill="#1a1a1a"/><ellipse cx="28" cy="36" rx="2" ry="2" fill="white" opacity="0.9"/><ellipse cx="48" cy="36" rx="2" ry="2" fill="white" opacity="0.9"/></>
      )}
      {/* Mejillas */}
      <ellipse cx="22" cy="44" rx="6" ry="4" fill="#fca5a5" opacity="0.5"/>
      <ellipse cx="58" cy="44" rx="6" ry="4" fill="#fca5a5" opacity="0.5"/>
      {state === 'happy'  && <path d="M28 52 Q40 62 52 52" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <path d="M32 52 Q40 56 48 52" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
      {state === 'dead'   && <path d="M30 54 Q40 50 50 54" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 16 – Oso (con orejas redondeadas)
export const Avatar16 = ({ state = 'normal', color = '#92400e', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.3"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill={color}/>
      {/* Orejas */}
      <circle cx="20" cy="20" r="10" fill={color}/>
      <circle cx="60" cy="20" r="10" fill={color}/>
      <circle cx="20" cy="20" r="6" fill="#fcd5a5"/>
      <circle cx="60" cy="20" r="6" fill="#fcd5a5"/>
      {/* Cabeza */}
      <circle cx="40" cy="36" r="22" fill={color}/>
      {/* Hocico */}
      <ellipse cx="40" cy="46" rx="10" ry="7" fill="#fcd5a5"/>
      {/* Nariz */}
      <ellipse cx="40" cy="42" rx="4" ry="3" fill="#1a1a1a"/>
      {/* Ojos */}
      {state === 'dead' ? (
        <><line x1="26" y1="32" x2="34" y2="40" stroke="white" strokeWidth="2.5"/><line x1="34" y1="32" x2="26" y2="40" stroke="white" strokeWidth="2.5"/><line x1="46" y1="32" x2="54" y2="40" stroke="white" strokeWidth="2.5"/><line x1="54" y1="32" x2="46" y2="40" stroke="white" strokeWidth="2.5"/></>
      ) : (
        <><circle cx="30" cy="36" r="5" fill="#1a1a1a"/><circle cx="50" cy="36" r="5" fill="#1a1a1a"/><circle cx="28" cy="34" r="2" fill="white" opacity="0.9"/><circle cx="48" cy="34" r="2" fill="white" opacity="0.9"/></>
      )}
      {state === 'happy'  && <path d="M34 50 Q40 56 46 50" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="36" y1="50" x2="44" y2="50" stroke="#1a1a1a" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M34 52 Q40 48 46 52" stroke="#1a1a1a" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

// Avatar 17 – DJ / Músico (con auriculares y notas)
export const Avatar17 = ({ state = 'normal', color = '#a855f7', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="70" rx="16" ry="6" fill={color} opacity="0.25"/>
      <rect x="26" y="54" width="28" height="18" rx="8" fill="#1e293b"/>
      <circle cx="40" cy="36" r="22" fill="#1e293b"/>
      {/* Auriculares */}
      <path d="M18 36 Q18 14 40 14 Q62 14 62 36" stroke={color} strokeWidth="4" fill="none"/>
      <rect x="12" y="32" width="10" height="14" rx="5" fill={color}/>
      <rect x="58" y="32" width="10" height="14" rx="5" fill={color}/>
      {/* Notas musicales flotantes */}
      <text x="10" y="26" fontSize="10" fill={color} opacity="0.8">
        ♪
        {state !== 'dead' && <animateTransform attributeName="transform" type="translate" values="0 0;-2 -4;0 0" dur="1.5s" repeatCount="indefinite"/>}
      </text>
      <text x="62" y="22" fontSize="10" fill={color} opacity="0.6">
        ♫
        {state !== 'dead' && <animateTransform attributeName="transform" type="translate" values="0 0;2 -5;0 0" dur="2s" repeatCount="indefinite"/>}
      </text>
      {/* Ojos con gafas oscuras */}
      <rect x="22" y="32" width="14" height="10" rx="5" fill={state === 'dead' ? '#1a1a1a' : color} opacity="0.9"/>
      <rect x="44" y="32" width="14" height="10" rx="5" fill={state === 'dead' ? '#1a1a1a' : color} opacity="0.9"/>
      <line x1="36" y1="37" x2="44" y2="37" stroke={color} strokeWidth="2"/>
      {state !== 'dead' && <ellipse cx="26" cy="36" rx="3" ry="3" fill="white" opacity="0.4"/>}
      {state !== 'dead' && <ellipse cx="48" cy="36" rx="3" ry="3" fill="white" opacity="0.4"/>}
      {state === 'dead' && <text x="25" y="42" fontSize="8" fill="#ef4444">☠</text>}
      {state === 'happy'  && <path d="M28 50 Q40 60 52 50" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
      {state === 'normal' && <line x1="32" y1="50" x2="48" y2="50" stroke="white" strokeWidth="2"/>}
      {state === 'dead'   && <path d="M30 52 Q40 48 50 52" stroke="white" strokeWidth="2" fill="none"/>}
    </svg>
  )
}

export const AVATARS = [
  Avatar0, Avatar1, Avatar2, Avatar3, Avatar4, Avatar5,
  Avatar6, Avatar7, Avatar8, Avatar9, Avatar10, Avatar11,
  Avatar12, Avatar13, Avatar14, Avatar15, Avatar16, Avatar17,
]

export const AVATAR_NAMES = [
  'Intelectual', 'Robot', 'Alien', 'Fantasma', 'Pirata', 'Ninja',
  'Bruja', 'Astronauta', 'Vampiro', 'Científico', 'Samurái', 'Unicornio',
  'Gato', 'Chef', 'Dinosaurio', 'Ángel', 'Oso', 'DJ',
]

export const AVATAR_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
]

export function getAvatarByKey(key) {
  const index = parseInt(key?.replace('avatar', ''), 10)
  return AVATARS[isNaN(index) ? 0 : Math.min(index, AVATARS.length - 1)]
}
