// src/components/OnlineStatusIndicator.tsx
// Versão simplificada sem NetInfo - apenas backup local
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OnlineStatusIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = () => {
  // Retorna null - componente desativado (apenas backup local)
  return null;
};

export const OnlineStatusBadge: React.FC = () => {
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.badgeText}>Local</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
