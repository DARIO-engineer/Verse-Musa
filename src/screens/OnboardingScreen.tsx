import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import Button from '../components/UI/Button';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const slides = [
    {
      key: 'slide1',
      title: 'Bem-vindo ao Verso e Musa!',
      description: 'Seu espaço para criar, guardar e exportar poesias.',
      image: require('../../assets/logo.png'),
    },
    {
      key: 'slide2',
      title: 'Crie e Guarde Offline',
      description: 'Escreva seus poemas e salve-os como rascunhos, mesmo sem internet.',
      image: require('../../assets/logo.png'),
    },
    {
      key: 'slide3',
      title: 'Exporte e Compartilhe',
      description: 'Exporte seus versos em PDF e compartilhe como quiser.',
      image: require('../../assets/logo.png'),
    },
    {
      key: 'slide4',
      title: 'Seus Poemas, Sempre com Você',
      description: 'Tudo salvo no seu dispositivo, sem necessidade de login.',
      image: require('../../assets/logo.png'),
    },
  ];

  const handleDone = async () => {
    await AsyncStorage.setItem('@VersoEMusa:onboarding_complete', 'true');
    onFinish();
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(1); // Avança para o próximo slide
    }
  };

  return (
    <LinearGradient
      colors={[Colors.white, Colors.gray50, Colors.white]}
      style={styles.container}
    >
      <Swiper
        ref={swiperRef}
        loop={false}
        showsButtons={false}
        showsPagination={true}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        onIndexChanged={(index) => {
          setCurrentIndex(index);
          fadeAnim.setValue(0);
          scaleAnim.setValue(0.9);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        }}
      >
        {slides.map((slide) => (
          <Animated.View 
            key={slide.key} 
            style={[
              styles.slide,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.imageContainer}>
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>
        ))}
      </Swiper>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          {currentIndex < slides.length - 1 ? (
            <Button
              title="Pular"
              variant="ghost"
              onPress={handleDone}
              size="md"
            />
          ) : (
            <View />
          )}

          {currentIndex < slides.length - 1 ? (
            <Button
              title="Seguinte"
              variant="primary"
              onPress={handleNext}
              icon="arrow-forward"
              iconPosition="right"
              size="md"
            />
          ) : (
            <Button
              title="Começar"
              variant="primary"
              onPress={handleDone}
              icon="checkmark-circle"
              iconPosition="right"
              size="lg"
              fullWidth
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  imageContainer: {
    width: width * 0.75,
    height: width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['3xl'],
    ...Shadows.lg,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  description: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
    lineHeight: Typography.fontSize.lg * 1.6,
  },
  dotStyle: {
    backgroundColor: Colors.gray300,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginBottom: 100,
  },
  activeDotStyle: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginBottom: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.xl,
  },
});

export default OnboardingScreen;


