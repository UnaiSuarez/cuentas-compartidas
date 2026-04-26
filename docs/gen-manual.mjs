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

// Escribe el pie de pagina en todas las paginas
const addFooters = (doc, title) => {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#666666');
    doc.text(`Cuentas Compartidas - ${title}`, ML, H - 30, { width: TW / 2 });
    doc.text(`Pagina ${i + 1} de ${range.count}`, ML + TW / 2, H - 30, { width: TW / 2, align: 'right' });
    // Linea separadora
    doc.moveTo(ML, H - 38).lineTo(W - MR, H - 38).stroke('#CCCCCC');
  }
};

// Nueva pagina con encabezado
const newPage = (doc) => {
  doc.addPage({ size: 'A4', margin: 0 });
  return MT;
};

// Encabezado de seccion
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

// Tabla de 3 columnas para requisitos
const reqTable = (doc, y, req, tipo, prio, desc) => {
  if (y > H - MB - 120) { y = newPage(doc); }
  const col1 = 110, col2 = 90, col3 = TW - col1 - col2;
  const rowH = 22;

  // Cabecera
  doc.rect(ML, y, col1, rowH).fill('#2c3e6e');
  doc.rect(ML + col1, y, col2, rowH).fill('#2c3e6e');
  doc.rect(ML + col1 + col2, y, col3, rowH).fill('#2c3e6e');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.text('Requisito', ML + 4, y + 7, { width: col1 - 8 });
  doc.text('Tipo', ML + col1 + 4, y + 7, { width: col2 - 8 });
  doc.text('Prioridad', ML + col1 + col2 + 4, y + 7, { width: col3 - 8 });
  y += rowH;

  // Fila de datos cabecera
  doc.rect(ML, y, col1, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.rect(ML + col1, y, col2, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.rect(ML + col1 + col2, y, col3, rowH).fill('#dce3f5').stroke('#aab5d5');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a1a2e');
  doc.text(req, ML + 4, y + 7, { width: col1 - 8 });
  doc.text(tipo, ML + col1 + 4, y + 7, { width: col2 - 8 });
  doc.text(prio, ML + col1 + col2 + 4, y + 7, { width: col3 - 8 });
  y += rowH;

  // Fila descripcion
  const dh = Math.max(doc.heightOfString(desc, { width: TW - 8 }) + 10, 30);
  if (y + dh > H - MB - 20) { y = newPage(doc); }
  doc.rect(ML, y, TW, dh).fill('#f5f7fc').stroke('#aab5d5');
  doc.font('Helvetica').fontSize(9).fillColor('#222222');
  doc.text(desc, ML + 6, y + 6, { width: TW - 12, lineGap: 1.5 });
  y += dh;

  return y + 8;
};

// =========================================================
// MANUAL DE USUARIO
// =========================================================
const buildManual = async () => {
  const doc = createDoc('MANUAL_DE_USUARIO.pdf');

  // ---- PORTADA ----
  doc.addPage({ size: 'A4', margin: 0 });
  doc.rect(0, 0, W, 200).fill('#1a1a2e');
  doc.rect(0, 200, W, 6).fill('#3a5a9b');

  doc.font('Helvetica-Bold').fontSize(30).fillColor('#ffffff');
  doc.text('CUENTAS COMPARTIDAS', ML, 60, { width: TW, align: 'center' });
  doc.font('Helvetica').fontSize(16).fillColor('#c0cce8');
  doc.text('Aplicacion de Gestion de Gastos Compartidos', ML, 105, { width: TW, align: 'center' });

  doc.rect(0, 206, W, H - 206).fill('#f5f7fc');

  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a1a2e');
  doc.text('Manual de Usuario', ML, 240, { width: TW, align: 'center' });
  doc.font('Helvetica').fontSize(12).fillColor('#444444');
  doc.text('Guia completa de uso de la aplicacion', ML, 275, { width: TW, align: 'center' });

  doc.moveTo(ML + 80, 310).lineTo(W - MR - 80, 310).stroke('#3a5a9b');

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a2e');
  const infoY = 330;
  const infoItems = [
    ['Producto:', 'Cuentas Compartidas'],
    ['Tipo de documento:', 'Manual de Usuario'],
    ['Version:', '1.0'],
    ['Fecha de emision:', 'Abril de 2026'],
    ['Destinatarios:', 'Usuarios finales de la aplicacion'],
    ['Idioma:', 'Espanol'],
  ];
  infoItems.forEach(([k, v], i) => {
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#2c3e6e');
    doc.text(k, ML + 40, infoY + i * 28, { width: 170 });
    doc.font('Helvetica').fontSize(11).fillColor('#222222');
    doc.text(v, ML + 215, infoY + i * 28, { width: 280 });
  });

  doc.font('Helvetica').fontSize(9).fillColor('#888888');
  doc.text('Documento generado para la asignatura de Desarrollo de Aplicaciones Web', ML, H - 80, { width: TW, align: 'center' });
  doc.text('CPIFP Los Enlaces - Curso 2025/2026', ML, H - 65, { width: TW, align: 'center' });

  // ---- TABLA DE CONTENIDOS ----
  let y = newPage(doc);
  y = h1(doc, y, 'Tabla de Contenidos');
  y = sp(y);

  const toc = [
    ['1', 'Introduccion', '3'],
    ['1.1', 'Descripcion del proyecto', '3'],
    ['1.2', 'Objetivo del manual', '3'],
    ['1.3', 'Publico destinatario', '3'],
    ['2', 'Primeros Pasos', '4'],
    ['2.1', 'Registro de usuario', '4'],
    ['2.2', 'Configuracion del perfil', '4'],
    ['2.3', 'Crear o unirse a un grupo', '5'],
    ['2.4', 'Invitar miembros al grupo', '5'],
    ['3', 'Descripcion de la Interfaz', '6'],
    ['3.1', 'Navegacion principal', '6'],
    ['3.2', 'Tema oscuro y claro', '6'],
    ['4', 'Dashboard Principal', '7'],
    ['4.1', 'Avatar del grupo', '7'],
    ['4.2', 'Tarjeta de saldo personal', '7'],
    ['4.3', 'Resumen financiero del grupo', '7'],
    ['4.4', 'Interpretacion de saldos', '7'],
    ['5', 'Gestion de Transacciones', '8'],
    ['5.1', 'Crear una transaccion', '8'],
    ['5.2', 'Categorias disponibles', '8'],
    ['5.3', 'Split automatico entre participantes', '9'],
    ['5.4', 'Editar y eliminar transacciones', '9'],
    ['5.5', 'Filtros y busqueda', '9'],
    ['5.6', 'Ejemplos practicos', '10'],
    ['6', 'Liquidacion de Deudas', '11'],
    ['6.1', 'Funcionamiento del algoritmo', '11'],
    ['6.2', 'Pantalla de liquidacion', '11'],
    ['6.3', 'Confirmar pagos realizados', '12'],
    ['7', 'Estadisticas y Analisis', '13'],
    ['7.1', 'Tipos de graficos', '13'],
    ['7.2', 'Filtros de estadisticas', '13'],
    ['8', 'Chat Interno', '14'],
    ['8.1', 'Enviar y recibir mensajes', '14'],
    ['8.2', 'Mensajes del sistema', '14'],
    ['9', 'Configuracion y Ajustes', '15'],
    ['9.1', 'Perfil personal', '15'],
    ['9.2', 'Configuracion del grupo', '15'],
    ['9.3', 'Seguridad y acceso', '15'],
    ['10', 'Exportacion de Datos', '16'],
    ['10.1', 'Formatos disponibles', '16'],
    ['10.2', 'Pasos de exportacion', '16'],
    ['11', 'Requisitos Funcionales del Sistema', '17'],
    ['12', 'Preguntas Frecuentes', '20'],
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
  y = h1(doc, y, '1. Introduccion');
  y = sp(y);

  y = h2(doc, y, '1.1 Descripcion del Proyecto');
  y = p(doc, y, 'Cuentas Compartidas es una aplicacion web progresiva disenada para simplificar la gestion financiera colectiva en grupos pequenos. El escenario tipico de uso es un grupo de personas que comparte gastos de manera regular: pisos compartidos donde varios estudiantes o trabajadores dividen el alquiler, la compra y los suministros; familias que gestionan un presupuesto domestico comun; grupos de amigos que organizan viajes o salidas en las que los gastos se distribuyen entre todos; o cualquier colectivo que necesite llevar un control transparente y equitativo de quien paga que y a quien se le debe dinero.');
  y = sp(y);
  y = p(doc, y, 'La aplicacion resuelve uno de los problemas mas habituales en la convivencia y en las actividades de grupo: la dificultad de llevar la cuenta de quien ha pagado que, cuanto debe cada persona y como realizar el menor numero de transferencias posible para saldar todas las deudas. Herramientas como Splitwise o Tricount son populares a nivel internacional, y Cuentas Compartidas ofrece una alternativa completamente en espanol, desarrollada con tecnologia moderna y accesible desde cualquier dispositivo sin necesidad de instalacion.');
  y = sp(y, 2);

  y = h2(doc, y, '1.2 Objetivo del Manual');
  y = p(doc, y, 'Este manual tiene como objetivo guiar al usuario paso a paso en el uso completo de la aplicacion Cuentas Compartidas. Desde el primer registro hasta el uso avanzado de estadisticas y exportacion de datos, cada seccion esta escrita de forma clara y con ejemplos practicos para que cualquier persona, independientemente de su nivel tecnologico, pueda sacar el maximo partido a la herramienta.');
  y = sp(y);
  y = p(doc, y, 'El manual cubre los siguientes aspectos: como registrarse y configurar el perfil de usuario, como crear o unirse a un grupo, como registrar transacciones y entender los calculos de saldo, como interpretar la pantalla de liquidacion de deudas y confirmar pagos, como utilizar el chat interno del grupo, como analizar estadisticas y exportar informes, y como configurar la aplicacion segun las preferencias personales.');
  y = sp(y, 2);

  y = h2(doc, y, '1.3 Publico Destinatario');
  y = p(doc, y, 'Este manual esta dirigido a todos los usuarios de Cuentas Compartidas, sin distincion de perfil tecnico. La aplicacion ha sido disenada bajo el principio de que cualquier persona capaz de usar una aplicacion movil de mensajeria pueda utilizar Cuentas Compartidas de forma intuitiva. Aun asi, este documento ofrece explicaciones detalladas para quienes deseen comprender en profundidad cada funcionalidad disponible.');

  // ---- CAPITULO 2: PRIMEROS PASOS ----
  y = newPage(doc);
  y = h1(doc, y, '2. Primeros Pasos');
  y = sp(y);

  y = h2(doc, y, '2.1 Registro de Usuario');
  y = p(doc, y, 'El primer paso para utilizar Cuentas Compartidas es crear una cuenta personal. El registro es gratuito y solo requiere una direccion de correo electronico valida y una contrasena. Para completarlo, sigue estos pasos:');
  y = bullet(doc, y, 'Accede a la direccion web de la aplicacion desde cualquier navegador moderno (Chrome, Firefox, Edge, Safari).');
  y = bullet(doc, y, 'En la pantalla inicial veras dos opciones: "Iniciar sesion" y "Crear cuenta". Haz clic en "Crear cuenta".');
  y = bullet(doc, y, 'Introduce tu correo electronico en el campo correspondiente. El correo debe ser valido, ya que se utilizara para recuperar la contrasena en caso de olvido.');
  y = bullet(doc, y, 'Elige una contrasena de al menos 6 caracteres. Se recomienda combinar letras, numeros y simbolos para mayor seguridad.');
  y = bullet(doc, y, 'Pulsa el boton "Registrarse". La aplicacion creara tu cuenta en segundos.');
  y = sp(y);
  y = p(doc, y, 'Si el correo ya esta registrado, la aplicacion te informara con un mensaje de error. En ese caso, utiliza la opcion "Iniciar sesion" o "Olvide mi contrasena" si no recuerdas las credenciales de esa cuenta.');
  y = sp(y, 2);

  y = h2(doc, y, '2.2 Configuracion del Perfil');
  y = p(doc, y, 'Una vez registrado, antes de acceder a la aplicacion completa, se te pedira que configures tu perfil. Este paso es obligatorio y solo se realiza una vez. Consta de dos elementos:');
  y = sp(y);
  y = h3(doc, y, '2.2.1 Nombre o Apodo');
  y = p(doc, y, 'Introduce el nombre con el que quieres que te conozcan los demas miembros del grupo. Puede ser tu nombre real, un apodo o cualquier identificador que prefieras. Este nombre aparecera en todas las transacciones, en los calculos de saldo y en los mensajes del chat. Puede modificarse en cualquier momento desde la seccion de Ajustes.');
  y = sp(y);
  y = h3(doc, y, '2.2.2 Seleccion de Avatar');
  y = p(doc, y, 'La aplicacion dispone de mas de 15 avatares 2D diferentes. Selecciona el que mas te guste. Los avatares tienen una caracteristica especial: cambian de expresion segun tu saldo en el grupo. Si tienes saldo positivo (te deben dinero), el avatar muestra una expresion alegre. Si tu saldo es cero, la expresion es neutra. Si debes dinero, el avatar refleja una expresion de preocupacion. Esta funcionalidad es un elemento visual que permite saber de un vistazo el estado financiero de cada miembro.');
  y = sp(y, 2);

  y = h2(doc, y, '2.3 Crear o Unirse a un Grupo');
  y = p(doc, y, 'Tras configurar el perfil, el siguiente paso es crear un grupo nuevo o unirse a uno ya existente. No se puede usar la aplicacion sin pertenecer a un grupo, ya que toda la logica de transacciones y calculos gira en torno al grupo.');
  y = sp(y);
  y = h3(doc, y, '2.3.1 Crear un Grupo Nuevo');
  y = p(doc, y, 'Si vas a empezar un grupo desde cero, selecciona la opcion "Crear Grupo". A continuacion escribe un nombre descriptivo para el grupo, por ejemplo: "Piso Calle Mayor", "Viaje a Paris 2026" o "Familia Lopez". Una vez confirmado, la aplicacion generara automaticamente un codigo de invitacion de 6 caracteres alfanumericos. Este codigo es unico y es el que deberas compartir con el resto de personas que quieres que formen parte del grupo.');
  y = sp(y);
  y = h3(doc, y, '2.3.2 Unirse a un Grupo Existente');
  y = p(doc, y, 'Si alguien ya ha creado un grupo y quiere que te unas, pedirte el codigo de invitacion. Selecciona la opcion "Unirse a Grupo" e introduce el codigo de 6 caracteres. La aplicacion validara el codigo contra la base de datos y si es correcto, te anadira automaticamente al grupo. A partir de ese momento tendras acceso a todas las transacciones, saldos, estadisticas y el chat del grupo.');
  y = sp(y, 2);

  y = h2(doc, y, '2.4 Invitar Miembros al Grupo');
  y = p(doc, y, 'Como administrador o miembro de un grupo, puedes invitar a nuevas personas en cualquier momento. Para hacerlo, accede a la seccion "Ajustes" en la barra de navegacion. En la parte superior de la seccion del grupo encontraras el codigo de invitacion actual. Copia este codigo y comparte lo por cualquier medio: mensaje de WhatsApp, correo electronico, etc. Los nuevos miembros podran unirse usando ese codigo desde la pantalla de inicio de la aplicacion.');
  y = sp(y);
  y = p(doc, y, 'Si por razones de seguridad quieres que el codigo anterior deje de funcionar, puedes regenerarlo desde la misma seccion de Ajustes. Al hacerlo, el codigo anterior queda invalidado y se genera uno nuevo. Las personas ya unidas al grupo no se ven afectadas por este cambio.');

  // ---- CAPITULO 3: INTERFAZ ----
  y = newPage(doc);
  y = h1(doc, y, '3. Descripcion de la Interfaz');
  y = sp(y);

  y = h2(doc, y, '3.1 Navegacion Principal');
  y = p(doc, y, 'La aplicacion cuenta con dos modos de navegacion segun el dispositivo que uses:');
  y = sp(y);
  y = h3(doc, y, '3.1.1 Modo escritorio (pantallas anchas)');
  y = p(doc, y, 'En pantallas de ordenador o tablet en modo horizontal, aparece una barra de navegacion lateral en el lado izquierdo de la pantalla. Esta barra muestra los iconos y nombres de las seis secciones principales: Dashboard, Transacciones, Liquidacion, Estadisticas, Chat y Ajustes. La seccion activa aparece resaltada visualmente.');
  y = sp(y);
  y = h3(doc, y, '3.1.2 Modo movil (pantallas estrechas)');
  y = p(doc, y, 'En smartphones, la navegacion se desplaza a la parte inferior de la pantalla, formando una barra de iconos similar a las aplicaciones nativas de iOS y Android. Cada icono da acceso directo a una seccion. El contenido de la aplicacion ocupa toda la pantalla por encima de esta barra.');
  y = sp(y, 2);

  y = h2(doc, y, '3.2 Tema Oscuro y Claro');
  y = p(doc, y, 'La aplicacion soporta dos modos de apariencia: tema oscuro (fondo oscuro, ideal para uso nocturno o en entornos con poca luz) y tema claro (fondo blanco, mas adecuado en entornos iluminados). Para cambiar entre ellos, busca el icono de sol o luna en la barra de navegacion o en la seccion de Ajustes y haz clic sobre el. El cambio es instantaneo y se guarda automaticamente para que la proxima vez que accedas se mantenga tu preferencia.');

  // ---- CAPITULO 4: DASHBOARD ----
  y = newPage(doc);
  y = h1(doc, y, '4. Dashboard Principal');
  y = sp(y);

  y = p(doc, y, 'El Dashboard es la primera pantalla que ves al iniciar sesion. Es el centro de mando de la aplicacion y te ofrece un resumen completo del estado financiero del grupo de un solo vistazo. Todos los datos se actualizan en tiempo real: si otro miembro del grupo registra una transaccion mientras tienes el Dashboard abierto, los numeros cambian automaticamente sin necesidad de recargar la pagina.');
  y = sp(y, 2);

  y = h2(doc, y, '4.1 Avatar del Grupo');
  y = p(doc, y, 'En la parte superior del Dashboard se muestra el avatar animado del grupo. Este elemento visual representa el estado colectivo del grupo de forma amigable. La expresion del avatar cambia segun el saldo global del grupo, proporcionando una lectura rapida e intuitiva de la situacion financiera sin necesidad de leer numeros.');
  y = sp(y, 2);

  y = h2(doc, y, '4.2 Tarjeta de Saldo Personal');
  y = p(doc, y, 'Cada usuario tiene una tarjeta prominente que muestra su saldo neto actual dentro del grupo. El saldo se calcula automaticamente como la diferencia entre todo lo que has aportado y todo lo que te ha correspondido pagar. El significado del saldo es el siguiente:');
  y = bullet(doc, y, 'Saldo positivo (mostrado en verde, por ejemplo "+45,50 EUR"): los demas miembros del grupo te deben ese dinero en total. Has adelantado mas de lo que te corresponde.');
  y = bullet(doc, y, 'Saldo negativo (mostrado en rojo, por ejemplo "-32,00 EUR"): tu debes ese dinero a los demas miembros. Has pagado menos de lo que te corresponde.');
  y = bullet(doc, y, 'Saldo cero (mostrado en gris, "0,00 EUR"): estas completamente al dia. No debes ni te deben nada.');
  y = sp(y, 2);

  y = h2(doc, y, '4.3 Resumen Financiero del Grupo');
  y = p(doc, y, 'Debajo de tu tarjeta personal aparece un panel con las metricas globales del grupo, con los siguientes datos: total de gastos acumulados desde el inicio del grupo, total de ingresos registrados, saldo colectivo (diferencia entre ingresos y gastos del grupo en conjunto), numero de miembros activos en el grupo y listado de saldos de todos los miembros con sus importes actuales.');
  y = sp(y, 2);

  y = h2(doc, y, '4.4 Interpretacion de Saldos');
  y = p(doc, y, 'Ejemplo practico de lectura de saldos en el Dashboard:');
  y = sp(y);
  y = p(doc, y, '  Juan:  +150,00 EUR  (Le deben dinero, ha adelantado mas que nadie)', 16);
  y = p(doc, y, '  Maria: -45,50 EUR   (Debe dinero, ha pagado menos de su parte)', 16);
  y = p(doc, y, '  Pedro: +20,00 EUR   (Le deben dinero, ha adelantado algo mas de su parte)', 16);
  y = sp(y);
  y = p(doc, y, 'En este ejemplo, Juan ha pagado gastos del grupo por valor de 150 euros mas de los que le corresponden. Maria debe 45,50 euros y Pedro ha adelantado 20 euros mas de su parte. La seccion de Liquidacion calculara automaticamente que Maria debe pagar 45,50 euros a Juan y Pedro debe cobrar 20 euros de Juan, reduciendo todas las deudas al minimo numero de transferencias posible.');

  // ---- CAPITULO 5: TRANSACCIONES ----
  y = newPage(doc);
  y = h1(doc, y, '5. Gestion de Transacciones');
  y = sp(y);

  y = p(doc, y, 'Las transacciones son el elemento central de la aplicacion. Cada gasto o ingreso compartido se registra como una transaccion. A partir de las transacciones registradas, la aplicacion calcula automaticamente los saldos de cada miembro y determina quien debe a quien y cuanto. Es fundamental registrar todas las transacciones para que los calculos sean precisos y equitativos.');
  y = sp(y, 2);

  y = h2(doc, y, '5.1 Crear una Transaccion');
  y = p(doc, y, 'Para registrar una nueva transaccion, accede a la seccion "Transacciones" desde la barra de navegacion. Veras el formulario de nueva transaccion con los siguientes campos obligatorios:');
  y = sp(y);
  y = bullet(doc, y, 'Tipo: selecciona si es un gasto (dinero que se ha gastado) o un ingreso (dinero que ha entrado al grupo, como devoluciones, ingresos extraordinarios o aportes especiales).');
  y = bullet(doc, y, 'Descripcion: escribe que es la transaccion. Silla claro y descriptivo para que todos los miembros entiendan de que se trata. Maximo 100 caracteres. Ejemplos: "Compra semanal en Mercadona", "Alquiler mes de abril", "Cena cumpleanos de Pedro".');
  y = bullet(doc, y, 'Categoria: selecciona la categoria que mejor describe la transaccion. Ver seccion 5.2 para la lista completa de categorias.');
  y = bullet(doc, y, 'Monto: introduce la cantidad exacta en euros. Se admiten decimales separados por punto o coma, por ejemplo 85.50 o 120,00.');
  y = bullet(doc, y, 'Quien pago: selecciona de la lista desplegable el miembro del grupo que desembolso el dinero. Esta persona es la que "adelanto" el pago por el grupo.');
  y = bullet(doc, y, 'Quienes participan: selecciona uno o varios miembros que se benefician del gasto. El monto se dividira equitativamente entre ellos. Puedes seleccionar todos los miembros o solo algunos.');
  y = bullet(doc, y, 'Fecha: por defecto es la fecha actual, pero puedes cambiarla para registrar gastos de dias anteriores.');
  y = sp(y, 2);

  y = h2(doc, y, '5.2 Categorias Disponibles');
  y = p(doc, y, 'Las categorias permiten clasificar y agrupar las transacciones para un mejor analisis posterior. Las categorias disponibles son:');
  y = sp(y);

  const cats = [
    ['Comida', 'Supermercado, restaurantes, comida a domicilio, cafeteria, desayunos, cenas, etc.'],
    ['Transporte', 'Gasolina, peajes, transporte publico, taxi, Uber, alquiler de vehiculos, aparcamiento.'],
    ['Casa / Hogar', 'Alquiler, hipoteca, suministros (agua, luz, gas), limpieza, reparaciones, decoracion.'],
    ['Ocio', 'Cine, conciertos, deportes, videojuegos, excursiones, parques de atracciones.'],
    ['Salud', 'Farmacia, medico, dentista, optica, gimnasio, seguros medicos.'],
    ['Compras', 'Ropa, calzado, electronica, mobiliario, libros, otros articulos personales.'],
    ['Facturas', 'Internet, telefono movil, Netflix, Spotify, seguros del hogar, comunidad.'],
    ['Viajes', 'Vuelos, trenes, hoteles, hostales, excursiones, actividades turisticas.'],
    ['Educacion', 'Cursos, academias, material escolar, libros de texto, tasas universitarias.'],
    ['Ingresos', 'Categoria especial para registrar entradas de dinero al grupo.'],
    ['Otros', 'Cualquier gasto que no encaje en las categorias anteriores.'],
  ];
  cats.forEach(([cat, desc]) => {
    if (y > H - MB - 30) { y = newPage(doc); }
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#2c3e6e').text(cat + ':', ML, y, { width: 95, continued: false });
    doc.font('Helvetica').fontSize(10).fillColor('#222222').text(desc, ML + 100, y, { width: TW - 100 });
    y += doc.heightOfString(desc, { width: TW - 100 }) + 4;
  });
  y = sp(y, 2);

  y = h2(doc, y, '5.3 Split Automatico Entre Participantes');
  y = p(doc, y, 'Cuando introduces una transaccion, la aplicacion calcula automaticamente cuanto debe pagar cada participante. El calculo siempre es una division equitativa del monto total entre el numero de participantes. Si el total no es exactamente divisible (por ejemplo 10 euros entre 3 personas = 3,33 euros por persona), la aplicacion gestiona los redondeos para evitar discrepancias acumuladas. Antes de guardar la transaccion, se muestra un desglose detallado con la parte correspondiente a cada participante y el impacto en el saldo neto de cada uno.');
  y = sp(y);
  y = p(doc, y, 'Ejemplo de desglose: Cena en restaurante, total 90 euros, paga Juan, participan Juan, Maria y Pedro. Cada persona debe 30 euros. Juan adelanto 90 euros pero solo le corresponden 30, por lo que su saldo mejora en +60 euros. Maria y Pedro tienen que pagar 30 euros cada uno, por lo que su saldo disminuye en -30 euros respectivamente.');
  y = sp(y, 2);

  y = h2(doc, y, '5.4 Editar y Eliminar Transacciones');
  y = p(doc, y, 'Puedes modificar cualquier transaccion en cualquier momento. En la lista de transacciones, haz clic sobre la transaccion que quieras editar. Se abrira el formulario con los datos actuales. Modifica los campos que necesites y guarda los cambios. Los saldos de todos los miembros se recalcularan inmediatamente de forma automatica reflejando la modificacion.');
  y = sp(y);
  y = p(doc, y, 'Para eliminar una transaccion, abre la transaccion y busca el boton "Eliminar". La aplicacion pedira confirmacion antes de proceder, ya que esta accion no se puede deshacer. Una vez eliminada, los saldos se recalculan sin esa transaccion.');
  y = sp(y, 2);

  y = h2(doc, y, '5.5 Filtros y Busqueda');
  y = p(doc, y, 'Cuando el numero de transacciones crece, los filtros permiten encontrar rapidamente lo que buscas. Puedes filtrar por categoria (selecciona una o varias categorias para mostrar solo ese tipo), por persona (muestra solo transacciones en las que participo un miembro concreto), por rango de fechas (selecciona fecha de inicio y fin para ver un periodo especifico) y por texto libre (escribe palabras de la descripcion y el listado se filtra en tiempo real mientras escribes).');
  y = sp(y, 2);

  y = h2(doc, y, '5.6 Ejemplos Practicos');
  y = sp(y);

  y = h3(doc, y, 'Ejemplo 1: Compra compartida en el supermercado');
  y = p(doc, y, 'Escenario: Maria va al supermercado y hace la compra para todos. El ticket asciende a 85,50 euros. En el piso viven Maria, Juan y Pedro.');
  y = bullet(doc, y, 'Tipo: Gasto');
  y = bullet(doc, y, 'Descripcion: Compra semanal Mercadona');
  y = bullet(doc, y, 'Categoria: Comida');
  y = bullet(doc, y, 'Monto: 85,50 EUR');
  y = bullet(doc, y, 'Quien pago: Maria');
  y = bullet(doc, y, 'Participan: Maria, Juan, Pedro');
  y = bullet(doc, y, 'Resultado: cada uno debe 28,50 EUR. Maria neto: +57,00 EUR. Juan: -28,50. Pedro: -28,50.');
  y = sp(y);

  y = h3(doc, y, 'Ejemplo 2: Pago de la factura del internet');
  y = p(doc, y, 'Escenario: Juan paga la factura del internet, 45 euros al mes. Todos se benefician.');
  y = bullet(doc, y, 'Tipo: Gasto');
  y = bullet(doc, y, 'Descripcion: Factura Internet Mayo');
  y = bullet(doc, y, 'Categoria: Facturas');
  y = bullet(doc, y, 'Monto: 45,00 EUR');
  y = bullet(doc, y, 'Quien pago: Juan');
  y = bullet(doc, y, 'Participan: Juan, Maria, Pedro');
  y = bullet(doc, y, 'Resultado: cada uno debe 15 EUR. Juan neto: +30,00 EUR. Maria: -15,00. Pedro: -15,00.');
  y = sp(y);

  y = h3(doc, y, 'Ejemplo 3: Ingreso por venta de mueble compartido');
  y = p(doc, y, 'Escenario: El grupo vende un mueble comun en Wallapop por 120 euros. Lo cobra Pedro.');
  y = bullet(doc, y, 'Tipo: Ingreso');
  y = bullet(doc, y, 'Descripcion: Venta sofa Wallapop');
  y = bullet(doc, y, 'Categoria: Ingresos');
  y = bullet(doc, y, 'Monto: 120,00 EUR');
  y = bullet(doc, y, 'Quien cobro: Pedro');
  y = bullet(doc, y, 'Participan: Maria, Juan, Pedro');
  y = bullet(doc, y, 'Resultado: los 120 euros se dividen en 3. Pedro neto: +80 (cobro 120, debe 40). Maria y Juan: +40 cada uno.');

  // ---- CAPITULO 6: LIQUIDACION ----
  y = newPage(doc);
  y = h1(doc, y, '6. Liquidacion de Deudas');
  y = sp(y);

  y = p(doc, y, 'La seccion de Liquidacion es donde la aplicacion calcula de forma automatica el numero minimo de transferencias necesario para que todos los miembros queden con saldo cero. Este calculo utiliza un algoritmo matematico probado que garantiza la solucion optima, es decir, el menor numero de pagos posibles. Es el equivalente al sistema de Tricount o Splitwise, implementado de forma nativa en la aplicacion.');
  y = sp(y, 2);

  y = h2(doc, y, '6.1 Funcionamiento del Algoritmo');
  y = p(doc, y, 'El algoritmo de liquidacion sigue los siguientes pasos de forma automatica:');
  y = sp(y);
  y = bullet(doc, y, 'Paso 1: Se calculan los saldos netos de cada persona. El saldo neto es la diferencia entre lo que ha aportado y lo que le ha correspondido pagar en todos los gastos.');
  y = bullet(doc, y, 'Paso 2: Se clasifican los miembros en dos grupos: acreedores (saldo positivo, se les debe dinero) y deudores (saldo negativo, deben dinero).');
  y = bullet(doc, y, 'Paso 3: Se ordenan ambos grupos de mayor a menor segun el importe absoluto.');
  y = bullet(doc, y, 'Paso 4: En cada iteracion, el mayor deudor paga al mayor acreedor la cantidad minima entre lo que debe y lo que se le debe al acreedor. Con cada pago, al menos uno de los dos queda saldado.');
  y = bullet(doc, y, 'Paso 5: Se repite hasta que todos los saldos son cero.');
  y = sp(y);
  y = p(doc, y, 'Este metodo garantiza que el numero de transferencias es siempre el minimo posible. En la practica, si hay N personas en el grupo, el maximo de transferencias sera N-1, pero habitualmente son muchas menos.');
  y = sp(y, 2);

  y = h2(doc, y, '6.2 Pantalla de Liquidacion');
  y = p(doc, y, 'La pantalla de Liquidacion muestra tres secciones principales. La primera es el resumen financiero global con los totales de gastos, ingresos y saldo colectivo. La segunda seccion muestra los saldos individuales de cada miembro con sus importes. La tercera seccion lista las transferencias necesarias, indicando para cada una quien paga, quien cobra y el importe exacto. Por ejemplo:');
  y = sp(y);
  y = p(doc, y, '  Maria debe pagar 45,50 EUR a Juan', 20);
  y = p(doc, y, '  Pedro debe pagar 20,00 EUR a Juan', 20);
  y = sp(y);
  y = p(doc, y, 'Con solo dos transferencias quedan saldadas todas las deudas de tres personas, independientemente del numero de transacciones registradas.');
  y = sp(y, 2);

  y = h2(doc, y, '6.3 Confirmar Pagos Realizados');
  y = p(doc, y, 'Cuando un miembro realiza efectivamente una transferencia, puede registrarlo en la aplicacion para que los saldos se actualicen. El proceso es:');
  y = bullet(doc, y, 'En la pantalla de Liquidacion, localiza la transferencia correspondiente en la lista.');
  y = bullet(doc, y, 'Activa el selector o casilla "Confirmar pago" junto a esa transferencia.');
  y = bullet(doc, y, 'Haz clic en el boton "Confirmar".');
  y = bullet(doc, y, 'La aplicacion creara automaticamente una transaccion de tipo ingreso que refleja el pago realizado.');
  y = bullet(doc, y, 'Se generara un mensaje automatico en el chat del grupo indicando que se confirmo el pago, con los detalles.');
  y = bullet(doc, y, 'Los saldos de los dos implicados se actualizaran inmediatamente para todos los miembros.');

  // ---- CAPITULO 7: ESTADISTICAS ----
  y = newPage(doc);
  y = h1(doc, y, '7. Estadisticas y Analisis');
  y = sp(y);

  y = p(doc, y, 'La seccion de Estadisticas transforma los datos de transacciones en visualizaciones graficas que permiten entender los patrones de gasto del grupo, identificar quien contribuye mas, ver en que categorias se gasta mas dinero y analizar la evolucion del gasto a lo largo del tiempo. Esta seccion es especialmente util para grupos que quieren mejorar su gestion presupuestaria.');
  y = sp(y, 2);

  y = h2(doc, y, '7.1 Tipos de Graficos');
  y = sp(y);
  y = h3(doc, y, 'Grafico de sectores: Gastos por Categoria');
  y = p(doc, y, 'Muestra en un grafico circular (tipo tarta) la distribucion porcentual de los gastos por categoria. Cada sector tiene un color diferente y muestra el porcentaje y el importe correspondiente. Este grafico permite identificar de un vistazo en que categorias se concentra el mayor gasto. Por ejemplo, si el 45% del gasto es "Casa/Hogar" y el 30% es "Comida", el grupo sabe donde puede reducir si necesita ahorrar.');
  y = sp(y);
  y = h3(doc, y, 'Grafico de barras: Gastos por Persona');
  y = p(doc, y, 'Muestra una barra por cada miembro del grupo con el total que ha pagado. Permite comparar rapidamente quien ha desembolsado mas dinero, aunque esto no equivale a quien debe mas, ya que depende de en cuantos gastos participa cada uno.');
  y = sp(y);
  y = h3(doc, y, 'Grafico de lineas: Evolucion Mensual');
  y = p(doc, y, 'Muestra la evolucion de los gastos totales mes a mes. Permite identificar tendencias: si el gasto esta aumentando, si hubo un mes excepcional (por ejemplo, el mes de las vacaciones), o si el grupo esta logrando reducir gastos.');
  y = sp(y);
  y = h3(doc, y, 'Grafico de barras horizontales: Balance Neto');
  y = p(doc, y, 'Muestra el saldo neto actual de cada miembro. Las barras verdes indican saldo positivo (le deben dinero) y las barras rojas indican saldo negativo (debe dinero). Este grafico es el resumen visual de la situacion de deudas.');
  y = sp(y, 2);

  y = h2(doc, y, '7.2 Filtros de Estadisticas');
  y = p(doc, y, 'Todos los graficos pueden filtrarse por diferentes criterios para analizar periodos o subconjuntos especificos de datos. Los filtros disponibles son: por periodo de tiempo (ultimos 7 dias, ultimos 30 dias, este mes, este trimestre, este ano completo, o un rango de fechas personalizado), por categoria (muestra solo las transacciones de una categoria), y por miembro del grupo (analiza las transacciones de una persona en concreto).');

  // ---- CAPITULO 8: CHAT ----
  y = newPage(doc);
  y = h1(doc, y, '8. Chat Interno');
  y = sp(y);

  y = p(doc, y, 'El Chat Interno es una herramienta de comunicacion integrada en la aplicacion que permite a todos los miembros del grupo comunicarse sin necesidad de salir a otra aplicacion de mensajeria. El historial de mensajes es ilimitado: todos los mensajes se guardan en la base de datos y estan disponibles desde cualquier dispositivo en cualquier momento. La sincronizacion es en tiempo real: cuando alguien envia un mensaje, aparece instantaneamente en los dispositivos de todos los miembros conectados.');
  y = sp(y, 2);

  y = h2(doc, y, '8.1 Enviar y Recibir Mensajes');
  y = p(doc, y, 'Para enviar un mensaje, accede a la seccion "Chat", escribe el mensaje en el campo de texto de la parte inferior de la pantalla y pulsa el boton de enviar o la tecla Enter. El mensaje aparecera en la parte inferior de la conversacion con tu nombre, el texto y la hora de envio. Los mensajes de otros miembros aparecen a la izquierda y los tuyos a la derecha, siguiendo la convencion estandar de las aplicaciones de mensajeria.');
  y = sp(y, 2);

  y = h2(doc, y, '8.2 Mensajes del Sistema');
  y = p(doc, y, 'Ademas de los mensajes manuales, el chat incluye mensajes automaticos del sistema. Estos se generan cuando ocurren eventos importantes en la aplicacion, principalmente cuando un miembro confirma un pago de liquidacion. Un mensaje del sistema tiene el formato "Juan confirmo pago: Maria paga 45,50 EUR a Juan" y aparece con un estilo visual diferente al de los mensajes normales (normalmente en un color distinto o con un icono especial) para que se distinga claramente. Estos mensajes sirven como registro permanente de los pagos realizados dentro del grupo.');

  // ---- CAPITULO 9: AJUSTES ----
  y = newPage(doc);
  y = h1(doc, y, '9. Configuracion y Ajustes');
  y = sp(y);

  y = h2(doc, y, '9.1 Perfil Personal');
  y = p(doc, y, 'En la seccion de Ajustes puedes modificar tu perfil personal en cualquier momento. Los campos editables son el nombre (el apodo o identificador que ven los demas miembros del grupo) y el avatar (la imagen que te representa). Cualquier cambio se refleja inmediatamente en todas las pantallas de la aplicacion para todos los miembros del grupo. Tu correo electronico registrado tambien se muestra en esta seccion pero no puede modificarse directamente desde la aplicacion.');
  y = sp(y, 2);

  y = h2(doc, y, '9.2 Configuracion del Grupo');
  y = p(doc, y, 'Esta subseccion muestra el nombre del grupo actual (editable), el codigo de invitacion actual (con boton para copiarlo al portapapeles y otro para regenerarlo) y la lista de todos los miembros con sus saldos actuales. Si el grupo necesita un nuevo codigo por razones de seguridad, el boton "Regenerar codigo" crea uno nuevo e invalida el anterior. Las personas ya unidas al grupo no se ven afectadas.');
  y = sp(y, 2);

  y = h2(doc, y, '9.3 Seguridad y Acceso');
  y = p(doc, y, 'Para cambiar la contrasena de acceso, busca la opcion "Cambiar contrasena" en la seccion de seguridad. Deberas introducir tu contrasena actual para verificar tu identidad y luego introducir la nueva contrasena dos veces. La nueva contrasena debe tener al menos 6 caracteres. Para cerrar sesion, utiliza el boton "Cerrar sesion". La aplicacion te desconectara y te llevara a la pantalla de inicio. Si quieres abandonar el grupo actual, existe la opcion "Abandonar grupo" en la seccion del grupo, pero ten en cuenta que perderds acceso a todos los datos de ese grupo.');

  // ---- CAPITULO 10: EXPORTACION ----
  y = newPage(doc);
  y = h1(doc, y, '10. Exportacion de Datos');
  y = sp(y);

  y = p(doc, y, 'La aplicacion permite exportar los datos del grupo en varios formatos para su uso externo: analisis avanzado, archivado, presentaciones o integracion con otras herramientas. La exportacion incluye todas las transacciones del grupo con sus metadatos completos.');
  y = sp(y, 2);

  y = h2(doc, y, '10.1 Formatos Disponibles');
  y = sp(y);
  y = h3(doc, y, 'Excel (.xlsx)');
  y = p(doc, y, 'Genera un archivo Excel con una hoja de calculo que incluye todas las transacciones en filas, con columnas para fecha, descripcion, categoria, monto, quien pago, quienes participaron y el saldo resultante de cada participante. Este formato es ideal para usuarios que quieran hacer calculos adicionales, crear tablas dinamicas o generar sus propios graficos.');
  y = sp(y);
  y = h3(doc, y, 'PDF');
  y = p(doc, y, 'Genera un documento PDF profesional con portada, resumen financiero del periodo, tabla de saldos por miembro, listado completo de transacciones y las recomendaciones de pago calculadas por el algoritmo. Este formato es adecuado para presentaciones formales, entrega a gestores o simple archivado en papel.');
  y = sp(y);
  y = h3(doc, y, 'CSV');
  y = p(doc, y, 'Genera un archivo de texto con valores separados por comas. Es el formato mas universal para importar datos en cualquier sistema externo, desde hojas de calculo hasta bases de datos o scripts de analisis de datos.');
  y = sp(y, 2);

  y = h2(doc, y, '10.2 Pasos de Exportacion');
  y = p(doc, y, 'Para exportar en formato Excel o CSV: accede a la seccion de Transacciones, aplica los filtros que desees para acotar el periodo o las categorias a exportar, y busca el boton "Exportar" con el formato deseado. El archivo se descargara automaticamente en tu dispositivo. Para exportar en PDF: accede a la seccion de Estadisticas, configura los filtros deseados, y utiliza el boton "Exportar a PDF". Se generara una vista previa y podras descargarlo con el boton correspondiente.');

  // ---- CAPITULO 11: REQUISITOS ----
  y = newPage(doc);
  y = h1(doc, y, '11. Requisitos Funcionales del Sistema');
  y = sp(y);

  y = p(doc, y, 'A continuacion se listan los requisitos funcionales que la aplicacion debe cumplir. Estos requisitos definen el comportamiento esperado del sistema desde el punto de vista del usuario.');
  y = sp(y);

  y = reqTable(doc, y, 'RF-01 Registro de usuario', 'Funcional', 'Alta',
    'El sistema debe permitir a cualquier persona crear una cuenta nueva introduciendo un correo electronico valido y una contrasena de al menos 6 caracteres. Si el correo ya esta en uso, el sistema debe mostrar un mensaje de error claro. El registro debe completarse en menos de 3 segundos bajo condiciones normales de red.');
  y = reqTable(doc, y, 'RF-02 Inicio de sesion', 'Funcional', 'Alta',
    'El sistema debe permitir a usuarios registrados iniciar sesion con su correo y contrasena. El sistema debe gestionar sesiones persistentes de forma que el usuario no tenga que iniciar sesion en cada visita si no ha cerrado sesion previamente. En caso de credenciales incorrectas, debe mostrarse un mensaje de error sin revelar si el correo existe o no.');
  y = reqTable(doc, y, 'RF-03 Recuperacion de contrasena', 'Funcional', 'Alta',
    'El sistema debe ofrecer un mecanismo de recuperacion de contrasena mediante el envio de un enlace de restablecimiento al correo registrado. El enlace debe tener una caducidad de 24 horas por razones de seguridad.');
  y = reqTable(doc, y, 'RF-04 Configuracion de perfil', 'Funcional', 'Alta',
    'El usuario debe poder establecer un nombre visible y seleccionar un avatar entre los disponibles. Ambos datos deben poder modificarse en cualquier momento desde los ajustes.');
  y = reqTable(doc, y, 'RF-05 Creacion de grupo', 'Funcional', 'Alta',
    'El sistema debe permitir crear grupos con un nombre descriptivo. Al crear el grupo se genera automaticamente un codigo de invitacion unico de 6 caracteres. El creador del grupo se convierte automaticamente en miembro.');
  y = reqTable(doc, y, 'RF-06 Union a grupo', 'Funcional', 'Alta',
    'El sistema debe permitir unirse a un grupo existente introduciendo el codigo de invitacion. El sistema debe validar el codigo en tiempo real y proporcionar retroalimentacion inmediata sobre si es valido o no.');
  y = reqTable(doc, y, 'RF-07 Registro de transacciones', 'Funcional', 'Alta',
    'El sistema debe permitir crear transacciones de tipo gasto o ingreso con descripcion, categoria, monto, quién pago y quienes participan. El sistema debe calcular y mostrar el desglose de la transaccion antes de guardar.');
  y = reqTable(doc, y, 'RF-08 Calculo de saldos en tiempo real', 'Funcional', 'Alta',
    'El sistema debe recalcular automaticamente los saldos netos de todos los miembros cada vez que se cree, modifique o elimine una transaccion. Los cambios deben propagarse a todos los dispositivos conectados en tiempo real.');
  y = reqTable(doc, y, 'RF-09 Algoritmo de liquidacion', 'Funcional', 'Alta',
    'El sistema debe calcular el numero minimo de transferencias necesarias para saldar todas las deudas del grupo usando el algoritmo greedy. El resultado debe mostrarse como una lista de pagos ordenados de mayor a menor importe.');
  y = reqTable(doc, y, 'RF-10 Confirmacion de pagos', 'Funcional', 'Media',
    'El sistema debe permitir confirmar que un pago de liquidacion se ha realizado. Al confirmar, debe crearse una transaccion de ingreso y enviarse un mensaje automatico al chat del grupo.');
  y = reqTable(doc, y, 'RF-11 Chat de grupo', 'Funcional', 'Media',
    'El sistema debe ofrecer un canal de mensajeria para los miembros del grupo con historial ilimitado. Los mensajes deben sincronizarse en tiempo real. El chat debe admitir mensajes del sistema generados automaticamente.');
  y = reqTable(doc, y, 'RF-12 Estadisticas y graficos', 'Funcional', 'Media',
    'El sistema debe mostrar graficos de gastos por categoria, por persona, evolucion mensual y balance neto. Los graficos deben actualizarse al cambiar los filtros de periodo, categoria o miembro.');
  y = reqTable(doc, y, 'RF-13 Exportacion de datos', 'Funcional', 'Baja',
    'El sistema debe permitir exportar los datos de transacciones en formato Excel (.xlsx), PDF y CSV. La exportacion debe respetar los filtros activos en el momento de solicitarla.');
  y = reqTable(doc, y, 'RF-14 Tema oscuro y claro', 'No Funcional', 'Baja',
    'La aplicacion debe ofrecer dos modos de apariencia (oscuro y claro). La preferencia del usuario debe guardarse en el navegador y aplicarse automaticamente en proximas sesiones.');
  y = reqTable(doc, y, 'RF-15 Interfaz responsive', 'No Funcional', 'Alta',
    'La aplicacion debe funcionar correctamente en dispositivos moviles (smartphones), tabletas y ordenadores de escritorio. La navegacion debe adaptarse al tamaño de pantalla: barra lateral en escritorio, barra inferior en movil.');

  // ---- CAPITULO 12: FAQ ----
  y = newPage(doc);
  y = h1(doc, y, '12. Preguntas Frecuentes');
  y = sp(y);

  const faqs = [
    ['Es segura la aplicacion?',
     'Si. La aplicacion utiliza Firebase de Google como backend, que incluye cifrado de datos en transito mediante HTTPS/TLS. Las contrasenas nunca se almacenan en texto plano: Firebase Authentication gestiona el almacenamiento con algoritmos de cifrado de nivel industrial. Ademas, las reglas de seguridad de Firestore garantizan que solo los miembros de un grupo pueden acceder a sus datos.'],
    ['Puedo usar la aplicacion sin conexion a internet?',
     'No completamente. La aplicacion requiere conexion a internet para sincronizar los datos con el servidor. Sin embargo, la interfaz esta optimizada para funcionar con conexiones lentas o intermitentes. Si pierdes la conexion momentaneamente, la aplicacion intentara sincronizar los cambios cuando se restablezca.'],
    ['Cuantas personas pueden estar en un grupo?',
     'No hay un limite tecnico rigido para el numero de miembros de un grupo. Sin embargo, la aplicacion esta disenada y optimizada para grupos de entre 2 y 15 personas, que es el rango habitual para pisos compartidos, familias y grupos de amigos.'],
    ['Puedo estar en varios grupos a la vez?',
     'Actualmente cada usuario pertenece a un grupo a la vez. Si necesitas gestionar varios grupos distintos (por ejemplo, el piso y un viaje), deberias hacerlo con el mismo grupo o crear cuentas separadas para cada contexto.'],
    ['Que pasa si elimino una transaccion por error?',
     'La eliminacion de transacciones es permanente y no se puede deshacer. Por eso la aplicacion pide confirmacion antes de eliminar. Si has eliminado algo por error, tendras que volver a registrar la transaccion manualmente con los datos correctos.'],
    ['El calculo de pagos optimos es siempre correcto?',
     'Si. El algoritmo greedy utilizado garantiza matematicamente que la lista de pagos resultante es la minima posible para saldar todas las deudas. Ningun otro conjunto de pagos puede resolver las deudas con menos transferencias que las calculadas por el sistema.'],
    ['Por que mi saldo cambia constantemente?',
     'Los saldos se recalculan automaticamente cada vez que se crea, modifica o elimina una transaccion. Si varios miembros estan registrando transacciones al mismo tiempo, veras como tu saldo cambia en tiempo real. Esto es el comportamiento esperado y garantiza que los datos siempre esten actualizados.'],
    ['Puedo cambiar quien pago una transaccion despues de guardarla?',
     'Si. Puedes editar cualquier campo de una transaccion, incluido quien pago y quienes participan, en cualquier momento. Los saldos se recalculan automaticamente tras cada modificacion.'],
    ['Como funciona la exportacion a PDF?',
     'La exportacion a PDF genera un documento formal con portada, resumen financiero, tabla de saldos y listado de transacciones. Este PDF se genera directamente en el navegador usando la libreria jsPDF y se descarga automaticamente a tu dispositivo. No requiere conexion a ningun servidor externo.'],
    ['Que hago si olvido la contrasena?',
     'En la pantalla de inicio de sesion, haz clic en el enlace "Olvide mi contrasena". Escribe tu correo electronico registrado y se enviara un enlace de restablecimiento. El enlace tiene una validez de 24 horas. Si no recibes el correo, revisa la carpeta de spam o promociones.'],
  ];

  faqs.forEach(([q, a]) => {
    if (y > H - MB - 70) { y = newPage(doc); }
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1a1a2e');
    doc.text('P: ' + q, ML, y, { width: TW });
    y += 14;
    doc.font('Helvetica').fontSize(10).fillColor('#333333');
    const ht = doc.heightOfString('R: ' + a, { width: TW });
    if (y + ht > H - MB - 10) { y = newPage(doc); }
    doc.text('R: ' + a, ML, y, { width: TW, align: 'justify', lineGap: 1.5 });
    y += ht + 14;
  });

  // Finalizar
  doc.flushPages();
  addFooters(doc, 'Manual de Usuario');
  doc.end();
  return new Promise(r => doc.on('end', r));
};

await buildManual();
console.log('MANUAL_DE_USUARIO.pdf generado correctamente');
