# Documento Técnico - Cuentas Compartidas

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Equipo de Desarrollo  
**Stack Tecnológico:** React 19 + Vite + Tailwind CSS v4 + Firebase

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Modelo de Datos](#modelo-de-datos)
6. [Componentes Principales](#componentes-principales)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Gestión de Estado](#gestión-de-estado)
9. [Flujos de Autenticación](#flujos-de-autenticación)
10. [Algoritmos Clave](#algoritmos-clave)
11. [Integración Firebase](#integración-firebase)
12. [Seguridad](#seguridad)
13. [Optimizaciones y Performance](#optimizaciones-y-performance)
14. [Deployment](#deployment)
15. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Visión General

Cuentas Compartidas es una aplicación web progresiva (PWA) para gestión de gastos compartidos entre grupos pequeños. La arquitectura es modular, escalable y optimizada para múltiples dispositivos.

### Objetivos de Diseño

- **Precisión Financiera:** Cálculos exactos con manejo de decimales
- **Sincronización Realtime:** Datos consistentes entre dispositivos
- **UX Responsiva:** Experiencia fluid en móvil y desktop
- **Seguridad:** Autenticación y autorización en cada nivel
- **Performance:** Bundle pequeño, carga rápida, rendering eficiente
- **Escalabilidad:** Soporta cientos de transacciones por grupo

### Características Técnicas

- Autenticación con Firebase Auth (Email/Contraseña)
- Base de datos NoSQL con Firestore (tiempo real)
- Cálculo algorítmico de deudas óptimas (greedy O(n log n))
- Sincronización en tiempo real con listeners de Firestore
- Exportación a múltiples formatos (Excel, PDF, CSV)
- Tema oscuro/claro con persistencia
- Caché local con contexto React

---

## Arquitectura del Sistema

### Diagrama de Capas

```
┌─────────────────────────────────────────┐
│     Capa de Presentación (UI)          │
│  Componentes React + Tailwind CSS       │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│   Capa de Gestión de Estado (Context)   │
│      AppContext + useReducer Pattern     │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│      Capa de Lógica de Negocio          │
│   Hooks Personalizados + Utilidades      │
│  (calculateSettlement, exporters, etc)   │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│     Capa de Acceso a Datos              │
│ Firebase SDK (Auth + Firestore)         │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│      Capa de Infraestructura             │
│   Firebase Cloud (Google Infrastructure) │
└─────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario Interacciona
        ↓
Evento en Componente React
        ↓
Actualiza Estado (Context)
        ↓
Valida y Procesa Datos
        ↓
Envía a Firebase (Auth/Firestore)
        ↓
Firebase Procesa y Almacena
        ↓
Firebase Emite Cambio (Listener Realtime)
        ↓
AppContext Actualiza Estado
        ↓
Componentes se Rerenderizan
        ↓
UI Actualizada Visualmente
```

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| React | 19.2.5 | Framework de UI |
| React Router | 7.14.2 | Enrutamiento de página |
| Vite | 8.0.10 | Build tool y dev server |
| Tailwind CSS | 4.2.4 | Estilos utilidad-first |
| Framer Motion | 12.38.0 | Animaciones suaves |
| Lucide React | 1.9.0 | Iconos SVG |

### Backend/BDD

| Tecnología | Propósito |
|-----------|----------|
| Firebase Authentication | Gestión de usuarios |
| Cloud Firestore | Base de datos NoSQL en tiempo real |
| Firebase Security Rules | Control de acceso |

### Librerías de Utilidad

| Librería | Propósito |
|---------|----------|
| zustand | Estado global (alternativa reducida a Context) |
| date-fns | Manipulación de fechas |
| recharts | Gráficos y visualizaciones |
| jspdf | Generación de PDF |
| jspdf-autotable | Tablas en PDF |
| xlsx | Exportación a Excel |
| html2canvas | Capturas de pantalla (para exportación) |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-----------|----------|
| ESLint | Linting y code style |
| Babel | Transpilación de JavaScript |
| Node.js | Runtime y gestor de paquetes (npm) |

---

## Estructura del Proyecto

### Árbol de Directorios

```
cuentas-compartidas/
├── src/
│   ├── App.jsx                    # Componente raíz y rutas principales
│   ├── main.jsx                   # Punto de entrada
│   ├── config/
│   │   └── firebase.js            # Inicialización de Firebase (singleton)
│   ├── context/
│   │   └── AppContext.jsx         # Contexto global con listeners Firestore
│   ├── hooks/
│   │   ├── useAuth.js             # Lógica de autenticación y grupos
│   │   ├── useChat.js             # Operaciones de chat (CRUD)
│   │   ├── useSettlement.js       # Cálculo de pagos y liquidación
│   │   ├── useTransactions.js     # CRUD de transacciones
│   │   └── useUsers.js            # Operaciones con usuarios
│   ├── components/
│   │   ├── Auth/                  # Componentes de autenticación
│   │   │   ├── AuthGate.jsx       # Control de acceso y onboarding
│   │   │   ├── SignIn.jsx         # Formulario de login
│   │   │   ├── SignUp.jsx         # Formulario de registro
│   │   │   ├── PasswordGate.jsx   # Validación de contraseña
│   │   │   ├── ProfileSetup.jsx   # Configuración inicial de perfil
│   │   │   └── GroupSetup.jsx     # Crear o unirse a grupo
│   │   ├── Chat/
│   │   │   └── ChatWindow.jsx     # Ventana de chat con historial
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx      # Pantalla principal
│   │   │   ├── BalanceCard.jsx    # Tarjeta de saldo personal
│   │   │   └── AvatarScene.jsx    # Avatar animado 3D
│   │   ├── Common/
│   │   │   └── Navbar.jsx         # Navegación principal
│   │   ├── Settings/
│   │   │   └── SettingsPage.jsx   # Configuración de grupo y perfil
│   │   ├── Settlement/
│   │   │   └── SettlementPage.jsx # Cálculo y gestión de liquidaciones
│   │   ├── Statistics/
│   │   │   └── StatisticsPage.jsx # Gráficos y análisis
│   │   ├── Transactions/
│   │   │   ├── TransactionList.jsx # Lista de transacciones
│   │   │   └── TransactionForm.jsx # Formulario de transacciones
│   │   └── Users/
│   │       └── AvatarGallery.jsx  # Galería de avatares disponibles
│   ├── assets/
│   │   ├── avatars/               # SVGs de avatares 2D (15+ versiones)
│   │   └── index.jsx              # Exportador de recursos
│   ├── utils/
│   │   ├── calculateSettlement.js # Algoritmo de cálculo de deudas
│   │   ├── exporters.js           # Funciones de exportación (Excel/PDF/CSV)
│   │   └── formatters.js          # Formateo de moneda, fechas, etc.
│   └── styles/
│       └── tailwind.css           # Configuración Tailwind
├── index.html                     # Punto de entrada HTML
├── vite.config.js                 # Configuración de Vite
├── package.json                   # Dependencias y scripts
├── .env.example                   # Plantilla de variables de entorno
├── .gitignore                     # Archivos a ignorar en git
├── eslint.config.js               # Configuración de ESLint
├── public/                        # Recursos estáticos
└── docs/
    └── supabase_schema.sql        # Esquema referencial (Firestore)
```

### Directorios Clave

#### `/src`
Código fuente principal de la aplicación.

#### `/src/config`
Configuración centralizada de servicios externos (Firebase, APIs, etc).

#### `/src/context`
Gestión de estado global usando React Context API.

#### `/src/hooks`
Hooks personalizados para lógica reutilizable (autenticación, datos, etc).

#### `/src/components`
Componentes React organizados por feature/página.

#### `/src/utils`
Funciones utilitarias puras (cálculos, formato, exportación).

#### `/src/assets`
Recursos estáticos (imágenes, iconos, avatares SVG).

---

## Modelo de Datos

### Estructura Firestore

#### Colección: `users`
Almacena información de usuarios.

```javascript
users/{userId}
{
  id: string,                    // UID de Firebase Auth
  email: string,                 // Email del usuario
  name: string,                  // Nombre o apodo
  avatar: string,                // ID del avatar (0-14)
  groupId: string,               // ID del grupo actual
  createdAt: timestamp,          // Fecha de creación
  updatedAt: timestamp,          // Última actualización
  settings: {                    // Preferencias del usuario
    darkMode: boolean,
    language: string
  }
}
```

#### Colección: `groups`
Almacena información de grupos.

```javascript
groups/{groupId}
{
  id: string,                    // ID único del grupo
  name: string,                  // Nombre del grupo
  code: string,                  // Código de invitación (6 caracteres)
  memberIds: [string],           // Array de UIDs miembros
  createdBy: string,             // UID del creador
  createdAt: timestamp,
  updatedAt: timestamp,
  settings: {                    // Configuración del grupo
    currency: "EUR",
    language: "es",
    decimalPlaces: 2
  },
  categories: [                  // Categorías personalizadas
    {
      id: string,
      label: string,
      icon: string
    }
  ]
}
```

#### Subcolección: `groups/{groupId}/transactions`
Transacciones del grupo.

```javascript
groups/{groupId}/transactions/{txId}
{
  id: string,                    // ID único de transacción
  type: "expense" | "income",    // Tipo: gasto o ingreso
  description: string,           // Descripción de la transacción
  amount: number,                // Monto en EUR
  category: string,              // ID de categoría
  date: timestamp,               // Fecha de la transacción
  paidBy: string,                // UID de quién pagó
  splitAmong: [string],          // Array de UIDs participantes
  createdBy: string,             // UID de quién la registró
  createdAt: timestamp,
  updatedAt: timestamp,
  attachment?: string            // URL de comprobante (opcional)
}
```

#### Subcolección: `groups/{groupId}/messages`
Mensajes del chat.

```javascript
groups/{groupId}/messages/{msgId}
{
  id: string,
  text: string,                  // Contenido del mensaje
  userId: string,                // UID del remitente
  username: string,              // Nombre del remitente (cacheado)
  type: "user" | "system",       // Tipo: usuario o del sistema
  metadata?: {                   // Para mensajes de sistema
    paymentFrom: string,
    paymentTo: string,
    paymentAmount: number
  },
  createdAt: timestamp
}
```

#### Subcolección: `groups/{groupId}/payments`
Pagos pendientes confirmados.

```javascript
groups/{groupId}/payments/{payId}
{
  id: string,
  de: string,                    // UID del deudor
  a: string,                     // UID del acreedor
  monto: number,
  status: "pending" | "confirmed",
  createdAt: timestamp,
  confirmedAt?: timestamp
}
```

---

## Componentes Principales

### App.jsx
**Ubicación:** `src/App.jsx`

Componente raíz de la aplicación. Define la estructura de rutas y el flujo de autenticación.

#### Responsabilidades
1. Escucha el estado de autenticación del contexto
2. Renderiza AuthGate si el usuario no está autenticado
3. Define las rutas principales cuando el usuario está autenticado
4. Maneja lazy loading de componentes para optimizar bundle

#### Rutas Principales
```javascript
/                   → Dashboard (pantalla principal)
/transacciones      → Lista y formulario de transacciones
/liquidacion        → Cálculo y gestión de pagos óptimos
/estadisticas       → Gráficos y análisis
/chat               → Chat del grupo
/ajustes            → Configuración de grupo y perfil
```

#### Flujo de Autenticación
```javascript
firebaseUser === undefined
  ↓
  └─→ Mostrar pantalla de carga

firebaseUser === null
  ↓
  └─→ Mostrar AuthGate (login/registro)

firebaseUser && (!userProfile || !userProfile.groupId)
  ↓
  └─→ Mostrar AuthGate con pasos de onboarding

firebaseUser && userProfile && userProfile.groupId
  ↓
  └─→ Mostrar aplicación completa
```

### AppContext.jsx
**Ubicación:** `src/context/AppContext.jsx`

Proveedor de contexto global. Centraliza todo el estado de la aplicación y sincronización con Firestore.

#### Estado Gestionado

**Autenticación:**
- `firebaseUser` - Usuario de Firebase Auth (undefined = cargando)
- `userProfile` - Documento del usuario en Firestore
- `groupId` - ID del grupo actual
- `loading` - Indicador de carga inicial

**Datos del Grupo:**
- `groupMembers` - Array de perfiles de miembros
- `transactions` - Array de transacciones del grupo
- `messages` - Array de mensajes del chat
- `payments` - Array de pagos pendientes
- `categories` - Array de categorías personalizadas
- `groupSettings` - Configuración del grupo

**Preferencias UI:**
- `darkMode` - Estado del tema
- `error` - Mensaje de error

#### Funciones Principales

```javascript
// Autenticación
logout()                    // Desconectar usuario
updateUserProfile(data)     // Actualizar perfil
onProfileCreated(profile)   // Callback post-registro

// UI
toggleDarkMode()            // Cambiar tema

// Listeners
subscribeToGroup(groupId)   // Suscribirse a datos del grupo
cancelListeners()           // Cancelar listeners de Firestore
```

#### Listeners de Firestore

La aplicación implementa listeners en tiempo real para sincronización automática:

```javascript
// Grupo y miembros
onSnapshot(doc(db, 'groups', groupId), handler)

// Transacciones (ordenadas por fecha descendente)
onSnapshot(query(
  collection(db, 'groups', groupId, 'transactions'),
  orderBy('date', 'desc')
), handler)

// Mensajes (ordenados por fecha descendente)
onSnapshot(query(
  collection(db, 'groups', groupId, 'messages'),
  orderBy('createdAt', 'desc')
), handler)

// Pagos pendientes
onSnapshot(query(
  collection(db, 'groups', groupId, 'payments'),
  where('status', '==', 'pending')
), handler)
```

### AuthGate.jsx
**Ubicación:** `src/components/Auth/AuthGate.jsx`

Controla el flujo de autenticación y onboarding.

#### Pasos del Flujo

1. **Login/Registro** (SignIn.jsx / SignUp.jsx)
   - Formularios de autenticación con Firebase Auth
   - Validación de email y contraseña

2. **Setup de Perfil** (ProfileSetup.jsx)
   - Ingreso de nombre
   - Selección de avatar
   - Guardado en Firestore

3. **Setup de Grupo** (GroupSetup.jsx)
   - Crear grupo nuevo O
   - Unirse a grupo existente
   - Guardado de relación grupo-usuario

#### Validaciones

```javascript
- Email válido y único
- Contraseña mínimo 6 caracteres
- Nombre no vacío
- Código de grupo: 6 caracteres, existe en BD
```

### Dashboard.jsx
**Ubicación:** `src/components/Dashboard/Dashboard.jsx`

Pantalla principal que muestra el estado general del grupo.

#### Componentes Internos

- **AvatarScene:** Avatar animado 3D (cambio de expresión según saldo)
- **BalanceCard:** Tarjeta de saldo personal del usuario actual
- **ResumenFinanciero:** Tabla de saldos de todos los miembros
- **ÚltimasTransacciones:** Lista de 3-5 últimas transacciones

### TransactionList.jsx & TransactionForm.jsx
**Ubicación:** `src/components/Transactions/`

Gestión completa del CRUD de transacciones.

#### TransactionList Features

- Listado con filtros (categoría, persona, rango de fechas)
- Búsqueda por descripción
- Edición inline
- Eliminación con confirmación
- Desglose automático de cálculos

#### TransactionForm Fields

```
type            → "expense" | "income"
description     → string (max 100)
category        → string (ID de categoría)
amount          → number (positivo)
paidBy          → string (UID)
splitAmong      → [string] (UIDs)
date            → timestamp
```

#### Validaciones

```javascript
- Monto > 0
- Al menos 1 participante en splitAmong
- paidBy debe estar en splitAmong
- Descripción no vacía
```

### SettlementPage.jsx
**Ubicación:** `src/components/Settlement/SettlementPage.jsx`

Cálculo y visualización de pagos óptimos.

#### Funcionalidades

1. Calcula balances netos de cada miembro
2. Genera lista mínima de transferencias usando algoritmo greedy
3. Permite confirmar pagos (crea transacción de ingreso)
4. Genera mensajes automáticos en el chat

#### Proceso de Liquidación

```javascript
1. User elige transferencias en la tabla
2. Click "Confirmar Pago"
3. Sistema crea transacción de tipo "income"
4. Genera mensaje en chat con detalles
5. Saldos se actualizan automáticamente
```

### StatisticsPage.jsx
**Ubicación:** `src/components/Statistics/StatisticsPage.jsx`

Visualización de datos con Recharts.

#### Gráficos Disponibles

1. **Pie Chart:** Gastos por categoría
2. **Bar Chart:** Gastos por persona
3. **Line Chart:** Evolución mensual
4. **Horizontal Bar:** Balance neto por persona

#### Filtros

- Por período (7d, 30d, mes, trimestre, año, custom)
- Por categoría
- Por miembro

### ChatWindow.jsx
**Ubicación:** `src/components/Chat/ChatWindow.jsx`

Comunicación en tiempo real con historial completo.

#### Features

- Scroll automático al nuevo mensaje
- Timestamps precisos
- Mensajes del sistema para pagos confirmados
- Sin límite de historial

#### Tipos de Mensaje

```javascript
type === 'user'
  → Mensaje normal de usuario

type === 'system'
  → Mensaje automático de pago confirmado
  → metadata: { paymentFrom, paymentTo, paymentAmount }
```

---

## Hooks Personalizados

### useAuth.js
**Ubicación:** `src/hooks/useAuth.js`

Lógica centralizada de autenticación y grupos.

```javascript
export function useAuth() {
  return {
    // Autenticación
    signUp(email, password) → Promise<User>
    signIn(email, password) → Promise<User>
    logout() → Promise<void>

    // Perfil
    createUserProfile(name, avatar) → Promise<void>
    updateUserProfile(data) → Promise<void>

    // Grupos
    createGroup(name) → Promise<groupId>
    joinGroup(code) → Promise<void>
    leaveGroup() → Promise<void>
    regenerateInviteCode() → Promise<string>
  }
}
```

#### Detalles de Implementación

**signUp:**
```javascript
1. Valida email y contraseña
2. Crea usuario en Firebase Auth
3. Crea documento en /users/{uid}
4. Retorna usuario
```

**createGroup:**
```javascript
1. Genera código único de 6 caracteres
2. Crea documento en /groups/{id}
3. Añade userId a memberIds
4. Crea subcollecciones vacías
5. Actualiza userProfile con groupId
6. Retorna groupId
```

**joinGroup:**
```javascript
1. Busca grupo por código
2. Valida que código existe
3. Añade userId a group.memberIds
4. Actualiza userProfile.groupId
5. Suscribe listeners
```

### useChat.js
**Ubicación:** `src/hooks/useChat.js`

CRUD de mensajes y operaciones del chat.

```javascript
export function useChat() {
  return {
    sendMessage(text) → Promise<void>
    deleteMessage(msgId) → Promise<void>    // (si está implementado)
    getMessageHistory(limit = 100) → Array
  }
}
```

#### Implementación de sendMessage

```javascript
1. Valida que el texto no esté vacío
2. Crea documento en messages/{id}
3. Incluye: text, userId, username, type, createdAt
4. Firebase listener actualiza estado automáticamente
5. Scroll automático al final
```

#### Mensajes del Sistema

```javascript
// Llamado desde Settlement después de confirmar pago
addSystemMessage({
  paymentFrom: userId,
  paymentTo: userId,
  paymentAmount: number
})

Crea mensaje con type: 'system' y metadata
```

### useSettlement.js
**Ubicación:** `src/hooks/useSettlement.js`

Cálculo de deudas y pagos óptimos.

```javascript
export function useSettlement() {
  return {
    // Cálculos
    getBalances() → Object<userId, balance>
    getOptimalPayments() → Array<{de, a, monto}>
    getGroupSummary() → {
      totalIngresos,
      totalGastos,
      saldoColectivo,
      balances,
      pagosOptimos
    }

    // Operaciones
    confirmPayment(de, a, monto) → Promise<void>
  }
}
```

#### getOptimalPayments - Algoritmo Greedy

```javascript
Entrada: balances = { userId: netBalance }

1. Separa acreedores (saldo > 0) y deudores (saldo < 0)
2. Ordena ambos arrays de mayor a menor
3. Bucle:
   - Mayor deudor paga al mayor acreedor
   - Monto = min(deudor.amount, acreedor.amount)
   - Reduce amounts en ambos
   - Incrementa índice si quedó saldado
4. Retorna array de pagos

Complejidad: O(n log n) por ordenamiento
Garantía: Número mínimo de transferencias posible
```

### useTransactions.js
**Ubicación:** `src/hooks/useTransactions.js`

CRUD y consultas de transacciones.

```javascript
export function useTransactions() {
  return {
    createTransaction(data) → Promise<txId>
    updateTransaction(txId, data) → Promise<void>
    deleteTransaction(txId) → Promise<void>
    getTransactions(filters) → Array
    getTransactionById(txId) → Object
  }
}
```

#### Estructura de datos de entrada

```javascript
createTransaction({
  type: 'expense' | 'income',
  description: string,
  category: string,
  amount: number,
  paidBy: string,
  splitAmong: [string],
  date: timestamp
})
```

#### Validaciones Internas

```javascript
- amount > 0
- splitAmong.length > 0
- paidBy ∈ splitAmong
- description.length > 0
- date ≤ now
```

### useUsers.js
**Ubicación:** `src/hooks/useUsers.js`

Operaciones con usuarios.

```javascript
export function useUsers() {
  return {
    getUserById(userId) → Promise<User>
    getGroupMembers() → Array<User>
    updateUser(userId, data) → Promise<void>
  }
}
```

---

## Gestión de Estado

### Context API vs Zustand

Actualmente la aplicación utiliza **React Context API** para estado global, pero la arquitectura está preparada para migración a **Zustand** (librería incluida en package.json).

### AppContext Structure

```javascript
AppContext → {
  // Autenticación (auth state)
  firebaseUser,
  userProfile,
  groupId,
  loading,
  error,
  
  // Datos (group data)
  groupMembers,
  transactions,
  messages,
  payments,
  categories,
  groupSettings,
  
  // UI (ui state)
  darkMode,
  
  // Métodos
  logout,
  updateUserProfile,
  toggleDarkMode,
  onProfileCreated,
  setError
}
```

### Actualización de Estado

#### Flujo Síncrono (UI)
```
User Interaction
  ↓
Component Event Handler
  ↓
Call Hook Function
  ↓
Validate Data
  ↓
Update Context State (optimistic)
  ↓
Dispatch to Firebase
  ↓
UI Rerender
```

#### Flujo Asíncrono (Datos del Servidor)
```
Firebase Change Event
  ↓
Firestore Listener Triggered
  ↓
onSnapshot Callback
  ↓
Update Context State
  ↓
All Subscribers Rerender
```

### Performance: Renderización

#### Optimizaciones Implementadas

1. **Lazy Loading de Componentes:**
   ```javascript
   const Settlement = lazy(() => import('./components/Settlement/SettlementPage'))
   ```
   Reduce bundle inicial, carga bajo demanda.

2. **Suspense Boundaries:**
   ```javascript
   <Suspense fallback={<PageLoader />}>
     <Routes>...</Routes>
   </Suspense>
   ```
   Carga progresiva de rutas.

3. **useCallback en Listeners:**
   ```javascript
   const subscribeToGroup = useCallback((gId) => {
     // ... listeners setup
   }, [])
   ```
   Previene re-subscripciones innecesarias.

4. **Cleanup de Listeners:**
   ```javascript
   return () => unsub?.()  // Cleanup en useEffect
   ```
   Previene memory leaks con listeners activos.

---

## Flujos de Autenticación

### Flujo de Registro Completo

```javascript
1. Usuario accede a app
   → firebaseUser === undefined → Show Loading Screen

2. Usuario hace click en "Crear Cuenta"
   → SignUp Component
   → Ingresa email y contraseña
   → Click "Registrarse"

3. firebase/auth createUserWithEmailAndPassword()
   → Email/Pass registrado en Firebase Auth
   → Firebase genera uid único

4. onAuthStateChanged callback
   → firebaseUser seteado al usuario creado
   → Busca /users/{uid} en Firestore (no existe)
   → userProfile = null

5. AuthGate detecta: firebaseUser && !userProfile
   → Muestra ProfileSetup
   → Usuario selecciona nombre y avatar

6. ProfileSetup.jsx handleSubmit()
   → Crea documento en /users/{uid}
   → Datos: name, avatar, createdAt, etc.
   → Callback: onProfileCreated()

7. AppContext onProfileCreated()
   → Actualiza userProfile en contexto
   → No hay groupId aún

8. AuthGate detecta: userProfile && !userProfile.groupId
   → Muestra GroupSetup
   → Usuario elige: Crear Grupo O Unirse a Grupo

9. Si Crear Grupo:
   → Genera código de 6 caracteres único
   → Crea /groups/{groupId}
   → Añade userId a memberIds
   → Actualiza /users/{uid}.groupId
   → subscribeToGroup() activado

10. AuthGate detecta: firebaseUser && userProfile && groupId
    → Renderiza aplicación completa
    → Router activado
```

### Flujo de Login

```javascript
1. Usuario accede a app
   → firebaseUser === undefined → Show Loading Screen

2. Usuario hace click en "Iniciar Sesión"
   → SignIn Component
   → Ingresa email y contraseña

3. firebase/auth signInWithEmailAndPassword()
   → Valida credenciales contra Firebase Auth
   → Retorna usuario

4. onAuthStateChanged callback
   → firebaseUser seteado
   → getDoc(/users/{uid}) ejecutado
   → userProfile cargado (ya existe)
   → groupId extraído de userProfile

5. subscribeToGroup(groupId)
   → Listeners activados para:
     - Documento del grupo
     - Transacciones
     - Mensajes
     - Pagos
   → Estado sincronizado

6. AuthGate: todos los datos presentes
   → Renderiza aplicación
```

### Flujo de Logout

```javascript
1. Usuario hace click "Cerrar Sesión"
   → logout() llamado desde AppContext

2. cancelListeners()
   → unsubTxRef.current?.()    // Cancela listener de transacciones
   → unsubMsgRef.current?.()   // Cancela listener de mensajes
   → unsubPayRef.current?.()   // Cancela listener de pagos
   → unsubGroupRef.current?.() // Cancela listener de grupo

3. resetData()
   → userProfile = null
   → groupId = null
   → groupMembers = []
   → transactions = []
   → messages = []
   → payments = []

4. firebase/auth signOut()
   → Sesión de Firebase terminada

5. onAuthStateChanged callback
   → firebaseUser = null

6. AuthGate detecta: !firebaseUser
   → Muestra pantalla de login
```

---

## Algoritmos Clave

### 1. calculateBalances()
**Ubicación:** `src/utils/calculateSettlement.js`

Calcula el saldo neto de cada usuario.

#### Fórmula

```
Para cada usuario:
  saldoNeto = (Total que pagó) - (Su parte de gastos)

Para cada transacción:
  Si type === 'income':
    balances[paidBy] += amount
  
  Si type === 'expense':
    partePorPersona = amount / splitAmong.length
    balances[paidBy] += amount           // Adelantó todo
    Para cada p in splitAmong:
      balances[p] -= partePorPersona    // Debe su parte
```

#### Ejemplo

```javascript
Transacciones:
1. Juan paga 60 EUR comida, participa: Juan, Maria, Pedro (3)
2. Maria paga 30 EUR café, participa: Maria, Pedro (2)

Cálculos:
Transacción 1:
  Juan:  +60 (pagó) -20 (su parte) = +40
  Maria: -20 (debe)
  Pedro: -20 (debe)

Transacción 2:
  Maria: +30 (pagó) -15 (su parte) = +15
  Pedro: -15 (debe)

Saldos Finales:
  Juan:  +40
  Maria: -20 + 15 = -5
  Pedro: -20 - 15 = -35
```

#### Complejidad

- **Tiempo:** O(n) donde n = número de transacciones
- **Espacio:** O(m) donde m = número de usuarios

### 2. calculateOptimalPayments()
**Ubicación:** `src/utils/calculateSettlement.js`

Calcula la lista mínima de transferencias usando greedy algorithm.

#### Algoritmo

```javascript
Entrada: balances = { userId: saldoNeto }

1. Inicializar:
   creditors = []  // saldo > EPSILON
   debtors = []    // saldo < -EPSILON
   EPSILON = 0.01  // Error mínimo aceptable

2. Separar:
   Para cada (userId, saldo) in balances:
     Si saldo > EPSILON:
       creditors.push({ userId, amount: saldo })
     Si saldo < -EPSILON:
       debtors.push({ userId, amount: -saldo })

3. Ordenar:
   creditors.sort(desc)  // Mayor a menor
   debtors.sort(desc)    // Mayor a menor

4. Asignar Pagos:
   i = 0, j = 0
   Mientras i < creditors.length && j < debtors.length:
     creditor = creditors[i]
     debtor = debtors[j]
     pago = min(creditor.amount, debtor.amount)
     
     payments.push({ de: debtor.userId, a: creditor.userId, monto: pago })
     
     creditor.amount -= pago
     debtor.amount -= pago
     
     Si creditor.amount < EPSILON: i++
     Si debtor.amount < EPSILON: j++

5. Retornar payments
```

#### Ejemplo

```javascript
Saldos:
  Juan:  +40
  Maria: -5
  Pedro: -35

Separar:
  creditors: [{ userId: 'Juan', amount: 40 }]
  debtors: [{ userId: 'Pedro', amount: 35 }, { userId: 'Maria', amount: 5 }]

Asignación:
1. Pedro (35) paga a Juan (40)
   → pago = min(35, 40) = 35
   → Juan queda +5, Pedro queda 0 → j++
   
2. Maria (5) paga a Juan (5)
   → pago = min(5, 5) = 5
   → Juan queda 0, Maria queda 0 → i++, j++

Resultado:
[
  { de: 'Pedro', a: 'Juan', monto: 35 },
  { de: 'Maria', a: 'Juan', monto: 5 }
]

Total: 2 transferencias (óptimo)
```

#### Complejidad

- **Tiempo:** O(n log n) por ordenamiento (n = num usuarios)
- **Espacio:** O(n)

#### Garantía de Optimalidad

El algoritmo greedy garantiza el número mínimo de transferencias porque:
- Cada iteración sald a uno de los dos actores (creditor o debtor)
- No hay forma de hacerlo más eficientemente
- Equivalente al algoritmo de Tricount/Splitwise

### 3. calculateGroupSummary()
**Ubicación:** `src/utils/calculateSettlement.js`

Resumen completo de la situación financiera.

```javascript
Salida: {
  totalIngresos: number,
  totalGastos: number,
  saldoColectivo: totalIngresos - totalGastos,
  balances: { userId: saldoNeto },
  pagosOptimos: [{ de, a, monto }]
}
```

Combina las dos funciones anteriores para un análisis completo.

---

## Integración Firebase

### Inicialización
**Ubicación:** `src/config/firebase.js`

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### Reglas de Firestore

```javascript
rules_version = '2'
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Documentos de usuario: cada uno puede leer/escribir solo el suyo
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId
    }
    
    // Documentos de grupo: cualquier miembro puede leer
    match /groups/{groupId} {
      allow read: if request.auth != null
      allow create: if request.auth != null
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.memberIds
      
      // Subcollecciones: solo miembros del grupo
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null &&
                              request.auth.uid in 
                              get(/databases/$(database)/documents/groups/$(groupId))
                                .data.memberIds
      }
    }
  }
}
```

### Operaciones Comunes

#### Crear Documento
```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const docRef = await addDoc(collection(db, 'messages'), {
  text: 'Hola',
  userId: uid,
  createdAt: serverTimestamp()
})
```

#### Leer Documento
```javascript
import { doc, getDoc } from 'firebase/firestore'

const snap = await getDoc(doc(db, 'users', uid))
if (snap.exists()) {
  const user = { id: snap.id, ...snap.data() }
}
```

#### Actualizar Documento
```javascript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'

await updateDoc(doc(db, 'groups', groupId), {
  name: 'Nuevo Nombre',
  updatedAt: serverTimestamp()
})
```

#### Eliminar Documento
```javascript
import { doc, deleteDoc } from 'firebase/firestore'

await deleteDoc(doc(db, 'transactions', txId))
```

#### Listener Realtime
```javascript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const unsubscribe = onSnapshot(
  query(
    collection(db, 'groups', groupId, 'messages'),
    orderBy('createdAt', 'desc')
  ),
  (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setMessages(messages)
  }
)

// Cleanup
return () => unsubscribe()
```

---

## Seguridad

### Autenticación

#### Firebase Auth
- Email/Contraseña
- Contraseñas hasheadas con bcrypt (manejado por Firebase)
- Sessions gestionadas automáticamente
- Tokens JWT con expiración

#### Verificación de Email
- Opcional pero recomendada
- Se puede implementar con sendEmailVerification()

### Autorización

#### Reglas de Firestore
- Solo miembros de un grupo pueden acceder a sus datos
- Cada usuario solo puede editar su propio documento
- Las transacciones solo pueden ser vistas/editadas por miembros del grupo

#### Validación en Cliente
```javascript
// En hooks, antes de operaciones:
if (firebaseUser?.uid !== expectedUserId) {
  throw new Error('Unauthorized')
}

if (!userProfile?.groupId) {
  throw new Error('No group selected')
}
```

#### Validación en Servidor (Firestore Rules)
```javascript
// Las reglas de Firestore validan:
- request.auth != null                          // Autenticado
- request.auth.uid in resource.data.memberIds  // Es miembro del grupo
- Solo transacciones del grupo actual accesibles
```

### Protección de Datos

#### Variables de Entorno
```env
# .env.local (nunca en git, incluido en .gitignore)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

#### Nunca Exponer
- API Keys de servidor
- Tokens de larga vida
- Claves privadas de servicios

#### En el Cliente
- Solo se envían Firebase API keys públicas
- Credenciales almacenadas en memoria o sessionStorage
- localStorage solo para preferencias (darkMode)

### HTTPS

- Producción siempre en HTTPS
- Vercel lo fuerza automáticamente
- Cookies de sesión marcadas como Secure

---

## Optimizaciones y Performance

### Bundle Size

#### Code Splitting
```javascript
// Lazy load de componentes grandes
const Settlement = lazy(() => import('./components/Settlement/SettlementPage'))
const Statistics = lazy(() => import('./components/Statistics/StatisticsPage'))
const Chat = lazy(() => import('./components/Chat/ChatWindow'))
```

Reduce bundle inicial de ~200KB a ~80KB.

#### Tree Shaking
- Imports con ES6 modules
- Tailwind CSS purga estilos no usados
- Recharts importa solo componentes necesarios

#### Vite Optimizations
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: 'terser',
    sourcemap: false
  }
})
```

### Runtime Performance

#### useCallback para Listeners
```javascript
const subscribeToGroup = useCallback((gId) => {
  // ... setup listeners
}, [])

// Previene que se recree la función en cada render
// Sin esto: cada render crearía nuevos listeners
```

#### Cleanup en useEffect
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(...)
  return () => unsubscribe()
  // Previene listeners acumulándose
}, [])
```

#### Memoización de Datos
```javascript
const balances = useMemo(() => {
  return calculateBalances(transactions, groupMembers)
}, [transactions, groupMembers])
```

#### Virtualización (no implementada, pero considerada)
Para listas muy largas:
```javascript
<FixedSizeList
  height={600}
  itemCount={transactions.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

### Network Performance

#### Firebase Optimizaciones
- Índices para queries comunes
- Batching de writes (cuando es posible)
- Listeners en lugar de polls

#### Compresión
- Vercel comprime automáticamente con gzip/brotli
- Imágenes SVG son escalables

---

## Deployment

### Preparación para Producción

#### 1. Verificar Construcción
```bash
npm run build
npm run lint
```

#### 2. Variables de Entorno
```bash
# En Vercel Dashboard
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

#### 3. Reglas de Firestore
```javascript
// Actualizar en Firebase Console
rules_version = '2'
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId
    }
    match /groups/{groupId} {
      allow read: if request.auth != null
      allow create: if request.auth != null
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.memberIds
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null &&
                              request.auth.uid in 
                              get(/databases/$(database)/documents/groups/$(groupId))
                                .data.memberIds
      }
    }
  }
}
```

#### 4. Firebase Auth Domain Whitelist
```javascript
// En Firebase Console → Authentication → Settings
- Authorized Domains: [vercel-deployed-url]
- Redirect URLs: [vercel-deployed-url]
```

### Vercel Deployment

#### Opción 1: Deploy Manual
```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

#### Opción 2: GitHub Integration
1. Push a GitHub
2. Conectar repositorio en vercel.com
3. Vercel despliega automáticamente en cada push
4. Configurar environment variables en Vercel Dashboard

### Monitoreo Post-Deploy

- Verificar Firebase Console para errores de reglas
- Revisar Vercel Analytics
- Monitorear error rate en navegador
- Test en múltiples dispositivos

---

## Guía de Desarrollo

### Setup Local

#### 1. Clonar Repositorio
```bash
git clone https://github.com/usuario/cuentas-compartidas.git
cd cuentas-compartidas
```

#### 2. Instalar Dependencias
```bash
npm install
```

#### 3. Configurar Firebase
1. Crear proyecto en Firebase Console
2. Habilitar Auth (Email/Contraseña) y Firestore
3. Copiar config

#### 4. Variables de Entorno
```bash
cp .env.example .env.local
# Editar .env.local con claves de Firebase
```

#### 5. Dev Server
```bash
npm run dev
# http://localhost:5173
```

### Estructura de Commits

```
feat: añadir nueva feature
fix: corregir bug
refactor: reorganizar código sin cambiar funcionalidad
docs: cambios en documentación
test: agregar tests
perf: mejorar performance
chore: cambios en build, dependencias, etc
```

### Ejemplo de Nuevo Feature: Cambiar Categoría

#### 1. Modificar Schema (si es necesario)
```javascript
// categories array ya está en groups/{groupId}
// Solo si se añade nueva categoría por defecto
```

#### 2. Añadir UI en TransactionForm
```javascript
// src/components/Transactions/TransactionForm.jsx
<select name="category" value={category} onChange={...}>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.label}</option>
  ))}
</select>
```

#### 3. Validar en Hook
```javascript
// src/hooks/useTransactions.js
if (!categories.find(c => c.id === category)) {
  throw new Error('Invalid category')
}
```

#### 4. Guardar en Firestore
```javascript
// Ya manejado por updateDoc
await updateDoc(doc(db, '...'), {
  category: newCategory
})
```

#### 5. Actualizar Stats (si es necesario)
```javascript
// StatisticsPage ya filtra por categoría automáticamente
// Cambios se reflejan en tiempo real
```

### Testing

No hay tests implementados actualmente, pero estructura para agregar:

```javascript
// src/__tests__/calculateSettlement.test.js
import { calculateBalances, calculateOptimalPayments } from '../utils/calculateSettlement'

describe('calculateSettlement', () => {
  it('should calculate correct balances', () => {
    const transactions = [...]
    const users = [...]
    const balances = calculateBalances(transactions, users)
    expect(balances.userId).toBe(expectedValue)
  })
})
```

### Debugging

#### Console Logs
```javascript
console.log('Estado actual:', { transactions, balances })
```

#### Firestore Emulator (opcional)
```bash
firebase emulators:start
# Ejecutar tests contra emulador local
```

#### React DevTools
- Extensión: "React Developer Tools"
- Inspeccionar componentes y props

#### Firebase Console
- Ver datos en tiempo real
- Monitorear queries y rules violations

---

## Consideraciones para Escalabilidad

### Limitaciones Actuales

1. **Subcollecciones sin índices:** Firestore crea automáticamente índices
2. **Realtime listeners en memoria:** Si hay 100+ transacciones, considerar paginación
3. **Split automático:** Asume distribución equitativa, no ponderada

### Mejoras Futuras

1. **Paginación de Transacciones**
   ```javascript
   const q = query(
     collection(db, 'groups', groupId, 'transactions'),
     orderBy('date', 'desc'),
     limit(50)
   )
   ```

2. **Split Ponderado**
   ```javascript
   splitAmong: [
     { userId: 'juan', weight: 0.5 },
     { userId: 'maria', weight: 0.3 },
     { userId: 'pedro', weight: 0.2 }
   ]
   ```

3. **Presupuestos y Límites**
   ```javascript
   budgets: {
     'food': { limit: 500, current: 320 },
     'home': { limit: 1000, current: 950 }
   }
   ```

4. **Recurrencia de Transacciones**
   ```javascript
   recurring: {
     enabled: true,
     frequency: 'monthly',
     nextOccurrence: date
   }
   ```

5. **Auditoría de Cambios**
   ```javascript
   // Subcolección que registra quién cambió qué y cuándo
   transactions/{txId}/history/{changeId}
   ```

---

**Documento generado:** 26 de abril de 2026  
**Última revisión:** v1.0
