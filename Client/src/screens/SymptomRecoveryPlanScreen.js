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
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import Icon from 'react-native-vector-icons/Feather';
import { updatePlanTask } from '../store/actions/healthlogActions';
import { getAllSeverities } from '../data/symptomHealth';

const SymptomRecoveryPlanScreen = () => {
   const { user } = useSelector(state => state.auth);
   const theme = useSelector(state => state.theme.themeColors);
   const userId = user?.id;

   const route = useRoute();
   const navigation = useNavigation();
   const symptomParam = route.params?.symptom;

   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [severityDetails, setSeverityDetails] = useState(null);

   const dispatch = useDispatch();

   const toggleTask = (taskItem) => {
      if (!userId || !taskItem?.task || !taskItem?.category) return;

      const newStatus = taskItem.done ? 0 : 1;

      setTasks(prevTasks =>
         (prevTasks || []).map(t =>
            t.task === taskItem.task && t.category === taskItem.category
               ? { ...t, done: newStatus }
               : t
         )
      );

      dispatch(updatePlanTask({
         user_id: userId,
         date: new Date().toISOString().split('T')[0],
         category: taskItem.category,
         task: taskItem.task,
         done: newStatus
      }));
   };

   const fetchRecoveryTasks = async () => {
      if (!userId || !symptomParam) return;
      setLoading(true);
      try {
         const response = await get(
            `${API_URL_HEALTHLOG}/plan?userId=${userId}` +
            `&symptom=${encodeURIComponent(symptomParam?.symptom || '')}`
         );


         console.log('Client Request Params:', {
            userId,
            symptom: symptomParam?.symptom,
         });

         console.log('API Response:', response);

         setTasks(Array.isArray(response?.plan) ? response.plan : []);
      } catch (err) {
         console.error('Error fetching recovery tasks:', err);
         setTasks([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchRecoveryTasks();

      if (symptomParam?.symptom && symptomParam?.severity_level) {
         const allSeverities = getAllSeverities(symptomParam.symptom);
         const selectedSeverityDetails = allSeverities[symptomParam.severity_level] || null;
         setSeverityDetails(selectedSeverityDetails);

         // Dispatch Redux action to fetch plan
         dispatch(fetchPlan({
            user_id: userId,
            symptom: symptomParam.symptom,
            severity: symptomParam.severity_level
         }));

         console.log('Selected severity details:', selectedSeverityDetails);
      }
   }, [userId, symptomParam]);


   useFocusEffect(useCallback(() => { fetchRecoveryTasks(); }, [userId, symptomParam]));

   const groupTasksByCategory = () => {
      const categories = { precautions: [], medicine: [], eat: [], exercises: [], avoid: [] };

      (tasks || []).forEach(task => {
         const category = (task?.category || '').toLowerCase();
         const taskName = task?.task || 'Unnamed Task';

         switch (category) {
            case 'care':
            case 'precaution':
            case 'precautions':
               categories.precautions.push({ ...task, task: taskName });
               break;
            case 'medicine':
            case 'medicines':
               categories.medicine.push({ ...task, task: taskName });
               break;
            case 'diet':
            case 'food':
               categories.eat.push({ ...task, task: taskName });
               break;
            case 'exercises':
            case 'exercise':
               categories.exercises.push({ ...task, task: taskName });
               break;
            case 'avoid':
               categories.avoid.push({ ...task, task: taskName });
               break;
            default:
               categories.precautions.push({ ...task, task: taskName });
               break;
         }
      });

      return categories;
   };

   const categories = groupTasksByCategory();

   const tasksArray = tasks || [];
   const completedTasks = tasksArray.filter(task => task.done).length;
   const totalTasks = tasksArray.length;
   const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

   if (loading) {
      return (
         <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.text }}>Loading symptom recovery plan...</Text>
         </View>
      );
   }

   const renderTasks = (title, data) => (
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
         <Text style={[styles.cardTitle, { color: theme.title }]}>{String(title)}</Text>
         {(data || []).length > 0 ? (
            (data || []).map((t) => {
               const checked = t.done;
               return (
                  <View key={t.task} style={[styles.taskCard, { backgroundColor: theme.background }]}>
                     <TouchableOpacity
                        style={[
                           styles.checkbox,
                           { borderColor: theme.primary },
                           checked && { backgroundColor: theme.primary },
                        ]}
                        onPress={() => toggleTask(t)}
                     >
                        {checked ? (
                           <Icon name="check" size={16} color={theme.checkboxTick} />
                        ) : (
                           <View />
                        )}
                     </TouchableOpacity>

                     <Text style={[styles.taskText, { color: theme.text }]}>
                        {String(t.task || 'N/A')}
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
      <ScrollView
         style={[styles.container, { backgroundColor: theme.background }]}
         contentContainerStyle={{ paddingBottom: 20 }}
      >
         <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.card }]}
         >
            <Text style={{ color: theme.primary, fontWeight: '600' }}>← Back</Text>
         </TouchableOpacity>

         <Text style={[styles.title, { color: theme.title }]}>Recovery Plan for:</Text>
         <Text style={[styles.symptomTitle, { color: theme.text }]}>{String(symptomParam?.symptom || 'N/A')}</Text>

         <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.progressText, { color: theme.text }]}>
               {completedTasks} / {totalTasks} Tasks Completed
            </Text>
            <View style={styles.progressBarContainer}>
               <View
                  style={[
                     styles.progressBar,
                     { width: `${progressPercentage}%`, backgroundColor: '#8c5fc4ff' },
                  ]}
               />
            </View>
         </View>

         <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.title }]}>Severity & Recorded At</Text>
            <Text style={{ color: theme.text }}>
               Severity: {String(symptomParam?.severity_level || symptomParam?.severity || 'N/A')}
            </Text>
            <Text style={{ color: theme.text }}>
               Recorded at: {String(symptomParam?.date ? new Date(symptomParam.date).toLocaleDateString() : 'N/A')}
            </Text>

            {severityDetails && (
               <View style={{ marginTop: 10 }}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>Severity Details:</Text>
                  <Text style={{ color: theme.text }}>
                     {symptomParam?.severity_level?.toUpperCase()}: {severityDetails.precautions?.join(', ') || 'N/A'}
                  </Text>
               </View>
            )}
         </View>

         {renderTasks('Precautions', categories.precautions)}
         {renderTasks('Medicine', categories.medicine)}
         {renderTasks('What to Eat', categories.eat)}
         {renderTasks('Exercises', categories.exercises)}
         {renderTasks('What to Avoid', categories.avoid)}
      </ScrollView>
   );
};

const styles = StyleSheet.create({
   container: { flex: 1, padding: 20 },
   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
   symptomTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, opacity: 0.9 },
   progressContainer: { marginBottom: 20, padding: 18, borderRadius: 12, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
   progressText: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
   progressBarContainer: { height: 8, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 4 },
   progressBar: { height: '100%', borderRadius: 4 },
   card: { borderRadius: 16, padding: 18, marginBottom: 16, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
   cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
   backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, marginBottom: 18, elevation: 3 },
   taskCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
   checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
   taskText: { flex: 1, fontSize: 16 },
});

export default SymptomRecoveryPlanScreen;
