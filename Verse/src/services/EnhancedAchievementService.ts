// src/services/EnhancedAchievementService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedProfileService } from './EnhancedProfileService';
import { DraftService } from './DraftService';
import { PoemTypeService } from './PoemTypeService';
import { NotificationService } from './NotificationService';
import { StreakService } from './StreakService';
import { TemplateService } from './TemplateService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'writing' | 'creativity' | 'consistency' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  secret?: boolean;
  requirements: {
    type: 'poems_count' | 'words_count' | 'streak_days' | 'category_focus' | 'time_period' | 'special_condition';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    category?: string;
    condition?: string;
  }[];
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  lastUpdated: string;
  unlockedAt?: string;
}

const STORAGE_KEY = '@VersoEMusa:achievements_v2';

export class EnhancedAchievementService {
  
  // Lista completa de conquistas (expandida para 30+ conquistas)
  private static getAllAchievements(): Achievement[] {
    return [
      // CONQUISTAS DE ESCRITA BÁSICAS (6)
      {
        id: 'first_creation',
        title: 'Primeiras Palavras',
        description: 'Crie sua primeira obra literária',
        icon: 'create',
        color: '#4CAF50',
        category: 'writing',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'poems_count', value: 1 }]
      },
      {
        id: 'five_works',
        title: 'Escritor Iniciante',
        description: 'Crie 5 obras literárias',
        icon: 'library',
        color: '#2196F3',
        category: 'writing',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'poems_count', value: 5 }]
      },
      {
        id: 'ten_works',
        title: 'Autor Emergente',
        description: 'Crie 10 obras literárias',
        icon: 'book',
        color: '#673AB7',
        category: 'writing',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'poems_count', value: 10 }]
      },
      {
        id: 'twenty_five_works',
        title: 'Escritor Dedicado',
        description: 'Crie 25 obras literárias',
        icon: 'bookmark',
        color: '#FF9800',
        category: 'writing',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'poems_count', value: 25 }]
      },
      {
        id: 'fifty_works',
        title: 'Autor Experiente',
        description: 'Crie 50 obras literárias',
        icon: 'star',
        color: '#E91E63',
        category: 'writing',
        rarity: 'rare',
        points: 250,
        requirements: [{ type: 'poems_count', value: 50 }]
      },
      {
        id: 'hundred_works',
        title: 'Mestre das Letras',
        description: 'Crie 100 obras literárias',
        icon: 'trophy',
        color: '#FFD700',
        category: 'milestone',
        rarity: 'epic',
        points: 500,
        requirements: [{ type: 'poems_count', value: 100 }]
      },

      // CONQUISTAS DE PALAVRAS (5)
      {
        id: 'thousand_words',
        title: 'Mil Palavras',
        description: 'Escreva 1.000 palavras',
        icon: 'text',
        color: '#9C27B0',
        category: 'writing',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'words_count', value: 1000 }]
      },
      {
        id: 'five_thousand_words',
        title: 'Cinco Mil Palavras',
        description: 'Escreva 5.000 palavras',
        icon: 'document',
        color: '#673AB7',
        category: 'writing',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'words_count', value: 5000 }]
      },
      {
        id: 'ten_thousand_words',
        title: 'Dez Mil Palavras',
        description: 'Escreva 10.000 palavras',
        icon: 'document-text',
        color: '#3F51B5',
        category: 'writing',
        rarity: 'rare',
        points: 200,
        requirements: [{ type: 'words_count', value: 10000 }]
      },
      {
        id: 'fifty_thousand_words',
        title: 'Cinquenta Mil Palavras',
        description: 'Escreva 50.000 palavras',
        icon: 'library-outline',
        color: '#2196F3',
        category: 'milestone',
        rarity: 'epic',
        points: 750,
        requirements: [{ type: 'words_count', value: 50000 }]
      },
      {
        id: 'hundred_thousand_words',
        title: 'Cem Mil Palavras',
        description: 'Escreva 100.000 palavras',
        icon: 'book-outline',
        color: '#0091EA',
        category: 'milestone',
        rarity: 'legendary',
        points: 1500,
        requirements: [{ type: 'words_count', value: 100000 }]
      },

      // CONQUISTAS DE CONSISTÊNCIA (7)
      {
        id: 'streak_3',
        title: 'Três Dias Seguidos',
        description: 'Escreva por 3 dias consecutivos',
        icon: 'flame',
        color: '#FF5722',
        category: 'consistency',
        rarity: 'common',
        points: 30,
        requirements: [{ type: 'streak_days', value: 3 }]
      },
      {
        id: 'streak_7',
        title: 'Uma Semana de Inspiração',
        description: 'Escreva por 7 dias consecutivos',
        icon: 'calendar',
        color: '#FF9800',
        category: 'consistency',
        rarity: 'rare',
        points: 75,
        requirements: [{ type: 'streak_days', value: 7 }]
      },
      {
        id: 'streak_14',
        title: 'Duas Semanas Firme',
        description: 'Escreva por 14 dias consecutivos',
        icon: 'trending-up',
        color: '#4CAF50',
        category: 'consistency',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'streak_days', value: 14 }]
      },
      {
        id: 'streak_30',
        title: 'Um Mês de Dedicação',
        description: 'Escreva por 30 dias consecutivos',
        icon: 'medal',
        color: '#2196F3',
        category: 'consistency',
        rarity: 'epic',
        points: 300,
        requirements: [{ type: 'streak_days', value: 30 }]
      },
      {
        id: 'streak_60',
        title: 'Dois Meses Inabalável',
        description: 'Escreva por 60 dias consecutivos',
        icon: 'shield',
        color: '#673AB7',
        category: 'consistency',
        rarity: 'epic',
        points: 600,
        requirements: [{ type: 'streak_days', value: 60 }]
      },
      {
        id: 'streak_100',
        title: 'Cem Dias de Poesia',
        description: 'Escreva por 100 dias consecutivos',
        icon: 'diamond',
        color: '#E91E63',
        category: 'consistency',
        rarity: 'legendary',
        points: 1000,
        requirements: [{ type: 'streak_days', value: 100 }]
      },
      {
        id: 'streak_365',
        title: 'Um Ano de Versos',
        description: 'Escreva por 365 dias consecutivos',
        icon: 'trophy',
        color: '#FFD700',
        category: 'consistency',
        rarity: 'legendary',
        points: 3000,
        requirements: [{ type: 'streak_days', value: 365 }]
      },

      // CONQUISTAS DE CATEGORIA E ESTILO (10)
      {
        id: 'sonnet_explorer',
        title: 'Explorador de Sonetos',
        description: 'Crie 5 sonetos clássicos',
        category: 'creativity',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'category_focus', value: 5, category: 'soneto' }]
      },
      {
        id: 'jogral_master',
        title: 'Mestre do Jogral',
        description: 'Crie 3 jograis marcantes',
        category: 'creativity',
        rarity: 'rare',
        points: 75,
        requirements: [{ type: 'category_focus', value: 3, category: 'jogral' }]
      },
      {
        id: 'free_verse_poet',
        title: 'Poeta do Verso Livre',
        description: 'Crie 10 poemas em verso livre',
        category: 'creativity',
        rarity: 'epic',
        points: 120,
        requirements: [{ type: 'category_focus', value: 10, category: 'verso_livre' }]
      },
      {
        id: 'haiku_master',
        title: 'Mestre do Haicai',
        description: 'Crie 7 haicais perfeitos',
        category: 'creativity',
        rarity: 'rare',
        points: 90,
        requirements: [{ type: 'category_focus', value: 7, category: 'haicai' }]
      },
      {
        id: 'cordel_storyteller',
        title: 'Contador de Cordel',
        description: 'Crie 5 cordéis narrativos',
        category: 'creativity',
        rarity: 'epic',
        points: 110,
        requirements: [{ type: 'category_focus', value: 5, category: 'cordel' }]
      },
      {
        id: 'consistency_bronze',
        title: 'Consistência Bronze',
        description: 'Escreva por 7 dias seguidos',
        category: 'consistency',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'streak_days', value: 7 }]
      },
      {
        id: 'consistency_silver',
        title: 'Consistência Prata',
        description: 'Escreva por 30 dias seguidos',
        category: 'consistency',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'streak_days', value: 30 }]
      },
      {
        id: 'consistency_gold',
        title: 'Consistência Ouro',
        description: 'Escreva por 100 dias seguidos',
        category: 'consistency',
        rarity: 'epic',
        points: 500,
        requirements: [{ type: 'streak_days', value: 100 }]
      },
      {
        id: 'poet_level_novice',
        title: 'Poeta Iniciante',
        description: 'Alcance o nível Iniciante',
        category: 'progression',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'poet_level', value: 1 }]
      },
      {
        id: 'poet_level_intermediate',
        title: 'Poeta Intermediário',
        description: 'Alcance o nível Intermediário',
        category: 'progression',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'poet_level', value: 2 }]
      },
      {
        id: 'poet_level_advanced',
        title: 'Poeta Avançado',
        description: 'Alcance o nível Avançado',
        category: 'progression',
        rarity: 'epic',
        points: 250,
        requirements: [{ type: 'poet_level', value: 3 }]
      },
      {
        id: 'poet_level_master',
        title: 'Poeta Mestre',
        description: 'Alcance o nível Mestre',
        category: 'progression',
        rarity: 'legendary',
        points: 500,
        requirements: [{ type: 'poet_level', value: 4 }]
      },
      {
        id: 'performance_expert',
        title: 'Especialista em Performance',
        description: 'Use o modo apresentação 10 vezes',
        icon: 'people',
        color: '#F57C00',
        category: 'creativity',
        rarity: 'rare',
        points: 200,
        requirements: [{ type: 'category_focus', value: 20, category: 'Jogral' }]
      },
      {
        id: 'free_verse_lover',
        title: 'Amante do Verso Livre',
        description: 'Crie 15 obras em verso livre',
        icon: 'flower',
        color: '#9C27B0',
        category: 'creativity',
        rarity: 'common',
        points: 100,
        requirements: [{ type: 'category_focus', value: 15, category: 'Verso Livre' }]
      },
      {
        id: 'classical_purist',
        title: 'Purista Clássico',
        description: 'Crie 30 obras clássicas',
        icon: 'flower-outline',
        color: '#7B1FA2',
        category: 'creativity',
        rarity: 'rare',
        points: 250,
        requirements: [{ type: 'category_focus', value: 30, category: 'Clássico' }]
      },

      // CONQUISTAS ESPECIAIS E CRIATIVAS (8)
      {
        id: 'night_writer',
        title: 'Escritor Noturno',
        description: 'Crie 10 obras durante a madrugada (00h-06h)',
        icon: 'moon',
        color: '#3F51B5',
        category: 'special',
        rarity: 'rare',
        points: 100,
        secret: true,
        requirements: [{ type: 'special_condition', value: 10, condition: 'night_writing' }]
      },
      {
        id: 'early_creator',
        title: 'Criador Matinal',
        description: 'Crie 10 obras no amanhecer (05h-08h)',
        icon: 'sunny',
        color: '#FFC107',
        category: 'special',
        rarity: 'rare',
        points: 100,
        secret: true,
        requirements: [{ type: 'special_condition', value: 10, condition: 'early_writing' }]
      },
      {
        id: 'prolific_day',
        title: 'Dia Inspirado',
        description: 'Crie 5 obras em um único dia',
        icon: 'flash',
        color: '#FFEB3B',
        category: 'special',
        rarity: 'epic',
        points: 200,
        secret: true,
        requirements: [{ type: 'special_condition', value: 5, condition: 'daily_poems' }]
      },
      {
        id: 'marathon_creator',
        title: 'Maratonista Criativo',
        description: 'Crie 10 obras em um único dia',
        icon: 'fitness',
        color: '#4CAF50',
        category: 'special',
        rarity: 'legendary',
        points: 500,
        secret: true,
        requirements: [{ type: 'special_condition', value: 10, condition: 'daily_poems' }]
      },
      {
        id: 'epic_narrative',
        title: 'Narrativa Épica',
        description: 'Crie uma obra com mais de 500 palavras',
        icon: 'document-text',
        color: '#795548',
        category: 'special',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'special_condition', value: 500, condition: 'long_poem' }]
      },
      {
        id: 'epic_masterpiece',
        title: 'Obra-Prima Épica',
        description: 'Crie uma obra com mais de 1000 palavras',
        icon: 'book',
        color: '#5D4037',
        category: 'special',
        rarity: 'epic',
        points: 300,
        secret: true,
        requirements: [{ type: 'special_condition', value: 1000, condition: 'epic_poem' }]
      },
      {
        id: 'minimalist_artist',
        title: 'Artista Minimalista',
        description: 'Crie 10 obras concisas (menos de 30 palavras)',
        icon: 'contract',
        color: '#607D8B',
        category: 'special',
        rarity: 'rare',
        points: 125,
        requirements: [{ type: 'special_condition', value: 10, condition: 'short_poems' }]
      },
      {
        id: 'perfectionist_editor',
        title: 'Editor Perfeccionista',
        description: 'Revise uma obra 15 vezes',
        icon: 'pencil',
        color: '#FF5722',
        category: 'special',
        rarity: 'rare',
        points: 100,
        secret: true,
        requirements: [{ type: 'special_condition', value: 15, condition: 'edit_count' }]
      },

      // CONQUISTAS DE PRODUTIVIDADE E METAS (4)
      {
        id: 'weekend_creator',
        title: 'Criador de Fim de Semana',
        description: 'Crie obras em todos os fins de semana do mês',
        icon: 'calendar-outline',
        color: '#4CAF50',
        category: 'consistency',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'time_period', value: 4, timeframe: 'weekly' }]
      },
      {
        id: 'monthly_achiever',
        title: 'Conquistador Mensal',
        description: 'Complete sua meta mensal de criação',
        icon: 'checkmark-circle',
        color: '#2196F3',
        category: 'milestone',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'special_condition', value: 1, condition: 'monthly_goal' }]
      },
      {
        id: 'quarterly_champion',
        title: 'Campeão Trimestral',
        description: 'Atinja sua meta por 3 meses consecutivos',
        icon: 'trending-up',
        color: '#FF9800',
        category: 'milestone',
        rarity: 'epic',
        points: 300,
        requirements: [{ type: 'special_condition', value: 3, condition: 'quarterly_goal' }]
      },
      {
        id: 'annual_legend',
        title: 'Lenda Anual',
        description: 'Atinja sua meta todos os meses do ano',
        icon: 'star',
        color: '#FFD700',
        category: 'milestone',
        rarity: 'legendary',
        points: 1200,
        requirements: [{ type: 'special_condition', value: 12, condition: 'yearly_goal' }]
      },

      // CONQUISTAS DE CRIATIVIDADE E VERSATILIDADE (4)
      {
        id: 'versatile_creator',
        title: 'Criador Versátil',
        description: 'Experimente todas as categorias disponíveis',
        icon: 'color-palette',
        color: '#FF9800',
        category: 'creativity',
        rarity: 'epic',
        points: 250,
        requirements: [{ type: 'special_condition', value: 4, condition: 'all_categories' }]
      },
      {
        id: 'style_explorer',
        title: 'Explorador de Estilos',
        description: 'Use diferentes estilos de escrita',
        icon: 'happy',
        color: '#FFEB3B',
        category: 'creativity',
        rarity: 'rare',
        points: 125,
        requirements: [{ type: 'special_condition', value: 3, condition: 'writing_styles' }]
      },
      {
        id: 'midnight_muse',
        title: 'Musa da Meia-Noite',
        description: 'Crie exatamente à meia-noite',
        icon: 'time',
        color: '#9C27B0',
        category: 'special',
        rarity: 'epic',
        points: 200,
        secret: true,
        requirements: [{ type: 'special_condition', value: 1, condition: 'midnight_writing' }]
      },
      {
        id: 'seasonal_creator',
        title: 'Criador das Estações',
        description: 'Crie pelo menos uma obra em cada estação do ano',
        icon: 'leaf',
        color: '#4CAF50',
        category: 'creativity',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'special_condition', value: 4, condition: 'seasonal_writing' }]
      },

      // CONQUISTAS DE STREAK (DIAS CONSECUTIVOS)
      {
        id: 'three_day_streak',
        title: 'Três Dias Seguidos',
        description: 'Escreva por 3 dias consecutivos',
        icon: 'flame',
        color: '#FF6B35',
        category: 'consistency',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'streak_days', value: 3 }]
      },
      {
        id: 'week_streak',
        title: 'Uma Semana Completa',
        description: 'Escreva por 7 dias consecutivos',
        icon: 'flame',
        color: '#FF4757',
        category: 'consistency',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'streak_days', value: 7 }]
      },
      {
        id: 'month_streak',
        title: 'Mês de Dedicação',
        description: 'Escreva por 30 dias consecutivos',
        icon: 'flame',
        color: '#FF3838',
        category: 'consistency',
        rarity: 'epic',
        points: 500,
        requirements: [{ type: 'streak_days', value: 30 }]
      },
      {
        id: 'streak_master',
        title: 'Mestre da Consistência',
        description: 'Escreva por 100 dias consecutivos',
        icon: 'flame',
        color: '#FF1744',
        category: 'consistency',
        rarity: 'legendary',
        points: 1000,
        requirements: [{ type: 'streak_days', value: 100 }]
      },

      // CONQUISTAS DE TEMPLATES
      {
        id: 'first_template',
        title: 'Primeiro Template',
        description: 'Use um template pela primeira vez',
        icon: 'document-text',
        color: '#00BCD4',
        category: 'creativity',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'special_condition', value: 1, condition: 'template_usage' }]
      },
      {
        id: 'template_explorer',
        title: 'Explorador de Templates',
        description: 'Use 3 templates diferentes',
        icon: 'albums',
        color: '#009688',
        category: 'creativity',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'special_condition', value: 3, condition: 'unique_templates' }]
      },
      {
        id: 'template_master',
        title: 'Mestre dos Templates',
        description: 'Use 5 templates diferentes',
        icon: 'library',
        color: '#4CAF50',
        category: 'creativity',
        rarity: 'epic',
        points: 200,
        requirements: [{ type: 'special_condition', value: 5, condition: 'unique_templates' }]
      },
      {
        id: 'sonnet_specialist',
        title: 'Especialista em Sonetos',
        description: 'Crie 5 sonetos usando o template',
        icon: 'rose',
        color: '#E91E63',
        category: 'creativity',
        rarity: 'rare',
        points: 150,
        requirements: [{ type: 'special_condition', value: 5, condition: 'sonnet_template' }]
      },
  // haiku_master removido: template de haiku não existe de forma confiável no sistema
    ];
  }

  // Cache para evitar múltiplas verificações
  private static lastCheckTime = 0;
  private static checkCooldown = 5000; // 5 segundos entre verificações
  private static cachedDrafts: any[] | null = null;
  private static cacheExpiry = 0;

  /**
   * Verifica e atualiza conquistas baseadas em ações do usuário (OTIMIZADO)
   */
  static async checkAndUpdateAchievements(
    userId: string,
    action: 'poem_created' | 'poem_edited' | 'streak_maintained' | 'words_written',
    data?: any
  ): Promise<void> {
    try {
      // Verificações de segurança
      if (!userId || !action) {
        return;
      }

      // Implementar cooldown para evitar verificações excessivas
      const now = Date.now();
      if (now - this.lastCheckTime < this.checkCooldown) {
        return; // Skip se muito recente
      }
      this.lastCheckTime = now;

      // Log reduzido
      if (Math.random() < 0.1) { // Log apenas 10% das vezes
        console.log('🏆 EnhancedAchievementService: Verificando conquistas para', action);
      }

      const achievements = this.getAllAchievements();
      const userProgress = await this.getAchievementProgress(userId);
      
      // Filtrar apenas conquistas não desbloqueadas (otimizado)
      const lockedAchievements = achievements.filter(achievement => {
        const progress = userProgress.find(p => p.achievementId === achievement.id);
        return !progress || !progress.unlockedAt;
      });
      
      // Limitar verificações simultâneas
      const maxChecks = 5;
      let checksPerformed = 0;
      
      // Verificar conquistas baseadas na ação
      for (const achievement of lockedAchievements) {
        if (checksPerformed >= maxChecks) break;
        
        let shouldCheck = false;
        let currentValue = 0;
        
        // Determinar se deve verificar esta conquista
        switch (action) {
          case 'poem_created':
            shouldCheck = achievement.requirements.some(req => 
              req.type === 'poems_count' || 
              req.type === 'category_focus' ||
              req.type === 'special_condition'
            );
            if (shouldCheck) {
              currentValue = await this.getCurrentProgressValueOptimized(userId, achievement, data);
              checksPerformed++;
            }
            break;
            
          case 'words_written':
            shouldCheck = achievement.requirements.some(req => req.type === 'words_count');
            if (shouldCheck) {
              currentValue = await this.getCurrentProgressValueOptimized(userId, achievement, data);
              checksPerformed++;
            }
            break;
            
          case 'streak_maintained':
            shouldCheck = achievement.requirements.some(req => req.type === 'streak_days');
            if (shouldCheck) {
              currentValue = data?.streakDays || 0;
              checksPerformed++;
            }
            break;
        }
        
        if (shouldCheck && this.checkAchievementRequirements(achievement, currentValue, data)) {
          await this.unlockAchievement(userId, achievement);
        }
      }

      // Log reduzido
      if (Math.random() < 0.1) {
        console.log('✅ EnhancedAchievementService: Verificação concluída');
      }

    } catch (error) {
      console.error('❌ EnhancedAchievementService: Erro ao verificar conquistas:', error);
    }
  }

  /**
   * Desbloqueia uma conquista e cria notificação
   */
  private static async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Marcar como desbloqueada
      achievement.unlockedAt = new Date().toISOString();
      
      // Salvar progresso
      const progress: AchievementProgress = {
        achievementId: achievement.id,
        currentProgress: achievement.maxProgress || 1,
        lastUpdated: new Date().toISOString(),
        unlockedAt: achievement.unlockedAt
      };
      
      await this.saveProgress(progress);
      
      // Criar notificação no histórico
      await NotificationService.addNotification(
        'achievement',
        '🏆 Conquista Desbloqueada!',
        `${achievement.title}: ${achievement.description}`,
        'trophy',
        'high',
        {
          achievementId: achievement.id,
          data: {
            points: achievement.points,
            rarity: achievement.rarity
          }
        }
      );

      // Enviar notificação push nativa
      await NotificationService.showAchievementPush(
        achievement.title,
        achievement.description,
        achievement.points || 0
      );
      
      console.log(`🎉 Conquista desbloqueada: ${achievement.title}`);
      
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
    }
  }

  /**
   * Verifica se os requisitos da conquista foram atendidos
   */
  private static checkAchievementRequirements(
    achievement: Achievement, 
    currentValue: number, 
    data?: any
  ): boolean {
    return achievement.requirements.every(req => {
      switch (req.type) {
        case 'poems_count':
        case 'words_count':
        case 'streak_days':
          return currentValue >= req.value;
          
        case 'category_focus':
          return data?.category === req.category && currentValue >= req.value;
          
        case 'special_condition':
          return this.checkSpecialCondition(req.condition || '', currentValue, data, req.value);
          
        default:
          return false;
      }
    });
  }

  /**
   * Verifica condições especiais
   */
  private static checkSpecialCondition(condition: string, value: number, data?: any, requiredValue?: number): boolean {
    switch (condition) {
      case 'night_writing':
        return data?.hour >= 0 && data?.hour <= 6 && value >= 10;
      case 'early_writing':
        return data?.hour >= 5 && data?.hour <= 8 && value >= 10;
      case 'midnight_writing':
        return data?.hour === 0 && value >= 1;
      case 'daily_poems':
        // value deve ser EXATAMENTE o número de poemas criados hoje
        // requiredValue será 5 para 'prolific_day' ou 10 para 'marathon_creator'
        return value >= (requiredValue || 5);
      case 'long_poem':
        return data?.wordCount >= 500; // Para "Narrativa Épica"
      case 'epic_poem':
        return data?.wordCount >= 1000; // Para "Obra-Prima Épica"
      case 'short_poems':
        return value >= 10; // value é o número de poemas curtos (<=30 palavras)
      case 'edit_count':
        return data?.editCount >= 15;
      // Suporte para condições relacionadas a templates
      case 'template_usage':
        // value é o número total de obras criadas com templates
        return value >= (requiredValue || 1);
      case 'unique_templates':
        // value é o número de templates únicos utilizados
        return value >= (requiredValue || 1);
      case 'sonnet_template':
        // value é o número de obras criadas com template de soneto
        return value >= (requiredValue || 1);
      default:
        return false;
    }
  }

  /**
   * Obtém o valor atual do progresso para uma conquista
   */
  private static async getCurrentProgressValue(
    userId: string,
    achievement: Achievement,
    data?: any
  ): Promise<number> {
    try {
      // Aqui você integraria com seus serviços reais de dados
      // Por exemplo, contando poemas do DraftService ou EnhancedProfileService

      const requirement = achievement.requirements[0]; // Simplificado

      switch (requirement.type) {
        case 'poems_count':
          // Integrar com DraftService para contar poemas, incluindo categorias personalizadas
          return await this.countUserPoemsIncludingCustom(userId);

        case 'streak_days':
          // Integrar com StreakService para contar dias consecutivos
          return await StreakService.getConsecutiveDays();

        case 'words_count':
          // Integrar com DraftService para contar palavras
          return await this.countUserWords(userId);

        case 'category_focus':
          // Contar poemas de uma categoria específica
          return await this.countPoemsByCategory(userId, requirement.category || '');

        case 'special_condition':
          // Para condições especiais, verificar diretamente os dados
          if (requirement.condition === 'long_poem') {
            return data?.wordCount || 0;
          } else if (requirement.condition === 'epic_poem') {
            return data?.wordCount || 0;
          } else if (requirement.condition === 'daily_poems') {
            // Para conquistas de poemas diários, contar poemas criados hoje
            return await this.getDailyPoemsCount(userId);
          } else {
            return await this.getSpecialConditionValue(userId, requirement.condition || '', data);
          }

        default:
          return 0;
      }
    } catch (error) {
      console.error('Erro ao obter valor do progresso:', error);
      return 0;
    }
  }

  /**
   * Versão otimizada com cache para obter valor do progresso
   */
  private static async getCurrentProgressValueOptimized(
    userId: string,
    achievement: Achievement,
    data?: any
  ): Promise<number> {
    try {
      const requirement = achievement.requirements[0];

      // Use cache para drafts se disponível
      const now = Date.now();
      if (!this.cachedDrafts || now > this.cacheExpiry) {
        this.cachedDrafts = await DraftService.getAllDrafts();
        this.cacheExpiry = now + 30000; // Cache por 30 segundos
      }

      switch (requirement.type) {
        case 'poems_count':
          return this.cachedDrafts.length;

        case 'words_count':
          return this.cachedDrafts.reduce((total, draft) => {
            const wordCount = draft.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0;
            return total + wordCount;
          }, 0);

        case 'category_focus':
          return this.cachedDrafts.filter(draft => 
            draft.category === requirement.category
          ).length;

        case 'special_condition':
          return await this.getSpecialConditionValueOptimized(requirement.condition || '', data);

        default:
          return 0;
      }
    } catch (error) {
      console.error('Erro ao obter valor do progresso (otimizado):', error);
      return 0;
    }
  }

  /**
   * Versão otimizada para condições especiais
   */
  private static async getSpecialConditionValueOptimized(condition: string, data?: any): Promise<number> {
    if (!this.cachedDrafts) return 0;

    switch (condition) {
      case 'short_poems':
        return this.cachedDrafts.filter(draft => {
          const wordCount = draft.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0;
          return wordCount <= 30;
        }).length;

      case 'daily_poems':
        const today = new Date().toDateString();
        return this.cachedDrafts.filter(draft => {
          const draftDate = new Date(draft.createdAt).toDateString();
          return draftDate === today;
        }).length;

      case 'long_poem':
      case 'epic_poem':
        return data?.wordCount || 0;

      default:
        return 0;
    }
  }

  /**
   * Obtém o valor para condições especiais
   */
  private static async getSpecialConditionValue(userId: string, condition: string, data?: any): Promise<number> {
    try {
      switch (condition) {
        case 'long_poem':
          // Para conquistas de poema longo, retorna a contagem de palavras do poema atual
          return data?.wordCount || 0;

        case 'daily_poems':
          // Conta o número de poemas criados hoje
          return await this.getDailyPoemsCount(userId);

        case 'short_poems':
          // Conta o número de poemas com <=30 palavras
          const draftsShort = await DraftService.getAllDrafts();
          let countShort = 0;
          for (const draft of draftsShort) {
            if (draft && draft.isPublished) {
              const wordCount = draft.content?.split(/\s+/).length || 0;
              if (wordCount <= 30) {
                countShort++;
              }
            }
          }
          return countShort;

        case 'early_writing':
          // Conta o número de poemas criados entre 5h-8h
          const draftsEarly = await DraftService.getAllDrafts();
          let countEarly = 0;
          for (const draft of draftsEarly) {
            if (draft && draft.isPublished) {
              const hour = draft.createdAt.getHours();
              if (hour >= 5 && hour <= 8) {
                countEarly++;
              }
            }
          }
          return countEarly;

        case 'night_writing':
          // Conta o número de poemas criados entre 0h-6h
          const draftsNight = await DraftService.getAllDrafts();
          let countNight = 0;
          for (const draft of draftsNight) {
            if (draft && draft.isPublished) {
              const hour = draft.createdAt.getHours();
              if (hour >= 0 && hour <= 6) {
                countNight++;
              }
            }
          }
          return countNight;

        case 'midnight_writing':
          // Verifica se o poema atual foi criado exatamente à meia-noite
          return (data?.hour === 0) ? 1 : 0;

        case 'daily_poems':
          // Conta o número de poemas criados hoje
          const today = new Date();
          const todayString = today.toDateString();
          const draftsDaily = await DraftService.getAllDrafts();
          let countDaily = 0;
          for (const draft of draftsDaily) {
            if (draft && draft.isPublished) {
              const draftDate = draft.createdAt.toDateString();
              if (draftDate === todayString) {
                countDaily++;
              }
            }
          }
          return countDaily;

        case 'edit_count':
          // Retorna o número de edições do poema atual
          return data?.editCount || 0;

        case 'template_usage':
          // Conta o total de obras criadas usando qualquer template
          return await this.countTemplateUsage(userId);

        case 'unique_templates':
          // Conta o número de templates únicos utilizados
          return await this.countUniqueTemplates(userId);

        case 'sonnet_template':
          // Conta obras criadas especificamente com template de soneto
          const sonnetStats = await TemplateService.checkSpecificTemplateUsage();
          return sonnetStats.soneto;

        default:
          return 0;
      }
    } catch (error) {
      console.error('Erro ao obter valor para condição especial:', error);
      return 0;
    }
  }

  /**
   * Conta total de poemas do usuário, incluindo categorias personalizadas
   */
  private static async countUserPoemsIncludingCustom(userId: string): Promise<number> {
    try {
      // Integração com DraftService
      const drafts = await DraftService.getAllDrafts();
      if (!drafts || !Array.isArray(drafts)) {
        console.log('⚠️ EnhancedAchievementService: Drafts não disponíveis ou inválidos');
        return 0;
      }
      
      // Contar TODAS as obras publicadas, incluindo:
      // - Categorias padrão (Poesia, Jogral, Soneto, etc.)
      // - Categorias personalizadas criadas pelo usuário
      // - Qualquer nova categoria que seja adicionada
      const publishedWorks = drafts.filter(draft => 
        draft && 
        draft.isPublished && 
        draft.category // Qualquer categoria válida (incluindo personalizadas)
      );
      
      console.log(`📚 Total de obras contadas (incluindo personalizadas): ${publishedWorks.length}`);
      return publishedWorks.length;
    } catch (error) {
      console.error('Erro ao contar poemas:', error);
      return 0;
    }
  }

  /**
   * Conta total de palavras escritas pelo usuário
   */
  private static async countUserWords(userId: string): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts || !Array.isArray(drafts)) {
        console.log('⚠️ EnhancedAchievementService: Drafts não disponíveis ou inválidos');
        return 0;
      }
      
      // Contar palavras de TODAS as obras publicadas, incluindo categorias personalizadas
      const totalWords = drafts
        .filter(draft => 
          draft && 
          draft.isPublished && 
          draft.category // Qualquer categoria válida (incluindo personalizadas)
        )
        .reduce((total, draft) => {
          const wordCount = draft.content?.split(/\s+/).length || 0;
          return total + wordCount;
        }, 0);
        
      console.log(`📝 Total de palavras contadas (incluindo categorias personalizadas): ${totalWords}`);
      return totalWords;
    } catch (error) {
      console.error('Erro ao contar palavras:', error);
      return 0;
    }
  }

  /**
   * Conta poemas por categoria específica (para conquistas de categoria como "Explorador de Sonetos")
   */
  private static async countPoemsByCategory(userId: string, category: string): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts || !Array.isArray(drafts)) {
        console.log('⚠️ EnhancedAchievementService: Drafts não disponíveis ou inválidos');
        return 0;
      }
      
      // Contar obras publicadas de uma categoria específica
      // Funciona tanto para categorias padrão quanto personalizadas
      const categoryWorks = drafts.filter(draft =>
        draft && 
        draft.isPublished && 
        draft.category === category
      );
      
      console.log(`📂 Obras da categoria "${category}": ${categoryWorks.length}`);
      return categoryWorks.length;
    } catch (error) {
      console.error('Erro ao contar poemas por categoria:', error);
      return 0;
    }
  }

  /**
   * Obtém todas as conquistas do usuário
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = this.getAllAchievements();
      // Implementar lógica para obter conquistas desbloqueadas
      return achievements;
    } catch (error) {
      console.error('Erro ao obter conquistas do usuário:', error);
      return [];
    }
  }

  /**
   * Obtém progresso das conquistas
   */
  static async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allProgress: AchievementProgress[] = JSON.parse(stored);
        return allProgress || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao obter progresso das conquistas:', error);
      return [];
    }
  }

  /**
   * Salva progresso da conquista
   */
  private static async saveProgress(progress: AchievementProgress): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allProgress: AchievementProgress[] = stored ? JSON.parse(stored) : [];

      // Encontrar índice existente
      let existingIndex = -1;
      for (let i = 0; i < allProgress.length; i++) {
        if (allProgress[i].achievementId === progress.achievementId) {
          existingIndex = i;
          break;
        }
      }

      if (existingIndex >= 0) {
        allProgress[existingIndex] = progress;
      } else {
        allProgress.push(progress);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Erro ao salvar progresso da conquista:', error);
    }
  }

  /**
   * Obtém conquistas com progresso (para tela de conquistas)
   */
  static async getAchievementsWithProgress(userId: string = 'default'): Promise<Achievement[]> {
    try {
      const allAchievements = this.getAllAchievements();
      const userProgress = await this.getAchievementProgress(userId);

      // Combinar conquistas com progresso - calcular uma por vez
      const result = [];
      for (let j = 0; j < allAchievements.length; j++) {
        const achievement = allAchievements[j];
        
        // Encontrar progresso usando loop tradicional
        let progress: AchievementProgress | undefined;
        for (let i = 0; i < userProgress.length; i++) {
          if (userProgress[i].achievementId === achievement.id) {
            progress = userProgress[i];
            break;
          }
        }

        // Calcular progresso atual real
        const currentValue = await this.getCurrentProgressValue(userId, achievement);
        const maxProgress = achievement.requirements[0]?.value || 1;

        result.push({
          ...achievement,
          progress: Math.min(currentValue, maxProgress), // Limitar progresso ao máximo da conquista
          maxProgress: maxProgress,
          unlockedAt: progress?.unlockedAt
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao obter conquistas com progresso:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas das conquistas
   */
  static async getAchievementStats(userId: string = 'default'): Promise<{
    totalCount: number;
    unlockedCount: number;
    totalPoints: number;
    totalPoems: number;
    completionPercentage: number;
  }> {
    try {
      const achievementsWithProgress = await this.getAchievementsWithProgress(userId);
      
      // Filtrar conquistas desbloqueadas usando loop tradicional
      const unlockedAchievements: Achievement[] = [];
      for (let i = 0; i < achievementsWithProgress.length; i++) {
        if (achievementsWithProgress[i].unlockedAt) {
          unlockedAchievements.push(achievementsWithProgress[i]);
        }
      }

      // Calcular pontos totais usando loop tradicional
      let totalPoints = 0;
      for (let i = 0; i < unlockedAchievements.length; i++) {
        totalPoints += unlockedAchievements[i].points;
      }
      
      // Usar a função correta para contar poemas (incluindo categorias personalizadas)
      const totalPoems = await this.countUserPoemsIncludingCustom(userId);

      return {
        totalCount: achievementsWithProgress.length,
        unlockedCount: unlockedAchievements.length,
        totalPoints,
        totalPoems,
        completionPercentage: achievementsWithProgress.length > 0
          ? (unlockedAchievements.length / achievementsWithProgress.length) * 100
          : 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas das conquistas:', error);
      return {
        totalCount: 0,
        unlockedCount: 0,
        totalPoints: 0,
        totalPoems: 0,
        completionPercentage: 0
      };
    }
  }

  /**
   * Revalida todas as conquistas (para correção de inconsistências)
   */
  static async revalidateAllAchievements(userId: string = 'default'): Promise<void> {
    try {
      console.log('🔄 Revalidando todas as conquistas...');

      const allAchievements = this.getAllAchievements();
      const currentProgress = await this.getAchievementProgress(userId);

      for (const achievement of allAchievements) {
        // Verificar se já está desbloqueada
        let existingProgress: AchievementProgress | undefined;
        for (let i = 0; i < currentProgress.length; i++) {
          if (currentProgress[i].achievementId === achievement.id) {
            existingProgress = currentProgress[i];
            break;
          }
        }

        const currentValue = await this.getCurrentProgressValue(userId, achievement);
        const shouldBeUnlocked = this.checkAchievementRequirements(achievement, currentValue);

        // Log detalhado para conquistas de daily_poems
        if (achievement.requirements[0]?.condition === 'daily_poems') {
          console.log(`🔍 Revalidando DAILY POEMS "${achievement.title}": valor=${currentValue}, requisito=${achievement.requirements[0]?.value}, desbloqueada=${!!existingProgress?.unlockedAt}, deveria=${shouldBeUnlocked}`);
        } else {
          console.log(`🔍 Revalidando "${achievement.title}": valor=${currentValue}, requisito=${achievement.requirements[0]?.value}, desbloqueada=${!!existingProgress?.unlockedAt}, deveria=${shouldBeUnlocked}`);
        }

        if (shouldBeUnlocked && (!existingProgress || !existingProgress.unlockedAt)) {
          console.log(`✅ Desbloqueando conquista: ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
          // Desbloquear conquista que deveria estar desbloqueada
          const progress: AchievementProgress = {
            achievementId: achievement.id,
            currentProgress: achievement.requirements[0]?.value || 1,
            lastUpdated: new Date().toISOString(),
            unlockedAt: new Date().toISOString()
          };

          await this.saveProgress(progress);
          console.log(`✅ Conquista revalidada (desbloqueada): ${achievement.title}`);
        } else if (!shouldBeUnlocked && existingProgress?.unlockedAt) {
          // Remover conquista que não deveria estar desbloqueada
          console.log(`🗑️ Removendo conquista incorreta: ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
          await this.removeInvalidAchievement(userId, achievement.id);
          console.log(`🗑️ Conquista revalidada (removida): ${achievement.title}`);
        } else if (existingProgress?.unlockedAt) {
          console.log(`✓ Conquista corretamente desbloqueada: ${achievement.title}`);
        } else {
          console.log(`⏳ Conquista ainda não atingida: ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
        }
      }

      console.log('✅ Revalidação concluída');
    } catch (error) {
      console.error('Erro ao revalidar conquistas:', error);
    }
  }

  /**
   * Processa a exclusão de um rascunho para o sistema de conquistas
   */
  static async handleDraftDeletion(deletedDraft: any): Promise<void> {
    try {
      console.log('🗑️ EnhancedAchievementService: Processando exclusão de rascunho para conquistas');
      
      if (deletedDraft?.isPublished) {
        console.log('📝 Obra publicada excluída, revalidando conquistas...');
        // Aguardar um pouco para garantir que a exclusão foi processada
        setTimeout(async () => {
          await this.revalidateAllAchievements();
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar exclusão para conquistas:', error);
    }
  }

  /**
   * Remove uma conquista desbloqueada incorretamente
   */
  static async removeInvalidAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allProgress: AchievementProgress[] = JSON.parse(stored);
        const filteredProgress = allProgress.filter(p => p.achievementId !== achievementId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProgress));
        console.log(`🗑️ Conquista "${achievementId}" removida`);
      }
    } catch (error) {
      console.error('Erro ao remover conquista:', error);
    }
  }

  /**
   * Limpa todas as conquistas (para debug/reset)
   */
  static async clearAllAchievements(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Todas as conquistas foram limpas');
    } catch (error) {
      console.error('Erro ao limpar conquistas:', error);
    }
  }

  /**
   * Verifica integridade do sistema de conquistas e corrige inconsistências
   */
  static async checkAndFixIntegrity(userId: string = 'default'): Promise<void> {
    try {
      console.log('🔍 Verificando integridade das conquistas...');
      
      // Contar obras reais
      const totalPoems = await this.countUserPoemsIncludingCustom(userId);
      console.log(`📚 Total de obras reais: ${totalPoems}`);
      
      // Verificar conquistas desbloqueadas
      const achievements = await this.getAchievementsWithProgress(userId);
      const unlockedAchievements = achievements.filter(a => a.unlockedAt);
      console.log(`🏆 Conquistas desbloqueadas: ${unlockedAchievements.length}`);
      
      // Se não há obras mas há conquistas desbloqueadas, limpar tudo
      if (totalPoems === 0 && unlockedAchievements.length > 0) {
        console.log('⚠️ Inconsistência detectada: 0 obras mas conquistas desbloqueadas');
        await this.clearAllAchievements();
        console.log('✅ Sistema de conquistas resetado');
      }
      
      // Se há obras, revalidar conquistas
      else if (totalPoems > 0) {
        console.log('🔄 Revalidando conquistas...');
        await this.revalidateAllAchievements(userId);
      }
      
      console.log('✅ Verificação de integridade concluída');
      
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
    }
  }

  /**
   * Conta poemas criados hoje
   */
  private static async getDailyPoemsCount(userId: string): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts || !Array.isArray(drafts)) {
        console.log('⚠️ EnhancedAchievementService: Drafts não disponíveis para contagem diária');
        return 0;
      }
      
      // Obter data de hoje (início do dia)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      console.log(`📅 Verificando obras criadas entre ${today.toISOString()} e ${tomorrow.toISOString()}`);
      
      // Contar obras criadas hoje
      const todaysWorks = drafts.filter(draft => {
        if (!draft || !draft.createdAt) return false;
        
        const createdDate = new Date(draft.createdAt);
        const isToday = createdDate >= today && createdDate < tomorrow;
        
        if (isToday) {
          console.log(`✅ Obra criada hoje: "${draft.title}" em ${createdDate.toISOString()}`);
        }
        
        return isToday;
      });
      
      console.log(`📅 Total de obras criadas HOJE: ${todaysWorks.length} (de ${drafts.length} obras totais)`);
      return todaysWorks.length;
    } catch (error) {
      console.error('Erro ao contar poemas diários:', error);
      return 0;
    }
  }

  /**
   * Conta quantas obras foram criadas usando templates
   */
  private static async countTemplateUsage(userId: string): Promise<number> {
    try {
      const templateCount = await TemplateService.getTotalTemplateWorks();
      console.log(`📋 Total de obras com templates: ${templateCount}`);
      return templateCount;
    } catch (error) {
      console.error('Erro ao contar uso de templates:', error);
      return 0;
    }
  }

  /**
   * Conta quantos templates diferentes foram usados
   */
  private static async countUniqueTemplates(userId: string): Promise<number> {
    try {
      const uniqueCount = await TemplateService.getUniqueTemplatesUsed();
      console.log(`📋 Templates únicos usados: ${uniqueCount}`);
      return uniqueCount;
    } catch (error) {
      console.error('Erro ao contar templates únicos:', error);
      return 0;
    }
  }

  /**
   * Obtém o valor atual do progresso para uma conquista (versão simplificada)
   */
  private static async getCurrentProgressValueSimple(
    userId: string,
    achievement: Achievement
  ): Promise<number> {
    try {
      const requirement = achievement.requirements[0]; // Simplificado

      switch (requirement.type) {
        case 'poems_count':
          return await this.countUserPoemsIncludingCustom(userId);

        case 'streak_days':
          return await StreakService.getConsecutiveDays();

        case 'words_count':
          return await this.countUserWords(userId);

        case 'category_focus':
          return await this.countPoemsByCategory(userId, requirement.category || '');

        default:
          return 0;
      }
    } catch (error) {
      console.error('Erro ao obter valor do progresso (simplificado):', error);
      return 0;
    }
  }

  /**
   * Revalida todas as conquistas (versão simplificada)
   */
  static async revalidateAllAchievementsSimple(userId: string = 'default'): Promise<void> {
    try {
      console.log('🔄 Revalidando todas as conquistas (simplificado)...');

      const allAchievements = this.getAllAchievements();
      const currentProgress = await this.getAchievementProgress(userId);

      for (const achievement of allAchievements) {
        // Verificar se já está desbloqueada
        let existingProgress: AchievementProgress | undefined;
        for (let i = 0; i < currentProgress.length; i++) {
          if (currentProgress[i].achievementId === achievement.id) {
            existingProgress = currentProgress[i];
            break;
          }
        }

        const currentValue = await this.getCurrentProgressValueSimple(userId, achievement);
        const shouldBeUnlocked = this.checkAchievementRequirements(achievement, currentValue);

        if (shouldBeUnlocked && (!existingProgress || !existingProgress.unlockedAt)) {
          console.log(`✅ Desbloqueando conquista (simplificado): ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
          // Desbloquear conquista que deveria estar desbloqueada
          const progress: AchievementProgress = {
            achievementId: achievement.id,
            currentProgress: achievement.requirements[0]?.value || 1,
            lastUpdated: new Date().toISOString(),
            unlockedAt: new Date().toISOString()
          };

          await this.saveProgress(progress);
          console.log(`✅ Conquista revalidada (desbloqueada): ${achievement.title}`);
        } else if (!shouldBeUnlocked && existingProgress?.unlockedAt) {
          // Remover conquista que não deveria estar desbloqueada
          console.log(`🗑️ Removendo conquista incorreta (simplificado): ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
          await this.removeInvalidAchievement(userId, achievement.id);
          console.log(`🗑️ Conquista revalidada (removida): ${achievement.title}`);
        } else if (existingProgress?.unlockedAt) {
          console.log(`✓ Conquista corretamente desbloqueada: ${achievement.title}`);
        } else {
          console.log(`⏳ Conquista ainda não atingida: ${achievement.title} (${currentValue}/${achievement.requirements[0]?.value})`);
        }
      }

      console.log('✅ Revalidação concluída (simplificado)');
    } catch (error) {
      console.error('Erro ao revalidar conquistas (simplificado):', error);
    }
  }
}
