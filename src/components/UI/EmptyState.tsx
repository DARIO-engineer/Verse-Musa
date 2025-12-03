// src/components/UI/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, CommonStyles } from '../../styles/DesignSystem';
import Button from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
  isDark?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onActionPress,
  isDark = false,
}) => {
  const textColor = isDark ? Colors.textPrimaryDark : Colors.textPrimary;
  const secondaryTextColor = isDark ? Colors.textSecondaryDark : Colors.textSecondary;

  return (
    <View style={styles.container}>
      <Ionicons 
        name={icon} 
        size={80} 
        color={Colors.gray400} 
        style={styles.icon}
      />
      
      <Text style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: secondaryTextColor }]}>
        {description}
      </Text>
      
      {actionText && onActionPress && (
        <Button
          title={actionText}
          onPress={onActionPress}
          variant="outline"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  icon: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    marginTop: Spacing.lg,
  },
});

export default EmptyState;