// src/navigation/TabNavigator.js
import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    Animated,
    Pressable,
    Platform,
    StyleSheet,
    Dimensions,
    Text,
    Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import { logout, updateUserLocation } from '../store/actions/loginActions';
import { applyThemeMode } from '../store/actions/themeActions';

const { width: screenWidth } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const icons = {
    Home: 'home',
    Resources: 'document-text',
    Chat: 'chatbubble-ellipses',
};

const TabNavigator = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { themeColors, isDarkMode } = useSelector((state) => state.theme);
    const insets = useSafeAreaInsets();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-240)).current;
    const [modalVisible, setModalVisible] = useState(false);

    const styles = createStyles(themeColors);

    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -240,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start(() => setModalVisible(false));
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name={icons[route.name]} size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: themeColors.headerBackground,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={openModal} style={{ marginLeft: 15 }}>
                            <Ionicons name="person-circle" size={36} color={themeColors.text} />
                        </TouchableOpacity>
                    ),
                    tabBarStyle: {
                        backgroundColor: themeColors.card,
                        height: 70,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    },
                    tabBarActiveTintColor: themeColors.link,
                    tabBarInactiveTintColor: themeColors.text,
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name='Resources' component={ResourcesScreen} />
                <Tab.Screen name='Chat' component={ChatScreen} />
            </Tab.Navigator>

            <Modal transparent visible={modalVisible} animationType="none">
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                    onPress={closeModal}
                >
                    <Animated.View
                        style={[
                            styles.sidebar,
                            {
                                transform: [{ translateX: slideAnim }],
                                paddingTop: insets.top + 20,
                            },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        <Text style={styles.menuText}>
                            👋 Hello, {(user?.first_name ?? 'User').toString()}
                        </Text>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                dispatch(applyThemeMode(isDarkMode ? 'light' : 'dark'));
                                closeModal();
                            }}
                        >
                            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={themeColors.text} />
                            <Text style={styles.menuText}>
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                closeModal();
                                navigation.navigate('Settings');
                            }}
                            style={styles.menuItem}
                        >
                            <Ionicons
                                name='settings-outline'
                                size={18}
                                color={themeColors.text}
                            />
                            <Text style={styles.menuText}>
                                Settings
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                dispatch(logout());
                                closeModal();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color={themeColors.error || 'red'} />
                            <Text style={[styles.menuText, { color: themeColors.error || 'red' }]}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
};

export default TabNavigator;

const createStyles = (themeColors) =>
    StyleSheet.create({
        sidebar: {
            width: screenWidth * 0.75,
            height: '100%',
            backgroundColor: themeColors.surface,
            paddingHorizontal: 20,
            paddingVertical: 20,
            elevation: 10,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
        },
        menuText: {
            marginLeft: 12,
            fontSize: 16,
            color: themeColors.text,
            fontFamily: 'Poppins',
        },
    });
