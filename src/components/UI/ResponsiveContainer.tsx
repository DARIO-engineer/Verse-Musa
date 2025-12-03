import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive, useResponsiveSpacing } from '../../hooks/useResponsive';
import { Colors } from '../../styles/DesignSystem';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  style?: ViewStyle;
  maxWidth?: number;
  centerContent?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  padding = 16,
  margin = 0,
  backgroundColor = Colors.background,
  style,
  maxWidth,
  centerContent = false,
}) => {
  const responsive = useResponsive();
  const { getSpacing } = useResponsiveSpacing();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    padding: getSpacing(padding),
    margin: getSpacing(margin),
    ...(maxWidth && responsive.width > maxWidth ? {
      maxWidth,
      alignSelf: 'center',
      width: '100%',
    } : {}),
    ...(centerContent ? {
      justifyContent: 'center',
      alignItems: 'center',
    } : {}),
    ...style,
  };

  return <View style={containerStyle}>{children}</View>;
};

export default ResponsiveContainer;
