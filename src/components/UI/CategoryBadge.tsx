// src/components/UI/CategoryBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, getCategoryColor, getCategoryIcon } from '../../styles/DesignSystem';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'subtle';
  showIcon?: boolean;
  style?: ViewStyle;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  variant = 'subtle',
  showIcon = true,
  style,
}) => {
  const categoryColor = getCategoryColor(category);
  const categoryIcon = getCategoryIcon(category);

  const getBadgeStyle = (): ViewStyle => {
    const sizeStyles = {
      sm: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm,
      },
      md: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.base,
      },
      lg: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.lg,
      },
    };

    const variantStyles = {
      filled: {
        backgroundColor: categoryColor,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: categoryColor,
      },
      subtle: {
        backgroundColor: `${categoryColor}20`, // 20% opacity
      },
    };

    return {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      sm: {
        fontSize: Typography.fontSize.xs,
      },
      md: {
        fontSize: Typography.fontSize.sm,
      },
      lg: {
        fontSize: Typography.fontSize.base,
      },
    };

    const variantStyles = {
      filled: {
        color: Colors.white,
      },
      outlined: {
        color: categoryColor,
      },
      subtle: {
        color: categoryColor,
      },
    };

    return {
      fontWeight: Typography.fontWeight.semibold,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getIconSize = () => {
    const sizes = {
      sm: 12,
      md: 16,
      lg: 20,
    };
    return sizes[size];
  };

  const getIconColor = () => {
    const colors = {
      filled: Colors.white,
      outlined: categoryColor,
      subtle: categoryColor,
    };
    return colors[variant];
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {showIcon && (
        <Ionicons 
          name={categoryIcon as keyof typeof Ionicons.glyphMap} 
          size={getIconSize()} 
          color={getIconColor()} 
          style={{ marginRight: Spacing.xs }}
        />
      )}
      <Text style={getTextStyle()}>{category}</Text>
    </View>
  );
};

export default CategoryBadge;