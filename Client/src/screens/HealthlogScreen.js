// client/src/screens/HealthlogScreen.js
/**
 * HealthLogScreen.js
 * 
 * This file defines the `HealthLogScreen` component, which serves as the main screen 
 * for tracking the user's mood and symptoms on a daily basis. The screen allows users 
 * to select their mood and symptoms for the day, and provides modals for further 
 * interaction, including viewing symptom details and entering recovery plans. 
 * It ensures that users can track their health status and tailor their experience 
 * based on their responses.
 * 
 * Features:
 * - Allows users to select their mood for the day and provides options to mark it as "Feeling great!" or "Not feeling good!".
 * - Fetches and displays the user's symptoms for the day, with the option to mark symptoms as recovered.
 * - Provides modals to view and edit symptoms and mood details.
 * - Automatically navigates to the main screen if the mood and symptoms have already been recorded for the day.
 * - Displays loading and error states when fetching data.
 * 
 * This component integrates with the following libraries:
 * - Redux for managing health log data and user state.
 * - React Navigation for navigation and handling modal visibility.
 * - AsyncStorage for caching mood data.
 * - `date-fns` for formatting dates.
 * - React Native components such as `ActivityIndicator`, `FlatList`, `TouchableOpacity`, and `Alert`.
 * 
 * Dependencies:
 * - `react-redux`
 * - `react-navigation`
 * - `react-native`
 * - `@react-native-async-storage/async-storage`
 * - `date-fns`
 * 
 * Author: Sunidhi Abhange
 */


import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayMood, fetchTodaySymptoms, submitMood } from '../store/actions/healthlogActions';
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import MoodDetailsModal from '../modals/MoodDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { useFocusEffect, CommonActions } from '@react-navigation/native';

const HealthLogScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.healthlog);
  const { user } = useSelector(state => state.auth);
  const theme = useSelector(state => state.theme.themeColors);
const userId = user?.id || user?._id || user?.user_id;

  const [showSymptoms, setShowSymptoms] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [showSymptomDetails, setShowSymptomDetails] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [addedSymptoms, setAddedSymptoms] = useState([]);

  const today = format(new Date(), 'EEE, dd MMM yyyy');

  // Wait for user to load
  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme?.background || '#fff' }]}>
        <ActivityIndicator size="large" color={theme?.buttonPrimaryBackground || '#007AFF'} />
      </View>
    );
  }

  // Check if today's mood & symptoms are already recorded
  useFocusEffect(
    React.useCallback(() => {
      const checkTodayData = async () => {
        if (!userId) return;

        try {
          const moodResult = await dispatch(fetchTodayMood(userId)).unwrap();
          const symptomsResult = await dispatch(fetchTodaySymptoms(userId)).unwrap();

          const moodRecorded = !!moodResult?.mood;
          const symptomsRecorded = symptomsResult?.length > 0;

          if (moodRecorded && symptomsRecorded) {
            // Directly go to MainTabs if already submitted
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            );
            setTimeout(() => navigation.navigate('MainTabs', { screen: 'DailyLog' }), 0);
          } else {
            setFetchCompleted(true);
            setTodaySymptoms(symptomsResult || []);
          }
        } catch (err) {
          console.error('Error fetching today data:', err);
          setFetchCompleted(true);
        }
      };

      checkTodayData();
    }, [userId])
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
      setTimeout(() => navigation.navigate('MainTabs', { screen: 'DailyLog' }), 0);
    }
  };

  const handleSymptomDetailsClose = () => {
    setShowSymptomDetails(false);
    setAddedSymptoms([]);
  };

  if (loading && !fetchCompleted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.buttonPrimaryBackground} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.dateText, { color: theme.text }]}>{today}</Text>
      <Text style={[styles.title, { color: theme.title }]}>How are you feeling today?</Text>
      <Text style={[styles.subtitle, { color: theme.mutedText }]}>
        Your response will help us tailor your experience.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonPrimaryBackground }]}
        onPress={() => handleMoodSelect('Feeling great!')}
      >
        <View style={styles.iconRow}>
          <Ionicons name="happy-sharp" size={24} color={theme.buttonPrimaryText} style={styles.icon} />
          <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Feeling great!</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.buttonSecondaryBackground }]}
        onPress={() => handleMoodSelect('Not feeling good!')}
      >
        <View style={styles.iconRow}>
          <Ionicons name="sad-sharp" size={24} color={theme.buttonSecondaryText} style={styles.icon} />
          <Text style={[styles.buttonText, { color: theme.buttonSecondaryText }]}>Not feeling good!</Text>
        </View>
      </TouchableOpacity>

      {selectedMood && (
        <MoodDetailsModal
          visible={showMoodModal}
          selectedMood={selectedMood}
          onSubmit={handleMoodSubmit}
          theme={theme}
        />
      )}

      {showSymptoms && (
        <SymptomsModal
          visible={showSymptoms}
          onClose={handleSymptomsClose}
          currentSymptoms={todaySymptoms.filter(s => !s.recovered_at).map(s => s.symptom)}
          addedSymptoms={addedSymptoms}
          setAddedSymptoms={setAddedSymptoms}
          theme={theme}
        />
      )}

      {showSymptomDetails && selectedSymptom && (
        <SymptomDetailModal
          visible={showSymptomDetails}
          symptom={selectedSymptom}
          onClose={handleSymptomDetailsClose}
          theme={theme}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 16, marginBottom: 10, fontFamily: 'Poppins' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 10, textAlign: 'center', fontFamily: 'Poppins' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20, fontFamily: 'Poppins' },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 10 },
  buttonText: { fontSize: 18, fontWeight: '600', fontFamily: 'Poppins' },
});

export default HealthLogScreen;
