import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedAchievementService } from './EnhancedAchievementService';
import { AchievementViewService } from './AchievementViewService';
import { EnhancedProfileService } from './EnhancedProfileService';

export class AchievementResetService {

  /**
   * Resetar completamente o sistema de conquistas
   * - Limpa todos os pontos/XP
   * - Remove status de desbloqueio de todas as conquistas
   * - Limpa histórico de visualizações (todas as conquistas voltam a aparecer como bloqueadas)
   */
  static async resetEntireAchievementSystem(): Promise<void> {
    try {
      console.log('🔄 Iniciando reset completo do sistema de conquistas...');

      // 1. Resetar progresso das conquistas (pontos/XP)
      await EnhancedAchievementService.resetAchievements();
      console.log('✅ Progresso das conquistas resetado');

      // 2. Limpar histórico de visualizações (todas as conquistas voltam a aparecer como bloqueadas)
      await AchievementViewService.clearViewHistory();
      console.log('✅ Histórico de visualizações limpo');

      // 3. Resetar pontos no perfil do usuário (se existir)
      await this.resetProfilePoints();
      console.log('✅ Pontos do perfil resetados');

      console.log('🎉 Sistema de conquistas completamente resetado!');
      console.log('📊 Todas as conquistas agora aparecem como bloqueadas novamente');
      console.log('💰 Todos os pontos/XP foram zerados');

    } catch (error) {
      console.error('❌ Erro ao resetar sistema de conquistas:', error);
      throw error;
    }
  }

  /**
   * Resetar apenas os pontos/XP (mantém conquistas desbloqueadas)
   */
  static async resetPointsOnly(): Promise<void> {
    try {
      console.log('🔄 Resetando apenas pontos/XP...');

      // Resetar progresso das conquistas
      await EnhancedAchievementService.resetAchievements();
      console.log('✅ Progresso das conquistas resetado');

      // Resetar pontos no perfil
      await this.resetProfilePoints();
      console.log('✅ Pontos do perfil resetados');

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
      await AchievementViewService.clearViewHistory();
      console.log('✅ Histórico de visualizações limpo');

      console.log('🎉 Status de visualização resetado! Todas as conquistas desbloqueadas aparecerão como novas novamente.');

    } catch (error) {
      console.error('❌ Erro ao resetar status de visualização:', error);
      throw error;
    }
  }

  /**
   * Resetar pontos no perfil do usuário
   */
  private static async resetProfilePoints(): Promise<void> {
    try {
      const profile = await EnhancedProfileService.getProfile();

      if (profile) {
        // Resetar campos relacionados a pontos/conquistas
        const updatedProfile = {
          ...profile,
          totalPoints: 0,
          achievementPoints: 0,
          experiencePoints: 0,
          level: 1,
          // Manter outros campos intactos
        };

        await EnhancedProfileService.updateProfile(updatedProfile);
        console.log('✅ Pontos do perfil resetados para 0');
      } else {
        console.log('ℹ️ Perfil não encontrado - pulando reset de pontos');
      }
    } catch (error) {
      console.error('❌ Erro ao resetar pontos do perfil:', error);
      // Não lançar erro - continuar com o reset
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

  /**
   * Reset seletivo - escolher quais conquistas resetar
   */
  static async resetSpecificAchievements(achievementIds: string[]): Promise<void> {
    try {
      console.log(`🔄 Resetando conquistas específicas: ${achievementIds.join(', ')}`);

      // Obter progresso atual
      const currentProgress = await EnhancedAchievementService.getAchievementProgress();

      // Resetar progresso das conquistas específicas
      const updatedProgress = currentProgress.map(progress => {
        if (achievementIds.includes(progress.achievementId)) {
          return {
            ...progress,
            currentProgress: 0,
            unlockedAt: undefined,
          };
        }
        return progress;
      });

      // Salvar progresso atualizado
      await AsyncStorage.setItem('@VersoEMusa:achievements_v2', JSON.stringify(updatedProgress));

      // Limpar visualizações dessas conquistas específicas
      const views = await AsyncStorage.getItem('achievement_views');
      if (views) {
        const parsedViews = JSON.parse(views);
        achievementIds.forEach(id => {
          delete parsedViews[`${id}_default`];
        });
        await AsyncStorage.setItem('achievement_views', JSON.stringify(parsedViews));
      }

      console.log(`✅ ${achievementIds.length} conquistas específicas resetadas`);

    } catch (error) {
      console.error('❌ Erro ao resetar conquistas específicas:', error);
      throw error;
    }
  }
}

// Funções de conveniência para uso no console/debug
export const resetAllAchievements = () => AchievementResetService.resetEntireAchievementSystem();
export const resetPoints = () => AchievementResetService.resetPointsOnly();
export const resetViews = () => AchievementResetService.resetViewStatusOnly();
export const getResetStats = () => AchievementResetService.getResetStats();
export const resetSpecific = (ids: string[]) => AchievementResetService.resetSpecificAchievements(ids);
