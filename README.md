# Cuentas Compartidas

Aplicación web de gestión de gastos e ingresos compartidos para grupos pequeños (familia, piso, amigos). Cada grupo tiene su propio fondo colectivo, chat en tiempo real y cálculo automático de quién debe a quién.

**Stack:** React 18 + Vite + Tailwind CSS + Firebase (Auth + Firestore) + Vercel  
**Versión:** 2.1

---

## Características

- **Múltiples salas** — un usuario puede crear o unirse a varias salas; selector de sala activa
- **Rol de administrador** — el creador puede expulsar miembros, renombrar la sala y editar categorías; se transfiere automáticamente al abandonar
- **Transacciones con 3 modos** — Gasto individual (alguien adelanta el dinero), Ingreso y Gasto Común (sale del fondo colectivo, nadie adelanta)
- **Saldos en tiempo real** — Firebase onSnapshot sincroniza al instante en todos los dispositivos
- **Pagos óptimos** — algoritmo greedy O(n log n) estilo Tricount que minimiza el número de transferencias
- **Desglose de saldo** — panel "¿Por qué tengo este saldo?" que explica la posición colectiva + deudas individuales de cada miembro
- **Categorías editables** — cada sala puede personalizar sus categorías con icono y monto sugerido
- **Chat interno** — historial completo sin límite, mensajes de sistema automáticos al confirmar pagos
- **Estadísticas con toggle** — gráficos de mis datos vs. del grupo (pie, barras, línea temporal)
- **Exportación** — Excel (.xlsx), PDF y CSV desde la lista de transacciones
- **18 avatares SVG** con animaciones nativas y 3 estados (normal, feliz, triste) según saldo
- **Dark/Light mode** persistido en localStorage
- **Responsive** — barra lateral en escritorio, barra inferior en móvil

---

## Instalación local

### 1. Clonar e instalar

```bash
git clone https://github.com/UnaiSuarez/cuentas-compartidas.git
cd cuentas-compartidas
npm install
```

### 2. Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → Crear proyecto
2. Activa **Authentication** → Proveedor Email/Contraseña
3. Activa **Firestore Database** (modo producción)
4. Ve a Configuración del proyecto → Tus apps → Web → Registra app
5. Copia los valores de configuración

### 3. Crear `.env.local`

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores de Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> Las variables deben empezar por `VITE_` para que Vite las inyecte en el bundle. Si algún valor está incompleto o en blanco, la app lanza `auth/api-key-not-valid`.

### 4. Reglas de Firestore

En Firebase Console → Firestore → Reglas, pega el contenido del archivo `firestore.rules` del repositorio (o copia esto):

