//Client/src/components/Footer.js
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
