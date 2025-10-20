import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../styles/DesignSystem';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação dos pontos de carregamento
    const dotAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim1, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };

    // Sequência de animações principais
    const animationSequence = Animated.sequence([
      // 1. Fade in do logo com escala
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
      ]),
      // 2. Pequena pausa
      Animated.delay(500),
      // 3. Fade in do texto
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 4. Pausa final
      Animated.delay(1500),
    ]);

    // Iniciar animações
    dotAnimation();
    animationSequence.start(() => {
      // Chamar onFinish após as animações
      setTimeout(onFinish, 300);
    });
  }, [fadeAnim, scaleAnim, textFadeAnim, dotAnim1, dotAnim2, dotAnim3, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
      
      {/* Fundo com gradiente animado */}
      <View style={styles.backgroundGradient} />
      
      {/* Partículas flutuantes */}
      <View style={styles.particles}>
        <Animated.View style={[styles.particle, styles.particle1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.particle, styles.particle2, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.particle, styles.particle3, { opacity: fadeAnim }]} />
      </View>
      
      {/* Conteúdo principal */}
      <View style={styles.content}>
        {/* Logo principal */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/verse.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Texto de boas-vindas */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.appName}>VERSE</Text>
          <Text style={styles.tagline}>Sua inspiração poética</Text>
          <Text style={styles.subtitle}>Onde palavras ganham vida</Text>
        </Animated.View>

        {/* Indicador de carregamento animado */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View 
              style={[
                styles.dot, 
                { 
                  opacity: dotAnim1,
                  transform: [{ scale: dotAnim1 }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { 
                  opacity: dotAnim2,
                  transform: [{ scale: dotAnim2 }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                { 
                  opacity: dotAnim3,
                  transform: [{ scale: dotAnim3 }]
                }
              ]} 
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E', // Azul escuro celestial
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#1A237E',
    // Simulando gradiente com múltiplas camadas
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 166, 35, 0.6)', // Dourado semi-transparente
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '60%',
    right: '20%',
  },
  particle3: {
    top: '80%',
    left: '70%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl * 2,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl * 2,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    color: '#F5A623', // Dourado
    fontWeight: '500',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: Spacing.xl * 3,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623', // Dourado
    marginHorizontal: 4,
  },
});

export default SplashScreen;
