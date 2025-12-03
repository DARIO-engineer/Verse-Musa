import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../styles/DesignSystem';

interface GradientCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: string[];
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'poetry' | 'achievement' | 'premium';
}

const GradientCard: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  gradient,
  onPress,
  children,
  style,
  variant = 'default',
}) => {
  const getGradientColors = () => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'poetry':
        return Colors.gradientPoetry;
      case 'achievement':
        return Colors.gradientSuccess;
      case 'premium':
        return Colors.gradientSunset;
      default:
        return Colors.gradientPrimary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'premium':
        return Colors.white;
      default:
        return Colors.white;
    }
  };

  const CardContent = () => (
    <LinearGradient
      colors={getGradientColors() as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={getTextColor()} />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: getTextColor() }]}>
            {title}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: `${getTextColor()}CC` }]}>
              {subtitle}
            </Text>
          )}
          
          {description && (
            <Text style={[styles.description, { color: `${getTextColor()}99` }]}>
              {description}
            </Text>
          )}
        </View>
        
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  content: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
});

export default GradientCard;
