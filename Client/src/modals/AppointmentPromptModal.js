// Client/src/modals/AppointmentPromptModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

const AppointmentPromptModal = ({
  visible,
  onClose,
  onSubmit,
  theme,
  patientName: initialPatientName,
  patientContact: initialPatientContact
}) => {
  const [form, setForm] = useState({
    patientName: initialPatientName || '',
    appointmentDate: '',
    appointmentTime: '',
    mode: 'Phone Call',
    purpose: '',
    previousVisit: 'No',
    notes: '',
  });

  useEffect(() => {
    // Update patient name whenever modal is opened or initialPatientName changes
    setForm((prev) => ({
      ...prev,
      patientName: initialPatientName || ''
    }));
  }, [initialPatientName,initialPatientContact, visible]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.patientName || !form.appointmentDate || !form.appointmentTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onSubmit && onSubmit(form);
    setForm({
      patientName: initialPatientName || '',
      appointmentDate: '',
      appointmentTime: '',
      mode: 'Phone Call',
      purpose: '',
      previousVisit: 'No',
      notes: '',
    });
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      avoidKeyboard
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Book Doctor Appointment</Text>

        <TextInput
          style={styles.input}
          placeholder="Patient Name"
          placeholderTextColor={theme.placeholder}
          value={form.patientName}
          onChangeText={(text) => handleChange('patientName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Appointment Date (YYYY-MM-DD)"
          placeholderTextColor={theme.placeholder}
          value={form.appointmentDate}
          onChangeText={(text) => handleChange('appointmentDate', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Appointment Time (HH:MM)"
          placeholderTextColor={theme.placeholder}
          value={form.appointmentTime}
          onChangeText={(text) => handleChange('appointmentTime', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mode of Appointment"
          placeholderTextColor={theme.placeholder}
          value={form.mode}
          onChangeText={(text) => handleChange('mode', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Purpose of Visit"
          placeholderTextColor={theme.placeholder}
          value={form.purpose}
          onChangeText={(text) => handleChange('purpose', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Previous Visit (Yes/No)"
          placeholderTextColor={theme.placeholder}
          value={form.previousVisit}
          onChangeText={(text) => handleChange('previousVisit', text)}
        />
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Notes (Optional)"
          placeholderTextColor={theme.placeholder}
          multiline
          value={form.notes}
          onChangeText={(text) => handleChange('notes', text)}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContent: {
      backgroundColor: theme.surface,
      padding: 20,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
    },
    title: {
      fontSize: 18,
      fontFamily: 'PoppinsBold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.input,
      color: theme.inputText,
      fontFamily: 'Poppins',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    submitButton: {
      backgroundColor: theme.buttonPrimaryBackground || '#3b82f6',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonText: {
      color: theme.buttonPrimaryText || '#fff',
      fontFamily: 'PoppinsBold',
      fontSize: 15,
    },
  });

export default AppointmentPromptModal;
