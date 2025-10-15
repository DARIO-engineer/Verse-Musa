import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Appearance } from 'react-native';
import { SettingsService } from '../services/SettingsService';
import { Colors, getThemeColors } from '../styles/DesignSystem';

// Define os tipos de tema e cores de destaque
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'default' | 'nocturnal' | 'ethereal' | 'sunset' | 'ocean' | 'mystic' | 'minimalist' | 'vintage' | 'nature';
export type AccentColor = keyof typeof accentColors;

// Define as cores de destaque disponíveis - Photographic Memory theme
export const accentColors = {
  primary: Colors.primary, // #09868B - Deep teal-green
  secondary: Colors.secondary, // #3D7C47 - Dark green
  accent: Colors.accent, // #76C1D4 - Light blue
  nature: '#5a8a5e', // Nature green variant
  ocean: '#0fb8bf', // Ocean blue
  forest: '#2d5a34', // Deep forest green
  sky: '#8fd0e0', // Sky blue
  green: '#4CAF50', // Green color
  purple: '#9C27B0', // Purple color
  orange: '#FF9800', // Orange color
};

// Estende as configurações do app para incluir as novas opções
export interface EnhancedAppSettings {
  darkTheme: boolean;
  showLiricsMenu: boolean;
  showMusa: boolean; // Nova configuração para controlar a visibilidade da Musa
  autoSaveEnabled: boolean; // Nova configuração para controlar o salvamento automático
  themeMode: ThemeMode;
  themeVariant: ThemeVariant;
  accentColor: AccentColor;
}

interface SettingsContextType {
  settings: EnhancedAppSettings;
  updateSetting: <K extends keyof EnhancedAppSettings>(key: K, value: EnhancedAppSettings[K]) => Promise<void>;
  loading: boolean;
  activeTheme: 'light' | 'dark'; // Tema ativo (claro ou escuro), resolvido a partir do themeMode
  getThemeColors: () => any; // Função para obter as cores do tema ativo
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<EnhancedAppSettings>({
    darkTheme: false, // Mantido para compatibilidade, mas `themeMode` será a fonte da verdade
    showLiricsMenu: true,
    showMusa: false, // Musa oculta por padrão
  autoSaveEnabled: false, // Salvamento automático desativado por padrão
    themeMode: 'light', // Forçar light como padrão
    themeVariant: 'default', // Tema padrão
    accentColor: 'primary', // Novo: cor de destaque padrão
  });
  const [loading, setLoading] = useState(true);
  
  // Determina o tema ativo (light/dark) com base nas configurações e no sistema
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme() ?? 'light');
  
  // Lógica melhorada para determinar o tema ativo
  const activeTheme = React.useMemo(() => {
    if (settings.themeMode === 'light') return 'light';
    if (settings.themeMode === 'dark') return 'dark';
    if (settings.themeMode === 'system') return systemTheme;
    // Fallback para light se houver algum problema
    return 'light';
  }, [settings.themeMode, systemTheme]);

  useEffect(() => {
    loadSettings();

    // Listener para mudanças no tema do sistema
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme ?? 'light');
    });

    return () => subscription.remove();
  }, []); // Removed settings.themeMode from dependencies

  const loadSettings = async () => {
    try {
      // Carrega as configurações salvas, incluindo as novas
      const savedSettings = await SettingsService.loadSettings();
      setSettings(prev => ({ ...prev, ...savedSettings }));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof EnhancedAppSettings>(
    key: K,
    value: EnhancedAppSettings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      // Se o modo de tema for alterado, atualiza `darkTheme` para consistência
      if (key === 'themeMode') {
        newSettings.darkTheme = value === 'dark';
      }
      await SettingsService.saveSettings(newSettings); // Usa um método para salvar todas as configurações
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  };

  // Função para obter as cores do tema ativo
  const getActiveThemeColors = useMemo(() => {
    return () => getThemeColors(settings.themeVariant, activeTheme === 'dark');
  }, [settings.themeVariant, activeTheme]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loading, activeTheme, getThemeColors: getActiveThemeColors }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};
