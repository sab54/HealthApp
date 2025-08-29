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
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      patientName: initialPatientName || ''
    }));
  }, [initialPatientName, initialPatientContact, visible]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setForm((prev) => ({ ...prev, appointmentDate: isoDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setForm((prev) => ({ ...prev, appointmentTime: `${hours}:${minutes}` }));
    }
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
    <Modal isVisible={visible} onBackdropPress={onClose} avoidKeyboard style={styles.modal}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Book Doctor Appointment</Text>

        {/* Patient name input */}
        <TextInput
          style={styles.input}
          placeholder="Patient Name"
          placeholderTextColor={theme.placeholder}
          value={form.patientName}
          onChangeText={(text) => setForm((prev) => ({ ...prev, patientName: text }))}
        />

        {/* Date picker */}
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: form.appointmentDate ? theme.inputText : theme.placeholder }}>
            {form.appointmentDate || 'Select Appointment Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.appointmentDate ? new Date(form.appointmentDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time picker */}
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text style={{ color: form.appointmentTime ? theme.inputText : theme.placeholder }}>
            {form.appointmentTime || 'Select Appointment Time'}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Mode, purpose, etc. remain as inputs */}
        <TextInput
          style={styles.input}
          placeholder="Mode of Appointment"
          placeholderTextColor={theme.placeholder}
          value={form.mode}
          onChangeText={(text) => setForm((prev) => ({ ...prev, mode: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Purpose of Visit"
          placeholderTextColor={theme.placeholder}
          value={form.purpose}
          onChangeText={(text) => setForm((prev) => ({ ...prev, purpose: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Previous Visit (Yes/No)"
          placeholderTextColor={theme.placeholder}
          value={form.previousVisit}
          onChangeText={(text) => setForm((prev) => ({ ...prev, previousVisit: text }))}
        />

        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Notes (Optional)"
          placeholderTextColor={theme.placeholder}
          multiline
          value={form.notes}
          onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
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
