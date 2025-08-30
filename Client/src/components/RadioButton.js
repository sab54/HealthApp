// Client/src/components/RadioButton.js
/**
 * RadioButton.js
 * 
 * This file defines the `RadioButton` component, which renders a customizable radio button 
 * with a label. The component is designed to visually indicate whether it is selected or not, 
 * and it supports custom colors based on the `themeColors` prop. It also allows the parent 
 * component to handle the selection through the `onPress` function.
 * 
 * Features:
 * - Displays a radio button with an outer and inner circle to represent selection.
 * - Customizable label for each radio button.
 * - Supports theming, allowing the radio button's border, background, and checked state colors to be customized.
 * - The `onPress` function is triggered when the user interacts with the radio button.
 * 
 * Props:
 * - `label`: The label text displayed next to the radio button.
 * - `value`: The value associated with this radio button.
 * - `selected`: The currently selected value (used to determine if the radio button is selected).
 * - `onPress`: The callback function to handle the selection when the radio button is pressed.
 * - `themeColors`: An object containing color values for customizing the radio button's appearance (e.g., `radioChecked`, `radioBorder`, `radioBackground`, and `text`).
 * 
 * Dependencies:
 * - `react-native`
 * 
 * Author: Sunidhi Abhange
 */

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
