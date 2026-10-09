// Pantalla 2: lista de paquetes de la sección elegida.
import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getPackages, formatPrice } from '../data/catalog';
import { C, R } from '../theme';

export default function PackagesScreen({ section, onBack, onSelect }) {
  const data = getPackages(section.id);
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backTxt}>‹ {section.icon} {section.title}</Text></TouchableOpacity>
      <FlatList
        data={data}
        keyExtractor={(p) => `${p.section}-${p.option}`}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => onSelect(item)}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}{item.isNew ? '  ✨ Nuevo' : ''}</Text>
              <Text style={s.meta}>{item.vigencia}</Text>
            </View>
            <Text style={s.price}>{formatPrice(item.price)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  back: { padding: 16, paddingBottom: 8 },
  backTxt: { fontSize: 18, fontWeight: '800', color: C.red },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: R.card, padding: 14, borderWidth: 1, borderColor: C.line },
  name: { fontSize: 15, fontWeight: '700', color: C.text },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  price: { fontSize: 18, fontWeight: '800', color: C.red },
});
