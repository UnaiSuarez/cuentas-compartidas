# Manual de Usuario - Cuentas Compartidas

**Versión:** 2.1  
**Fecha:** Abril 2026  
**Aplicación:** Gestión de Gastos Compartidos para Grupos

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión de Salas (Grupos)](#gestión-de-salas)
4. [Dashboard Principal](#dashboard-principal)
5. [Gestión de Transacciones](#gestión-de-transacciones)
6. [Liquidación de Deudas](#liquidación-de-deudas)
7. [Estadísticas y Análisis](#estadísticas-y-análisis)
8. [Chat Interno](#chat-interno)
9. [Configuración y Ajustes](#configuración-y-ajustes)
10. [Exportación de Datos](#exportación-de-datos)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

Cuentas Compartidas es una aplicación web diseñada para simplificar la gestión financiera de grupos pequeños: familias, pisos compartidos, grupos de amigos, viajes, etc. Permite registrar gastos e ingresos compartidos, calcular automáticamente quién debe a quién, y liquidar deudas de la manera más eficiente posible.

### Características Principales

- **Múltiples salas:** un usuario puede pertenecer a varias salas y cambiar entre ellas
- **Rol de administrador:** quien crea la sala puede gestionar miembros, renombrar el grupo y editar categorías
- **3 modos de transacción:** Gasto individual, Ingreso y Gasto Común (del fondo colectivo)
- **Saldos en tiempo real:** se actualizan al instante en todos los dispositivos
- **Liquidación optimizada:** número mínimo de transferencias para saldar todas las deudas
- **Desglose de saldo:** explicación detallada de por qué cada persona tiene su saldo actual
- **Categorías personalizables:** cada sala puede crear sus propias categorías
- **Chat integrado:** comunicación en tiempo real dentro de la app
- **Estadísticas:** vista personal y de grupo con gráficos
- **Exportación:** Excel, PDF y CSV
- **18 avatares** con animaciones y 3 estados según saldo
- **Responsive:** funciona en móvil, tablet y escritorio

---

## Primeros Pasos

### 1. Crear una Cuenta

1. Accede a la aplicación en tu navegador
2. Haz clic en "Crear Cuenta"
3. Introduce tu correo electrónico y una contraseña (mínimo 6 caracteres)
4. Haz clic en "Registrarse"

### 2. Configurar tu Perfil

Tras registrarte se te pedirá configurar tu perfil una sola vez:

1. **Nombre:** cómo quieres que te vean los demás miembros
2. **Avatar:** elige entre 18 avatares disponibles. El avatar cambia de expresión según tu saldo:
   - Expresión alegre: saldo positivo (te deben dinero)
   - Expresión neutral: saldo cero
   - Expresión preocupada: saldo negativo (debes dinero)

### 3. Selector de Sala

Después del perfil, llegas al **Selector de Sala**. Aquí puedes:
- Ver todas las salas a las que perteneces
- Entrar en una sala existente
- **Crear una sala nueva** (se te convierte automáticamente en administrador)
- **Unirte a una sala** con el código de 6 caracteres que te haya compartido alguien

---

## Gestión de Salas

### Múltiples Salas

Puedes pertenecer a tantas salas como necesites: piso, familia, viaje, etc. Usa el Selector de Sala para cambiar entre ellas. También puedes volver al selector desde Ajustes → "Cambiar de sala".

### Crear una Sala

1. En el Selector de Sala, haz clic en "Crear Sala"
2. Escribe un nombre descriptivo (ej: "Piso Calle Mayor", "Viaje París 2026")
3. La app genera automáticamente un código de 6 caracteres
4. Comparte ese código con los demás para que se unan

### Unirse a una Sala

1. En el Selector de Sala, haz clic en "Unirse"
2. Introduce el código de 6 caracteres que te han compartido
3. La app te añade automáticamente al grupo

### Rol de Administrador

El creador de la sala es el administrador. Como admin puedes:
- **Expulsar miembros** (botón junto a cada miembro en Ajustes)
- **Renombrar la sala** (en Ajustes → Nombre del grupo)
- **Editar categorías** (añadir, modificar o eliminar)

Si el admin abandona la sala, el rol se transfiere automáticamente al siguiente miembro.

---

## Dashboard Principal

El Dashboard es la pantalla principal con el estado financiero del grupo actualizado en tiempo real.

### Avatares Animados

En la parte superior aparecen los avatares de todos los miembros del grupo. La expresión de cada avatar refleja su saldo actual. Los avatares tienen animaciones nativas (antena pulsante, parpadeo, cola que se mueve, etc.) según el personaje elegido.

### Tu Saldo Personal

Tarjeta central con tu saldo neto:
- **Verde (+):** te deben dinero. Has aportado más de lo que te corresponde.
- **Rojo (-):** debes dinero. Has pagado menos de lo que te corresponde.
- **Gris (0):** estás al día.

### Resumen Financiero

Cuatro tarjetas con métricas globales del grupo:
- **Saldo colectivo:** dinero disponible en el fondo común (ingresos menos gastos comunes)
- **Total ingresos:** suma de todos los ingresos registrados
- **Total gastos:** suma de todos los gastos registrados
- **Miembros:** número de personas en el grupo

### Saldo por Persona

Lista de saldos de todos los miembros del grupo para ver de un vistazo quién debe y quién tiene crédito.

### ¿Por qué tengo este saldo?

Panel desplegable que explica el saldo de cada miembro desglosado en dos componentes:

| Componente | Descripción |
|---|---|
| **Posición en fondo** | Ingresos aportados menos tu parte en gastos comunes |
| **Deudas directas** | Lo que adelantaste por otros menos lo que debes a otros |

Ejemplo: si tu saldo es +80€, puede significar que aportaste +100€ al fondo colectivo pero aún no has recuperado 20€ que adelantaste en un gasto individual. El panel muestra exactamente esto para que todos entiendan su situación.

> La suma de los saldos de todos los miembros siempre es igual al saldo colectivo del grupo.

### Pagos Pendientes

Panel "BalanceCard" con las transferencias óptimas calculadas para liquidar todas las deudas, y los pagos pendientes de confirmación.

---

## Gestión de Transacciones

### Los 3 Modos de Transacción

El formulario de nueva transacción tiene tres modos seleccionables:

#### Gasto (individual)

Alguien del grupo paga y adelanta el dinero por los demás.

- **Pagado por:** quién desembolsó el dinero
- **Dividido entre:** quiénes participan (el monto se divide equitativamente)

Efecto: el pagador recibe crédito igual al total; cada participante se debita su parte proporcional.

#### Ingreso

Entrada de dinero al grupo (devolución, venta de algo compartido, aporte extraordinario).

- **Aportado por:** quién recibió o ingresó el dinero

Efecto: el aportante suma el importe completo a su saldo.

#### Gasto Común

El gasto sale del fondo colectivo del grupo. Nadie "adelanta" el dinero individualmente.

- **Dividido entre:** quiénes participan en el gasto
- No hay campo "Pagado por" porque es el fondo quien paga

Efecto: el fondo colectivo se reduce; cada participante se debita su parte. Este modo es ideal para gastos que todos han acordado pagar desde el presupuesto conjunto (alquiler, suministros compartidos, etc.).

> Los gastos comunes se identifican con una pastilla azul "Fondo común" en la lista de transacciones.

### Campos del Formulario

| Campo | Descripción |
|---|---|
| Monto | Cantidad en euros (admite decimales) |
| Categoría | Clasificación del gasto (editables por sala) |
| Descripción | Texto libre hasta 200 caracteres |
| Fecha | Fecha de la transacción (por defecto hoy) |
| Pagado por | Solo en modo Gasto e Ingreso |
| Dividido entre | Solo en Gasto y Gasto Común |

### Filtros y Búsqueda

Filtra la lista de transacciones por:
- **Tipo:** Todo / Gastos / Ingresos
- **Período:** Hoy / Esta semana / Este mes / Todo
- **Texto libre:** busca por descripción, categoría o nombre del pagador

### Editar y Eliminar

Cada transacción tiene botones de edición (lápiz) y eliminación (papelera). Al editar, los saldos se recalculan automáticamente. La eliminación pide confirmación y no se puede deshacer.

### Ejemplos Prácticos

**Ejemplo 1 — Gasto individual:** Maria compra en el supermercado 85,50€ para el piso. Participan Maria, Juan y Pedro. Cada uno debe 28,50€. Maria obtiene +57€ neto; Juan y Pedro -28,50€ cada uno.

**Ejemplo 2 — Gasto Común:** El alquiler del piso es 900€ y se paga desde la cuenta conjunta. Modo = Gasto Común, dividido entre los 3. El fondo colectivo se reduce en 900€; cada uno se debita 300€. Nadie acumula crédito individual.

**Ejemplo 3 — Ingreso:** Pedro vende un mueble común en 120€. Tipo = Ingreso, aportado por Pedro, dividido entre los 3. Pedro sube +120€ a su saldo; esa ganancia se reflejará en los pagos óptimos.

---

## Liquidación de Deudas

### Cómo Funciona el Algoritmo

La aplicación usa un algoritmo greedy (O(n log n)) que garantiza el número mínimo de transferencias:

1. Calcula el saldo neto de cada persona
2. Clasifica en acreedores (saldo > 0) y deudores (saldo < 0)
3. En cada paso, el mayor deudor paga al mayor acreedor la cantidad mínima de ambos
4. Se repite hasta que todos quedan a cero

Con N personas, nunca se necesitan más de N-1 transferencias.

### Pantalla de Liquidación

Muestra:
- Resumen financiero global
- Saldos individuales actuales
- Lista de transferencias necesarias: "Maria paga 45,50€ a Juan"

### Confirmar un Pago

Cuando alguien realiza una transferencia:
1. En el panel de pagos óptimos (Dashboard o Liquidación), confirma el pago
2. La app crea automáticamente una transacción de ingreso
3. Se envía un mensaje automático al chat del grupo
4. Los saldos se actualizan para todos

---

## Estadísticas y Análisis

### Toggle Personal / Grupo

- **Mis datos:** solo transacciones en las que el usuario participó
- **Del grupo:** todas las transacciones sin filtrar

### Gráficos Disponibles

| Gráfico | Descripción |
|---|---|
| Sectores | Distribución de gastos por categoría (top 7) |
| Barras | Gastos pagados por cada persona (solo vista grupo) |
| Líneas | Evolución de gastos mes a mes (últimos 6 meses) |

Los gráficos se actualizan en tiempo real con cualquier cambio en las transacciones.

---

## Chat Interno

El chat permite comunicarse con todos los miembros del grupo sin salir de la app.

- **Historial ilimitado:** todos los mensajes se guardan sin límite de tiempo
- **Sincronización en tiempo real:** los mensajes aparecen instantáneamente en todos los dispositivos
- **Mensajes de sistema:** se generan automáticamente cuando se confirman pagos. Ejemplo: "💳 Juan registró un gasto de 85,50€ en Comida"

---

## Configuración y Ajustes

### Perfil Personal

- Cambiar nombre visible
- Cambiar avatar

### Configuración del Grupo (solo admin)

- Ver y copiar el código de invitación
- Renombrar el grupo
- Gestionar categorías (añadir, editar, eliminar; opción de monto sugerido)

### Gestión de Miembros

- **Admin:** puede expulsar a cualquier miembro (excepto a sí mismo)
- **Cualquier miembro:** puede abandonar la sala
  - Si el admin abandona y quedan miembros, el rol se transfiere al siguiente
  - Si el admin es el último, la sala queda sin miembros (los datos históricos se conservan)

### Cambiar de Sala

Botón "Cambiar de sala" para volver al Selector de Sala sin cerrar sesión.

### Cerrar Sesión

Cierra la sesión y limpia todos los datos locales.

---

## Exportación de Datos

Desde la sección Transacciones → botón "Exportar":

| Formato | Contenido | Uso recomendado |
|---------|-----------|----------------|
| Excel (.xlsx) | Tabla con todas las transacciones filtradas | Análisis numérico, tablas dinámicas |
| PDF | Documento profesional con resumen y lista | Reportes, archivado |
| CSV | Datos crudos separados por comas | Importación en otras herramientas |

La exportación respeta los filtros activos en el momento de solicitarla.

---

## Preguntas Frecuentes

**¿Puedo estar en varios grupos a la vez?**  
Sí. Desde la versión 2.0, cada usuario puede pertenecer a múltiples salas. Cambia entre ellas desde Ajustes → "Cambiar de sala" o cerrando sesión.

**¿Qué diferencia hay entre Gasto y Gasto Común?**  
En un Gasto individual, alguien del grupo adelanta el dinero y el resto le debe su parte. En un Gasto Común, el dinero sale del fondo colectivo del grupo (cuenta conjunta, caja común) y nadie acumula crédito personal.

**¿Por qué mi saldo colectivo es diferente al saldo de la suma de los gastos?**  
El saldo colectivo (`totalIngresos − totalGastosComunes`) solo cuenta ingresos y gastos del fondo común. Los gastos individuales son "zero-sum": el crédito del pagador cancela exactamente las deudas de los participantes, así que no modifican el fondo colectivo.

**¿Cómo se calcula exactamente mi saldo?**  
Tu saldo = (ingresos que aportaste) + (gastos individuales que adelantaste - tu propia parte en ellos) - (tu parte en gastos comunes) - (tu parte en gastos pagados por otros).  
El panel "¿Por qué tengo este saldo?" en el Dashboard desglosa esto visualmente.

**¿El algoritmo de liquidación siempre es óptimo?**  
Sí. El algoritmo greedy garantiza matemáticamente el número mínimo de transferencias posible.

**¿Puedo editar una transacción ya registrada?**  
Sí. Los saldos se recalculan automáticamente tras cualquier edición.

**¿Qué pasa si elimino una transacción por error?**  
La eliminación es permanente. Deberás registrarla de nuevo manualmente.

**¿Puedo usar la app sin conexión?**  
No completamente. Se necesita conexión para sincronizar con Firebase. La interfaz puede mostrarse, pero las operaciones de escritura y lectura no funcionarán hasta recuperar la conexión.

**¿La app funciona en móvil?**  
Sí. El diseño es mobile-first. En móvil la navegación aparece en la parte inferior de la pantalla.

---

**Última actualización:** Abril 2026 — Versión 2.1
