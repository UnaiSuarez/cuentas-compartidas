export default function AppLogo({ size = 80, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-label="Cuentas Compartidas"
    >
      {/* Top arc – blue */}
      <path
        d="M 10 40 A 30 30 0 0 1 70 40"
        stroke="#2563eb" strokeWidth="6" strokeLinecap="round"
      />
      {/* Top arrowhead */}
      <path
        d="M 63 28 L 70 40 L 58 38"
        stroke="#2563eb" strokeWidth="4" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Bottom arc – emerald */}
      <path
        d="M 70 40 A 30 30 0 0 1 10 40"
        stroke="#10b981" strokeWidth="6" strokeLinecap="round"
      />
      {/* Bottom arrowhead */}
      <path
        d="M 17 52 L 10 40 L 22 42"
        stroke="#10b981" strokeWidth="4" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Center coin */}
      <circle cx="40" cy="40" r="15" fill="#0f172a"/>
      <circle cx="40" cy="40" r="15" fill="#2563eb" fillOpacity="0.12"/>
      <text
        x="40" y="47"
        textAnchor="middle"
        fontSize="19" fontWeight="bold"
        fill="#e2e8f0"
        fontFamily="system-ui,sans-serif"
      >€</text>
    </svg>
  )
}
