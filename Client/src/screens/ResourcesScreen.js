/**
 * ResourcesScreen.js
 * 
 * This screen displays emergency resources, including the current weather and a forecast. 
 * Users can also refresh the weather data by pulling down the screen. It integrates with external modules 
 * like `WeatherCard` to display weather information and `EmergencyShortcuts` for quick access to critical resources.
 * 
 * Key Features:
 * - Displays the current weather and a weather forecast.
 * - Refreshes weather data when the user pulls to refresh.
 * - Includes emergency resource shortcuts for quick access.
 * - Uses Redux to manage and fetch weather data.
 * - Displays loading indicator while data is being fetched.
 * 
 * Dependencies:
 * - `react-native` for UI components.
 * - `react-redux` for state management.
 * - `expo-font` for custom font loading.
 * - `WeatherCard` for displaying weather details.
 * - `EmergencyShortcuts` for quick access to emergency resources.
 * 
 * API Interaction:
 * - Uses `fetchWeatherData` and `fetchForecastData` to get weather information.
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useCallback, useEffect  } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFonts } from 'expo-font';

import {
    fetchWeatherData,
    fetchForecastData,
} from '../store/actions/weatherActions';

import EmergencyShortcuts from '../module/EmergencyShortcuts';
import Footer from '../components/Footer';
import WeatherCard from '../module/WeatherCard';

const ResourcesScreen = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.themeColors);
    const [fontsLoaded] = useFonts({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
        PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    });

    const [refreshing, setRefreshing] = useState(false);

    const styles = createStyles(theme);

    const primaryColor = theme.primary || theme.info || '#0078D4';

    const weatherData = useSelector(state => state.weather.current);
    const forecastData = useSelector(state => state.weather.forecast);
    const loadingWeather = useSelector(state => state.weather.loading);

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

    if (!fontsLoaded) {
        return (
            <View
                style={[styles.centered, { backgroundColor: theme.background }]}
            >
                <ActivityIndicator size='large' color={primaryColor} />
                <Text style={styles.loadingText}>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[primaryColor]}
                    tintColor={primaryColor}
                />
            }
        >
            <Text style={styles.title}>📚 Emergency Resources</Text>
            {/* Added WeatherCard at the top */}
            <WeatherCard
                weatherData={weatherData}
                forecastData={forecastData}
                loadingWeather={loadingWeather}
                theme={theme}
            />

            <EmergencyShortcuts theme={theme} />

            <Footer theme={theme} />
        </ScrollView>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            padding: 20,
            paddingBottom: 100,
        },
        title: {
            fontSize: 24,
            fontFamily: 'PoppinsBold',
            marginBottom: 20,
            color: theme.primary || theme.info || '#0078D4',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            fontFamily: 'Poppins',
            color: theme.text,
        },
    });

export default ResourcesScreen;