```
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

      // Cualquier usuario autenticado puede leer grupos (necesario para buscar
      // por código al unirse).
      allow read: if request.auth != null;

      // Solo usuarios autenticados pueden crear un grupo, y deben incluirse
      // a sí mismos como primer miembro.
      allow create: if request.auth != null
                   && request.auth.uid in request.resource.data.memberIds;

      // Miembros pueden actualizar el grupo (configuración, categorías, etc.)
      // También se permite la operación de unirse: añadir el propio uid a
      // memberIds sin modificar ningún otro campo sensible.
      allow update: if isMember()
                   || (
                     request.auth != null
                     && request.auth.uid in request.resource.data.memberIds
                     && request.resource.data.diff(resource.data)
                                            .affectedKeys()
                                            .hasOnly(['memberIds', 'updatedAt'])
                   );

      // Solo el creador puede eliminar el grupo.
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

### 5. Índice compuesto en Firestore (obligatorio)

En Firebase Console → Firestore → Índices → Añadir índice:

| Colección | Campo 1 | Campo 2 | Scope |
|-----------|---------|---------|-------|
| `payments` | `status` ASC | `createdAt` DESC | Collection |

> Sin este índice, la consulta de pagos pendientes lanza un error en la consola con un enlace directo para crearlo con un clic.

### 6. Dominio autorizado en Firebase Auth

En Firebase Console → Authentication → Settings → Authorized domains, añade el dominio donde está desplegada la app (Vercel, localhost ya está incluido por defecto).

### 7. Arrancar en desarrollo

```bash
npm run dev
# http://localhost:5173
```

---

## Deploy en Vercel

1. Sube el repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project → importa el repositorio
3. En **Settings → Environment Variables** añade las 6 variables `VITE_FIREBASE_*` con sus valores reales
4. Haz **Deploy** (o Redeploy si ya existe)
5. Añade el dominio de Vercel en Firebase Auth → Authorized domains

> Las variables de entorno de Vercel se inyectan en tiempo de build. Después de añadirlas o modificarlas, siempre hay que hacer **Redeploy** para que surtan efecto.

---

## Solución de errores comunes

### `auth/api-key-not-valid` o página en blanco al cargar

**Causa:** alguna variable `VITE_FIREBASE_*` está vacía, truncada o mal copiada.

**Solución:**
1. Abre `.env.local` y verifica que las 6 variables tienen valores completos (no `AIzaSy...` sino el valor real)
2. En Vercel: Settings → Environment Variables → comprueba que están todas. Después haz **Redeploy**
3. Asegúrate de que las variables empiezan por `VITE_` (sin ese prefijo Vite no las incluye en el bundle)

---

### `Missing or insufficient permissions` al crear o unirse a una sala

**Causa:** las reglas de Firestore en la consola son antiguas y no permiten que un usuario no-miembro lea grupos por código, o no puede añadirse a sí mismo a `memberIds`.

**Solución:** copia las reglas del punto 4 de este README en Firebase Console → Firestore → Reglas y publica.

Las reglas correctas permiten:
- Cualquier usuario autenticado puede **leer** grupos (necesario para buscar por código al unirse)
- Un usuario puede **añadirse** a sí mismo a `memberIds` si solo modifica ese campo y `updatedAt`
- Solo miembros pueden leer/escribir en las subcollecciones (transactions, messages, payments)

---

### Error de índice en la consola de navegador (payments)

**Causa:** Firestore necesita un índice compuesto para la consulta `where status == 'pending' orderBy createdAt`.

**Solución:** el error en la consola incluye un enlace directo a Firebase Console que crea el índice con un clic. Alternativamente, créalo manualmente (ver punto 5 de este README).

---

### Página carga pero no aparecen datos / todo en blanco

**Causa frecuente:** bloqueador de anuncios (uBlock Origin, AdBlock) intercepta las peticiones a `firestore.googleapis.com`.

**Solución:** desactiva el bloqueador para el dominio de la app, o añade una excepción para `*.googleapis.com` y `*.firebaseio.com`.

---

### Los cambios de variables de entorno en Vercel no tienen efecto

**Causa:** Vite inyecta las variables en tiempo de compilación, no en tiempo de ejecución.

**Solución:** después de modificar cualquier variable en Vercel → Settings → Environment Variables, ve a Deployments y haz **Redeploy** (sin cache) del último despliegue.

---

### `auth/unauthorized-domain`

**Causa:** el dominio desde el que se accede no está en la lista de dominios autorizados de Firebase Auth.

**Solución:** Firebase Console → Authentication → Settings → Authorized domains → añadir el dominio (por ejemplo `mi-app.vercel.app`).

---

## Estructura del proyecto

```
src/
├── assets/avatars/         # 18 avatares SVG con animaciones nativas y 3 estados
├── components/
│   ├── Auth/               # AuthGate, SignIn, SignUp, ProfileSetup, GroupSetup, RoomSelector
│   ├── Chat/               # ChatWindow — mensajería en tiempo real
│   ├── Common/             # Navbar (sidebar desktop + barra inferior móvil)
│   ├── Dashboard/          # Dashboard, AvatarScene, BalanceCard, BalanceExplainer
│   ├── Settings/           # Ajustes: perfil, sala, categorías, admin tools
│   ├── Settlement/         # Liquidación de deudas (Tricount-style)
│   ├── Statistics/         # Gráficos con Recharts — toggle personal/grupo
│   └── Transactions/       # TransactionList + TransactionForm (3 modos)
├── config/
│   └── firebase.js         # Inicialización Firebase (singleton)
├── context/
│   └── AppContext.jsx       # Estado global + listeners Firestore realtime
├── hooks/
│   ├── useAuth.js           # Auth + grupos (create, join, leave, removeMember)
│   ├── useChat.js           # CRUD mensajes
│   ├── useSettlement.js     # Cálculo y confirmación de liquidaciones
│   ├── useTransactions.js   # CRUD transacciones
│   └── useUsers.js          # Carga de perfiles
└── utils/
    ├── calculateSettlement.js  # Algoritmo greedy + calculateBalanceBreakdown
    ├── exporters.js            # Excel / PDF / CSV
    └── formatters.js           # Moneda EUR, fechas España
