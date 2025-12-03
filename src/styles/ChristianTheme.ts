// Sistema de Design Cristão Unificado
export const ChristianTheme = {
  colors: {
    // Cores Primárias - Inspiradas na fé cristã
    primary: '#2E86AB',      // Azul celestial
    primaryDark: '#1E5D7D',  // Azul profundo
    primaryLight: '#4FA3C7', // Azul claro
    
    // Cores Secundárias
    secondary: '#8E44AD',    // Púrpura real (realeza de Cristo)
    secondaryDark: '#663399',
    secondaryLight: '#A569BD',
    
    // Cores de Apoio
    gold: '#F39C12',         // Ouro (divindade)
    goldDark: '#D68910',
    goldLight: '#F7DC6F',
    
    // Tons de Branco e Cinza
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F5',
    gray: '#E0E0E0',
    darkGray: '#757575',
    charcoal: '#424242',
    
    // Estados e Feedback
    success: '#27AE60',      // Verde esperança
    warning: '#F39C12',      // Laranja alerta
    error: '#E74C3C',        // Vermelho erro
    info: '#3498DB',         // Azul informação
    
    // Texto
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#FFFFFF',
    textMuted: '#9E9E9E',
    
    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Transparências
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    
    // Gradientes
    primaryGradient: ['#2E86AB', '#4FA3C7'],
    secondaryGradient: ['#8E44AD', '#A569BD'],
    goldGradient: ['#F39C12', '#F7DC6F'],
    holyGradient: ['#E8F4FD', '#FFFFFF'], // Gradiente sagrado
  },
  
  typography: {
    // Tamanhos de Fonte
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    
    // Pesos
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    
    // Alturas de Linha
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
    },
  },
  
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
    },
  },
};

export type ChristianThemeType = typeof ChristianTheme;
