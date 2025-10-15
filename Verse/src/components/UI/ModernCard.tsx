import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/DesignSystem';
import { useSettings } from '../../contexts/SettingsContext';

const { width: screenWidth } = Dimensions.get('window');

interface ModernCardProps {
  title: string;
  value: string | number;
  icon: string;
  gradient: readonly string[];
  onPress?: () => void;
  style?: ViewStyle;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  useDarkCard?: boolean; // Nova prop para forçar uso do card escuro
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  value,
  icon,
  gradient,
  onPress,
  style,
  subtitle,
  trend,
  trendValue,
  useDarkCard = false,
}) => {
  const { activeTheme, getThemeColors } = useSettings();
  const isDark = activeTheme === 'dark';
  const themeColors = getThemeColors();
  
  // Se useDarkCard for true ou estiver no dark mode, usar card escuro
  const shouldUseDarkCard = useDarkCard || isDark;
  
  // Responsividade baseada no tamanho da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
  const isLargeScreen = screenWidth >= 414;
  
  // Ajustar tamanhos baseado na tela
  const getResponsiveSize = () => {
    if (isSmallScreen) {
      return {
        iconSize: 18,
        titleFontSize: Typography.fontSize.lg,
        captionFontSize: Typography.fontSize.xs,
        padding: Spacing.sm,
        minHeight: 85,
      };
    } else if (isMediumScreen) {
      return {
        iconSize: 20,
        titleFontSize: Typography.fontSize.xl,
        captionFontSize: Typography.fontSize.xs,
        padding: Spacing.base,
        minHeight: 90,
      };
    } else {
      return {
        iconSize: 22,
        titleFontSize: Typography.fontSize['2xl'],
        captionFontSize: Typography.fontSize.sm,
        padding: Spacing.lg,
        minHeight: 100,
      };
    }
  };
  
  const responsiveSize = getResponsiveSize();
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return Colors.success;
      case 'down': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const captionStyle: TextStyle = {
    fontSize: responsiveSize.captionFontSize,
    color: shouldUseDarkCard ? themeColors.textSecondary : 'rgba(255,255,255,0.8)',
    marginBottom: isSmallScreen ? Spacing.xs / 2 : Spacing.xs,
    lineHeight: responsiveSize.captionFontSize * 1.2,
  };

  const titleStyle: TextStyle = {
    fontSize: responsiveSize.titleFontSize,
    fontWeight: Typography.fontWeight.bold,
    color: shouldUseDarkCard ? themeColors.textPrimary : Colors.white,
    marginBottom: isSmallScreen ? Spacing.xs / 2 : Spacing.xs,
    flexShrink: 1,
    lineHeight: responsiveSize.titleFontSize * 1.1,
  };

  const subtitleStyle: TextStyle = {
    fontSize: Typography.fontSize.sm,
    color: shouldUseDarkCard ? themeColors.textSecondary : 'rgba(255,255,255,0.7)',
  };

  const smallTextStyle: TextStyle = {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[{ flex: 1 }, style]} activeOpacity={0.7}>
        {shouldUseDarkCard ? (
          <View style={{
            backgroundColor: themeColors.surface,
            borderLeftWidth: isSmallScreen ? 3 : 4,
            borderLeftColor: themeColors.primary,
            padding: responsiveSize.padding,
            borderRadius: BorderRadius.lg,
            minHeight: responsiveSize.minHeight,
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={captionStyle} numberOfLines={1}>{title}</Text>
                <Text style={titleStyle} numberOfLines={isSmallScreen ? 1 : 2}>{value}</Text>
                {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
              </View>
              <View style={{
                backgroundColor: themeColors.primary,
                borderRadius: BorderRadius.md,
                padding: Spacing.xs,
              }}>
                <Ionicons name={icon as any} size={responsiveSize.iconSize} color={Colors.white} />
              </View>
            </View>

            {trend && trendValue && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Spacing.sm,
                paddingTop: Spacing.sm,
                borderTopWidth: 0,
                borderTopColor: 'transparent',
                flexWrap: 'wrap',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={getTrendIcon() as any} size={16} color={getTrendColor()} />
                  <Text style={[smallTextStyle, {
                    color: getTrendColor(),
                    marginLeft: Spacing.xs,
                    flexShrink: 1,
                  }]}>
                    {trendValue}
                  </Text>
                  <Text style={[{
                    fontSize: Typography.fontSize.xs, // Reduzir tamanho da fonte
                    color: themeColors.textSecondary,
                    marginLeft: Spacing.xs,
                    fontWeight: Typography.fontWeight.normal,
                    flexShrink: 1,
                  }]}>
                    vs semana passada
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: Spacing.base,
              borderRadius: BorderRadius.lg,
              minHeight: 90,
              ...Shadows.base,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={captionStyle}>{title}</Text>
                <Text style={titleStyle}>{value}</Text>
                {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
              </View>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.md,
                padding: Spacing.xs,
              }}>
                <Ionicons name={icon as any} size={20} color={Colors.white} />
              </View>
            </View>

            {trend && trendValue && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: Spacing.sm,
                paddingTop: Spacing.sm,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
                flexWrap: 'wrap',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={getTrendIcon() as any} size={16} color={getTrendColor()} />
                  <Text style={[smallTextStyle, {
                    color: getTrendColor(),
                    marginLeft: Spacing.xs,
                    flexShrink: 1,
                  }]}>
                    {trendValue}
                  </Text>
                  <Text style={[{
                    fontSize: Typography.fontSize.xs, // Reduzir tamanho da fonte
                    color: 'rgba(255,255,255,0.7)',
                    marginLeft: Spacing.xs,
                    fontWeight: Typography.fontWeight.normal,
                    flexShrink: 1,
                  }]}>
                    vs semana passada
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      {shouldUseDarkCard ? (
        <View style={{
          backgroundColor: themeColors.surface,
          borderLeftWidth: 4,
          borderLeftColor: themeColors.primary,
          padding: Spacing.base,
          borderRadius: BorderRadius.lg,
          minHeight: 90,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={captionStyle}>{title}</Text>
              <Text style={titleStyle}>{value}</Text>
              {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
            </View>
            <View style={{
              backgroundColor: themeColors.primary,
              borderRadius: BorderRadius.md,
              padding: Spacing.xs,
            }}>
              <Ionicons name={icon as any} size={20} color={Colors.white} />
            </View>
          </View>

          {trend && trendValue && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: Spacing.sm,
              paddingTop: Spacing.sm,
              borderTopWidth: 0,
              borderTopColor: 'transparent',
              flexWrap: 'wrap',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name={getTrendIcon() as any} size={16} color={getTrendColor()} />
                <Text style={[smallTextStyle, {
                  color: getTrendColor(),
                  marginLeft: Spacing.xs,
                  flexShrink: 1,
                }]}>
                  {trendValue}
                </Text>
                <Text style={[{
                  fontSize: Typography.fontSize.xs, // Reduzir tamanho da fonte
                  color: themeColors.textSecondary,
                  marginLeft: Spacing.xs,
                  fontWeight: Typography.fontWeight.normal,
                  flexShrink: 1,
                }]}>
                  vs semana passada
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: Spacing.base,
            borderRadius: BorderRadius.lg,
            minHeight: 90,
            ...Shadows.base,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={captionStyle}>{title}</Text>
              <Text style={titleStyle}>{value}</Text>
              {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
            </View>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.md,
              padding: Spacing.xs,
            }}>
              <Ionicons name={icon as any} size={20} color={Colors.white} />
            </View>
          </View>

          {trend && trendValue && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: Spacing.sm,
              paddingTop: Spacing.sm,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.2)',
            }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                flex: 1,
                maxWidth: '60%'
              }}>
                <Ionicons name={getTrendIcon() as any} size={16} color={getTrendColor()} />
                <Text 
                  numberOfLines={1}
                  style={[smallTextStyle, {
                    color: getTrendColor(),
                    marginLeft: Spacing.xs,
                  }]}>
                  {trendValue}
                </Text>
              </View>
              <Text 
                numberOfLines={1}
                style={[{
                  fontSize: Typography.fontSize.xs,
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: Typography.fontWeight.normal,
                  maxWidth: '40%',
                  textAlign: 'right',
                }]}>
                vs semana passada
              </Text>
            </View>
          )}
        </LinearGradient>
      )}
    </View>
  );
};

export default ModernCard;
