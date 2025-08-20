// Client/src/screens/TrendsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { get } from '../utils/api';

const screenWidth = Dimensions.get('window').width;

const TrendsScreen = ({ route }) => {
  const { userId } = route.params || {};
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }

    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await get(`${API_URL_HEALTHLOG}/trends/${userId}`, { days: 15 });
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
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#755CDB" />
        <Text>Loading trends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  const labels = trends.map(t => t.date?.slice(5) ?? '');
  const moodData = trends.map(t => (t.mood === 'Feeling great!' ? 1 : 0));
  const energyData = trends.map(t => t.energy ?? 0);
  const sleepData = trends.map(t => t.sleep ?? 0);
  const sleepColors = sleepData.map(s => (s >= 7 && s <= 8 ? 'green' : 'red'));

  return (
    <ScrollView style={styles.container}>
      {/* Mood Bar Chart */}
      <Text style={styles.header}>Mood Trend (0 = Not Good, 1 = Great)</Text>
      <BarChart
        data={{
          labels,
          datasets: [
            {
              data: moodData,
              colors: moodData.map(v => (v === 1 ? () => 'green' : () => 'red')),
            },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1, index) =>
            moodData[index] === 1
              ? `rgba(34,197,94,${opacity})` // green
              : `rgba(239,68,68,${opacity})`, // red
        }}
        style={styles.chart}
        fromZero
        withCustomBarColorFromData={true}
        flatColor={true}
        showValuesOnTopOfBars
      />

      {/* Energy Line Chart */}
      <Text style={styles.header}>Energy Trend (1-10)</Text>
      <LineChart
        data={{ labels, datasets: [{ data: energyData }] }}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Sleep Line Chart */}
      <Text style={styles.header}>Sleep Trend (hrs)</Text>
      <LineChart
        data={{ labels, datasets: [{ data: sleepData }] }}
        width={screenWidth - 20}
        height={220}
        withDots={true}
        chartConfig={{
          ...chartConfig,
          propsForDots: { r: '6', strokeWidth: '2', stroke: '#fff' },
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
      <Text style={styles.note}>Green = healthy 7-8 hrs, Red = unhealthy</Text>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#E0E7FF',
  backgroundGradientTo: '#E0E7FF',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(117, 92, 219, ${opacity})`, // purple line
  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#755CDB' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0E7FF', padding: 10 },
  header: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  chart: { marginVertical: 8, borderRadius: 16 },
  note: { textAlign: 'center', color: 'gray', marginTop: -10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default TrendsScreen;
