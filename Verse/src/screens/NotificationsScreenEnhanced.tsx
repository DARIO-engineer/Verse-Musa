import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { NotificationService, NotificationItem } from '../services/NotificationService';

const NotificationsScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme } = useSettings();
  const isDark = activeTheme === 'dark';
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const themeColors = {
    background: isDark ? Colors.backgroundDark : Colors.background,
    surface: isDark ? Colors.surfaceDark : Colors.surface,
    textPrimary: isDark ? Colors.textPrimaryDark : Colors.textPrimary,
    textSecondary: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
    border: isDark ? Colors.borderDark : Colors.border,
  };

  // Carregar notificações quando a tela receber foco
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      // Criar notificações de exemplo apenas se necessário (primeira vez)
      await NotificationService.createSampleNotificationsIfNeeded();

      // Carregar todas as notificações
      const allNotifications = await NotificationService.getAllNotifications();

      // Atualizar tempos relativos
      await NotificationService.updateRelativeTimes();

      // Carregar novamente após atualizar os tempos
      const updatedNotifications = await NotificationService.getAllNotifications();
      setNotifications(updatedNotifications);

      console.log('📋 Notificações carregadas:', updatedNotifications.length);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);



  // Carregar notificações quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      
      // Limpar notificações antigas ao entrar na tela
      NotificationService.cleanOldNotifications();
    }, [loadNotifications])
  );

  // Função de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'inspiration':
        return {
          color: Colors.accent,
          gradient: Colors.gradientAccent,
          bgColor: `${Colors.accent}15`
        };
      case 'achievement':
        return {
          color: Colors.premium,
          gradient: ['#FFD700', '#FFA500'],
          bgColor: `${Colors.premium}15`
        };
      case 'reminder':
        return {
          color: Colors.primary,
          gradient: Colors.gradientPrimary,
          bgColor: `${Colors.primary}15`
        };
      case 'community':
        return {
          color: Colors.success,
          gradient: Colors.gradientSuccess,
          bgColor: `${Colors.success}15`
        };
      case 'system':
        return {
          color: Colors.info,
          gradient: Colors.gradientOcean,
          bgColor: `${Colors.info}15`
        };
      default:
        return {
          color: Colors.gray500,
          gradient: [Colors.gray400, Colors.gray600],
          bgColor: `${Colors.gray500}15`
        };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          borderLeftWidth: 4,
          borderLeftColor: Colors.accent,
        };
      case 'medium':
        return {
          borderLeftWidth: 3,
          borderLeftColor: Colors.warning,
        };
      default:
        return {
          borderLeftWidth: 2,
          borderLeftColor: Colors.gray400,
        };
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      
      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Limpar Todas as Notificações',
      'Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.clearAllNotifications();
              setNotifications([]);
              console.log('🧹 Todas as notificações foram removidas');
            } catch (error) {
              console.error('❌ Erro ao limpar notificações:', error);
              Alert.alert('Erro', 'Não foi possível limpar as notificações. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />

      {/* Header */}
      <LinearGradient
        colors={isDark ? Colors.gradientNight as unknown as readonly [string, string, ...string[]] : Colors.gradientPrimary as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xl,
          borderBottomLeftRadius: BorderRadius.xl,
          borderBottomRightRadius: BorderRadius.xl,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.md,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={{
            fontSize: Typography.fontSize['2xl'],
            fontWeight: Typography.fontWeight.bold,
            color: Colors.white,
          }}>
            Notificações
          </Text>

          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={markAllAsRead}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Ionicons name="checkmark-done" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {unreadCount > 0 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: Colors.accent,
              borderRadius: BorderRadius.full,
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.xs,
              marginRight: Spacing.sm,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.xs,
                fontWeight: Typography.fontWeight.bold,
                color: Colors.white,
              }}>
                {unreadCount}
              </Text>
            </View>
            <Text style={{
              fontSize: Typography.fontSize.sm,
              color: 'rgba(255,255,255,0.9)',
            }}>
              {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Lista de Notificações */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Loading indicator */}
        {loading && notifications.length === 0 && (
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.xl,
            alignItems: 'center',
            marginBottom: Spacing.lg,
          }}>
            <Ionicons name="refresh" size={24} color={Colors.primary} />
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: themeColors.textSecondary,
              marginTop: Spacing.sm,
            }}>
              Carregando notificações...
            </Text>
          </View>
        )}

        {notifications.map((notification, index) => {
          const typeInfo = getTypeInfo(notification.type);
          const priorityStyle = getPriorityStyle(notification.priority);

          return (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              style={[
                {
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  marginBottom: Spacing.md,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  ...Shadows.base,
                  opacity: notification.isRead ? 0.7 : 1,
                },
                priorityStyle,
              ]}
              activeOpacity={0.7}
            >
              {/* Ícone */}
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BorderRadius.full,
                backgroundColor: typeInfo.bgColor,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing.md,
              }}>
                <Ionicons
                  name={notification.icon as any}
                  size={24}
                  color={typeInfo.color}
                />
              </View>

              {/* Conteúdo */}
              <View style={{ flex: 1 }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: Spacing.xs,
                }}>
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.textPrimary,
                    flex: 1,
                    marginRight: Spacing.sm,
                  }}>
                    {notification.title}
                  </Text>
                  {!notification.isRead && (
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: Colors.accent,
                    }} />
                  )}
                </View>

                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
                  marginBottom: Spacing.sm,
                }}>
                  {notification.message}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: themeColors.textSecondary,
                  }}>
                    {notification.time}
                  </Text>
                  
                  <View style={{
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                    backgroundColor: typeInfo.bgColor,
                    borderRadius: BorderRadius.base,
                  }}>
                    <Text style={{
                      fontSize: Typography.fontSize.xs,
                      fontWeight: Typography.fontWeight.medium,
                      color: typeInfo.color,
                      textTransform: 'capitalize',
                    }}>
                      {notification.type === 'inspiration' ? 'Inspiração' :
                       notification.type === 'achievement' ? 'Conquista' :
                       notification.type === 'reminder' ? 'Lembrete' : 'Sistema'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Estado vazio melhorado */}
        {notifications.length === 0 && (
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing['2xl'],
            alignItems: 'center',
            marginTop: Spacing['2xl'],
            ...Shadows.base,
          }}>
            <LinearGradient
              colors={[`${Colors.primary}20`, `${Colors.accent}20`] as readonly [string, string, ...string[]]}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing.lg,
              }}
            >
              <Ionicons
                name="notifications-off-outline"
                size={40}
                color={Colors.primary}
              />
            </LinearGradient>
            
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
              textAlign: 'center',
            }}>
              Tudo em dia!
            </Text>
            
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: themeColors.textSecondary,
              textAlign: 'center',
              lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
            }}>
              Você está em dia com todas as suas notificações. Continue criando e se inspirando!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreenEnhanced;
