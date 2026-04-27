# Documento Técnico - Cuentas Compartidas

**Versión:** 2.1  
**Fecha:** Abril 2026  
**Stack:** React 18 + Vite + Tailwind CSS + Firebase (Auth + Firestore) + Vercel

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Modelo de Datos Firestore](#modelo-de-datos-firestore)
6. [AppContext — Estado Global](#appcontext--estado-global)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Componentes Principales](#componentes-principales)
9. [Algoritmos Clave](#algoritmos-clave)
10. [Reglas de Seguridad Firestore](#reglas-de-seguridad-firestore)
11. [Flujos de Autenticación y Navegación](#flujos-de-autenticación-y-navegación)
12. [Optimizaciones y Performance](#optimizaciones-y-performance)
13. [Deployment](#deployment)
14. [Guía de Desarrollo](#guía-de-desarrollo)
15. [Historial de Versiones](#historial-de-versiones)

---

## Visión General

Cuentas Compartidas es una aplicación web de cliente pesado (thick client) para gestión de gastos compartidos en grupos. Toda la lógica de presentación y gran parte de la lógica de negocio se ejecutan en el navegador; Firebase actúa como BaaS (Backend-as-a-Service) para autenticación, persistencia y sincronización en tiempo real.

### Objetivos de Diseño

- **Precisión financiera:** decimales correctos, saldos siempre exactos
- **Sincronización realtime:** cambios propagados a todos los dispositivos vía Firestore listeners
- **UX responsiva:** mobile-first, funciona en cualquier dispositivo
- **Seguridad por diseño:** reglas Firestore como última línea de defensa
- **Performance:** bundle pequeño, code splitting, zero extra re-renders

---

## Arquitectura del Sistema

### Capas

```
┌─────────────────────────────────────┐
│  Capa UI — Componentes React        │  Tailwind CSS + Framer Motion
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  Capa Estado — AppContext           │  React Context API + onSnapshot
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  Capa Lógica — Hooks + Utils        │  useAuth, useTransactions, calculateSettlement…
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  Capa Datos — Firebase SDK          │  addDoc, updateDoc, onSnapshot…
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│  Infraestructura — Firebase Cloud   │  Auth + Firestore + Security Rules
└─────────────────────────────────────┘
```

### Flujo de datos (escritura)

```
User action → Component handler → Hook function → Firebase write
→ Firestore listener (onSnapshot) → AppContext setState
→ React re-render → UI updated
```

Este flujo ocurre en todos los dispositivos conectados al mismo grupo simultáneamente.

---

## Stack Tecnológico

### Frontend

| Tecnología | Uso |
|---|---|
| React 18 | Framework de UI |
| Vite | Build tool y dev server (HMR instantáneo) |
| Tailwind CSS | Estilos utility-first, purga automática |
| Framer Motion | Animaciones declarativas |
| Recharts | Gráficos (PieChart, BarChart, LineChart) |
| Lucide React | Iconos SVG tree-shakeable |
| date-fns (locale es) | Formateo y manipulación de fechas |

### Backend / Base de datos

| Servicio | Rol |
|---|---|
| Firebase Authentication | Gestión de identidades, tokens JWT |
| Cloud Firestore | Base de datos NoSQL realtime |
| Firebase Security Rules | Autorización server-side |

### Librerías de exportación

| Librería | Uso |
|---|---|
| jsPDF + jspdf-autotable | Exportación PDF en el navegador |
| xlsx | Exportación Excel (.xlsx) |
| pdfkit | Generación de PDFs de documentación (scripts Node) |

---

## Estructura del Proyecto

```
src/
  App.jsx                      — Raíz: routing + decisión auth/sala
  main.jsx                     — Punto de entrada, monta AppProvider
  config/
    firebase.js                — Singleton Firebase (auth + db)
  context/
    AppContext.jsx              — Estado global + listeners Firestore
  hooks/
    useAuth.js                 — signUp, login, createGroup, joinGroup, leaveGroup, removeMember
    useTransactions.js         — CRUD transacciones
    useChat.js                 — CRUD mensajes + sendSystemMessage
    useSettlement.js           — Cálculo de liquidaciones + confirmPayment
    useUsers.js                — Carga de perfiles de usuario
  components/
    Auth/
      AuthGate.jsx             — Orquesta pasos: auth → perfil
      SignIn.jsx               — Formulario login
      SignUp.jsx               — Formulario registro
      ProfileSetup.jsx         — Nombre + avatar
      GroupSetup.jsx           — Crear/unirse (usado desde RoomSelector)
      RoomSelector.jsx         — Selector de sala activa (v2)
    Common/
      Navbar.jsx               — Sidebar desktop + bottom nav móvil
    Dashboard/
      Dashboard.jsx            — Pantalla principal
      AvatarScene.jsx          — Avatares animados de todos los miembros
      BalanceCard.jsx          — Pagos óptimos + confirmaciones
      BalanceExplainer.jsx     — Panel "¿Por qué tengo este saldo?" (v2.1)
    Transactions/
      TransactionList.jsx      — Lista con filtros + badge de modo de pago
      TransactionForm.jsx      — Formulario 3 modos: Gasto/Ingreso/Común
    Settlement/
      SettlementPage.jsx       — Liquidación con algoritmo greedy
    Statistics/
      StatisticsPage.jsx       — Gráficos con toggle personal/grupo
    Chat/
      ChatWindow.jsx           — Chat realtime
    Settings/
      SettingsPage.jsx         — Perfil, sala, categorías, admin tools
  assets/
    avatars/index.jsx          — 18 avatares SVG con animaciones nativas
  utils/
    calculateSettlement.js     — Motor de cálculo de balances y settlement
    formatters.js              — formatCurrency, amountColor, formatDate
    exporters.js               — exportToExcel, exportToPDF, exportToCSV
firestore.rules                — Reglas de seguridad (publicar en Firebase Console)
docs/
  MANUAL_DE_USUARIO.md/.pdf
  DOCUMENTO_TECNICO.md/.pdf
  gen-manual.mjs               — Generador PDF del manual
  gen-tecnico.mjs              — Generador PDF del documento técnico
```

---

## Modelo de Datos Firestore

### `/users/{uid}`

```javascript
{
  email:     string,
  name:      string,
  avatar:    string,          // 'avatar0' … 'avatar17'
  color:     string,          // hex del color de acento
  groupIds:  string[],        // array de IDs de salas (v2; legacy: groupId string)
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

**Compatibilidad backward:** usuarios anteriores a v2 tienen `groupId: string` en lugar de `groupIds: string[]`. AppContext normaliza al leer: `groupIds = profile.groupIds?.length ? profile.groupIds : profile.groupId ? [profile.groupId] : []`.

### `/groups/{groupId}`

```javascript
{
  name:      string,
  code:      string,          // 6 chars mayúsculas, único
  memberIds: string[],        // UIDs de miembros activos
  createdBy: string,          // UID del admin actual
  createdAt: Timestamp,
  updatedAt: Timestamp,
  settings:  { timezone: string, currency: string },
  categories: [{ id, label, icon, suggestedAmount }],
}
```

### `/groups/{groupId}/transactions/{txId}`

```javascript
{
  type:         'expense' | 'income',
  paymentMode:  'individual' | 'common',
  amount:       number,
  category:     string,           // id de categoría
  categoryLabel: string,          // snapshot del nombre (no se pierde al renombrar)
  description:  string,
  paidBy:       string | 'common',
  splitAmong:   string[],         // UIDs de participantes
  date:         Timestamp,
  createdAt:    Timestamp,
  updatedAt:    Timestamp,
  createdBy:    string,
  isSettlement?: boolean,         // true en transacciones de liquidación
}
```

### `/groups/{groupId}/messages/{msgId}`

```javascript
{
  type:        'message' | 'system' | 'payment_reminder',
  text:        string,
  sender:      string,
  senderName:  string,
  senderAvatar: string,
  readBy:      string[],
  createdAt:   Timestamp,
  // Solo en payment_reminder:
  fromUserId?: string,
  toUserId?:   string,
  amount?:     number,
}
```

### `/groups/{groupId}/payments/{payId}`

```javascript
{
  from:         string,        // UID deudor
  to:           string,        // UID acreedor
  amount:       number,
  status:       'pending' | 'confirmed',
  createdAt:    Timestamp,
  confirmedAt?: Timestamp,
  confirmedBy?: string,
}
```

---

## AppContext — Estado Global

**Ubicación:** `src/context/AppContext.jsx`

### Estado expuesto

| Variable | Tipo | Descripción |
|---|---|---|
| `firebaseUser` | object\|null\|undefined | `undefined` = cargando |
| `userProfile` | object\|null | Documento `/users/{uid}` + `id` |
| `groupId` | string\|null | Sala activa |
| `userGroupIds` | string[] | Todos los IDs de salas del usuario |
| `userRooms` | array | `{id, name, code, memberCount, createdBy}` |
| `groupInfo` | object\|null | `{name, code, createdBy, memberIds}` |
| `groupMembers` | array | Perfiles completos de los miembros |
| `transactions` | array | Transacciones realtime |
| `messages` | array | Mensajes realtime (desc) |
| `payments` | array | Pagos pendientes realtime |
| `categories` | array | Categorías del grupo |
| `isAdmin` | boolean | `userProfile.id === groupInfo.createdBy` |
| `loading` | boolean | Carga inicial Auth |
| `darkMode` | boolean | Tema oscuro/claro |

### Funciones expuestas

| Función | Descripción |
|---|---|
| `switchActiveGroup(id)` | Cambia sala activa, limpia listeners, persiste en localStorage |
| `clearActiveGroup()` | Vuelve al RoomSelector |
| `onProfileCreated(profile, groupId)` | Callback tras crear/unirse desde useAuth |
| `updateUserProfile(data)` | Actualiza `/users/{uid}` y estado local |
| `updateGroupCategories(cats)` | Guarda categorías editadas |
| `updateGroupName(name)` | Renombra el grupo (solo admin) |
| `logout()` | Cierra sesión, limpia listeners y estado |
| `toggleDarkMode()` | Alterna tema |

### Persistencia de sala activa

```javascript
// Al seleccionar sala:
localStorage.setItem(`activeGroup_${uid}`, groupId)

// Al cargar (AppContext onAuthStateChanged):
const stored = localStorage.getItem(`activeGroup_${uid}`)
```

### Listeners Firestore activos

```javascript
// Por grupo activo:
onSnapshot(doc(db, 'groups', groupId), ...)                    // info del grupo + miembros
onSnapshot(query(transactions, orderBy('date', 'desc')), ...)  // transacciones
onSnapshot(query(messages, orderBy('createdAt', 'desc')), ...) // mensajes
onSnapshot(query(payments, where('status','==','pending')), ...)// pagos
```

Todos los listeners se limpian al cambiar de sala (`switchActiveGroup`) o al hacer logout.

---

## Hooks Personalizados

### `useAuth.js`

```javascript
{
  signUp(email, password)              → Promise<void>
  login(email, password)               → Promise<void>
  createGroup(name)                    → Promise<groupId>
  joinGroup(code)                      → Promise<void>
  leaveGroup()                         → Promise<void>   // transfiere admin si hay miembros
  removeMember(uid)                    → Promise<void>   // solo admin
  logout()                             → Promise<void>
}
```

**`leaveGroup` — lógica de transferencia de admin:**
```javascript
if (isAdmin && remaining.length > 0) {
  await updateDoc(groupRef, { createdBy: remaining[0] })
}
await updateDoc(groupRef, { memberIds: arrayRemove(uid) })
await updateDoc(userRef,  { groupIds: arrayRemove(groupId) })
```

### `useTransactions.js`

```javascript
{
  createTransaction(payload)           → Promise<void>
  updateTransaction(id, payload)       → Promise<void>
  deleteTransaction(id)                → Promise<void>
  submitting: boolean,
  error: string|null,
}
```

El payload incluye `type`, `paymentMode`, `amount`, `category`, `categoryLabel`, `description`, `paidBy`, `splitAmong`, `date`.

### `useChat.js`

```javascript
{
  sendMessage(text)                    → Promise<void>
  sendSystemMessage(text)              → Promise<void>
}
```

`sendSystemMessage` se llama desde `TransactionForm` al crear transacciones para notificar al chat.

### `useSettlement.js`

```javascript
{
  summary: {
    totalIngresos, totalGastos,
    totalGastosComunes, totalGastosIndividuales,
    saldoColectivo, balances, pagosOptimos
  },
  confirmPayment(de, a, monto)         → Promise<void>
}
```

`confirmPayment` crea una transacción `{type:'income', isSettlement:true}` y un pago confirmado en `/payments`.

---

## Componentes Principales

### `App.jsx`

Decide qué renderizar según el estado de auth:

```javascript
loading || firebaseUser === undefined  →  <Spinner/>
!firebaseUser || !userProfile?.name    →  <AuthGate/>
!groupId                               →  <RoomSelector/>
groupId OK                             →  <BrowserRouter> + rutas
```

### `RoomSelector.jsx`

Pantalla de selección de sala activa. Muestra:
- Lista de salas del usuario con nombre, código y número de miembros
- Icono de corona (👑) en salas donde el usuario es admin
- Botón "Crear sala" → `useAuth.createGroup`
- Botón "Unirse" → `useAuth.joinGroup` con campo de código

### `TransactionForm.jsx`

Formulario con 3 modos. Modo determina:
- Qué campos se muestran (Pagado por solo en individual/ingreso)
- Valor de `paidBy` (`uid` o `'common'`)
- Valor de `paymentMode` (`'individual'` o `'common'`)
- Valor de `type` (`'expense'` o `'income'`)

### `TransactionList.jsx`

Lista filtrable con badge de modo de pago. Para cada transacción:
- Si `tx.paidBy === 'common'` → pastilla azul "Fondo común"
- Si no → nombre del miembro que pagó

### `BalanceExplainer.jsx`

Panel desplegable "¿Por qué tengo este saldo?" que llama a `calculateBalanceBreakdown`. Para cada miembro muestra:
- `contributed` — ingresos aportados al fondo
- `commonShare` — parte de gastos comunes
- `advanced - selfPaidShare` — lo que adelantó por otros
- `owedShare` — lo que debe a otros
- Saldo total = `collectivePosition + peerPosition`

Los gastos `isSettlement=true` se excluyen del cálculo.

### `StatisticsPage.jsx`

Toggle "Mis datos / Del grupo":
- **Mis datos:** filtra `(tx.splitAmong || []).includes(uid)` para gastos, `tx.paidBy === uid` para ingresos
- **Del grupo:** todas las transacciones

El gráfico de barras por persona solo aparece en vista de grupo.

### `SettingsPage.jsx`

Secciones:
1. Perfil (nombre + avatar)
2. Código de invitación (copiar + badge admin)
3. Nombre del grupo (editable por admin)
4. Gestión de miembros (expulsar — solo admin)
5. Categorías (crear/editar/eliminar — solo admin)
6. Abandonar sala (con warning de transferencia de admin)
7. Cambiar de sala → `clearActiveGroup()`
8. Cerrar sesión

---

## Algoritmos Clave

### `calculateBalances(transactions, users)`

```javascript
// Para cada transacción:
if (tipo === 'income') {
  balances[paidBy] += amount
} else if (paidBy === 'common') {
  // Gasto común: solo debitar participantes, nadie recibe crédito
  participantes.forEach(uid => balances[uid] -= partePorPersona)
} else {
  // Gasto individual: pagador recibe crédito, participantes se debitan
  balances[paidBy] += amount
  participantes.forEach(uid => balances[uid] -= partePorPersona)
}
```

**Invariante:** `Σ balances[uid] = totalIngresos − totalGastosComunes`  
Los gastos individuales son zero-sum (crédito del pagador = Σ deudas de participantes).

### `calculateOptimalPayments(balances)`

Algoritmo greedy O(n log n):

```javascript
1. Separar creditors (saldo > ε) y debtors (saldo < -ε)
2. Ordenar ambos de mayor a menor
3. Mientras haya creditors y debtors:
   amount = min(creditor.amount, debtor.amount)
   payments.push({ de: debtor, a: creditor, monto: amount })
   creditor.amount -= amount
   debtor.amount   -= amount
   if creditor.amount < ε: i++
   if debtor.amount   < ε: j++
```

Garantía: número mínimo de transferencias posible.

### `calculateBalanceBreakdown(transactions, users)`

Descompone el saldo de cada usuario en componentes explicativos:

```javascript
// Por usuario:
{
  contributed:    Σ ingresos del usuario,
  commonShare:    Σ su parte en gastos comunes,
  advanced:       Σ gastos individuales que pagó (incluye su propia parte),
  selfPaidShare:  su parte propia dentro de advanced,
  owedShare:      Σ su parte en gastos pagados por otros,

  collectivePosition: contributed - commonShare,
  peerPosition:       (advanced - selfPaidShare) - owedShare,
  balance:            collectivePosition + peerPosition,
}
```

**Invariante:** `Σ balance[uid] === poolBalance === totalIngresos − totalGastosComunes`

Los gastos `isSettlement=true` se excluyen para no contaminar el desglose.

### `calculateGroupSummary(transactions, users)`

```javascript
{
  totalIngresos,
  totalGastos,
  totalGastosComunes,
  totalGastosIndividuales,
  saldoColectivo: totalIngresos - totalGastosComunes,  // NO resta gastos individuales
  balances,
  pagosOptimos,
}
```

---

## Reglas de Seguridad Firestore

**Ubicación:** `firestore.rules` (copiar en Firebase Console → Firestore → Reglas)

Permisos clave:

| Operación | Quién puede |
|---|---|
| Leer `/users/{uid}` | Cualquier usuario autenticado |
| Escribir `/users/{uid}` | Solo el propio usuario |
| Leer `/groups/{groupId}` | Cualquier usuario autenticado (necesario para buscar por código) |
| Crear grupo | Usuario autenticado que se incluye en `memberIds` |
| Actualizar grupo | Miembros existentes, O usuario que solo añade su propio UID a `memberIds` |
| Eliminar grupo | Solo el creador (`createdBy`) |
| Leer/escribir subcollecciones | Solo miembros del grupo (verificado con `get()`) |

La regla de actualización permite a no-miembros unirse (acción de `joinGroup`) siempre que el diff solo afecte a `['memberIds', 'updatedAt']` y el usuario se añada a sí mismo.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /groups/{groupId} {

      function isMember() {
        return request.auth != null
            && request.auth.uid in resource.data.memberIds;
      }

      allow read: if request.auth != null;

      allow create: if request.auth != null
                   && request.auth.uid in request.resource.data.memberIds;

      allow update: if isMember()
                   || (
                     request.auth != null
                     && request.auth.uid in request.resource.data.memberIds
                     && request.resource.data.diff(resource.data)
                                            .affectedKeys()
                                            .hasOnly(['memberIds', 'updatedAt'])
                   );

      allow delete: if request.auth != null
                   && request.auth.uid == resource.data.createdBy;

      match /transactions/{txId} {
        allow read, write: if request.auth != null
          && request.auth.uid in
             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
      }

      match /messages/{msgId} {
        allow read, write: if request.auth != null
          && request.auth.uid in
             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
      }

      match /payments/{payId} {
        allow read, write: if request.auth != null
          && request.auth.uid in
             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
      }
    }
  }
}
```

---

## Flujos de Autenticación y Navegación

### Registro completo

```
1. SignUp → Firebase Auth createUserWithEmailAndPassword
2. onAuthStateChanged → firebaseUser set
3. AuthGate: !userProfile → ProfileSetup (nombre + avatar)
4. createDoc /users/{uid}
5. App: !groupId → RoomSelector
6. createGroup o joinGroup
7. switchActiveGroup(id)
8. App: groupId OK → Aplicación principal
```

### Login

```
1. SignIn → Firebase Auth signInWithEmailAndPassword
2. onAuthStateChanged → firebaseUser set → getDoc /users/{uid}
3. localStorage.getItem('activeGroup_${uid}') → restore sala
4. subscribeToGroup(groupId) → listeners activos
5. App: todos los datos OK → Aplicación principal
```

### Logout

```
1. cancelListeners() — limpia todos los unsubscribe refs
2. Resetear estado (userProfile, groupId, groupMembers, transactions…)
3. Firebase Auth signOut
4. localStorage.removeItem('activeGroup_${uid}')
5. App: !firebaseUser → AuthGate
```

---

## Optimizaciones y Performance

### Code splitting

```javascript
// App.jsx — lazy load de rutas pesadas
const Settlement  = lazy(() => import('./components/Settlement/SettlementPage'))
const Statistics  = lazy(() => import('./components/Statistics/StatisticsPage'))
const Chat        = lazy(() => import('./components/Chat/ChatWindow'))
```

### Memoización

Todos los cálculos derivados de `transactions` usan `useMemo`:

```javascript
const byCategory = useMemo(() => {
  // filtra + agrupa + ordena
}, [filteredTx])
```

### Limpieza de listeners

Cada listener se almacena en un `useRef` y se cancela al cambiar de sala o hacer logout:

```javascript
const unsubTxRef = useRef(null)
unsubTxRef.current = onSnapshot(...)
// Al limpiar:
unsubTxRef.current?.()
```

### Avatares SVG

Las animaciones de los avatares son animaciones SVG nativas (`<animate>`, `<animateTransform>`) que el navegador ejecuta en un hilo separado, sin impacto en el rendimiento de JS.

---

## Deployment

### Vercel

1. Conectar repositorio GitHub en [vercel.com](https://vercel.com)
2. Settings → Environment Variables → añadir las 6 `VITE_FIREBASE_*`
3. Deploy → Vercel construye y despliega automáticamente en cada push a `main`
4. Las variables se inyectan en **build time** → requieren Redeploy tras cualquier cambio

### Firebase Console (pasos manuales tras crear proyecto)

1. **Authentication → Authorized domains:** añadir el dominio de Vercel
2. **Firestore → Rules:** publicar el contenido de `firestore.rules`
3. **Firestore → Indexes:** crear índice compuesto en `payments`:
   - `status` (Ascending) + `createdAt` (Descending), scope: Collection

### Variables de entorno

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Guía de Desarrollo

### Setup local

```bash
git clone https://github.com/UnaiSuarez/cuentas-compartidas.git
cd cuentas-compartidas
npm install
cp .env.example .env.local
# Editar .env.local con las claves de Firebase
npm run dev
```

### Convenciones de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: reorganización sin cambio funcional
docs:     documentación
chore:    dependencias, build
```

### Convenciones de código

- Componentes: PascalCase, un fichero por componente
- Hooks: camelCase con prefijo `use`
- Utils: funciones puras, sin efectos secundarios, exportadas con nombre
- Contexto: acceso siempre a través de `useApp()`, nunca `useContext(AppContext)` directo
- No hay tests automatizados actualmente; `calculateSettlement.js` es la candidata natural para unit tests por ser una función pura

### Regenerar PDFs de documentación

```bash
cd docs
node gen-manual.mjs   # genera MANUAL_DE_USUARIO.pdf
node gen-tecnico.mjs  # genera DOCUMENTO_TECNICO.pdf
```

---

## Historial de Versiones

### v2.1 (actual)
- `BalanceExplainer.jsx`: panel "¿Por qué tengo este saldo?" en Dashboard
- Badge "Fondo común" en `TransactionList.jsx` para transacciones con `paidBy='common'`
- `calculateBalanceBreakdown`: descompone balance en `collectivePosition + peerPosition`
- Corrección `saldoColectivo = totalIngresos − totalGastosComunes` (gastos individuales son zero-sum)

### v2.0
- Múltiples salas por usuario + `RoomSelector`
- Rol admin con transferencia automática al abandonar
- `leaveGroup` y `removeMember` en `useAuth`
- Modo "Gasto Común" (`paymentMode: 'common'`, `paidBy: 'common'`)
- 6 nuevos avatares con animaciones SVG nativas (total 18)
- Estadísticas con toggle personal/grupo
- Categorías editables por sala
- Refactor completo de `AppContext` (múltiples salas, `switchActiveGroup`, `clearActiveGroup`)

### v1.0
- Una sala por usuario
- Avatares 0-11 sin animaciones
- Estadísticas solo de grupo
- Categorías fijas

---

**Documento generado:** Abril 2026 — v2.1
