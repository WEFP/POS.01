// Pantalla 4: historial local (envíos hechos desde la app + SMS de confirmación parseados).
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { C, R } from '../theme';

const colorOf = (st) => (st === 'EXITOSA' ? C.ok : st === 'FALLIDA' ? C.bad : C.warn);
const fmt = (t) => new Date(t).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' });

export default function HistoryScreen({ history, onBack, onSync, onClear }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={s.top}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Historial</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <TouchableOpacity onPress={onSync}><Text style={s.link}>Sincronizar</Text></TouchableOpacity>
          <TouchableOpacity onPress={onClear}><Text style={[s.link, { color: C.muted }]}>Borrar</Text></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={history}
        keyExtractor={(e) => e.key}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<Text style={s.empty}>Aún no hay movimientos. Envía un paquete o toca Sincronizar para leer tus SMS de Claro.</Text>}
        renderItem={({ item: e }) =>
          e.kind === 'ENVIO' ? (
            <View style={s.card}>
              <Text style={[s.t, e.status && { color: colorOf(e.status) }]}>Enviado · {e.packageName}{e.status ? ` · ${e.status}` : ''}</Text>
              <Text style={s.m}>{e.phone ? `Destino ${e.phone} · ` : ''}{e.price != null ? `Q${e.price} · ` : ''}{fmt(e.receivedAt)}</Text>
              {e.response ? <Text style={s.raw} numberOfLines={4}>{e.response}</Text> : null}
            </View>
          ) : (
            <View style={[s.card, { borderLeftColor: colorOf(e.status), borderLeftWidth: 4 }]}>
              <Text style={[s.t, { color: colorOf(e.status) }]}>{e.status}{e.amount != null ? ` · Q${e.amount}` : ''}</Text>
              <Text style={s.m}>{e.phone ? `Destino ${e.phone} · ` : ''}{e.txId ? `Trans. ${e.txId} · ` : ''}{fmt(e.receivedAt)}</Text>
              <Text style={s.raw} numberOfLines={2}>{e.raw}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  back: { fontSize: 18, fontWeight: '800', color: C.red },
  link: { color: C.red, fontWeight: '700' },
  card: { backgroundColor: C.card, borderRadius: R.card, padding: 12, borderWidth: 1, borderColor: C.line },
  t: { fontSize: 15, fontWeight: '700', color: C.text },
  m: { fontSize: 12, color: C.muted, marginTop: 2 },
  raw: { fontSize: 12, color: C.muted, marginTop: 6, fontStyle: 'italic' },
  empty: { color: C.muted, textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
});
