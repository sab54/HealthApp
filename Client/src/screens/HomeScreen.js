// Client/src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
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

// Weather + News Actions
import { fetchWeatherData, fetchForecastData } from '../store/actions/weatherActions';

// HealthLog Actions
import { fetchTodayMood } from '../store/actions/healthlogActions';

// Modules
import WeatherCard from '../module/WeatherCard';
import DailyWellnessCard from '../module/DailyWellnessCard'; // ✅ imported as separate module

// Components
import Footer from '../components/Footer';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.themeColors);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {
    current: weatherData,
    forecast: forecastData,
    loading: loadingWeather,
    error,
  } = useSelector((state) => state.weather);

  const { moodToday, sleepToday, energyToday, todaySymptoms } = useSelector(state => state.healthlog);


  const [refreshing, setRefreshing] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  const [userRole, setUserRole] = useState('');
  const [isApproved, setIsApproved] = useState(true);

  // Fetch user role & approval from AsyncStorage
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


  // Weather Data Fetch
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchWeatherData()),
      dispatch(fetchForecastData()),
    ]).finally(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchWeatherData());
    dispatch(fetchForecastData());
  }, [dispatch]);


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
      key: 'header',
      render: () => (
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>
            <Text style={{ color: '#DB4437' }}>Res</Text>
            <Text style={{ color: '#4285F4' }}>Q</Text>
            <Text style={{ color: '#0F9D58' }}>Zone</Text>
          </Text>
          <Text style={styles.subtitle}>
            <Text style={{ color: '#DB4437' }}>Respond</Text>
            <Text style={{ color: theme.text }}>. </Text>
            <Text style={{ color: '#4285F4' }}>Prepare</Text>
            <Text style={{ color: theme.text }}>. </Text>
            <Text style={{ color: '#0F9D58' }}>StaySafe</Text>
          </Text>
        </View>
      ),
    },
    {
      key: 'dailyWellness',
      render: () => (
        <DailyWellnessCard
          moodToday={moodToday}
          sleepToday={sleepToday}        // ✅ pass sleep
          energyToday={energyToday}      // ✅ pass energy
          todaySymptoms={todaySymptoms}
          navigation={navigation}
          theme={theme}
        />
      ),
    },
    {
      key: 'weather',
      render: () => (
        <View style={styles.blockSpacing}>
          <WeatherCard
            weatherData={weatherData}
            forecastData={forecastData}
            loadingWeather={loadingWeather}
            theme={theme}
          />
        </View>
      ),
    },
    ...(error
      ? [
        {
          key: 'error',
          render: () => (
            <Text style={[styles.errorText, { color: theme.danger || 'red' }]}>
              ⚠️ Weather fetch failed: {error}
            </Text>
          ),
        },
      ]
      : []),
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
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
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
    headerWrapper: {
      alignItems: 'center',
      marginBottom: 24,
    },
    headerText: {
      fontSize: 26,
      fontWeight: '700',
      fontFamily: 'PoppinsBold',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      marginTop: 1,
      opacity: 0.7,
      fontFamily: 'PoppinsBold',
      textAlign: 'center',
    },
    blockSpacing: {
      marginBottom: 18,
    },
    errorText: {
      fontSize: 14,
      marginTop: 20,
      textAlign: 'center',
      fontFamily: 'Poppins',
    },
  });

export default HomeScreen;
