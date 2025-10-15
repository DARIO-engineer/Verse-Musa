// src/services/EnhancedProfileService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleCache from '../utils/SimpleCache';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  photoUri?: string;
  inspirationQuote: string;
  bio?: string;
  location?: string;
  favoriteCategory: 'Poesia' | 'Jogral' | 'Soneto' | 'Livre';
  writingGoal: number; // Poemas por mês
  joinDate: string;
  totalWords: number;
  totalPoems: number;
  longestStreak: number;
  currentStreak: number;
  lastActiveDate: string;
  achievements: string[];
  personalityTraits: string[];
  writingStyle: 'Romântico' | 'Melancólico' | 'Épico' | 'Lírico' | 'Moderno' | 'Clássico';
  preferredWritingTime: 'Madrugada' | 'Manhã' | 'Tarde' | 'Noite';
  customTheme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

const STORAGE_KEYS = {
  PROFILE: '@VersoEMusa:profile',
  PROFILE_PHOTO: '@VersoEMusa:profilePhoto',
  WRITING_STATS: '@VersoEMusa:writingStats',
  DAILY_ACTIVITY: '@VersoEMusa:dailyActivity',
};

export class EnhancedProfileService {
  // Obter perfil completo
  static async getProfile(): Promise<UserProfile | null> {
    try {
      // Verificar cache primeiro
      const cacheKey = 'user_profile';
      const cachedProfile = SimpleCache.get(cacheKey);
      if (cachedProfile) {
        console.log('📦 EnhancedProfileService - Perfil obtido do cache:', {
          name: cachedProfile.name,
          inspirationQuote: cachedProfile.inspirationQuote
        });
        return cachedProfile;
      }

      console.log('🔍 EnhancedProfileService - Buscando perfil no storage...');
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      
      if (!profileData || profileData === 'undefined' || profileData === 'null') {
        console.log('❗ EnhancedProfileService - Perfil não encontrado, criando padrão...');
        const defaultProfile = await this.createDefaultProfile();
        SimpleCache.set(cacheKey, defaultProfile, 60); // Cache por 1 minuto
        return defaultProfile;
      }
      
      let profile: UserProfile;
      try {
        profile = JSON.parse(profileData);
        console.log('✅ EnhancedProfileService - Perfil carregado do storage:', {
          name: profile.name,
          inspirationQuote: profile.inspirationQuote
        });
      } catch (parseError) {
        // Limpar dados corrompidos e criar perfil padrão
        await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
        const defaultProfile = await this.createDefaultProfile();
        SimpleCache.set(cacheKey, defaultProfile, 60);
        return defaultProfile;
      }

      // Validar estrutura do perfil
      if (!profile.id || !profile.name) {
        const defaultProfile = await this.createDefaultProfile();
        SimpleCache.set(cacheKey, defaultProfile, 60);
        return defaultProfile;
      }
      
      SimpleCache.set(cacheKey, profile, 60); // Cache por 1 minuto
      return profile;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return this.createDefaultProfile();
    }
  }

  // Criar perfil padrão
  private static async createDefaultProfile(): Promise<UserProfile> {
    console.log('🏗️ Criando perfil padrão...');
    
    const defaultProfile: UserProfile = {
      id: Date.now().toString(),
      name: 'Poeta Anônimo',
      inspirationQuote: 'A poesia é a música da alma',
      location: 'Mundo dos Sonhos',
      favoriteCategory: 'Poesia',
      writingGoal: 5,
      joinDate: new Date().toISOString(),
      totalWords: 0,
      totalPoems: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastActiveDate: new Date().toISOString(),
      achievements: [],
      personalityTraits: [],
      writingStyle: 'Lírico',
      preferredWritingTime: 'Noite',
    };

    // Salvar diretamente no AsyncStorage para evitar loop
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    console.log('✅ Perfil padrão criado e salvo');
    
    return defaultProfile;
  }

  // Atualizar perfil
  static async updateProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log('🔄 EnhancedProfileService - Atualizando perfil:', profile);
      
      // Evitar loop infinito - obter perfil atual diretamente do storage
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      let currentProfile: UserProfile | null = null;
      
      if (profileData && profileData !== 'undefined' && profileData !== 'null') {
        try {
          currentProfile = JSON.parse(profileData);
          console.log('📋 EnhancedProfileService - Perfil atual encontrado:', {
            name: currentProfile?.name,
            inspirationQuote: currentProfile?.inspirationQuote
          });
        } catch (parseError) {
          console.warn('Perfil corrompido, será recriado');
        }
      }

