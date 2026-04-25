/**
 * Generador del manual de documentación en PDF.
 * Ejecutar con: node docs/generate-pdf.mjs
 *
 * Genera: docs/CUENTAS_COMPARTIDAS_MANUAL.pdf
 */

import jsPDFModule from 'jspdf'
import autoTable    from 'jspdf-autotable'
import { writeFileSync } from 'fs'

// jsPDF puede exportarse como default o como named export según la versión
const jsPDF = jsPDFModule.jsPDF ?? jsPDFModule.default ?? jsPDFModule
const doc = new jsPDF({ unit: 'mm', format: 'a4' })
let y = 0

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pageHeader(title) {
  doc.addPage()
  y = 20
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('💰 Cuentas Compartidas — Manual de Usuario', 14, 10)
  doc.text(`${title}`, 196, 10, { align: 'right' })
  y = 30
}

function h1(text) {
  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235)
  doc.text(text, 14, y)
  y += 10
}

function h2(text) {
  doc.setFontSize(14)
  doc.setTextColor(30, 41, 59)
  doc.setFont(undefined, 'bold')
  doc.text(text, 14, y)
  doc.setFont(undefined, 'normal')
  y += 8
}

function p(text, indent = 0) {
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  const lines = doc.splitTextToSize(text, 182 - indent)
  doc.text(lines, 14 + indent, y)
  y += lines.length * 5 + 2
}

function bullet(text, indent = 5) {
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  const lines = doc.splitTextToSize(`• ${text}`, 177 - indent)
  doc.text(lines, 14 + indent, y)
  y += lines.length * 5 + 1
}

function sep() {
  doc.setDrawColor(226, 232, 240)
  doc.line(14, y, 196, y)
  y += 5
}

function checkY(need = 30) {
  if (y + need > 270) { pageHeader('') }
}

// ─── PORTADA ──────────────────────────────────────────────────────────────────
doc.setFillColor(15, 23, 42)
doc.rect(0, 0, 210, 297, 'F')

doc.setTextColor(255, 255, 255)
doc.setFontSize(36)
doc.setFont(undefined, 'bold')
doc.text('💰', 105, 90, { align: 'center' })
doc.text('Cuentas Compartidas', 105, 110, { align: 'center' })

doc.setFont(undefined, 'normal')
doc.setFontSize(16)
doc.setTextColor(148, 163, 184)
doc.text('Manual de Usuario y Documentación Técnica', 105, 125, { align: 'center' })

doc.setFontSize(12)
doc.setTextColor(100, 116, 139)
doc.text('React 19 + Vite + Firebase + Vercel', 105, 145, { align: 'center' })
doc.text('Versión 1.0 · Abril 2026', 105, 155, { align: 'center' })

// Índice
doc.setFillColor(30, 41, 59)
doc.rect(20, 170, 170, 90, 'F')
doc.setTextColor(255, 255, 255)
doc.setFontSize(12)
doc.setFont(undefined, 'bold')
doc.text('Contenido', 105, 182, { align: 'center' })
doc.setFont(undefined, 'normal')
doc.setFontSize(10)
doc.setTextColor(148, 163, 184)
const toc = [
  '1. Introducción',
  '2. Instalación y configuración',
  '3. Primeros pasos (onboarding)',
  '4. Transacciones',
  '5. Saldos y pagos óptimos',
  '6. Chat interno',
  '7. Estadísticas',
  '8. Exportación de datos',
  '9. Ajustes y perfil',
  '10. Arquitectura técnica',
  '11. Deploy en Vercel',
  '12. FAQ',
]
toc.forEach((item, i) => {
  doc.text(item, 30, 192 + i * 5.5)
})

