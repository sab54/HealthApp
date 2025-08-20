import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurvedBackground from '../components/CurvedBackground';

const OnboardingScreen = ({ navigation }) => {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (swiperRef.current && currentIndex < 2) {
      swiperRef.current.scrollBy(1);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    navigation.navigate('Login');
  };

  const animateSlide = () => {
    bounceAnim.setValue(0);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateSlide();
  }, [currentIndex]);

  const slides = [
    {
      image: require('./../assets/illutration-onboardingscreen.png'),
      title: 'Get personalized tips',
      subtitle: 'Receive suggestions tailored to your lifestyle.',
    },
    {
      image: require('./../assets/illustration-onboardingscreen2.png'),
      title: 'Connect With Verified Doctors',
      subtitle:
        'Receive personalized health suggestions through secure messaging.\nDoctors handle and send bookings.',
    },
    {
      image: require('./../assets/illustration-onboardingscreen3.png'),
      title: 'Track your health',
      subtitle: 'Track your well-being daily.\nDoctors can review your progress.',
    },
  ];

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      onIndexChanged={setCurrentIndex}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      paginationStyle={{ bottom: 70 }}
    >
      {slides.map((slide, index) => (
        <View key={index} style={styles.slide}>
          <View style={styles.imageWrapper}>
            <CurvedBackground translateY={bounceTranslate} />
            <Animated.Image
              source={slide.image}
              style={[
                styles.image,
                { transform: [{ translateY: bounceTranslate }] },
              ]}
            />
          </View>

          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
            {slide.title}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
            {slide.subtitle}
          </Animated.Text>

          {index < slides.length - 1 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </Swiper>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    overflow: 'visible',
  },
  image: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#6A5ACD',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  nextButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
