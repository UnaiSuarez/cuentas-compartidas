import PDFDocument from 'pdfkit';
import fs from 'fs';

const W = 595.28;
const H = 841.89;
const ML = 60;
const MR = 60;
const MT = 60;
const MB = 60;
const TW = W - ML - MR;

const createDoc = (file) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false });
  doc.pipe(fs.createWriteStream(file));
  return doc;
};

const addFooters = (doc, title) => {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#666666');
    doc.text(`Cuentas Compartidas - ${title}`, ML, H - 30, { width: TW / 2 });
    doc.text(`Pagina ${i + 1} de ${range.count}`, ML + TW / 2, H - 30, { width: TW / 2, align: 'right' });
    doc.moveTo(ML, H - 38).lineTo(W - MR, H - 38).stroke('#CCCCCC');
  }
};

const newPage = (doc) => {
  doc.addPage({ size: 'A4', margin: 0 });
  return MT;
};

const h1 = (doc, y, text) => {
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#1a1a2e');
  doc.rect(ML, y, TW, 26).fill('#e8ecf5');
  doc.fillColor('#1a1a2e').text(text, ML + 8, y + 7, { width: TW - 16 });
  return y + 36;
};

const h2 = (doc, y, text) => {
  if (y > H - MB - 80) { y = newPage(doc); }
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a1a2e');
  doc.text(text, ML, y, { width: TW });
  doc.moveTo(ML, y + 16).lineTo(W - MR, y + 16).stroke('#3a5a9b');
  return y + 22;
};

const h3 = (doc, y, text) => {
  if (y > H - MB - 60) { y = newPage(doc); }
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#2c3e6e');
  doc.text(text, ML, y, { width: TW });
  return y + 16;
};

const p = (doc, y, text, indent = 0) => {
  const x = ML + indent;
  const w = TW - indent;
  doc.font('Helvetica').fontSize(10).fillColor('#222222');
  const height = doc.heightOfString(text, { width: w });
  if (y + height > H - MB - 20) { y = newPage(doc); }
  doc.text(text, x, y, { width: w, align: 'justify', lineGap: 2 });
  return y + height + 6;
};

const bullet = (doc, y, text, lvl = 1) => {
  const indent = lvl === 1 ? 16 : 30;
  const sym = lvl === 1 ? '-' : '·';
  const x = ML + indent;
  const w = TW - indent - 8;
  doc.font('Helvetica').fontSize(10).fillColor('#222222');
  const height = doc.heightOfString(text, { width: w });
  if (y + height > H - MB - 20) { y = newPage(doc); }
  doc.text(sym, ML + 4, y, { width: 12 });
  doc.text(text, x, y, { width: w, lineGap: 2 });
  return y + height + 4;
};

const sp = (y, n = 1) => y + n * 10;

// Bloque de codigo
const code = (doc, y, lines) => {
  const text = lines.join('\n');
  const height = doc.heightOfString(text, { width: TW - 16, font: 'Courier', size: 8.5 });
  const blockH = height + 16;
  if (y + blockH > H - MB - 20) { y = newPage(doc); }
  doc.rect(ML, y, TW, blockH).fill('#f0f0f5').stroke('#c0c8e0');
  doc.font('Courier').fontSize(8.5).fillColor('#1a1a2e');
  doc.text(text, ML + 8, y + 8, { width: TW - 16, lineGap: 1.5 });
  return y + blockH + 8;
};

// Tabla simple de 2 columnas
const table2 = (doc, y, headers, rows) => {
  const col1 = 170, col2 = TW - col1;
  let rowH = 20;

  if (y + rowH > H - MB - 20) { y = newPage(doc); }
  // Cabecera
  doc.rect(ML, y, col1, rowH).fill('#2c3e6e');
  doc.rect(ML + col1, y, col2, rowH).fill('#2c3e6e');
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#ffffff');
  doc.text(headers[0], ML + 5, y + 6, { width: col1 - 10 });
  doc.text(headers[1], ML + col1 + 5, y + 6, { width: col2 - 10 });
  y += rowH;

  rows.forEach((row, idx) => {
    const h = Math.max(doc.heightOfString(row[0], { width: col1 - 10 }),
                       doc.heightOfString(row[1], { width: col2 - 10 })) + 10;
    if (y + h > H - MB - 20) { y = newPage(doc); }
    const bg = idx % 2 === 0 ? '#f5f7fc' : '#ffffff';
    doc.rect(ML, y, col1, h).fill(bg).stroke('#c0c8e0');
    doc.rect(ML + col1, y, col2, h).fill(bg).stroke('#c0c8e0');
    doc.font(idx === 0 ? 'Helvetica' : 'Helvetica').fontSize(9.5).fillColor('#222222');
    doc.text(row[0], ML + 5, y + 5, { width: col1 - 10 });
    doc.text(row[1], ML + col1 + 5, y + 5, { width: col2 - 10 });
    y += h;
  });
  return y + 8;
};