// ─── 1. Introducción ──────────────────────────────────────────────────────────
pageHeader('Introducción')
h1('1. Introducción')
p('Cuentas Compartidas es una aplicación web para gestionar gastos e ingresos entre grupos pequeños de personas (piso compartido, familia, amigos de viaje).')
p('Inspirada en Tricount y Splitwise, ofrece:')
checkY()
bullet('Registro y seguimiento de gastos compartidos')
bullet('Cálculo automático de quién debe a quién (algoritmo greedy)')
bullet('Chat interno del grupo en tiempo real')
bullet('Exportación a Excel, PDF y CSV')
bullet('Estadísticas visuales del grupo')
bullet('Avatares 2D personalizables con estados emocionales')
bullet('Funciona en móvil y escritorio')
bullet('100% gratuito (Firebase + Vercel free tier)')

checkY()
h2('¿Para quién es?')
p('Para grupos de 2 a 10 personas que comparten gastos de forma regular: pisos compartidos, viajes, familias, grupos de amigos.')

sep()
h2('Stack tecnológico')
autoTable(doc, {
  startY: y,
  head: [['Capa', 'Tecnología', 'Versión', 'Propósito']],
  body: [
    ['UI',        'React',          '19.2',  'Interfaz de usuario'],
    ['Build',     'Vite',           '8.x',   'Bundler y dev server'],
    ['Estilos',   'Tailwind CSS',   'v4',    'Utilidades CSS'],
    ['Animac.',   'Framer Motion',  '12.x',  'Transiciones y animaciones'],
    ['Auth',      'Firebase Auth',  '12.x',  'Autenticación email/pwd'],
    ['BD',        'Firestore',      '12.x',  'Base de datos realtime'],
    ['Gráficos',  'Recharts',       '3.x',   'Visualización de datos'],
    ['Exportar',  'jsPDF + xlsx',   '—',     'Exportación de datos'],
    ['Fechas',    'date-fns',       '4.x',   'Formateo con locale ES'],
    ['Hosting',   'Vercel',         '—',     'Deploy frontend'],
  ],
  styles:     { fontSize: 8.5 },
  headStyles: { fillColor: [37, 99, 235] },
  theme:      'striped',
})
y = doc.lastAutoTable.finalY + 8

// ─── 2. Instalación ───────────────────────────────────────────────────────────
pageHeader('Instalación')
h1('2. Instalación y configuración')

h2('2.1 Requisitos previos')
bullet('Node.js v18 o superior')
bullet('npm v9 o superior')
bullet('Cuenta de Google (para Firebase Console)')
bullet('Cuenta de GitHub (para el repositorio)')
bullet('Cuenta de Vercel (para el deploy)')

checkY()
h2('2.2 Clonar el repositorio')
doc.setFont('Courier', 'normal')
doc.setFontSize(9)
doc.setFillColor(30, 41, 59)
doc.rect(14, y - 2, 182, 18, 'F')
doc.setTextColor(134, 239, 172)
doc.text('git clone https://github.com/TU_USUARIO/cuentas-compartidas.git', 18, y + 4)
doc.text('cd cuentas-compartidas && npm install', 18, y + 10)
doc.setFont(undefined, 'normal')
y += 22

h2('2.3 Crear proyecto Firebase')
p('Ve a console.firebase.google.com y sigue estos pasos:')
bullet('Haz clic en "Crear proyecto"')
bullet('Pon el nombre que quieras (ej: "cuentas-compartidas")')
bullet('Activa Firestore: Build → Firestore Database → Create database (mode producción)')
bullet('Activa Authentication: Build → Authentication → Get started → Email/Password → Habilitar')
bullet('Registra la app web: Configuración del proyecto ⚙ → Tus apps → Web → Registrar app')
bullet('Copia la configuración SDK (objeto firebaseConfig)')

checkY()
h2('2.4 Archivo .env.local')
p('Crea el archivo .env.local en la raíz del proyecto con las claves de Firebase:')
doc.setFont('Courier', 'normal')
doc.setFontSize(8)
doc.setFillColor(30, 41, 59)
doc.rect(14, y - 2, 182, 38, 'F')
doc.setTextColor(134, 239, 172)
const envLines = [
  'VITE_FIREBASE_API_KEY=AIzaSy...',
  'VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com',
  'VITE_FIREBASE_PROJECT_ID=tu-proyecto',
  'VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com',
  'VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012',
  'VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456',
]
envLines.forEach((l, i) => doc.text(l, 18, y + 4 + i * 5.5))
doc.setFont(undefined, 'normal')
y += 44

