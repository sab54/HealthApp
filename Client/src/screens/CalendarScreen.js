// Client/src/screens/CalendarScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { get, post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';

const CalendarScreen = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchTasks = async (date) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await get(`${API_URL_HEALTHLOG}/plan?userId=${userId}`);
      if (res.success) {
        // Filter tasks for selected date
        const dayTasks = res.plan.filter(task => task.date === date);
        setTasks(dayTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      Alert.alert('Error', 'Failed to fetch daily plan');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const toggleTaskDone = async (task) => {
    try {
      await post(`${API_URL_HEALTHLOG}/updatePlanTask`, {
        user_id: userId,
        date: selectedDate,
        category: task.category,
        task: task.task,
        done: task.done ? 0 : 1
      });
      // Refresh tasks
      fetchTasks(selectedDate);
    } catch (err) {
      console.error('Error updating task:', err);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskItem, item.done && styles.taskDone]}
      onPress={() => toggleTaskDone(item)}
    >
      <Text style={[styles.taskText, item.done && styles.taskTextDone]}>
        {item.category.toUpperCase()}: {item.task}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Plan - {selectedDate}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#755CDB" />
      ) : tasks.length === 0 ? (
        <Text style={styles.noTasks}>No tasks for this day</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => `${item.category}-${item.task}-${index}`}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <View style={styles.dateNav}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(format(prev, 'yyyy-MM-dd'));
          }}
        >
          <Text style={styles.dateButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(format(next, 'yyyy-MM-dd'));
          }}
        >
          <Text style={styles.dateButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E0E7FF' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  taskItem: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D7E2',
    marginBottom: 10,
  },
  taskDone: {
    backgroundColor: '#80A5F4',
    borderColor: '#007AFF',
  },
  taskText: { fontSize: 16, color: '#333' },
  taskTextDone: { color: '#fff', textDecorationLine: 'line-through' },
  noTasks: { textAlign: 'center', marginTop: 50, color: '#555', fontSize: 16 },
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  dateButton: { padding: 12, backgroundColor: '#755CDB', borderRadius: 10 },
  dateButtonText: { color: '#fff', fontWeight: '600' },
});

export default CalendarScreen;
