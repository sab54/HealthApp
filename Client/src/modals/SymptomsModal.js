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
} from 'react-native';
import symptomsData from '../data/symptomHealth';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const SymptomsModal = ({ visible, onClose }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  const handleSymptomSelect = (symptomObj) => {
    // Only one symptom can be selected at a time
    setSelectedSymptoms([symptomObj.symptom]);

    // Pass the whole symptom object to next modal
    onClose(symptomObj);
  };

  const filteredSymptoms = symptomsData.filter(item =>
    item.symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.fullScreenContainer}>
        <Text style={styles.title}>Select Your Symptoms</Text>

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
            return (
              <TouchableOpacity
                style={[styles.symptomItem, isSelected && styles.selectedItem]}
                onPress={() => handleSymptomSelect(item)}
              >
                <Image
                  source={item.image}
                  style={[
                    styles.symptomImage,
                    isSelected && { tintColor: '#dddeedff' }
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.symptomText,
                    isSelected && styles.selectedText,
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
