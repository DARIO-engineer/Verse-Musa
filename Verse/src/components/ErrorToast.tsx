// src/components/ErrorToast.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/DesignSystem';

interface ErrorToastProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

const ErrorToast: React.FC<ErrorToastProps> = ({
  visible,
  message,
  type = 'error',
  onDismiss,
  duration = 5000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss após duração especificada
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: Colors.error,
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
          textColor: Colors.white,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning,
          icon: 'warning' as keyof typeof Ionicons.glyphMap,
          textColor: Colors.white,
        };
      case 'info':
        return {
          backgroundColor: Colors.info,
          icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
          textColor: Colors.white,
        };
      default:
        return {
          backgroundColor: Colors.error,
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
          textColor: Colors.white,
        };
    }
  };

  const config = getTypeConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: Spacing.lg,
        right: Spacing.lg,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={{
          backgroundColor: config.backgroundColor,
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: Colors.white,
        }}
      >
        <Ionicons 
          name={config.icon} 
          size={24} 
          color={config.textColor} 
          style={{ marginRight: Spacing.md }}
        />
        
        <View style={{ flex: 1 }}>
          <Text style={{
            color: config.textColor,
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
            lineHeight: Typography.fontSize.base * 1.4,
          }}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            marginLeft: Spacing.sm,
            padding: Spacing.xs,
          }}
        >
          <Ionicons 
            name="close" 
            size={20} 
            color={config.textColor} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ErrorToast;
