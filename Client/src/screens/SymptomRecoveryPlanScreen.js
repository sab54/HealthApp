// Client/src/screens/SymptomRecoveryPlanScreen.js
/**
 * SymptomRecoveryPlanScreen.js
 *
 * This screen displays a user's recovery plan for a specific symptom. It shows tasks for the user to complete based on their recovery journey, categorized by types like precautions, medicine, food, exercises, and what to avoid.
 * The screen also includes a progress bar that tracks the completion of tasks and provides details on the symptom severity and when it was recorded.
 *
 * Key Features:
 * - Displays symptom-specific tasks grouped by categories.
 * - Shows the user's progress in completing recovery tasks.
 * - Allows the user to toggle task completion (done or not done).
 * - Provides severity details based on the symptom's severity level.
 * - Allows for task updates via Redux actions.
 * - Fetches recovery tasks and symptom details from an API and updates the state accordingly.
 *
 * Dependencies:
 * - `react-native` for UI components and navigation.
 * - `react-redux` for state management.
 * - `react-navigation` for navigation between screens.
 * - `react-native-progress` for displaying a progress circle.
 * - `react-native-vector-icons` for icons (Feather, Ionicons).
 * - `utils/api` for API requests.
 * - `store/actions/healthlogActions` for updating the user's recovery plan.
 * - `data/symptomHealth` for getting severity details.
 *
 * Author: Sunidhi Abhange
 */

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
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updatePlanTask, fetchPlan } from '../store/actions/healthlogActions';
import { getAllSeverities } from '../data/symptomHealth';
import * as SensorTracker from '../utils/sensorTracker';
import { updateCurrentSteps, setPaused } from '../store/reducers/stepsReducer';