h2('2.5 Reglas de seguridad Firestore')
p('En Firebase Console → Firestore → Reglas, pega estas reglas para que solo los miembros del grupo accedan a sus datos:')
checkY(40)
doc.setFont('Courier', 'normal')
doc.setFontSize(7.5)
doc.setFillColor(30, 41, 59)
doc.rect(14, y - 2, 182, 52, 'F')
doc.setTextColor(134, 239, 172)
const rules = [
  "rules_version = '2';",
  "service cloud.firestore {",
  "  match /databases/{database}/documents {",
  "    match /users/{userId} {",
  "      allow read, write: if request.auth.uid == userId;",
  "    }",
  "    match /groups/{groupId} {",
  "      allow read: if request.auth != null;",
  "      allow create: if request.auth != null;",
  "      allow update: if request.auth.uid in resource.data.memberIds;",
  "    }",
  "    match /groups/{groupId}/{sub}/{docId} {",
  "      allow read, write: if request.auth.uid in",
  "        get(/databases/$(database)/documents/groups/$(groupId))",
  "        .data.memberIds;",
  "    }",
  "  }",
  "}",
]
rules.forEach((l, i) => doc.text(l, 18, y + 4 + i * 2.9))
doc.setFont(undefined, 'normal')
y += 58

h2('2.6 Arrancar en desarrollo')
doc.setFont('Courier', 'normal')
doc.setFontSize(9)
doc.setFillColor(30, 41, 59)
doc.rect(14, y - 2, 182, 10, 'F')
doc.setTextColor(134, 239, 172)
doc.text('npm run dev   →   http://localhost:5173', 18, y + 4)
doc.setFont(undefined, 'normal')
y += 15

// ─── 3. Primeros pasos ────────────────────────────────────────────────────────
pageHeader('Primeros pasos')
h1('3. Primeros pasos (onboarding)')

p('La primera vez que entras a la app debes completar 3 pasos sencillos:')

h2('Paso 1 — Crear cuenta')
p('Introduce tu correo y una contraseña (mínimo 6 caracteres). Firebase gestiona la autenticación de forma segura.')

h2('Paso 2 — Elegir perfil')
p('Elige tu nombre (el que verán los demás) y selecciona un avatar entre los 12+ disponibles. También puedes elegir tu color de acento.')
p('Los avatares muestran tu estado financiero:')
bullet('😄 Feliz → te deben dinero (saldo positivo)')
bullet('😐 Normal → saldo equilibrado')
bullet('😵 Triste → debes dinero (saldo negativo)')

h2('Paso 3 — Grupo')
p('Tienes dos opciones:')
bullet('Crear un grupo nuevo: introduce el nombre del grupo. Se generará un código de 6 caracteres (ej: "XK7P2M").')
bullet('Unirse a un grupo existente: pide el código al creador e introdúcelo en el campo correspondiente.')

sep()
p('Una vez dentro del grupo verás el dashboard con los saldos y el estado de todos los miembros.')

// ─── 4. Transacciones ─────────────────────────────────────────────────────────
pageHeader('Transacciones')
h1('4. Transacciones')

p('Desde la sección "Transacciones" puedes ver el historial completo y añadir nuevas entradas.')

h2('4.1 Añadir una transacción')
p('Pulsa el botón "+ Nueva" en la esquina superior derecha. El formulario tiene dos modos:')

bullet('Gasto (fondo rojo): dinero que el grupo ha gastado')
bullet('Ingreso (fondo verde): dinero que alguien ha aportado al grupo')

