import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { normalizeMexicoPhoneForLinks } from '../../utils/phone';
import { queueSyncRecord } from '../../utils/storage';

export default function TrustedContactScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadContact = async () => {
      const savedName = await AsyncStorage.getItem('trustedName');
      const savedPhone = await AsyncStorage.getItem('trustedPhone');
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
    };
    loadContact();
  }, []);

  const saveContact = async () => {
    if (!name || !phone) {
      Alert.alert('Campos incompletos', 'Por favor ingresa ambos campos.');
      return;
    }

    const normalizedPhone = normalizeMexicoPhoneForLinks(phone);
    if (!normalizedPhone) {
      Alert.alert('Teléfono inválido', 'Ingresa un número mexicano válido de 10 dígitos o con clave +52.');
      return;
    }

    try {
      await AsyncStorage.setItem('trustedName', name);
      await AsyncStorage.setItem('trustedPhone', normalizedPhone.dialPhone);
      await queueSyncRecord('trusted_contact', {
        name,
        phoneE164: normalizedPhone.dialPhone
      });
      Alert.alert('Guardado', 'Tu contacto ha sido guardado con éxito.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el contacto.');
    }
  };

  const callContact = () => Linking.openURL(`tel:${normalizeMexicoPhoneForLinks(phone)?.dialPhone ?? phone}`);

  const confirmCall = () => {
    Alert.alert(`¿Llamar a ${name}?`, `Se iniciará una llamada al número ${phone}.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar', onPress: callContact }
    ]);
  };

  const messageContact = () => {
    const normalizedPhone = normalizeMexicoPhoneForLinks(phone);
    const text = encodeURIComponent(`Hola ${name}, necesito hablar contigo. Estoy pasando por un momento difícil.`);
    Linking.openURL(`https://wa.me/${normalizedPhone?.whatsappPhone ?? phone.replace(/\D/g, '')}?text=${text}`);
  };

  const clearContact = async () => {
    await AsyncStorage.multiRemove(['trustedName', 'trustedPhone']);
    setName('');
    setPhone('');
    Alert.alert('Contacto eliminado', 'Tu contacto ha sido borrado correctamente.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacto de confianza</Text>

      {!name && !phone && (
        <Text style={styles.message}>
          Agrega el contacto de alguien de confianza para llamarle o escribirle rápidamente en caso de emergencia.
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono mexicano o +52"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <PrimaryButton title="Guardar contacto" onPress={saveContact} />

      {name && phone && (
        <>
          <Text style={styles.subtitle}>Opciones rápidas:</Text>
          <PrimaryButton title={`Llamar a ${name}`} onPress={confirmCall} style={{ marginTop: SIZES.base }} />
          <PrimaryButton title={`Enviar WhatsApp a ${name}`} onPress={messageContact} style={{ marginTop: SIZES.base }} />
          <PrimaryButton title="Eliminar contacto" onPress={clearContact} style={{ marginTop: 16, backgroundColor: COLORS.error }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flex: 1
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.padding
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginVertical: SIZES.base
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.base
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: SIZES.radius,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    marginBottom: SIZES.base
  }
});
