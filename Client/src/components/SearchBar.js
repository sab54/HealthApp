// Client/src/components/SearchBar.js
/**
 * SearchBar.js
 * 
 * This file defines the `SearchBar` component, which provides a customizable search 
 * input with features such as debounce handling, voice input (optional), and a clear button. 
 * The search input is designed with animated effects to enhance the user experience when 
 * focusing, typing, or clearing the input. The component can be themed based on the `theme` 
 * prop, and it supports accessibility for better usability.
 * 
 * Features:
 * - Debounced input change to limit unnecessary calls during typing (via lodash `debounce`).
 * - Clear button that appears when there is input and can reset the search field.
 * - Voice input button (optional) to trigger voice search (functionality placeholder).
 * - Animated border and button opacity that responds to focus and input changes.
 * - Accessibility features, including labels and hints for better screen reader support.
 * 
 * Props:
 * - `query`: The initial search query value (used to set the default value of the input).
 * - `onChange`: Callback function to handle input changes.
 * - `theme`: The theme object to customize colors for background, text, borders, etc.
 * - `placeholder`: Placeholder text for the input field (default is "Search...").
 * - `debounceTime`: Time (in milliseconds) to debounce input changes (default is 300ms).
 * - `onSubmit`: Function triggered when the search is submitted (via "Enter" or "Search" button).
 * - `showVoice`: Boolean to control whether the voice input button is displayed.
 * 
 * Dependencies:
 * - `react-native`
 * - `@expo/vector-icons`
 * - `lodash`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';

const SearchBar = ({
    query,
    onChange,
    theme,
    placeholder = 'Search...',
    debounceTime = 300,
    onSubmit = () => {},
    showVoice = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(query);
    const inputRef = useRef(null);
    const animatedBorder = useRef(new Animated.Value(0)).current;
    const clearOpacity = useRef(new Animated.Value(0)).current;

    const debouncedChange = useRef(
        debounce((text) => onChange(text), debounceTime)
    ).current;

    useEffect(() => {
        debouncedChange(inputValue);
    }, [inputValue]);

    useEffect(() => {
        Animated.timing(animatedBorder, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    useEffect(() => {
        Animated.timing(clearOpacity, {
            toValue: inputValue.length > 0 ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [inputValue]);

    const borderColor = animatedBorder.interpolate({
        inputRange: [0, 1],
        outputRange: [
            theme.card || '#eee',
            theme.accent || theme.primary || '#4B7BE5',
        ],
    });

    const handleClear = () => {
        setInputValue('');
        onChange('');
        inputRef.current?.focus();
    };

    const handleVoiceInput = () => {
        console.log('Voice input placeholder logic');
    };

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    backgroundColor: theme.input || theme.card || '#fff',
                    borderColor,
                },
            ]}
        >
            <Ionicons name='search' size={20} color={theme.text || '#000'} />

            <TextInput
                ref={inputRef}
                style={[styles.input, { color: theme.text || '#000' }]}
                placeholder={placeholder}
                placeholderTextColor={(theme.text || '#000') + '99'}
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType='search'
                onSubmitEditing={() => {
                    onSubmit(inputValue);
                    Keyboard.dismiss();
                }}
                accessibilityLabel='Search input'
                accessibilityHint='Enter text to search'
                accessibilityRole='search'
            />

            <Animated.View style={{ opacity: clearOpacity }}>
                {inputValue.length > 0 && (
                    <TouchableOpacity onPress={handleClear}>
                        <Ionicons
                            name='close-circle'
                            size={20}
                            color={(theme.text || '#000') + '88'}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {showVoice && (
                <TouchableOpacity
                    onPress={handleVoiceInput}
                    accessibilityLabel='Voice input'
                    accessibilityHint='Activate voice search'
                    style={{ marginLeft: 8 }}
                >
                    <Ionicons
                        name='mic-outline'
                        size={20}
                        color={(theme.text || '#000') + '88'}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 10,
        borderWidth: 2,
    },
    input: {
        flex: 1,
        fontSize: 13,
        marginLeft: 8,
        fontFamily: 'Poppins',
        paddingVertical: 2,
    },
});

export default SearchBar;
