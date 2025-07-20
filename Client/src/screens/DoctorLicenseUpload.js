// 📁 client/screens/DoctorLicenseUpload.js

import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getToken } from '../utils/tokenHelper';
import { BASE_URL } from '../utils/config';

export default function DoctorLicenseUpload({ navigation }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const uploadLicense = async () => {
    const token = await getToken(); // Already saved during OTP verification

    if (!file) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('license', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });

    setUploading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/license/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      setUploading(false);

      if (response.ok) {
        Alert.alert(
          'Submitted',
          'Your license is pending admin approval. Limited features available.'
        );
        navigation.navigate('Home');
      } else {
        Alert.alert('Upload Failed', data.message || 'Error uploading license.');
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Select and Upload Doctor License</Text>
      <Button title="Choose File" onPress={pickDocument} />
      {file && <Text>Selected: {file.name}</Text>}
      <Button title="Upload" onPress={uploadLicense} disabled={uploading} />
    </View>
  );
}
