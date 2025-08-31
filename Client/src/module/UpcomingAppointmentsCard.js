// /src/module/UpcomingAppointmentCard.js
/**
 * UpcomingAppointmentCard.js
 *
 * This component displays a summary of the user's upcoming appointment, including the appointment's
 * date, time, and doctor's name or reason for the appointment. It also handles loading states
 * and shows a message when there are no upcoming appointments.
 *
 * Key Features:
 * - Displays a loading indicator while appointments are being fetched.
 * - Displays a message when there are no upcoming appointments.
 * - Calculates and displays the number of days until the next appointment.
 * - Parses and formats appointment dates and times.
 * - Sorts and filters the upcoming appointments to show the nearest one.
 *
 * Props:
 * - `appointments`: An array of appointments, each with a `date`, `time`, and `doctor_name` or `reason`.
 * - `loading`: A boolean that indicates whether the appointments are still being loaded.
 * - `theme`: The current theme for the app, used for styling the component.
 *
 * States:
 * - `expanded`: Manages the expanded state of each appointment section (though not used in this version).
 *
 * Helper Functions:
 * - `parseDate`: A function that parses date and time strings into JavaScript Date objects.
 *
 * Dependencies:
 * - `react-native`: For UI components and layout.
 *
 * Author: Sunidhi Abhange
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const UpcomingAppointmentCard = ({ appointments, loading, theme }) => {
    const parseDate = (dateStr, timeStr) => {
        if (!dateStr) return null;

        let dateObj;
        if (dateStr.includes("/")) {
            // Force DD/MM/YYYY
            const [day, month, year] = dateStr.split("/");
            dateObj = new Date(`${year}-${month}-${day}T${timeStr}:00`);
        } else {
            // Assume YYYY-MM-DD
            dateObj = new Date(`${dateStr}T${timeStr}:00`);
        }


        console.log(" Parsing date:", { dateStr, timeStr, dateObj: dateObj.toString() });
        return dateObj;
    };

    if (loading) {
        console.log(" Appointments are still loading...");
        return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.title, { color: theme.text }]}>Loading...</Text>
            </View>
        );
    }

    // console.log(" Raw appointments:", appointments);

    if (!appointments || appointments.length === 0) {
        // console.log(" No appointments received from server");
        return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Upcoming Appointment
                </Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                    No upcoming appointments
                </Text>
            </View>
        );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const futureAppointments = appointments
        .filter((a) => a && a.date && a.time) // skip bad rows
        .map((a) => {
            let dateObj;
            if (typeof a.date === "string" && a.date.includes("/")) {
                // Always assume DD/MM/YYYY
                const [day, month, year] = a.date.split("/");
                dateObj = new Date(`${year}-${month}-${day}T${a.time}:00`);
            } else {
                // Fallback: YYYY-MM-DD
                dateObj = new Date(`${a.date}T${a.time}:00`);
            }
            return { ...a, dateObj };
        })
        .filter((a) => a.dateObj >= startOfToday)
        .sort((a, b) => a.dateObj - b.dateObj);



    console.log(" Future appointments:", futureAppointments);

    if (futureAppointments.length === 0) {
        console.log(" No future appointments passed the filter");
        return (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Upcoming Appointment
                </Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                    No upcoming appointments
                </Text>
            </View>
        );
    }

    const nextAppt = futureAppointments[0];
    console.log(" Next appointment chosen:", nextAppt);

    const diffDays = Math.ceil(
        (nextAppt.dateObj.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>
                Upcoming Appointment
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
                {diffDays === 0 ? "Today" : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`}
            </Text>

            <Text style={[styles.detail, { color: theme.text }]}>
                On {nextAppt.date} at {nextAppt.time}
            </Text>
            <Text style={[styles.detail, { color: theme.text }]}>
                With: {nextAppt.doctor_name || nextAppt.reason || "Doctor"}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Poppins',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Poppins',
    },
    detail: {
        fontSize: 14,
        marginTop: 6,
        fontFamily: 'Poppins',
    },
});

export default UpcomingAppointmentCard;
