// src/services/NotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationItem {
  id: string;
  type: 'achievement' | 'inspiration' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  timestamp: number;
  icon: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  metadata?: {
    achievementId?: string;
    actionType?: string;
    data?: any;
  };
}

export class NotificationService {
  private static readonly STORAGE_KEY = '@VersoEMusa:notifications';
  private static readonly SAMPLES_CREATED_KEY = '@VersoEMusa:samples_created';
  private static readonly MAX_NOTIFICATIONS = 50; // Limite para não acumular muito

  /**
   * Obter todas as notificações
   */
  static async getAllNotifications(): Promise<NotificationItem[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        // Ordenar por timestamp (mais recentes primeiro)
        return notifications.sort((a: NotificationItem, b: NotificationItem) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      return [];
    }
  }

  /**
   * Salvar notificações
   */
  private static async saveNotifications(notifications: NotificationItem[]): Promise<void> {
    try {
      // Manter apenas as mais recentes se exceder o limite
      const limitedNotifications = notifications.slice(0, this.MAX_NOTIFICATIONS);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('❌ Erro ao salvar notificações:', error);
    }
  }

  /**
   * Adicionar nova notificação
   */
  static async addNotification(
    type: NotificationItem['type'],
    title: string,
    message: string,
    icon: string,
    priority: NotificationItem['priority'] = 'medium',
    metadata?: NotificationItem['metadata']
  ): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      
      const newNotification: NotificationItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        time: this.formatRelativeTime(new Date()),
        timestamp: Date.now(),
        icon,
        isRead: false,
        priority,
        metadata,
      };

      const updatedNotifications = [newNotification, ...notifications];
      await this.saveNotifications(updatedNotifications);
      
      console.log('✅ Nova notificação adicionada:', title);
    } catch (error) {
      console.error('❌ Erro ao adicionar notificação:', error);
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      );
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Marcar todas como lidas
   */
  static async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
      await this.saveNotifications(updatedNotifications);
      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  }

  /**
   * Limpar todas as notificações
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 Todas as notificações foram removidas');
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error);
    }
  }

  /**
   * Remover notificação específica
   */
  static async removeNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('❌ Erro ao remover notificação:', error);
    }
  }

  /**
   * Obter contador de não lidas
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(notif => !notif.isRead).length;
    } catch (error) {
      console.error('❌ Erro ao contar não lidas:', error);
      return 0;
    }
  }

  /**
   * Adicionar notificação de conquista desbloqueada
   */
  static async addAchievementNotification(achievementTitle: string, achievementId: string): Promise<void> {
    await this.addNotification(
      'achievement',
      'Conquista Desbloqueada! 🏆',
      `Parabéns! Você conquistou "${achievementTitle}"`,
      'trophy',
      'high',
      { achievementId, actionType: 'achievement_unlocked' }
    );
  }

  /**
   * Adicionar notificação de inspiração diária
   */
  static async addInspirationNotification(prompt: string): Promise<void> {
    await this.addNotification(
      'inspiration',
      'Nova Inspiração Disponível',
      `Que tal escrever sobre "${prompt}"? Sua criatividade não tem limites!`,
      'bulb',
      'medium',
      { actionType: 'daily_inspiration', data: { prompt } }
    );
  }

  /**
   * Adicionar notificação de lembrete
   */
  static async addReminderNotification(message: string): Promise<void> {
    await this.addNotification(
      'reminder',
      'Momento Criativo',
      message,
      'create',
      'medium',
      { actionType: 'writing_reminder' }
    );
  }

  /**
   * Adicionar notificação do sistema
   */
  static async addSystemNotification(title: string, message: string): Promise<void> {
    await this.addNotification(
      'system',
      title,
      message,
      'settings',
      'low',
      { actionType: 'system_info' }
    );
  }

  /**
   * Formatar tempo relativo
   */
  private static formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Agora';
    } else if (diffMinutes < 60) {
      return `Há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Atualizar tempos relativos das notificações existentes
   */
  static async updateRelativeTimes(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        time: this.formatRelativeTime(new Date(notif.timestamp))
      }));
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('❌ Erro ao atualizar tempos relativos:', error);
    }
  }

  /**
   * Verificar se notificações de exemplo já foram criadas
   */
  static async hasCreatedSamples(): Promise<boolean> {
    try {
      const created = await AsyncStorage.getItem(this.SAMPLES_CREATED_KEY);
      return created === 'true';
    } catch (error) {
      console.error('❌ Erro ao verificar amostras:', error);
      return false;
    }
  }

  /**
   * Marcar que notificações de exemplo foram criadas
   */
  private static async markSamplesCreated(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SAMPLES_CREATED_KEY, 'true');
    } catch (error) {
      console.error('❌ Erro ao marcar amostras como criadas:', error);
    }
  }

  /**
   * Criar notificações de exemplo apenas uma vez
   */
  static async createSampleNotificationsIfNeeded(): Promise<void> {
    try {
      const hasCreated = await this.hasCreatedSamples();
      if (hasCreated) {
        console.log('📋 Notificações de exemplo já foram criadas anteriormente');
        return;
      }

      console.log('✨ Criando notificações de exemplo pela primeira vez...');

      // Adicionar notificação de boas-vindas
      await this.addSystemNotification(
        'Bem-vindo ao Verso & Musa! 🎭',
        'Sua jornada criativa começa agora. Explore, crie e inspire-se!'
      );

      // Adicionar notificação de lembrete
      await this.addReminderNotification(
        'Que tal criar algo novo hoje? Sua criatividade está esperando para brilhar!'
      );

      // Adicionar notificação de inspiração
      await this.addInspirationNotification(
        'Um momento que mudou sua perspectiva'
      );

      // Marcar como criado
      await this.markSamplesCreated();
      console.log('✅ Notificações de exemplo criadas e marcadas como concluídas');
    } catch (error) {
      console.error('❌ Erro ao criar notificações de exemplo:', error);
    }
  }

  /**
   * Limpar notificações antigas (mais de 30 dias)
   */
  static async cleanOldNotifications(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentNotifications = notifications.filter(notif => notif.timestamp > thirtyDaysAgo);

      if (recentNotifications.length !== notifications.length) {
        await this.saveNotifications(recentNotifications);
        console.log(`🧹 ${notifications.length - recentNotifications.length} notificações antigas removidas`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar notificações antigas:', error);
    }
  }

  // ========================
  // NOTIFICAÇÕES PUSH NATIVAS
  // ========================

  /**
   * Solicita permissões para notificações push
   */
  static async requestPushPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('achievement', {
          name: 'Conquistas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C5CE7',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log('📱 Status das permissões push:', finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('❌ Erro ao solicitar permissões push:', error);
      return false;
    }
  }

  /**
   * Mostra notificação push de conquista
   */
  static async showAchievementPush(title: string, description: string, points: number): Promise<void> {
    try {
      const hasPermission = await this.requestPushPermissions();
      
      if (!hasPermission) {
        // Fallback para Alert nativo
        Alert.alert(
          '🏆 Nova Conquista!',
          `${title}\n\n${description}\n\n+${points} pontos`,
          [{ text: 'Fantástico!', style: 'default' }],
          { cancelable: true }
        );
        return;
      }

      // Enviar notificação push
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Nova Conquista Desbloqueada!',
          body: `${title} - ${description} (+${points} pontos)`,
          data: {
            type: 'achievement',
            achievementTitle: title,
            points: points
          },
          sound: true,
        },
        trigger: null, // Imediato
      });

      console.log('🎉 Notificação push de conquista enviada:', title);

    } catch (error) {
      console.error('❌ Erro ao enviar push de conquista:', error);
      // Fallback
      Alert.alert('🏆 Nova Conquista!', `${title}\n\n${description}`, [{ text: 'OK' }]);
    }
  }

  /**
   * Mostra notificação push de progresso
   */
  static async showProgressPush(title: string, current: number, total: number): Promise<void> {
    try {
      const hasPermission = await this.requestPushPermissions();
      if (!hasPermission) return;

      const percentage = Math.round((current / total) * 100);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📈 Progresso em Conquista',
          body: `${title}: ${current}/${total} (${percentage}%)`,
          data: { type: 'progress', title, current, total },
          sound: false,
        },
        trigger: null,
      });

      console.log('📊 Push de progresso enviado:', title);
    } catch (error) {
      console.error('❌ Erro ao enviar push de progresso:', error);
    }
  }

  /**
   * Mostra notificação push de lembrete
   */
  static async showReminderPush(message: string): Promise<void> {
    try {
      const hasPermission = await this.requestPushPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✨ Verso & Musa',
          body: message,
          data: { type: 'reminder' },
          sound: true,
        },
        trigger: null,
      });

      console.log('🔔 Push de lembrete enviado:', message);
    } catch (error) {
      console.error('❌ Erro ao enviar push de lembrete:', error);
    }
  }

  /**
   * Configura listeners para notificações
   */
  static setupPushListeners(): void {
    // Quando recebe notificação (app em foreground)
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Push recebido:', notification.request.content.title);
    });

    // Quando usuário toca na notificação
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Push tocado:', response.notification.request.content.title);
      
      const data = response.notification.request.content.data;
      if (data?.type === 'achievement') {
        console.log('🏆 Usuário tocou em notificação de conquista');
        // Aqui pode navegar para tela de conquistas
      }
    });
  }

  /**
   * Inicializa sistema de notificações push
   */
  static async initializePushSystem(): Promise<void> {
    try {
      await this.requestPushPermissions();
      this.setupPushListeners();
      console.log('✅ Sistema de notificações push inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar push system:', error);
    }
  }
}