p('Campos del formulario:')
checkY(40)
autoTable(doc, {
  startY: y,
  head: [['Campo', 'Descripción', 'Requerido']],
  body: [
    ['Monto',       'Importe en euros (ej: 45,50)',                           'Sí'],
    ['Categoría',   'Comida, Transporte, Casa, Ocio, etc.',                    'No'],
    ['Descripción', 'Texto libre para recordar el contexto',                   'No'],
    ['Fecha',       'Fecha de la transacción (por defecto: hoy)',               'Sí'],
    ['Pagado por',  'Quién pagó o aportó el dinero',                           'Sí'],
    ['Dividido',    'Entre quiénes se divide (solo en gastos)',                 'Sí'],
  ],
  styles:     { fontSize: 9 },
  headStyles: { fillColor: [37, 99, 235] },
  theme:      'striped',
})
y = doc.lastAutoTable.finalY + 8

p('Si eliges una categoría, el monto sugerido se autocompleta automáticamente (configurable en Ajustes).')

h2('4.2 Filtros y búsqueda')
bullet('Búsqueda de texto: busca por descripción, categoría o nombre de persona')
bullet('Tipo: Todo / Gastos / Ingresos')
bullet('Fecha: Todo / Hoy / Esta semana / Este mes')

h2('4.3 Editar o eliminar')
p('Cada transacción tiene botones de editar (lápiz) y eliminar (papelera). La eliminación es permanente.')

// ─── 5. Saldos y pagos ────────────────────────────────────────────────────────
pageHeader('Saldos y Pagos')
h1('5. Saldos y pagos óptimos')

h2('5.1 Cómo se calcula el saldo')
p('El saldo neto de cada persona se calcula así:')
p('Saldo neto = Σ(lo que pagó) − Σ(lo que le corresponde pagar)', 10)
p('Ejemplo con 3 personas (A, B, C):')
bullet('A paga el alquiler de 900€ dividido entre los 3 → B y C le deben 300€ cada uno')
bullet('B paga la compra de 150€ dividida entre 3 → A y C le deben 50€ cada uno')
p('Saldo final: A = +600€, B = +50€, C = −350€, D = −300€')

checkY()
h2('5.2 Algoritmo de pagos óptimos')
p('El algoritmo greedy minimiza el número de transferencias necesarias:')
bullet('Ordena acreedores (saldo > 0) y deudores (saldo < 0) por importe')
bullet('El mayor deudor paga al mayor acreedor el mínimo de ambas cantidades')
bullet('Repite hasta saldar todas las deudas')
p('Resultado: siempre el número mínimo posible de pagos (mucho mejor que "cada uno paga a cada uno").')

checkY()
h2('5.3 Proceso de confirmación de pagos')
bullet('El deudor pulsa "He pagado" → se crea un pago en estado "pendiente"')
bullet('El acreedor ve la notificación y pulsa "Confirmar" → el pago queda registrado en el historial')
bullet('Se crea automáticamente una transacción de liquidación en el historial')
bullet('Se envía un mensaje automático al chat del grupo')

// ─── 6. Chat ──────────────────────────────────────────────────────────────────
pageHeader('Chat')
h1('6. Chat interno')

p('Todos los miembros del grupo pueden enviarse mensajes en tiempo real.')

h2('Tipos de mensajes')
bullet('Mensaje normal: texto libre de hasta 500 caracteres')
bullet('Notificación del sistema: aparece centrada, en gris. Se genera automáticamente al añadir transacciones o confirmar pagos')
bullet('Recordatorio de pago: generado automáticamente cuando alguien declara un pago')

h2('Características')
bullet('Tiempo real: los mensajes aparecen instantáneamente vía Firestore listener')
bullet('Historial completo sin límite: nunca se borran mensajes automáticamente')
bullet('Badge de no leídos: la Navbar muestra cuántos mensajes tienes sin leer')
bullet('Marca como leído: al abrir el chat, todos los mensajes pendientes se marcan como leídos')
bullet('Enter para enviar, Shift+Enter para nueva línea')

// ─── 7. Estadísticas ─────────────────────────────────────────────────────────
pageHeader('Estadísticas')
h1('7. Estadísticas')

p('La sección de Estadísticas muestra gráficos del comportamiento financiero del grupo.')

