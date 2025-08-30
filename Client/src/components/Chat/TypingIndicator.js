/**
 * TypingIndicator.js
 * 
 * This file defines the `TypingIndicator` component, which visually represents the typing status
 * of users in a chat interface using animated dots. It can display the typing status for a 
 * single user, two users, or multiple users based on the provided `usernames` array. The 
 * animation loop creates a "typing..." effect with three dots that alternate in opacity.
 * 
 * Features:
 * - Displays a message indicating who is typing (e.g., one or more users).
 * - Animates dots to represent typing activity.
 * - Customizable theme to adjust appearance based on the app's design.
 * 
 * Props:
 * - `theme`: The theme object for styling, which includes `surface`, `text`, and `link` colors.
 * - `usernames` (optional): An array of user names that represent the users typing.
 * 
 * Dependencies:
 * - `react-native`
 * 
 * Author: Sunidhi Abhange
 */


import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

/**
 * TypingIndicator component shows animated dots and user names (if provided).
 * @param {Object} props
 * @param {Object} props.theme
 * @param {Array<string>} [props.usernames] - Optional array of user display names
 */
const TypingIndicator = ({ theme, usernames = [] }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0.3,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate(dot1, 0);
        animate(dot2, 150);
        animate(dot3, 300);
    }, [dot1, dot2, dot3]);

    const styles = createStyles(theme);

    const renderTypingText = () => {
        if (usernames.length === 0) return 'Typing...';
        if (usernames.length === 1) return `${usernames[0]} is typing...`;
        if (usernames.length === 2)
            return `${usernames[0]} and ${usernames[1]} are typing...`;
        return 'Multiple people are typing...';
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.text}>{renderTypingText()}</Text>
            <View style={styles.dotContainer}>
                <Animated.View
                    style={[
                        styles.dot,
                        { opacity: dot1, backgroundColor: theme.link },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { opacity: dot2, backgroundColor: theme.link },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { opacity: dot3, backgroundColor: theme.link },
                    ]}
                />
            </View>
        </View>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        wrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: theme.surface,
        },
        text: {
            fontFamily: 'Poppins',
            fontSize: 13,
            color: theme.text,
            marginRight: 8,
        },
        dotContainer: {
            flexDirection: 'row',
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 3,
        },
    });

export default TypingIndicator;
