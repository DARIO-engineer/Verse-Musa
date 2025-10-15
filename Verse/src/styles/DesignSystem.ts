// src/styles/DesignSystem.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette - "Inspirational Poetry" (Cores suaves e inspiradoras)
export const Colors = {
  // Primary Colors - Verde suave e natural
  primary: '#16A085', // Teal suave e agradável
  primaryDark: '#138D75', // Teal mais escuro
  primaryLight: '#48C9B0', // Teal mais claro
  
  // Secondary Colors - Azul sereno
  secondary: '#3498DB', // Azul inspirador
  secondaryDark: '#2980B9', // Azul mais escuro
  secondaryLight: '#5DADE2', // Azul mais claro
  
  // Accent Colors - Coral suave
  accent: '#E67E22', // Coral caloroso
  accentDark: '#D35400', // Coral mais escuro
  accentLight: '#F39C12', // Dourado suave
  
  // Category Colors - Harmoniosos e inspiradores
  poetry: '#16A085', // Teal suave
  jogral: '#3498DB', // Azul sereno
  sonnet: '#9B59B6', // Roxo suave
  reflection: '#E67E22', // Coral caloroso
  
  // Cores especiais para elementos premium
  premium: '#F39C12', // Dourado inspirador
  diamond: '#95A5A6', // Cinza suave
  platinum: '#BDC3C7', // Prata suave
  
  // Gradient Colors - Gradientes suaves e inspiradores
  gradientPrimary: ['#16A085', '#48C9B0', '#76D7C4'], // Verde suave
  gradientSecondary: ['#3498DB', '#5DADE2', '#85C1E9'], // Azul sereno
  gradientAccent: ['#E67E22', '#F39C12', '#F8C471'], // Coral dourado
  gradientSuccess: ['#27AE60', '#58D68D', '#82E0AA'], // Verde sucesso
  gradientPoetry: ['#16A085', '#3498DB', '#E67E22'], // Mix inspirador
  gradientNight: ['#2C3E50', '#34495E', '#5D6D7E'], // Escuro suave
  gradientSunset: ['#E67E22', '#F39C12', '#F7DC6F'], // Pôr do sol
  gradientOcean: ['#16A085', '#3498DB', '#5DADE2'], // Oceano sereno
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale - Suave e agradável
  gray50: '#FAFBFC',
  gray100: '#F4F6F8',
  gray200: '#E8ECEF',
  gray300: '#D5DBE1',
  gray400: '#BFC7CF',
  gray500: '#95A5A6',
  gray600: '#7F8C8D',
  gray700: '#5D6D7E',
  gray800: '#34495E',
  gray900: '#2C3E50',
  
  // Semantic Colors - Suaves e agradáveis
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Background Colors - Fundos suaves e agradáveis
  background: '#FDFDFD', // Branco muito suave
  backgroundDark: '#1A252F', // Escuro suave
  surface: '#FFFFFF', // Branco puro
  surfaceDark: '#243447', // Escuro médio suave
  
  // Text Colors - Textos suaves e legíveis
  textPrimary: '#2C3E50', // Escuro suave
  textSecondary: '#5D6D7E', // Cinza médio
  textDisabled: '#95A5A6', // Cinza claro
  textPrimaryDark: '#ECF0F1', // Claro suave
  textSecondaryDark: '#BDC3C7', // Cinza claro
  textDisabledDark: '#7F8C8D', // Cinza médio
  // Backwards-compatible aliases used across the codebase
  text: '#2C3E50',
  surfaceVariant: '#F4F6F8',
  
  // Border Colors - Suaves e discretas
  border: '#E8ECEF', // Cinza muito claro
  borderDark: '#34495E', // Escuro suave
  
  // Shadow Colors
  shadow: '#000000',
  
  // Modo Noturno Suave - Agradável aos olhos
  nocturnal: {
    background: '#1A252F', // Escuro suave
    surface: '#243447', // Escuro médio
    primary: '#48C9B0', // Verde suave claro
    secondary: '#5DADE2', // Azul suave claro
    accent: '#F8C471', // Dourado suave
    textPrimary: '#ECF0F1', // Branco suave
    textSecondary: '#BDC3C7', // Cinza claro suave
    border: '#34495E', // Borda escura suave
    gradientPrimary: ['#1A252F', '#243447'] as const,
    gradientSecondary: ['#48C9B0', '#5DADE2'] as const,
    gradientAccent: ['#F8C471', '#F39C12'] as const,
  },

  // Tema Amanhecer Sereno - Cores suaves e naturais
  ethereal: {
    background: '#F9F7F4', // Bege muito suave
    surface: '#FFFFFF',
    primary: '#16A085', // Verde suave
    secondary: '#3498DB', // Azul sereno
    accent: '#E67E22', // Coral caloroso
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#E8ECEF', // Borda suave
    gradientPrimary: ['#16A085', '#48C9B0'] as const,
    gradientSecondary: ['#3498DB', '#5DADE2'] as const,
    gradientAccent: ['#E67E22', '#F39C12'] as const,
  },

  // Tema Pôr do Sol Inspirador - Cores quentes e acolhedoras
  sunset: {
    background: '#FDF8F3', // Creme suave
    surface: '#FFFFFF',
    primary: '#E67E22', // Coral caloroso
    secondary: '#F39C12', // Dourado inspirador
    accent: '#16A085', // Verde de contraste
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#F4E6D7', // Borda creme
    gradientPrimary: ['#E67E22', '#F39C12'] as const,
    gradientSecondary: ['#F39C12', '#F7DC6F'] as const,
    gradientAccent: ['#16A085', '#48C9B0'] as const,
  },

  // Tema Oceano Tranquilo - Azuis serenos e relaxantes
  ocean: {
    background: '#F4F9FC', // Azul muito claro
    surface: '#FFFFFF',
    primary: '#3498DB', // Azul sereno
    secondary: '#5DADE2', // Azul claro
    accent: '#E67E22', // Coral de contraste
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#D6EAF8', // Borda azul clara
    gradientPrimary: ['#3498DB', '#5DADE2'] as const,
    gradientSecondary: ['#5DADE2', '#85C1E9'] as const,
    gradientAccent: ['#E67E22', '#F39C12'] as const,
  },

  // Tema Jardim Místico - Roxos e verdes suaves
  mystic: {
    background: '#F7F5F9', // Roxo muito claro
    surface: '#FFFFFF',
    primary: '#9B59B6', // Roxo suave
    secondary: '#16A085', // Verde suave
    accent: '#F39C12', // Dourado
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#E8DAEF', // Borda roxa clara
    gradientPrimary: ['#9B59B6', '#BB8FCE'] as const,
    gradientSecondary: ['#16A085', '#48C9B0'] as const,
    gradientAccent: ['#F39C12', '#F7DC6F'] as const,
  },
  
  // Tema Minimalista Limpo - Branco puro e acentos suaves
  minimalist: {
    background: '#FEFEFE', // Branco quase puro
    surface: '#FFFFFF',
    primary: '#2C3E50', // Escuro elegante
    secondary: '#16A085', // Verde suave
    accent: '#E67E22', // Coral caloroso
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#E8ECEF', // Borda muito suave
    gradientPrimary: ['#2C3E50', '#34495E'] as const,
    gradientSecondary: ['#16A085', '#48C9B0'] as const,
    gradientAccent: ['#E67E22', '#F39C12'] as const,
  },
  
  // Tema Papel Vintage - Tons terrosos e acolhedores
  vintage: {
    background: '#F8F6F0', // Creme vintage
    surface: '#FFFFFF',
    primary: '#8B4513', // Marrom vintage
    secondary: '#CD853F', // Dourado vintage
    accent: '#16A085', // Verde de contraste
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#E6DDD4', // Borda vintage
    gradientPrimary: ['#8B4513', '#CD853F'] as const,
    gradientSecondary: ['#CD853F', '#F4E4BC'] as const,
    gradientAccent: ['#16A085', '#48C9B0'] as const,
  },
  
  // Tema Natureza Fresca - Verdes naturais e revigorantes
  nature: {
    background: '#F8FDF8', // Verde muito claro
    surface: '#FFFFFF',
    primary: '#27AE60', // Verde natural
    secondary: '#16A085', // Verde suave
    accent: '#F39C12', // Dourado natural
    textPrimary: '#2C3E50', // Escuro suave
    textSecondary: '#5D6D7E', // Cinza médio
    border: '#E8F5E8', // Borda verde clara
    gradientPrimary: ['#27AE60', '#58D68D'] as const,
    gradientSecondary: ['#16A085', '#48C9B0'] as const,
    gradientAccent: ['#F39C12', '#F7DC6F'] as const,
  },
};

