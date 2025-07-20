// 📁 client/utils/tokenHelper.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Retrieved token:', token); // ✅ Debug here only
    return token;
  } catch (e) {
    console.error('Failed to get token', e);
    return null;
  }
};
