import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
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
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={Colors.white}
      />
    </TouchableOpacity>
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
