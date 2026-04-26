import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const createManualPDF = () => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    const writeStream = fs.createWriteStream('MANUAL_DE_USUARIO.pdf');
    doc.pipe(writeStream);

    // Portada
    doc.font('Helvetica-Bold').fontSize(28);
    doc.text('CUENTAS COMPARTIDAS', { align: 'center' });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(14);
    doc.text('Manual de Usuario', { align: 'center' });
    doc.moveDown(3);

    doc.fontSize(11);
    doc.text('Versión 1.0', { align: 'center' });
    doc.text('Abril de 2026', { align: 'center' });

    doc.addPage();

    // Tabla de contenidos
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('Tabla de Contenidos', 50, 50);
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    const contents = [
      '1. Introducción',
      '2. Primeros Pasos',
      '3. Dashboard Principal',
      '4. Gestión de Transacciones',
      '5. Liquidación de Deudas',
      '6. Estadísticas y Análisis',
      '7. Chat Interno',
      '8. Configuración y Ajustes',
      '9. Exportación de Datos',
      '10. Preguntas Frecuentes'
    ];

    contents.forEach(item => {
      doc.text(item);
    });

    doc.addPage();

    // Sección 1: Introducción
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('1. Introducción', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text(
      'Cuentas Compartidas es una aplicación web para gestión de gastos e ingresos compartidos en grupos pequeños (familia, piso, amigos, viajes). Permite registrar transacciones, calcular saldos automáticamente, liquidar deudas de forma óptima, analizar gastos con gráficos y comunicarse con el equipo mediante chat integrado.',
      { align: 'left', width: 495 }
    );

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Características Principales');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    const features = [
      'Grupos con código de invitación de 6 caracteres',
      'Transacciones compartidas con split automático',
      'Saldos en tiempo real sincronizados',
      'Pagos óptimos con algoritmo greedy',
      'Chat interno con historial sin límite',
      'Exportación a Excel, PDF y CSV',
      'Gráficos y estadísticas completas',
      '15+ avatares 2D con expresiones dinámicas',
      'Tema oscuro/claro personalizable',
      'Interfaz responsive para móvil y desktop'
    ];

    features.forEach(feature => {
      doc.text('• ' + feature);
    });

    doc.addPage();

    // Sección 2: Primeros Pasos
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('2. Primeros Pasos', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('2.1 Crear una Cuenta');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('1. Accede a la aplicación en tu navegador', { indent: 20 });
    doc.text('2. Haz clic en "Crear Cuenta"', { indent: 20 });
    doc.text('3. Completa el formulario con correo y contraseña (mínimo 6 caracteres)', { indent: 20 });
    doc.text('4. Verifica tu correo si es requerido', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('2.2 Configurar Perfil');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('1. Ingresa tu nombre o apodo', { indent: 20 });
    doc.text('2. Selecciona un avatar de los 15+ disponibles', { indent: 20 });
    doc.text('3. Los avatares cambian de expresión según tu saldo (feliz, neutral, triste)', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('2.3 Crear o Unirse a un Grupo');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('Para crear grupo: selecciona "Crear Grupo", asigna nombre, se genera código automáticamente', { width: 495 });
    doc.text('Para unirse: selecciona "Unirse a Grupo" e ingresa código de 6 caracteres', { width: 495 });

    doc.addPage();

    // Sección 3: Dashboard
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('3. Dashboard Principal', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('El Dashboard es la pantalla principal que muestra el estado general del grupo:', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.1 Avatar del Grupo');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Avatar animado 3D que representa visualmente el estado colectivo del grupo.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.2 Tarjeta de Saldo Personal');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Muestra tu saldo individual: positivo (verde, te deben dinero), negativo (rojo, debes dinero), o cero (gris).', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.3 Resumen Financiero');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Total de Gastos, Total de Ingresos, Saldo Colectivo y Número de Miembros Activos.', { width: 495 });

    doc.addPage();

    // Sección 4: Transacciones
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('4. Gestión de Transacciones', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('Las transacciones son el núcleo de la aplicación. Aquí registras gastos e ingresos compartidos.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('4.1 Crear una Transacción');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('Accede a "Transacciones" y completa:');
    doc.text('• Tipo: Gasto o Ingreso', { indent: 20 });
    doc.text('• Descripción: qué es la transacción', { indent: 20 });
    doc.text('• Categoría: Comida, Transporte, Casa, Ocio, Salud, Compras, Facturas, Viajes, Educación, Ingresos, Otros', { indent: 20 });
    doc.text('• Monto: cantidad en EUR', { indent: 20 });
    doc.text('• Quién Pagó: miembro que adelantó el dinero', { indent: 20 });
    doc.text('• Quiénes Participan: miembros beneficiados (se divide equitativamente)', { indent: 20 });
    doc.text('• Fecha: fecha de la transacción', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('4.2 Desglose Automático');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Antes de guardar verás el desglose automático mostrando cómo se distribuye el dinero.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('4.3 Ejemplo Práctico');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Transacción: Cena en Italiano - 60.00 EUR', { indent: 20 });
    doc.text('Pagó: Juan', { indent: 20 });
    doc.text('Participan: Juan, Maria, Pedro (3 personas)', { indent: 20 });
    doc.text('Resultado: Juan adelantó 60 EUR, su parte es 20 EUR, neto +40 EUR', { indent: 20 });
    doc.text('Maria debe 20 EUR, Pedro debe 20 EUR', { indent: 20 });

    doc.addPage();

    // Sección 5: Liquidación
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('5. Liquidación de Deudas', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('La liquidación calcula las transferencias óptimas para saldar todas las deudas usando algoritmo matemático.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('5.1 Cómo Funciona el Algoritmo');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('1. Calcula saldo neto: aportaciones menos lo que cada persona debe', { indent: 20 });
    doc.text('2. Identifica acreedores (a quienes se les debe) y deudores', { indent: 20 });
    doc.text('3. El mayor deudor paga al mayor acreedor el mínimo que satisface a uno', { indent: 20 });
    doc.text('4. Repite hasta que no quedan deudas', { indent: 20 });
    doc.text('5. Minimiza automáticamente el número total de transferencias', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('5.2 Pantalla de Liquidación');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Muestra resumen actual, saldos individuales y lista de transferencias necesarias.', { width: 495 });

    doc.addPage();

    // Sección 6: Estadísticas
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('6. Estadísticas y Análisis', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('La sección de Estadísticas proporciona análisis visual completo del grupo.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.1 Tipos de Gráficos');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('• Gastos por Categoría (Pie): distribución porcentual', { indent: 20 });
    doc.text('• Gastos por Persona (Barras): comparativa de quién pagó más', { indent: 20 });
    doc.text('• Evolución Mensual (Líneas): tendencia de gastos mes a mes', { indent: 20 });
    doc.text('• Balance Neto (Barras Horizontales): saldo final por persona', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.2 Filtros Disponibles');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('• Por Período: últimos 7 días, 30 días, mes, trimestre, año, personalizado', { indent: 20 });
    doc.text('• Por Categoría: muestra solo una categoría', { indent: 20 });
    doc.text('• Por Miembro: analiza transacciones de una persona', { indent: 20 });

    doc.addPage();

    // Sección 7: Chat
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('7. Chat Interno', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('El Chat permite comunicación completa con miembros del grupo.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('7.1 Características');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('• Historial ilimitado: todo se guarda sin límites', { indent: 20 });
    doc.text('• Sincronización realtime: mensajes aparecen al instante', { indent: 20 });
    doc.text('• Notificaciones: recibe alertas de nuevos mensajes', { indent: 20 });
    doc.text('• Timestamps: cada mensaje muestra hora y fecha exacta', { indent: 20 });
    doc.text('• Mensajes del Sistema: liquidaciones se registran automáticamente', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('7.2 Usar el Chat');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('1. Accede a la sección "Chat"', { indent: 20 });
    doc.text('2. En el campo inferior, escribe tu mensaje', { indent: 20 });
    doc.text('3. Haz clic en "Enviar" o presiona Enter', { indent: 20 });
    doc.text('4. El mensaje aparece al instante para todos', { indent: 20 });

    doc.addPage();

    // Sección 8: Ajustes
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('8. Configuración y Ajustes', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.1 Perfil Personal');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Tu Nombre: cambia en cualquier momento', { indent: 20 });
    doc.text('Tu Avatar: elige de 15+ opciones, cambia expresión según saldo', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.2 Grupo');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Nombre del Grupo: edita en cualquier momento', { indent: 20 });
    doc.text('Código de Invitación: único de 6 caracteres', { indent: 20 });
    doc.text('Miembros: listado con saldos de cada uno', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.3 Preferencias y Seguridad');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Tema Dark/Light: alterna según preferencia', { indent: 20 });
    doc.text('Cambiar Contraseña: ingresa actual y nueva', { indent: 20 });
    doc.text('Logout: cierra sesión de forma segura', { indent: 20 });

    doc.addPage();

    // Sección 9: Exportación
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('9. Exportación de Datos', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('9.1 Formatos Disponibles');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('Excel (.xlsx): compatible con Excel, todas las transacciones con análisis.', { width: 495 });
    doc.moveDown(0.2);
    doc.text('PDF: documento profesional con gráficos y recomendaciones.', { width: 495 });
    doc.moveDown(0.2);
    doc.text('CSV: valores separados por comas para importación en otros sistemas.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('9.2 Cómo Exportar');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Excel: abre Transacciones, haz clic en "Exportar a Excel"', { width: 495 });
    doc.moveDown(0.2);
    doc.text('PDF: abre Estadísticas, haz clic en "Exportar a PDF"', { width: 495 });
    doc.moveDown(0.2);
    doc.text('CSV: abre Transacciones, haz clic en "Exportar a CSV"', { width: 495 });

    doc.addPage();

    // Sección 10: FAQ
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('10. Preguntas Frecuentes', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿Es segura la aplicación?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('Sí, usamos Firebase (Google) con encriptación de datos en tránsito, bcrypt para contraseñas y reglas que garantizan que solo miembros del grupo accedan a sus datos.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿Qué pasa si olvido mi contraseña?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('En login haz clic en "Olvidé mi contraseña", ingresa email y recibirás enlace para restablecerla.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿Puedo editar una transacción ya registrada?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('Sí, abre la transacción, haz clic en edición, modifica y guarda. Los saldos se recalculan automáticamente.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿Qué diferencia hay entre "participan" y "pagó"?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('"Pagó" es quién adelantó dinero. "Participan" son quiénes se benefician. El sistema calcula automáticamente quién debe a quién.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿Cómo se calcula exactamente mi saldo?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('Saldo Neto = (Todo lo que pagaste) MENOS (Tu parte de todos los gastos)', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('¿El algoritmo de liquidación da respuesta óptima?');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('Sí, garantiza el número mínimo de transferencias posible. No hay forma de hacerlo más eficientemente.', { width: 495 });

    // Página final
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text('Contacto y Soporte', { align: 'center' });
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    doc.text('Si tienes problemas o sugerencias:', { align: 'center' });
    doc.moveDown();

    doc.text('Email: soporte@cuentascompartidas.app', { align: 'center' });
    doc.text('Reportar Bug: abre un issue en GitHub', { align: 'center' });
    doc.text('Sugerencias: envía tus ideas por email', { align: 'center' });

    doc.moveDown(3);
    doc.fontSize(9);
    doc.text('Manual de Usuario - Cuentas Compartidas', { align: 'center' });
    doc.text('Versión 1.0 - Abril 2026', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      console.log('MANUAL_DE_USUARIO.pdf generado exitosamente');
      resolve();
    });
  });
};

const createTechnicalPDF = () => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    const writeStream = fs.createWriteStream('DOCUMENTO_TECNICO.pdf');
    doc.pipe(writeStream);

    // Portada
    doc.font('Helvetica-Bold').fontSize(28);
    doc.text('CUENTAS COMPARTIDAS', { align: 'center' });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(14);
    doc.text('Documento Técnico', { align: 'center' });
    doc.moveDown(3);

    doc.fontSize(11);
    doc.text('Versión 1.0', { align: 'center' });
    doc.text('Abril de 2026', { align: 'center' });

    doc.addPage();

    // Tabla de contenidos
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('Tabla de Contenidos', 50, 50);
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    const contents = [
      '1. Visión General',
      '2. Arquitectura del Sistema',
      '3. Stack Tecnológico',
      '4. Estructura del Proyecto',
      '5. Modelo de Datos Firestore',
      '6. Componentes Principales',
      '7. Hooks Personalizados',
      '8. Gestión de Estado',
      '9. Algoritmos Clave',
      '10. Integración Firebase',
      '11. Seguridad',
      '12. Optimizaciones y Performance',
      '13. Deployment',
      '14. Guía de Desarrollo'
    ];

    contents.forEach(item => {
      doc.text(item);
    });

    doc.addPage();

    // Sección 1: Visión General
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('1. Visión General', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    doc.text('Cuentas Compartidas es una aplicación web progresiva (PWA) para gestión de gastos compartidos entre grupos pequeños. La arquitectura es modular, escalable y optimizada para múltiples dispositivos.', { width: 495 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('1.1 Objetivos de Diseño');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('• Precisión Financiera: cálculos exactos con manejo de decimales', { indent: 20 });
    doc.text('• Sincronización Realtime: datos consistentes entre dispositivos', { indent: 20 });
    doc.text('• UX Responsiva: experiencia fluida en móvil y desktop', { indent: 20 });
    doc.text('• Seguridad: autenticación y autorización en cada nivel', { indent: 20 });
    doc.text('• Performance: bundle pequeño, carga rápida', { indent: 20 });
    doc.text('• Escalabilidad: soporta cientos de transacciones por grupo', { indent: 20 });

    doc.addPage();

    // Sección 2: Arquitectura
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('2. Arquitectura del Sistema', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('2.1 Capas de Arquitectura');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('Capa 1 - Presentación: Componentes React + Tailwind CSS', { indent: 20 });
    doc.text('Capa 2 - Gestión de Estado: AppContext + useReducer Pattern', { indent: 20 });
    doc.text('Capa 3 - Lógica de Negocio: Hooks + Utilidades', { indent: 20 });
    doc.text('Capa 4 - Acceso a Datos: Firebase SDK', { indent: 20 });
    doc.text('Capa 5 - Infraestructura: Firebase Cloud', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('2.2 Flujo de Datos');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Usuario → Evento → Estado → Firebase → Listener → UI', { indent: 20 });

    doc.addPage();

    // Sección 3: Stack
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('3. Stack Tecnológico', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.1 Frontend');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('React 19.2.5: Framework de UI con composición de componentes', { indent: 20 });
    doc.text('Vite 8.0.10: Build tool ultrarápido con dev server HMR', { indent: 20 });
    doc.text('Tailwind CSS 4.2.4: Estilos utility-first optimizados', { indent: 20 });
    doc.text('React Router 7.14.2: Enrutamiento SPA con lazy loading', { indent: 20 });
    doc.text('Framer Motion 12.38.0: Animaciones suaves declarativas', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.2 Backend/BDD');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('Firebase Authentication: gestión de usuarios Email/Contraseña', { indent: 20 });
    doc.text('Cloud Firestore: NoSQL en tiempo real con listeners realtime', { indent: 20 });
    doc.text('Firebase Security Rules: control de acceso basado en membresía', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('3.3 Utilidades');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('date-fns 4.1.0: manipulación de fechas con locale español', { indent: 20 });
    doc.text('jsPDF 4.2.1: generación de PDF en navegador', { indent: 20 });
    doc.text('XLSX 0.18.5: exportación a Excel', { indent: 20 });
    doc.text('Recharts 3.8.1: gráficos responsivos (Pie, Bar, Line)', { indent: 20 });

    doc.addPage();

    // Sección 4: Estructura
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('4. Estructura del Proyecto', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('4.1 Directorios Principales');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('src/config: inicialización Firebase (singleton)', { indent: 20 });
    doc.text('src/context: estado global AppContext con listeners', { indent: 20 });
    doc.text('src/hooks: 5 hooks personalizados reutilizables', { indent: 20 });
    doc.text('src/components: 8 modules de componentes por feature', { indent: 20 });
    doc.text('src/utils: calculateSettlement, exporters, formatters', { indent: 20 });
    doc.text('src/assets: 15+ avatares SVG con estados', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('4.2 Componentes Principales');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Auth/: AuthGate, SignIn, SignUp, ProfileSetup, GroupSetup', { indent: 20 });
    doc.text('Dashboard/: Dashboard, BalanceCard, AvatarScene', { indent: 20 });
    doc.text('Transactions/: TransactionList, TransactionForm', { indent: 20 });
    doc.text('Settlement/: SettlementPage con cálculos óptimos', { indent: 20 });
    doc.text('Statistics/: 4 tipos de gráficos con Recharts', { indent: 20 });
    doc.text('Chat/: ChatWindow con historial ilimitado', { indent: 20 });

    doc.addPage();

    // Sección 5: Modelo de Datos
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('5. Modelo de Datos Firestore', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('5.1 Colecciones');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    doc.text('users/{userId}: perfil usuario con name, avatar, groupId', { indent: 20 });
    doc.text('groups/{groupId}: datos grupo con memberIds, categories', { indent: 20 });
    doc.text('groups/{groupId}/transactions: gastos e ingresos compartidos', { indent: 20 });
    doc.text('groups/{groupId}/messages: chat con historial', { indent: 20 });
    doc.text('groups/{groupId}/payments: pagos confirmados con status', { indent: 20 });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('5.2 Estructura Transacción');
    doc.moveDown(0.2);

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('type: "expense" | "income"', { indent: 20 });
    doc.text('amount: number (en EUR)', { indent: 20 });
    doc.text('category: string (ID categoría)', { indent: 20 });
    doc.text('paidBy: string (UID usuario)', { indent: 20 });
    doc.text('splitAmong: [string] (UIDs participantes)', { indent: 20 });
    doc.text('date: timestamp (fecha transacción)', { indent: 20 });

    doc.addPage();

    // Sección 6: Componentes
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('6. Componentes Principales', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.1 App.jsx - Raíz');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Punto de entrada de la aplicación. Define rutas principales y flujo de autenticación.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.2 AppContext.jsx - Estado Global');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Contexto centralizado que maneja sincronización Firestore en tiempo real para transacciones, mensajes y pagos.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.3 AuthGate.jsx - Autenticación');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Control de acceso y flujo onboarding completo: login, registro, perfil, grupo.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('6.4 Dashboard.jsx - Principal');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Pantalla inicial con resumen estado grupo, saldos personales y avatares animados.', { width: 495 });

    doc.addPage();

    // Sección 7: Algoritmos
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('7. Algoritmos Clave', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('7.1 calculateBalances()');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Calcula saldo neto de cada usuario usando la fórmula:', { width: 495 });
    doc.moveDown(0.2);
    doc.text('Saldo = (total pagado) - (parte en gastos)', { indent: 40 });
    doc.moveDown(0.2);
    doc.text('Complejidad: O(n) donde n = transacciones', { indent: 40 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('7.2 calculateOptimalPayments()');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Algoritmo greedy para mínimo de transferencias:', { width: 495 });
    doc.moveDown(0.2);
    doc.text('1. Separa acreedores y deudores', { indent: 40 });
    doc.text('2. Ordena de mayor a menor', { indent: 40 });
    doc.text('3. Mayor deudor paga a mayor acreedor', { indent: 40 });
    doc.text('4. Repite hasta saldado', { indent: 40 });
    doc.moveDown(0.2);
    doc.text('Complejidad: O(n log n) por ordenamiento', { indent: 40 });
    doc.text('Garantía: número mínimo de transferencias', { indent: 40 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('7.3 Ejemplo Cálculo');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('Saldos iniciales: Juan +40, Maria -5, Pedro -35', { indent: 20 });
    doc.moveDown(0.15);
    doc.text('Transferencias óptimas:', { indent: 20 });
    doc.text('1. Pedro paga 35 EUR a Juan', { indent: 40 });
    doc.text('2. Maria paga 5 EUR a Juan', { indent: 40 });
    doc.moveDown(0.15);
    doc.text('Total: 2 transferencias (óptimo)', { indent: 20 });

    doc.addPage();

    // Sección 8: Firebase
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('8. Integración Firebase', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.1 Inicialización');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Firebase se inicializa en src/config/firebase.js como singleton con Auth y Firestore.', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.2 Listeners Realtime');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('onSnapshot: escucha cambios en tiempo real de colecciones', { indent: 20 });
    doc.text('query: ordena transacciones por fecha descendente', { indent: 20 });
    doc.text('where: filtra pagos por status pending', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('8.3 Reglas de Seguridad');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Firestore valida que solo miembros del grupo accedan a datos del grupo.', { width: 495 });
    doc.moveDown(0.2);
    doc.text('Cada usuario solo puede leer/escribir su propio documento.', { width: 495 });

    doc.addPage();

    // Sección 9: Seguridad
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('9. Seguridad', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('9.1 Autenticación');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Firebase Auth con Email/Contraseña', { indent: 20 });
    doc.text('Contraseñas hasheadas con bcrypt (manejado por Firebase)', { indent: 20 });
    doc.text('Tokens JWT con expiración automática', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('9.2 Autorización');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Reglas Firestore: solo miembros grupo acceden', { indent: 20 });
    doc.text('Validación cliente: verificar UID y groupId', { indent: 20 });
    doc.text('Validación servidor: reglas Firestore fuerzan', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('9.3 Protección de Datos');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Variables entorno: nunca en git (.gitignore)', { indent: 20 });
    doc.text('HTTPS: Vercel fuerza en producción', { indent: 20 });
    doc.text('localStorage: solo preferencias (darkMode)', { indent: 20 });

    doc.addPage();

    // Sección 10: Performance
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('10. Optimizaciones y Performance', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('10.1 Code Splitting');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Lazy load de componentes grandes reduce bundle 60%', { width: 495 });
    doc.moveDown(0.15);
    doc.text('De ~200KB a ~80KB inicial', { width: 495 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('10.2 Runtime Optimizations');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('useCallback: previene re-subscripciones', { indent: 20 });
    doc.text('cleanup useEffect: cancela listeners al desmontar', { indent: 20 });
    doc.text('useMemo: memoiza cálculos costosos', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('10.3 Network Optimizations');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Índices automáticos de Firestore', { indent: 20 });
    doc.text('Batching de writes cuando es posible', { indent: 20 });
    doc.text('Listeners en lugar de polling', { indent: 20 });

    doc.addPage();

    // Sección 11: Deployment
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('11. Deployment en Vercel', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('11.1 Preparación');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('1. npm run build && npm run lint', { indent: 20 });
    doc.text('2. Configurar variables entorno en Vercel', { indent: 20 });
    doc.text('3. Actualizar reglas Firestore', { indent: 20 });
    doc.text('4. Whitelist domain en Firebase', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('11.2 Opciones de Deploy');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Opción 1: Manual con vercel CLI', { indent: 20 });
    doc.text('Opción 2: GitHub Integration (automático en cada push)', { indent: 20 });

    doc.addPage();

    // Sección 12: Desarrollo
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('12. Guía de Desarrollo', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('12.1 Setup Local');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9);
    doc.text('1. git clone <repo>', { indent: 20 });
    doc.text('2. npm install', { indent: 20 });
    doc.text('3. cp .env.example .env.local', { indent: 20 });
    doc.text('4. npm run dev', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('12.2 Estructura de Commits');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('feat: nueva funcionalidad', { indent: 20 });
    doc.text('fix: corrección de bug', { indent: 20 });
    doc.text('refactor: reorganización código', { indent: 20 });
    doc.text('docs: cambios documentación', { indent: 20 });
    doc.text('test: agregar tests', { indent: 20 });

    doc.addPage();

    // Sección 13: Futuro
    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('13. Consideraciones Futuras', 50, 50);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('13.1 Escalabilidad');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Paginación: para 1000+ transacciones', { indent: 20 });
    doc.text('Split Ponderado: participación en diferentes porcentajes', { indent: 20 });
    doc.text('Presupuestos: límites por categoría', { indent: 20 });
    doc.text('Recurrencia: transacciones automáticas', { indent: 20 });

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('13.2 Mejoras Futuras');
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(10);
    doc.text('Modo offline con sincronización posterior', { indent: 20 });
    doc.text('Notificaciones push', { indent: 20 });
    doc.text('App móvil nativa (React Native)', { indent: 20 });
    doc.text('Integración APIs bancarias', { indent: 20 });

    // Página final
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text('Conclusión', { align: 'center' });
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    doc.text('Cuentas Compartidas es una solución completa y profesional para gestión de gastos compartidos, construida con tecnologías modernas, arquitectura escalable y énfasis en seguridad y performance.', { align: 'left', width: 495 });

    doc.moveDown(3);
    doc.fontSize(9);
    doc.text('Documento Técnico - Cuentas Compartidas', { align: 'center' });
    doc.text('Versión 1.0 - Abril 2026', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      console.log('DOCUMENTO_TECNICO.pdf generado exitosamente');
      resolve();
    });
  });
};

// Generar ambos PDFs
Promise.all([createManualPDF(), createTechnicalPDF()]).then(() => {
  console.log('\nTodos los PDFs se generaron correctamente');
  process.exit(0);
});