      // Se não há perfil atual, usar o perfil fornecido como base
      if (!currentProfile) {
        currentProfile = profile as UserProfile;
      } else {
        currentProfile = { ...currentProfile, ...profile };
      }

      console.log('💾 EnhancedProfileService - Perfil final para salvar:', {
        name: currentProfile.name,
        inspirationQuote: currentProfile.inspirationQuote
      });

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
      
      // Invalidar cache para forçar reload
      SimpleCache.delete('user_profile');
      console.log('🗑️ EnhancedProfileService - Cache invalidado');
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  }

  // Selecionar e salvar foto do perfil
  static async selectProfilePhoto(): Promise<string | null> {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à galeria para selecionar uma foto.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Selecionar imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const selectedImage = result.assets[0];
      
      // Criar diretório de fotos se não existir
      const photosDir = `${(FileSystem as any).documentDirectory}profile_photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      // Copiar imagem para diretório local
      const fileName = `profile_${Date.now()}.jpg`;
      const localUri = `${photosDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: selectedImage.uri,
        to: localUri,
      });

      // Remover foto anterior se existir
      const currentProfile = await this.getProfile();
      if (currentProfile?.photoUri) {
        try {
          await FileSystem.deleteAsync(currentProfile.photoUri, { idempotent: true });
        } catch (deleteError) {
          console.log('Foto anterior não encontrada ou já removida');
        }
      }

      // Atualizar perfil com nova foto
      await this.updateProfile({ photoUri: localUri });
      
      return localUri;
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto.');
      return null;
    }
  }

  // Tirar foto com câmera
  static async takeProfilePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à câmera para tirar uma foto.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const photo = result.assets[0];
      
      // Criar diretório e salvar foto
      const photosDir = `${(FileSystem as any).documentDirectory}profile_photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      const fileName = `profile_${Date.now()}.jpg`;
      const localUri = `${photosDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: photo.uri,
        to: localUri,
      });

      // Remover foto anterior
      const currentProfile = await this.getProfile();
      if (currentProfile?.photoUri) {
        try {
          await FileSystem.deleteAsync(currentProfile.photoUri, { idempotent: true });
        } catch (deleteError) {
          console.log('Foto anterior não encontrada');
        }
      }

      await this.updateProfile({ photoUri: localUri });
      
      return localUri;
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
      return null;
    }
  }

  // Remover foto do perfil
  static async removeProfilePhoto(): Promise<boolean> {
    try {
      const currentProfile = await this.getProfile();
      
      if (currentProfile?.photoUri) {
        await FileSystem.deleteAsync(currentProfile.photoUri, { idempotent: true });
        await this.updateProfile({ photoUri: undefined });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      return false;
    }
  }

  // Atualizar estatísticas de escrita
  static async updateWritingStats(wordsAdded: number = 0, poemCompleted: boolean = false): Promise<void> {
    try {
      const profile = await this.getProfile();
      if (!profile) return;

      const today = new Date().toDateString();
      const lastActiveDate = new Date(profile.lastActiveDate).toDateString();
      
      // Atualizar streak
      let currentStreak = profile.currentStreak;
      if (lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActiveDate === yesterday.toDateString()) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      }

      const updatedProfile: Partial<UserProfile> = {
        totalWords: profile.totalWords + wordsAdded,
        totalPoems: poemCompleted ? profile.totalPoems + 1 : profile.totalPoems,
        currentStreak,
        longestStreak: Math.max(profile.longestStreak, currentStreak),
        lastActiveDate: new Date().toISOString(),
      };

      await this.updateProfile(updatedProfile);
      await this.updateDailyActivity(wordsAdded, poemCompleted);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  // Atividade diária
  private static async updateDailyActivity(words: number, poemCompleted: boolean): Promise<void> {
    try {
      const today = new Date().toDateString();
      const activityData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
      const activity = activityData ? JSON.parse(activityData) : {};

      if (!activity[today]) {
        activity[today] = { words: 0, poems: 0, timeSpent: 0 };
      }

      activity[today].words += words;
      if (poemCompleted) {
        activity[today].poems += 1;
      }

      // Manter apenas últimos 365 dias
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      Object.keys(activity).forEach(date => {
        if (new Date(date) < oneYearAgo) {
          delete activity[date];
        }
      });

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(activity));
    } catch (error) {
      console.error('Erro ao atualizar atividade diária:', error);
    }
  }

  // Obter atividade diária
  static async getDailyActivity(days: number = 30): Promise<any> {
    try {
      const activityData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
      const activity = activityData ? JSON.parse(activityData) : {};

      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        result.push({
          date: dateStr,
          words: activity[dateStr]?.words || 0,
          poems: activity[dateStr]?.poems || 0,
          timeSpent: activity[dateStr]?.timeSpent || 0,
        });
      }

      return result;
    } catch (error) {
      console.error('Erro ao obter atividade diária:', error);
      return [];
    }
  }

  // Analisar padrões de escrita
  static async getWritingInsights(): Promise<any> {
    try {
      const profile = await this.getProfile();
      const dailyActivity = await this.getDailyActivity(30);
      
      if (!profile) return null;

      const totalWordsLastMonth = dailyActivity.reduce((sum: number, day: any) => sum + day.words, 0);
      const totalPoemsLastMonth = dailyActivity.reduce((sum: number, day: any) => sum + day.poems, 0);
      const activeDays = dailyActivity.filter((day: any) => day.words > 0).length;
      
      const averageWordsPerDay = totalWordsLastMonth / 30;
      const averageWordsPerPoem = totalPoemsLastMonth > 0 ? totalWordsLastMonth / totalPoemsLastMonth : 0;
      const productivityScore = Math.min(100, (activeDays / 30) * 100);

      // Determinar melhor horário (baseado em preferência)
      const timePreferences = {
        'Madrugada': '00:00 - 06:00',
        'Manhã': '06:00 - 12:00',
        'Tarde': '12:00 - 18:00',
        'Noite': '18:00 - 24:00',
      };

      return {
        productivityScore: Math.round(productivityScore),
        averageWordsPerDay: Math.round(averageWordsPerDay),
        averageWordsPerPoem: Math.round(averageWordsPerPoem),
        activeDaysThisMonth: activeDays,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        bestWritingTime: timePreferences[profile.preferredWritingTime],
        writingStyle: profile.writingStyle,
        goalProgress: {
          current: totalPoemsLastMonth,
          target: profile.writingGoal,
          percentage: Math.min(100, (totalPoemsLastMonth / profile.writingGoal) * 100),
        },
        insights: this.generateInsights(profile, totalWordsLastMonth, totalPoemsLastMonth, activeDays),
      };
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return null;
    }
  }

  // Gerar insights personalizados
  private static generateInsights(profile: UserProfile, wordsThisMonth: number, poemsThisMonth: number, activeDays: number): string[] {
    const insights = [];

    if (profile.currentStreak >= 7) {
      insights.push(`🔥 Incrível! Você está em uma sequência de ${profile.currentStreak} dias escrevendo!`);
    }

    if (poemsThisMonth >= profile.writingGoal) {
      insights.push(`🎯 Parabéns! Você alcançou sua meta de ${profile.writingGoal} poemas este mês!`);
    } else if (poemsThisMonth >= profile.writingGoal * 0.8) {
      insights.push(`📈 Você está quase lá! Faltam apenas ${profile.writingGoal - poemsThisMonth} poemas para sua meta.`);
    }

    if (activeDays >= 20) {
      insights.push(`⭐ Consistência exemplar! Você escreveu em ${activeDays} dos últimos 30 dias.`);
    }

    if (wordsThisMonth > 1000) {
      insights.push(`📝 Você já escreveu ${wordsThisMonth} palavras este mês! Que produtividade!`);
    }

    const averageWordsPerPoem = poemsThisMonth > 0 ? wordsThisMonth / poemsThisMonth : 0;
    if (averageWordsPerPoem > 100) {
      insights.push(`📖 Seus poemas são ricos em detalhes - média de ${Math.round(averageWordsPerPoem)} palavras por poema.`);
    }

    if (insights.length === 0) {
      insights.push('🌱 Toda grande jornada começa com um primeiro passo. Continue escrevendo!');
    }

    return insights;
  }

  // Resetar perfil (manter apenas dados essenciais)
  static async resetProfile(): Promise<boolean> {
    try {
      const currentProfile = await this.getProfile();
      if (!currentProfile) return false;

      // Remover foto se existir
      if (currentProfile.photoUri) {
        await FileSystem.deleteAsync(currentProfile.photoUri, { idempotent: true });
      }

      // Manter apenas dados básicos
      const resetProfile: UserProfile = {
        ...currentProfile,
        photoUri: undefined,
        totalWords: 0,
        totalPoems: 0,
        longestStreak: 0,
        currentStreak: 0,
        achievements: [],
        personalityTraits: [],
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(resetProfile));
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_ACTIVITY);
      
      return true;
    } catch (error) {
      console.error('Erro ao resetar perfil:', error);
      return false;
    }
  }

  // Validar dados do perfil
  static validateProfileData(data: Partial<UserProfile>): { isValid: boolean; errors: string[] } {
    const errors = [];

    if (data.name && (data.name.length < 2 || data.name.length > 50)) {
      errors.push('Nome deve ter entre 2 e 50 caracteres');
    }

    if (data.inspirationQuote && data.inspirationQuote.length > 200) {
      errors.push('Frase inspiradora deve ter no máximo 200 caracteres');
    }

    if (data.bio && data.bio.length > 500) {
      errors.push('Bio deve ter no máximo 500 caracteres');
    }

    if (data.writingGoal && (data.writingGoal < 1 || data.writingGoal > 100)) {
      errors.push('Meta de escrita deve ser entre 1 e 100 poemas por mês');
    }

    if (data.email && data.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email inválido');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Recalcular estatísticas baseado nos drafts reais
  static async recalculateStatsFromDrafts(): Promise<void> {
    try {
      console.log('🔄 Recalculando estatísticas baseado nos drafts...');
      
      // Importar DraftService de forma dinâmica para evitar dependência circular
      const DraftService = require('./DraftService').DraftService;
      const drafts = await DraftService.getAllDrafts();
      
      const profile = await this.getProfile();
      if (!profile) return;

      // Calcular estatísticas reais
      let totalWords = 0;
      let totalPoems = drafts.length;
      
      // Calcular streak baseado nas datas dos drafts
      let currentStreak = 0;
      let longestStreak = 0;
      
      if (drafts.length > 0) {
        // Ordenar drafts por data de criação
        const sortedDrafts = drafts.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Agrupar por dia
        const draftsByDay = new Map<string, number>();
        
        drafts.forEach((draft: any) => {
          if (draft.content) {
            const wordCount = draft.content.trim().split(/\s+/).filter((word: any) => word.length > 0).length;
            totalWords += wordCount;
          }
          
          const dayKey = new Date(draft.createdAt).toDateString();
          draftsByDay.set(dayKey, (draftsByDay.get(dayKey) || 0) + 1);
        });
        
        // Calcular streak atual
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let currentDay = new Date(today);
        let tempStreak = 0;
        
        // Verificar se escreveu hoje ou ontem para manter streak
        if (draftsByDay.has(today.toDateString())) {
          tempStreak = 1;
          currentDay.setDate(currentDay.getDate() - 1);
        } else if (draftsByDay.has(yesterday.toDateString())) {
          tempStreak = 1;
          currentDay = new Date(yesterday);
          currentDay.setDate(currentDay.getDate() - 1);
        }
        
        // Continuar contando dias consecutivos
        while (draftsByDay.has(currentDay.toDateString())) {
          tempStreak++;
          currentDay.setDate(currentDay.getDate() - 1);
        }
        
        currentStreak = tempStreak;
        longestStreak = Math.max(profile.longestStreak, currentStreak);
      }

      // Atualizar apenas se houver diferença significativa
      const hasChanges = 
        Math.abs(profile.totalWords - totalWords) > 5 || 
        profile.totalPoems !== totalPoems ||
        profile.currentStreak !== currentStreak ||
        profile.longestStreak < longestStreak;
        
      if (hasChanges) {
        console.log(`📊 Atualizando estatísticas:`);
        console.log(`   Poemas: ${profile.totalPoems} → ${totalPoems}`);
        console.log(`   Palavras: ${profile.totalWords} → ${totalWords}`);
        console.log(`   Streak atual: ${profile.currentStreak} → ${currentStreak}`);
        console.log(`   Maior streak: ${profile.longestStreak} → ${longestStreak}`);
        
        const updatedProfile: Partial<UserProfile> = {
          totalWords,
          totalPoems,
          currentStreak,
          longestStreak,
        };

        await this.updateProfile(updatedProfile);
        
        // Limpar cache para forçar recarga
        SimpleCache.delete('user_profile');
      }
    } catch (error) {
      console.error('❌ Erro ao recalcular estatísticas:', error);
    }
  }
}
