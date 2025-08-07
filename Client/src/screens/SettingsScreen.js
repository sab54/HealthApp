import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SettingsScreen = ({ theme }) => {
    const handleSave = () => {
        // Placeholder for future settings save logic
        alert('Settings saved.');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.title }]}>
                App Settings
            </Text>

            {/* Add other settings here as needed */}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Poppins',
        marginBottom: 20,
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#1976D2',
        padding: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontFamily: 'PoppinsBold',
        textAlign: 'center',
    },
});

export default SettingsScreen;
