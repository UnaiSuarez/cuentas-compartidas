# Manual de Usuario - Cuentas Compartidas

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Aplicación:** Gestión de Gastos Compartidos para Grupos

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestión de Transacciones](#gestión-de-transacciones)
5. [Liquidación de Deudas](#liquidación-de-deudas)
6. [Estadísticas y Análisis](#estadísticas-y-análisis)
7. [Chat Interno](#chat-interno)
8. [Configuración y Ajustes](#configuración-y-ajustes)
9. [Exportación de Datos](#exportación-de-datos)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

Cuentas Compartidas es una aplicación web diseñada para simplificar la gestión financiera de grupos pequeños: familias, pisos compartidos, grupos de amigos, viajes, etc. La aplicación permite registrar gastos compartidos, calcular automáticamente quién debe a quién, y liquidar deudas de la manera más eficiente posible.

### Características Principales

- **Gestión de Grupos:** Crea grupos con código de invitación de 6 caracteres y añade miembros fácilmente
- **Transacciones Compartidas:** Registra gastos e ingresos con split automático entre participantes
- **Cálculo Automático:** Calcula saldos y deudas en tiempo real
- **Liquidación Optimizada:** Genera el número mínimo de transferencias necesarias para saldar todas las deudas
- **Chat Integrado:** Comunícate con los miembros de tu grupo sin salir de la app
- **Análisis y Reportes:** Visualiza estadísticas completas con gráficos de gastos
- **Exportación:** Descarga datos en Excel, PDF o CSV
- **Tema Personalizable:** Alterna entre modo oscuro y claro
- **Responsive:** Funciona perfectamente en móvil, tablet y desktop

---

## Primeros Pasos

### 1. Crear una Cuenta

1. Accede a la aplicación en tu navegador
2. Haz clic en "Crear Cuenta"
3. Completa el formulario con:
   - **Correo electrónico:** Usa un email válido y accesible
   - **Contraseña:** Crea una contraseña segura (mínimo 6 caracteres)
4. Haz clic en "Registrarse"
5. Verifica tu correo electrónico si es necesario

### 2. Configurar tu Perfil

Después de registrarte, se te pedirá que completes tu perfil:

1. **Nombre:** Tu nombre o apodo (será visible para otros miembros)
2. **Avatar:** Elige uno de los 15+ avatares disponibles. Los avatares cambian de expresión según tu saldo:
   - Feliz: cuando tienes saldo positivo
   - Neutral: cuando tu saldo es cero
   - Triste: cuando debes dinero

3. Haz clic en "Continuar"

### 3. Crear o Unirse a un Grupo

#### Crear un Grupo Nuevo

1. En la pantalla de setup, selecciona "Crear Grupo"
2. Asigna un nombre descriptivo (ej: "Piso Compartido", "Grupo Viaje", "Familia")
3. Se generará un **código de invitación** de 6 caracteres automáticamente
4. Comparte este código con otros miembros para que se unan
5. Haz clic en "Crear Grupo"

#### Unirse a un Grupo Existente

1. Si ya tienes un código de invitación, selecciona "Unirse a Grupo"
2. Ingresa el código de 6 caracteres que te proporcionó el creador
3. El sistema validará el código y te añadirá al grupo automáticamente
4. Haz clic en "Unirse"

### 4. Invitar a Miembros

Una vez en el grupo:

1. Accede a "Ajustes" (en la navegación)
2. Verás la sección "Invitar Miembros"
3. Copia el código de invitación (aparece en la parte superior)
4. Comparte el código con otros miembros por WhatsApp, email, etc.
5. Los nuevos miembros pueden unirse usando ese código desde la pantalla de setup

---

## Dashboard Principal

El Dashboard es la pantalla principal donde ves el estado general del grupo.

### Elementos del Dashboard

#### 1. Avatar del Grupo
En la parte superior, verás un avatar animado 3D que representa el estado colectivo:
- Muestra visualmente el estado del grupo
- Se actualiza en tiempo real cuando hay cambios

#### 2. Tarjeta de Saldo Personal
Muestra tu saldo individual:

- **Saldo Positivo (verde):** Le deben dinero. Ej: "+45,50 EUR" significa que otros miembros te deben 45,50 euros en total
- **Saldo Negativo (rojo):** Debes dinero. Ej: "-32,00 EUR" significa que debes 32 euros en total
- **Saldo Cero (gris):** Estás al día, no debes ni te deben dinero

#### 3. Resumen Financiero del Grupo
Muestra estadísticas generales:

- **Total de Gastos:** Suma de todos los gastos registrados
- **Total de Ingresos:** Suma de todos los ingresos registrados
- **Saldo Colectivo:** Diferencia entre ingresos y gastos
- **Número de Miembros Activos:** Personas en el grupo

#### 4. Últimas Transacciones
Aparece un listado de las últimas 3-5 transacciones registradas. Haz clic en "Ver Todas" para ir a la sección completa de transacciones.

### Cómo Interpretar los Saldos

En el Dashboard verás los saldos de todos los miembros del grupo:

```
Juan:  +150,00 EUR  (Le deben dinero)
Maria: -45,50 EUR   (Debe dinero)
Pedro:  +20,00 EUR  (Le deben dinero)
```

Esto significa:
- Juan ha aportado 150 euros más de lo que le corresponde pagar
- Maria debe 45,50 euros
- Pedro ha aportado 20 euros más de lo que le corresponde pagar

---

## Gestión de Transacciones

La sección de Transacciones es donde registras todos los gastos e ingresos compartidos.

### Crear una Transacción

#### Paso 1: Acceder al Formulario
1. Haz clic en "Transacciones" en la navegación
2. Verás el formulario de nueva transacción en la parte superior

#### Paso 2: Completar los Campos Obligatorios

**Tipo de Transacción:**
- **Gasto:** Dinero que se gastó (lo más común)
- **Ingreso:** Dinero que se ingresó (ej: devoluciones, ventas, aportes extras)

**Descripción:**
- Describe brevemente qué es la transacción
- Ejemplos: "Compra de comida", "Alquiler del mes", "Cena en restaurante"
- Máximo 100 caracteres

**Categoría:**
- Selecciona la categoría que mejor describe la transacción
- Categorías disponibles:
  - Comida (restaurantes, mercado, delivery)
  - Transporte (gasolina, autobús, taxi)
  - Casa/Hogar (limpieza, mantenimiento, decoración)
  - Ocio (cine, conciertos, videojuegos)
  - Salud (farmacia, médico, dentista)
  - Compras (ropa, electrónica, etc.)
  - Facturas (electricidad, agua, internet)
  - Viajes (vuelos, hoteles, excursiones)
  - Educación (cursos, libros, material escolar)
  - Ingresos (para categorizar ganancias)
  - Otros (no encaja en otras categorías)

**Monto:**
- Ingresa la cantidad en euros (EUR)
- Soporta decimales: 25.50, 100.99, etc.
- El monto se puede editar después si cometes un error

**Quién Pagó:**
- Selecciona quién pagó el dinero
- Solo puedes seleccionar miembros del grupo
- Esta persona se considera que "adelantó" el dinero

**Quiénes Participan:**
- Selecciona uno o más miembros que se benefician de este gasto
- El monto se dividirá equitativamente entre los seleccionados
- Ejemplo: Si la comida cuesta 30 EUR y participan 3 personas, cada una debe 10 EUR

**Fecha:**
- Selecciona la fecha de la transacción
- Por defecto es la fecha actual
- Puedes seleccionar fechas anteriores para registrar gastos pasados

#### Paso 3: Revisar el Desglose

Antes de guardar, verás un desglose automático:

```
Transacción: Cena en Italiano - 60,00 EUR
Pagó: Juan
Participan: Juan, Maria, Pedro (3 personas)

Desglose:
- Juan adelantó: 60,00 EUR
- Juan debe pagar: 20,00 EUR (su parte)
- Neto Juan: +40,00 EUR (60 - 20)
- Maria debe: 20,00 EUR
- Pedro debe: 20,00 EUR
```

#### Paso 4: Guardar la Transacción
1. Revisa que todo sea correcto
2. Haz clic en "Registrar Transacción"
3. La transacción se guardará inmediatamente
4. El saldo de todos se actualizará en tiempo real

### Ver y Editar Transacciones

#### Lista de Transacciones
En la sección de Transacciones verás un listado completo:

- **Fecha:** Cuándo ocurrió
- **Descripción:** Qué fue
- **Categoría:** Con su ícono
- **Monto:** Cantidad
- **Pagó:** Quién pagó
- **Estado:** Icono que indica tipo (gasto/ingreso)

#### Filtros y Búsqueda

**Por Categoría:**
- Haz clic en una categoría para filtrar solo transacciones de ese tipo
- Haz clic de nuevo para deseleccionar

**Por Persona:**
- Filtra para ver solo transacciones donde una persona participó

**Por Rango de Fechas:**
- Usa el selector de fecha para ver transacciones en un período específico

**Búsqueda:**
- Escribe en el campo de búsqueda para encontrar por descripción
- Busca en tiempo real mientras escribes

#### Editar una Transacción

1. Haz clic en la transacción que deseas editar
2. Los campos se abrirán en modo edición
3. Modifica los campos necesarios
4. Haz clic en "Guardar Cambios"
5. El saldo se recalculará automáticamente

#### Eliminar una Transacción

1. Abre la transacción que deseas eliminar
2. Haz clic en el botón "Eliminar"
3. Confirma la acción en el diálogo que aparece
4. La transacción se eliminará y los saldos se ajustarán

### Ejemplos de Transacciones

#### Ejemplo 1: Compra de Comida Compartida
```
Tipo: Gasto
Descripción: Compra en mercado para la semana
Categoría: Comida
Monto: 85,50 EUR
Quién pagó: Maria
Participan: Maria, Juan, Pedro

Resultado:
- Maria adelantó 85,50 EUR
- Cada persona debe 28,50 EUR
- Maria neto: +57,00 EUR (85,50 - 28,50)
- Juan debe: -28,50 EUR
- Pedro debe: -28,50 EUR
```

#### Ejemplo 2: Pago de Alquiler Compartido
```
Tipo: Gasto
Descripción: Alquiler mes de Abril
Categoría: Casa/Hogar
Monto: 1200,00 EUR
Quién pagó: Juan
Participan: Juan, Maria, Pedro

Resultado:
- Juan adelantó 1200,00 EUR
- Cada persona debe 400,00 EUR
- Juan neto: +800,00 EUR
- Maria debe: -400,00 EUR
- Pedro debe: -400,00 EUR
```

#### Ejemplo 3: Venta de Artículo Grupal
```
Tipo: Ingreso
Descripción: Venta de TV vieja en mercadillo
Categoría: Ingresos
Monto: 150,00 EUR
Quién cobró: Pedro
Participan: Maria, Juan, Pedro

Resultado:
- Se ingresaron 150,00 EUR
- Se distribuyen 50,00 EUR a cada uno
- Todos ganan 50,00 EUR
```

---

## Liquidación de Deudas

La sección de Liquidación es donde calculas las transferencias óptimas para saldar todas las deudas.

### Cómo Funciona el Algoritmo

La aplicación utiliza un algoritmo matemático (similar al de Tricount) que garantiza el número mínimo de transferencias:

1. Calcula el saldo neto de cada persona (aportaciones menos lo que debe)
2. Identifica acreedores (personas a quienes se les debe dinero) y deudores
3. En cada paso, el mayor deudor paga al mayor acreedor la cantidad mínima que satisface a uno de los dos
4. Repite hasta que no quedan deudas

**Ventaja:** Este algoritmo minimiza el número total de transferencias necesarias.

### Pantalla de Liquidación

#### Resumen Actual
Muestra el estado actual del grupo:

```
Resumen Financiero:
- Total de Gastos: 2.500,00 EUR
- Total de Ingresos: 300,00 EUR
- Saldo Colectivo: -2.200,00 EUR

Saldos Individuales:
Juan:   +450,00 EUR (Le deben)
Maria:  -320,00 EUR (Debe)
Pedro:  -130,00 EUR (Debe)
```

#### Pagos Óptimos Calculados
Se muestra el listado de transferencias necesarias para liquidar todo:

```
Transferencias Necesarias:

1. Maria paga 320,00 EUR a Juan
2. Pedro paga 130,00 EUR a Juan

Total: 2 transferencias necesarias
```

### Realizar Liquidaciones Parciales

Si el grupo acuerda liquidar solo una parte:

1. En la pantalla de Liquidación, verás un checkbox "Generar Pago"
2. Selecciona las transacciones que deseas marcar como pagadas
3. Haz clic en "Confirmar Pago"
4. Se generará un movimiento de ingreso que reflejará el pago
5. Los saldos se actualizarán automáticamente

### Registrar un Pago Realizado

Si alguien ya transfirió dinero:

1. Abre la transacción de liquidación correspondiente
2. Marca como completada
3. En el chat puedes confirmar el pago con un mensaje
4. El sistema registra automáticamente los "Mensajes de Pago"

---

## Estadísticas y Análisis

La sección de Estadísticas proporciona un análisis visual completo del grupo.

### Tipos de Gráficos Disponibles

#### 1. Gastos por Categoría (Gráfico de Pie)
- Muestra la distribución de gastos por categoría
- Los colores identifican cada categoría
- Haz clic en una categoría para ver detalles

Ejemplo:
```
Comida:         25%  (625 EUR)
Casa:           35%  (875 EUR)
Transporte:     15%  (375 EUR)
Otros:          25%  (625 EUR)
```

#### 2. Gastos por Persona (Gráfico de Barras)
- Compara cuánto ha pagado cada miembro
- Las barras muestran los montos
- Identifica a los contribuyentes principales

#### 3. Evolución de Gastos Mensual (Gráfico de Líneas)
- Muestra la tendencia de gastos mes a mes
- Identifica si el grupo está gastando más o menos
- Útil para presupuestación

#### 4. Balance Neto por Persona (Gráfico de Barras Horizontales)
- Muestra el saldo final de cada persona
- Verde para positivos (les deben)
- Rojo para negativos (deben)

### Filtros en Estadísticas

**Por Período:**
- Últimos 7 días
- Últimos 30 días
- Este mes
- Este trimestre
- Este año
- Rango personalizado

**Por Categoría:**
- Filtra los gráficos para mostrar solo una categoría

**Por Miembro:**
- Analiza las transacciones de una persona específica

### Exportar Gráficos

1. Cada gráfico tiene un botón "Descargar"
2. Se descargará como imagen PNG
3. Puedes compartirla o incluirla en reportes

---

## Chat Interno

El Chat Interno permite la comunicación completa con los miembros de tu grupo.

### Características del Chat

- **Historial Ilimitado:** Todo el historial se guarda sin límite de mensajes
- **Sincronización Realtime:** Los mensajes aparecen al instante en todos los dispositivos
- **Notificaciones:** Recibe notificaciones de nuevos mensajes (dependiendo de tu navegador)
- **Timestamps:** Cada mensaje muestra hora y fecha
- **Mensajes del Sistema:** Se registran automáticamente las liquidaciones confirmadas

### Usar el Chat

#### Enviar un Mensaje

1. Accede a la sección "Chat"
2. En el campo de entrada (parte inferior), escribe tu mensaje
3. Haz clic en el botón "Enviar" o presiona Enter
4. El mensaje aparecerá al instante para todos

#### Elementos de los Mensajes

```
Juan - 14:35, 25 abril
Hola! Ya compre los ingredientes para la cena

Maria - 14:42, 25 abril
Perfecto! Cuanto fue el gasto?

Sistema - 14:50, 25 abril
Juan confirmo pago: Maria paga 50,00 EUR a Juan
```

#### Características Especiales

**Mensajes de Sistema:**
- Se generan automáticamente cuando se confirman pagos
- Aparecen con icono de "Sistema" o en un estilo diferente
- Ayudan a mantener el registro de quién pagó a quién

**Buscar en el Chat:**
- Usa la barra de búsqueda para encontrar mensajes antiguos
- Busca por palabra clave o nombre de usuario

### Etiqueta en el Chat

- Sé respetuoso y claro
- Confirma los pagos cuando los realices
- Comunica cambios de planes que afecten comparticiones
- Evita discusiones que no sean relevantes para el grupo

---

## Configuración y Ajustes

La sección de Ajustes (Configuración) permite personalizar el grupo y tu perfil.

### Sección de Perfil

#### Tu Nombre
- Puedes cambiar tu nombre o apodo en cualquier momento
- Será visible para otros miembros del grupo
- El cambio se refleja inmediatamente

#### Tu Avatar
- Elige entre 15+ avatares disponibles
- El avatar cambiarán de expresión según tu saldo
- Útil para una identificación visual

#### Tu Email
- Muestra tu correo registrado
- Es lo que usas para login
- No se puede cambiar desde la app (contacta soporte si es necesario)

### Sección del Grupo

#### Nombre del Grupo
- Edita el nombre en cualquier momento
- Ayuda a identificar el grupo

#### Código de Invitación
- Código único de 6 caracteres
- Comparte este código con nuevos miembros
- Permanece igual a menos que lo regeneres

#### Regenerar Código
- Crea un nuevo código de invitación
- El código anterior deja de funcionar
- Útil por seguridad si sospechas que fue compartido inadecuadamente

#### Miembros del Grupo
- Listado de todos los miembros activos
- Muestra el saldo de cada uno
- Identifica roles si están implementados

### Sección de Preferencias

#### Tema (Dark/Light Mode)
1. Haz clic en el icono de sol/luna (según el tema actual)
2. La interfaz cambia inmediatamente
3. Tu preferencia se guarda automáticamente
4. Se recuerda la próxima vez que accedas

#### Notificaciones
- Configura si quieres recibir notificaciones del navegador
- Activa/desactiva según tu preferencia

#### Idioma
- Actualmente la aplicación está en español
- Las fechas se muestran en formato español (dd/mm/yyyy)

### Seguridad

#### Cambiar Contraseña
1. En la sección de Seguridad, haz clic en "Cambiar Contraseña"
2. Ingresa tu contraseña actual
3. Introduce la nueva contraseña (mínimo 6 caracteres)
4. Confirma la nueva contraseña
5. Haz clic en "Guardar Cambios"

#### Logout
1. Haz clic en "Cerrar Sesión"
2. Se te desconectará de la aplicación
3. Necesitarás ingresar tu email y contraseña nuevamente para volver a entrar

### Abandonar el Grupo

Si deseas salir del grupo:

1. En la sección del Grupo, haz clic en "Abandonar Grupo"
2. Se te pedirá confirmación
3. Una vez confirmado, se te eliminará del grupo
4. No podrás ver ni acceder a los datos del grupo
5. Se te llevará a la pantalla de inicio

---

## Exportación de Datos

La aplicación permite exportar los datos del grupo en varios formatos.

### Dónde Exportar

La opción de exportar está disponible en:
- Sección de Transacciones
- Sección de Estadísticas
- Sección de Ajustes

### Formatos Disponibles

#### 1. Excel (.xlsx)
- Formato: Archivo Excel compatible
- Contenido: Lista de todas las transacciones con:
  - Fecha
  - Descripción
  - Categoría
  - Monto
  - Quién pagó
  - Participantes
  - Saldo resultante
- Uso: Análisis en Excel, presupuestación, auditoría
- Cómo exportar:
  1. Abre la sección de Transacciones
  2. Haz clic en "Exportar a Excel"
  3. El archivo se descargará automáticamente

#### 2. PDF
- Formato: Documento PDF profesional
- Contenido:
  - Portada con nombre del grupo
  - Resumen financiero
  - Saldos finales
  - Lista de transacciones
  - Gráficos de resumen
  - Recomendaciones de pago
- Uso: Reportes oficiales, presentaciones, archivado
- Cómo exportar:
  1. Abre las Estadísticas o la sección que deseas exportar
  2. Haz clic en "Exportar a PDF"
  3. Se abrirá una vista previa
  4. Haz clic en "Descargar PDF"

#### 3. CSV
- Formato: Valores separados por comas
- Contenido: Datos crudos de transacciones
- Uso: Importación en otros sistemas, análisis de datos
- Cómo exportar:
  1. Abre Transacciones
  2. Haz clic en "Exportar a CSV"
  3. El archivo se descargará

### Ejemplo de Exportación

**Nombre Archivo:** grupo_cuentas_25_04_2026.xlsx

**Contenido Excel:**
```
Fecha          | Descripción                | Categoría    | Monto   | Pagó   | Participan
2026-04-20    | Compra en mercado         | Comida      | 85,50  | Maria  | Maria, Juan, Pedro
2026-04-21    | Alquiler apartamento      | Casa        | 1200,00| Juan   | Juan, Maria, Pedro
2026-04-22    | Gasolina                  | Transporte  | 45,00  | Pedro  | Pedro, Juan
2026-04-23    | Cena en restaurante       | Comida      | 120,00 | Juan   | Juan, Maria, Pedro
```

---

## Preguntas Frecuentes

### General

**P: ¿Es segura la aplicación?**
R: Sí. Utilizamos Firebase de Google, que encripta todos los datos en tránsito. Las contraseñas se almacenan de forma segura usando estándares de la industria. Todos los datos se protegen con reglas de seguridad de Firestore que garantizan que solo los miembros del grupo puedan acceder a sus datos.

**P: ¿Qué pasa si olvido mi contraseña?**
R: En la pantalla de login, haz clic en "Olvidé mi contraseña". Ingresa tu email y recibirás un enlace para restablecerla.

**P: ¿Puedo usar la app sin conexión a internet?**
R: No completamente. Necesitas conexión para sincronizar datos con el servidor. Sin embargo, la aplicación está optimizada para conexiones lentas o intermitentes.

**P: ¿Cuántos grupos puedo crear?**
R: Técnicamente no hay límite, pero normalmente solo necesitarás uno. Si necesitas estar en múltiples grupos, puedes cambiar entre ellos desde la sección de Ajustes.

### Transacciones

**P: ¿Puedo editar una transacción ya registrada?**
R: Sí. Abre la transacción en la lista y haz clic en el botón de edición. Modifica lo necesario y guarda. Los saldos se recalcularán automáticamente.

**P: ¿Qué pasa si me equivoco al registrar un gasto?**
R: Puedes editar cualquier transacción o eliminarla completamente. El sistema recalculará los saldos automáticamente.

**P: ¿Qué diferencia hay entre "participan" y "pagó"?**
R: "Pagó" es quien adelantó el dinero. "Participan" son las personas que se benefician del gasto. El sistema automáticamente calcula quién debe a quién.

**P: ¿Puedo registrar un gasto en el que solo yo participé?**
R: Sí, pero no tiene sentido ya que no hay deuda que calcular. Esos gastos serán ignorados en el cálculo de liquidaciones.

**P: ¿Qué pasa con los gastos históricos?**
R: Puedes registrar gastos de hace meses. Simplemente cambia la fecha al registrar. Serán incluidos en los cálculos.

### Saldos y Liquidación

**P: ¿Cómo se calcula exactamente mi saldo?**
R: Saldo Neto = (Todo lo que pagaste) MENOS (Tu parte de todos los gastos)

Ejemplo:
- Pagaste 500 EUR en comida para 5 personas (100 EUR cada una)
- Tu parte es 100 EUR
- Tu aporte neto: 500 - 100 = 400 EUR (te deben)

**P: ¿Por qué cambia mi saldo constantemente?**
R: Cada vez que se añade o edita una transacción, los saldos se recalculan automáticamente. Esto es normal y garantiza que siempre sean precisos.

**P: ¿Qué significa "saldo colectivo negativo"?**
R: Significa que el grupo ha gastado más dinero del que ha ingresado. Es común en gastos compartidos. No es un problema, solo un estado temporal.

**P: ¿El algoritmo de liquidación siempre da la respuesta óptima?**
R: Sí. Utiliza un algoritmo greedy probado que garantiza el número mínimo de transferencias. No es posible tener menos transferencias que las sugeridas.

### Chat

**P: ¿Aparecerá mi historial de chat anterior?**
R: Sí. Todo el historial se guarda sin límite. Puedes desplazarte hacia arriba para ver mensajes antiguos.

**P: ¿Quién puede ver el chat?**
R: Solo los miembros del grupo activo pueden ver el chat. Una vez salgas del grupo, no tendrás acceso.

**P: ¿Puedo eliminar mensajes?**
R: Actualmente no hay opción para eliminar mensajes individuales. Contacta al administrador si necesitas eliminar un mensaje.

### Exportación

**P: ¿Cuál es el mejor formato para exportar?**
R: Depende de tu uso:
- **Excel:** Si necesitas análisis numéricos
- **PDF:** Para reportes profesionales y archivado
- **CSV:** Para importación en otros sistemas

**P: ¿Los gráficos se incluyen en la exportación?**
R: Los gráficos se incluyen en la exportación a PDF. En Excel solo tendrás los datos numéricos.

**P: ¿Puedo exportar solo un período específico?**
R: Actualmente se exporta todo. Puedes usar los filtros en la interfaz antes de exportar para ver el período que deseas.

### Problemas Técnicos

**P: La app está muy lenta. ¿Qué puedo hacer?**
R: Intenta:
1. Refrescar la página (F5 o Ctrl+R)
2. Limpiar el cache del navegador
3. Cambiar a otro navegador
4. Usa una conexión a internet diferente

**P: Los datos no se sincronizan entre mis dispositivos**
R: Asegúrate de estar usando la misma cuenta en ambos dispositivos. Los datos se sincronizaban automáticamente en tiempo real. Si persiste, intenta logout y login de nuevo.

**P: No puedo añadir nuevos miembros**
R: Verifica que:
1. El código de invitación es correcto
2. No esté expirado (regenera si es necesario)
3. El nuevo usuario haya completado su perfil

**P: Se muestra un error de autenticación**
R: Intenta:
1. Revisar que tu email y contraseña sean correctos
2. Usar navegación privada/incógnito
3. Limpiar cookies del navegador
4. Contactar al soporte

---

## Contacto y Soporte

Si tienes problemas o sugerencias:

- **Email:** soporte@cuentascompartidas.app
- **Reportar Bug:** Abre un issue en el repositorio GitHub
- **Sugerencias:** Envía tus ideas por email

---

**Última actualización:** 26 de abril de 2026
