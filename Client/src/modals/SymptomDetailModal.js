// Client/src/modals/SymptomDetailModal.js
/**
 * SymptomDetailModal.js
 * 
 * This file defines the `SymptomDetailModal` component, which allows users to input and save 
 * details about their symptoms, including the severity, onset time, duration, and additional notes. 
 * The modal is used to capture symptoms related to the user's health, which are then sent to the backend 
 * and stored in the user's health log.
 * 
 * Features:
 * - Allows the user to select the severity of the symptom (Mild, Moderate, Severe).
 * - User can choose the onset time of the symptom using a time picker.
 * - Provides inputs for the symptom's duration and additional notes.
 * - Saves the data to the user's health log and generates a health plan if necessary.
 * - After submission, the modal closes, and the user is redirected to the 'DailyLog' screen.
 * 
 * Props:
 * - `visible`: A boolean controlling the visibility of the modal.
 * - `symptom`: The selected symptom for which the user is providing details.
 * - `onClose`: Callback function to close the modal after submission.
 * - `onPlanGenerated`: Callback function that is called when a health plan is generated for the symptom.
 * 
 * Dependencies:
 * - `react-native`
 * - `@react-native-community/datetimepicker`
 * - `react-redux`
 * - `@react-navigation/native`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { useNavigation } from '@react-navigation/native';
import { addSymptom } from '../store/reducers/healthlogReducers';

const severityOptions = ['mild', 'moderate', 'severe'];

const SymptomDetailModal = ({ visible, symptom, onClose, onPlanGenerated }) => {
  const [severityLevel, setSeverityLevel] = useState('');
  const [onsetTime, setOnsetTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const { user } = useSelector(state => state.auth);
  const theme = useSelector(state => state.theme.themeColors);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const styles = createStyles(theme);

  // Wait until user is loaded
  if (!user) return null;

  const handleSave = async () => {
    const userId = user?.id;

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!severityOptions.includes(severityLevel)) {
      return Alert.alert('Invalid Severity', 'Please select Mild, Moderate, or Severe');
    }

    const symptomEntry = {
      symptom: symptom.symptom,
      onsetTime: onsetTime.toISOString(),
      duration: duration || null,
      notes: notes || null,
      severity_level: severityLevel,
    };

    try {
      await post(`${API_URL_HEALTHLOG}/submit`, {
        user_id: userId,
        mood: 'Not feeling good!',
        symptoms: [symptomEntry],
      });

      await post(`${API_URL_HEALTHLOG}/generatePlan`, {
        user_id: userId,
        symptom: symptom.symptom,
        severity: severityLevel,
        recurring: true,
      });

      if (onPlanGenerated) onPlanGenerated();
      dispatch(addSymptom(symptomEntry));

      onClose({
        ...symptom,
        severity_level: severityLevel,
        onsetTime: onsetTime.toISOString(),
        duration,
        notes,
      });

      setTimeout(() => {
        navigation.navigate('MainTabs', { screen: 'DailyLog' });
      }, 50);
    } catch (err) {
      console.error(err);
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.title }]}>{symptom.symptom}</Text>

        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '500', marginBottom: 5 }}>
          Select Severity
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
          {severityOptions.map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => setSeverityLevel(option)}
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: severityLevel === option ? theme.buttonPrimaryBackground : theme.disabled,
              }}
            >
              <Text style={{
                color: severityLevel === option ? theme.buttonPrimaryText : theme.text,
                fontWeight: '600',
              }}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>Onset Time</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}
        >
          <Text style={{ color: theme.inputText }}>{onsetTime.toLocaleTimeString()}</Text>
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
          placeholder="Duration (optional)"
          placeholderTextColor={theme.placeholder}
          value={duration}
          onChangeText={setDuration}
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText }]}
        />

        <TextInput
          placeholder="Notes (optional)"
          placeholderTextColor={theme.placeholder}
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText }]}
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: isSaveDisabled ? theme.buttonDisabledBackground : theme.buttonPrimaryBackground }]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          <Text style={[styles.saveButtonText, { color: isSaveDisabled ? theme.buttonDisabledText : theme.buttonPrimaryText }]}>
            Save to Calendar
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: theme.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', fontFamily: 'Poppins', color: theme.title },
  label: { fontSize: 16, marginBottom: 5, fontFamily: 'Poppins', color: theme.text },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: theme.input,
    borderColor: theme.inputBorder,
    color: theme.inputText,
  },
  saveButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: theme.buttonPrimaryBackground,
  },
  saveButtonText: { fontWeight: '600', fontSize: 16, fontFamily: 'Poppins', color: theme.buttonPrimaryText },
});


export default SymptomDetailModal;
