//  Client/src/screens/DoctorVerificationScreen.js

import React, { useState } from 'react';
import { View, Button, Image, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { verifyDoctorLicense } from '../utils/api';
import { useNavigation } from '@react-navigation/native';

const DoctorVerificationScreen = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const navigation = useNavigation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets ? result.assets[0] : result);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setUploading(true);
    setResult(null);

    try {
      const userId = await AsyncStorage.getItem('user_id');
      console.log('Uploading license for user ID:', userId);
      const data = await verifyDoctorLicense(image.uri, userId);
      if (data.success) {
        setResult('success');
        // Update AsyncStorage here so HomeScreen knows license is approved
        await AsyncStorage.setItem('isApproved', '1');
      } else {
        setResult('failure');
      }
    } catch (err) {
      setResult('failure');
    } finally {
      setUploading(false);
    }
  };

  const onContinue = () => {
    // Navigate to Home screen
    navigation.navigate('MainTabs');
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Pick License Image" onPress={pickImage} />

      {image &&
        <Image
          source={{ uri: image.uri }}
          style={{ width: 200, height: 200, marginTop: 10 }}
        />
      }

      <Button
        title="Upload and Verify"
        onPress={uploadImage}
        disabled={!image || uploading}
      />

      {uploading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 10 }} />}

      {result && <Text style={{ marginTop: 10 }}>Verification Result: {result}</Text>}

      {/* Show Continue button only on success */}
      {result === 'success' && (
        <Button title="Continue" onPress={onContinue} style={{ marginTop: 20 }} />
      )}
    </View>
  );
};

export default DoctorVerificationScreen;
