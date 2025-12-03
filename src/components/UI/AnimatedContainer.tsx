import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animateIn = () => {
      const animations: Animated.CompositeAnimation[] = [];

      switch (animation) {
        case 'fadeIn':
          animations.push(
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            })
          );
          break;

        case 'slideUp':
          translateValue.setValue(50);
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateValue, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideDown':
          translateValue.setValue(-50);
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateValue, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideLeft':
          translateValue.setValue(50);
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateValue, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'slideRight':
          translateValue.setValue(-50);
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(translateValue, {
                toValue: 0,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'scale':
          animations.push(
            Animated.parallel([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(scaleValue, {
                toValue: 1,
                duration,
                useNativeDriver: true,
              }),
            ])
          );
          break;

        case 'bounce':
          animations.push(
            Animated.sequence([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration * 0.6,
                useNativeDriver: true,
              }),
              Animated.spring(scaleValue, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }

      if (delay > 0) {
        setTimeout(() => {
          Animated.parallel(animations).start();
        }, delay);
      } else {
        Animated.parallel(animations).start();
      }
    };

    animateIn();
  }, [animation, duration, delay]);

  const getAnimatedStyle = () => {
    const baseStyle = {
      opacity: animatedValue,
    };

    switch (animation) {
      case 'slideUp':
      case 'slideDown':
        return {
          ...baseStyle,
          transform: [{ translateY: translateValue }],
        };

      case 'slideLeft':
      case 'slideRight':
        return {
          ...baseStyle,
          transform: [{ translateX: translateValue }],
        };

      case 'scale':
      case 'bounce':
        return {
          ...baseStyle,
          transform: [{ scale: scaleValue }],
        };

      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedContainer;