h2('Gráficos disponibles')
bullet('Gastos por categoría (pie chart): distribución visual de en qué se gasta más')
bullet('Gastos pagados por persona (bar chart): quién ha adelantado más dinero')
bullet('Evolución mensual (line chart): tendencia de gastos en los últimos 6 meses')

p('Los gráficos excluyen automáticamente las transacciones de liquidación para no distorsionar las estadísticas reales.')

// ─── 8. Exportación ──────────────────────────────────────────────────────────
pageHeader('Exportación')
h1('8. Exportación de datos')

p('Desde la sección Transacciones, el botón "Exportar" (con icono de descarga) permite exportar los datos filtrados en tres formatos:')

checkY(40)
autoTable(doc, {
  startY: y,
  head: [['Formato', 'Descripción', 'Usos']],
  body: [
    ['Excel (.xlsx)', '2 hojas: Transacciones y Resumen financiero',   'Análisis en Excel / Sheets'],
    ['PDF',           'Tabla visual con cabecera y colores',            'Archivar, imprimir, compartir'],
    ['CSV',           'Datos planos separados por ; (compatible Excel)', 'Importar a otras apps'],
  ],
  styles:     { fontSize: 9 },
  headStyles: { fillColor: [37, 99, 235] },
  theme:      'striped',
})
y = doc.lastAutoTable.finalY + 8

p('Solo se exportan los datos actualmente filtrados (si tienes aplicado un filtro "Este mes", solo se exporta ese mes).')
p('El CSV usa BOM UTF-8 para que Excel en español lo abra correctamente sin problemas de codificación.')

// ─── 9. Ajustes ───────────────────────────────────────────────────────────────
pageHeader('Ajustes')
h1('9. Ajustes y perfil')

h2('Mi perfil')
p('Puedes cambiar tu nombre, avatar y color de acento en cualquier momento. Los cambios se sincronizan al instante con todos los miembros.')

h2('Código del grupo')
p('En Ajustes puedes ver el código de 6 caracteres de tu grupo para compartirlo con nuevas personas que quieran unirse.')

h2('Miembros')
p('Lista de todos los miembros actuales del grupo con su avatar y correo.')

h2('Apariencia')
p('Toggle para cambiar entre modo oscuro (por defecto) y modo claro. La preferencia se guarda en el navegador.')

// ─── 10. Arquitectura ────────────────────────────────────────────────────────
pageHeader('Arquitectura')
h1('10. Arquitectura técnica')

h2('Estructura de colecciones Firestore')
checkY(50)
autoTable(doc, {
  startY: y,
  head: [['Colección', 'Documentos', 'Descripción']],
  body: [
    ['/users/{uid}',                    'email, name, avatar, groupId, color',   'Perfil de cada usuario'],
    ['/groups/{id}',                    'name, code, memberIds, settings',       'Info del grupo'],
    ['/groups/{id}/transactions/{id}',  'type, amount, paidBy, splitAmong...',   'Gastos e ingresos'],
    ['/groups/{id}/payments/{id}',      'from, to, amount, status',              'Pagos pendientes'],
    ['/groups/{id}/messages/{id}',      'type, text, sender, readBy...',         'Chat del grupo'],
  ],
  styles:     { fontSize: 8.5 },
  headStyles: { fillColor: [37, 99, 235] },
  theme:      'striped',
})
y = doc.lastAutoTable.finalY + 8

h2('Hooks principales')
checkY(40)
autoTable(doc, {
  startY: y,
  head: [['Hook', 'Archivo', 'Responsabilidad']],
  body: [
    ['useAuth',         'src/hooks/useAuth.js',         'SignUp, login, grupos'],
    ['useTransactions', 'src/hooks/useTransactions.js', 'CRUD de transacciones'],
    ['useChat',         'src/hooks/useChat.js',         'Mensajes Firestore'],
    ['useSettlement',   'src/hooks/useSettlement.js',   'Cálculo deudas + pagos'],
  ],
  styles:     { fontSize: 9 },
  headStyles: { fillColor: [37, 99, 235] },
  theme:      'striped',
})
y = doc.lastAutoTable.finalY + 8