```

---

## Cómo funciona el cálculo de deudas

El algoritmo es greedy O(n log n), equivalente al de Tricount/Splitwise:

1. Calcula el **saldo neto** de cada persona = lo que aportó − lo que le corresponde pagar
2. Separa **acreedores** (saldo > 0) y **deudores** (saldo < 0), los ordena de mayor a menor
3. En cada iteración: el mayor deudor paga al mayor acreedor el mínimo de ambas cantidades
4. Minimiza el número total de transferencias

### Modos de pago

| Modo | `paidBy` | Efecto en balances |
|------|----------|-------------------|
| Individual | UID del pagador | El pagador recibe crédito; los participantes se debitan su parte |
| Ingreso | UID del aportante | Solo el aportante recibe crédito |
| Común | `'common'` | Nadie recibe crédito; el fondo colectivo se debita; participantes se debitan su parte |

### Saldo colectivo

`saldoColectivo = totalIngresos − totalGastosComunes`

Los gastos individuales son zero-sum (el crédito del pagador cancela exactamente las deudas de los participantes), así que no afectan al fondo colectivo. La suma de todos los saldos personales siempre es igual al saldo colectivo.

---

## Seguridad

- Contraseñas gestionadas por Firebase Auth (almacenamiento seguro, nunca en texto plano)
- Reglas de Firestore: solo miembros del grupo acceden a sus datos; cada usuario solo escribe su propio documento
- Variables de entorno nunca en el repositorio (`.gitignore` incluye `.env*`)
- Las Firebase API keys que van al cliente son públicas por diseño (su seguridad depende de las reglas de Firestore, no de mantenerlas secretas)

---

## Licencia

MIT


This session is being continued from a previous conversation that ran out of context. The summary below covers the
     earlier portion of the conversation.

     Summary:
     1. Primary Request and Intent:

     The session had two phases:

     **Phase 1 — Documentation review and commit:**
     - User asked to review project files (especially CLAUDE.md) for context
     - User then asked to review the manual and technical document for completeness before committing unstaged changes
     - The user then added a new requirement: the Firestore security rules had changed — the `isAdmin()` function was
     removed and `allow delete` was inlined as `request.auth.uid == resource.data.createdBy`. User provided the new
     complete rules.
     - Fix all errors, update all documentation files, regenerate PDFs, commit and push.

     **Phase 2 — Code changes (in progress at time of summary):**
     1. **Balance display**: When someone (Alex) owes money to another (Unai), Unai's displayed balance should NOT
     pre-count that owed amount. Show settled vs pending separately. Example: Unai=+30, Alex=-5, pending 5€ Alex→Unai →
     show Unai=+25 (available) + 5€ pending, not +30 as a single number.
     2. **Duplicate payments bug**: Clicking "He pagado" multiple times creates duplicate payment records. Should
     prevent this.
     3. **First-time tutorial**: Create a walkthrough/onboarding for users accessing the app for the first time.
     4. **Statistics "Mis datos"**: In personal view, use the user's proportional share of expenses (not full amounts).
     If there are common expenses, calculate just the user's portion.

     ---

     2. Key Technical Concepts:
     - React 18 + Vite + Tailwind CSS + Firebase (Auth + Firestore) SPA
     - Cuentas Compartidas v2.1 — shared expense management for flatmates/groups
     - Multi-room support (users can belong to N groups), admin role, common expense mode
     - **calculateBalances**: greedy algorithm, handles `paidBy='common'` (no credit to payer), individual (payer gets
     credit, participants debited), income
     - **calculateOptimalPayments**: greedy O(n log n) — minimum transfers to settle all debts
     - **calculateBalanceBreakdown**: decomposes balance into collectivePosition + peerPosition
     - **Invariant**: `Σ balances[uid] = saldoColectivo = totalIngresos - totalGastosComunes`
     - Firestore listeners (onSnapshot) for realtime sync across devices
     - AppContext: central state with all Firestore listeners; `payments` array = pending Firestore documents
     - `summary.pagosOptimos` = in-memory calculated optimal payments (not Firestore)
     - Individual expenses are zero-sum (don't affect saldoColectivo); common expenses reduce it
     - PDFKit (Node.js) for generating documentation PDFs via `gen-manual.mjs` and `gen-tecnico.mjs`
     - Conventional Commits, Vercel deploy with VITE_FIREBASE_* env vars
     - Firestore security rules: `isMember()` function, `allow delete` checks `request.auth.uid ==
     resource.data.createdBy` (no longer uses `isAdmin()` function)

     ---

     3. Files and Code Sections:

     **`firestore.rules`** — Updated to remove `isAdmin()` function and inline the delete rule:
     ```javascript
     // Removed:
     function isAdmin() {
       return request.auth != null
           && resource.data.createdBy == request.auth.uid;
     }
     allow delete: if isAdmin();

     // Now:
     allow delete: if request.auth != null
                  && request.auth.uid == resource.data.createdBy;
     ```
     Also updated comments to match the new rules structure provided by user.

     **`README.md`** — Same security rules change: removed `isAdmin()` function, updated `allow delete`, added
     explanatory comments matching user's provided rules.

     **`docs/DOCUMENTO_TECNICO.md`** — Added full Firestore rules code block under the security section; updated the
     "Eliminar grupo" table row to say "Solo el creador (createdBy)".

     **`docs/gen-manual.mjs`** (PDF generator for user manual):
     - FAQ fix: "¿Puedo estar en varios grupos a la vez?" changed from "No" to "Sí. Desde la versión 2.0, cada usuario
     puede pertenecer a varias salas..."
     - Section 5.1 "Tipo" bullet changed to describe all 3 modes: Gasto individual, Gasto Común (nadie acumula crédito
     individual), Ingreso
     - Added note about "Fondo común" badge in transaction list
     - Version corrected from '1.0' to '2.1' (was already in unstaged changes)

     **`docs/gen-tecnico.mjs`** (PDF generator for technical document):
     - users collection schema: `groupId: string|null` → `groupIds: [string]`, avatar `"avatar0"..."avatar17"`, added
     `color` field
     - messages subcollection: updated to `type: "message"|"system"|"payment_reminder"`, `sender`, `senderName`,
     `senderAvatar`, `readBy`, `fromUserId?`, `toUserId?`, `amount?`
     - payments subcollection: updated to `from`, `to`, `amount`, `status`, `confirmedAt?`, `confirmedBy?`
     - calculateBalances code block: added `paidBy === "common"` branch (only debit participants, no credit to payer)
     - Security rules code block: updated to full new rules with `isMember()`, individual subcollections, inlined delete
     - Component diagram: added `RoomSelector.jsx` and `BalanceExplainer.jsx`
     - Directory tree: "15+ SVGs" → "18 avatares SVG con animaciones"
     - Dashboard.jsx description: added mention of BalanceExplainer component
     - Technology field: 'React 19 + Firebase + Tailwind CSS v4' → 'React 18 + Firebase + Tailwind CSS'

     **PDFs regenerated** by running `node gen-manual.mjs && node gen-tecnico.mjs` from the docs directory.

     **Commit:** "docs: corregir documentación y reglas Firestore para v2.1" — pushed to origin/main.

     ---

     **Code changes (Phase 2 — in progress):**

     **`src/hooks/useSettlement.js`** — Added duplicate prevention in `requestPayment`:
     ```javascript
     async function requestPayment(toUserId, amount) {
       if (!groupId || !userProfile) return

       // Evitar duplicados: si ya existe un pending de mí a esa persona por ese importe, no crear otro
       const alreadyDeclared = payments.some(
         p => p.from === userProfile.id && p.to === toUserId && Math.abs(p.amount - amount) < 0.01
       )
       if (alreadyDeclared) return

       setConfirming(true)
       try {
         await addDoc(collection(db, 'groups', groupId, 'payments'), {
           from: userProfile.id, to: toUserId, amount, status: 'pending', createdAt: serverTimestamp(),
         })
         await sendPaymentReminder(userProfile.id, toUserId, amount, groupMembers)
       } finally {
         setConfirming(false)
       }
     }
     ```
     Note: `payments` is already destructured from `useApp()` at the top of the hook.

     **`src/components/Dashboard/BalanceCard.jsx`** — Completely rewritten:
     - Renamed destructured `payments` from useApp to `pendingPayments` to avoid conflict with useSettlement
     - Removed `payments` from useSettlement destructure (not needed there)
     - For each optimal payment where user is the debtor: check `alreadyDeclared` against `pendingPayments`
     - If declared: show `<span className="text-xs text-amber-400 ...">Declarado ✓</span>`
     - If not: show "He pagado" button (same as before)
     ```javascript
     const { userProfile, groupMembers, payments: pendingPayments } = useApp()
     const { summary, requestPayment, confirmPayment, confirming }  = useSettlement()

     // For each optimal payment p:
     const alreadyDeclared = isDebtor && pendingPayments.some(
       pay => pay.from === userProfile?.id &&
              pay.to === p.a &&
              Math.abs(pay.amount - p.monto) < 0.01
     )
     ```

     **`src/components/Settlement/SettlementPage.jsx`** — Two changes:
     1. Renamed `payments` → `pendingPayments` from useApp, removed from useSettlement:
     ```javascript
     const { userProfile, groupMembers, payments: pendingPayments } = useApp()
     const { summary, requestPayment, confirmPayment, confirming }  = useSettlement()
     ```
     2. Added `alreadyDeclared` check per optimal payment, showing "Declarado ✓" or "He pagado" button
     3. Changed `payments.length > 0` → `pendingPayments.length > 0` in the pending section

     ---

     4. Errors and Fixes:
     - **Edit tool: String not found**: When trying to replace `'│   └── assets/'` in gen-tecnico.mjs, the exact string
     wasn't found. Used Grep to find the actual line (line 450), which had `'│   │   └── avatars/'` — then used the
     correct string.
     - **Naming collision**: `payments` existed both in `useApp()` and was previously returned from `useSettlement()`.
     Fixed by renaming the AppContext destructured value to `pendingPayments` in both BalanceCard.jsx and
     SettlementPage.jsx, and removing `payments` from the useSettlement return destructure.

     ---

     5. Problem Solving:
     - **Documentation inconsistency**: Generator files (.mjs) were significantly out of date vs the markdown files
     (.md). Fixed by updating all schema definitions, security rules, component diagrams, and content in generators,
     then regenerating PDFs.
     - **Firestore rules change**: User provided new rules without `isAdmin()` function. Updated firestore.rules,
     README.md, DOCUMENTO_TECNICO.md, and gen-tecnico.mjs.
     - **Duplicate payment records**: Fixed by checking existing `payments` array in `requestPayment` before creating a
     new Firestore document.
     - **UI consistency for duplicate prevention**: Both BalanceCard and SettlementPage now show "Declarado ✓" badge
     when a payment has already been declared by the user.

     ---

     6. All User Messages:
     - "revisa los archivos de esa carpeta especialmente CLAUDE.md para contexto, una vez lo tengas me dices"
     - "los cambios que no esten subidos, subelos, aunque antes revisa que el manual y el documento tecnico estan bien y
      completos"
     - "arregla los errores, ademas, ten encuenta para la documentacion y para el readme que las normas de firebase
     cambiaron y son estas [provided new firestore.rules]"
     - "ahora vamos a tocar codigo, hay diferentes cosas que cambiar, la primera es como se gestionan los gastos, en el
     contexto de que un usuario esta en negativo y debe dinero a otro, no quiero que este otro se le sume ya ese dinero,
      es decir, hasta ahora si unai tenia 30, alex 20, unai paga una cena de 50 para los 2, quedaria en 30 denuevo y
     alex en -5, pero no deberia ser asi, deberia quedar unai en 25, alex en -5 y pendiente de alex a unai 5€, ya que
     esta en negativo, entonces, quiero que muestre el dinero total, pero si ocurre un caso como este, que sepa
     diferenciar entre dinero, ya que esos 5€ no estan en la cuenta, y es dinero que debe alex a unai, por otro lado, en
      la pestaña 'esperando confirmación' cada vez que lo doy al botón de he pagado se crea una nueva, aunque sea la
     misma, no quiero que sea asi, ademas, quiero que crees un tutorial, para las personas que acceden por primera vez,
     un pequeño recorrido explicando todo, tambien en estadisticas, en 'mis datos' quiero que solo sea con los gastos e
     ingresos del usuario, y si hay comunes, que se calcule su parte, creo que no me dejo nada, gracias"

     ---

     7. Pending Tasks:
     1. **Balance display in `Dashboard.jsx`**: Show `myBalance - myPendingReceivable` as the main personal balance
     number. `myPendingReceivable` = sum of `summary.pagosOptimos` where `a === userProfile.id`. Show "X€ disponible ·
     Y€ pendiente de cobro de [name]" breakdown below the main number.
     2. **`StatisticsPage.jsx` fix**: In "Mis datos" view, `byCategory` and `monthly` should use `tx.amount /
     splitAmong.length` (user's share) instead of `tx.amount`. The main "Mis gastos" card should show `myExpense` as the
      primary number (not `totalGastos`). The `filteredTx` filter can remain the same.
     3. **New `Tutorial.jsx` component**: Create a full-screen modal overlay with ~6 steps covering Dashboard,
     Transacciones, Liquidación, Estadísticas, Chat, Ajustes. Use localStorage key `tutorial_seen_${uid}` to show only
     once.
     4. **`App.jsx` integration**: Add `showTutorial` state and `<Tutorial>` render after user is fully authenticated
     and has a group. Handle `onDone` to set localStorage and hide.

     ---

     8. Current Work:
     The session was interrupted after modifying `SettlementPage.jsx`. The last three edits were:
     1. Renamed `payments` → `pendingPayments` and removed `payments` from useSettlement
     2. Added `alreadyDeclared` logic with "Declarado ✓" badge
     3. Replaced `payments.length > 0` with `pendingPayments.length > 0` in the pending payments section

     The duplicate payments bug fix is now complete across `useSettlement.js`, `BalanceCard.jsx`, and
     `SettlementPage.jsx`. The remaining work is the balance display change (Dashboard.jsx), statistics fix
     (StatisticsPage.jsx), and tutorial creation (new Tutorial.jsx + App.jsx integration).

     ---

     9. Optional Next Step:
     Continue with the balance display change in `Dashboard.jsx`. The user said:

     "deberia quedar unai en 25, alex en -5 y pendiente de alex a unai 5€, ya que esta en negativo, entonces, quiero que
      muestre el dinero total, pero si ocurre un caso como este, que sepa diferenciar entre dinero, ya que esos 5€ no
     estan en la cuenta"

     The next step is to modify `Dashboard.jsx` to calculate `myPendingReceivable = summary.pagosOptimos.filter(p => p.a
      === userProfile?.id).reduce((s, p) => s + p.monto, 0)` and display `myBalance - myPendingReceivable` as the main
     saldo number, with a sub-line showing the pending amounts and from whom — so Unai sees "+25€" prominently and "+5€
     pendiente de cobro de Alex" below it.

     If you need specific details from before compaction (like exact code snippets, error messages, or content you
     generated), read the full transcript at: C:\Users\unai6\.claude\projects\E--espaciSeguroClaude-cuentas-compartidas\
     e86b906c-4f88-492e-a655-dfcc191865b1.jsonl
     Continue the conversation from where it left off without asking the user any further questions. Resume directly —
     do not acknowledge the summary, do not recap what was happening, do not preface with "I'll continue" or similar.
     Pick up the last task as if the break never happened.
  ⎿  Read src\components\Settlement\SettlementPage.jsx (188 lines)
  ⎿  Read src\components\Dashboard\BalanceCard.jsx (124 lines)
  ⎿  Read src\hooks\useSettlement.js (135 lines)
  ⎿  Referenced file docs\gen-tecnico.mjs
  ⎿  Referenced file docs\gen-manual.mjs