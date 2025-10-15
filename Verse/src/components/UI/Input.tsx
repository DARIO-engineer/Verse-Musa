// src/components/UI/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, CommonStyles, Shadows } from '../../styles/DesignSystem';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [animatedValue] = useState(new Animated.Value(0));

  // Animar o foco do input
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  const getContainerStyle = (): ViewStyle => ({
    marginBottom: Spacing.base,
  });

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: disabled ? Colors.gray100 : Colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: isFocused ? 2 : 1,
      borderColor: error ? Colors.error : isFocused ? Colors.primary : Colors.border,
      paddingHorizontal: Spacing.base,
      paddingVertical: multiline ? Spacing.md : Spacing.sm,
      minHeight: multiline ? 80 : 48,
      ...Shadows.sm,
    };

    if (disabled) {
      return {
        ...baseStyle,
        borderColor: Colors.gray300,
        backgroundColor: Colors.gray100,
        ...Shadows.none,
      };
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: disabled ? Colors.textDisabled : Colors.textPrimary,
    paddingVertical: 0,
    textAlignVertical: multiline ? 'top' : 'center',
  });

  const getLabelStyle = (): TextStyle => {
    const interpolatedColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.textSecondary, Colors.primary]
    });

    return {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      color: error ? Colors.error : isFocused ? Colors.primary : Colors.textSecondary,
      marginBottom: Spacing.xs,
    };
  };

  const getErrorStyle = (): TextStyle => ({
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  });

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getRightIconName = () => {
    if (secureTextEntry) {
      return isPasswordVisible ? 'eye-off-outline' : 'eye-outline';
    }
    return rightIcon;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {label && <Animated.Text style={getLabelStyle()}>{label}</Animated.Text>}
      
      <Animated.View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={error ? Colors.error : isFocused ? Colors.primary : Colors.textSecondary} 
            style={{ marginRight: Spacing.sm }}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity 
            onPress={handleRightIconPress}
            style={{ marginLeft: Spacing.sm }}
            disabled={!secureTextEntry && !onRightIconPress}
          >
            <Ionicons 
              name={getRightIconName()!} 
              size={20} 
              color={error ? Colors.error : isFocused ? Colors.primary : Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.Text style={getErrorStyle()}>
          <Ionicons name="alert-circle-outline" size={12} color={Colors.error} /> {error}
        </Animated.Text>
      )}
    </View>
  );
};

export default Input;