// Pantalla 1: selección por secciones (iconos grandes, pensados para uso rápido en campo).
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SECTIONS } from '../data/catalog';
import { C, R } from '../theme';

export default function HomeScreen({ onSelectSection, onOpenHistory, pendingCount }) {
  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <Text style={s.brand}>SuperPacks POS</Text>
        <Text style={s.sub}>Elige qué vas a vender</Text>
      </View>
      <View style={s.grid}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity key={sec.id} style={s.tile} onPress={() => onSelectSection(sec)} accessibilityRole="button">
            <Text style={s.icon}>{sec.icon}</Text>
            <Text style={s.title}>{sec.title}</Text>
            <Text style={s.hint}>{sec.hint}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.history} onPress={onOpenHistory}>
        <Text style={s.historyTxt}>Historial de transacciones{pendingCount ? ` (${pendingCount})` : ''}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  header: { backgroundColor: C.red, borderRadius: R.card, padding: 18, marginBottom: 16 },
  brand: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: '#FFD9D5', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47.5%', backgroundColor: C.card, borderRadius: R.card, padding: 16, borderWidth: 1, borderColor: C.line },
  icon: { fontSize: 34 },
  title: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 8 },
  hint: { fontSize: 12, color: C.muted, marginTop: 2 },
  history: { marginTop: 16, backgroundColor: C.dark, borderRadius: R.card, padding: 16, alignItems: 'center' },
  historyTxt: { color: '#fff', fontWeight: '700' },
});
