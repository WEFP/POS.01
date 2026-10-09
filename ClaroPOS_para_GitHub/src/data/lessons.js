/**
 * CAPA PEDAGÓGICA: cada evento de la UI produce una "lección" con datos EN VIVO.
 * Nunca se incluye el PIN real en las lecciones.
 */
import { RE_PHONE, RE_PIN } from '../utils/ussd';

const code = (...lines) => lines.join('\n');

export const LESSONS = {
  WELCOME: () => ({
    concept: 'Estado y navegación',
    title: 'Consola del Desarrollador',
    text: 'Cada toque que hagas aquí explica qué concepto de programación ocurre por dentro. Esta app cambia de pantalla modificando una variable de estado.',
    code: code("const [screen, setScreen] = useState('home');", '', "setScreen('packages'); // la UI se redibuja sola"),
    live: 'screen = "home"',
  }),

  SELECT_SECTION: ({ section, count }) => ({
    concept: 'Arreglos, filtros y .map()',
    title: `Sección "${section.title}"`,
    text: 'El catálogo es un arreglo de objetos. Filtramos los de esta sección y usamos .map() para dibujar una tarjeta por cada uno.',
    code: code(
      `const lista = CATALOG.filter(p => p.section === ${section.id});`,
      'lista.map(p => <Tarjeta paquete={p} />);',
    ),
    live: `lista.length = ${count}`,
  }),

  SELECT_PACKAGE: ({ pkg }) => ({
    concept: 'Objetos, propiedades y modelado de datos (JSON / Clases)',
    title: 'Un paquete es un objeto',
    text: 'Modelamos el mundo real con datos: cada paquete tiene propiedades (nombre, precio, vigencia). El mismo modelo se puede escribir como JSON o como clase.',
    code: code(
      JSON.stringify(
        { section: pkg.section, option: pkg.option, name: pkg.name, vigencia: pkg.vigencia, price: pkg.price, needsPhone: pkg.needsPhone },
        null, 2,
      ),
      '',
      'class Paquete {',
      '  constructor(section, option, price) { ... }',
      '}',
    ),
    live: `pkg.price = ${pkg.price}   // tipo: ${typeof pkg.price}`,
  }),

  INPUT: ({ pkg, phone, pin, phoneOk, pinOk }) => ({
    concept: 'Inputs, Regex y manejo de estado',
    title: 'Validando lo que escribes',
    text: 'Cada tecla actualiza una variable de estado y la expresión regular decide si el dato es válido. Sin validación, un error de tipeo se vuelve una recarga al número equivocado.',
    code: code(
      `const RE_PHONE = ${RE_PHONE};   // exactamente 8 dígitos`,
      `const RE_PIN   = ${RE_PIN};        // 4 a 6 dígitos`,
      '',
      pkg.needsPhone ? `RE_PHONE.test("${phone}") // ${phoneOk}` : '// esta consulta no usa teléfono',
      `RE_PIN.test("${'•'.repeat(pin.length)}")   // ${pinOk}`,
    ),
    live: `phone = "${phone}"  |  pin.length = ${pin.length}`,
  }),

  SEND: ({ pkg, masked, uri }) => ({
    concept: 'Concatenación de strings, funciones y métodos asíncronos',
    title: 'Armando y enviando el comando',
    text: 'buildUssd() recibe parámetros y devuelve un string. dial() es asíncrono: devuelve una promesa y await espera la respuesta del sistema sin congelar la pantalla.',
    code: code(
      'const ussd = buildUssd(pkg, phone, pin);',
      `// "*905" + "*${pkg.section}" + "*${pkg.option}" + ...`,
      `// => ${masked}`,
      '',
      "// '#' se codifica como %23:",
      `// ${uri}`,
      '',
      'await dial(ussd); // método asíncrono',
    ),
    live: `ussd.length = ${masked.length} caracteres`,
  }),

  USSD_RESPONSE: ({ response, parsed }) => ({
    concept: 'Promesas, callbacks nativos y respuestas del servidor',
    title: 'El operador respondió',
    text: 'sendUssd() devuelve una promesa. Android llama a un callback cuando el operador contesta, la promesa se resuelve y await nos entrega el texto para analizarlo.',
    code: code(
      'const respuesta = await sendUssd(ussd);',
      'const datos = parseSms({ body: respuesta });',
      '',
      `// ${(response ?? '').slice(0, 90)}`,
    ),
    live: `status = ${parsed.status}`,
  }),

  SMS: ({ sms, parsed }) => ({
    concept: 'Listeners, callbacks, eventos y parsing de texto',
    title: 'Llegó un SMS de Claro',
    text: 'No preguntamos "¿ya llegó?". Registramos un listener y Android nos llama (callback) cuando ocurre el evento. Luego extraemos datos del texto con expresiones regulares.',
    code: code(
      'startSmsListener((sms) => {   // callback',
      '  const datos = parseSms(sms);',
      '});',
      '',
      '// Texto recibido:',
      `// ${(sms.body ?? '').slice(0, 90)}`,
      '',
      JSON.stringify({ status: parsed.status, txId: parsed.txId, amount: parsed.amount, phone: parsed.phone }, null, 2),
    ),
    live: `status = ${parsed.status}`,
  }),
};

export const getLesson = (event, data = {}) => LESSONS[event](data);
