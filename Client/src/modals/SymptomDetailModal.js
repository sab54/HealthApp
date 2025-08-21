// Client/src/modals/SymptomDetailModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';

const SymptomDetailModal = ({ visible, symptom, onClose }) => {
  const [severity, setSeverity] = useState('');
  const [onsetTime, setOnsetTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;

  // Convert number 1-10 into severity label
  const getSeverityLabel = (val) => {
    const num = parseInt(val);
    if (num >= 1 && num <= 3) return 'Mild';
    if (num >= 4 && num <= 6) return 'Moderate';
    if (num >= 7 && num <= 10) return 'Severe';
    return '';
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const symptomEntry = {
      symptom: symptom.symptom,
      severity: parseInt(severity),
      onsetTime: onsetTime.toISOString(),
      duration: duration || null,
      notes: notes || null,
    };

    try {
      // Save mood + symptom
      await post(`${API_URL_HEALTHLOG}/submit`, {
        user_id: userId,
        mood: 'Not feeling good!',
        symptoms: [symptomEntry],
      });


      // Generate daily plan (recurring until recovery)
      await post(`${API_URL_HEALTHLOG}/generatePlan`, {
        user_id: userId,
        symptom: symptomEntry.symptom,
        recurring: true, // ✅ new flag for recurring
      });

      onClose();
    } catch (err) {
      console.error('Failed to save symptom or generate plan:', err);
      Alert.alert('Error', 'Failed to save symptom. Please try again.');
    }
  };


  const onTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setOnsetTime(selectedDate);
  };

  const isSaveDisabled = !severity || !onsetTime;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>{symptom.symptom}</Text>

        <TextInput
          placeholder="Severity (1-10)"
          keyboardType="numeric"
          value={severity}
          onChangeText={setSeverity}
          style={styles.input}
        />
        <Text style={{ marginTop: 5, fontStyle: 'italic', color: '#333' }}>
          {getSeverityLabel(severity)}
        </Text>

        <Text style={{ marginTop: 10, marginBottom: 5 }}>Onset Time</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
          <Text>{onsetTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={onsetTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TextInput
          placeholder="Duration"
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
        />

        <TextInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
        />

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isSaveDisabled ? '#A3AED0' : '#755CDB' },
          ]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveButtonText}>Save to Calendar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#E0E7FF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff'
  },
  saveButton: {
    backgroundColor: '#755CDB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});

export default SymptomDetailModal;
