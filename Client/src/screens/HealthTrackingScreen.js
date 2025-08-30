/**
 * HealthTrackingScreen.js
 * 
 * This file defines the `HealthTrackingScreen` component, which is responsible for 
 * displaying various health tracking trends of a user, including mood, energy, 
 * and sleep data. The screen retrieves data from an API and visualizes it using 
 * charts such as bar and line charts. It supports dynamic selection of the 
 * number of days (3 or 15) to display trends.
 *
 * Features:
 * - Displays mood trends (Feeling great vs Not good) using a bar chart.
 * - Displays energy levels (1-10) over time using a line chart.
 * - Displays sleep hours per day using a line chart with color-coded markers.
 * - Allows the user to toggle between displaying 3 days or 15 days of data.
 * 
 * This screen makes use of the following libraries:
 * - React Native for UI components and hooks (useState, useEffect).
 * - Redux for managing theme colors.
 * - React Native Chart Kit for rendering line and bar charts.
 * - React Navigation for passing `userId` via route params.
 * - Safe Area Context for handling screen insets in a cross-platform way.
 * 
 * Dependencies:
 * - `react-native-chart-kit`
 * - `react-redux`
 * - `react-native-safe-area-context`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { get } from '../utils/api';

const screenWidth = Dimensions.get('window').width;

const HealthTrackingScreen = ({ route }) => {
  const { userId } = route.params || {};
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(15);

  const theme = useSelector((state) => state.theme.themeColors);
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

const LegendItem = ({ color, label, theme }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={[styles.legendText, { color: theme.text }]}>{label}</Text>
  </View>
);


  useEffect(() => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }

    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await get(`${API_URL_HEALTHLOG}/trends/${userId}`, { days });
        if (data.success) {
          setTrends(data.trends || []);
        } else {
          setError('Failed to load trends');
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching trends');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [userId, days]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text }}>Loading trends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.error }}>{error}</Text>
      </View>
    );
  }

  const labels = trends.map((t) => t.date?.slice(5) ?? '');
  const moodData = trends.map((t) => (t.mood === 'Feeling great!' ? 1 : 0));
  const energyData = trends.map((t) => t.energy ?? 0);
  const sleepData = trends.map((t) => t.sleep ?? 0);
  const sleepColors = sleepData.map((s) =>
    s >= 7 && s <= 8 ? theme.success : theme.error
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header + Dropdown */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>My Tracking</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={() => setDays(3)}>
            <Text
              style={[
                styles.dropdownItem,
                { color: days === 3 ? theme.text : theme.mutedText },
              ]}
            >
              3 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDays(15)}>
            <Text
              style={[
                styles.dropdownItem,
                { color: days === 15 ? theme.text : theme.mutedText },
              ]}
            >
              15 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Trend</Text>
        <BarChart
          data={{
            labels,
            datasets: [
              {
                data: moodData,
                colors: moodData.map((v) =>
                  v === 1 ? () => theme.success : () => theme.error
                ),
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1, index) =>
              moodData[index] === 1 ? theme.success : theme.error,
            labelColor: () => theme.text,
          }}
          style={styles.chart}
          fromZero
          withCustomBarColorFromData
          flatColor
          showValuesOnTopOfBars
        />
        <View style={styles.legendRow}>
          <LegendItem color={theme.success} label="Feeling Great" theme={theme} />
          <LegendItem color={theme.error} label="Not Good" theme={theme} />
        </View>
      </View>

      {/* Energy Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Energy Trend (1-10)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: energyData }] }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: () => theme.primary,
            labelColor: () => theme.text,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Sleep Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Trend (hrs)</Text>
        <LineChart
          data={{ labels, datasets: [{ data: sleepData }] }}
          width={screenWidth - 40}
          height={220}
          withDots
          chartConfig={{
            ...chartConfig,
            color: () => theme.primary,
            labelColor: () => theme.text,
            propsForDots: { r: '6', strokeWidth: '2', stroke: theme.card },
          }}
          bezier
          style={styles.chart}
          renderDotContent={({ x, y, index }) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                top: y - 6,
                left: x - 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: sleepColors[index],
              }}
            />
          )}
        />
        <View style={styles.legendRow}>
          <LegendItem color={theme.success} label="7–8 hrs (Healthy)" theme={theme} />
          <LegendItem color={theme.error} label="Unhealthy" theme={theme} />
        </View>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2' },
};

const createStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom,
      backgroundColor: theme.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.title,
    },
    dropdownContainer: {
      flexDirection: 'row',
      borderRadius: 20,
      padding: 5,
      backgroundColor: theme.surface,
    },
    dropdownItem: {
      marginHorizontal: 10,
      fontSize: 14,
    },
    card: {
      borderRadius: 20,
      padding: 15,
      marginVertical: 10,
      backgroundColor: theme.card,
      shadowColor: theme.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: theme.title
    },
    chart: {
      borderRadius: 16,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
    },
    legendText: {
      fontSize: 13,
    },
  });

export default HealthTrackingScreen;
