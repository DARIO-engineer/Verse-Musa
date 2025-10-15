import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/DesignSystem';
import Button from '../components/UI/Button';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null); // Adicionando o ref para o Swiper

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
    <View style={styles.container}>
      <Swiper
        ref={swiperRef} // Atribuindo o ref ao Swiper
        loop={false}
        showsButtons={false}
        showsPagination={true}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        onIndexChanged={(index) => setCurrentIndex(index)}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={styles.slide}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </Swiper>

      <View style={styles.buttonContainer}>
        {currentIndex < slides.length - 1 ? (
          <Button
            title="Pular"
            variant="ghost"
            onPress={handleDone}
          />
        ) : (
          <View /> // Espaço vazio para manter o alinhamento
        )}

        {currentIndex < slides.length - 1 ? (
          <Button
            title="Seguinte"
            variant="primary"
            onPress={handleNext}
            icon="arrow-forward"
            iconPosition="right"
          />
        ) : (
          <Button
            title="Começar"
            variant="primary"
            onPress={handleDone}
            icon="checkmark-circle"
            iconPosition="right"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: Spacing['3xl'],
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: Typography.fontSize.lg * 1.5,
  },
  dotStyle: {
    backgroundColor: Colors.gray300,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    marginBottom: 80,
  },
  activeDotStyle: {
    backgroundColor: Colors.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
    marginBottom: 80,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default OnboardingScreen;


