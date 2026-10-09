/**
 * Validación y construcción de comandos USSD.
 * Funciones puras: misma entrada -> misma salida, fáciles de probar.
 */

// Teléfono GT: exactamente 8 dígitos.
export const RE_PHONE = /^\d{8}$/;
// PIN del POS: 4 a 6 dígitos (ajustar al largo real de tu PIN).
export const RE_PIN = /^\d{4,6}$/;

/**
 * Arma la cadena USSD.
 * Con teléfono: *905*SECCIÓN*OPCIÓN*TEL*PIN*1#
 * Sin teléfono: *905*SECCIÓN*OPCIÓN*PIN*1#   (consultas 1-3)
 * @param {object} pkg  Paquete del catálogo
 * @param {string} phone
 * @param {string} pin
 * @param {{maskPin?: boolean}} opts  maskPin=true para mostrar en pantalla/logs sin exponer el PIN
 */
export function buildUssd(pkg, phone, pin, { maskPin = false } = {}) {
  const parts = ['*905', pkg.section, pkg.option];
  if (pkg.needsPhone) parts.push(phone);
  parts.push(maskPin ? 'XXXX' : pin, '1#');
  return parts.join('*');
}

/**
 * El '#' rompe un URI `tel:` (es el fragmento); debe ir como %23.
 * El módulo nativo Android aplica la misma codificación en el Intent ACTION_CALL.
 */
export const toTelUri = (ussd) => 'tel:' + ussd.replace(/#/g, '%23');