h2('Algoritmo de settlement')
p('calculateGroupSummary() en src/utils/calculateSettlement.js:')
bullet('calculateBalances(): saldo neto de cada persona (O(n))')
bullet('calculateOptimalPayments(): lista mínima de pagos (greedy O(n log n))')
p('Compatible con campos Firestore (camelCase) y legacy (snake_case) para máxima robustez.')

// ─── 11. Deploy ───────────────────────────────────────────────────────────────
pageHeader('Deploy')
h1('11. Deploy en Vercel (gratuito)')

p('El deploy es automático: cada push a la rama main despliega la app en producción.')

h2('Pasos')
bullet('1. Sube el código a GitHub (ver instrucciones en README.md)')
bullet('2. Ve a vercel.com → Add New Project → importa tu repo')
bullet('3. En "Environment Variables" añade las 6 variables VITE_FIREBASE_*')
bullet('4. Clic en Deploy → espera ~1 minuto')
bullet('5. Tu app estará en: https://cuentas-compartidas-xxx.vercel.app')

h2('Configuración de Vercel')
p('No requiere ningún archivo vercel.json adicional. Vite build genera el output en /dist, y Vercel lo detecta automáticamente.')

h2('Variables de entorno en Vercel')
p('En Vercel Dashboard → Settings → Environment Variables añade exactamente las mismas variables que tienes en .env.local. Sin estas variables la app no puede conectar con Firebase.')

h2('Dominio personalizado')
p('Si quieres usar un dominio propio (ej: cuentas.tudominio.com), en Vercel → Project → Domains → Add.')

// ─── 12. FAQ ─────────────────────────────────────────────────────────────────
pageHeader('FAQ')
h1('12. Preguntas frecuentes')

const faqs = [
  ['¿Es completamente gratuito?',
   'Sí. Firebase free tier ofrece 50.000 lecturas y 20.000 escrituras diarias, suficiente para grupos pequeños. Vercel no tiene límite de ancho de banda en el free tier para proyectos personales.'],
  ['¿Qué pasa si no entro a la app varios días?',
   'Nada. A diferencia de Supabase, Firebase no pausa los proyectos por inactividad. Los datos persisten indefinidamente.'],
  ['¿Puedo estar en más de un grupo?',
   'Actualmente cada cuenta pertenece a un único grupo. Si necesitas múltiples grupos, crea una cuenta diferente.'],
  ['¿Qué pasa si elimino una transacción?',
   'La transacción se borra permanentemente de Firestore. Esto afectará a los saldos calculados. No hay papelera de reciclaje.'],
  ['¿El chat guarda los mensajes para siempre?',
   'Sí. Los mensajes no se borran automáticamente. El límite real es la cuota de Firestore, pero para grupos de 2-10 personas, años de mensajes caben con creces.'],
  ['¿Cómo funciona la sincronización en tiempo real?',
   'Firestore usa WebSockets internamente. Cuando alguien añade una transacción, todos los dispositivos conectados la ven al instante sin necesidad de recargar la página.'],
  ['¿Se puede usar offline?',
   'Firestore tiene caché offline por defecto. Puedes ver los datos aunque no tengas conexión, pero no puedes escribir nuevos hasta recuperarla.'],
  ['¿Cómo recupero mi contraseña?',
   'En la pantalla de login, haz clic en "¿Olvidaste la contraseña?" e introduce tu email. Firebase enviará un correo de recuperación.'],
]

faqs.forEach(([q, a]) => {
  checkY(20)
  doc.setFontSize(11)
  doc.setTextColor(37, 99, 235)
  doc.setFont(undefined, 'bold')
  doc.text(`Q: ${q}`, 14, y)
  doc.setFont(undefined, 'normal')
  y += 5
  p(`R: ${a}`, 3)
  y += 2
})

// ─── Guardar ──────────────────────────────────────────────────────────────────
const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
writeFileSync('docs/CUENTAS_COMPARTIDAS_MANUAL.pdf', pdfBuffer)
console.log('✅ PDF generado: docs/CUENTAS_COMPARTIDAS_MANUAL.pdf')