// Typography
export const Typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadows - Modernizadas para efeito mais suave e elegante
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  base: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  // Novo efeito de sombra para elementos destacados
  highlight: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
};

// Layout
export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isLargeDevice: width >= 414,
  
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Header heights
  headerHeight: 60,
  tabBarHeight: 80,
};

// Animation - Expandidas para mais opções
export const Animation = {
  duration: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 800,
  },
  
  easing: {
    linear: 'linear' as const,
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
    // Adicionais para React Native Animated
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' as const,
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)' as const,
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)' as const,
  },
  
  // Presets de animação para React Native Animated
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { translateY: 20, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    },
    scale: {
      from: { scale: 0.95, opacity: 0 },
      to: { scale: 1, opacity: 1 },
    },
  },
};

// Common Styles
export const CommonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  containerDark: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // Cards - Modernizados
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.base,
  },
  
  cardDark: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.base,
  },
  
  cardElevated: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.md,
  },
  
  cardHighlight: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.highlight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  cardPoetry: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.poetry,
  },
  
  // Text Styles - Modernizados
  heading1: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize['4xl'] * Typography.lineHeight.tight,
    letterSpacing: -0.5,
  },
  
  heading2: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
    letterSpacing: -0.3,
  },
  
  heading3: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.tight,
  },
  
  heading4: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
  },
  
  bodyLarge: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
  },
  
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  
  bodySmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
  },
  
  // Novos estilos de texto
  poetryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  
  quote: {
    fontSize: Typography.fontSize.base,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  
  highlight: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  
  // Button Styles - Expandidos
  buttonBase: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.sm,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.sm,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Input Styles - Melhorados
  inputBase: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadows.sm,
  },
  
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  
  inputDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray300,
    color: Colors.textDisabled,
  },
  
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  
  inputErrorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  
  // Utility Classes - Expandidos
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  flex1: {
    flex: 1,
  },
  
  flexWrap: {
    flexWrap: 'wrap',
  },
  
  flexGrow: {
    flexGrow: 1,
  },
  
  selfCenter: {
    alignSelf: 'center',
  },
  
  selfStart: {
    alignSelf: 'flex-start',
  },
  
  selfEnd: {
    alignSelf: 'flex-end',
  },
  
  // Margins
  mt1: { marginTop: Spacing.xs },
  mt2: { marginTop: Spacing.sm },
  mt3: { marginTop: Spacing.md },
  mt4: { marginTop: Spacing.base },
  mt5: { marginTop: Spacing.lg },
  mt6: { marginTop: Spacing.xl },
  
  mb1: { marginBottom: Spacing.xs },
  mb2: { marginBottom: Spacing.sm },
  mb3: { marginBottom: Spacing.md },
  mb4: { marginBottom: Spacing.base },
  mb5: { marginBottom: Spacing.lg },
  mb6: { marginBottom: Spacing.xl },
  
  // Paddings
  p1: { padding: Spacing.xs },
  p2: { padding: Spacing.sm },
  p3: { padding: Spacing.md },
  p4: { padding: Spacing.base },
  p5: { padding: Spacing.lg },
  p6: { padding: Spacing.xl },
  
  px1: { paddingHorizontal: Spacing.xs },
  px2: { paddingHorizontal: Spacing.sm },
  px3: { paddingHorizontal: Spacing.md },
  px4: { paddingHorizontal: Spacing.base },
  px5: { paddingHorizontal: Spacing.lg },
  px6: { paddingHorizontal: Spacing.xl },
  
  py1: { paddingVertical: Spacing.xs },
  py2: { paddingVertical: Spacing.sm },
  py3: { paddingVertical: Spacing.md },
  py4: { paddingVertical: Spacing.base },
  py5: { paddingVertical: Spacing.lg },
  py6: { paddingVertical: Spacing.xl },
});
// Allow attaching helpers at runtime and relax typing for legacy usages
(CommonStyles as any).helpers = (CommonStyles as any).helpers || {};

