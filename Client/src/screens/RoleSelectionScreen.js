// screens/RoleSelectionScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const RoleSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;

  const handleRoleSelect = (role) => {
    if (role === 'doctor') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'DoctorLicenseUpload' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }

    // Optional: you may dispatch Redux action or update backend to save selected role
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register As</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => handleRoleSelect('patient')}
      >
        <Text style={styles.buttonText}>Patient</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196F3' }]}
        onPress={() => handleRoleSelect('doctor')}
      >
        <Text style={styles.buttonText}>Doctor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RoleSelectionScreen;
