// Client/src/modals/MoodDetailsModal.js
/**
 * MoodDetailsModal.js
 * 
 * This file defines the `MoodDetailsModal` component, which allows the user to reflect
 * on their current mood by providing input on their sleep hours and energy level.
 * The modal is used to capture mood-related data, which can then be submitted for further
 * processing, such as tracking or analysis.
 * 
 * Features:
 * - Displays the selected mood along with sliders for sleep hours and energy level.
 * - The user can adjust the sliders to indicate their sleep duration (0-24 hours) and 
 *   energy level (1-10 scale).
 * - Submitting the form sends the mood, sleep, and energy values to a callback function.
 * 
 * Props:
 * - `visible`: A boolean controlling the visibility of the modal.
 * - `selectedMood`: The mood selected by the user, displayed in the modal.
 * - `onSubmit`: Callback function that is called when the user submits the form.
 * - `theme`: The theme object used to style the modal's components, including colors 
 *   for the background, sliders, and text.
 * 
 * Dependencies:
 * - `react-native`
 * - `@react-native-community/slider`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const MoodDetailsModal = ({ visible, selectedMood, onSubmit, theme }) => {
  const [sleep, setSleep] = useState(8);
  const [energy, setEnergy] = useState(5);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
          <Text style={[styles.title, { color: theme.title }]}>Self-Reflection</Text>
          <Text style={[styles.moodText, { color: theme.text }]}>Mood: {selectedMood}</Text>

          <Text style={[styles.label, { color: theme.text }]}>Sleep hours: {sleep} hrs</Text>
          <Slider
            minimumValue={0}
            maximumValue={24}
            step={1}
            value={sleep}
            onValueChange={setSleep}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.trackBackground}
            thumbTintColor={theme.primary}
            style={{ width: '80%', height: 40 }}
          />

          <Text style={[styles.label, { color: theme.text }]}>Energy level: {energy}/10</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={energy}
            onValueChange={setEnergy}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.trackBackground}
            thumbTintColor={theme.primary}
            style={{ width: '80%', height: 40 }}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonPrimaryBackground }]}
            onPress={() => onSubmit(selectedMood, sleep, energy)}
          >
            <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MoodDetailsModal;
