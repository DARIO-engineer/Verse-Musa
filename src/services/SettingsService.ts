import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedAppSettings } from '../contexts/SettingsContext'; // Importa a nova interface
import { JsonUtils } from '../utils/JsonUtils';
import { getAllThemes } from '../styles/DesignSystem';

const SETTINGS_KEY = '@VersoEMusa:app_settings';

// Define as configurações padrão com os novos campos de tema
const defaultSettings: EnhancedAppSettings = {
  darkTheme: false,
  showLiricsMenu: true,
  showMusa: false, // Adicionado para compatibilidade com EnhancedAppSettings
  autoSaveEnabled: false, // Novo: Salvamento automático desativado por padrão
  themeMode: 'system', // Padrão é o tema do sistema
  themeVariant: 'neoMint', // Adicionado para compatibilidade com EnhancedAppSettings
  accentColor: 'primary', // Padrão é a cor primária
};

export class SettingsService {
  // Carrega todas as configurações
  static async loadSettings(): Promise<EnhancedAppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      
      // Usar safe parse com valor padrão
      const savedSettings = JsonUtils.safeParseWithDefault<Partial<EnhancedAppSettings>>(settingsJson, {});
      
      // Se o themeVariant salvo não estiver na lista de temas suportados, ajustar para o padrão
      const availableThemes = getAllThemes().map(t => t.key);
      if (savedSettings.themeVariant && !availableThemes.includes(savedSettings.themeVariant as any)) {
        savedSettings.themeVariant = defaultSettings.themeVariant;
      }

      // Garantir que autoSaveEnabled esteja definido (não confiar apenas no merge se o valor for undefined)
      if (typeof savedSettings.autoSaveEnabled === 'undefined') {
        savedSettings.autoSaveEnabled = defaultSettings.autoSaveEnabled;
      }

      // Combina as configurações salvas com as padrão para garantir que todos os campos existam
      return { ...defaultSettings, ...savedSettings };
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  }

  // Salva o objeto de configurações completo
  static async saveSettings(settings: EnhancedAppSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(SETTINGS_KEY, settingsJson);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Falha ao salvar configurações');
    }
  }

  // Reseta as configurações para o padrão
  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      throw new Error('Falha ao resetar configurações');
    }
  }
}
