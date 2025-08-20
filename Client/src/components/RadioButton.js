import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RadioButton = ({ label, value, selected, onPress, themeColors }) => {
    const isSelected = selected === value;

    return (
        <TouchableOpacity
            style={styles.radioButtonContainer}
            onPress={() => onPress(value)}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.radioOuter,
                    {
                        borderColor: isSelected
                            ? themeColors.radioChecked
                            : themeColors.radioBorder,
                        backgroundColor: themeColors.radioBackground,
                    },
                ]}
            >
                {isSelected && (
                    <View
                        style={[
                            styles.radioInner,
                            { backgroundColor: themeColors.radioChecked },
                        ]}
                    />
                )}
            </View>
            <Text style={[styles.radioLabel, { color: themeColors.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
    radioLabel: {
        fontSize: 16,
        fontFamily: 'Poppins',
    },
});

export default RadioButton;