// Theme Types
export type ThemeVariant = 'default' | 'nocturnal' | 'ethereal' | 'sunset' | 'ocean' | 'mystic' | 'minimalist' | 'vintage' | 'nature';

// Theme Helper Function
export const getThemeColors = (theme: ThemeVariant, isDark: boolean) => {
  switch (theme) {
    case 'nocturnal':
      return Colors.nocturnal;
    case 'ethereal':
      return Colors.ethereal;
    case 'sunset':
      return Colors.sunset;
    case 'ocean':
      return Colors.ocean;
    case 'mystic':
      return Colors.mystic;
    case 'minimalist':
      return Colors.minimalist;
    case 'vintage':
      return Colors.vintage;
    case 'nature':
      return Colors.nature;
    default:
      return isDark ? Colors.nocturnal : {
        background: Colors.background,
        surface: Colors.surface,
        primary: Colors.primary,
        secondary: Colors.secondary,
        accent: Colors.accent,
        textPrimary: Colors.textPrimary,
        textSecondary: Colors.textSecondary,
        border: Colors.border,
        gradientPrimary: Colors.gradientPrimary,
        gradientSecondary: Colors.gradientSecondary,
        gradientAccent: Colors.gradientAccent,
      };
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Poesia': return Colors.poetry;
    case 'Jogral': return Colors.jogral;
    case 'Soneto': return Colors.sonnet;
    default: return Colors.primary;
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Poesia': return 'book-outline';
    case 'Jogral': return 'mic-outline';
    case 'Soneto': return 'library-outline';
    default: return 'document-text-outline';
  }
};

