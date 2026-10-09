/**
 * CATÁLOGO DE PAQUETES (Modelado de datos)
 * Fuente: tarifario oficial "SuperPacks a través de tu POS de Recargas Claro en *905#".
 * Cada paquete es un OBJETO con PROPIEDADES; el comando USSD se arma desde
 * `section` + `option` (ver utils/ussd.js).
 */

// Fábrica: evita repetir propiedades comunes en cada paquete.
const P = (section, option, name, vigencia, price, content, extra = {}) => ({
  section, option, name, vigencia, price, content,
  needsPhone: true, isNew: false, ...extra,
});

export const SECTIONS = [
  { id: 2, key: 'internet',  title: 'Internet',        icon: '🌐', hint: 'Datos + apps' },
  { id: 3, key: 'minutos',   title: 'Minutos y SMS',   icon: '📞', hint: 'Nac. / USA' },
  { id: 4, key: 'todo',      title: 'Todo Incluido',   icon: '🎁', hint: 'Llamadas + GB' },
  { id: 5, key: 'redes',     title: 'Redes Sociales',  icon: '💬', hint: 'Apps ilimitadas' },
  { id: 7, key: 'ifi',       title: 'Internet Casa',   icon: '🏠', hint: 'IFI / One Play' },
  { id: 6, key: 'consultas', title: 'Consultas',       icon: '📊', hint: 'Ventas y saldo' },
];

const TODO = 'Llamadas Nacionales/USA + ';
const REDES = 'Redes sociales incluidas según tarifario (ver iconos del SuperPack)';

export const CATALOG = [
  // 2 · INTERNET
  P(2, 1, '1.6 GB + apps',  '1 día',   8,   '1.6 GB de datos + apps incluidas'),
  P(2, 2, '3.1 GB + apps',  '2 días',  13,  '3.1 GB de datos + apps incluidas'),
  P(2, 3, '4 GB + apps',    '3 días',  18,  '4 GB de datos + apps incluidas'),
  P(2, 4, '4 GB + apps',    '1 día',   15,  '4 GB de datos + apps incluidas'),
  P(2, 5, '7 GB + apps',    '7 días',  35,  '7 GB de datos + apps incluidas'),
  P(2, 6, '9 GB + apps',    '15 días', 65,  '9 GB de datos + apps incluidas'),
  P(2, 7, '15 GB + apps',   '30 días', 120, '15 GB de datos + apps incluidas'),
  P(2, 8, 'Noches ilimitado', '10pm a 6am', 6, 'Internet ilimitado nocturno (política de uso justo)'),
  // 3 · MINUTOS Y SMS
  P(3, 1, '50 Min + 50 SMS',   '1 día',   8,  '50 minutos y 50 SMS Nac./USA'),
  P(3, 2, '120 Min + 120 SMS', '2 días',  13, '120 minutos y 120 SMS Nac./USA'),
  P(3, 3, '180 Min + 180 SMS', '3 días',  15, '180 minutos y 180 SMS Nac./USA'),
  P(3, 4, '225 Min + 225 SMS', '7 días',  25, '225 minutos y 225 SMS Nac./USA'),
  P(3, 5, '600 Min + 600 SMS', '15 días', 50, '600 minutos y 600 SMS Nac./USA'),
  P(3, 6, '120 Min + 120 SMS', '7 días',  15, '120 minutos y 120 SMS Nac./USA'),
  // 4 · TODO INCLUIDO
  P(4, 1, 'Llamadas + 1.5 GB', '1 día',   10,  TODO + '1.5 GB + apps'),
  P(4, 2, 'Llamadas + 2.5 GB', '2 días',  15,  TODO + '2.5 GB + apps'),
  P(4, 3, 'Llamadas + 7 GB',   '7 días',  35,  TODO + '7 GB + apps'),
  P(4, 4, 'Llamadas + 10 GB',  '15 días', 65,  TODO + '10 GB + apps'),
  P(4, 5, 'Llamadas + 17 GB',  '30 días', 120, TODO + '17 GB + apps'),
  P(4, 6, 'Llamadas + 3.5 GB', '3 días',  20,  TODO + '3.5 GB + apps'),
  P(4, 7, 'Llamadas + 2 GB',   '1 día',   12,  TODO + '2 GB + apps', { isNew: true }),
  P(4, 8, 'Llamadas + 9 GB',   '7 días',  40,  TODO + '9 GB + apps', { isNew: true }),
  P(4, 9, 'Llamadas + 11 GB',  '15 días', 75,  TODO + '11 GB + apps', { isNew: true }),
  // 5 · REDES SOCIALES
  P(5, 1, 'Redes Sociales', '1 día',   6,  REDES),
  P(5, 2, 'Redes Sociales', '7 días',  25, REDES),
  P(5, 3, 'Redes Sociales', '30 días', 60, REDES),
  P(5, 4, 'Redes Sociales', '2 días',  11, REDES),
  P(5, 5, 'Redes Sociales', '3 días',  15, REDES),
  P(5, 6, 'Redes Sociales', '7 días',  30, REDES),
  // 7 · IFI PREPAGO / ONE PLAY
  P(7, 1, 'Casa 20 GB',  '7 días',  75,  '20 GB de internet para el hogar'),
  P(7, 2, 'Casa 40 GB',  '15 días', 130, '40 GB de internet para el hogar'),
  P(7, 3, 'Casa 80 GB',  '30 días', 230, '80 GB de internet para el hogar'),
  P(7, 4, 'Casa 150 GB', '30 días', 330, '150 GB de internet para el hogar'),
  // 6 · CONSULTAS (las 1-3 no llevan teléfono: *905*6*N*PIN*1#)
  P(6, 1, 'Últimas 5 transacciones', '—', null, 'Muestra tus últimas 5 transacciones', { needsPhone: false }),
  P(6, 2, 'Resumen del día',          '—', null, 'Resumen de tus ventas del día',        { needsPhone: false }),
  P(6, 3, 'Venta total del día',      '—', null, 'Total vendido hoy',                    { needsPhone: false }),
  P(6, 4, 'Por cliente',              '—', null, 'Transacciones de un cliente (requiere teléfono)', { needsPhone: true }),
];

/** Filtra paquetes por sección. Array.filter = función pura sin efectos secundarios. */
export const getPackages = (sectionId) => CATALOG.filter((p) => p.section === sectionId);

export const formatPrice = (p) => (p == null ? 'Sin costo' : `Q${p}`);
