// client/src/screens/HealthlogScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayMood, submitMood } from '../store/actions/healthlogActions';
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import MoodDetailsModal from '../modals/MoodDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { get } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';

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

  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [recoveredSymptomsCache, setRecoveredSymptomsCache] = useState({});
  const [addedSymptoms, setAddedSymptoms] = useState([]);

  const today = format(new Date(), 'EEE, dd MMM yyyy');

  useEffect(() => {
    const fetchTodayLogs = async () => {
      try {
        console.log('Fetching:', `${API_URL_HEALTHLOG}/today?userId=${userId}`);
        const result = await get('/api/healthlog/today', { userId });
        console.log('Fetched today logs:', result);
      } catch (error) {
        console.error('Error fetching today logs:', error);
      }
    };

    if (userId) fetchTodayLogs();
  }, [userId]);


  // Fetch today's symptoms
  const fetchTodaySymptoms = async () => {
    if (!userId) return;
    try {
      const cached = await AsyncStorage.getItem(`recoveredSymptoms-${userId}`);
      const recoveredCache = cached ? JSON.parse(cached) : {};
      setRecoveredSymptomsCache(recoveredCache);

      const response = await get(`${API_URL_HEALTHLOG}/today?userId=${userId}`);
      const mappedSymptoms = (response.symptoms || []).map(s => ({
        ...s,
        recovered_at: recoveredCache[s.symptom] || s.recovered_at || null,
      }));
      setTodaySymptoms(mappedSymptoms);
    } catch (err) {
      console.error('Error fetching today symptoms:', err);
    }
  };

  // Fetch mood + decide whether to skip HealthLog
  useEffect(() => {
    const fetchMoodAndSymptoms = async () => {
      if (!userId) return;
      try {
        const moodResponse = await dispatch(fetchTodayMood(userId)).unwrap();
        const symptomResponse = await get(`${API_URL_HEALTHLOG}/today?userId=${userId}`);

        const hasMood = moodResponse?.mood;
        const hasSymptomWithDetail = (symptomResponse?.symptoms || []).some(
          s => !s.recovered_at
        );

        if (hasMood && hasSymptomWithDetail) {
          navigation.replace('MainTabs');
        } else {
          setFetchCompleted(true);
        }
      } catch (err) {
        console.error('Failed to fetch today data:', err);
        setFetchCompleted(true);
      }
    };

    fetchMoodAndSymptoms();
  }, [dispatch, userId, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTodaySymptoms();
      if (route.params?.showSymptoms) {
        setShowSymptoms(true);
      }
    }, [route.params, userId])
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
      await dispatch(submitMood({ user_id: userId, mood, sleep, energy })).unwrap();
      await AsyncStorage.removeItem('moodSkipped');

      if (mood === 'Feeling great!') {
        navigation.replace('MainTabs');
      } else {
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
      setAddedSymptoms([]);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
      setTimeout(() => {
        navigation.navigate("MainTabs", { screen: "DailyLog" });
      }, 0);
    }
  };

  const handleSymptomDetailsClose = () => {
    setShowSymptomDetails(false);
    setAddedSymptoms([]);
    fetchTodaySymptoms();

    // reset and go to DailyLog
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
    setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'DailyLog' });
    }, 0);
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
      <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 10 }}>
        {today}
      </Text>
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

      {selectedMood && (
        <MoodDetailsModal
          visible={showMoodModal}
          selectedMood={selectedMood}
          onSubmit={handleMoodSubmit}
        />
      )}

      {showSymptoms && (
        <SymptomsModal
          visible={showSymptoms}
          onClose={handleSymptomsClose}
          currentSymptoms={todaySymptoms.filter(s => !s.recovered_at).map(s => s.symptom)}
          addedSymptoms={addedSymptoms}
          setAddedSymptoms={setAddedSymptoms}
        />
      )}

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
