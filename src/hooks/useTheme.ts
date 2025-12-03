import { useSettings } from '../contexts/SettingsContext';
import { Colors } from '../styles/DesignSystem';

export const useTheme = () => {
  const { activeTheme } = useSettings();
  const isDark = activeTheme === 'dark';

  return {
    colors: {
      background: isDark ? Colors.backgroundDark : Colors.background,
      surface: isDark ? Colors.surfaceDark : Colors.surface,
      textPrimary: isDark ? Colors.textPrimaryDark : Colors.textPrimary,
      textSecondary: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
      border: isDark ? Colors.borderDark : Colors.border,
    },
    isDark,
  };
};
