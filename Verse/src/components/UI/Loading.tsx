// src/components/UI/Loading.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles/DesignSystem';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  isDark?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = 'Carregando...',
  size = 'large',
  color = Colors.primary,
  isDark = false,
}) => {
  const textColor = isDark ? Colors.textPrimaryDark : Colors.textPrimary;
  const backgroundColor = isDark ? Colors.backgroundDark : Colors.background;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, { color: textColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

export default Loading;