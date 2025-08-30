// Client/src/screens/RegistrationScreen.js
/**
 * RegistrationScreen.js
 * 
 * This screen allows users to create a new account by entering their personal information,
 * including first name, last name, email, phone number, and role. It also handles country code selection.
 * Once the form is validated and submitted, the user is redirected to the OTP verification screen.
 * 
 * Features:
 * - Input fields for first name, last name, email, phone number, and role selection.
 * - Country picker to choose the user's country code.
 * - Validates the form before enabling the "Register" button.
 * - Handles location fetching to add user's latitude and longitude.
 * - After successful registration, the user is navigated to the OTP verification screen.
 * 
 * Dependencies:
 * - `react-native` for UI components.
 * - `react-navigation` for screen navigation.
 * - `react-redux` for managing application state.
 * - `CountryPicker` for country code selection.
 * - `expo-location` for fetching user's location.
 * - `ActivityIndicator` for showing loading state.
 * 
 * API Interaction:
 * - Uses `registerUser` from Redux actions to register the user.
 * 
 * Author: Sunidhi Abhange
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { registerUser } from '../store/actions/registrationActions';
import * as Location from 'expo-location';
import RadioButton from '../components/RadioButton';
import { autoSetOTP } from '../utils/config';

const RegistrationScreen = () => {
    const { themeColors } = useSelector((state) => state.theme);
    const { loading, error, user } = useSelector((state) => state.registration);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        countryCode: '+44',
        latitude: null,
        longitude: null,
        role: null,
    });

    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const handleInputChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const validateForm = () => {
        const { firstName, email, phoneNumber, role } = form;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return (
            firstName.trim() !== '' &&
            email.trim() !== '' &&
            emailRegex.test(email.trim()) &&
            phoneNumber.trim().length === 10 &&
            role
        );
    };

    useEffect(() => {
        setIsFormValid(validateForm());
    }, [form]);


    useEffect(() => {
        if (user) {
            navigation.navigate('OTPVerification', {
                phoneNumber: form.phoneNumber,
                countryCode: form.countryCode,
                userId: user.user_id,
                otpCode: user.otp_code,
                autoFillOtp: autoSetOTP
            });
        }
    }, [user]);

    const getLocationAndRegister = async () => {
        let latitude = null;
        let longitude = null;

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to access location was denied');
            } else {
                let location = await Location.getCurrentPositionAsync({});
                latitude = location.coords.latitude;
                longitude = location.coords.longitude;
            }
        } catch (error) {
            console.error('Failed to get location:', error);
        }

        handleRegister(latitude, longitude);
    };

    const handleRegister = (latitude = null, longitude = null) => {
        if (!isFormValid) return;
        dispatch(
            registerUser({
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                phone_number: form.phoneNumber,
                country_code: form.countryCode,
                latitude,
                longitude,
                role: form.role,
            })
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        { backgroundColor: themeColors.background },
                    ]}
                >
                    <Text style={[styles.header, { color: themeColors.text }]}>
                        Create Account
                    </Text>

                    <TextInput
                        style={[styles.input, getInputStyle(themeColors)]}
                        placeholder='First Name *'
                        placeholderTextColor={themeColors.placeholder}
                        value={form.firstName}
                        onChangeText={(v) => handleInputChange('firstName', v)}
                    />

                    <TextInput
                        style={[styles.input, getInputStyle(themeColors)]}
                        placeholder='Last Name'
                        placeholderTextColor={themeColors.placeholder}
                        value={form.lastName}
                        onChangeText={(v) => handleInputChange('lastName', v)}
                    />

                    <TextInput
                        style={[styles.input, getInputStyle(themeColors)]}
                        placeholder='Email *'
                        placeholderTextColor={themeColors.placeholder}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        value={form.email}
                        onChangeText={(v) => handleInputChange('email', v)}
                    />

                    <View style={styles.inputButtonContainer}>
                        <TouchableOpacity
                            onPress={() => setShowCountryPicker(true)}
                            style={[
                                styles.countryCodeBox,
                                { backgroundColor: themeColors.surface },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.countryCodeText,
                                    { color: themeColors.text },
                                ]}
                            >
                                {form.countryCode}
                            </Text>
                        </TouchableOpacity>

                        <TextInput
                            style={[
                                styles.phoneInput,
                                {
                                    backgroundColor: themeColors.input,
                                    borderColor: themeColors.inputBorder,
                                    color: themeColors.inputText,
                                },
                            ]}
                            placeholder='Phone Number *'
                            placeholderTextColor={themeColors.placeholder}
                            keyboardType='phone-pad'
                            maxLength={10}
                            value={form.phoneNumber}
                            onChangeText={(v) =>
                                handleInputChange(
                                    'phoneNumber',
                                    v.replace(/[^0-9]/g, '')
                                )
                            }
                        />
                    </View>

                    <Text style={[styles.label, { color: themeColors.text }]}>
                        Select Role *
                    </Text>
                    <View style={styles.roleContainer}>
                        <RadioButton
                            label="User"
                            value="user"
                            selected={form.role}
                            onPress={(value) => handleInputChange('role', value)}
                            themeColors={themeColors}
                        />
                        <RadioButton
                            label="Doctor"
                            value="doctor"
                            selected={form.role}
                            onPress={(value) => handleInputChange('role', value)}
                            themeColors={themeColors}
                        />
                    </View>

                    {error && (
                        <Text style={[styles.errorText, { color: themeColors.error }]}>
                            {error}
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={getLocationAndRegister}
                        style={[
                            styles.button,
                            {
                                backgroundColor: isFormValid
                                    ? themeColors.buttonPrimaryBackground
                                    : themeColors.buttonDisabledBackground,
                            },
                        ]}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator
                                color={themeColors.buttonPrimaryText}
                            />
                        ) : (
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: isFormValid
                                            ? themeColors.buttonPrimaryText
                                            : themeColors.buttonDisabledText,
                                    },
                                ]}
                            >
                                Register
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text
                            style={[
                                styles.loginLink,
                                { color: themeColors.link },
                            ]}
                        >
                            Already have an account? Log in
                        </Text>
                    </TouchableOpacity>

                    <CountryPicker
                        show={showCountryPicker}
                        pickerButtonOnPress={(item) => {
                            handleInputChange(
                                'countryCode',
                                `${item.dial_code}`
                            );
                            setShowCountryPicker(false);
                        }}
                        onBackdropPress={() => setShowCountryPicker(false)}
                        style={{
                            modal: {
                                backgroundColor: '#ffffff',
                                height: 400,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                paddingHorizontal: 16,
                                paddingTop: 20,
                            },
                            backdrop: { backgroundColor: 'rgba(0,0,0,0.6)' },
                            countryButtonStyles: {
                                backgroundColor: '#f0f0f0',
                                borderRadius: 12,
                                marginVertical: 6,
                                paddingVertical: 12,
                                paddingHorizontal: 15,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            },
                            countryNameText: {
                                color: '#000',
                                fontFamily: 'Poppins',
                                fontSize: 16,
                            },
                            dialCodeText: {
                                color: '#000',
                                fontFamily: 'Poppins',
                                fontSize: 14,
                                marginLeft: 10,
                            },
                            searchInput: {
                                backgroundColor: '#f5f5f5',
                                color: '#000',
                                borderColor: '#d0d0d0',
                                borderWidth: 1,
                                fontFamily: 'Poppins',
                                borderRadius: 10,
                                paddingHorizontal: 15,
                                marginBottom: 10,
                                height: 50,
                            },
                            searchMessageText: {
                                color: '#999',
                                fontFamily: 'Poppins',
                                fontSize: 14,
                                textAlign: 'center',
                                marginTop: 20,
                            },
                        }}
                        theme={{
                            backgroundColor: '#ffffff',
                            onBackgroundTextColor: '#000000',
                            textColor: '#000000',
                            subheaderBackgroundColor: '#f5f5f5',
                            filterPlaceholderTextColor: '#aaaaaa',
                            primaryColor: '#007bff',
                            primaryColorVariant: '#0056b3',
                        }}
                        showSearch
                        searchPlaceholder='Search country'
                        showCallingCode
                        searchMessage='No country found'
                        enableModalAvoiding={true}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const getInputStyle = (themeColors) => ({
    backgroundColor: themeColors.input,
    color: themeColors.inputText,
    borderColor: themeColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 15,
});

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontFamily: 'PoppinsBold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
    },
    inputButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 55,
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
    },
    countryCodeBox: {
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    countryCodeText: {
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        fontSize: 16,
        fontFamily: 'Poppins',
        borderLeftWidth: 1,
    },
    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'PoppinsBold',
        fontSize: 16,
    },
    loginLink: {
        marginTop: 20,
        fontFamily: 'Poppins',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    errorText: {
        fontFamily: 'Poppins',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    roleButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    selectedRoleButton: {
        backgroundColor: '#007AFF',
    },
    roleText: {
        fontSize: 16,
        fontFamily: 'Poppins',
        color: '#007AFF',
    },
    selectedRoleText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    label: {
        fontFamily: 'Poppins',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
    },
});

export default RegistrationScreen;
