import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: string;
}

interface AchievementCelebrationModalProps {
  visible: boolean;
  achievement: Achievement | null;
  userName?: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const AchievementCelebrationModal: React.FC<AchievementCelebrationModalProps> = ({
  visible,
  achievement,
  userName,
  onClose,
}) => {
  const { getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const sparkleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Animação de entrada
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Reset animations
      scaleAnimation.setValue(0);
      opacityAnimation.setValue(0);
      sparkleAnimation.setValue(0);
    }
  }, [visible, achievement]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: opacityAnimation,
        }}
      >
        <Animated.View
          style={{
            width: width * 0.85,
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            transform: [{ scale: scaleAnimation }],
          }}
        >
          {/* Efeito de brilho/sparkles */}
          <Animated.View
            style={{
              position: 'absolute',
              top: -10,
              right: 20,
              opacity: sparkleAnimation,
            }}
          >
            <Ionicons name="sparkles" size={24} color="#FFD700" />
          </Animated.View>
          
          <Animated.View
            style={{
              position: 'absolute',
              top: 30,
              left: 15,
              opacity: sparkleAnimation,
            }}
          >
            <Ionicons name="star" size={16} color="#FFD700" />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 40,
              right: 15,
              opacity: sparkleAnimation,
            }}
          >
            <Ionicons name="diamond" size={18} color="#FFD700" />
          </Animated.View>

          {/* Ícone principal da conquista */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: themeColors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Spacing.md,
              shadowColor: themeColors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons 
              name={achievement.icon as any || 'trophy'} 
              size={40} 
              color={themeColors.white} 
            />
          </View>

          {/* Título de parabéns */}
          <Text
            style={[
              {
                fontSize: Typography.fontSize['2xl'],
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.primary,
                textAlign: 'center',
                marginBottom: Spacing.xs,
              }
            ]}
          >
            🎉 Parabéns{userName ? `, ${userName}` : ''}! 🎉
          </Text>

          {/* Nome da conquista */}
          <Text
            style={[
              {
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.text,
                textAlign: 'center',
                marginBottom: Spacing.sm,
              }
            ]}
          >
            {achievement.title}
          </Text>

          {/* Descrição */}
          <Text
            style={[
              {
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.normal,
                color: themeColors.textSecondary,
                textAlign: 'center',
                marginBottom: Spacing.lg,
                lineHeight: 22,
              }
            ]}
          >
            {achievement.description}
          </Text>

          {/* Categoria */}
          <View
            style={{
              backgroundColor: themeColors.primaryLight,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.xs,
              borderRadius: BorderRadius.full,
              marginBottom: Spacing.lg,
            }}
          >
            <Text
              style={[
                {
                  fontSize: Typography.fontSize.xs,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }
              ]}
            >
              {achievement.category}
            </Text>
          </View>

          {/* Botão de fechar */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              backgroundColor: themeColors.primary,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.full,
              shadowColor: themeColors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                {
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.white,
                }
              ]}
            >
              Continuar
            </Text>
          </TouchableOpacity>

          {/* Botão X no canto */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              position: 'absolute',
              top: Spacing.md,
              right: Spacing.md,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: themeColors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="close" 
              size={18} 
              color={themeColors.textSecondary} 
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AchievementCelebrationModal;
