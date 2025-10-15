// src/services/WriterDashboardService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WritingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // em minutos
  wordsWritten: number;
  draftId?: string;
  category: string;
}

export interface VocabularyAnalysis {
  totalUniqueWords: number;
  averageWordLength: number;
  mostUsedWords: { word: string; count: number }[];
  complexityScore: number; // 1-10
  sentimentScore: number; // -1 a 1
}

export interface StyleEvolution {
  period: string; // 'week' | 'month' | 'year'
  averageWordsPerPoem: number;
  averageVersesPerPoem: number;
  mostUsedCategories: string[];
  vocabularyGrowth: number;
  styleComplexity: number;
}

export interface ProductivityMetrics {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  longestStreak: number;
  currentStreak: number;
  mostProductiveHour: number;
  mostProductiveDay: string;
}

export interface WritingGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number;
  unit: 'words' | 'poems' | 'minutes';
  progress: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalPoems: number;
  totalWords: number;
  totalMinutes: number;
  averageQuality: number;
  topCategories: string[];
  achievements: string[];
  vocabularyGrowth: number;
  styleEvolution: string;
}

class WriterDashboardService {
  private readonly SESSIONS_KEY = 'writing_sessions';
  private readonly GOALS_KEY = 'writing_goals';
  private readonly VOCABULARY_KEY = 'vocabulary_analysis';

  // Registrar sessão de escrita
  async recordWritingSession(session: Omit<WritingSession, 'id'>): Promise<void> {
    try {
      const sessions = await this.getWritingSessions();
      const newSession: WritingSession = {
        ...session,
        id: Date.now().toString()
      };
      
      sessions.push(newSession);
      await AsyncStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      
      console.log('📊 Sessão de escrita registrada:', newSession);
    } catch (error) {
      console.error('Erro ao registrar sessão:', error);
    }
  }

