import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchRecoveryTasks = async () => {
  if (!userId) return;
  setLoading(true);
  try {
    const response = await get(
      `${API_URL_HEALTHLOG}/plan?userId=${userId}&symptom=${encodeURIComponent(symptom.symptom)}`
    );

    console.log("Full API response:", response);

    const tasksFromResponse = response.plan; // <- use `plan`
    console.log("Tasks extracted:", tasksFromResponse);

    setTasks(tasksFromResponse || []);

  } catch (err) {
    console.error('Error fetching recovery tasks:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchRecoveryTasks();
  }, [userId, symptom]);

  useFocusEffect(
    useCallback(() => {
      fetchRecoveryTasks();
    }, [userId, symptom])
  );

  const groupTasksByCategory = () => {
    const categories = {
      precautions: [],
      recommendations: [],
      eat: [],
      exercise: [],
      avoid: [],
    };

    tasks.forEach(task => {
      const cat = task.category.toLowerCase();
      switch (cat) {
        case 'care':
          categories.precautions.push(task.task);
          break;
        case 'medicine':
          categories.recommendations.push(task.task);
          break;
        case 'diet':
          categories.eat.push(task.task);
          break;
        case 'exercise':
          categories.exercise.push(task.task);
          break;
        case 'avoid':
          categories.avoid.push(task.task);
          break;
        default:
          break;
      }
    });

    return categories;
  };




  const categories = groupTasksByCategory();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#755CDB" />
        <Text>Loading symptom recovery plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Recovery Plan for:</Text>
      <Text style={styles.symptomTitle}>{symptom.symptom}</Text>

      {/* Severity & Created At */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Severity & Recorded At</Text>
        <Text>Severity: {symptom.severity}</Text>
        <Text>Recorded at: {new Date(symptom.date).toLocaleDateString()}</Text>
      </View>

      {/* Precautions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Precautions</Text>
        {categories.precautions.length > 0
          ? categories.precautions.map((t, i) => <Text key={i}>• {t}</Text>)
          : <Text>N/A</Text>
        }
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recommendations</Text>
        {categories.recommendations.length > 0
          ? categories.recommendations.map((t, i) => <Text key={i}>• {t}</Text>)
          : <Text>N/A</Text>
        }
      </View>

      {/* What to Eat */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What to Eat</Text>
        {categories.eat.length > 0
          ? categories.eat.map((t, i) => <Text key={i}>• {t}</Text>)
          : <Text>N/A</Text>
        }
      </View>

      {/* Exercise */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exercise</Text>
        {categories.exercise.length > 0
          ? categories.exercise.map((t, i) => <Text key={i}>• {t}</Text>)
          : <Text>N/A</Text>
        }
      </View>

      {/* What to Avoid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What to Avoid</Text>
        {categories.avoid.length > 0
          ? categories.avoid.map((t, i) => <Text key={i}>• {t}</Text>)
          : <Text>N/A</Text>
        }
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0E7FF', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  symptomTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
});

export default SymptomRecoveryPlanScreen;
