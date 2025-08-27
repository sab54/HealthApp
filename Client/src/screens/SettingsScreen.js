// Client/src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Button, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons, Feather } from '@expo/vector-icons';
import DoctorLicenseUpload from '../components/DoctorLicenseUpload';


import { updateUserProfile } from '../store/actions/settingActions';
import EditUserInfoModal from '../modals/EditUserInfo';

const SettingsScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const theme = useSelector(state => state.theme.themeColors);
    const insets = useSafeAreaInsets();
    const user = useSelector(state => state.auth.user);
    const settings = useSelector(state => state.settings);

    const [fontsLoaded] = useFonts({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
    });

    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [userRole, setUserRole] = useState('');
    const [status, setStatus] = useState('');
    const [isApproved, setIsApproved] = useState(true);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    // Sync user info and settings
    useEffect(() => {
        const updatedUser = settings.user || user;
        setFirstName(updatedUser?.first_name || '');
        setLastName(updatedUser?.last_name || '');
    }, [settings.user, user]);

    // Fetch user role & approval from AsyncStorage
    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                const approved = await AsyncStorage.getItem('isApproved');
                setUserRole(role || '');
                setIsApproved(approved === '1' || approved === 'true');
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        };
        fetchUserStatus();
    }, []);

    // Update status text based on approval and role
    useEffect(() => {
        if (userRole === 'doctor') {
            setStatus(isApproved ? 'Verified' : 'Pending');
        } else {
            setStatus('Active');
        }
    }, [isApproved, userRole]);

    // Reset settings.success after save
    useEffect(() => {
        if (settings.success) {
            dispatch({ type: 'SETTINGS_RESET' });
        }
    }, [settings.success]);

    const styles = createStyles(theme, insets);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>


            {/* Centered Title */}
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

            {/* User Info with Right Arrow */}
            <TouchableOpacity
                style={[styles.userInfoContainer, { borderColor: theme.border }]}
                onPress={() => setEditModalVisible(true)}
            >
                <View>
                    <Text style={[styles.userName, { color: theme.text }]}>{firstName} {lastName}</Text>
                    <Text style={[styles.userEmail, { color: theme.mutedText }]}>{user?.email}</Text>
                </View>
                <Feather name="chevron-right" size={24} color={theme.text} />
            </TouchableOpacity>

            {/* Doctor Verification Section */}
            {userRole === 'doctor' && (
                <View style={styles.verificationContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Doctor Verification</Text>
                    <Text style={[styles.status, { color: theme.text }]}>{`Status: ${status}`}</Text>
                    <Text style={[styles.role, { color: theme.text }]}>{`Role: ${userRole}`}</Text>
                    <DoctorLicenseUpload theme={theme} userId={user?.id} />
                    {!isApproved ? (
                        <Text style={[styles.warning, { color: theme.warning }]}>
                            Your license is pending admin approval. Limited access only.
                        </Text>
                    ) : (
                        <Text style={[styles.approvedNote, { color: theme.success }]}>
                            Your license has been approved. Full access granted.
                        </Text>
                    )}
                </View>
            )}
            {/* Edit User Info Modal */}
            <EditUserInfoModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                firstName={firstName}
                lastName={lastName}
                isDarkMode={theme.mode === 'dark'}
                onSave={(newFirst, newLast) => {
                    setFirstName(newFirst);
                    setLastName(newLast);
                    dispatch(updateUserProfile(user.id, newFirst, newLast));
                    setEditModalVisible(false);
                }}
            />
        </View>
    );
};

const createStyles = (theme, insets) => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 20 : 10 + insets.top,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10 + insets.bottom,
        backgroundColor: theme.background,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
    loadingText: { marginTop: 10, fontFamily: 'Poppins' },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: theme.surface,
        alignSelf: 'flex-start',
    },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 30, fontFamily: 'Poppins' },
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 30,
    },
    userName: { fontSize: 18, fontWeight: '600', fontFamily: 'Poppins' },
    userEmail: { fontSize: 14, fontFamily: 'Poppins' },
    verificationContainer: { marginBottom: 20 },
    label: { fontSize: 18, fontWeight: '500', marginBottom: 5, fontFamily: 'Poppins' },
    status: { fontSize: 16, marginBottom: 2, fontFamily: 'Poppins' },
    role: { fontSize: 16, marginBottom: 10, fontFamily: 'Poppins' },
    warning: { fontSize: 16, fontWeight: '500', textAlign: 'center', marginTop: 10, fontFamily: 'Poppins' },
    approvedNote: { fontSize: 16, fontWeight: '500', textAlign: 'center', marginTop: 10, fontFamily: 'Poppins' },
});

export default SettingsScreen;
