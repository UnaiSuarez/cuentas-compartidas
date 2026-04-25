# 💰 Cuentas Compartidas

Aplicación web de gestión de gastos e ingresos compartidos para grupos pequeños (familia, piso, amigos).

**Stack:** React 19 + Vite + Tailwind CSS v4 + Firebase (Auth + Firestore) + Vercel

---

## ✨ Características

- **Grupos con código de invitación** — crea un grupo y comparte el código de 6 caracteres
- **Transacciones** — gastos e ingresos con categorías, split automático, filtros y búsqueda
- **Saldos en tiempo real** — Firebase Realtime sincroniza al instante entre todos los dispositivos
- **Pagos óptimos** — algoritmo greedy estilo Tricount que minimiza el número de transferencias
- **Chat interno** — historial completo sin límite, mensajes de pago automáticos
- **Exportación** — Excel (.xlsx), PDF y CSV
- **Estadísticas** — gráficos de gastos por categoría, por persona y evolución mensual
- **15+ avatares 2D** con 3 estados (normal, feliz, triste) según saldo
- **Dark/Light mode** — persiste en localStorage
- **Responsive** — mobile-first, funciona en móvil y desktop

---

## 🚀 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/cuentas-compartidas.git
cd cuentas-compartidas
npm install
```

### 2. Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto nuevo
3. Activa **Firestore** (modo production → edita las reglas)
4. Activa **Authentication** → proveedor Email/Contraseña
5. Ve a Configuración del proyecto → Tus apps → Web → Registra app
6. Copia la configuración

### 3. Crear `.env.local`

```bash
cp .env.example .env.local
# Edita .env.local y pega tus claves Firebase
```

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Reglas de Firestore

En Firebase Console → Firestore → Reglas, pega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.memberIds;
    }
    match /groups/{groupId}/{subcollection}/{docId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;
    }
  }
}
```

### 5. Arrancar en desarrollo

```bash
npm run dev
```

---

## 🌐 Deploy en Vercel

1. Sube el repo a GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project → importa tu repo
3. En **Environment Variables** añade las 6 variables `VITE_FIREBASE_*`
4. Deploy → listo ✅

Vercel desplegará automáticamente en cada push a `main`.

---

## 📁 Estructura del proyecto

```
src/
├── assets/avatars/     # 12+ avatares SVG 2D con estados
├── components/
│   ├── Auth/           # Login, registro, setup de perfil y grupo
│   ├── Chat/           # Chat con historial sin límite
│   ├── Common/         # Navbar (sidebar desktop + móvil inferior)
│   ├── Dashboard/      # Pantalla principal + avatares animados
│   ├── Settings/       # Ajustes, código de invitación, perfil
│   ├── Settlement/     # Liquidación de deudas (Tricount-style)
│   ├── Statistics/     # Gráficos con Recharts
│   └── Transactions/   # CRUD de transacciones + exportación
├── config/
│   └── firebase.js     # Config Firebase (singleton)
├── context/
│   └── AppContext.jsx  # Estado global + listeners Firestore
├── hooks/
│   ├── useAuth.js      # Auth + grupos
│   ├── useChat.js      # Mensajes Firestore
│   ├── useSettlement.js# Cálculo de deudas + confirmaciones
│   └── useTransactions.js # CRUD transacciones
└── utils/
    ├── calculateSettlement.js  # Algoritmo greedy
    ├── exporters.js            # Excel / PDF / CSV
    └── formatters.js           # Moneda EUR, fechas España
```

---

## 💡 Cómo funciona el cálculo de deudas

El algoritmo es greedy O(n log n), idéntico al de Tricount/Splitwise:

1. Calcula el **saldo neto** de cada persona = lo que aportó − lo que le corresponde pagar
2. Separa **acreedores** (saldo > 0) y **deudores** (saldo < 0)
3. En cada iteración: el mayor deudor paga al mayor acreedor el mínimo de ambas cantidades
4. Minimiza el número total de transferencias

---

## 🔒 Seguridad

- Contraseñas gestionadas por Firebase Auth (bcrypt, no almacenadas en texto plano)
- Reglas de Firestore: solo miembros del grupo acceden a sus datos
- Variables de entorno nunca en el repo (`.gitignore`)
- Sin datos sensibles en el cliente

---

## 📄 Licencia

MIT
