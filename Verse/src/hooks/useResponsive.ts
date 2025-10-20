import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// Breakpoints baseados em tamanhos comuns de dispositivos
export const BREAKPOINTS = {
  xs: 320,  // Pequenos smartphones
  sm: 375,  // iPhone SE, iPhone 12 mini
  md: 414,  // iPhone 11, iPhone 12
  lg: 768,  // Tablets pequenos
  xl: 1024, // Tablets grandes
  xxl: 1280, // Tablets muito grandes / Desktop
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isXS: boolean;
  isSM: boolean;
  isMD: boolean;
  isLG: boolean;
  isXL: boolean;
  isXXL: boolean;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const aspectRatio = width / height;
  const orientation = width > height ? 'landscape' : 'portrait';

  return {
    width,
    height,
    isXS: width < BREAKPOINTS.sm,
    isSM: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isMD: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLG: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isXL: width >= BREAKPOINTS.xl && width < BREAKPOINTS.xxl,
    isXXL: width >= BREAKPOINTS.xxl,
    isSmallDevice: width < BREAKPOINTS.md,
    isMediumDevice: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLargeDevice: width >= BREAKPOINTS.lg,
    isTablet: width >= BREAKPOINTS.lg,
    orientation,
    aspectRatio,
  };
};

// Hook para valores responsivos baseados em breakpoints
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
  default: T;
}): T => {
  const responsive = useResponsive();

  if (responsive.isXXL && values.xxl !== undefined) return values.xxl;
  if (responsive.isXL && values.xl !== undefined) return values.xl;
  if (responsive.isLG && values.lg !== undefined) return values.lg;
  if (responsive.isMD && values.md !== undefined) return values.md;
  if (responsive.isSM && values.sm !== undefined) return values.sm;
  if (responsive.isXS && values.xs !== undefined) return values.xs;

  return values.default;
};

// Hook para espaçamento responsivo
export const useResponsiveSpacing = () => {
  const responsive = useResponsive();

  const getSpacing = (base: number): number => {
    if (responsive.isXS) return base * 0.75;
    if (responsive.isSM) return base * 0.875;
    if (responsive.isLargeDevice) return base * 1.25;
    return base;
  };

  const getFontSize = (base: number): number => {
    if (responsive.isXS) return base * 0.9;
    if (responsive.isSM) return base * 0.95;
    if (responsive.isLargeDevice) return base * 1.1;
    return base;
  };

  return {
    getSpacing,
    getFontSize,
    responsive,
  };
};

export default useResponsive;
