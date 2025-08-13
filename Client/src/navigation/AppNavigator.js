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
import DoctorLicenseUpload from '../screens/DoctorLicenseUpload';
import TabNavigator from './TabNavigator';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import AddPeopleScreen from '../screens/Chat/AddPeopleScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { loadThemeFromStorage } from '../store/actions/themeActions';
import { updateUserLocation } from '../store/actions/loginActions';

import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const navigationRef = useNavigationContainerRef();
  const { user } = useSelector((state) => state.auth);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isSplashReady, setSplashReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsBold: Poppins_700Bold,
  });

    // ✅ Automatically save doctor.jpg to gallery
  useEffect(() => {
    const saveImageToGallery = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = Asset.fromModule(require('../assets/doctor.jpg'));
          await asset.downloadAsync(); // Ensure file is local
          await MediaLibrary.saveToLibraryAsync(asset.localUri);
          console.log('Image saved to gallery!');
        } else {
          console.log('Permission denied for MediaLibrary');
        }
      } catch (err) {
        console.error('Error saving image:', err);
      }
    };

    saveImageToGallery();
  }, []);


  useEffect(() => {
    const init = async () => {
      dispatch(loadThemeFromStorage());
      await SplashScreen.preventAutoHideAsync();
      const hasSeenOnboarding = await AsyncStorage.getItem('onboarding_seen');

      if (user) {
        setInitialRoute('MainTabs');
      } else if (hasSeenOnboarding === 'true') {
        setInitialRoute('Login');
      } else {
        setInitialRoute('Onboarding');
      }

      setSplashReady(true);
    };
    init();
  }, [user]);

  useEffect(() => {
    if (fontsLoaded && isSplashReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isSplashReady]);

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

  if (!initialRoute || !fontsLoaded || !isSplashReady) {
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
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="DoctorLicenseUpload" component={DoctorLicenseUpload} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="AddPeopleScreen" component={AddPeopleScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
