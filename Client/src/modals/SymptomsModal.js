import React, { useState, useEffect } from 'react';
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
import { symptomHealth } from '../data/symptomHealth';


import { useSelector, useDispatch } from 'react-redux';
import { addSymptom } from '../store/reducers/healthlogReducers';

const SymptomsModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  // Fetch symptoms already added today from Redux
  //const todaySymptoms = useSelector(state => state.healthlog.todaySymptoms.map(s => s.symptom));
const todaySymptomsRaw = useSelector(state => state.healthlog.todaySymptoms);
const todaySymptoms = todaySymptomsRaw.map(s => s.symptom);

  const MAX_SYMPTOMS = 3;

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchTerm('');  // reset search when modal opens
    }
  }, [visible]);

  const handleSymptomSelect = (symptomObj) => {
    if (todaySymptoms.includes(symptomObj.symptom) || todaySymptoms.length >= MAX_SYMPTOMS) {
      return;
    }

    // Update Redux directly
    dispatch(addSymptom(symptomObj));

    // Close modal and pass selected symptom back (for detail screen navigation)
    onClose(symptomObj);
  };

const filteredSymptoms = symptomHealth.filter(item =>
  item.symptom.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.fullScreenContainer}>
        <Text style={styles.title}>Select Your Symptoms</Text>
        <Text style={styles.infoText}>
          Add your symptoms (max {MAX_SYMPTOMS} per day).
        </Text>
        {todaySymptoms.length > 0 && (
          <Text style={styles.selectedCountText}>
            You have already selected {todaySymptoms.length} today.
          </Text>
        )}

        <TextInput
          style={styles.searchBar}
          placeholder="Search symptoms..."
          placeholderTextColor="#abb9e7ff"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <FlatList
          data={filteredSymptoms}
          keyExtractor={item => item.symptom}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          renderItem={({ item }) => {
            const isDisabled =
              todaySymptoms.includes(item.symptom) || todaySymptoms.length >= MAX_SYMPTOMS;

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

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onClose(null)}
        >
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
