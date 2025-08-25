// Client/src/modals/SymptomDetailModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { useNavigation } from '@react-navigation/native';
import { addSymptom } from '../store/reducers/healthlogReducers';

const severityOptions = ['mild', 'moderate', 'severe'];

const SymptomDetailModal = ({ visible, symptom, onClose, onPlanGenerated }) => {
  const [severityLevel, setSeverityLevel] = useState(''); // directly store severity_level
  const [onsetTime, setOnsetTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!severityOptions.includes(severityLevel)) {
      Alert.alert('Invalid Severity', 'Please select Mild, Moderate, or Severe');
      return;
    }

    const symptomEntry = {
      symptom: symptom.symptom,
      onsetTime: onsetTime.toISOString(),
      duration: duration || null,
      notes: notes || null,
      severity_level: severityLevel, // store directly as severity_level
    };

    try {
      // Save symptom to backend
      await post(`${API_URL_HEALTHLOG}/submit`, {
        user_id: userId,
        mood: 'Not feeling good!',
        symptoms: [symptomEntry],
      });

      // Generate recovery plan
      await post(`${API_URL_HEALTHLOG}/generatePlan`, {
        user_id: userId,
        symptom: symptom.symptom,
        severity: severityLevel,
        recurring: true,
      });

      // Trigger any callback
      if (onPlanGenerated) onPlanGenerated();

      // Add symptom to Redux
      dispatch(addSymptom(symptomEntry));

      // Pass symptom with severity_level back to parent
      onClose({
        ...symptom,
        severity_level: severityLevel,
        onsetTime: onsetTime.toISOString(),
        duration,
        notes,
      });

      // Navigate back after small delay
      setTimeout(() => {
        navigation.navigate("MainTabs", { screen: "DailyLog" });
      }, 50);
    } catch (err) {
      console.error('Failed to save symptom or generate plan:', err);
      Alert.alert('Error', 'Failed to save symptom. Please try again.');
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setOnsetTime(selectedDate);
  };

  const isSaveDisabled = !severityLevel || !onsetTime;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>{symptom.symptom}</Text>

        {/* Severity Picker */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
          {severityOptions.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setSeverityLevel(option)}
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: severityLevel === option ? '#755CDB' : '#ccc'
              }}
            >
              <Text style={{ color: severityLevel === option ? '#fff' : '#000', fontWeight: '600' }}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});

export default SymptomDetailModal;
