// Client/src/components/DailyMoodReminder.js
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
