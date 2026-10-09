// Modal de confirmación: muestra el USSD con el PIN enmascarado antes de marcar.
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { C, R } from '../theme';
import { formatPrice } from '../data/catalog';

export default function ConfirmModal({ visible, pkg, phone, masked, busy, onCancel, onConfirm }) {
  if (!pkg) return null;
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.h}>Confirmar envío</Text>
          <Text style={s.row}>{pkg.name} · {pkg.vigencia}</Text>
          {pkg.price != null && <Text style={s.price}>{formatPrice(pkg.price)}</Text>}
          {pkg.needsPhone && <Text style={s.row}>Destino: {phone}</Text>}
          <Text style={s.label}>Comando a marcar</Text>
          <Text style={s.ussd} selectable>{masked}</Text>
          <View style={s.actions}>
            <TouchableOpacity style={[s.btn, s.ghost]} onPress={onCancel} disabled={busy}>
              <Text style={s.ghostTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.main]} onPress={onConfirm} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.mainTxt}>Marcar ahora</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  h: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
  row: { fontSize: 15, color: C.text, marginTop: 2 },
  price: { fontSize: 28, fontWeight: '800', color: C.red, marginVertical: 4 },
  label: { fontSize: 12, color: C.muted, marginTop: 12 },
  ussd: { fontFamily: 'monospace', fontSize: 15, backgroundColor: C.bg, padding: 10, borderRadius: R.input, marginTop: 4, color: C.text },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: R.input, alignItems: 'center' },
  ghost: { backgroundColor: C.bg },
  ghostTxt: { color: C.text, fontWeight: '700' },
  main: { backgroundColor: C.red },
  mainTxt: { color: '#fff', fontWeight: '800' },
});
