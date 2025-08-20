// Client/src/screens/HealthTrackingScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { get } from '../utils/api';

const screenWidth = Dimensions.get('window').width;

// ✅ LegendItem reusable component
const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const HealthTrackingScreen = ({ route }) => {
  const { userId } = route.params || {};
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(15); // default
  const theme = useSelector((state) => state.theme.themeColors); // ✅ get theme

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
        <Text style={{ color: theme.danger || 'red' }}>{error}</Text>
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header + Dropdown */}
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: theme.primary }]}>
          My Tracking
        </Text>
        <View
          style={[
            styles.dropdownContainer,
            { backgroundColor: theme.secondaryLight },
          ]}
        >
          <TouchableOpacity onPress={() => setDays(3)}>
            <Text
              style={[
                styles.dropdownItem,
                { color: days === 3 ? theme.primary : theme.textSecondary },
              ]}
            >
              3 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDays(15)}>
            <Text
              style={[
                styles.dropdownItem,
                { color: days === 15 ? theme.primary : theme.textSecondary },
              ]}
            >
              15 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood Card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          Mood Trend
        </Text>
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
              moodData[index] === 1
                ? theme.success
                : theme.error,
            labelColor: () => theme.text,
          }}
          style={styles.chart}
          fromZero
          withCustomBarColorFromData
          flatColor
          showValuesOnTopOfBars
        />
        <View style={styles.legendRow}>
          <LegendItem color={theme.success} label="Feeling Great" />
          <LegendItem color={theme.error} label="Not Good" />
        </View>
      </View>

      {/* Energy Card */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          Energy Trend (1-10)
        </Text>
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
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          Sleep Trend (hrs)
        </Text>
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
          <LegendItem color={theme.success} label="7–8 hrs (Healthy)" />
          <LegendItem color={theme.error} label="Unhealthy" />
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: '700' },

  dropdownContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 5,
  },
  dropdownItem: { marginHorizontal: 10, fontSize: 14 },

  card: {
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },

  chart: { borderRadius: 16 },

  // ✅ Legend styling
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