// Tabla de requisitos tecnico
const reqTable = (doc, y, id, tipo, prio, desc) => {
  if (y > H - MB - 100) { y = newPage(doc); }
  const col1 = 120, col2 = 95, col3 = TW - col1 - col2;
  const rowH = 22;

  doc.rect(ML, y, col1, rowH).fill('#2c3e6e');
  doc.rect(ML + col1, y, col2, rowH).fill('#2c3e6e');
  doc.rect(ML + col1 + col2, y, col3, rowH).fill('#2c3e6e');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.text('Identificador', ML + 4, y + 7, { width: col1 - 8 });
  doc.text('Tipo', ML + col1 + 4, y + 7, { width: col2 - 8 });
  doc.text('Prioridad', ML + col1 + col2 + 4, y + 7, { width: col3 - 8 });
  y += rowH;

  doc.rect(ML, y, col1, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.rect(ML + col1, y, col2, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.rect(ML + col1 + col2, y, col3, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a1a2e');
  doc.text(id, ML + 4, y + 7, { width: col1 - 8 });
  doc.text(tipo, ML + col1 + 4, y + 7, { width: col2 - 8 });
  doc.text(prio, ML + col1 + col2 + 4, y + 7, { width: col3 - 8 });
  y += rowH;

  const dh = Math.max(doc.heightOfString(desc, { width: TW - 8 }) + 12, 32);
  if (y + dh > H - MB - 20) { y = newPage(doc); }
  doc.rect(ML, y, TW, dh).fill('#f5f7fc').stroke('#aab5d5');
  doc.font('Helvetica').fontSize(9).fillColor('#222222');
  doc.text(desc, ML + 6, y + 6, { width: TW - 12, lineGap: 1.5 });
  return y + dh + 10;
};

// =========================================================
// DOCUMENTO TECNICO
// =========================================================
const buildTecnico = async () => {
  const doc = createDoc('DOCUMENTO_TECNICO.pdf');

  // ---- PORTADA ----
  doc.addPage({ size: 'A4', margin: 0 });
  doc.rect(0, 0, W, 200).fill('#1a1a2e');
  doc.rect(0, 200, W, 6).fill('#3a5a9b');

  doc.font('Helvetica-Bold').fontSize(30).fillColor('#ffffff');
  doc.text('CUENTAS COMPARTIDAS', ML, 55, { width: TW, align: 'center' });
  doc.font('Helvetica').fontSize(16).fillColor('#c0cce8');
  doc.text('Aplicacion de Gestion de Gastos Compartidos', ML, 100, { width: TW, align: 'center' });

  doc.rect(0, 206, W, H - 206).fill('#f5f7fc');

  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a1a2e');
  doc.text('Documento Tecnico', ML, 240, { width: TW, align: 'center' });
  doc.font('Helvetica').fontSize(12).fillColor('#444444');
  doc.text('Arquitectura, diseno e implementacion del sistema', ML, 275, { width: TW, align: 'center' });

  doc.moveTo(ML + 80, 310).lineTo(W - MR - 80, 310).stroke('#3a5a9b');

  const infoY = 330;
  const infoItems = [
    ['Producto:', 'Cuentas Compartidas'],
    ['Tipo de documento:', 'Especificacion Tecnica'],
    ['Version:', '2.1'],
    ['Fecha de emision:', 'Abril de 2026'],
    ['Tecnologia principal:', 'React 18 + Firebase + Tailwind CSS'],
    ['Idioma:', 'Espanol'],
  ];
  infoItems.forEach(([k, v], i) => {
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#2c3e6e');
    doc.text(k, ML + 40, infoY + i * 28, { width: 200 });
    doc.font('Helvetica').fontSize(11).fillColor('#222222');
    doc.text(v, ML + 245, infoY + i * 28, { width: 250 });
  });

  doc.font('Helvetica').fontSize(9).fillColor('#888888');
  doc.text('Documento generado para la asignatura de Desarrollo de Aplicaciones Web', ML, H - 80, { width: TW, align: 'center' });
  doc.text('CPIFP Los Enlaces - Curso 2025/2026', ML, H - 65, { width: TW, align: 'center' });

  // ---- TABLA DE CONTENIDOS ----
  let y = newPage(doc);
  y = h1(doc, y, 'Tabla de Contenidos');
  y = sp(y);

  const toc = [
    ['1', 'Introduccion y Vision General', '3'],
    ['1.1', 'Descripcion del proyecto', '3'],
    ['1.2', 'Objetivos tecnicos', '3'],
    ['1.3', 'Alcance del sistema', '3'],
    ['2', 'Arquitectura del Sistema', '4'],
    ['2.1', 'Arquitectura en capas', '4'],
    ['2.2', 'Flujo de datos', '4'],
    ['2.3', 'Diagrama de componentes', '5'],
    ['3', 'Stack Tecnologico', '6'],
    ['3.1', 'Framework frontend', '6'],
    ['3.2', 'Backend y base de datos', '6'],
    ['3.3', 'Librerias de apoyo', '6'],
    ['3.4', 'Herramientas de desarrollo', '7'],
    ['4', 'Estructura del Proyecto', '8'],
    ['4.1', 'Organizacion de directorios', '8'],
    ['4.2', 'Descripcion de modulos', '8'],
    ['5', 'Modelo de Datos', '9'],
    ['5.1', 'Diseno de la base de datos Firestore', '9'],
    ['5.2', 'Coleccion users', '9'],
    ['5.3', 'Coleccion groups', '10'],
    ['5.4', 'Subcoleccion transactions', '10'],
    ['5.5', 'Subcoleccion messages', '11'],
    ['5.6', 'Subcoleccion payments', '11'],
    ['6', 'Componentes Principales', '12'],
    ['6.1', 'App.jsx - Raiz y enrutamiento', '12'],
    ['6.2', 'AppContext.jsx - Estado global', '12'],
    ['6.3', 'AuthGate.jsx - Autenticacion', '13'],
    ['6.4', 'Dashboard.jsx', '13'],
    ['6.5', 'TransactionForm y TransactionList', '14'],
    ['6.6', 'SettlementPage', '14'],
    ['6.7', 'StatisticsPage', '14'],
    ['6.8', 'ChatWindow', '15'],
    ['7', 'Hooks Personalizados', '16'],
    ['7.1', 'useAuth', '16'],
    ['7.2', 'useTransactions', '16'],
    ['7.3', 'useChat', '17'],
    ['7.4', 'useSettlement', '17'],
    ['7.5', 'useUsers', '17'],
    ['8', 'Flujos de Autenticacion', '18'],
    ['8.1', 'Flujo de registro completo', '18'],
    ['8.2', 'Flujo de login', '19'],
    ['8.3', 'Flujo de logout', '19'],
    ['9', 'Algoritmos Clave', '20'],
    ['9.1', 'calculateBalances', '20'],
    ['9.2', 'calculateOptimalPayments', '21'],
    ['9.3', 'Analisis de complejidad', '22'],
    ['10', 'Integracion Firebase', '23'],
    ['10.1', 'Inicializacion', '23'],
    ['10.2', 'Listeners en tiempo real', '23'],
    ['10.3', 'Reglas de seguridad', '24'],
    ['11', 'Seguridad', '25'],
    ['12', 'Optimizaciones y Performance', '26'],
    ['13', 'Requisitos Tecnicos', '27'],
    ['14', 'Deployment', '28'],
    ['15', 'Guia de Desarrollo', '29'],
  ];

  toc.forEach(([num, title, page]) => {
    if (y > H - MB - 14) { y = newPage(doc); }
    const isMain = num.split('.').length === 1;
    doc.font(isMain ? 'Helvetica-Bold' : 'Helvetica').fontSize(isMain ? 10.5 : 10).fillColor('#222222');
    const indent = isMain ? ML : ML + 18;
    doc.text(`${num}. ${title}`, indent, y, { width: TW - 50 - (indent - ML) });
    doc.text(page, ML + TW - 20, y, { width: 20, align: 'right' });
    if (isMain) {
      doc.moveTo(indent + doc.widthOfString(`${num}. ${title}`) + 4, y + 8)
        .lineTo(ML + TW - 22, y + 8).stroke('#cccccc');
    }
    y += isMain ? 14 : 12;
  });

  // ---- CAPITULO 1: INTRODUCCION ----
  y = newPage(doc);
  y = h1(doc, y, '1. Introduccion y Vision General');
  y = sp(y);

  y = h2(doc, y, '1.1 Descripcion del Proyecto');
  y = p(doc, y, 'Cuentas Compartidas es una aplicacion web progresiva (PWA, Progressive Web Application) desarrollada para facilitar la gestion de gastos e ingresos compartidos en grupos de personas. La aplicacion permite a grupos de entre 2 y 15 personas registrar transacciones economicas, calcular automaticamente los saldos individuales y colectivos, determinar el numero minimo de transferencias necesarias para saldar todas las deudas y comunicarse mediante un chat integrado.');
  y = sp(y);
  y = p(doc, y, 'El proyecto ha sido desarrollado como aplicacion web con arquitectura cliente pesado (thick client), donde toda la logica de presentacion y gran parte de la logica de negocio se ejecuta en el navegador del usuario. La capa de persistencia y sincronizacion en tiempo real se delega a Firebase, una plataforma de Backend-as-a-Service (BaaS) de Google que proporciona autenticacion, base de datos en tiempo real y reglas de seguridad.');
  y = sp(y, 2);

  y = h2(doc, y, '1.2 Objetivos Tecnicos');
  y = bullet(doc, y, 'Precision en calculos financieros: manejar correctamente decimales y redondeos para que los saldos calculados sean siempre exactos.');
  y = bullet(doc, y, 'Sincronizacion en tiempo real: cualquier cambio realizado por un miembro del grupo debe reflejarse instantaneamente en todos los dispositivos conectados.');
  y = bullet(doc, y, 'Experiencia de usuario responsiva: la aplicacion debe funcionar correctamente en dispositivos moviles, tabletas y ordenadores de escritorio.');
  y = bullet(doc, y, 'Seguridad por diseno: autenticacion y autorizacion en cada nivel de la aplicacion, desde el cliente hasta las reglas de la base de datos.');
  y = bullet(doc, y, 'Performance: bundle de JavaScript reducido mediante code splitting, carga diferida de componentes y optimizacion de renderizados.');
  y = bullet(doc, y, 'Escalabilidad: la arquitectura debe soportar cientos de transacciones por grupo sin degradacion de performance perceptible.');
  y = sp(y, 2);

  y = h2(doc, y, '1.3 Alcance del Sistema');
  y = p(doc, y, 'El sistema cubre los siguientes casos de uso principales: registro y autenticacion de usuarios; creacion y gestion de grupos con codigos de invitacion; registro de transacciones de tipo gasto e ingreso con split automatico entre participantes; calculo en tiempo real de saldos individuales y colectivos; generacion del conjunto minimo de pagos para liquidar deudas usando algoritmo greedy; chat en tiempo real con historial ilimitado; visualizacion de estadisticas con graficos; y exportacion de datos en formatos Excel, PDF y CSV.');

  // ---- CAPITULO 2: ARQUITECTURA ----
  y = newPage(doc);
  y = h1(doc, y, '2. Arquitectura del Sistema');
  y = sp(y);

  y = h2(doc, y, '2.1 Arquitectura en Capas');
  y = p(doc, y, 'La aplicacion sigue una arquitectura en capas que separa responsabilidades y facilita el mantenimiento y la escalabilidad. Las capas son:');
  y = sp(y);

  y = h3(doc, y, 'Capa 1 - Presentacion (UI)');
  y = p(doc, y, 'Compuesta por los componentes React que renderizan la interfaz de usuario. Esta capa es puramente visual y no contiene logica de negocio. Utiliza Tailwind CSS para los estilos y Framer Motion para las animaciones. Los componentes se organizan por funcionalidad (Auth, Dashboard, Transactions, Settlement, Statistics, Chat, Settings).');
  y = sp(y);

  y = h3(doc, y, 'Capa 2 - Gestion de Estado (Context)');
  y = p(doc, y, 'Implementada mediante React Context API. El componente AppContext centraliza todo el estado global de la aplicacion: datos de autenticacion, datos del grupo (miembros, transacciones, mensajes, pagos), preferencias de UI. Esta capa es responsable de la suscripcion a los listeners de Firestore y de la propagacion de cambios a todos los componentes interesados.');
  y = sp(y);

  y = h3(doc, y, 'Capa 3 - Logica de Negocio (Hooks y Utils)');
  y = p(doc, y, 'Implementada mediante hooks personalizados de React (useAuth, useTransactions, useChat, useSettlement, useUsers) y funciones utilitarias puras (calculateSettlement.js, exporters.js, formatters.js). Esta capa contiene las reglas del negocio: validaciones, calculos de saldos, algoritmo de liquidacion y logica de exportacion.');
  y = sp(y);

  y = h3(doc, y, 'Capa 4 - Acceso a Datos (Firebase SDK)');
  y = p(doc, y, 'Capa de abstraccion que encapsula todas las llamadas al Firebase SDK. Las funciones de esta capa se utilizan desde los hooks y el contexto para leer y escribir datos en Firestore, gestionar sesiones con Firebase Auth y suscribirse a cambios en tiempo real mediante onSnapshot.');
  y = sp(y);

  y = h3(doc, y, 'Capa 5 - Infraestructura (Firebase Cloud)');
  y = p(doc, y, 'Capa fisica gestionada por Google Firebase. Incluye Firebase Authentication para la gestion de identidades, Cloud Firestore como base de datos NoSQL distribuida, las reglas de seguridad de Firestore que se ejecutan en el servidor y los indices necesarios para las consultas ordenadas.');
  y = sp(y, 2);

  y = h2(doc, y, '2.2 Flujo de Datos');
  y = p(doc, y, 'El flujo de datos en la aplicacion sigue el patron unidireccional de React. Cuando el usuario realiza una accion (por ejemplo, registrar una transaccion):');
  y = sp(y);
  y = bullet(doc, y, 'El componente de UI captura el evento (click, submit, etc.)');
  y = bullet(doc, y, 'Llama a la funcion correspondiente del hook (useTransactions.createTransaction)');
  y = bullet(doc, y, 'El hook valida los datos y llama a la funcion de Firebase (addDoc)');
  y = bullet(doc, y, 'Firebase procesa la escritura y actualiza la base de datos en la nube');
  y = bullet(doc, y, 'El listener de Firestore (onSnapshot) detecta el cambio y ejecuta su callback');
  y = bullet(doc, y, 'El callback actualiza el estado en AppContext (setTransactions)');
  y = bullet(doc, y, 'React re-renderiza todos los componentes que consumen ese estado');
  y = bullet(doc, y, 'La UI refleja el nuevo estado con los saldos actualizados');
  y = sp(y);
  y = p(doc, y, 'Este flujo ocurre en todos los dispositivos conectados al mismo grupo simultaneamente, garantizando la consistencia de datos en tiempo real.');
  y = sp(y, 2);

  y = h2(doc, y, '2.3 Diagrama de Componentes');
  y = p(doc, y, 'La estructura de componentes y sus dependencias es la siguiente:');
  y = sp(y);
  y = code(doc, y, [
    'main.jsx',
    '  AppProvider (AppContext.jsx)',
    '    App.jsx',
    '      AuthGate.jsx  (paso 1+2: auth + perfil)',
    '        SignIn.jsx / SignUp.jsx',
    '        ProfileSetup.jsx',
    '      RoomSelector.jsx  (sin sala activa)',
    '        GroupSetup.jsx  (crear / unirse)',
    '      Navbar.jsx + Routes:',
    '        /              -> Dashboard.jsx + BalanceExplainer.jsx',
    '        /transacciones -> TransactionList.jsx + TransactionForm.jsx',
    '        /liquidacion   -> SettlementPage.jsx',
    '        /estadisticas  -> StatisticsPage.jsx',
    '        /chat          -> ChatWindow.jsx',
    '        /ajustes       -> SettingsPage.jsx',
  ]);

  // ---- CAPITULO 3: STACK ----
  y = newPage(doc);
  y = h1(doc, y, '3. Stack Tecnologico');
  y = sp(y);

  y = h2(doc, y, '3.1 Framework Frontend');
  y = sp(y);
  y = table2(doc, y, ['Tecnologia / Version', 'Justificacion de la eleccion'],
    [
      ['React 19.2.5', 'Framework de UI de componentes. Version 19 incluye mejoras en el renderizado concurrente y el manejo de Suspense. Ecosistema maduro con amplia comunidad.'],
      ['Vite 8.0.10', 'Build tool de nueva generacion con servidor de desarrollo ultrarapido (HMR instantaneo). Configuracion minima. Produce bundles optimizados.'],
      ['Tailwind CSS 4.2.4', 'Framework de estilos utility-first. Produce CSS minimo (solo las clases usadas). Facilita el diseno responsivo y consistente.'],
      ['React Router 7.14.2', 'Enrutamiento del lado del cliente para SPA. Soporta lazy loading de rutas y navegacion programatica.'],
      ['Framer Motion 12.38.0', 'Libreria de animaciones declarativas para React. Permite transiciones fluidas con poca configuracion.'],
      ['Lucide React 1.9.0', 'Conjunto de mas de 1000 iconos SVG optimizados. Permite importar solo los iconos necesarios (tree-shaking).'],
    ]
  );

  y = h2(doc, y, '3.2 Backend y Base de Datos');
  y = sp(y);
  y = table2(doc, y, ['Servicio', 'Rol en la aplicacion'],
    [
      ['Firebase Authentication', 'Gestion de identidades de usuario. Soporta Email/Contrasena. Proporciona tokens JWT para autorizar peticiones a Firestore.'],
      ['Cloud Firestore', 'Base de datos NoSQL orientada a documentos. Soporte nativo de listeners en tiempo real (onSnapshot). Subcollecciones para organizar datos jerarquicamente.'],
      ['Firebase Security Rules', 'Motor de autorizacion que se ejecuta en el servidor de Firebase. Define que usuarios pueden leer o escribir cada documento de Firestore.'],
    ]
  );

  y = h2(doc, y, '3.3 Librerias de Apoyo');
  y = sp(y);
  y = table2(doc, y, ['Libreria / Version', 'Uso en el proyecto'],
    [
      ['Recharts 3.8.1', 'Graficos responsivos: PieChart, BarChart, LineChart. Se integra directamente con JSX de React y acepta arrays de datos directamente.'],
      ['date-fns 4.1.0', 'Manipulacion y formateo de fechas con locale espanol. Funciones puras que facilitan comparaciones y formateos.'],
      ['jsPDF 4.2.1', 'Generacion de documentos PDF directamente en el navegador del usuario sin necesidad de servidor.'],
      ['jspdf-autotable 5.0.7', 'Plugin para jsPDF que facilita la creacion de tablas en los documentos PDF generados.'],
      ['xlsx 0.18.5', 'Lectura y escritura de archivos Excel (.xlsx). Permite exportar datos tabulares sin necesidad de servidor.'],
      ['html2canvas', 'Captura de elementos HTML como imagenes. Se usa para incluir graficos en las exportaciones PDF.'],
      ['zustand 5.0.12', 'Libreria de estado global alternativa al Context de React. Instalada pero el estado se gestiona principalmente con Context.'],
    ]
  );

  y = h2(doc, y, '3.4 Herramientas de Desarrollo');
  y = sp(y);
  y = table2(doc, y, ['Herramienta', 'Proposito'],
    [
      ['ESLint 10.2.1', 'Linter de JavaScript/JSX. Detecta errores de codigo, malas practicas y mantiene la consistencia del estilo.'],
      ['eslint-plugin-react-hooks', 'Reglas especificas para verificar el uso correcto de los hooks de React.'],
      ['Babel (via Vite)', 'Transpilador de JavaScript moderno (JSX, ES2024) a codigo compatible con navegadores actuales.'],
      ['Node.js 22.x', 'Runtime de JavaScript para el entorno de desarrollo. Necesario para ejecutar Vite y npm.'],
      ['pdfkit', 'Libreria Node.js para generacion de PDFs en scripts de Node (usada en la generacion de esta documentacion).'],
    ]
  );

  // ---- CAPITULO 4: ESTRUCTURA ----
  y = newPage(doc);
  y = h1(doc, y, '4. Estructura del Proyecto');
  y = sp(y);

  y = h2(doc, y, '4.1 Organizacion de Directorios');
  y = code(doc, y, [
    'cuentas-compartidas/',
    '├── src/',
    '│   ├── App.jsx                    # Raiz, rutas, logica de autenticacion',
    '│   ├── main.jsx                   # Punto de entrada, monta AppProvider',
    '│   ├── config/',
    '│   │   └── firebase.js            # Inicializacion Firebase (singleton)',
    '│   ├── context/',
    '│   │   └── AppContext.jsx         # Estado global y listeners Firestore',
    '│   ├── hooks/',
    '│   │   ├── useAuth.js             # Registro, login, grupos',
    '│   │   ├── useTransactions.js     # CRUD transacciones',
    '│   │   ├── useChat.js             # Mensajes del chat',
    '│   │   ├── useSettlement.js       # Calculo de liquidaciones',
    '│   │   └── useUsers.js            # Operaciones de usuario',
    '│   ├── components/',
    '│   │   ├── Auth/                  # AuthGate, SignIn, SignUp, Setups',
    '│   │   ├── Chat/                  # ChatWindow',
    '│   │   ├── Common/                # Navbar',
    '│   │   ├── Dashboard/             # Dashboard, BalanceCard, AvatarScene',
    '│   │   ├── Settings/              # SettingsPage',
    '│   │   ├── Settlement/            # SettlementPage',
    '│   │   ├── Statistics/            # StatisticsPage',
    '│   │   ├── Transactions/          # TransactionList, TransactionForm',
    '│   │   └── Users/                 # AvatarGallery',
    '│   ├── assets/',
    '│   │   └── avatars/               # 18 avatares SVG con animaciones',
    '│   └── utils/',
    '│       ├── calculateSettlement.js # Algoritmo greedy de liquidacion',
    '│       ├── exporters.js           # Exportacion Excel, PDF, CSV',
    '│       └── formatters.js          # Formato moneda EUR, fechas ES',
    '├── index.html                     # HTML raiz, monta React',
    '├── vite.config.js                 # Config Vite + plugin React + Tailwind',
    '├── package.json                   # Dependencias y scripts',
    '├── .env.example                   # Plantilla de variables de entorno',
    '└── eslint.config.js               # Configuracion ESLint',
  ]);
  y = sp(y);

  y = h2(doc, y, '4.2 Descripcion de Modulos');
  y = p(doc, y, 'Cada directorio tiene una responsabilidad unica y bien definida siguiendo el principio de separacion de responsabilidades:');
  y = bullet(doc, y, 'src/config: contiene un unico archivo de configuracion de Firebase. Exporta los objetos auth y db que se usan en toda la aplicacion. El patron singleton garantiza que Firebase se inicializa una sola vez.');
  y = bullet(doc, y, 'src/context: contiene el proveedor de contexto global. Es el unico lugar donde se suscriben los listeners de Firestore. Cualquier componente puede acceder al estado mediante el hook useApp().');
  y = bullet(doc, y, 'src/hooks: cada hook encapsula la logica de un dominio especifico. Los hooks orquestan las llamadas a Firebase y actualizan el contexto. Separar la logica en hooks facilita el testing y la reutilizacion.');
  y = bullet(doc, y, 'src/components: organizados por funcionalidad (feature-based structure). Cada subdirectorio es independiente y contiene todos los componentes necesarios para esa funcionalidad.');
  y = bullet(doc, y, 'src/utils: funciones puras sin efectos secundarios. calculateSettlement.js puede testearse de forma aislada sin necesidad de Firebase o React.');

  // ---- CAPITULO 5: MODELO DE DATOS ----
  y = newPage(doc);
  y = h1(doc, y, '5. Modelo de Datos');
  y = sp(y);

  y = h2(doc, y, '5.1 Diseno de la Base de Datos Firestore');
  y = p(doc, y, 'Firestore es una base de datos NoSQL orientada a documentos, organizada en colecciones y subcollecciones. A diferencia de las bases de datos relacionales, no existen joins: los datos se desnormalizan para optimizar las lecturas. En Cuentas Compartidas, los datos de un grupo se almacenan en subcollecciones del documento del grupo, lo que permite cargarlos de forma independiente y suscribirse a ellos con listeners separados.');
  y = sp(y);
  y = p(doc, y, 'La estructura de colecciones es la siguiente: una coleccion users a nivel raiz, y una coleccion groups tambien a nivel raiz con subcollecciones transactions, messages y payments bajo cada documento de grupo.');
  y = sp(y, 2);

  y = h2(doc, y, '5.2 Coleccion: users');
  y = p(doc, y, 'Almacena el perfil de cada usuario registrado en la aplicacion. El ID del documento es el UID de Firebase Auth, garantizando unicidad y facilitando la validacion de acceso en las reglas de seguridad.');
  y = sp(y);
  y = code(doc, y, [
    'users/{userId} {',
    '  email:     string,       // Correo electronico del usuario',
    '  name:      string,       // Nombre o apodo visible',
    '  avatar:    string,       // Clave del avatar: "avatar0" ... "avatar17"',
    '  color:     string,       // Hex del color de acento del usuario',
    '  groupIds:  [string],     // Array de IDs de salas (v2)',
    '                           // Compat. backward: legacy groupId string',
    '  createdAt: timestamp,',
    '  updatedAt: timestamp,',
    '}',
  ]);
  y = sp(y);

  y = h2(doc, y, '5.3 Coleccion: groups');
  y = p(doc, y, 'Almacena la informacion de cada grupo. El campo memberIds es un array con los UIDs de todos los miembros. Este campo se usa en las reglas de Firestore para verificar que quien lee o escribe datos del grupo es efectivamente un miembro.');
  y = code(doc, y, [
    'groups/{groupId} {',
    '  id:         string,      // ID unico del grupo (generado por Firestore)',
    '  name:       string,      // Nombre del grupo',
    '  code:       string,      // Codigo de invitacion (6 caracteres)',
    '  memberIds:  [string],    // Array de UIDs de todos los miembros',
    '  createdBy:  string,      // UID del usuario creador del grupo',
    '  createdAt:  timestamp,',
    '  updatedAt:  timestamp,',
    '  settings: {',
    '    currency:       "EUR",',
    '    language:       "es",',
    '    decimalPlaces:  2',
    '  },',
    '  categories: [            // Categorias (puede ser personalizado)',
    '    { id: string, label: string, icon: string }',
    '  ]',
    '}',
  ]);
  y = sp(y);

  y = h2(doc, y, '5.4 Subcoleccion: transactions');
  y = p(doc, y, 'Cada documento representa una transaccion economica (gasto o ingreso) del grupo. El campo paidBy referencia al UID del miembro que realizo el pago. El campo splitAmong es el array de UIDs de los participantes entre quienes se divide el importe.');
  y = code(doc, y, [
    'groups/{groupId}/transactions/{txId} {',
    '  id:          string,',
    '  type:        "expense" | "income",',
    '  description: string,       // Maximo 100 caracteres',
    '  amount:      number,       // Importe en EUR, siempre positivo',
    '  category:    string,       // ID de la categoria (food, transport...)',
    '  date:        timestamp,    // Fecha de la transaccion',
    '  paidBy:      string,       // UID del miembro que pago',
    '  splitAmong:  [string],     // UIDs de participantes',
    '  createdBy:   string,       // UID de quien registro la transaccion',
    '  createdAt:   timestamp,',
    '  updatedAt:   timestamp,',
    '  attachment?: string        // URL de comprobante (opcional, futuro)',
    '}',
  ]);
  y = sp(y);

  y = h2(doc, y, '5.5 Subcoleccion: messages');
  y = p(doc, y, 'Almacena los mensajes del chat del grupo. Hay dos tipos de mensajes: los generados por usuarios (type: "user") y los generados automaticamente por el sistema al confirmar pagos (type: "system").');
  y = code(doc, y, [
    'groups/{groupId}/messages/{msgId} {',
    '  type:         "message" | "system" | "payment_reminder",',
    '  text:         string,',
    '  sender:       string,      // UID del remitente',
    '  senderName:   string,      // Nombre cacheado del remitente',
    '  senderAvatar: string,      // Avatar cacheado del remitente',
    '  readBy:       [string],    // UIDs que han leido el mensaje',
    '  createdAt:    timestamp,',
    '  // Solo en payment_reminder:',
    '  fromUserId?:  string,',
    '  toUserId?:    string,',
    '  amount?:      number,',
    '}',
  ]);
  y = sp(y);

  y = h2(doc, y, '5.6 Subcoleccion: payments');
  y = p(doc, y, 'Registra los pagos de liquidacion confirmados. Solo se almacenan los pagos con estado "pending" en los listeners activos, para reducir el volumen de datos transferidos.');
  y = code(doc, y, [
    'groups/{groupId}/payments/{payId} {',
    '  from:         string,        // UID del deudor',
    '  to:           string,        // UID del acreedor',
    '  amount:       number,',
    '  status:       "pending" | "confirmed",',
    '  createdAt:    timestamp,',
    '  confirmedAt?: timestamp,',
    '  confirmedBy?: string,        // UID de quien confirmo el pago',
    '}',
  ]);

  // ---- CAPITULO 6: COMPONENTES ----
  y = newPage(doc);
  y = h1(doc, y, '6. Componentes Principales');
  y = sp(y);

  y = h2(doc, y, '6.1 App.jsx - Raiz y Enrutamiento');
  y = p(doc, y, 'Es el componente raiz que monta el router y decide que mostrar segun el estado de autenticacion. Lee del contexto los valores firebaseUser, userProfile y loading, y aplica la logica de guardias de autenticacion:');
  y = bullet(doc, y, 'Si loading es true o firebaseUser es undefined: muestra una pantalla de carga con spinner.');
  y = bullet(doc, y, 'Si firebaseUser es null o el perfil esta incompleto: renderiza AuthGate para el flujo de registro/login.');
  y = bullet(doc, y, 'Si todo esta completo: renderiza el layout principal con la barra de navegacion (Navbar) y las rutas de la aplicacion.');
  y = sp(y);
  y = p(doc, y, 'Las rutas de componentes grandes (Settlement, Statistics, Chat, Settings) se importan con lazy() y se envuelven en Suspense para habilitar el code splitting. Esto reduce el bundle inicial de ~200KB a ~80KB.');
  y = sp(y, 2);

  y = h2(doc, y, '6.2 AppContext.jsx - Estado Global');
  y = p(doc, y, 'Implementa el patron Provider del Context API de React. Centraliza todo el estado de la aplicacion y la logica de suscripcion a Firestore. Las responsabilidades principales son:');
  y = bullet(doc, y, 'Listener de autenticacion: onAuthStateChanged se ejecuta cada vez que el estado de sesion cambia. Cuando el usuario se autentica, carga su perfil de Firestore y activa los listeners del grupo.');
  y = bullet(doc, y, 'Listeners de datos del grupo: subscribeToGroup() crea cuatro listeners de Firestore (uno para el documento del grupo con sus miembros, uno para transacciones, uno para mensajes y uno para pagos pendientes). Cada listener actualiza su slice de estado correspondiente mediante setTransactions, setMessages, etc.');
  y = bullet(doc, y, 'Limpieza de listeners: cancelListeners() cancela todas las suscripciones activas llamando a las funciones de unsubscribe devueltas por onSnapshot. Se invoca al hacer logout o al cambiar de grupo.');
  y = bullet(doc, y, 'Sincronizacion de tema: un useEffect vincula el valor de darkMode con la clase CSS del elemento html, activando o desactivando el modo oscuro en toda la aplicacion.');
  y = sp(y, 2);

  y = h2(doc, y, '6.3 AuthGate.jsx - Control de Autenticacion');
  y = p(doc, y, 'Gestiona el flujo completo de onboarding. Internamente mantiene un estado de paso (step) que determina que pantalla mostrar: si no hay usuario autenticado, muestra el formulario de login o registro; si hay usuario pero no tiene perfil completo en Firestore, muestra ProfileSetup; si tiene perfil pero no tiene grupo asignado, muestra GroupSetup. Cada paso, al completarse, actualiza el estado del contexto a traves del callback onProfileCreated, que activa los listeners de Firestore del grupo correspondiente.');
  y = sp(y, 2);

  y = h2(doc, y, '6.4 Dashboard.jsx');
  y = p(doc, y, 'Pantalla principal de la aplicacion. Consume del contexto las transacciones, los miembros del grupo y el perfil del usuario. Calcula los saldos llamando a calculateGroupSummary() de las utilidades, y distribuye los resultados entre sus sub-componentes: AvatarScene (avatares animados de todos los miembros), BalanceCard (saldo personal y pagos optimos pendientes), tabla de saldos del grupo y BalanceExplainer (panel desplegable "Por que tengo este saldo?" que muestra el desglose en posicion colectiva y deudas directas usando calculateBalanceBreakdown).');
  y = sp(y, 2);

  y = h2(doc, y, '6.5 TransactionForm y TransactionList');
  y = p(doc, y, 'TransactionList renderiza la lista paginable de transacciones con sus filtros (por categoria, persona, fecha y texto libre). Implementa busqueda en tiempo real usando useMemo para filtrar el array de transacciones sin re-fetching de datos. Cada transaccion muestra su descripcion, categoria, importe, quien pago y los participantes. TransactionForm es un formulario controlado con validacion local antes de llamar al hook useTransactions. Muestra un desglose en tiempo real de como se distribuye el importe mientras el usuario rellena los campos.');
  y = sp(y, 2);

  y = h2(doc, y, '6.6 SettlementPage');
  y = p(doc, y, 'Consume las transacciones y miembros del contexto para calcular los saldos y pagos optimos mediante calculateGroupSummary(). Muestra tres secciones: el resumen financiero global, la tabla de saldos individuales y la lista de pagos optimos recomendados. Para cada pago sugerido, ofrece la opcion de confirmarlo, lo que desencadena la creacion de una transaccion de ingreso y un mensaje de sistema en el chat.');
  y = sp(y, 2);

  y = h2(doc, y, '6.7 StatisticsPage');
  y = p(doc, y, 'Utiliza la libreria Recharts para renderizar cuatro tipos de graficos. Aplica los filtros seleccionados (periodo, categoria, miembro) mediante useMemo para transformar el array de transacciones en los datasets que Recharts espera. Los graficos son completamente responsivos gracias al componente ResponsiveContainer de Recharts, que adapta el tamaño al contenedor HTML.');
  y = sp(y, 2);

  y = h2(doc, y, '6.8 ChatWindow');
  y = p(doc, y, 'Implementa el chat en tiempo real. Los mensajes llegan ordenados por createdAt descendente desde el contexto, pero se muestran en orden ascendente (mas antiguos arriba, mas nuevos abajo) invirtiendolos localmente. Un useEffect con dependencia en el array de mensajes hace scroll automatico al ultimo mensaje cada vez que llega uno nuevo. Distingue visualmente entre mensajes propios, mensajes de otros miembros y mensajes del sistema.');

  // ---- CAPITULO 7: HOOKS ----
  y = newPage(doc);
  y = h1(doc, y, '7. Hooks Personalizados');
  y = sp(y);

  y = p(doc, y, 'Los hooks personalizados son funciones que encapsulan logica reutilizable y pueden usar otros hooks de React. En esta aplicacion, los hooks encapsulan toda la comunicacion con Firebase, dejando los componentes libres de logica de acceso a datos. Cada hook sigue el principio de responsabilidad unica.');
  y = sp(y, 2);

  y = h2(doc, y, '7.1 useAuth');
  y = p(doc, y, 'Gestiona todo el ciclo de vida de autenticacion y pertenencia a grupos. Funciones principales:');
  y = bullet(doc, y, 'signUp(email, password): llama a createUserWithEmailAndPassword de Firebase Auth y crea el documento inicial en /users/{uid}.');
  y = bullet(doc, y, 'signIn(email, password): llama a signInWithEmailAndPassword. El listener onAuthStateChanged de AppContext detecta el cambio y carga el perfil automaticamente.');
  y = bullet(doc, y, 'createGroup(name): genera un codigo alfanumerico de 6 caracteres garantizando unicidad, crea el documento en /groups, inicializa subcollecciones vacias, y actualiza /users/{uid}.groupId.');
  y = bullet(doc, y, 'joinGroup(code): busca en Firestore un grupo con ese codigo, valida que exista, y anade el uid del usuario al array memberIds usando arrayUnion para evitar duplicados.');
  y = sp(y, 2);

  y = h2(doc, y, '7.2 useTransactions');
  y = p(doc, y, 'CRUD completo de transacciones. Funciones principales:');
  y = bullet(doc, y, 'createTransaction(data): valida los datos (importe mayor que cero, al menos un participante, pagador en la lista de participantes), llama a addDoc en la subcolleccion transactions y deja que el listener del contexto actualice el estado.');
  y = bullet(doc, y, 'updateTransaction(txId, data): llama a updateDoc con los campos modificados. Incluye serverTimestamp() en updatedAt.');
  y = bullet(doc, y, 'deleteTransaction(txId): llama a deleteDoc. Los saldos se recalculan automaticamente porque el listener elimina la transaccion del array de estado.');
  y = sp(y, 2);

  y = h2(doc, y, '7.3 useChat');
  y = p(doc, y, 'Operaciones de mensajeria. Funciones principales:');
  y = bullet(doc, y, 'sendMessage(text): valida que el texto no sea vacio y crea el documento en messages con type: "user".');
  y = bullet(doc, y, 'addSystemMessage(metadata): crea un mensaje con type: "system" y el objeto metadata con los detalles del pago. Se llama desde useSettlement al confirmar un pago.');
  y = sp(y, 2);

  y = h2(doc, y, '7.4 useSettlement');
  y = p(doc, y, 'Logica de calculos y confirmaciones de liquidacion. Funciones principales:');
  y = bullet(doc, y, 'getGroupSummary(): invoca calculateGroupSummary de las utilidades con las transacciones y miembros del contexto. Retorna totales de ingresos y gastos, saldos netos por usuario, y la lista de pagos optimos.');
  y = bullet(doc, y, 'confirmPayment(de, a, monto): crea una transaccion de tipo ingreso para registrar el pago, cambia el status del documento de payment a "confirmed", y llama a addSystemMessage para notificar al chat.');
  y = sp(y, 2);

  y = h2(doc, y, '7.5 useUsers');
  y = p(doc, y, 'Operaciones de perfil de usuario. Funciones:');
  y = bullet(doc, y, 'getUserById(uid): obtiene un snapshot del documento /users/{uid}. Se usa cuando se necesita mostrar informacion de un miembro que no esta en el array de groupMembers del contexto.');
  y = bullet(doc, y, 'updateUser(uid, data): llama a updateDoc en el documento del usuario. Se usa desde SettingsPage para actualizar nombre y avatar.');

  // ---- CAPITULO 8: FLUJOS AUTH ----
  y = newPage(doc);
  y = h1(doc, y, '8. Flujos de Autenticacion');
  y = sp(y);

  y = h2(doc, y, '8.1 Flujo de Registro Completo');
  y = p(doc, y, 'El flujo de registro es multi-paso y se gestiona completamente en el cliente:');
  y = sp(y);
  y = code(doc, y, [
    'Paso 1: Usuario accede a la app',
    '  -> firebaseUser === undefined',
    '  -> Muestra pantalla de carga (spinner)',
    '',
    'Paso 2: onAuthStateChanged detecta que no hay sesion',
    '  -> firebaseUser = null',
    '  -> AuthGate renderiza SignUp',
    '',
    'Paso 3: Usuario completa formulario de registro',
    '  -> signUp(email, password)',
    '  -> Firebase Auth: createUserWithEmailAndPassword()',
    '  -> Firebase genera uid unico',
    '  -> Se crea documento /users/{uid} con datos basicos',
    '',
    'Paso 4: onAuthStateChanged detecta nuevo usuario',
    '  -> firebaseUser = User object',
    '  -> getDoc(/users/{uid}) -> documento existe pero sin nombre/avatar',
    '  -> userProfile = { id, email } (sin name ni avatar)',
    '',
    'Paso 5: AuthGate detecta perfil incompleto',
    '  -> Muestra ProfileSetup',
    '  -> Usuario elige nombre y avatar',
    '  -> updateDoc(/users/{uid}, { name, avatar })',
    '  -> onProfileCreated({ name, avatar, groupId: null })',
    '',
    'Paso 6: AuthGate detecta que no hay grupo',
    '  -> Muestra GroupSetup',
    '  -> Usuario elige: Crear o Unirse',
    '  -> Se crea/une al grupo y se actualiza groupId en usuario',
    '  -> subscribeToGroup(groupId) activa todos los listeners',
    '',
    'Paso 7: Todos los datos completos',
    '  -> AuthGate deja paso libre',
    '  -> App renderiza layout completo con Navbar y Routes',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '8.2 Flujo de Login');
  y = p(doc, y, 'El flujo de login es mas directo porque el perfil y el grupo ya existen:');
  y = code(doc, y, [
    'signIn(email, password)',
    '  -> Firebase Auth valida credenciales',
    '  -> onAuthStateChanged: firebaseUser = User',
    '  -> getDoc(/users/{uid}) -> carga perfil completo',
    '  -> subscribeToGroup(profile.groupId)',
    '     -> onSnapshot(grupo): carga miembros y settings',
    '     -> onSnapshot(transacciones): carga historial',
    '     -> onSnapshot(mensajes): carga chat',
    '     -> onSnapshot(pagos): carga pagos pendientes',
    '  -> Estado sincronizado -> App renderiza normalmente',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '8.3 Flujo de Logout');
  y = p(doc, y, 'El logout limpia todos los recursos antes de desconectar al usuario:');
  y = code(doc, y, [
    'logout()',
    '  -> cancelListeners()',
    '     -> unsubTxRef.current?.()      // Cancela listener transacciones',
    '     -> unsubMsgRef.current?.()     // Cancela listener mensajes',
    '     -> unsubPayRef.current?.()     // Cancela listener pagos',
    '     -> unsubGroupRef.current?.()   // Cancela listener grupo',
    '  -> resetData()',
    '     -> userProfile = null',
    '     -> groupId = null',
    '     -> groupMembers = []',
    '     -> transactions = [], messages = [], payments = []',
    '  -> signOut(auth)  // Firebase cierra la sesion',
    '  -> onAuthStateChanged: firebaseUser = null',
    '  -> AuthGate renderiza pantalla de login',
  ]);

  // ---- CAPITULO 9: ALGORITMOS ----
  y = newPage(doc);
  y = h1(doc, y, '9. Algoritmos Clave');
  y = sp(y);

  y = h2(doc, y, '9.1 calculateBalances()');
  y = p(doc, y, 'Ubicacion: src/utils/calculateSettlement.js');
  y = sp(y);
  y = p(doc, y, 'Calcula el saldo neto de cada miembro del grupo recorriendo todo el historial de transacciones. La formula es: saldo_neto = total_aportado - total_que_le_corresponde_pagar. Un saldo positivo significa que esa persona ha adelantado mas de lo que le corresponde y el grupo le debe dinero. Un saldo negativo significa que ha pagado menos de lo que le toca y debe dinero al grupo.');
  y = sp(y);
  y = p(doc, y, 'Para cada transaccion de tipo gasto: se suma el importe total al saldo del pagador (porque adelanto ese dinero), y se resta la parte correspondiente (importe / numero_de_participantes) del saldo de cada participante. Para las transacciones de tipo ingreso, el importe completo se suma al saldo de quien lo cobro.');
  y = sp(y);
  y = code(doc, y, [
    'function calculateBalances(transactions, users) {',
    '  const balances = {}',
    '  users.forEach(u => { balances[u.id] = 0 })',
    '',
    '  transactions.forEach(tx => {',
    '    const monto = tx.amount',
    '    const pagadoPor = tx.paidBy',
    '    const participantes = tx.splitAmong || []',
    '',
    '    if (tx.type === "income") {',
    '      if (balances[pagadoPor] !== undefined)',
    '        balances[pagadoPor] += monto',
    '      return',
    '    }',
    '',
    '    const partePorPersona = monto / participantes.length',
    '',
    '    if (pagadoPor === "common") {',
    '      // Gasto comun: nadie recibe credito; solo se debita a participantes',
    '      // Invariante: Sigma balances = totalIngresos - totalGastosComunes',
    '      participantes.forEach(uid => {',
    '        if (balances[uid] !== undefined)',
    '          balances[uid] -= partePorPersona',
    '      })',
    '    } else {',
    '      // Gasto individual: pagador recibe credito total (adelanto)',
    '      if (balances[pagadoPor] !== undefined)',
    '        balances[pagadoPor] += monto',
    '      participantes.forEach(uid => {',
    '        if (balances[uid] !== undefined)',
    '          balances[uid] -= partePorPersona',
    '      })',
    '    }',
    '  })',
    '  return balances',
    '}',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '9.2 calculateOptimalPayments()');
  y = p(doc, y, 'Implementa el algoritmo greedy para calcular el conjunto minimo de transferencias que saldaria todas las deudas. La idea central es que en cada paso se puede saldar al menos un actor (o el deudor queda a cero o el acreedor queda a cero), con lo que el numero de pasos es como maximo N-1 siendo N el numero de personas con saldo no nulo.');
  y = sp(y);
  y = code(doc, y, [
    'function calculateOptimalPayments(balances) {',
    '  const EPSILON = 0.01',
    '  const creditors = []  // saldo > 0',
    '  const debtors = []    // saldo < 0',
    '',
    '  Object.entries(balances).forEach(([userId, saldo]) => {',
    '    if (saldo >  EPSILON) creditors.push({ userId, amount: saldo })',
    '    if (saldo < -EPSILON) debtors.push(  { userId, amount: -saldo })',
    '  })',
    '',
    '  creditors.sort((a, b) => b.amount - a.amount)  // mayor a menor',
    '  debtors.sort((a, b) => b.amount - a.amount)',
    '',
    '  const payments = []',
    '  let i = 0, j = 0',
    '',
    '  while (i < creditors.length && j < debtors.length) {',
    '    const creditor = creditors[i]',
    '    const debtor = debtors[j]',
    '    const amount = Math.min(creditor.amount, debtor.amount)',
    '',
    '    payments.push({ de: debtor.userId, a: creditor.userId,',
    '                    monto: parseFloat(amount.toFixed(2)) })',
    '',
    '    creditor.amount -= amount',
    '    debtor.amount -= amount',
    '',
    '    if (creditor.amount < EPSILON) i++',
    '    if (debtor.amount < EPSILON) j++',
    '  }',
    '  return payments',
    '}',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '9.3 Analisis de Complejidad');
  y = sp(y);
  y = table2(doc, y, ['Funcion', 'Complejidad Tiempo / Espacio'],
    [
      ['calculateBalances()', 'O(T x P) tiempo, O(U) espacio. T = transacciones, P = participantes por transaccion, U = usuarios.'],
      ['calculateOptimalPayments()', 'O(U log U) por el ordenamiento. La fase de asignacion es O(U). Dominante: O(U log U).'],
      ['calculateGroupSummary()', 'Combina ambas. Dominante: O(T x P) para balances. En la practica T es el factor mayor.'],
    ]
  );
  y = sp(y);
  y = p(doc, y, 'Para grupos tipicos (2-15 personas, cientos de transacciones), ambas funciones se ejecutan en microsegundos. La garantia de optimalidad del algoritmo greedy es matematicamente demostrable: en cada iteracion al menos uno de los dos actores (deudor o acreedor) queda completamente saldado, por lo que el numero de iteraciones es estrictamente menor que el numero de actores con saldo no nulo.');

  // ---- CAPITULO 10: FIREBASE ----
  y = newPage(doc);
  y = h1(doc, y, '10. Integracion Firebase');
  y = sp(y);

  y = h2(doc, y, '10.1 Inicializacion');
  y = p(doc, y, 'Firebase se inicializa en src/config/firebase.js siguiendo el patron singleton: la primera vez que el modulo se importa se ejecuta initializeApp() y los objetos auth y db se exportan. En importaciones posteriores, JavaScript devuelve el modulo cacheado sin reinicializar.');
  y = sp(y);
  y = code(doc, y, [
    '// src/config/firebase.js',
    'import { initializeApp } from "firebase/app"',
    'import { getAuth } from "firebase/auth"',
    'import { getFirestore } from "firebase/firestore"',
    '',
    'const firebaseConfig = {',
    '  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,',
    '  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,',
    '  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,',
    '  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,',
    '  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,',
    '  appId:             import.meta.env.VITE_FIREBASE_APP_ID,',
    '}',
    '',
    'const app = initializeApp(firebaseConfig)',
    'export const auth = getAuth(app)',
    'export const db = getFirestore(app)',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '10.2 Listeners en Tiempo Real');
  y = p(doc, y, 'Los listeners de Firestore (onSnapshot) son la pieza clave de la sincronizacion en tiempo real. Cuando se llama a onSnapshot, Firebase establece una conexion WebSocket permanente con el servidor. Cada vez que los datos de la consulta cambian (por cualquier usuario), el SDK ejecuta el callback con el nuevo snapshot. El valor de retorno de onSnapshot es una funcion para cancelar la suscripcion, que se guarda en refs para poder llamarla al hacer logout.');
  y = sp(y);
  y = code(doc, y, [
    '// Ejemplo de listener de transacciones en AppContext',
    'const txQuery = query(',
    '  collection(db, "groups", groupId, "transactions"),',
    '  orderBy("date", "desc")',
    ')',
    '',
    'const unsubscribe = onSnapshot(txQuery, (snapshot) => {',
    '  const txs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))',
    '  setTransactions(txs)',
    '})',
    '',
    'unsubTxRef.current = unsubscribe  // Guardar para cancelar en logout',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '10.3 Reglas de Seguridad de Firestore');
  y = p(doc, y, 'Las reglas de Firestore son la segunda capa de seguridad del sistema (la primera es Firebase Auth). Se definen en la consola de Firebase y se ejecutan en el servidor antes de permitir cualquier lectura o escritura. Las reglas de la aplicacion son:');
  y = sp(y);
  y = code(doc, y, [
    'rules_version = "2";',
    'service cloud.firestore {',
    '  match /databases/{database}/documents {',
    '',
    '    match /users/{uid} {',
    '      allow read:  if request.auth != null;',
    '      allow write: if request.auth != null && request.auth.uid == uid;',
    '    }',
    '',
    '    match /groups/{groupId} {',
    '      function isMember() {',
    '        return request.auth != null',
    '            && request.auth.uid in resource.data.memberIds;',
    '      }',
    '',
    '      allow read:   if request.auth != null;',
    '      allow create: if request.auth != null',
    '                    && request.auth.uid in request.resource.data.memberIds;',
    '      allow update: if isMember()',
    '                    || (request.auth != null',
    '                        && request.auth.uid in request.resource.data.memberIds',
    '                        && request.resource.data.diff(resource.data)',
    '                                               .affectedKeys()',
    '                                               .hasOnly(["memberIds","updatedAt"]));',
    '      allow delete: if request.auth != null',
    '                    && request.auth.uid == resource.data.createdBy;',
    '',
    '      match /transactions/{txId} {',
    '        allow read, write: if request.auth != null',
    '          && request.auth.uid in',
    '             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;',
    '      }',
    '      match /messages/{msgId} {',
    '        allow read, write: if request.auth != null',
    '          && request.auth.uid in',
    '             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;',
    '      }',
    '      match /payments/{payId} {',
    '        allow read, write: if request.auth != null',
    '          && request.auth.uid in',
    '             get(/databases/$(database)/documents/groups/$(groupId)).data.memberIds;',
    '      }',
    '    }',
    '  }',
    '}',
  ]);

  // ---- CAPITULO 11: SEGURIDAD ----
  y = newPage(doc);
  y = h1(doc, y, '11. Seguridad');
  y = sp(y);

  y = h2(doc, y, '11.1 Autenticacion');
  y = p(doc, y, 'Firebase Authentication gestiona la autenticacion de usuarios con el proveedor Email/Contrasena. Firebase nunca almacena las contrasenas en texto plano: aplica bcrypt con un salt generado aleatoriamente. Esto significa que aunque la base de datos de usuarios se viera comprometida, las contrasenas no podrian recuperarse directamente. Las sesiones se gestionan mediante tokens JWT (JSON Web Tokens) con una caducidad de una hora, que se renuevan automaticamente por el SDK de Firebase.');
  y = sp(y, 2);

  y = h2(doc, y, '11.2 Autorizacion');
  y = p(doc, y, 'La autorizacion se implementa en dos niveles. En el cliente, los hooks verifican que el usuario tiene groupId antes de realizar operaciones y que el uid del usuario que intenta modificar un recurso sea coherente con el recurso en cuestion. En el servidor, las reglas de Firestore validan que request.auth.uid pertenezca al array memberIds del grupo antes de permitir cualquier lectura o escritura en las subcollecciones.');
  y = sp(y, 2);

  y = h2(doc, y, '11.3 Proteccion de Credenciales');
  y = p(doc, y, 'Las credenciales de Firebase (API key, auth domain, project ID, etc.) se almacenan en variables de entorno (.env.local) que nunca se incluyen en el repositorio de codigo (estan en .gitignore). Aunque estas claves son tecnicamente publicas (el navegador las necesita para conectarse a Firebase), las reglas de Firestore garantizan que no se puede acceder a datos sin autenticarse. En produccion, Vercel almacena estas variables en su sistema de configuracion seguro y las inyecta en el proceso de build.');
  y = sp(y, 2);

  y = h2(doc, y, '11.4 HTTPS y Seguridad en Transporte');
  y = p(doc, y, 'En produccion, Vercel fuerza HTTPS en todas las peticiones, redirigiendo automaticamente cualquier peticion HTTP a HTTPS. Firebase SDK usa HTTPS/TLS para todas las comunicaciones con los servidores de Firebase. El almacenamiento local del navegador (localStorage) solo se usa para guardar la preferencia de tema, nunca para datos sensibles ni tokens de sesion.');

  // ---- CAPITULO 12: PERFORMANCE ----
  y = newPage(doc);
  y = h1(doc, y, '12. Optimizaciones y Performance');
  y = sp(y);

  y = h2(doc, y, '12.1 Code Splitting y Lazy Loading');
  y = p(doc, y, 'Los componentes de las secciones menos visitadas (Settlement, Statistics, Chat, Settings) se importan con la funcion lazy() de React, combinada con Suspense. Esto significa que el JavaScript de esos componentes no se descarga hasta que el usuario navega a esa seccion por primera vez. El efecto practico es que el bundle inicial que el usuario descarga al abrir la aplicacion es significativamente menor (aproximadamente un 60% mas pequeno), reduciendo el tiempo de primera carga.');
  y = sp(y, 2);

  y = h2(doc, y, '12.2 Gestion de Listeners de Firestore');
  y = p(doc, y, 'Una gestion incorrecta de los listeners puede causar memory leaks y comportamientos inesperados. En esta aplicacion, cada listener se almacena en un ref (unsubTxRef, unsubMsgRef, etc.) y se cancela explicitamente en dos momentos: cuando el usuario hace logout (cancelListeners en AppContext) y cuando el componente se desmonta si usa listeners locales (cleanup de useEffect). La funcion subscribeToGroup esta envuelta en useCallback para garantizar que mantiene la misma referencia entre renders y evita re-suscripciones innecesarias.');
  y = sp(y, 2);

  y = h2(doc, y, '12.3 Memoizacion de Calculos');
  y = p(doc, y, 'Los calculos de saldos y pagos optimos se realizan sobre el array completo de transacciones. Para evitar recalcular en cada render, estos calculos se envuelven en useMemo con dependencias en el array de transacciones y el array de miembros. Solo se recalculan cuando alguno de estos arrays cambia, lo que ocurre cuando Firestore emite un cambio real en los datos. Del mismo modo, el filtrado de transacciones en TransactionList usa useMemo para evitar refiltrar si los datos o los filtros no han cambiado.');
  y = sp(y, 2);

  y = h2(doc, y, '12.4 Optimizaciones del Build');
  y = p(doc, y, 'Vite aplica en produccion varias optimizaciones automaticamente: minificacion del JavaScript y CSS con Terser y cssnano, tree-shaking para eliminar codigo no utilizado, chunking para dividir el bundle en modulos cacheables, y compresion de los assets estaticos. Tailwind CSS en modo produccion genera solo las clases realmente utilizadas en el codigo, eliminando el resto del framework de CSS.');

  // ---- CAPITULO 13: REQUISITOS TECNICOS ----
  y = newPage(doc);
  y = h1(doc, y, '13. Requisitos Tecnicos');
  y = sp(y);

  y = h2(doc, y, '13.1 Requisitos del Entorno de Desarrollo');
  y = sp(y);
  y = table2(doc, y, ['Requisito', 'Descripcion'],
    [
      ['Node.js >= 18', 'Runtime de JavaScript necesario para ejecutar Vite y las herramientas de desarrollo.'],
      ['npm >= 9', 'Gestor de paquetes para instalar dependencias.'],
      ['Cuenta Firebase', 'Proyecto Firebase con Firestore y Authentication habilitados.'],
      ['Variables de entorno', 'Archivo .env.local con las 6 variables VITE_FIREBASE_*.'],
      ['Navegador moderno', 'Chrome, Firefox, Edge o Safari. No soporta IE11.'],
    ]
  );
  y = sp(y, 2);

  y = h2(doc, y, '13.2 Requisitos de Usuario Final');
  y = sp(y);
  y = table2(doc, y, ['Requisito', 'Descripcion'],
    [
      ['Navegador moderno', 'Cualquier navegador con soporte ES2020+ y CSS Grid.'],
      ['Conexion a internet', 'Necesaria para sincronizacion de datos en tiempo real.'],
      ['Cuenta de correo', 'Necesaria para el registro en la aplicacion.'],
      ['JavaScript habilitado', 'La aplicacion es una SPA y requiere JavaScript activo.'],
    ]
  );
  y = sp(y, 2);

  y = h2(doc, y, '13.3 Requisitos de Firestore');
  y = sp(y);
  y = p(doc, y, 'Para que las consultas ordenadas funcionen correctamente, Firestore requiere indices compuestos en algunos casos. Los indices necesarios son:');
  y = bullet(doc, y, 'groups/{groupId}/transactions: indice compuesto en campo date (descendente) para la consulta principal de transacciones.');
  y = bullet(doc, y, 'groups/{groupId}/messages: indice en createdAt (descendente) para cargar el historial de chat.');
  y = bullet(doc, y, 'groups/{groupId}/payments: indice compuesto en status (igual a "pending") y createdAt (descendente) para filtrar pagos pendientes.');
  y = sp(y);
  y = p(doc, y, 'Estos indices se pueden crear manualmente en la consola de Firebase o Firestore los solicita automaticamente cuando se ejecuta la consulta por primera vez en desarrollo.');

  // ---- CAPITULO 14: DEPLOYMENT ----
  y = newPage(doc);
  y = h1(doc, y, '14. Deployment');
  y = sp(y);

  y = h2(doc, y, '14.1 Preparacion para Produccion');
  y = p(doc, y, 'Antes de desplegar en produccion es necesario verificar los siguientes puntos:');
  y = bullet(doc, y, 'Ejecutar npm run build para generar los archivos de produccion en la carpeta dist/. Verificar que no haya errores de compilacion.');
  y = bullet(doc, y, 'Ejecutar npm run lint para asegurarse de que no hay errores de ESLint que puedan indicar problemas en el codigo.');
  y = bullet(doc, y, 'Actualizar las reglas de Firestore en la consola de Firebase a las reglas de produccion (mas restrictivas que las de desarrollo).');
  y = bullet(doc, y, 'Anadir el dominio de produccion a la lista de dominios autorizados en Firebase Authentication (Configuracion del proyecto -> Authentication -> Configuracion).');
  y = sp(y, 2);

  y = h2(doc, y, '14.2 Deployment en Vercel');
  y = p(doc, y, 'Vercel es la plataforma de deployment recomendada por su integracion nativa con Vite y su tier gratuito suficiente para proyectos de este tipo. El proceso de despliegue puede realizarse de dos maneras:');
  y = sp(y);
  y = h3(doc, y, 'Opcion A: Integracion con GitHub (recomendada)');
  y = p(doc, y, '1. Sube el repositorio a GitHub. 2. En vercel.com, crea un nuevo proyecto e importa el repositorio. 3. Vercel detecta automaticamente que es un proyecto Vite y configura el build correctamente. 4. En la seccion "Environment Variables" del proyecto en Vercel, anade las 6 variables VITE_FIREBASE_*. 5. Haz clic en Deploy. A partir de ese momento, cada push a la rama main desencadena un despliegue automatico.');
  y = sp(y);
  y = h3(doc, y, 'Opcion B: CLI de Vercel');
  y = code(doc, y, [
    'npm install -g vercel',
    'vercel login',
    'vercel deploy --prod',
    '',
    '# Configurar variables de entorno:',
    'vercel env add VITE_FIREBASE_API_KEY production',
    'vercel env add VITE_FIREBASE_AUTH_DOMAIN production',
    '# ... (repetir para las 6 variables)',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '14.3 Consideraciones Post-Deploy');
  y = bullet(doc, y, 'Verificar que la aplicacion carga correctamente en el dominio de produccion.');
  y = bullet(doc, y, 'Probar el flujo completo de registro, creacion de grupo y primera transaccion.');
  y = bullet(doc, y, 'Verificar en la consola de Firebase que las reglas de seguridad no bloquean operaciones legitimas revisando los logs de Firestore.');
  y = bullet(doc, y, 'Monitorizar el uso de Firestore (lecturas, escrituras) para asegurarse de que se mantiene dentro del tier gratuito si es aplicable.');

  // ---- CAPITULO 15: GUIA DEV ----
  y = newPage(doc);
  y = h1(doc, y, '15. Guia de Desarrollo');
  y = sp(y);

  y = h2(doc, y, '15.1 Setup del Entorno Local');
  y = code(doc, y, [
    '# 1. Clonar el repositorio',
    'git clone https://github.com/usuario/cuentas-compartidas.git',
    'cd cuentas-compartidas',
    '',
    '# 2. Instalar dependencias',
    'npm install',
    '',
    '# 3. Crear archivo de variables de entorno',
    'cp .env.example .env.local',
    '',
    '# 4. Editar .env.local con las credenciales de Firebase',
    '# VITE_FIREBASE_API_KEY=AIzaSy...',
    '# VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com',
    '# ... (completar las 6 variables)',
    '',
    '# 5. Arrancar el servidor de desarrollo',
    'npm run dev',
    '# La aplicacion estara disponible en http://localhost:5173',
  ]);
  y = sp(y, 2);

  y = h2(doc, y, '15.2 Scripts Disponibles');
  y = sp(y);
  y = table2(doc, y, ['Comando', 'Descripcion'],
    [
      ['npm run dev', 'Arranca el servidor de desarrollo con HMR en http://localhost:5173'],
      ['npm run build', 'Genera el bundle de produccion optimizado en la carpeta dist/'],
      ['npm run preview', 'Sirve el bundle de produccion localmente para pruebas'],
      ['npm run lint', 'Ejecuta ESLint para detectar errores de codigo'],
    ]
  );
  y = sp(y, 2);

  y = h2(doc, y, '15.3 Convencion de Commits');
  y = p(doc, y, 'El proyecto usa la convencion Conventional Commits para los mensajes de commit. Esta convencion facilita la generacion automatica de changelogs y la comprension del historial de cambios:');
  y = sp(y);
  y = table2(doc, y, ['Prefijo', 'Uso'],
    [
      ['feat:', 'Nueva funcionalidad añadida al proyecto'],
      ['fix:', 'Correccion de un bug'],
      ['refactor:', 'Cambio de codigo que no corrige bug ni añade feature'],
      ['docs:', 'Cambios en documentacion'],
      ['test:', 'Añadir o modificar tests'],
      ['perf:', 'Mejora de performance'],
      ['chore:', 'Cambios en build, dependencias, configuracion'],
    ]
  );
  y = sp(y, 2);

  y = h2(doc, y, '15.4 Consideraciones para Futuras Mejoras');
  y = p(doc, y, 'La arquitectura actual esta preparada para incorporar las siguientes mejoras sin grandes refactorizaciones:');
  y = bullet(doc, y, 'Paginacion de transacciones: anadir startAfter() en la query de Firestore y un boton "Cargar mas" en TransactionList. Necesario cuando el historial supere las 500 transacciones.');
  y = bullet(doc, y, 'Split ponderado: modificar el modelo de datos de transactions.splitAmong para incluir pesos (por ejemplo { userId: "uid", weight: 0.4 }) y actualizar calculateBalances para usar los pesos en lugar de la division equitativa.');
  y = bullet(doc, y, 'Presupuestos por categoria: anadir un objeto budgets al documento del grupo y una nueva pantalla que compare el gasto real con el presupuesto definido.');
  y = bullet(doc, y, 'Transacciones recurrentes: anadir un campo recurring con frecuencia (diaria, semanal, mensual) y una Cloud Function que cree automaticamente la transaccion segun la periodicidad.');
  y = bullet(doc, y, 'Notificaciones push: integrar Firebase Cloud Messaging (FCM) para notificar a los miembros cuando se registra una nueva transaccion o se confirma un pago.');
  y = bullet(doc, y, 'App movil nativa: la logica de negocio (hooks y utils) es completamente reutilizable en React Native, ya que no depende del DOM. Solo habria que reescribir los componentes de presentacion.');

  // Finalizar
  doc.flushPages();
  addFooters(doc, 'Documento Tecnico');
  doc.end();
  return new Promise(r => doc.on('end', r));
};

await buildTecnico();
console.log('DOCUMENTO_TECNICO.pdf generado correctamente');
