import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useResponsiveSpacing } from '../../hooks/useResponsive';
import { Typography, Colors } from '../../styles/DesignSystem';

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'poetry';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
  adjustsFontSizeToFit = false,
}) => {
  const { getFontSize } = useResponsiveSpacing();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'heading1':
        return {
          fontSize: getFontSize(Typography.fontSize['4xl']),
          fontWeight: Typography.fontWeight.bold,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize['4xl']) * Typography.lineHeight.tight,
          letterSpacing: -0.5,
        };
      case 'heading2':
        return {
          fontSize: getFontSize(Typography.fontSize['3xl']),
          fontWeight: Typography.fontWeight.bold,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize['3xl']) * Typography.lineHeight.tight,
          letterSpacing: -0.3,
        };
      case 'heading3':
        return {
          fontSize: getFontSize(Typography.fontSize['2xl']),
          fontWeight: Typography.fontWeight.semibold,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize['2xl']) * Typography.lineHeight.tight,
        };
      case 'heading4':
        return {
          fontSize: getFontSize(Typography.fontSize.xl),
          fontWeight: Typography.fontWeight.semibold,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize.xl) * Typography.lineHeight.normal,
        };
      case 'bodyLarge':
        return {
          fontSize: getFontSize(Typography.fontSize.lg),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize.lg) * Typography.lineHeight.normal,
        };
      case 'body':
        return {
          fontSize: getFontSize(Typography.fontSize.base),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize.base) * Typography.lineHeight.normal,
        };
      case 'bodySmall':
        return {
          fontSize: getFontSize(Typography.fontSize.sm),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textSecondary,
          lineHeight: getFontSize(Typography.fontSize.sm) * Typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontSize: getFontSize(Typography.fontSize.xs),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textSecondary,
          lineHeight: getFontSize(Typography.fontSize.xs) * Typography.lineHeight.normal,
        };
      case 'poetry':
        return {
          fontSize: getFontSize(Typography.fontSize.base),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textPrimary,
          lineHeight: getFontSize(Typography.fontSize.base) * Typography.lineHeight.relaxed,
          fontStyle: 'italic',
        };
      default:
        return {
          fontSize: getFontSize(Typography.fontSize.base),
          fontWeight: Typography.fontWeight.normal,
          color: color || Colors.textPrimary,
        };
    }
  };

  const textStyle: TextStyle = {
    ...getVariantStyle(),
    ...style,
  };

  return (
    <Text
      style={textStyle}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;
