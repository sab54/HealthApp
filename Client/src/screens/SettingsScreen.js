import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/actions/settingActions';
import { Feather } from '@expo/vector-icons';
import EditUserInfoModal from '../modals/EditUserInfo';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const user = useSelector(state => state.auth.user);
    const settings = useSelector(state => state.settings);

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

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('MainTabs')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            {/* Centered Title */}
            <Text style={styles.title}>Settings</Text>

            {/* User Info with Right Arrow */}
            <TouchableOpacity
                style={styles.userInfoContainer}
                onPress={() => setEditModalVisible(true)}
            >
                <View>
                    <Text style={styles.userName}>{firstName} {lastName}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#000" />
            </TouchableOpacity>

            {/* Doctor Verification Section */}
            {userRole === 'doctor' && (
                <View style={styles.verificationContainer}>
                    <Text style={styles.label}>Doctor Verification</Text>
                    <Text style={styles.status}>Status: {status}</Text>
                    <Text style={styles.role}>Role: {userRole}</Text>
                    <Button
                        title="Upload License"
                        onPress={() => navigation.navigate('DoctorLicenseUpload')}
                    />
                    {!isApproved ? (
                        <Text style={styles.warning}>
                            Your license is pending admin approval. Limited access only.
                        </Text>
                    ) : (
                        <Text style={styles.approvedNote}>
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
                onSave={(newFirst, newLast) => {
                    setFirstName(newFirst);
                    setLastName(newLast);

                    // Update immediately to Redux/backend
                    dispatch(updateUserProfile(user.id, newFirst, newLast));

                    setEditModalVisible(false);
                }}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    backButton: { marginBottom: 10 },
    backButtonText: { fontSize: 16, color: '#007bff' },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 30 },
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
    userName: { fontSize: 18, fontWeight: '600' },
    userEmail: { fontSize: 14, color: '#666' },
    verificationContainer: { marginBottom: 20 },
    label: { fontSize: 18, fontWeight: '500', marginBottom: 5 },
    status: { fontSize: 16, marginBottom: 2 },
    role: { fontSize: 16, marginBottom: 10 },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        marginTop: 20
    },
    buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
    error: { color: 'red', marginTop: 10 },
    warning: { fontSize: 16, color: 'orange', textAlign: 'center', fontWeight: '500', marginTop: 10 },
    approvedNote: { fontSize: 16, color: 'green', textAlign: 'center', fontWeight: '500', marginTop: 10 },
});

export default SettingsScreen;
