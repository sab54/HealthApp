// Client/src/screens/DailySymptomTrackerScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import { get, post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DailySymptomTrackerScreen = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;
  const navigation = useNavigation();

  const [symptoms, setSymptoms] = useState([]);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSymptomsModal, setShowSymptomsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);

  // Fetch today's symptoms
  const fetchTodaySymptoms = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await get(`${API_URL_HEALTHLOG}/today?userId=${userId}`);
      setSymptoms(response.symptoms || []);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's daily plan
  const fetchDailyPlan = async () => {
    if (!userId) return;
    try {
      const response = await get(`${API_URL_HEALTHLOG}/plan?userId=${userId}`);
      setDailyPlan(response.plan || []);
    } catch (err) {
      console.error('Error fetching daily plan:', err);
    }
  };

  useEffect(() => {
    fetchTodaySymptoms();
    fetchDailyPlan();
  }, []);

  const handleAddSymptom = () => setShowSymptomsModal(true);

  const handleSymptomSelect = (symptomObj) => {
    setSelectedSymptom(symptomObj);
    setShowSymptomsModal(false);
    setShowDetailModal(true);
  };

  // Called after the detail modal closes, refresh lists
  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedSymptom(null);
    fetchTodaySymptoms();
    fetchDailyPlan();
  };

  const handleMarkRecovered = async (item) => {
    const recoveryDate = new Date().toISOString().split('T')[0];
    const onsetDate = item.date;
    const durationDays = Math.max(
      1,
      Math.ceil((new Date(recoveryDate) - new Date(onsetDate)) / (1000 * 60 * 60 * 24))
    );

    try {
      await post(`${API_URL_HEALTHLOG}/submit`, {
        user_id: userId,
        mood: 'Not feeling good!',
        symptoms: [{ ...item, duration: `${durationDays} day(s)` }],
      });
      fetchTodaySymptoms();
    } catch (err) {
      console.error('Error updating duration:', err);
    }
  };

  const handleTogglePlanDone = async (item) => {
    try {
      await post(`${API_URL_HEALTHLOG}/updatePlanTask`, {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        category: item.category,
        task: item.task,
        done: item.done ? 0 : 1,
      });
      fetchDailyPlan();
    } catch (err) {
      console.error("Error updating plan task:", err);
    }
  };

  const renderSymptom = ({ item }) => (
    <View style={styles.symptomCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.symptomText}>{item.symptom}</Text>
        <Text>Severity: {item.severity}</Text>
        <Text>Onset: {item.onset_time}</Text>
        <Text>Notes: {item.notes || 'None'}</Text>
        <Text>Duration: {item.duration || 'Ongoing'}</Text>
      </View>
      {!item.duration && (
        <TouchableOpacity onPress={() => handleMarkRecovered(item)}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#28A745" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.planCard, { flexDirection: 'row', alignItems: 'center' }]}
      onPress={() => handleTogglePlanDone(item)}
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
        <Text>Loading symptoms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Symptoms</Text>
      <FlatList
        data={symptoms}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderSymptom}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddSymptom}>
        <Text style={styles.addButtonText}>Add Symptom</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#28A745', marginTop: 10 }]}
        onPress={() => navigation.navigate('StepsTracker')}
      >
        <Text style={styles.addButtonText}>View Steps</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.trendsButton}
        onPress={() => navigation.navigate('Trends', { userId: user.id })}
      >
        <Text style={styles.trendsButtonText}>View Trends</Text>
      </TouchableOpacity>


      {showSymptomsModal && (
        <SymptomsModal visible={showSymptomsModal} onClose={handleSymptomSelect} />
      )}

      {showDetailModal && selectedSymptom && (
        <SymptomDetailModal
          visible={showDetailModal}
          symptom={selectedSymptom}
          onClose={handleDetailModalClose}
        />
      )}

      <Text style={[styles.title, { marginTop: 30 }]}>Today's Recovery Plan</Text>
      {dailyPlan.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>No plan yet.</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  symptomCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomText: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  addButton: {
    backgroundColor: '#755CDB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  planCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
  },
  trendsButton: {
    backgroundColor: '#755CDB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  trendsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DailySymptomTrackerScreen;
