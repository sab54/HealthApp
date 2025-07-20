import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

// Screens
import OnboardingScreen from '../screens/onboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import DoctorLicenseUpload from '../screens/DoctorLicenseUpload';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useSelector((state) => state.auth);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      const loggedIn = !!user;
      const hasSeenOnboarding = await AsyncStorage.getItem('onboarding_seen');

      if (loggedIn) {
        // Once logged in, skip onboarding forever
        setInitialRoute('Home');
      } else if (hasSeenOnboarding === 'true') {
        // User not logged in, but already seen onboarding
        setInitialRoute('Login');
      } else {
        // Not logged in and hasn't seen onboarding
        setInitialRoute('Onboarding');
      }
    };

    checkInitialRoute();
  }, [user]);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="DoctorLicenseUpload" component={DoctorLicenseUpload} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
