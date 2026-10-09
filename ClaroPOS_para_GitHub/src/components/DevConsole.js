// "Consola del Desarrollador": panel inferior con la lección actual y su historial guardado.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { C, R } from '../theme';

const hora = (t) => new Date(t).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

export default function DevConsole({ lesson, log = [], onClearLog }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState('now'); // 'now' | 'log'
  if (!lesson) return null;
  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        <TouchableOpacity onPress={() => setTab('now')}><Text style={[s.tab, tab === 'now' && s.tabOn]}>Ahora</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { setTab('log'); setOpen(true); }}><Text style={[s.tab, tab === 'log' && s.tabOn]}>Historial ({log.length})</Text></TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setOpen(!open)}><Text style={s.toggle}>{open ? 'Ocultar' : 'Ver'}</Text></TouchableOpacity>
      </View>
      {open && tab === 'now' && (
        <ScrollView style={s.body} nestedScrollEnabled>
          <Text style={s.chip}>{lesson.concept}</Text>
          <Text style={s.title}>{lesson.title}</Text>
          <Text style={s.text}>{lesson.text}</Text>
          <View style={s.codeBox}><Text style={s.code} selectable>{lesson.code}</Text></View>
          <Text style={s.live}>▶ {lesson.live}</Text>
        </ScrollView>
      )}
      {open && tab === 'log' && (
        <ScrollView style={s.body} nestedScrollEnabled>
          {log.length === 0 && <Text style={s.text}>Aún no hay lecciones guardadas.</Text>}
          {log.map((e, i) => (
            <View key={`${e.at}-${i}`} style={s.item}>
              <Text style={s.itemTop}>{hora(e.at)} · {e.concept}</Text>
              <Text style={s.itemTitle}>{e.title}</Text>
              <Text style={s.itemLive}>{e.live}</Text>
            </View>
          ))}
          {log.length > 0 && <TouchableOpacity onPress={onClearLog}><Text style={s.clear}>Borrar historial de consola</Text></TouchableOpacity>}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: C.dark, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '42%' },
  bar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 16 },
  tab: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
  tabOn: { color: '#fff', textDecorationLine: 'underline' },
  toggle: { color: '#9CA3AF', fontSize: 12 },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
  chip: { alignSelf: 'flex-start', color: '#fff', backgroundColor: C.red, paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.chip, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  text: { color: '#D1D5DB', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  codeBox: { backgroundColor: C.code, borderRadius: 8, padding: 10 },
  code: { color: C.codeText, fontFamily: 'monospace', fontSize: 12, lineHeight: 17 },
  live: { color: C.codeKey, fontFamily: 'monospace', fontSize: 12, marginTop: 8 },
  item: { borderBottomWidth: 1, borderBottomColor: '#2A2A33', paddingVertical: 8 },
  itemTop: { color: '#9CA3AF', fontSize: 11 },
  itemTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  itemLive: { color: C.codeKey, fontFamily: 'monospace', fontSize: 11, marginTop: 2 },
  clear: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', paddingVertical: 12 },
});
