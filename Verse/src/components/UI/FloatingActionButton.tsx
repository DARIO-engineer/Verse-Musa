import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../styles/DesignSystem';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  disabled = false,
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animação de entrada
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animação ao pressionar
  useEffect(() => {
    if (pressed) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [pressed]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const getBackgroundColor = () => {
    if (disabled) return Colors.gray400;
    
    switch (variant) {
      case 'secondary':
        return Colors.secondary;
      case 'accent':
        return Colors.accent;
      case 'success':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'large':
        return 72;
      default:
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const buttonSize = getSize();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: getBackgroundColor(),
          },
          style,
        ]}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={0.9}
        disabled={disabled}
      >
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
          }}
        >
          <Ionicons
            name={icon}
            size={getIconSize()}
            color={Colors.white}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});

export default FloatingActionButton;
