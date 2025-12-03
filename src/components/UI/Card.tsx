// src/components/UI/Card.tsx
import React from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, CommonStyles } from '../../styles/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'highlight' | 'poetry';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  isDark?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding = 'base',
  margin,
  isDark = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      padding: Spacing[padding],
      overflow: 'hidden',
    };

    if (margin) {
      baseStyle.margin = Spacing[margin];
    }

    // Não definimos backgroundColor aqui para os tipos glass e highlight
    // que usam LinearGradient
    if (!['glass', 'highlight', 'poetry'].includes(variant)) {
      baseStyle.backgroundColor = isDark ? Colors.surfaceDark : Colors.surface;
    }

    const variantStyles = {
      default: {
        ...Shadows.base,
      },
      elevated: {
        ...Shadows.lg,
      },
      outlined: {
        borderWidth: 1,
        borderColor: isDark ? Colors.borderDark : Colors.border,
        ...Shadows.sm,
      },
      glass: {
        ...Shadows.md,
        backgroundColor: 'transparent',
      },
      highlight: {
        ...Shadows.md,
        backgroundColor: 'transparent',
      },
      poetry: {
        ...Shadows.md,
        backgroundColor: isDark ? Colors.surfaceDark : Colors.surface,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };
  
  // Função para obter as cores do gradiente com base na variante
  const getGradientColors = () => {
    if (variant === 'glass') {
      return isDark 
        ? ['rgba(30, 30, 30, 0.7)', 'rgba(20, 20, 20, 0.8)'] 
        : ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.8)'];
    } else if (variant === 'highlight') {
      return isDark
        ? [Colors.primaryDark, Colors.secondaryDark]
        : [Colors.primary, Colors.secondary];
    }
    return [];
  };

  // Renderiza o conteúdo do cartão com base na variante
  const renderCardContent = () => {
    if (variant === 'glass' || variant === 'highlight') {
      return (
        <LinearGradient
          colors={getGradientColors() as unknown as readonly [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }
    return children;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderCardContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {renderCardContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Card;