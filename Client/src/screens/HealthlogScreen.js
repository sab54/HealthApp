import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayMood, submitMood } from '../store/actions/healthlogActions';
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import MoodDetailsModal from '../modals/MoodDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, CommonActions } from '@react-navigation/native';

const HealthLogScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.healthlog);
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;

  const [showSymptoms, setShowSymptoms] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [showSymptomDetails, setShowSymptomDetails] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  // Fetch today's mood
  useEffect(() => {
    const fetchMood = async () => {
      if (userId) {
        try {
          const response = await dispatch(fetchTodayMood(userId)).unwrap();
          if (response && response.mood) {
            navigation.replace('MainTabs');
          } else {
            setFetchCompleted(true);
          }
        } catch (err) {
          console.error('Failed to fetch today mood:', err);
          setFetchCompleted(true);
        }
      }
    };
    fetchMood();
  }, [dispatch, userId, navigation]);

  // Open SymptomsModal if navigated from another screen
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.showSymptoms) {
        setShowSymptoms(true);
      }
    }, [route.params])
  );

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setShowMoodModal(true);
  };

  const handleMoodSubmit = async (mood, sleep, energy) => {
    setShowMoodModal(false);

    if (!userId) {
      Alert.alert('Error: user not found');
      return;
    }

    try {
      // ✅ Submit mood along with sleep and energy immediately
      await dispatch(submitMood({ user_id: userId, mood, sleep, energy })).unwrap();
      await AsyncStorage.removeItem('moodSkipped');

      if (mood === 'Feeling great!') {
        navigation.replace('MainTabs');
      } else {
        // ✅ Open Symptoms modal AFTER mood is stored
        setShowSymptoms(true);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error saving your mood details.');
    }
  };

  const handleSymptomsClose = (symptomObject) => {
    setShowSymptoms(false);
    if (symptomObject) {
      setSelectedSymptom(symptomObject);
      setShowSymptomDetails(true);
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'DailyLog' } }],
        })
      );
    }
  };

  const handleSymptomDetailsClose = () => {
    setShowSymptomDetails(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'DailyLog' } }],
      })
    );
  };

  if (loading && !fetchCompleted) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>Your response will help us tailor your experience.</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#755CDB' }]}
        onPress={() => handleMoodSelect('Feeling great!')}
      >
        <View style={styles.iconRow}>
          <Ionicons name="happy-sharp" size={24} color="#D2C7FF" style={styles.icon} />
          <Text style={[styles.buttonText, { color: '#FFFFFA' }]}>Feeling great!</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#7EA5F4' }]}
        onPress={() => handleMoodSelect('Not feeling good!')}
      >
        <View style={styles.iconRow}>
          <Ionicons name="sad-sharp" size={24} color="#C5DFFD" style={styles.icon} />
          <Text style={[styles.buttonText, { color: '#FFFFFA' }]}>Not feeling good!</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipTextContainer}
        onPress={() => navigation.replace('MainTabs')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Mood Details Modal */}
      {selectedMood && (
        <MoodDetailsModal
          visible={showMoodModal}
          selectedMood={selectedMood}
          onSubmit={handleMoodSubmit}
        />
      )}

      {/* Symptoms Modal */}
      {showSymptoms && <SymptomsModal visible={showSymptoms} onClose={handleSymptomsClose} />}
      {showSymptomDetails && selectedSymptom && (
        <SymptomDetailModal
          visible={showSymptomDetails}
          symptom={selectedSymptom}
          onClose={handleSymptomDetailsClose}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#E0E7FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#4B5563' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  button: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, marginVertical: 10, width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 10 },
  buttonText: { fontSize: 18, fontWeight: '600' },
  skipTextContainer: { position: 'absolute', top: 40, right: 20 },
  skipText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
});

export default HealthLogScreen;
