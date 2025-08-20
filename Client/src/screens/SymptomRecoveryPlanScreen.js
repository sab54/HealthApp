// Client/src/screens/SymptomRecoveryPlanScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { get, post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SymptomRecoveryPlanScreen = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;
  const route = useRoute();
  const navigation = useNavigation();
  const { symptom } = route.params;

  const [dailyPlan, setDailyPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recovery plan for the symptom
const fetchRecoveryPlan = async () => {
  if (!userId) return;
  setLoading(true);
  try {
    // Pass the symptom name to the backend to fetch only relevant tasks
    const response = await get(
      `${API_URL_HEALTHLOG}/plan?userId=${userId}&symptom=${encodeURIComponent(symptom.symptom)}`
    );
    setDailyPlan(response.plan || []);
  } catch (err) {
    console.error('Error fetching recovery plan:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchRecoveryPlan();
  }, [userId, symptom]);

  useFocusEffect(
    useCallback(() => {
      fetchRecoveryPlan();
    }, [userId, symptom])
  );

  const handleToggleTaskDone = async (item) => {
    try {
      await post(`${API_URL_HEALTHLOG}/updatePlanTask`, {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        category: item.category,
        task: item.task,
        done: item.done ? 0 : 1,
      });
      fetchRecoveryPlan();
    } catch (err) {
      console.error("Error updating plan task:", err);
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.planCard, { flexDirection: 'row', alignItems: 'center' }]}
      onPress={() => handleToggleTaskDone(item)}
    >
      <Ionicons
        name={item.done ? "checkbox-outline" : "square-outline"}
        size={24}
        color={item.done ? "#28A745" : "#000"}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{item.category}</Text>
        <Text>{item.task}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#755CDB" />
        <Text>Loading recovery plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recovery Plan for:</Text>
      <Text style={styles.symptomTitle}>{symptom.symptom}</Text>

      {dailyPlan.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No recovery tasks for this symptom today.
        </Text>
      ) : (
        <FlatList
          data={dailyPlan}
          keyExtractor={(item, index) => `${item.category}-${index}`}
          renderItem={renderPlanItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0E7FF', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  symptomTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  planCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
  },
});

export default SymptomRecoveryPlanScreen;
