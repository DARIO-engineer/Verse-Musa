// src/components/UI/Button.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation, CommonStyles } from '../../styles/DesignSystem';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  // Animações
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pressedIn, setPressedIn] = useState(false);
  
  // Efeito de animação quando pressionado
  useEffect(() => {
    if (pressedIn) {
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: Animation.duration.fast,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [pressedIn, scaleAnim]);
  const getButtonStyle = (): ViewStyle => {
    let baseStyle: ViewStyle = {};
    
    // Usar os novos estilos do DesignSystem
    switch (variant) {
      case 'primary':
        baseStyle = { ...CommonStyles.buttonPrimary };
        break;
      case 'secondary':
        baseStyle = { ...CommonStyles.buttonSecondary };
        break;
      case 'outline':
        baseStyle = { ...CommonStyles.buttonOutline };
        break;
      case 'ghost':
        baseStyle = { ...CommonStyles.buttonGhost };
        break;
      case 'danger':
        baseStyle = {
          ...CommonStyles.buttonPrimary,
          backgroundColor: Colors.error,
        };
        break;
      default:
        baseStyle = { ...CommonStyles.buttonPrimary };
    }

    // Size variations
    const sizeStyles = {
      sm: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        minHeight: 40,
        borderRadius: BorderRadius.md,
      },
      md: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        minHeight: 48,
        borderRadius: BorderRadius.lg,
      },
      lg: {
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing['2xl'],
        minHeight: 56,
        borderRadius: BorderRadius.xl,
      },
    };

    const finalStyle: ViewStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      width: fullWidth ? '100%' : 'auto',
    };
    
    // Aplicar opacidade se desabilitado
    if (disabled) {
      finalStyle.opacity = 0.6;
      finalStyle.backgroundColor = variant === 'outline' || variant === 'ghost' 
        ? 'transparent' 
        : Colors.gray300;
    }

    return finalStyle;
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      sm: {
        fontSize: Typography.fontSize.sm,
      },
      md: {
        fontSize: Typography.fontSize.base,
      },
      lg: {
        fontSize: Typography.fontSize.lg,
      },
    };

    const variantStyles = {
      primary: {
        color: Colors.white,
        fontWeight: Typography.fontWeight.bold,
      },
      secondary: {
        color: Colors.white,
        fontWeight: Typography.fontWeight.bold,
      },
      outline: {
        color: disabled ? Colors.gray400 : Colors.primary,
        fontWeight: Typography.fontWeight.semibold,
      },
      ghost: {
        color: disabled ? Colors.gray400 : Colors.primary,
        fontWeight: Typography.fontWeight.semibold,
      },
      danger: {
        color: Colors.white,
        fontWeight: Typography.fontWeight.bold,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      letterSpacing: 0.3,
    };
  };

  const getIconSize = () => {
    const sizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };
    return sizes[size];
  };

  const getIconColor = () => {
    const colors = {
      primary: Colors.white,
      secondary: Colors.white,
      outline: disabled ? Colors.gray400 : Colors.primary,
      ghost: disabled ? Colors.gray400 : Colors.primary,
      danger: Colors.white,
    };
    return colors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={getIconColor()} />;
    }

    const iconElement = icon ? (
      <Ionicons 
        name={icon} 
        size={getIconSize()} 
        color={getIconColor()} 
        style={{ marginHorizontal: Spacing.xs }}
      />
    ) : null;

    const textElement = (
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    );

    if (iconPosition === 'left') {
      return (
        <>
          {iconElement}
          {textElement}
        </>
      );
    } else {
      return (
        <>
          {textElement}
          {iconElement}
        </>
      );
    }
  };

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }],
      width: fullWidth ? '100%' : 'auto',
    }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={() => setPressedIn(true)}
        onPressOut={() => setPressedIn(false)}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;