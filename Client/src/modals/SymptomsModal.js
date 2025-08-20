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

const SymptomsModal = ({ visible, onClose, currentCount = 0, currentSymptoms = [] }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const MAX_SYMPTOMS = 3;
  const remaining = MAX_SYMPTOMS - currentCount;

  const handleSymptomSelect = (symptomObj) => {
    if (currentCount + selectedSymptoms.length >= MAX_SYMPTOMS) return;
    if (currentSymptoms.includes(symptomObj.symptom)) return; // ❌ Prevent duplicate

    setSelectedSymptoms([symptomObj.symptom]);
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
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => {
            const isSelected = selectedSymptoms.includes(item.symptom);
            const isDisabled = remaining <= 0 || currentSymptoms.includes(item.symptom);

            return (
              <TouchableOpacity
                style={[
                  styles.symptomItem,
                  isSelected && styles.selectedItem,
                  isDisabled && styles.disabledItem,
                ]}
                onPress={() => !isDisabled && handleSymptomSelect(item)}
                disabled={isDisabled}
              >
                <Image
                  source={item.image}
                  style={[
                    styles.symptomImage,
                    isSelected && { tintColor: '#dddeedff' },
                    isDisabled && { opacity: 0.3 },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.symptomText,
                    isSelected && styles.selectedText,
                    isDisabled && { color: '#888' },
                  ]}
                >
                  {item.symptom}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4B5563',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
    color: '#4A4A4A',
  },
  selectedCountText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#D9534F',
    marginBottom: 10,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#D0D7E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4A4A4A',
  },
  symptomItem: {
    flex: 1,
    margin: 5,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D7E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    backgroundColor: '#80A5F4',
    borderColor: '#007AFF',
  },
  disabledItem: {
    backgroundColor: '#F0F0F0',
    borderColor: '#ccc',
  },
  symptomText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  symptomImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
});

export default SymptomsModal;
