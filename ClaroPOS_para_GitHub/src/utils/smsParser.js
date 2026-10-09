/**
 * Parsing de SMS del operador.
 * ⚠️ Los patrones asumen textos tipo "Transacción exitosa ... Q35 ... 5xxxxxxx ... No. 123456".
 * Pega 5-10 SMS reales de Claro y ajusta las regex si el formato difiere.
 */

const SENDER = /claro|905/i;
export const isClaroSms = (address = '') => SENDER.test(address);

const OK_WORDS = /(exitos|realizad|acreditad|activad|aprobad|completad)/i;
const FAIL_WORDS = /(fallid|error|insuficiente|rechazad|inv[aá]lid|incorrect|no se pudo|no pudo)/i;

export function parseSms(sms) {
  const body = (sms.body ?? '').trim();

  // 1) Estado: buscamos fallos primero (un SMS de error también puede decir "transacción").
  const status = FAIL_WORDS.test(body) ? 'FALLIDA' : OK_WORDS.test(body) ? 'EXITOSA' : 'DESCONOCIDA';

  // 2) Monto: "Q35", "Q 35.00", "GTQ35"
  const m = body.match(/(?:GTQ|Q)\s?\.?\s?(\d+(?:[.,]\d{1,2})?)/i);
  const amount = m ? parseFloat(m[1].replace(',', '.')) : null;

  // 3) Teléfono destino: 8 dígitos aislados
  const t = body.match(/\b(\d{8})\b/);
  const phone = t ? t[1] : null;

  // 4) Número de transacción: 6+ dígitos tras palabras clave (y que no sea el teléfono)
  const x = body.match(/(?:transacci[oó]n|trans\.?|no\.?|ref(?:erencia)?|id|c[oó]digo)\D{0,6}(\d{6,})/i);
  const txId = x && x[1] !== phone ? x[1] : null;

  return {
    kind: 'SMS',
    status, txId, amount, phone,
    sender: sms.address,
    raw: body,
    receivedAt: sms.date ?? Date.now(),
  };
}