const SymptomRecoveryPlanScreen = () => {
   const { user } = useSelector(state => state.auth);
   const theme = useSelector(state => state.theme.themeColors);
   const styles = createStyles(theme);
   const userId = user?.id;

   const route = useRoute();
   const navigation = useNavigation();
   const symptomParam = route.params?.symptom;

   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [severityDetails, setSeverityDetails] = useState(null);

   const dispatch = useDispatch();
   const currentSteps = useSelector(state => state.steps.currentSteps);
   const currentDistance = useSelector(state => state.steps.currentDistance);
   const isPaused = useSelector(state => state.steps.isPaused);


   useEffect(() => {
      if (!tasks || tasks.length === 0) return;

      setTasks(prev =>
         prev.map(t => {
            const goalInfo = extractGoalFromTask(t.task);
            if (goalInfo?.type === "steps") {
               const newProgress = currentSteps;

               // Auto-mark done if goal is reached
               if (newProgress >= goalInfo.goal && !t.done) {
                  dispatch(updatePlanTask({
                     user_id: userId,
                     date: new Date().toISOString().split("T")[0],
                     category: t.category,
                     task: t.task,
                     done: 1
                  }));
                  return { ...t, progress: newProgress, done: 1 };
               }

               return { ...t, progress: newProgress };
            }
            return t;
         })
      );
   }, [currentSteps]); // this will run whenever currentSteps change

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

   useEffect(() => {
      if (route.params?.updatedTask) {
         const { task, progress } = route.params.updatedTask;
         const goalInfo = extractGoalFromTask(task.task);

         setTasks((prev) =>
            prev.map((t) => {
               if (t.task === task.task) {
                  let isDone = t.done;
                  if (goalInfo && progress >= goalInfo.goal && !t.done) {
                     dispatch(updatePlanTask({
                        user_id: userId,
                        date: new Date().toISOString().split("T")[0],
                        category: t.category,
                        task: t.task,
                        done: 1
                     }));
                  }

                  return { ...t, progress, done: isDone };
               }
               return t;
            })
         );
      }
   }, [route.params?.updatedTask]);


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

   const handlePlayPause = (goal) => {
      if (!isPaused) {
         SensorTracker.stopStepTracking?.();
      } else {
         SensorTracker.startStepTracking(
            stepData => dispatch(updateCurrentSteps({
               steps: stepData.steps,
               distance: stepData.distance,
            })),
            currentSteps,
            currentDistance
         );
      }
      dispatch(setPaused(!isPaused));
   };


   function extractGoalFromTask(text) {
      if (!text) return null;

      const stepsMatch = text.match(/(?:~|≈|about|approx)?\s*(\d+)(?:[-–](\d+))?\s*steps?/i);
      if (stepsMatch) {
         const goal = stepsMatch[2] ? parseInt(stepsMatch[2], 10) : parseInt(stepsMatch[1], 10);
         return { type: "steps", goal };
      }

      // minutes: "~20 min", "approx 15 minutes", "15–20 mins", "15 m"
      const minsMatch = text.match(/(?:~|≈|about|approx)?\s*(\d{1,2})(?:[-–](\d{1,2}))?\s*(?:m|min|mins|minute|minutes)/i);
      if (minsMatch) {
         const goal = minsMatch[2] ? parseInt(minsMatch[2], 10) : parseInt(minsMatch[1], 10);
         return { type: "minutes", goal };
      }

      return null;
   }


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
               const goalInfo = extractGoalFromTask(t.task);

               return (
                  <View key={t.task} style={[styles.taskCard, { backgroundColor: theme.background }]}>
                     <TouchableOpacity
                        style={[
                           styles.checkbox,
                           checked && styles.checkboxChecked, // Apply checked style dynamically
                        ]}
                        onPress={() => toggleTask(t)}
                     >
                        {checked ? (
                           <FeatherIcon
                              name="check"
                              size={16}
                              color={theme.checkboxTick}  // Ensure color is correct for checked state
                           />
                        ) : (
                           <View />
                        )}
                     </TouchableOpacity>

                     {/* task text */}
                     <Text style={[styles.taskText, { color: theme.text }]}>
                        {String(t.task || "N/A")}
                     </Text>

                     {/* tracker (only if walk/run/steps/minutes) */}
                     {goalInfo && (
                        <View style={{ marginLeft: 10, flexDirection: "row", alignItems: "center" }}>
                           <Text style={{ color: theme.text }}>
                              {t.progress || 0} / {goalInfo.goal} {goalInfo.type}
                           </Text>
                           <TouchableOpacity onPress={() => handlePlayPause(goalInfo)} style={{ marginLeft: 8 }}>
                              <Ionicons name={isPaused ? "play" : "pause"} size={24} color={theme.primary} />
                           </TouchableOpacity>
                        </View>
                     )}
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
         >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
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

const createStyles = (theme) => StyleSheet.create({
   container: { flex: 1, padding: 20 },
   backButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: theme.surface, alignSelf: 'flex-start' },
   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
   title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
   symptomTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, opacity: 0.9 },
   progressContainer: { marginBottom: 20, padding: 18, borderRadius: 12, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
   progressText: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
   progressBarContainer: { height: 8, width: '100%', backgroundColor: '#E0E0E0', borderRadius: 4 },
   progressBar: { height: '100%', borderRadius: 4 },
   card: { borderRadius: 16, padding: 18, marginBottom: 16, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
   cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
   checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: theme.checkboxBorder,
      backgroundColor: theme.checkboxBackground, // Background color for unchecked state
   },
   checkboxChecked: {
      backgroundColor: theme.checkboxChecked, // Background color when checked (purple for dark mode)
   },
   taskCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
   playButton: {
      marginLeft: 10,
      backgroundColor: theme.buttonPrimaryBackground,  // Button background color
      padding: 10,
      borderRadius: 30,
   },
   playButtonIcon: {
      color: theme.buttonPrimaryText,  // Play button icon color
   },
   taskText: { flex: 1, fontSize: 16 },

   // Correct color for the checkmark icon
   checkboxIconChecked: {
      color: theme.checkboxTick, // Ensures it's always white in light mode and purple in dark mode
   },
});

export default SymptomRecoveryPlanScreen;
