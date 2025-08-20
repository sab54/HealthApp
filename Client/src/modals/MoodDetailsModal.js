// client/src/modals/MoodDetailsModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const MoodDetailsModal = ({ visible, selectedMood, onSubmit }) => {
  const [sleep, setSleep] = useState(8);
  const [energy, setEnergy] = useState(5);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Self-Reflection</Text>
          <Text style={styles.moodText}>Mood: {selectedMood}</Text>

          <Text style={styles.label}>Sleep hours: {sleep} hrs</Text>
          <Slider
            minimumValue={0}
            maximumValue={24}
            step={1}
            value={sleep}
            onValueChange={setSleep}
            minimumTrackTintColor="#755CDB"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#755CDB"
            style={{ width: '80%', height: 40 }}
          />

          <Text style={styles.label}>Energy level: {energy}/10</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={energy}
            onValueChange={setEnergy}
            minimumTrackTintColor="#755CDB"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#755CDB"
            style={{ width: '80%', height: 40 }}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSubmit(selectedMood, sleep, energy)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  moodText: { fontSize: 18, fontWeight: '500', marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 10 },
  button: {
    marginTop: 20,
    backgroundColor: '#755CDB',
    padding: 15,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default MoodDetailsModal;
