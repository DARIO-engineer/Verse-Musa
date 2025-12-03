import { Dimensions, PixelRatio } from 'react-native';
import { BREAKPOINTS } from '../hooks/useResponsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Função para escalar baseado na densidade de pixels
export const scale = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * PixelRatio.get());
};

// Função para escalar verticalmente
export const verticalScale = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * (SCREEN_HEIGHT / 812)); // Base: iPhone 11 Pro
};

// Função para escalar moderadamente (híbrido)
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Utilitários para responsividade
export class ResponsiveUtils {
  static get screenWidth() {
    return SCREEN_WIDTH;
  }

  static get screenHeight() {
    return SCREEN_HEIGHT;
  }

  static get isSmallDevice() {
    return SCREEN_WIDTH < BREAKPOINTS.md;
  }

  static get isMediumDevice() {
    return SCREEN_WIDTH >= BREAKPOINTS.md && SCREEN_WIDTH < BREAKPOINTS.lg;
  }

  static get isLargeDevice() {
    return SCREEN_WIDTH >= BREAKPOINTS.lg;
  }

  static get isTablet() {
    return SCREEN_WIDTH >= BREAKPOINTS.lg;
  }

  // Função para obter padding responsivo
  static getResponsivePadding(base: number): number {
    if (this.isSmallDevice) return base * 0.8;
    if (this.isLargeDevice) return base * 1.2;
    return base;
  }

  // Função para obter font size responsivo
  static getResponsiveFontSize(base: number): number {
    if (this.isSmallDevice) return base * 0.9;
    if (this.isLargeDevice) return base * 1.1;
    return base;
  }

  // Função para obter número de colunas baseado na largura
  static getColumns(itemWidth: number, spacing: number = 16): number {
    const availableWidth = SCREEN_WIDTH - (spacing * 2);
    const columns = Math.floor(availableWidth / (itemWidth + spacing));
    return Math.max(1, columns);
  }

  // Função para obter largura de item em grid
  static getItemWidth(columns: number, spacing: number = 16): number {
    const totalSpacing = spacing * (columns + 1);
    return (SCREEN_WIDTH - totalSpacing) / columns;
  }

  // Função para adaptar layout baseado na orientação
  static getLayoutForOrientation() {
    const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
    return {
      isLandscape,
      isPortrait: !isLandscape,
      columns: isLandscape ? (this.isTablet ? 3 : 2) : (this.isTablet ? 2 : 1),
    };
  }

  // Função para obter espaçamento baseado no dispositivo
  static getDeviceSpacing() {
    if (this.isSmallDevice) {
      return {
        xs: 3,
        sm: 6,
        md: 9,
        base: 12,
        lg: 15,
        xl: 18,
      };
    }
    
    if (this.isLargeDevice) {
      return {
        xs: 6,
        sm: 12,
        md: 18,
        base: 24,
        lg: 30,
        xl: 36,
      };
    }

    // Dispositivos médios (padrão)
    return {
      xs: 4,
      sm: 8,
      md: 12,
      base: 16,
      lg: 20,
      xl: 24,
    };
  }

  // Função para obter tipografia responsiva
  static getResponsiveTypography() {
    const baseFontSize = this.getResponsiveFontSize(16);
    
    return {
      xs: baseFontSize * 0.75,      // 12px
      sm: baseFontSize * 0.875,     // 14px
      base: baseFontSize,           // 16px
      lg: baseFontSize * 1.125,     // 18px
      xl: baseFontSize * 1.25,      // 20px
      '2xl': baseFontSize * 1.5,    // 24px
      '3xl': baseFontSize * 1.75,   // 28px
      '4xl': baseFontSize * 2,      // 32px
      '5xl': baseFontSize * 2.25,   // 36px
      '6xl': baseFontSize * 3,      // 48px
    };
  }

  // Função para obter border radius responsivo
  static getResponsiveBorderRadius() {
    const baseRadius = this.isSmallDevice ? 6 : this.isLargeDevice ? 10 : 8;
    
    return {
      none: 0,
      sm: baseRadius * 0.5,
      base: baseRadius,
      md: baseRadius * 1.5,
      lg: baseRadius * 2,
      xl: baseRadius * 2.5,
      '2xl': baseRadius * 3,
      '3xl': baseRadius * 4,
      full: 9999,
    };
  }

  // Função para verificar se é um dispositivo com notch
  static get hasNotch() {
    return SCREEN_HEIGHT >= 812 && SCREEN_WIDTH >= 375;
  }

  // Função para obter safe area padding
  static getSafeAreaPadding() {
    return {
      top: this.hasNotch ? 44 : 20,
      bottom: this.hasNotch ? 34 : 0,
    };
  }
}

export default ResponsiveUtils;
