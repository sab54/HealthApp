// Client/src/module/DailyWellnessCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DailyWellnessCard = ({ moodToday, sleepToday, energyToday, todaySymptoms, navigation, theme }) => {
    const firstSymptom = todaySymptoms && todaySymptoms.length > 0 ? todaySymptoms[0] : null;

    // Convert numeric sleep (e.g., 7.5) to "7h 30m"
    const formatSleep = (sleep) => {
        if (sleep == null) return 'No sleep logged';
        const hours = Math.floor(sleep);
        const minutes = Math.round((sleep - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    // Convert numeric energy to string label
    const formatEnergy = (energy) => {
        if (energy == null) return 'No energy logged';
        if (energy >= 7) return 'High';
        if (energy >= 4) return 'Medium';
        return 'Low';
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
            <Text style={styles.cardTitle}>Daily Wellness Summary</Text>

            {/* Mood / Sleep / Energy rows */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mood</Text>
                <Text style={styles.summaryValue}>{moodToday || 'No mood logged'}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sleep</Text>
                <Text style={styles.summaryValue}>{formatSleep(sleepToday)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Energy</Text>
                <Text style={styles.summaryValue}>{formatEnergy(energyToday)}</Text>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>Symptom Log</Text>
            {firstSymptom ? (
                <View style={styles.symptomRow}>
                    <Text style={styles.symptomText}>{firstSymptom.symptom}</Text>
                    <Text style={styles.symptomSeverity}>
                        {firstSymptom.severity} - Updated today
                    </Text>
                    <TouchableOpacity
                        style={styles.viewMoreButton}
                        onPress={() => navigation.navigate('DailyLog')}
                    >
                        <Text style={styles.viewMoreText}>View More</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.cardText}>No symptoms logged</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryLabel: { fontSize: 16, color: '#555' },
    summaryValue: { fontSize: 16, fontWeight: '600', color: '#111' },
    symptomRow: {
        marginTop: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    symptomText: { fontSize: 16, fontWeight: '600', color: '#111' },
    symptomSeverity: { fontSize: 14, color: '#555', marginTop: 2 },
    viewMoreButton: {
        marginTop: 6,
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#755CDB',
    },
    viewMoreText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    cardText: { fontSize: 16, color: '#555', marginTop: 4 },
});

export default DailyWellnessCard;
