// client/src/modals/SymptomsModal.js
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
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addSymptom } from '../store/reducers/healthlogReducers';
import { symptomHealth } from '../data/symptomHealth';
import { Ionicons } from '@expo/vector-icons';

const SymptomsModal = ({ visible, onClose, addedSymptoms, setAddedSymptoms, showCloseButton = true }) => {
  const dispatch = useDispatch();
  const MAX_SYMPTOMS = 3;

  // Get today's symptoms from Redux
  const todaySymptomsRaw = useSelector(state => state.healthlog.todaySymptoms);
  const todaySymptoms = todaySymptomsRaw.map(s => s.symptom);

  // Get current theme from Redux
  const theme = useSelector(state => state.theme.themeColors);

  const [searchTerm, setSearchTerm] = useState('');

  // Reset search whenever modal opens or theme changes
  useEffect(() => {
    if (visible) setSearchTerm('');
  }, [visible, theme]);

  const handleSymptomSelect = (symptomObj) => {
    if (todaySymptoms.includes(symptomObj.symptom) || todaySymptoms.length >= MAX_SYMPTOMS) return;
    dispatch(addSymptom(symptomObj));
    setAddedSymptoms([...addedSymptoms, symptomObj.symptom]);
    onClose(symptomObj);
  };

  const filteredSymptoms = symptomHealth.filter(item =>
    item.symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!theme) return null; // safety check, will never crash

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={false}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalBackground }]}>
        {/* Close Button */}
        {showCloseButton && (
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
            onPress={() => onClose(null)}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        )}

        <Text style={[styles.title, { color: theme.title }]}>Select Your Symptoms</Text>
        <Text style={[styles.infoText, { color: theme.text }]}>
          Add your symptoms (max {MAX_SYMPTOMS} per day).
        </Text>

        {todaySymptoms.length > 0 && (
          <Text style={[styles.selectedCountText, { color: theme.mutedText }]}>
            You have already selected {todaySymptoms.length} today.
          </Text>
        )}

        <TextInput
          style={[styles.searchBar, {
            backgroundColor: theme.input,
            color: theme.inputText,
            borderColor: theme.inputBorder,
          }]}
          placeholder="Search symptoms..."
          placeholderTextColor={theme.placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <FlatList
          data={filteredSymptoms}
          keyExtractor={item => item.symptom}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          renderItem={({ item }) => {
            const isDisabled = todaySymptoms.includes(item.symptom) || todaySymptoms.length >= MAX_SYMPTOMS;
            return (
              <TouchableOpacity
                style={[styles.symptomItem, {
                  backgroundColor: isDisabled ? theme.disabled : theme.card,
                  shadowColor: theme.shadow,
                }]}
                onPress={() => !isDisabled && handleSymptomSelect(item)}
                disabled={isDisabled}
              >
                <Image
                  source={item.image}
                  style={[styles.symptomImage,
                  {
                    tintColor: theme.mode === 'dark' ? '#fff' : '#000',
                    opacity: isDisabled ? 0.3 : 1,
                  },
                  ]}
                />
                <Text style={[styles.symptomText, { color: isDisabled ? theme.mutedText : theme.text }]}>
                  {item.symptom}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
    justifyContent: 'flex-start',
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
    ...Platform.select({
      ios: { shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 10, textAlign: 'center', fontFamily: 'Poppins' },
  infoText: { fontSize: 16, marginBottom: 5, fontFamily: 'Poppins' },
  selectedCountText: { fontSize: 14, marginBottom: 15, fontFamily: 'Poppins' },
  searchBar: { height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15, fontFamily: 'Poppins' },
  symptomItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 5,
    ...Platform.select({
      ios: { shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  symptomImage: { width: 48, height: 48, marginBottom: 8 },
  symptomText: { fontSize: 14, fontWeight: '500', textAlign: 'center', fontFamily: 'Poppins' },
});

export default SymptomsModal;
