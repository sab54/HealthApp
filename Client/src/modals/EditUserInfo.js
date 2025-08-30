// Client/src/modals/EditUserInfoModal.js
/**
 * EditUserInfoModal.js
 * 
 * This file defines the `EditUserInfoModal` component, which provides a modal for 
 * editing the user's first and last name. The modal includes input fields for both 
 * names, a save button to confirm the changes, and a close button to exit without saving. 
 * The component supports dynamic theming based on light or dark mode.
 * 
 * Features:
 * - Allows users to edit their first and last name.
 * - The modal is designed with customizable theme colors, including background, text, and buttons.
 * - Includes validation to ensure both fields are filled before saving.
 * - Supports automatic reset of fields whenever the modal becomes visible.
 * 
 * Props:
 * - `visible`: A boolean controlling the visibility of the modal.
 * - `onClose`: Callback function to close the modal without saving.
 * - `onSave`: Callback function triggered when the save button is pressed, passing the updated names.
 * - `firstName`: The initial first name of the user, used to pre-fill the input (optional).
 * - `lastName`: The initial last name of the user, used to pre-fill the input (optional).
 * - `isDarkMode`: Boolean indicating whether dark mode is enabled (default: false).
 * 
 * Dependencies:
 * - `react-native`
 * - `react-native-modal`
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { getThemeColors } from '../theme/themeTokens';

const EditUserInfoModal = ({
    visible,
    onClose,
    firstName: initialFirst,
    lastName: initialLast,
    onSave,
    isDarkMode = false,
}) => {
    const theme = getThemeColors(isDarkMode);
    const [firstName, setFirstName] = useState(initialFirst || '');
    const [lastName, setLastName] = useState(initialLast || '');
    const styles = createStyles(theme);

    // Reset fields whenever modal opens
    useEffect(() => {
        if (visible) {
            setFirstName(initialFirst || '');
            setLastName(initialLast || '');
        }
    }, [visible, initialFirst, initialLast]);

    const handleSave = () => {
        if (firstName.trim() && lastName.trim()) {
            onSave(firstName, lastName);
            onClose();
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            backdropColor={theme.overlay}
            backdropOpacity={1}
            style={styles.modal}
            backdropTransitionOutTiming={0}
        >
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
                </TouchableOpacity>

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Edit User Info</Text>

                {/* Input Fields */}
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    placeholderTextColor={theme.placeholder}
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    placeholderTextColor={theme.placeholder}
                />

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                        <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        modal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        modalContent: {
            backgroundColor: theme.modalBackground,
            padding: 20,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            position: 'relative',
        },
        closeButton: {
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
        },
        closeText: {
            fontSize: 20,
        },
        modalTitle: {
            fontSize: 18,
            fontFamily: 'Poppins',
            fontWeight: '600',
            color: theme.title,
            textAlign: 'center',
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontFamily: 'Poppins',
            color: theme.text,
            marginBottom: 6,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.inputBorder,
            borderRadius: 8,
            padding: 10,
            marginBottom: 15,
            backgroundColor: theme.input,
            color: theme.inputText,
            fontFamily: 'Poppins',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        button: {
            flex: 1,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        cancelButton: {
            backgroundColor: theme.buttonSecondaryBackground,
        },
        saveButton: {
            backgroundColor: theme.buttonPrimaryBackground,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Poppins',
        },
    });

export default EditUserInfoModal;
