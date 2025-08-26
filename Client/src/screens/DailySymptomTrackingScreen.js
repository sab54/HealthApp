// Client/src/screens/DailySymptomTrackerScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import { get, post } from '../utils/api';
import { API_URL_HEALTHLOG } from '../utils/apiPaths';
import { BASE_URL } from '../utils/config';
import { setTodaySymptoms } from '../store/reducers/healthlogReducers';


const DailySymptomTrackerScreen = () => {
  const theme = useSelector(state => state.theme.themeColors);
  const insets = useSafeAreaInsets();

  const styles = createStyles(theme, insets);
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const { todaySymptoms } = useSelector(state => state.healthlog);
  const symptoms = todaySymptoms || [];
  const [loading, setLoading] = useState(true);
  const [showSymptomsModal, setShowSymptomsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [recoveredSymptomsCache, setRecoveredSymptomsCache] = useState({});
  const MAX_SYMPTOMS = 3;
  const today = new Date().toISOString().split('T')[0];

  const fetchTodaySymptoms = async () => {
    if (!userId) return;
    const fullUrl = `${API_URL_HEALTHLOG}/today?userId=${userId}`;
    console.log('Fetching symptoms from:', BASE_URL + fullUrl);
    setLoading(true);
    try {
      const cached = await AsyncStorage.getItem(`recoveredSymptoms-${userId}-${today}`);
      const recoveredCache = cached ? JSON.parse(cached) : {};
      setRecoveredSymptomsCache(recoveredCache);

      const response = await get(`${API_URL_HEALTHLOG}/today`, { userId });
      const fetchedSymptoms = (response.symptoms || []).map(s => ({
        ...s,
        recovered_at: recoveredCache[s.symptom] || s.recovered_at || null,
        date: s.date || today,
        onsetTime: s.onsetTime || s.onset_time || '',
        severity: s.severity || 'mild',
      }));

      fetchedSymptoms.sort((a, b) => {
        if (!a.recovered_at && b.recovered_at) return -1;
        if (a.recovered_at && !b.recovered_at) return 1;
        if (!a.recovered_at && !b.recovered_at) return new Date(a.date) - new Date(b.date);
        return 0;
      });

      dispatch(setTodaySymptoms(fetchedSymptoms));
    } catch (err) {
      console.error('Error fetching symptoms:', err);
      Alert.alert('Error', 'Failed to fetch symptoms from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySymptoms();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchTodaySymptoms();
    }, [userId])
  );

  const handleSymptomPress = (symptom) => {
    if (symptom.recovered_at) return;
    navigation.navigate('SymptomRecoveryPlan', { symptom });
  };

  const handleSymptomSelectFromModal = async (symptom) => {
    setShowSymptomsModal(false);
    if (!symptom) return;

    const todayUnrecovered = symptoms.filter(s => !s.recovered_at && s.date === today).length;
    if (todayUnrecovered >= MAX_SYMPTOMS) {
      Alert.alert('Limit reached', `You can only add ${MAX_SYMPTOMS} symptoms per day.`);
      return;
    }

    const existing = symptoms.find(
      s => s.symptom === symptom.symptom && !s.recovered_at && s.date === today
    );
    if (existing) {
      Alert.alert("Already Added", `${symptom.symptom} is already recorded and not yet recovered today.`);
      return;
    }

    const newSymptom = { ...symptom, date: today, onsetTime: new Date().toISOString() };
    dispatch(setTodaySymptoms([...symptoms, newSymptom]));



    setSelectedSymptom(newSymptom);
    setShowDetailModal(true);
  };

  const handleMarkRecovered = async (symptom) => {
    if (!userId || !symptom?.symptom) return;
    try {
      const recoveredAt = new Date().toISOString();

      const updatedSymptoms = symptoms.map(s =>
        s.symptom === symptom.symptom ? { ...s, recovered_at: recoveredAt } : s
      );
      dispatch(setTodaySymptoms(updatedSymptoms));

      const updatedCache = { ...recoveredSymptomsCache, [symptom.symptom]: recoveredAt };
      setRecoveredSymptomsCache(updatedCache);
      await AsyncStorage.setItem(`recoveredSymptoms-${userId}-${today}`, JSON.stringify(updatedCache));

      await post(`${API_URL_HEALTHLOG}/recoverSymptom`, {
        user_id: userId,
        symptom: symptom.symptom,
        date: symptom.date,
      });
      await fetchTodaySymptoms();
    } catch (err) {
      console.error('Error marking recovered:', err);
      Alert.alert('Error', 'Failed to mark symptom as recovered.');
    }
  };

  const renderSymptom = ({ item }) => {
    const isDisabled = !!item.recovered_at;
    return (
      <TouchableOpacity
        style={styles.symptomCard}
        onPress={() => handleSymptomPress(item)}
        disabled={isDisabled}
      >
        <Text style={styles.symptomText}>{item.symptom}</Text>
        <Text style={{ color: theme.mutedText }}>Severity: {item.severity}</Text>
        <Text style={{ color: theme.mutedText }}>Onset: {item.onsetTime}</Text>

        {!item.recovered_at ? (
          <TouchableOpacity
            style={styles.recoverButton}
            onPress={() => handleMarkRecovered(item)}
          >
            <Text style={styles.recoverButtonText}>Mark as Recovered</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: theme.success, marginTop: 5 }}>
            Recovered ✅ ({new Date(item.recovered_at).toLocaleTimeString()})
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.buttonPrimaryBackground} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading symptoms...</Text>
      </View>
    );
  }

  const todayUnrecoveredCount = symptoms.filter(s => !s.recovered_at && s.date === today).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Symptoms</Text>

      {symptoms.length === 0 ? (
        <Text style={{ color: theme.mutedText, textAlign: 'center', marginTop: 20 }}>
          No symptoms recorded.
        </Text>
      ) : (
        <FlatList
          data={symptoms}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `${item.symptom}-${item.date}-${item.onsetTime}-${index}`
          }
          renderItem={renderSymptom}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {showSymptomsModal && (
        <SymptomsModal
          visible={showSymptomsModal}
          onClose={handleSymptomSelectFromModal}
          currentCount={todayUnrecoveredCount}
          currentSymptoms={symptoms.map(s => s.symptom)}
          userId={userId}
        />
      )}

      {showDetailModal && selectedSymptom && (

        <SymptomDetailModal
          visible={showDetailModal}
          symptom={selectedSymptom}
          onClose={async (updatedSymptom) => {
            setShowDetailModal(false);
            if (!updatedSymptom) return;

            // update the list with the edited symptom
            const updated = symptoms.map(s =>
              s.symptom === updatedSymptom.symptom ? updatedSymptom : s
            );
            dispatch(setTodaySymptoms(updated));

            // 🔄 Then force backend refresh so the list is correct
            await fetchTodaySymptoms();
          }}

        />


      )}

      <TouchableOpacity
        style={[styles.addButton, { marginTop: 10 }]}
        onPress={() => navigation.navigate('StepsTracker')}
      >
        <Text style={styles.addButtonText}>View Steps</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: theme.title,
      fontFamily: 'Poppins',
    },
    symptomCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
      marginVertical: 8,
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    symptomText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 5,
      color: theme.text,
      fontFamily: 'Poppins',
    },
    addButton: {
      backgroundColor: theme.buttonPrimaryBackground,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
    },
    addButtonText: {
      color: theme.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
    recoverButton: {
      backgroundColor: theme.success,
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center',
    },
    recoverButtonText: {
      color: theme.buttonPrimaryText,
      fontWeight: '600',
      fontFamily: 'Poppins',
    },
  });

export default DailySymptomTrackerScreen;
