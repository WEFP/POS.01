// Pantalla 3: detalle del paquete + captura de teléfono/PIN + confirmación y marcación.
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import ConfirmModal from '../components/ConfirmModal';
import { formatPrice } from '../data/catalog';
import { RE_PHONE, RE_PIN, buildUssd, toTelUri } from '../utils/ussd';
import { dial, sendUssd } from '../native/ClaroNative';
import { parseSms } from '../utils/smsParser';
import { C, R } from '../theme';

export default function DetailScreen({ pkg, onBack, onLesson, onSent }) {
  // ESTADO LOCAL: cada useState es una "caja" que React observa y redibuja al cambiar.
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const phoneOk = !pkg.needsPhone || RE_PHONE.test(phone);
  const pinOk = RE_PIN.test(pin);
  const canSend = phoneOk && pinOk;

  useEffect(() => { onLesson('SELECT_PACKAGE', { pkg }); }, [pkg]);
  useEffect(() => { if (phone || pin) onLesson('INPUT', { pkg, phone, pin, phoneOk, pinOk }); }, [phone, pin]);

  const masked = buildUssd(pkg, phone, pin, { maskPin: true });

  const openConfirm = () => {
    onLesson('SEND', { pkg, masked, uri: toTelUri(masked) });
    setConfirm(true);
  };

  // Método ASÍNCRONO: await pausa esta función hasta que el operador responda.
  const send = async () => {
    setBusy(true);
    const ussd = buildUssd(pkg, phone, pin); // el PIN real solo vive aquí, en memoria
    const base = { kind: 'ENVIO', packageName: pkg.name, vigencia: pkg.vigencia, price: pkg.price, phone: pkg.needsPhone ? phone : null, ussd: masked, receivedAt: Date.now() };
    try {
      let response = null;
      try {
        response = await sendUssd(ussd); // respuesta dentro de la app (Android 8+)
      } catch (e) {
        if (e?.code !== 'UNSUPPORTED') throw e;
        await dial(ussd); // teléfono antiguo: marcación normal (la respuesta sale en pantalla del sistema)
      }
      const parsed = response ? parseSms({ body: response, address: 'USSD', date: Date.now() }) : null;
      await onSent({ ...base, response, status: parsed?.status ?? null });
      if (parsed) onLesson('USSD_RESPONSE', { response, parsed });
      setConfirm(false);
      setPin(''); // limpiamos el PIN tras usarlo
      if (response) Alert.alert('Respuesta del operador', response);
    } catch (e) {
      setConfirm(false);
      // No reintentamos solos: podría duplicar la venta si la primera sí se procesó.
      Alert.alert(
        'No se confirmó el envío',
        `${e?.message ?? 'Error desconocido'}\n\nAntes de reintentar, revisa tus SMS o la consulta "Últimas 5 transacciones".`,
        [{ text: 'Cerrar', style: 'cancel' }, { text: 'Marcar manualmente', onPress: () => dial(ussd).catch(() => {}) }],
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack}><Text style={s.back}>‹ Volver</Text></TouchableOpacity>

      <View style={s.card}>
        <Text style={s.name}>{pkg.name}</Text>
        <Text style={s.price}>{formatPrice(pkg.price)}</Text>
        <Text style={s.line}>Vigencia: {pkg.vigencia}</Text>
        <Text style={s.line}>{pkg.content}</Text>
      </View>

      {pkg.needsPhone && (
        <>
          <Text style={s.label}>Número de teléfono (8 dígitos)</Text>
          <TextInput style={[s.input, phone && !phoneOk && s.bad]} value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 8))} keyboardType="number-pad" placeholder="5555 1234" maxLength={8} />
        </>
      )}
      <Text style={s.label}>PIN del punto de venta</Text>
      <TextInput style={[s.input, pin && !pinOk && s.bad]} value={pin} onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" secureTextEntry placeholder="••••" maxLength={6} />

      <TouchableOpacity style={[s.send, !canSend && s.disabled]} disabled={!canSend} onPress={openConfirm}>
        <Text style={s.sendTxt}>Revisar y enviar</Text>
      </TouchableOpacity>

      <ConfirmModal visible={confirm} pkg={pkg} phone={phone} masked={masked} busy={busy} onCancel={() => setConfirm(false)} onConfirm={send} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  back: { fontSize: 16, color: C.red, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: C.card, borderRadius: R.card, padding: 16, borderWidth: 1, borderColor: C.line },
  name: { fontSize: 20, fontWeight: '800', color: C.text },
  price: { fontSize: 34, fontWeight: '800', color: C.red, marginVertical: 4 },
  line: { fontSize: 14, color: C.muted, marginTop: 2 },
  label: { fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: R.input, padding: 12, fontSize: 18, color: C.text },
  bad: { borderColor: C.bad },
  send: { backgroundColor: C.red, borderRadius: R.input, padding: 16, alignItems: 'center', marginTop: 22 },
  disabled: { backgroundColor: '#C9C9D1' },
  sendTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
