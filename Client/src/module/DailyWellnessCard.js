// Client/src/module/DailyWellnessCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DailyWellnessCard = ({ moodToday, sleepToday, energyToday, todaySymptoms, navigation, theme }) => {

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
        <View style={[
            styles.card,
            {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow
            }
        ]}>
            <Text style={[styles.cardTitle, { color: theme.title, fontFamily: 'Poppins' }]}>
                Daily Wellness Summary
            </Text>

            {/* Mood / Sleep / Energy rows */}
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>Mood</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{moodToday || 'No mood logged'}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>Sleep</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{formatSleep(sleepToday)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.mutedText }]}>Energy</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{formatEnergy(energyToday)}</Text>
            </View>

            <Text style={[styles.cardTitle, { color: theme.title, marginTop: 16, fontFamily: 'Poppins' }]}>
                Symptom Log
            </Text>
            {todaySymptoms && todaySymptoms.length > 0 ? (
                todaySymptoms.map((symptomObj, index) => (
                    <View key={index} style={[styles.symptomRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.symptomText, { color: theme.text }]}>{symptomObj.symptom}</Text>
                        <Text style={[styles.symptomSeverity, { color: theme.mutedText }]}>
                            {symptomObj.severity} - Updated today
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={[styles.cardText, { color: theme.mutedText }]}>No symptoms logged</Text>
            )}

            <TouchableOpacity
                style={[styles.viewMoreButton, { backgroundColor: theme.buttonPrimaryBackground }]}
                onPress={() => navigation.navigate('DailyLog')}
            >
                <Text style={[styles.viewMoreText, { color: theme.buttonPrimaryText }]}>View More</Text>
            </TouchableOpacity>
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
    summaryLabel: { fontSize: 16, fontFamily: 'Poppins', marginBottom: 0 },
    summaryValue: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins', marginBottom: 0 },
    symptomRow: {
        marginTop: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
    },
    symptomText: { fontSize: 16, fontWeight: '600', fontFamily: 'Poppins' },
    symptomSeverity: { fontSize: 14, fontFamily: 'Poppins', marginTop: 2 },
    viewMoreButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    viewMoreText: { fontWeight: '600', fontSize: 12, fontFamily: 'Poppins' },
    cardText: { fontSize: 16, fontFamily: 'Poppins', marginTop: 4 },
});

export default DailyWellnessCard;
