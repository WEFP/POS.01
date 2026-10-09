/**
 * Persistencia local con AsyncStorage (clave-valor, JSON).
 * ⚠️ Nunca se guarda el PIN.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@claro/history';
const KEY_SYNC = '@claro/lastSync';
const MAX = 500;

export async function getHistory() {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');
  } catch {
    return [];
  }
}

/** Agrega una entrada; devuelve false si es duplicado (mismo SMS ±2 min). */
export async function addEntry(entry) {
  const list = await getHistory();
  if (entry.kind === 'SMS') {
    const dup = list.some(
      (e) => e.kind === 'SMS' && e.raw === entry.raw && Math.abs(e.receivedAt - entry.receivedAt) < 120000,
    );
    if (dup) return false;
  }
  const key = `${entry.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const next = [{ key, ...entry }, ...list].sort((a, b) => b.receivedAt - a.receivedAt).slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return true;
}

// Historial de la Consola del Desarrollador (lecciones). Nunca contiene el PIN, solo su longitud.
const KEY_LOG = '@claro/consoleLog';
export async function getConsoleLog() {
  try { return JSON.parse((await AsyncStorage.getItem(KEY_LOG)) ?? '[]'); } catch { return []; }
}
export const saveConsoleLog = (log) => AsyncStorage.setItem(KEY_LOG, JSON.stringify(log));

export const clearHistory = () => AsyncStorage.removeItem(KEY);
export const getLastSync = async () => Number((await AsyncStorage.getItem(KEY_SYNC)) ?? 0);
export const setLastSync = (t) => AsyncStorage.setItem(KEY_SYNC, String(t));
