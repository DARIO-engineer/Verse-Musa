import AsyncStorage from '@react-native-async-storage/async-storage';
import { JsonUtils } from '../utils/JsonUtils';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UserProfile {
  displayName: string;
  photoURL: string | null;
  email: string;
  dailyMessage: string;
  lastMessageDate: string;
  totalPoems: number;
  totalWords: number;
  joinDate: string;
  favoriteCategory: string;
  achievements: string[];
}

export interface DailyMessage {
  text: string;
  author: string;
  category: 'poesia' | 'religioso' | 'inspiracional';
}

const PROFILE_STORAGE_KEY = '@VersoEMusa:user_profile';
const DAILY_MESSAGES: DailyMessage[] = [
  {
    text: "A poesia é a música da alma, onde as palavras dançam ao ritmo do coração.",
    author: "Dom Pedro II",
    category: "poesia"
  },
  {
    text: "Deus escreve certo por linhas tortas, e na poesia encontramos Sua beleza.",
    author: "Provérbio Popular",
    category: "religioso"
  },
  {
    text: "A fé move montanhas, mas a poesia move corações.",
    author: "Santo Agostinho",
    category: "religioso"
  },
  {
    text: "Cada verso é uma oração, cada poema uma bênção.",
    author: "Santa Teresa de Ávila",
    category: "religioso"
  },
  {
    text: "A inspiração vem de Deus, mas a dedicação vem de você.",
    author: "Papa João Paulo II",
    category: "inspiracional"
  },
  {
    text: "Nas palavras simples, encontramos a sabedoria divina.",
    author: "São Francisco de Assis",
    category: "religioso"
  },
  {
    text: "A poesia é o suspiro da alma que busca a eternidade.",
    author: "Dom Helder Câmara",
    category: "poesia"
  },
  {
    text: "Deus nos deu a palavra para criar beleza e transformar vidas.",
    author: "Papa Francisco",
    category: "inspiracional"
  },
  {
    text: "Cada poema é uma semente plantada no jardim da esperança.",
    author: "Madre Teresa de Calcutá",
    category: "inspiracional"
  },
  {
    text: "A arte da poesia é a arte de tocar o divino no humano.",
    author: "Dom Oscar Romero",
    category: "poesia"
  },
  {
    text: "Nas palavras que escrevemos, Deus escreve Sua história.",
    author: "São João da Cruz",
    category: "religioso"
  },
  {
    text: "A inspiração é o sopro divino que anima nossa criatividade.",
    author: "Santa Hildegarda",
    category: "religioso"
  },
  {
    text: "Cada verso é um passo na jornada da fé e da beleza.",
    author: "Dom Luciano Mendes",
    category: "inspiracional"
  },
  {
    text: "A poesia é a linguagem que Deus usa para falar ao coração.",
    author: "São Tomás de Aquino",
    category: "religioso"
  },
  {
    text: "Nas palavras que criamos, refletimos a imagem do Criador.",
    author: "Papa Bento XVI",
    category: "inspiracional"
  }
];

export class ProfileService {
  // Carregar perfil do usuário
  static async loadProfile(): Promise<UserProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      return JsonUtils.safeParse<UserProfile>(stored);
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      return null;
    }
  }

  // Salvar perfil do usuário
  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  }

  // Criar perfil inicial
  static async createInitialProfile(email: string, displayName?: string, photoURL?: string): Promise<UserProfile> {
    const today = new Date().toISOString().split('T')[0];
    const randomMessage = this.getRandomDailyMessage();
    
    const profile: UserProfile = {
      displayName: displayName || 'Poeta',
      photoURL: photoURL || null,
      email,
      dailyMessage: randomMessage.text,
      lastMessageDate: today,
      totalPoems: 0,
      totalWords: 0,
      joinDate: today,
      favoriteCategory: 'Poesia',
      achievements: []
    };

    await this.saveProfile(profile);
    return profile;
  }

  // Atualizar nome do usuário
  static async updateDisplayName(newName: string): Promise<void> {
    try {
      const profile = await this.loadProfile();
      if (profile) {
        profile.displayName = newName;
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      throw error;
    }
  }

  // Atualizar foto do perfil
  static async updateProfilePhoto(photoURL: string): Promise<void> {
    try {
      const profile = await this.loadProfile();
      if (profile) {
        profile.photoURL = photoURL;
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      throw error;
    }
  }

  // Selecionar foto da galeria
  static async pickImageFromGallery(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão para acessar galeria negada');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      throw error;
    }
  }

  // Tirar foto com câmera
  static async takePhotoWithCamera(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão para acessar câmera negada');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      throw error;
    }
  }

  // Obter mensagem diária (muda a cada dia)
  static async getDailyMessage(): Promise<string> {
    try {
      const profile = await this.loadProfile();
      const today = new Date().toISOString().split('T')[0];
      
      if (profile && profile.lastMessageDate === today) {
        return profile.dailyMessage;
      }

      // Nova mensagem para o dia
      const newMessage = this.getRandomDailyMessage();
      
      if (profile) {
        profile.dailyMessage = newMessage.text;
        profile.lastMessageDate = today;
        await this.saveProfile(profile);
      }
      
      return newMessage.text;
    } catch (error) {
      console.error('Erro ao obter mensagem diária:', error);
      return "A poesia é a música da alma, onde as palavras dançam ao ritmo do coração.";
    }
  }

  // Obter mensagem aleatória
  static getRandomDailyMessage(): DailyMessage {
    const randomIndex = Math.floor(Math.random() * DAILY_MESSAGES.length);
    return DAILY_MESSAGES[randomIndex];
  }

  // Atualizar estatísticas do usuário
  static async updateStats(totalPoems: number, totalWords: number, favoriteCategory: string): Promise<void> {
    try {
      const profile = await this.loadProfile();
      if (profile) {
        profile.totalPoems = totalPoems;
        profile.totalWords = totalWords;
        profile.favoriteCategory = favoriteCategory;
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  // Adicionar conquista ao perfil
  static async addAchievement(achievementKey: string): Promise<void> {
    try {
      const profile = await this.loadProfile();
      if (profile && !profile.achievements.includes(achievementKey)) {
        profile.achievements.push(achievementKey);
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao adicionar conquista:', error);
    }
  }

  // Remover conquista do perfil
  static async removeAchievement(achievementKey: string): Promise<void> {
    try {
      const profile = await this.loadProfile();
      if (profile) {
        profile.achievements = profile.achievements.filter(key => key !== achievementKey);
        await this.saveProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao remover conquista:', error);
    }
  }

  // Obter estatísticas do perfil
  static async getProfileStats(): Promise<{
    totalPoems: number;
    totalWords: number;
    achievements: number;
    joinDate: string;
    favoriteCategory: string;
  }> {
    try {
      const profile = await this.loadProfile();
      if (profile) {
        return {
          totalPoems: profile.totalPoems,
          totalWords: profile.totalWords,
          achievements: profile.achievements.length,
          joinDate: profile.joinDate,
          favoriteCategory: profile.favoriteCategory
        };
      }
      return {
        totalPoems: 0,
        totalWords: 0,
        achievements: 0,
        joinDate: new Date().toISOString().split('T')[0],
        favoriteCategory: 'Poesia'
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalPoems: 0,
        totalWords: 0,
        achievements: 0,
        joinDate: new Date().toISOString().split('T')[0],
        favoriteCategory: 'Poesia'
      };
    }
  }

  // Limpar dados do perfil
  static async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar perfil:', error);
    }
  }
}