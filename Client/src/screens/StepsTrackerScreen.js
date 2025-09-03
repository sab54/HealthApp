// Client/src/screens/StepsTrackerScreen.js
/**
 * StepsTrackerScreen.js
 *
 * This screen tracks and displays the user's step data in real-time. It allows users to start, pause, and view their step progress.
 * It also shows detailed statistics, including the total number of steps, distance walked, and calories burned.
 * Users can track their progress on a weekly basis and save their daily steps when the app goes to the background or when the hardware back button is pressed.
 *
 * Key Features:
 * - Displays a progress circle indicating the current step count towards a goal.
 * - Shows daily statistics like calories burned and distance walked.
 * - Allows the user to start, pause, or resume step tracking.
 * - Saves step data when the app goes into the background or the user presses the back button.
 * - Tracks the user’s steps over the past week and visually indicates if they met their daily step goal.
 *
 * Dependencies:
 * - `react-native` for UI components.
 * - `react-redux` for state management.
 * - `expo-font` for custom font loading.
 * - `react-native-progress` for the progress circle component.
 * - `react-navigation` for navigation.
 * - `react-native-safe-area-context` for safe area handling.
 * - `SensorTracker` for step tracking.
 * - `stepsActions` for saving and fetching step data from the backend.
 *
 * Author: Sunidhi Abhange
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, BackHandler, AppState } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import * as Progress from 'react-native-progress';

import * as SensorTracker from '../utils/sensorTracker';
import { saveStepEntry, fetchDailySteps } from '../store/actions/stepsActions';
import { updateCurrentSteps, setPaused } from '../store/reducers/stepsReducer';

const StepsTrackerScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.themeColors);

  const user = useSelector(state => state.auth.user);
  const dailySteps = useSelector(state => state.steps.daily); // array from DB
  const currentSteps = useSelector(state => state.steps.currentSteps);
  const currentDistance = useSelector(state => state.steps.currentDistance);


  const isPaused = useSelector(state => state.steps.isPaused);
  const stepGoal = 100;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        console.log("📱 App going background, saving steps:", currentSteps);

        if (user?.id) {
          dispatch(saveStepEntry({
            user_id: user.id,
            steps: currentSteps,
            distance: currentDistance,
            calories: Math.round(currentSteps * 0.04),
            duration: 0,
          }));
        }
      }
    });

    return () => subscription.remove();
  }, [user, currentSteps, currentDistance, dispatch]);


  useEffect(() => {
    const loadInitialSteps = async () => {
      if (!user?.id) return;

      const res = await dispatch(fetchDailySteps(user.id)).unwrap();
      const today = res.find(row => row.day === new Date().toISOString().split('T')[0]);
      const initialSteps = today ? today.total_steps : 0;
      const initialDistance = today ? today.total_distance : 0;

      console.log("📌 Restoring today's steps from DB:", initialSteps, initialDistance);

      // Restore into Redux
      dispatch(updateCurrentSteps({
        steps: initialSteps,
        distance: initialDistance,
      }));

      // Do NOT start tracker automatically here
      // User will press Play to start
    };

    loadInitialSteps();
  }, [dispatch, user]);

  // Handle Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        console.log("Hardware back pressed, saving steps:", currentSteps);
        if (user?.id) {
          dispatch(saveStepEntry({
            user_id: user.id,
            steps: currentSteps,
            distance: currentDistance,
            calories: Math.round(currentSteps * 0.04),
            duration: 0,
          }));
        }
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation, user, currentSteps, currentDistance])
  );

  const handlePause = () => {
    if (!isPaused) {
      if (user?.id) {
        dispatch(saveStepEntry({
          user_id: user.id,
          steps: currentSteps,
          distance: currentDistance,
          calories: Math.round(currentSteps * 0.04),
          duration: 0,
        }));
      }
      SensorTracker.stopStepTracking?.();
    } else {
      SensorTracker.startStepTracking(
        stepData => dispatch(updateCurrentSteps({
          steps: stepData.steps,
          distance: stepData.distance,
        })),
        currentSteps,
        currentDistance
      );
    }

    dispatch(setPaused(!isPaused));
  };



  const calories = Math.round(currentSteps * 0.04);
  const progress = currentSteps / stepGoal;
  const styles = createStyles(theme, insets);

  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Sun, 1=Mon, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7)); // shift to Monday

    // Build Mon → Sun
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (user?.id) {
            dispatch(saveStepEntry({
              user_id: user.id,
              steps: currentSteps,
              distance: currentDistance,
              calories,
              duration: 0,
            }));
          }
          navigation.goBack();
        }}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.screenTitle}>Step Tracker</Text>
      <Text style={styles.screenSubtitle}>
        Track your daily steps and see your weekly progress
      </Text>

      {/* Progress Circle */}
      <View style={styles.circleWrapper}>
        <Progress.Circle
          size={220}
          progress={progress}
          showsText={false}
          color={theme.primary}
          unfilledColor={theme.surface}
          borderWidth={0}
          thickness={15}
        />
        <View style={styles.circleContent}>
          <Text style={styles.steps}>{currentSteps}</Text>
          <Text style={styles.goal}>/ {stepGoal}</Text>
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={28}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={20} color={theme.primary} />
          <Text style={styles.statValue}>1h 14m</Text>
          <Text style={styles.statLabel}>time</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="flame-outline" size={20} color={theme.primary} />
          <Text style={styles.statValue}>{calories}</Text>
          <Text style={styles.statLabel}>kcal</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="walk-outline" size={20} color={theme.primary} />
          <Text style={styles.statValue}>{(currentDistance / 1000).toFixed(2)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
      </View>



      {/*  Weekly Row with tick */}
      <View style={styles.weekRow}>
        {getWeekDays().map((date, index) => {
          const dayString = date.toISOString().split('T')[0];
          const isToday = dayString === new Date().toISOString().split('T')[0];
          const entry = dailySteps.find(row => row.day === dayString);
          const steps = entry ? entry.total_steps : 0;
          const goalMet = steps >= stepGoal;

          return (
            <View key={index} style={styles.weekDay}>
              <View style={[
                styles.dayCircle,
                {
                  borderColor: goalMet ? theme.buttonPrimaryBackground : theme.border,
                  backgroundColor: theme.surface,
                }
              ]}>
                <Text style={{ color: theme.buttonPrimaryBackground, fontWeight: '600' }}>
                  {date.getDate()}
                </Text>
                {goalMet && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={theme.buttonSecondaryBackground}
                    style={styles.tickIcon}
                  />
                )}
              </View>
              <Text style={styles.dayLabel}>
                {isToday
                  ? "Today"
                  : date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 10 + insets.top,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom,
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.title,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: theme.mutedText,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },

  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  circleContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  steps: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.text,
  },
  goal: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 10,
  },
  pauseButton: {
    marginTop: 8,
    backgroundColor: theme.surface,
    padding: 10,
    borderRadius: 30,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 30,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: theme.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    marginTop: 10,
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  tickIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});

export default StepsTrackerScreen;

