import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = ({ navigation }) => {
    const handleGetStarted = async () => {
        await AsyncStorage.setItem('onboarding_seen', 'true');
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Health App</Text>
            <Text style={styles.subtitle}>Track your mental health journey.</Text>
            <Button title="Get Started" onPress={handleGetStarted} />
        </View>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 40,
        textAlign: 'center',
    },
});
