// Client/src/components/DailyMoodReminder.js
/**
 * DailyMoodReminder.js
 * 
 * This file defines the `DailyMoodReminder` component, which shows a reminder modal to 
 * users who have skipped entering their mood for the day. The reminder appears periodically 
 * based on a set interval. The component checks if the user has skipped the mood entry and 
 * triggers a reminder when necessary. It uses AsyncStorage to track the last reminder and 
 * whether the user skipped entering their mood.
 * 
 * Features:
 * - Displays a modal reminder to the user if they skipped entering their mood.
 * - Provides options to enter mood or dismiss the reminder.
 * - Checks for the mood entry status and triggers the reminder at regular intervals.
 * - Handles app state changes to ensure the reminder is triggered when the app becomes active.
 * 
 * Props:
 * - No external props are passed to this component.
 * 
 * Dependencies:
 * - `react-native`
 * - `@react-navigation/native`
 * - `@react-native-async-storage/async-storage`
 * - `react-redux`
 * - `react-native`
 * 
 * Key Variables:
 * - `moodToday`: The current mood status from the Redux store.
 * - `userId`: The ID of the logged-in user.
 * - `appState`: Tracks the app's current state (active/inactive).
 * - `timerRef`: Reference to the reminder interval timer.
 * 
 * Author: Sunidhi Abhange
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTodayMood } from '../store/actions/healthlogActions';

const REMINDER_INTERVAL = 1 * 60 * 1000;

const DailyMoodReminder = () => {
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { moodToday } = useSelector((state) => state.healthlog);
  const userId = useSelector((state) => state.auth.user?.id);
  const appState = useRef(AppState.currentState);
  const timerRef = useRef(null);

  // Function can be async
  const checkReminder = async () => {
    if (!userId) return;
    try {
      await dispatch(fetchTodayMood(userId)).unwrap();
    } catch (err) {
      console.log('Error fetching mood:', err);
    }

    const lastReminder = await AsyncStorage.getItem('lastMoodReminder');
    const skipped = await AsyncStorage.getItem('moodSkipped');
    const now = Date.now();

    if (!moodToday && skipped === 'true') {
      if (!lastReminder || now - Number(lastReminder) >= REMINDER_INTERVAL) {
        setShowModal(true);
      }
    }
  };

  useEffect(() => {
    checkReminder();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkReminder();
      }
      appState.current = nextAppState;
    });

    timerRef.current = setInterval(checkReminder, REMINDER_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
      subscription.remove();
    };
  }, [userId, moodToday]);

  const handleOpenMoodPrompt = async () => {
    setShowModal(false);
    navigation.navigate('MoodPrompt');
  };

  const handleDismiss = async () => {
    const now = Date.now();
    await AsyncStorage.setItem('lastMoodReminder', now.toString());
    setShowModal(false);
  };

  // Always render component, modal is conditional
  return (
    <>
      {showModal && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.container}>
              <Text style={styles.title}>
                You skipped entering your mood. How are you feeling now?
              </Text>
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.button} onPress={handleOpenMoodPrompt}>
                  <Text style={styles.buttonText}>Enter Mood</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.dismiss]} onPress={handleDismiss}>
                  <Text style={styles.buttonText}>Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};


const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  buttons: { flexDirection: 'row', marginTop: 10 },
  button: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  dismiss: { backgroundColor: '#A9A9A9' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default DailyMoodReminder;
