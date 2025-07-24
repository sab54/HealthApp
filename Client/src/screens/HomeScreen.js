import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [userRole, setUserRole] = useState('');
  const [isApproved, setIsApproved] = useState(true); // Default to approved
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const approved = await AsyncStorage.getItem('isApproved');

        setUserRole(role || '');
        setIsApproved(approved === '1' || approved === 'true'); // cover string types
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeScreen</Text>

      {userRole ? (
        <Text style={styles.roleText}>
          Welcome, {userRole === 'doctor' ? 'Doctor' : 'Patient'}!
        </Text>
      ) : null}

      {userRole === 'doctor' && (
        <View style={{ marginVertical: 20 }}>
          {!isApproved ? (
            <>
              <Button
                title="Upload License"
                onPress={() => navigation.navigate('DoctorLicenseUpload')}
              />
              <Text style={styles.warning}>
                Your license is pending admin approval. Limited access only.
              </Text>
            </>
          ) : (
            <Text style={styles.approvedNote}>
              Your license has been approved. Full access granted.
            </Text>
          )}
        </View>
      )}

      <View style={{ marginTop: 40 }}>
        <Button title="Logout" color="#e53935" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  roleText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '500',
    color: '#444',
  },
  warning: {
    fontSize: 16,
    color: 'orange',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 10,
  },
  approvedNote: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 10,
  },
});

export default HomeScreen;
