// Client/src/components/Footer.js
/**
 * Footer.js
 * 
 * This file defines the `Footer` component, which renders a simple footer at the bottom 
 * of the screen. It displays a text message indicating that the app was designed by Sunidhi, 
 * and the component's styling is customized based on the provided `theme` prop for color and background.
 * 
 * Features:
 * - Displays a footer with a text message ("Designed by Sunidhi").
 * - Customizable theme for background and text colors based on the `theme` prop.
 * 
 * Props:
 * - `theme`: The theme object used to style the footer, specifically for background color and text color.
 * 
 * Dependencies:
 * - `react-native`
 * 
 * Author: Sunidhi Abhange
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Footer = ({ theme }) => {
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.footerBackground },
            ]}
        >
            <Text style={[styles.text, { color: theme.text }]}>
                Designed by Sunidhi
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    text: {
        fontSize: 13,
        fontFamily: 'Poppins',
        opacity: 0.6,
    },
});

export default Footer;
