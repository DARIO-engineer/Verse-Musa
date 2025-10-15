import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../styles/DesignSystem';

const { width } = Dimensions.get('window');

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: string[];
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  gradient = Colors.gradientPrimary,
  onPress,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return Colors.success;
      case 'down':
        return Colors.error;
      default:
        return Colors.gray500;
    }
  };

  const CardContent = () => (
    <LinearGradient
      colors={gradient as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={Colors.white} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}

        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={getTrendIcon()} 
              size={14} 
              color={getTrendColor()} 
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: (width - Spacing.xl * 3) / 2,
    marginBottom: Spacing.md,
  },
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.base,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  value: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
  },
});

export default StatsCard;
