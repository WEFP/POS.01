/**
 * App.js — raíz de la aplicación.
 * Responsabilidades: navegación por estado, permisos, listener de SMS e historial.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, View, Alert, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PackagesScreen from './src/screens/PackagesScreen';
import DetailScreen from './src/screens/DetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DevConsole from './src/components/DevConsole';
import { getPackages } from './src/data/catalog';
import { getLesson } from './src/data/lessons';
import { isClaroSms, parseSms } from './src/utils/smsParser';
import { addEntry, getHistory, clearHistory, getLastSync, setLastSync, getConsoleLog, saveConsoleLog } from './src/storage/history';
import { requestPermissions, startSmsListener, readInbox } from './src/native/ClaroNative';
import { C } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'packages' | 'detail' | 'history'
  const [section, setSection] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [history, setHistory] = useState([]);
  const [lesson, setLesson] = useState(getLesson('WELCOME'));

  const [log, setLog] = useState([]); // historial de la consola (persistente)

  // Muestra la lección y la agrega al historial. Teclas seguidas de la misma lección se funden en una sola entrada.
  const showLesson = useCallback((event, data) => {
    const l = getLesson(event, data);
    setLesson(l);
    setLog((prev) => {
      const entry = { at: Date.now(), concept: l.concept, title: l.title, live: l.live };
      const same = prev[0] && prev[0].title === entry.title && prev[0].concept === entry.concept;
      return (same ? [entry, ...prev.slice(1)] : [entry, ...prev]).slice(0, 50);
    });
  }, []);
  const [logReady, setLogReady] = useState(false); // evita guardar [] antes de terminar de leer
  useEffect(() => { getConsoleLog().then((l) => { setLog(l); setLogReady(true); }); }, []);
  useEffect(() => { if (logReady) saveConsoleLog(log); }, [log, logReady]);
  const refresh = useCallback(async () => setHistory(await getHistory()), []);

  // Procesa un SMS: filtra remitente -> parsea -> guarda -> actualiza UI.
  const ingestSms = useCallback(async (sms, silent = false) => {
    if (!isClaroSms(sms.address)) return;
    const parsed = parseSms(sms);
    if (await addEntry(parsed)) {
      await refresh();
      if (!silent) showLesson('SMS', { sms, parsed });
    }
  }, [refresh, showLesson]);

  const syncInbox = useCallback(async () => {
    try {
      const list = await readInbox(await getLastSync());
      for (const sms of list) await ingestSms(sms, true); // secuencial: evita carreras en AsyncStorage
      await setLastSync(Date.now());
    } catch (e) {
      Alert.alert('No se pudo leer el inbox', e?.message ?? 'Revisa el permiso de SMS.');
    }
  }, [ingestSms]);

  // Arranque: historial -> permisos -> sincronizar -> escuchar SMS en vivo.
  useEffect(() => {
    let stop = () => {};
    (async () => {
      await refresh();
      if (!(await requestPermissions())) {
        Alert.alert('Permisos requeridos', 'La app necesita Llamadas y SMS para enviar recargas y leer confirmaciones.');
        return;
      }
      await syncInbox();
      stop = startSmsListener((sms) => ingestSms(sms));
    })();
    return () => stop();
  }, []);

  const goSection = (sec) => {
    setSection(sec);
    setScreen('packages');
    showLesson('SELECT_SECTION', { section: sec, count: getPackages(sec.id).length });
  };

  const onSent = async (entry) => { await addEntry(entry); await refresh(); };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={{ flex: 1 }}>
        {screen === 'home' && <HomeScreen onSelectSection={goSection} onOpenHistory={() => setScreen('history')} pendingCount={history.length} />}
        {screen === 'packages' && <PackagesScreen section={section} onBack={() => setScreen('home')} onSelect={(p) => { setPkg(p); setScreen('detail'); }} />}
        {screen === 'detail' && <DetailScreen pkg={pkg} onBack={() => setScreen('packages')} onLesson={showLesson} onSent={onSent} />}
        {screen === 'history' && <HistoryScreen history={history} onBack={() => setScreen('home')} onSync={syncInbox} onClear={async () => { await clearHistory(); await refresh(); }} />}
      </View>
      <DevConsole lesson={lesson} log={log} onClearLog={() => setLog([])} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({ root: { flex: 1, backgroundColor: C.bg } });
