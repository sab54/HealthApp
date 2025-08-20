import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as SensorTracker from '../utils/sensorTracker'; // named imports

const StepsTrackerScreen = () => {
  const [data, setData] = useState({ steps: 0, distance: 0, activity: 'Idle' });

  useEffect(() => {
    const unsubscribe = SensorTracker.startStepTracking((stepData) => {
      setData(stepData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleReset = () => {
    SensorTracker.resetSteps();
    setData({ steps: 0, distance: 0, activity: 'Idle' });
  };

  const calories = Math.round(data.steps * 0.04); // rough estimate

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Activity</Text>
      <Text style={styles.activity}>{data.activity}</Text>
      <Text style={styles.steps}>{data.steps} steps</Text>
      <Text style={styles.distance}>{data.distance} meters</Text>
      <Text style={styles.calories}>{calories} kcal</Text>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E7FF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  activity: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
  steps: { fontSize: 36, fontWeight: 'bold', color: '#28A745', marginBottom: 10 },
  distance: { fontSize: 18, fontWeight: '500', marginBottom: 5 },
  calories: { fontSize: 18, fontWeight: '500', marginBottom: 20 },
  resetButton: { backgroundColor: '#755CDB', padding: 12, borderRadius: 10 },
  resetText: { color: '#fff', fontWeight: '600' },
});

export default StepsTrackerScreen;
