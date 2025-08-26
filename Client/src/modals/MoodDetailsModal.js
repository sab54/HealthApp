// client/src/modals/MoodDetailsModal.js
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
