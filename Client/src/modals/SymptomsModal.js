// client/src/modals/SymptomsModal.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import symptomsData from '../data/symptomHealth';

const SymptomsModal = ({ visible, onClose, currentSymptoms = [], currentCount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const MAX_SYMPTOMS = 3;

  const handleSymptomSelect = (symptomObj) => {
    if (currentSymptoms.includes(symptomObj.symptom) || currentCount >= MAX_SYMPTOMS) return;
    onClose(symptomObj);
  };

  const filteredSymptoms = symptomsData.filter(item =>
    item.symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.fullScreenContainer}>
        <Text style={styles.title}>Select Your Symptoms</Text>

        <Text style={styles.infoText}>
          Add your symptoms (max {MAX_SYMPTOMS} per day).
        </Text>
        {currentCount > 0 && (
          <Text style={styles.selectedCountText}>
            You have already selected {currentCount} today.
          </Text>
        )}

        <TextInput
          style={styles.searchBar}
          placeholder="Search symptoms..."
          placeholderTextColor="#abb9e7ff"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <Text style={styles.sectionHeader}>Common</Text>

        <FlatList
          data={filteredSymptoms}
          keyExtractor={item => item.symptom}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          renderItem={({ item }) => {
            const isDisabled = currentSymptoms.includes(item.symptom) || currentCount >= MAX_SYMPTOMS;

            return (
              <TouchableOpacity
                style={[styles.symptomItem, isDisabled && styles.disabledItem]}
                onPress={() => !isDisabled && handleSymptomSelect(item)}
                disabled={isDisabled}
              >
                <Image
                  source={item.image}
                  style={[styles.symptomImage, isDisabled && { opacity: 0.3 }]}
                />
                <Text style={[styles.symptomText, isDisabled && { color: '#aaa' }]}>
                  {item.symptom}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.closeButton} onPress={() => onClose(null)}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F4F7FF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1F2937' },
  infoText: { fontSize: 16, color: '#4B5563', marginBottom: 5 },
  selectedCountText: { fontSize: 14, color: '#6B7280', marginBottom: 15 },
  searchBar: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#1F2937' },
  symptomItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  disabledItem: { backgroundColor: '#E5E7EB' },
  symptomImage: { width: 48, height: 48, marginBottom: 8 },
  symptomText: { fontSize: 14, fontWeight: '500', color: '#1F2937', textAlign: 'center' },
  closeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default SymptomsModal;
