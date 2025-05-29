import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { CustomExercise } from '../(tabs)/types/customExercise';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export default function CreateCustomExerciseScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => setSteps([...steps, '']);

  const saveExercise = async () => {
    if (!title || !description || steps.some((s) => !s.trim())) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const newExercise: CustomExercise = {
      id: uuidv4(),
      title,
      description,
      steps,
      createdAt: new Date().toISOString(),
      custom: true
    };

    try {
      const existing = await AsyncStorage.getItem('customExercises');
      const customExercises = existing ? JSON.parse(existing) : [];
      customExercises.push(newExercise);
      await AsyncStorage.setItem('customExercises', JSON.stringify(customExercises));
      Alert.alert('Ejercicio guardado', 'Tu ejercicio personalizado ha sido guardado con éxito.');
      setTitle('');
      setDescription('');
      setSteps(['']);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el ejercicio.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear ejercicio personalizado</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Afirmaciones para autoestima"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Breve descripción del ejercicio"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Pasos</Text>
        {steps.map((step, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Paso ${index + 1}`}
            value={step}
            onChangeText={(text) => updateStep(index, text)}
          />
        ))}
        <PrimaryButton title="Agregar otro paso" onPress={addStep} />

        <PrimaryButton title="Guardar ejercicio" onPress={saveExercise} style={{ marginTop: SIZES.padding }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.padding
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: SIZES.base
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 10,
    marginBottom: SIZES.base,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text
  }
});
