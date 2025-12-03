import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftService } from './DraftService';

interface StreakData {
  currentStreak: number;
  lastWritingDate: string;
  longestStreak: number;
  totalDays: number;
}

const STREAK_KEY = '@verse_musa_streak';

export class StreakService {
  
  /**
   * Obtém dados do streak atual
   */
  static async getStreakData(): Promise<StreakData> {
    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Dados iniciais
      return {
        currentStreak: 0,
        lastWritingDate: '',
        longestStreak: 0,
        totalDays: 0
      };
    } catch (error) {
      console.error('❌ Erro ao obter dados de streak:', error);
      return {
        currentStreak: 0,
        lastWritingDate: '',
        longestStreak: 0,
        totalDays: 0
      };
    }
  }

  /**
   * Salva dados do streak
   */
  private static async saveStreakData(data: StreakData): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
      console.log('💾 Dados de streak salvos:', data);
    } catch (error) {
      console.error('❌ Erro ao salvar dados de streak:', error);
    }
  }

  /**
   * Atualiza streak quando uma obra é criada
   */
  static async updateStreakOnCreation(): Promise<StreakData> {
    try {
      const data = await this.getStreakData();
      const today = new Date().toDateString();
      
      // Se já escreveu hoje, não atualizar
      if (data.lastWritingDate === today) {
        console.log('📝 Já escreveu hoje, streak mantido:', data.currentStreak);
        return data;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      // Verificar se escreveu ontem para manter o streak
      if (data.lastWritingDate === yesterdayStr) {
        // Continuar streak
        data.currentStreak += 1;
        console.log('🔥 Streak continuado!', data.currentStreak);
      } else if (data.lastWritingDate === '') {
        // Primeiro dia
        data.currentStreak = 1;
        console.log('🌟 Primeiro dia de streak!');
      } else {
        // Streak quebrado, reiniciar
        console.log('💔 Streak quebrado. Reiniciando...');
        data.currentStreak = 1;
      }

      // Atualizar dados
      data.lastWritingDate = today;
      data.totalDays += 1;
      
      // Atualizar longest streak
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
        console.log('🏆 Novo recorde de streak!', data.longestStreak);
      }

      await this.saveStreakData(data);
      return data;

    } catch (error) {
      console.error('❌ Erro ao atualizar streak:', error);
      return await this.getStreakData();
    }
  }

  /**
   * Verifica se o streak foi quebrado (chamado diariamente)
   */
  static async checkStreakBreak(): Promise<StreakData> {
    try {
      const data = await this.getStreakData();
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      // Se não escreveu hoje nem ontem, quebrar streak
      if (data.lastWritingDate !== today && data.lastWritingDate !== yesterdayStr && data.currentStreak > 0) {
        console.log('💔 Streak quebrado por inatividade');
        data.currentStreak = 0;
        await this.saveStreakData(data);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar quebra de streak:', error);
      return await this.getStreakData();
    }
  }

  /**
   * Verifica quantos dias consecutivos o usuário escreveu
   */
  static async getConsecutiveDays(): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts || drafts.length === 0) return 0;

      // Agrupar obras por data de criação
      const dateGroups: { [key: string]: number } = {};
      
      drafts.forEach(draft => {
        if (draft && draft.createdAt) {
          const date = new Date(draft.createdAt).toDateString();
          dateGroups[date] = (dateGroups[date] || 0) + 1;
        }
      });

      const sortedDates = Object.keys(dateGroups).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      // Contar dias consecutivos a partir de hoje
      let consecutiveDays = 0;
      const today = new Date();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toDateString();
        
        if (sortedDates.includes(checkDateStr)) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      console.log(`📅 Dias consecutivos calculados: ${consecutiveDays}`);
      return consecutiveDays;

    } catch (error) {
      console.error('❌ Erro ao calcular dias consecutivos:', error);
      return 0;
    }
  }

  /**
   * Reset do sistema de streak
   */
  static async resetStreak(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STREAK_KEY);
      console.log('🔄 Sistema de streak resetado');
    } catch (error) {
      console.error('❌ Erro ao resetar streak:', error);
    }
  }

  /**
   * Obtém estatísticas de escrita
   */
  static async getWritingStats(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    lastWritingDate: string;
  }> {
    const data = await this.getStreakData();
    return {
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      totalDays: data.totalDays,
      lastWritingDate: data.lastWritingDate
    };
  }
}
