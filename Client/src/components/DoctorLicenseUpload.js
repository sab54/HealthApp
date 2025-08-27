// Client/src/components/DoctorLicenseUpload.js
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { verifyDoctorLicense } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

const DoctorLicenseUpload = ({ theme, userId, onVerified }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets ? result.assets[0] : result);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    if (!userId) {
      Alert.alert('Error', 'User not logged in. Cannot upload license.');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      console.log('Uploading license for user ID:', userId);
      const data = await verifyDoctorLicense(image.uri, userId);

      if (data.success) {
        setResult('success');
        await AsyncStorage.setItem('isApproved', '1');

        if (onVerified) onVerified();
      } else {
        setResult('failure');
      }
    } catch (err) {
      console.error(err);
      setResult('failure');
    } finally {
      setUploading(false);
    }
  };


  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Upload Medical License</Text>

      {/* Upload rectangle zone */}
      <TouchableOpacity
        style={[styles.uploadZone, { borderColor: theme.buttonPrimaryBackground }]}
        onPress={pickImage}
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={32} color={theme.buttonPrimaryBackground} />
            <Text style={[styles.uploadText, { color: theme.buttonPrimaryBackground }]}>
              Pick License Image
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Upload button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: image && !uploading ? theme.buttonPrimaryBackground : theme.surface,
            borderColor: theme.buttonPrimaryBackground,
            borderWidth: 2,
            opacity: !image || uploading ? 0.6 : 1,
          },
        ]}
        onPress={uploadImage}
        disabled={!image || uploading}
      >
        <Text
          style={[
            styles.buttonText,
            { color: image && !uploading ? theme.buttonPrimaryText : theme.buttonPrimaryBackground },
          ]}
        >
          {uploading ? "Uploading..." : "Upload and Verify"}
        </Text>
      </TouchableOpacity>

      {/* Verification result */}
      {result && (
        <Text
          style={{
            marginTop: 10,
            color: result === 'success' ? theme.success : theme.warning,
          }}
        >
          Verification Result: {result}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    minHeight: 150,
  },
  uploadText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorLicenseUpload;
