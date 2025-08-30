// Client/src/screens/HomeScreen.js
/**
 * HomeScreen.js
 * 
 * This file defines the `HomeScreen` component, which serves as the main dashboard for 
 * the user, displaying their daily wellness data, upcoming appointments, and other relevant 
 * health-related information. The screen dynamically fetches and displays data such as the user's 
 * mood, symptoms, and next appointment, and allows the user to navigate to detailed pages.
 * 
 * Features:
 * - Displays the user's mood, sleep, and energy levels for the day.
 * - Shows the user's next upcoming appointment, with details about the appointment date and time.
 * - Provides loading indicators and error handling for fetching data from the server.
 * - Dynamically updates based on the user's health data, appointments, and symptom tracking.
 * - Displays content in a scrollable list with multiple content blocks, such as wellness data and appointments.
 * 
 * This component integrates with the following libraries:
 * - Redux for managing health log data, user data, and appointments.
 * - React Navigation for navigating between screens.
 * - Expo for custom font loading.
 * - React Native components like `FlatList`, `TouchableOpacity`, `ActivityIndicator`, and `Text`.
 * - AsyncStorage for storing user-related data such as role and approval status.
 * 
 * Dependencies:
 * - `react-redux`
 * - `react-navigation`
 * - `expo-font`
 * - `react-native`
 * - `@react-native-async-storage/async-storage`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

//Actions
import { fetchTodayMood } from '../store/actions/healthlogActions';
import { fetchAppointments } from '../store/actions/appointmentActions';

// Modules
import DailyWellnessCard from '../module/DailyWellnessCard';
import UpcomingAppointmentCard from '../module/UpcomingAppointmentsCard';

// Components
import Footer from '../components/Footer';

import { getUpcomingAppointment } from '../utils/dateHelpers';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.themeColors);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { moodToday, sleepToday, energyToday, todaySymptoms } = useSelector(
    (state) => state.healthlog
  );

  const { appointments, loading: loadingAppointments } = useSelector(
    (state) => state.appointment
  );

  const [fontsLoaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  const [userRole, setUserRole] = useState('');
  const [isApproved, setIsApproved] = useState(true);

  // Fetch user role & approval
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const approved = await AsyncStorage.getItem('isApproved');
        setUserRole(role || '');
        setIsApproved(approved === '1' || approved === 'true');
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };
    fetchUserStatus();
  }, []);

  // Fetch today’s mood & symptoms
  useEffect(() => {
    const fetchHealth = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        try {
          await dispatch(fetchTodayMood(userId));
        } catch (err) {
          console.error('Failed to fetch today mood/symptoms:', err);
        }
      }
    };
    fetchHealth();
  }, [dispatch]);

  // Fetch user appointments
  // Fetch user appointments
  useEffect(() => {
    const fetchUserAppointments = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) {
        const userId = parseInt(storedId, 10);   // 🔑 convert to number
        try {
          await dispatch(fetchAppointments(userId));
        } catch (err) {
          console.error('Failed to fetch appointments:', err);
        }
      }
    };
    fetchUserAppointments();
  }, [dispatch]);

  const today = new Date();
  const normalizedAppointments = appointments || [];


  const futureAppointments = normalizedAppointments
    .filter((a) => a && a.date && a.time)
    .map((a) => {
      let dateObj;
      if (typeof a.date === "string" && a.date.includes("/")) {
        const [day, month, year] = a.date.split("/");
        dateObj = new Date(`${year}-${month}-${day}T${a.time}:00`);
      } else {
        dateObj = new Date(`${a.date}T${a.time}:00`);
      }
      return { ...a, dateObj };
    })
    .filter((a) => a.dateObj && a.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj);

  const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;

  // console.log("Raw appointments:", appointments);
  // console.log("Flattened appointments:", normalizedAppointments);

  const styles = createStyles(theme, insets);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading fonts...
        </Text>
      </View>
    );
  }

  // Content Blocks for FlatList
  const contentBlocks = [
    {
      key: 'dailyWellness',
      render: () => (
        <DailyWellnessCard
          moodToday={moodToday}
          sleepToday={sleepToday}
          energyToday={energyToday}
          todaySymptoms={todaySymptoms}
          navigation={navigation}
          theme={theme}
        />
      ),
    },
    {
      key: 'upcomingAppointment',
      render: () => (
        <UpcomingAppointmentCard
          appointments={nextAppointment ? [nextAppointment] : []}
          loading={loadingAppointments}
          theme={theme}
          navigation={navigation}
        />
      ),
    },

    {
      key: 'footer',
      render: () => (
        <View style={{ marginTop: 20 }}>
          <Footer theme={theme} />
        </View>
      ),
    },
  ];

  return (
    <FlatList
      data={contentBlocks}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => item.render()}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const createStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 10,
      fontFamily: 'Poppins',
    },
    errorText: {
      fontSize: 14,
      marginTop: 20,
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
  });

export default HomeScreen;
