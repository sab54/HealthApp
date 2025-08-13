import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const EditUserInfoModal = ({ visible, onClose, firstName: initialFirst, lastName: initialLast, onSave }) => {
    const [firstName, setFirstName] = useState(initialFirst || '');
    const [lastName, setLastName] = useState(initialLast || '');

    // Reset fields when modal opens
    useEffect(() => {
        if (visible) {
            setFirstName(initialFirst || '');
            setLastName(initialLast || '');
        }
    }, [visible, initialFirst, initialLast]);

    const handleSave = () => {
        if (firstName.trim() && lastName.trim()) {
            onSave(firstName, lastName);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit User Info</Text>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                    />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: { fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    saveButton: {
        backgroundColor: '#007bff',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default EditUserInfoModal;
