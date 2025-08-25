// src/navigation/AppNavigator.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import OnboardingScreen from '../screens/onboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import HealthTrackingScreen from '../screens/HealthTrackingScreen';
import HealthlogScreen from '../screens/HealthlogScreen';
import SymptomRecoveryPlanScreen from '../screens/SymptomRecoveryPlanScreen';
import DoctorLicenseUpload from '../screens/DoctorLicenseUpload';
import TabNavigator from './TabNavigator';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import AddPeopleScreen from '../screens/Chat/AddPeopleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import DailyMoodReminder from '../components/DailyMoodReminder';
import ChatScreen from '../screens/Chat/ChatScreen';
import StepsTrackerScreen from '../screens/StepsTrackerScreen';

import { loadThemeFromStorage } from '../store/actions/themeActions';
import { updateUserLocation } from '../store/actions/loginActions';
import { fetchTodayMood } from '../store/actions/healthlogActions';

import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';

const Stack = createNativeStackNavigator();

export function AuthStackNav() {
  return (
    <Stack.Navigator
      key="auth"
      screenOptions={{ headerShown: false }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}

const AppNavigator = () => {
  const dispatch = useDispatch();
  const navigationRef = useNavigationContainerRef();
  const { user } = useSelector((state) => state.auth);
  const { moodToday, todaySymptoms } = useSelector((state) => state.healthlog);


  const [initialRoute, setInitialRoute] = useState(null);
  const [isSplashReady, setSplashReady] = useState(false);
  const [checkingMood, setCheckingMood] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsBold: Poppins_700Bold,
  });

  // Splash/onboarding init
  useEffect(() => {
    const init = async () => {
      dispatch(loadThemeFromStorage());
      await SplashScreen.preventAutoHideAsync();
      const hasSeenOnboarding = await AsyncStorage.getItem('onboarding_seen');

      if (hasSeenOnboarding === 'true') {
        setInitialRoute('Login');
      } else {
        setInitialRoute('Onboarding');
      }

      setSplashReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isSplashReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isSplashReady]);

  // Check if today's mood exists
  useEffect(() => {
    const checkMood = async () => {
      if (user?.id) {
        try {
          await dispatch(fetchTodayMood(user.id)).unwrap();
        } catch (err) {
          console.log('No mood logged today');
        }
      }
      setCheckingMood(false);
    };
    if (user) checkMood();
    else setCheckingMood(false);
  }, [user, dispatch]);

  // location effect
  useEffect(() => {
    let locationSub = null;
    const startLocation = async () => {
      if (user) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          locationSub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 10000,
              distanceInterval: 50,
            },
            (loc) => {
              dispatch(updateUserLocation({
                userId: user.id,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              }));
            }
          );
        }
      }
    };
    startLocation();
    return () => {
      if (locationSub) locationSub.remove();
    };
  }, [user]);

  // loading states
  if (!initialRoute || !fontsLoaded || !isSplashReady || checkingMood) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          {user && <DailyMoodReminder />}
          {!user ? (
            <AuthStackNav />
          ) : (
            <Stack.Navigator
              key="app"
              screenOptions={{ headerShown: false }}
              initialRouteName={
                (!moodToday || !Array.isArray(todaySymptoms) || todaySymptoms.length === 0)
                  ? "HealthLog"
                  : "MainTabs"
              }
            >
              <Stack.Screen name="HealthLog" component={HealthlogScreen} />
              <Stack.Screen name="MainTabs" component={TabNavigator} />


              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
              <Stack.Screen name="AddPeopleScreen" component={AddPeopleScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="DoctorLicenseUpload" component={DoctorLicenseUpload} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="StepsTracker" component={StepsTrackerScreen} />
              <Stack.Screen name="HealthTracking" component={HealthTrackingScreen} />
              <Stack.Screen name="SymptomRecoveryPlan" component={SymptomRecoveryPlanScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
