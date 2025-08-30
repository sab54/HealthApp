// Client/src/modals/ActionModal.js
/**
 * ActionModal.js
 * 
 * This file defines the `ActionModal` component, which displays a modal with a list of 
 * selectable actions, each represented by an emoji and a label. The modal provides a 
 * loading state and allows users to select an option, which triggers a callback function. 
 * The component is customizable with themes, loading messages, and other configurations.
 * 
 * Features:
 * - Displays a modal with a title and a list of action options.
 * - Options are presented as clickable items with an emoji and a label.
 * - Supports a loading state with a customizable loading message.
 * - Customizable theme for modal background, text, and other UI elements.
 * - Handles closing of the modal and triggering a callback on option selection.
 * 
 * Props:
 * - `visible`: Boolean to control the visibility of the modal.
 * - `onClose`: Callback function to close the modal.
 * - `onSelect`: Callback function triggered when an option is selected.
 * - `theme`: The theme object for styling the modal (includes colors for background, text, etc.).
 * - `options`: An array of options, each containing an emoji, label, and action.
 * - `loadingMessage`: A message to show when the modal is in the loading state (default: 'Loading...').
 * - `onModalHide`: Callback function triggered when the modal is hidden.
 * 
 * Dependencies:
 * - `react-native`
 * - `react-native-modal`
 * - `@expo/vector-icons`
 * 
 * Author: Sunidhi Abhange
 */


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

const ActionModal = ({
    visible,
    onClose,
    onSelect,
    theme,
    options,
    loadingMessage = 'Loading...',
    onModalHide,
}) => {
    const [loading, setLoading] = useState(false);
    const styles = createStyles(theme);

    const handleSelect = (action) => {
        onSelect(action);
        onClose();
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onModalHide={onModalHide}
            style={styles.modal}
            backdropTransitionOutTiming={0}
        >
            <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Feather name='x' size={20} color={theme.text} />
                </TouchableOpacity>

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Choose an Option</Text>

                {/* Loading or Options */}
                {loading ? (
                    <Text style={styles.loadingText}>{loadingMessage}</Text>
                ) : (
                    <View style={styles.grid}>
                        {options.map(({ emoji, label, action }) => (
                            <TouchableOpacity
                                key={label}
                                style={styles.gridItem}
                                onPress={() => handleSelect(action)}
                            >
                                <Text style={styles.gridEmoji}>{emoji}</Text>
                                <Text style={styles.gridLabel}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
            backgroundColor: theme.surface,
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
        modalTitle: {
            fontSize: 16,
            fontFamily: 'Poppins',
            marginBottom: 20,
            color: theme.text,
            textAlign: 'center',
        },
        loadingText: {
            fontSize: 14,
            color: theme.text,
            textAlign: 'center',
            marginBottom: 20,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        gridItem: {
            width: '47%',
            backgroundColor: theme.input,
            borderRadius: 12,
            paddingVertical: 20,
            alignItems: 'center',
            marginBottom: 16,
        },
        gridEmoji: {
            fontSize: 26,
            marginBottom: 6,
        },
        gridLabel: {
            fontSize: 14,
            fontFamily: 'Poppins',
            color: theme.text,
        },
    });

export default ActionModal;
