// src/navigation/TabNavigator.js
/**
 * TabNavigator.js
 * 
 * This file defines the `TabNavigator` component, which manages the bottom tab navigation for 
 * the main app. It handles the navigation between various app screens, including the Home, 
 * Resources, Trends, and Daily Log screens. It includes custom logic for managing symptoms, 
 * and the functionality to add symptoms via a modal, as well as the ability to view symptom details. 
 * The navigator also includes a sidebar with additional options, such as switching between dark and light mode, 
 * accessing settings, calendar, and logging out.
 * 
 * Features:
 * - Custom tab navigation with a dedicated button for adding symptoms.
 * - Sidebar modal with options for theme mode, settings, calendar, and logout.
 * - Symptom tracking functionality with modals for selecting and viewing symptoms.
 * - Animations for sidebar transitions and modal openings.
 * - Responsive design with handling for iOS and Android devices.
 * 
 * This component integrates with the following libraries:
 * - React Navigation for managing bottom tab navigation.
 * - Redux for managing application state (user authentication, theme, and health log).
 * - React Native for UI components, animations, and modals.
 * - Expo's Ionicons for iconography.
 * - Safe Area Context for handling insets and screen safety across devices.
 * 
 * Dependencies:
 * - `@react-navigation/native`
 * - `@react-navigation/bottom-tabs`
 * - `react-redux`
 * - `react-native`
 * - `expo-ionicons`
 * - `react-native-safe-area-context`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View, TouchableOpacity, Modal, Animated, Pressable,
    Platform, StyleSheet, Dimensions, Text, Easing, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import HomeScreen from '../screens/HomeScreen';
import DailySymptomTrackingScreen from '../screens/DailySymptomTrackingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import HealthTrackingScreen from '../screens/HealthTrackingScreen'
import SymptomsModal from '../modals/SymptomsModal';
import SymptomDetailModal from '../modals/SymptomDetailModal';
import { logout } from '../store/actions/loginActions';
import { applyThemeMode } from '../store/actions/themeActions';
import { fetchTodaySymptoms } from '../store/actions/healthlogActions';

const { width: screenWidth } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const icons = {
    Home: 'home',
    Resources: 'document-text',
    Trends: 'trending-up',
    DailyLog: 'medkit',
};

const MAX_SYMPTOMS = 3;

const TabNavigator = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { themeColors, isDarkMode } = useSelector(state => state.theme);
    const { todaySymptoms, moodToday } = useSelector(state => state.healthlog);

    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-240)).current;

    const [modalVisible, setModalVisible] = useState(false);
    const [showSymptomsModal, setShowSymptomsModal] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    const [showSymptomDetailModal, setShowSymptomDetailModal] = useState(false);
    const [addingSymptom, setAddingSymptom] = useState(false);
    const [addedSymptoms, setAddedSymptoms] = useState([]);

    const hasShownModalRef = useRef(false);


    const styles = createStyles(themeColors);

    // Sidebar open/close animations
    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8 }),
        ]).start();
    };
    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -240, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]).start(() => setModalVisible(false));
    };

    // Clear addedSymptoms when symptoms modal closes
    const handleSymptomsModalClose = (symptomObj) => {
        setShowSymptomsModal(false);
        if (symptomObj) {
            console.log('Symptom selected:', symptomObj);
            handleSymptomSelect(symptomObj);
        } else {
            setAddedSymptoms([]);
        }
    };
    // Handle selecting a symptom from modal
    const handleSymptomSelect = async (symptomObj) => {
        if (!symptomObj) return;
        const symptomName = symptomObj.symptom;

        const alreadyAdded = todaySymptoms.some(s => s.symptom === symptomName && !s.recovered_at);
        if (alreadyAdded) return;

        setAddedSymptoms(prev => [...prev, symptomName]);

        setShowSymptomsModal(false);

        setSelectedSymptom(symptomObj);

        // Open detail modal on next animation frame to avoid race condition
        requestAnimationFrame(() => {
            console.log("Opening Symptom Detail Modal for:", symptomObj.symptom);
            setShowSymptomDetailModal(true);
        });
    };

    const handleSymptomDetailClose = () => {
        setShowSymptomDetailModal(false);
        setAddedSymptoms([]);
    };

    // Clear addedSymptoms and refresh symptoms on tab focus
    // track if auto-popup has already shown

    useFocusEffect(
        React.useCallback(() => {
            setAddedSymptoms([]);
            if (user?.id) {
                dispatch(fetchTodaySymptoms(user.id));
            }
            // Don't auto-open Symptoms Modal here.
            // Only allow adding symptoms via bottom tab button.
        }, [user?.id, dispatch])
    );

    const CustomTabBarButton = ({ children, accessibilityState }) => {
        const focused = accessibilityState?.selected;
        const todayUnrecovered = todaySymptoms.filter(s => !s.recovered_at).length;
        const totalSymptomsCount = todayUnrecovered + addedSymptoms.length;

        // console.log('todayUnrecovered:', todayUnrecovered, 'addedSymptoms:', addedSymptoms);

        const disabled = todayUnrecovered + addedSymptoms.length >= MAX_SYMPTOMS || addingSymptom;

        const handlePress = () => {
            if (disabled) return;
            setShowSymptomsModal(true);
        };

        return (
            <TouchableOpacity
                style={{ justifyContent: "center", alignItems: "center", marginBottom: 35, opacity: disabled ? 0.5 : 1 }}
                onPress={handlePress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <View style={{
                    width: 55, height: 55, borderRadius: 28,
                    backgroundColor: themeColors.link, justifyContent: "center", alignItems: "center",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4, marginBottom: 5
                }}>
                    {children}
                </View>
                <Text style={{ marginTop: 4, fontSize: 10, color: focused ? themeColors.link : themeColors.text }}>
                    Add Symptom
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <>
            <Tab.Navigator
                initialRouteName='Home'
                screenOptions={({ route }) => ({
                    headerShown: true,
                    tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
                    tabBarActiveTintColor: themeColors.link,
                    tabBarInactiveTintColor: themeColors.text,
                    headerStyle: { backgroundColor: themeColors.headerBackground, shadowColor: 'transparent' },
                    tabBarStyle: { backgroundColor: themeColors.card, height: Platform.OS === 'ios' ? 80 : 100, paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom, paddingTop: 5 },
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', marginRight: 15 }}>
                            {/* Chat Icon */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Chat')}
                                style={{ marginRight: 15 }}
                            >
                                <Ionicons name="chatbubble-ellipses" size={26} color={themeColors.link} />
                            </TouchableOpacity>

                            {/* Notification Bell */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Ionicons name="notifications-outline" size={26} color={themeColors.link} />
                            </TouchableOpacity>
                        </View>
                    ),


                    headerLeft: () => (
                        <TouchableOpacity onPress={openModal} style={{ marginLeft: 15 }}>
                            <Ionicons name="person-circle" size={36} color={themeColors.text} />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tab.Screen name='Home' component={HomeScreen} />
                <Tab.Screen name='Resources' component={ResourcesScreen} />
                <Tab.Screen name="ConsultNow" component={DailySymptomTrackingScreen} options={{
                    tabBarIcon: () => <Ionicons name="body" size={26} color="#fff" />,
                    tabBarLabel: "",
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                }} />
                <Tab.Screen
                    name='Trends'
                    component={HealthTrackingScreen}
                    initialParams={{ userId: user?.id }}
                />
                <Tab.Screen name='DailyLog' component={DailySymptomTrackingScreen} />
            </Tab.Navigator>

            {/* Sidebar Modal */}
            <Modal transparent visible={modalVisible} animationType="none">
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={closeModal}>
                    <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20 }]} onStartShouldSetResponder={() => true}>
                        <Text style={styles.menuText}> 👋 Hello, {(user?.first_name ?? 'User').toString()} </Text>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { dispatch(applyThemeMode(isDarkMode ? 'light' : 'dark')); closeModal(); }}>
                            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={themeColors.text} />
                            <Text style={styles.menuText}> {isDarkMode ? 'Light Mode' : 'Dark Mode'} </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { closeModal(); navigation.navigate('Settings'); }} style={styles.menuItem}>
                            <Ionicons name='settings-outline' size={18} color={themeColors.text} />
                            <Text style={styles.menuText}> Settings </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { closeModal(); navigation.navigate('Calendar'); }} style={styles.menuItem}>
                            <Ionicons name='calendar-outline' size={18} color={themeColors.text} />
                            <Text style={styles.menuText}> Calendar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { dispatch(logout()); closeModal(); }}>
                            <Ionicons name="log-out-outline" size={20} color={themeColors.error || 'red'} />
                            <Text style={[styles.menuText, { color: themeColors.error || 'red' }]}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Modal>

            <SymptomsModal
                visible={showSymptomsModal}
                onClose={handleSymptomsModalClose}
                currentSymptoms={[
                    ...todaySymptoms.filter(s => !s.recovered_at).map(s => s.symptom),
                    ...addedSymptoms
                ]}

                addedSymptoms={addedSymptoms}
                setAddedSymptoms={setAddedSymptoms}
                showCloseButton={true}
            />


            {/* Symptom Detail Modal */}
            {showSymptomDetailModal && selectedSymptom && (
                <SymptomDetailModal
                    visible={showSymptomDetailModal}
                    symptom={selectedSymptom}
                    onClose={handleSymptomDetailClose}
                />
            )}

        </>
    );
};

export default TabNavigator;

const createStyles = (themeColors) => StyleSheet.create({
    sidebar: { width: screenWidth * 0.75, height: '100%', backgroundColor: themeColors.surface, paddingHorizontal: 20, paddingVertical: 20, elevation: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    menuText: { marginLeft: 12, fontSize: 16, color: themeColors.text, fontFamily: 'Poppins' },
});
