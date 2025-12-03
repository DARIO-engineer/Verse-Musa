// Sistema de Cores Profissional - Verse App
// Paleta coesa e harmoniosa baseada em princípios de design

export const ProfessionalColors = {
  // === PALETA PRINCIPAL CRISTOCÊNTRICA ===
  
  // Azul Celestial (Cor Primária) - Representa divindade, paz, confiança
  primary: {
    50: '#EBF4FF',   // Muito claro
    100: '#C3DAFE',  // Claro
    200: '#A3BFFA',  // Médio claro
    300: '#7C9EF8',  // Médio
    400: '#5A7DF5',  // Médio escuro
    500: '#4F46E5',  // Principal
    600: '#4338CA',  // Escuro
    700: '#3730A3',  // Muito escuro
    800: '#312E81',  // Ultra escuro
    900: '#1E1B4B',  // Mais escuro
  },

  // Dourado Sagrado (Cor Secundária) - Representa preciosidade, iluminação
  secondary: {
    50: '#FFFBEB',   // Muito claro
    100: '#FEF3C7',  // Claro
    200: '#FDE68A',  // Médio claro
    300: '#FCD34D',  // Médio
    400: '#FBBF24',  // Médio escuro
    500: '#F59E0B',  // Principal
    600: '#D97706',  // Escuro
    700: '#B45309',  // Muito escuro
    800: '#92400E',  // Ultra escuro
    900: '#78350F',  // Mais escuro
  },

  // Verde Esperança (Cor de Apoio) - Representa vida, crescimento, esperança
  accent: {
    50: '#ECFDF5',   // Muito claro
    100: '#D1FAE5',  // Claro
    200: '#A7F3D0',  // Médio claro
    300: '#6EE7B7',  // Médio
    400: '#34D399',  // Médio escuro
    500: '#10B981',  // Principal
    600: '#059669',  // Escuro
    700: '#047857',  // Muito escuro
    800: '#065F46',  // Ultra escuro
    900: '#064E3B',  // Mais escuro
  },

  // Roxo Místico (Cor Especial) - Representa criatividade, inspiração
  mystic: {
    50: '#FAF5FF',   // Muito claro
    100: '#F3E8FF',  // Claro
    200: '#E9D5FF',  // Médio claro
    300: '#D8B4FE',  // Médio
    400: '#C084FC',  // Médio escuro
    500: '#A855F7',  // Principal
    600: '#9333EA',  // Escuro
    700: '#7C2D12',  // Muito escuro
    800: '#6B21A8',  // Ultra escuro
    900: '#581C87',  // Mais escuro
  },

  // === CORES NEUTRAS PROFISSIONAIS ===
  
  // Escala de Cinzas Equilibrada
  gray: {
    50: '#F9FAFB',   // Quase branco
    100: '#F3F4F6',  // Muito claro
    200: '#E5E7EB',  // Claro
    300: '#D1D5DB',  // Médio claro
    400: '#9CA3AF',  // Médio
    500: '#6B7280',  // Principal
    600: '#4B5563',  // Escuro
    700: '#374151',  // Muito escuro
    800: '#1F2937',  // Ultra escuro
    900: '#111827',  // Mais escuro
  },

  // Cores Semânticas Profissionais
  semantic: {
    success: '#10B981',    // Verde sucesso
    warning: '#F59E0B',    // Amarelo aviso
    error: '#EF4444',      // Vermelho erro
    info: '#3B82F6',       // Azul informação
  },

  // === GRADIENTES HARMONIOSOS ===
  
  gradients: {
    // Gradiente Principal (Azul Celestial)
    primary: ['#4F46E5', '#7C3AED', '#A855F7'],
    
    // Gradiente Dourado (Inspiração Divina)
    golden: ['#F59E0B', '#FBBF24', '#FCD34D'],
    
    // Gradiente Esperança (Verde Vida)
    hope: ['#10B981', '#34D399', '#6EE7B7'],
    
    // Gradiente Místico (Roxo Criativo)
    mystic: ['#A855F7', '#C084FC', '#D8B4FE'],
    
    // Gradiente Celestial (Azul + Dourado)
    celestial: ['#4F46E5', '#7C3AED', '#F59E0B'],
    
    // Gradiente Natureza (Verde + Azul)
    nature: ['#10B981', '#3B82F6', '#4F46E5'],
    
    // Gradiente Pôr do Sol (Dourado + Roxo)
    sunset: ['#F59E0B', '#FBBF24', '#A855F7'],
    
    // Gradiente Noturno (Escuros)
    night: ['#1F2937', '#374151', '#4B5563'],
  },

  // === TEMAS ESPECÍFICOS ===
  
  themes: {
    // Tema Claro (Padrão)
    light: {
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceVariant: '#F3F4F6',
      primary: '#4F46E5',
      secondary: '#F59E0B',
      accent: '#10B981',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    
    // Tema Escuro (Noturno)
    dark: {
      background: '#111827',
      surface: '#1F2937',
      surfaceVariant: '#374151',
      primary: '#7C3AED',
      secondary: '#FBBF24',
      accent: '#34D399',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      border: '#4B5563',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    
    // Tema Cristão (Especial)
    christian: {
      background: '#FFFBEB',
      surface: '#FFFFFF',
      surfaceVariant: '#FEF3C7',
      primary: '#4F46E5',
      secondary: '#F59E0B',
      accent: '#10B981',
      textPrimary: '#78350F',
      textSecondary: '#92400E',
      textTertiary: '#B45309',
      border: '#FDE68A',
      shadow: 'rgba(245, 158, 11, 0.1)',
    },
  },

  // === CORES POR CATEGORIA ===
  
  categories: {
    poesia: {
      primary: '#4F46E5',
      gradient: ['#4F46E5', '#7C3AED'],
      light: '#EBF4FF',
      dark: '#312E81',
    },
    soneto: {
      primary: '#A855F7',
      gradient: ['#A855F7', '#C084FC'],
      light: '#FAF5FF',
      dark: '#581C87',
    },
    jogral: {
      primary: '#10B981',
      gradient: ['#10B981', '#34D399'],
      light: '#ECFDF5',
      dark: '#064E3B',
    },
    versoLivre: {
      primary: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      light: '#FFFBEB',
      dark: '#78350F',
    },
  },

  // === UTILITÁRIOS ===
  
  // Cores com Opacidade
  withOpacity: (color: string, opacity: number) => {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  // Cores Puras
  pure: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
};

// === FUNÇÕES AUXILIARES ===

export const getThemeColors = (isDark: boolean = false) => {
  return isDark ? ProfessionalColors.themes.dark : ProfessionalColors.themes.light;
};

export const getCategoryColor = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    'poesia': ProfessionalColors.categories.poesia,
    'soneto': ProfessionalColors.categories.soneto,
    'jogral': ProfessionalColors.categories.jogral,
    'verso livre': ProfessionalColors.categories.versoLivre,
    'verso_livre': ProfessionalColors.categories.versoLivre,
  };
  
  return categoryMap[category.toLowerCase()] || ProfessionalColors.categories.poesia;
};

export const getGradientForCategory = (category: string): string[] => {
  const categoryColor = getCategoryColor(category);
  return categoryColor.gradient;
};

// === CONSTANTES DE DESIGN ===

export const DesignTokens = {
  // Espaçamentos Harmoniosos (Escala 8pt)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },
  
  // Raios de Borda Consistentes
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  // Sombras Profissionais
  shadows: {
    sm: {
      shadowColor: ProfessionalColors.pure.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: ProfessionalColors.pure.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: ProfessionalColors.pure.black,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 6,
    },
    xl: {
      shadowColor: ProfessionalColors.pure.black,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.2,
      shadowRadius: 25,
      elevation: 10,
    },
  },
  
  // Tipografia Harmoniosa
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
};

export default ProfessionalColors;