// Theme Helper Functions
export const getThemeName = (theme: ThemeVariant) => {
  switch (theme) {
    case 'default':
      return 'Inspiração Clássica';
    case 'nocturnal':
      return 'Noite Suave';
    case 'ethereal':
      return 'Amanhecer Sereno';
    case 'sunset':
      return 'Pôr do Sol Inspirador';
    case 'ocean':
      return 'Oceano Tranquilo';
    case 'mystic':
      return 'Jardim Místico';
    case 'minimalist':
      return 'Minimalista Limpo';
    case 'vintage':
      return 'Papel Vintage';
    case 'nature':
      return 'Natureza Fresca';
    default:
      return 'Inspiração Clássica';
  }
};

export const getThemeDescription = (theme: ThemeVariant) => {
  switch (theme) {
    case 'default':
      return 'Cores equilibradas e inspiradoras — verde suave, azul sereno e coral caloroso para uma experiência agradável.';
    case 'nocturnal':
      return 'Modo noturno suave com tons escuros confortáveis e acentos claros que não cansam a vista.';
    case 'ethereal':
      return 'Tons naturais e serenos que inspiram tranquilidade e criatividade em harmonia.';
    case 'sunset':
      return 'Cores quentes e acolhedoras que despertam inspiração e aquecem o coração criativo.';
    case 'ocean':
      return 'Azuis tranquilos e relaxantes como as águas serenas, perfeitos para momentos contemplativos.';
    case 'mystic':
      return 'Combinação mística de roxos suaves e verdes naturais para uma experiência única.';
    case 'minimalist':
      return 'Design limpo e elegante com foco na simplicidade e clareza visual.';
    case 'vintage':
      return 'Tons terrosos e acolhedores que remetem ao charme clássico do papel antigo.';
    case 'nature':
      return 'Verdes frescos e naturais que conectam você com a energia revigorante da natureza.';
    default:
      return 'Tema equilibrado e inspirador para uma experiência poética agradável.';
  }
};

export const getAllThemes = (): { key: ThemeVariant, name: string, description: string, colors: any }[] => {
  const themes: ThemeVariant[] = ['default', 'ethereal', 'sunset', 'ocean', 'mystic', 'minimalist', 'vintage', 'nature', 'nocturnal'];
  return themes.map(theme => ({
    key: theme,
    name: getThemeName(theme),
    description: getThemeDescription(theme),
    colors: getThemeColors(theme, false)
  }));
};

// Função para obter o gradiente da categoria
export const getCategoryGradient = (category: string): string[] => {
  switch (category) {
    case 'Poesia': return Colors.gradientPrimary;
    case 'Jogral': return Colors.gradientSecondary;
    case 'Soneto': return ['#9D3FD9', '#C78FFF'];
    default: return Colors.gradientPrimary;
  }
};

// Função para obter o emoji da categoria
export const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'Poesia': return '📝';
    case 'Jogral': return '🎭';
    case 'Soneto': return '🎵';
    default: return '📄';
  }
};

// Função para obter a descrição da categoria
export const getCategoryDescription = (category: string): string => {
  switch (category) {
    case 'Poesia': return 'Expressão livre de sentimentos e ideias através de versos';
    case 'Jogral': return 'Poesia para ser recitada por duas ou mais vozes alternadas';
    case 'Soneto': return 'Forma poética tradicional com 14 versos e estrutura definida';
    default: return 'Forma de expressão poética';
  }
};