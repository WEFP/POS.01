/**
 * Puente JS <-> módulo nativo Android (ver android-native/).
 * Expone: permisos, marcación directa USSD, escucha de SMS en vivo y lectura del inbox.
 */
import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';

const { ClaroNative } = NativeModules;
const P = PermissionsAndroid.PERMISSIONS;

export async function requestPermissions() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.requestMultiple([P.CALL_PHONE, P.READ_SMS, P.RECEIVE_SMS]);
  return Object.values(res).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
}

/** Marca el USSD. El módulo nativo codifica '#' como %23 en el Intent ACTION_CALL. */
export const dial = (ussd) => ClaroNative.dial(ussd);

/**
 * Envía el USSD y DEVUELVE la respuesta del operador dentro de la app (Android 8+).
 * Rechaza con code 'UNSUPPORTED' si el teléfono es más antiguo (se puede usar dial()).
 */
export const sendUssd = (ussd) => ClaroNative.sendUssd(ussd);

/** Lee SMS del inbox posteriores a `sinceMillis` (sincroniza lo recibido con la app cerrada). */
export const readInbox = (sinceMillis = 0) => ClaroNative.readInbox(sinceMillis);

/**
 * Registra un LISTENER de SMS entrantes. `onSms` es un CALLBACK que Android invoca por cada evento.
 * Devuelve una función para cancelar la suscripción.
 */
export function startSmsListener(onSms) {
  ClaroNative.startSmsListener();
  const emitter = new NativeEventEmitter(ClaroNative);
  const sub = emitter.addListener('onSmsReceived', onSms);
  return () => {
    sub.remove();
    ClaroNative.stopSmsListener();
  };
}
