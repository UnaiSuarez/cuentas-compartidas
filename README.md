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
