// src/navigation/AppNavigator.js
/**
 * AppNavigator.js
 *
 * This file defines the `AppNavigator` component, which is responsible for managing
 * the application's navigation logic. It includes both authentication-related screens
 * (e.g., Onboarding, Login, Registration) and authenticated app screens (e.g., HealthLog,
 * MainTabs, Chat, Settings). The navigation is handled using React Navigation, and the
 * app initializes by checking the user's onboarding status and loading essential data like
 * mood and location information.
 *
 * Features:
 * - Conditional navigation based on the user's authentication status.
 * - Dynamic loading of initial route (Onboarding or Login) based on onboarding status.
 * - Checks if the user has logged their mood for the day and updates the navigation accordingly.
 * - Requests location permissions and tracks the user's location for location-based features.
 * - Displays a splash screen while resources like fonts are loading.
 *
 * This navigator integrates with the following libraries:
 * - React Navigation for screen transitions.
 * - Redux for managing the application's state (e.g., user authentication, theme).
 * - Expo for location permissions, splash screen, and font loading.
 * - React Native Gesture Handler for handling gestures.
 * - Safe Area Context for managing screen insets across devices.
 *
 * Dependencies:
 * - `@react-navigation/native`
 * - `@react-navigation/native-stack`
 * - `react-redux`
 * - `expo-splash-screen`
 * - `expo-location`
 * - `react-native-gesture-handler`
 * - `react-native-safe-area-context`
 * - `@expo-google-fonts/poppins`
 *
 * Author: Sunidhi Abhange
 */

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
// import DoctorLicenseUpload from '../screens/DoctorLicenseUpload';
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

  useEffect(() => {
  const saveImageToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied for MediaLibrary');
        return;
      }

      const asset = Asset.fromModule(require('../assets/doctor_verification.jpg'));
      await asset.downloadAsync();

      // Get all image assets from the library
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 100, // You can increase this if needed
      });

      const alreadyExists = media.assets.some(existing =>
        existing.filename === asset.name || existing.uri === asset.localUri
      );

      if (alreadyExists) {
        console.log('Image already exists in gallery');
      } else {
        await MediaLibrary.saveToLibraryAsync(asset.localUri);
        console.log('Image saved to gallery!');
      }
    } catch (err) {
      console.error('Error saving image:', err);
    }
  };

  saveImageToGallery();
}, []);

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
              {/* <Stack.Screen name="DoctorLicenseUpload" component={DoctorLicenseUpload} /> */}
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
