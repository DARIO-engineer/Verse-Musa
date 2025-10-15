import AsyncStorage from '@react-native-async-storage/async-storage';

interface AchievementView {
  achievementId: string;
  viewedAt: Date;
  userId?: string;
}

export class AchievementViewService {
  private static readonly STORAGE_KEY = 'achievement_views';

  /**
   * Marcar uma conquista como vista
   */
  static async markAchievementAsViewed(achievementId: string, userId?: string): Promise<void> {
    try {
      const views = await this.getViewedAchievements(userId);
      const key = `${achievementId}_${userId || 'default'}`;
      
      views[key] = {
        achievementId,
        viewedAt: new Date(),
        userId,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(views));
      console.log('✅ Conquista marcada como vista:', achievementId);
    } catch (error) {
      console.error('❌ Erro ao marcar conquista como vista:', error);
    }
  }

  /**
   * Verificar se uma conquista foi vista
   */
  static async isAchievementViewed(achievementId: string, userId?: string): Promise<boolean> {
    try {
      const views = await this.getViewedAchievements(userId);
      const key = `${achievementId}_${userId || 'default'}`;
      return !!views[key];
    } catch (error) {
      console.error('❌ Erro ao verificar se conquista foi vista:', error);
      return false;
    }
  }

  /**
   * Obter conquistas não vistas de uma lista
   */
  static async getUnviewedAchievements(achievements: any[], userId?: string): Promise<any[]> {
    try {
      const unviewed = [];
      
      for (const achievement of achievements) {
        if (achievement.unlockedAt) {
          const isViewed = await this.isAchievementViewed(achievement.id, userId);
          if (!isViewed) {
            unviewed.push(achievement);
          }
        }
      }

      return unviewed;
    } catch (error) {
      console.error('❌ Erro ao obter conquistas não vistas:', error);
      return [];
    }
  }

  /**
   * Marcar múltiplas conquistas como vistas
   */
  static async markMultipleAsViewed(achievementIds: string[], userId?: string): Promise<void> {
    try {
      const views = await this.getViewedAchievements(userId);
      
      for (const achievementId of achievementIds) {
        const key = `${achievementId}_${userId || 'default'}`;
        views[key] = {
          achievementId,
          viewedAt: new Date(),
          userId,
        };
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(views));
      console.log('✅ Múltiplas conquistas marcadas como vistas:', achievementIds.length);
    } catch (error) {
      console.error('❌ Erro ao marcar múltiplas conquistas como vistas:', error);
    }
  }

  /**
   * Obter todas as conquistas vistas
   */
  private static async getViewedAchievements(userId?: string): Promise<Record<string, AchievementView>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      const allViews = data ? JSON.parse(data) : {};
      
      // Converter strings de data de volta para Date objects
      Object.keys(allViews).forEach(key => {
        if (allViews[key].viewedAt) {
          allViews[key].viewedAt = new Date(allViews[key].viewedAt);
        }
      });

      return allViews;
    } catch (error) {
      console.error('❌ Erro ao obter conquistas vistas:', error);
      return {};
    }
  }

  /**
   * Limpar histórico de visualizações (útil para debug)
   */
  static async clearViewHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ Histórico de visualizações limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
    }
  }

  /**
   * Obter estatísticas de visualizações
   */
  static async getViewStats(userId?: string): Promise<{
    totalViewed: number;
    recentViews: AchievementView[];
  }> {
    try {
      const views = await this.getViewedAchievements(userId);
      const userViews = Object.values(views).filter(view => 
        !userId || view.userId === userId || view.userId === undefined
      );

      return {
        totalViewed: userViews.length,
        recentViews: userViews
          .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
          .slice(0, 10),
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { totalViewed: 0, recentViews: [] };
    }
  }
}
