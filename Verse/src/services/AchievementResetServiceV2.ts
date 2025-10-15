import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedAchievementService } from './EnhancedAchievementService';
import { AchievementViewService } from './AchievementViewService';
import { EnhancedProfileService } from './EnhancedProfileService';

export class AchievementResetServiceV2 {

  /**
   * Resetar completamente o sistema de conquistas
   * - Limpa todos os pontos/XP
   * - Remove status de desbloqueio de todas as conquistas
   * - Limpa histórico de visualizações (todas as conquistas voltam a aparecer como bloqueadas)
   * - Limpa cache para forçar atualização da UI
   */
  static async resetEntireAchievementSystem(): Promise<void> {
    try {
      console.log('🔄 Iniciando reset completo do sistema de conquistas...');

      // 1. Resetar progresso das conquistas (pontos/XP)
      await AsyncStorage.removeItem('@VersoEMusa:achievements_v2');
      console.log('✅ Progresso das conquistas resetado');

      // 2. Limpar histórico de visualizações (todas as conquistas voltam a aparecer como bloqueadas)
      await AsyncStorage.removeItem('achievement_views');
      console.log('✅ Histórico de visualizações limpo');

      // 3. Resetar pontos no perfil do usuário (se existir)
      const profileJson = await AsyncStorage.getItem('@VersoEMusa:profile');
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        const updatedProfile = {
          ...profile,
          totalPoints: 0,
          achievementPoints: 0,
          experiencePoints: 0,
          level: 1,
        };
        await AsyncStorage.setItem('@VersoEMusa:profile', JSON.stringify(updatedProfile));
        console.log('✅ Pontos do perfil resetados');
      }

      // 4. Limpar cache para forçar atualização da UI
      await this.clearCache();
      console.log('✅ Cache limpo - UI será atualizada');

      console.log('🎉 Sistema de conquistas completamente resetado!');
      console.log('📊 Todas as conquistas agora aparecem como bloqueadas novamente');
      console.log('💰 Todos os pontos/XP foram zerados');

    } catch (error) {
      console.error('❌ Erro ao resetar sistema de conquistas:', error);
      throw error;
    }
  }

  /**
   * Limpar cache para forçar atualização da UI
   */
  private static async clearCache(): Promise<void> {
    try {
      // Limpar caches relacionados a conquistas
      await AsyncStorage.removeItem('@VersoEMusa:achievement_cache');
      await AsyncStorage.removeItem('@VersoEMusa:achievement_stats_cache');
      await AsyncStorage.removeItem('@VersoEMusa:profile_cache');

      // Pequena pausa para garantir processamento
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('✅ Todos os caches relacionados a conquistas foram limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Resetar apenas os pontos/XP (mantém conquistas desbloqueadas)
   */
  static async resetPointsOnly(): Promise<void> {
    try {
      console.log('🔄 Resetando apenas pontos/XP...');

      // Resetar progresso das conquistas
      await AsyncStorage.removeItem('@VersoEMusa:achievements_v2');
      console.log('✅ Progresso das conquistas resetado');

      // Resetar pontos no perfil
      const profileJson = await AsyncStorage.getItem('@VersoEMusa:profile');
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        const updatedProfile = {
          ...profile,
          totalPoints: 0,
          achievementPoints: 0,
          experiencePoints: 0,
          level: 1,
        };
        await AsyncStorage.setItem('@VersoEMusa:profile', JSON.stringify(updatedProfile));
        console.log('✅ Pontos do perfil resetados');
      }

      // Limpar cache
      await this.clearCache();

      console.log('🎉 Pontos/XP resetados! Conquistas mantêm status de desbloqueio.');

    } catch (error) {
      console.error('❌ Erro ao resetar pontos:', error);
      throw error;
    }
  }

  /**
   * Resetar apenas o status de visualização (todas as conquistas desbloqueadas voltam a aparecer como bloqueadas)
   */
  static async resetViewStatusOnly(): Promise<void> {
    try {
      console.log('🔄 Resetando status de visualização...');

      // Limpar histórico de visualizações
      await AsyncStorage.removeItem('achievement_views');
      console.log('✅ Histórico de visualizações limpo');

      // Limpar cache
      await this.clearCache();

      console.log('🎉 Status de visualização resetado! Todas as conquistas desbloqueadas aparecerão como novas novamente.');

    } catch (error) {
      console.error('❌ Erro ao resetar status de visualização:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas antes do reset (para confirmação)
   */
  static async getResetStats(): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    totalPoints: number;
    viewedAchievements: number;
  }> {
    try {
      // Obter estatísticas das conquistas
      const achievementStats = await EnhancedAchievementService.getAchievementStats();

      // Obter estatísticas de visualização
      const viewStats = await AchievementViewService.getViewStats();

      return {
        totalAchievements: achievementStats.total,
        unlockedAchievements: achievementStats.unlocked,
        totalPoints: achievementStats.totalPoints,
        viewedAchievements: viewStats.totalViewed,
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        totalAchievements: 0,
        unlockedAchievements: 0,
        totalPoints: 0,
        viewedAchievements: 0,
      };
    }
  }
}

// Funções de conveniência para uso no console/debug
export const resetAllAchievementsV2 = () => AchievementResetServiceV2.resetEntireAchievementSystem();
export const resetPointsV2 = () => AchievementResetServiceV2.resetPointsOnly();
export const resetViewsV2 = () => AchievementResetServiceV2.resetViewStatusOnly();
export const getResetStatsV2 = () => AchievementResetServiceV2.getResetStats();