  // Obter sessões de escrita
  async getWritingSessions(limit?: number): Promise<WritingSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.SESSIONS_KEY);
      const sessions = data ? JSON.parse(data) : [];
      
      // Ordenar por data mais recente
      sessions.sort((a: WritingSession, b: WritingSession) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      return limit ? sessions.slice(0, limit) : sessions;
    } catch (error) {
      console.error('Erro ao obter sessões:', error);
      return [];
    }
  }

  // Calcular métricas de produtividade
  async getProductivityMetrics(): Promise<ProductivityMetrics> {
    try {
      const sessions = await this.getWritingSessions();
      const now = new Date();
      
      // Filtrar últimos 30 dias
      const last30Days = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const diffTime = now.getTime() - sessionDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      });

      // Calcular médias
      const dailyAverage = this.calculateDailyAverage(last30Days);
      const weeklyAverage = dailyAverage * 7;
      const monthlyAverage = dailyAverage * 30;

      // Calcular streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(sessions);

      // Hora mais produtiva
      const mostProductiveHour = this.getMostProductiveHour(sessions);

      // Dia mais produtivo
      const mostProductiveDay = this.getMostProductiveDay(sessions);

      return {
        dailyAverage,
        weeklyAverage,
        monthlyAverage,
        currentStreak,
        longestStreak,
        mostProductiveHour,
        mostProductiveDay
      };
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      return {
        dailyAverage: 0,
        weeklyAverage: 0,
        monthlyAverage: 0,
        currentStreak: 0,
        longestStreak: 0,
        mostProductiveHour: 9,
        mostProductiveDay: 'Segunda-feira'
      };
    }
  }

  // Analisar vocabulário
  async analyzeVocabulary(texts: string[]): Promise<VocabularyAnalysis> {
    try {
      const allWords = texts.join(' ').toLowerCase()
        .replace(/[^\w\sáàâãéêíóôõúç]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);

      const uniqueWords = [...new Set(allWords)];
      const wordCounts: { [key: string]: number } = {};

      // Contar palavras
      allWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

      // Palavras mais usadas
      const mostUsedWords = Object.entries(wordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      // Calcular métricas
      const averageWordLength = allWords.reduce((sum, word) => sum + word.length, 0) / allWords.length;
      const complexityScore = this.calculateComplexityScore(uniqueWords, allWords);
      const sentimentScore = this.calculateSentimentScore(allWords);

      return {
        totalUniqueWords: uniqueWords.length,
        averageWordLength: Math.round(averageWordLength * 100) / 100,
        mostUsedWords,
        complexityScore,
        sentimentScore
      };
    } catch (error) {
      console.error('Erro ao analisar vocabulário:', error);
      return {
        totalUniqueWords: 0,
        averageWordLength: 0,
        mostUsedWords: [],
        complexityScore: 0,
        sentimentScore: 0
      };
    }
  }

  // Analisar evolução do estilo
  async getStyleEvolution(period: 'week' | 'month' | 'year'): Promise<StyleEvolution> {
    try {
      const sessions = await this.getWritingSessions();
      const now = new Date();
      
      let periodDays: number;
      switch (period) {
        case 'week': periodDays = 7; break;
        case 'month': periodDays = 30; break;
        case 'year': periodDays = 365; break;
      }

      const periodSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const diffTime = now.getTime() - sessionDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= periodDays;
      });

      // Calcular métricas
      const averageWordsPerPoem = periodSessions.reduce((sum, s) => sum + s.wordsWritten, 0) / periodSessions.length || 0;
      const averageVersesPerPoem = Math.round(averageWordsPerPoem / 8); // Estimativa

      // Categorias mais usadas
      const categoryCount: { [key: string]: number } = {};
      periodSessions.forEach(session => {
        categoryCount[session.category] = (categoryCount[session.category] || 0) + 1;
      });

      const mostUsedCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      return {
        period,
        averageWordsPerPoem: Math.round(averageWordsPerPoem),
        averageVersesPerPoem,
        mostUsedCategories,
        vocabularyGrowth: Math.random() * 20 + 5, // Placeholder
        styleComplexity: Math.random() * 5 + 3 // Placeholder
      };
    } catch (error) {
      console.error('Erro ao analisar evolução:', error);
      return {
        period,
        averageWordsPerPoem: 0,
        averageVersesPerPoem: 0,
        mostUsedCategories: [],
        vocabularyGrowth: 0,
        styleComplexity: 0
      };
    }
  }

  // Gerenciar metas
  async createGoal(goal: Omit<WritingGoal, 'id' | 'progress'>): Promise<void> {
    try {
      const goals = await this.getGoals();
      const newGoal: WritingGoal = {
        ...goal,
        id: Date.now().toString(),
        progress: 0
      };
      
      goals.push(newGoal);
      await AsyncStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
      
      console.log('🎯 Meta criada:', newGoal);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
    }
  }

  async getGoals(): Promise<WritingGoal[]> {
    try {
      const data = await AsyncStorage.getItem(this.GOALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter metas:', error);
      return [];
    }
  }

  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      const goals = await this.getGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex !== -1) {
        goals[goalIndex].progress = progress;
        await AsyncStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso da meta:', error);
    }
  }

  // Gerar relatório mensal
  async generateMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
    try {
      const sessions = await this.getWritingSessions();
      
      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getMonth() === month && sessionDate.getFullYear() === year;
      });

      const totalPoems = monthSessions.length;
      const totalWords = monthSessions.reduce((sum, s) => sum + s.wordsWritten, 0);
      const totalMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0);

      // Categorias mais usadas
      const categoryCount: { [key: string]: number } = {};
      monthSessions.forEach(session => {
        categoryCount[session.category] = (categoryCount[session.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      return {
        month: monthNames[month],
        year,
        totalPoems,
        totalWords,
        totalMinutes,
        averageQuality: Math.random() * 2 + 3, // Placeholder
        topCategories,
        achievements: ['Consistência Semanal', 'Explorador de Estilos'], // Placeholder
        vocabularyGrowth: Math.random() * 15 + 5,
        styleEvolution: 'Evolução positiva na complexidade poética'
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return {
        month: 'Erro',
        year,
        totalPoems: 0,
        totalWords: 0,
        totalMinutes: 0,
        averageQuality: 0,
        topCategories: [],
        achievements: [],
        vocabularyGrowth: 0,
        styleEvolution: 'Dados insuficientes'
      };
    }
  }

  // Métodos auxiliares privados
  private calculateDailyAverage(sessions: WritingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const dailyTotals: { [key: string]: number } = {};
    sessions.forEach(session => {
      const date = session.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + session.wordsWritten;
    });

    const totalWords = Object.values(dailyTotals).reduce((sum, words) => sum + words, 0);
    return Math.round(totalWords / Object.keys(dailyTotals).length);
  }

  private calculateStreaks(sessions: WritingSession[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = [...new Set(sessions.map(s => s.date))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Verificar streak atual
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dates.includes(today)) {
      currentStreak = 1;
      // Contar dias consecutivos para trás
      for (let i = dates.length - 2; i >= 0; i--) {
        const currentDate = new Date(dates[i + 1]);
        const prevDate = new Date(dates[i]);
        const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (dates.includes(yesterday)) {
      currentStreak = 1;
    }

    // Calcular maior streak
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);
      const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private getMostProductiveHour(sessions: WritingSession[]): number {
    const hourCounts: { [key: number]: number } = {};
    
    sessions.forEach(session => {
      const hour = new Date(`2000-01-01T${session.startTime}`).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + session.wordsWritten;
    });

    let maxHour = 9;
    let maxWords = 0;
    
    Object.entries(hourCounts).forEach(([hour, words]) => {
      if (words > maxWords) {
        maxWords = words;
        maxHour = parseInt(hour);
      }
    });

    return maxHour;
  }

  private getMostProductiveDay(sessions: WritingSession[]): string {
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayCounts: { [key: number]: number } = {};
    
    sessions.forEach(session => {
      const dayOfWeek = new Date(session.date).getDay();
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + session.wordsWritten;
    });

    let maxDay = 1;
    let maxWords = 0;
    
    Object.entries(dayCounts).forEach(([day, words]) => {
      if (words > maxWords) {
        maxWords = words;
        maxDay = parseInt(day);
      }
    });

    return dayNames[maxDay];
  }

  private calculateComplexityScore(uniqueWords: string[], allWords: string[]): number {
    // Pontuação baseada na diversidade vocabular
    const diversityRatio = uniqueWords.length / allWords.length;
    const avgWordLength = uniqueWords.reduce((sum, word) => sum + word.length, 0) / uniqueWords.length;
    
    // Escala de 1-10
    const score = (diversityRatio * 5) + (avgWordLength * 0.5);
    return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
  }

  private calculateSentimentScore(words: string[]): number {
    // Palavras positivas e negativas básicas
    const positiveWords = ['amor', 'alegria', 'feliz', 'belo', 'esperança', 'luz', 'paz', 'sonho'];
    const negativeWords = ['dor', 'tristeza', 'medo', 'escuro', 'solidão', 'lágrima', 'sofrimento'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;
    
    return (positiveCount - negativeCount) / totalSentimentWords;
  }
}

export default new WriterDashboardService();
