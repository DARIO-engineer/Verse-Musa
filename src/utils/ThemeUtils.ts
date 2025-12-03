// src/utils/ThemeUtils.ts
import { getThemeColors, ThemeVariant } from '../styles/DesignSystem';

// Função global para obter cores do tema
export const getGlobalThemeColors = (themeVariant: ThemeVariant = 'default', isDark: boolean = false) => {
  return getThemeColors(themeVariant, isDark);
};

// Função para verificar se um tema é escuro
export const isThemeDark = (themeVariant: ThemeVariant): boolean => {
  return themeVariant === 'nocturnal';
};

// Função para obter o tema padrão baseado no modo
export const getDefaultTheme = (isDark: boolean): ThemeVariant => {
  return isDark ? 'nocturnal' : 'default';
};
