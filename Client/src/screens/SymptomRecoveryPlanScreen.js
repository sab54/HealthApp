// Client/src/screens/SymptomRecoveryPlanScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
   View,
   Text,
   ScrollView,
   StyleSheet,
   ActivityIndicator,
   TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { get } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import Icon from 'react-native-vector-icons/Feather'; // ✅ Feather icons (checkmark)

const SymptomRecoveryPlanScreen = () => {
   const { user } = useSelector(state => state.auth);
   const theme = useSelector(state => state.theme.themeColors);
   const userId = user?.id;
   const route = useRoute();
   const navigation = useNavigation();
   const { symptom } = route.params;

   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [completedTasks, setCompletedTasks] = useState({});

   const toggleTask = (category, index) => {
      const key = `${category}-${index}`;
      setCompletedTasks(prev => ({
         ...prev,
         [key]: !prev[key],
      }));
   };

   const fetchRecoveryTasks = async () => {
      if (!userId) return;
      setLoading(true);
      try {
         const response = await get(
            `${API_URL_HEALTHLOG}/plan?userId=${userId}&symptom=${encodeURIComponent(symptom.symptom)}`
         );
         setTasks(response.plan || []);
      } catch (err) {
         console.error('Error fetching recovery tasks:', err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchRecoveryTasks(); }, [userId, symptom]);
   useFocusEffect(useCallback(() => { fetchRecoveryTasks(); }, [userId, symptom]));

   const groupTasksByCategory = () => {
      const categories = { precautions: [], medicine: [], eat: [], exercise: [], avoid: [] };
      tasks.forEach(task => {
         switch (task.category.toLowerCase()) {
            case 'care': categories.precautions.push(task.task); break;
            case 'medicine': categories.medicine.push(task.task); break;
            case 'diet': categories.eat.push(task.task); break;
            case 'exercise': categories.exercise.push(task.task); break;
            case 'avoid': categories.avoid.push(task.task); break;
            default: break;
         }
      });
      return categories;
   };

   const categories = groupTasksByCategory();

   if (loading) {
      return (
         <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.text }}>Loading symptom recovery plan...</Text>
         </View>
      );
   }

   const renderTasks = (title, data, category) => (
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
         <Text style={[styles.cardTitle, { color: theme.title }]}>{title}</Text>
         {data.length > 0 ? (
            data.map((t, i) => {
               const key = `${category}-${i}`;
               const checked = completedTasks[key];
               return (
                  <View key={i} style={[styles.taskCard, { backgroundColor: theme.background }]}>
                     <TouchableOpacity
                        style={[
                           styles.checkbox,
                           { borderColor: theme.primary },
                           checked && { backgroundColor: theme.primary },
                        ]}
                        onPress={() => toggleTask(category, i)}
                     >
                        {checked && <Icon name="check" size={16} color={theme.buttonPrimaryText} />}

                     </TouchableOpacity>
                     <Text
                        style={[
                           styles.taskText,
                           { color: theme.text },
                           checked && { textDecorationLine: 'line-through', opacity: 0.6 },
                        ]}
                     >
                        {t}
                     </Text>
                  </View>
               );
            })
         ) : (
            <Text style={{ color: theme.mutedText }}>N/A</Text>
         )}
      </View>
   );

   return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 20 }}>
         {/* Back Button */}
         <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>← Back</Text>
         </TouchableOpacity>

         <Text style={[styles.title, { color: theme.title }]}>Recovery Plan for:</Text>
         <Text style={[styles.symptomTitle, { color: theme.text }]}>{symptom.symptom}</Text>

         {/* Severity & Created At */}
         <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.title }]}>Severity & Recorded At</Text>
            <Text style={{ color: theme.text }}>Severity: {symptom.severity}</Text>
            <Text style={{ color: theme.text }}>Recorded at: {new Date(symptom.date).toLocaleDateString()}</Text>
         </View>

         {/* Task Sections */}
         {renderTasks('Precautions', categories.precautions, 'precautions')}
         {renderTasks('Medicine', categories.medicine, 'medicine')}
         {renderTasks('What to Eat', categories.eat, 'eat')}
         {renderTasks('Exercise', categories.exercise, 'exercise')}
         {renderTasks('What to Avoid', categories.avoid, 'avoid')}
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
   },
   center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
   },
   title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 0.5
   },
   symptomTitle: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
      opacity: 0.9
   },
   card: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
   },
   cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: 0.3
   },
   backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      marginBottom: 18,
      elevation: 3,
   },
   taskCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      elevation: 1,
   },
   checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
   },
   taskText: {
      flex: 1,
      fontSize: 16,
   },
});

export default SymptomRecoveryPlanScreen;
