import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { getThemeColors, Colors, Spacing, BorderRadius, Shadows, Typography } from '../styles/DesignSystem';
import { Card, Button, Loading } from '../components/UI';
import { EnhancedAchievementService, Achievement } from '../services/EnhancedAchievementService';
import { AchievementViewService } from '../services/AchievementViewService';

const { width } = Dimensions.get('window');

const EnhancedAchievementsScreen: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [unviewedAchievements, setUnviewedAchievements] = useState<Set<string>>(new Set());
  const [animatingAchievements, setAnimatingAchievements] = useState<Set<string>>(new Set());
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  
  const { settings } = useSettings();
  const themeColors = getThemeColors(settings?.themeVariant ?? 'default', settings?.darkTheme ?? false);

  // Animações para cada card - criar apenas quando necessário
  const cardAnimations = React.useMemo(() => 
    achievements.map(() => ({
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
    })), [achievements.length]
  );

  useEffect(() => {
    loadAchievements();
  }, []);

  // Animar conquistas desbloqueadas não vistas
  useEffect(() => {
    achievements.forEach((achievement, index) => {
      if (achievement.unlockedAt && unviewedAchievements.has(achievement.id)) {
        // Pequeno delay para escalonar as animações
        setTimeout(() => {
          animateCardTwice(achievement.id);
        }, index * 200);
      }
    });
  }, [achievements, unviewedAchievements]);

  // Helper para formatar data de forma segura
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.warn('Erro ao formatar data:', error);
      return '';
    }
  };

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        EnhancedAchievementService.getAchievementsWithProgress(),
        EnhancedAchievementService.getAchievementStats(),
      ]);
      
      // Converter unlockedAt para Date se necessário
      const processedAchievements = achievementsData.map(achievement => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt 
          ? typeof achievement.unlockedAt === 'string'
            ? achievement.unlockedAt
            : achievement.unlockedAt instanceof Date 
              ? achievement.unlockedAt.toISOString()
              : new Date(achievement.unlockedAt).toISOString()
          : undefined
      }));
      
      setAchievements(processedAchievements);
      setStats(statsData);

      // Verificar conquistas não vistas
      const unviewed = await AchievementViewService.getUnviewedAchievements(processedAchievements);
      const unviewedIds = new Set(unviewed.map(a => a.id));
      setUnviewedAchievements(unviewedIds);
      
      console.log('🎯 Conquistas não vistas:', unviewedIds.size);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter(a => a.unlockedAt);
      case 'locked':
        return achievements.filter(a => !a.unlockedAt);
      case 'writing':
        return achievements.filter(a => a.category === 'writing');
      case 'milestones':
        return achievements.filter(a => a.category === 'milestone');
      case 'creativity':
        return achievements.filter(a => a.category === 'creativity');
      case 'consistency':
        return achievements.filter(a => a.category === 'consistency');
      case 'special':
        return achievements.filter(a => a.category === 'special');
      default:
        return achievements;
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'epic':
        return ['#9C27B0', '#E91E63', '#FF5722'];
      case 'rare':
        return ['#2196F3', '#00BCD4', '#009688'];
      default:
        return ['#4CAF50', '#8BC34A', '#CDDC39'];
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 5;
      case 'epic': return 4;
      case 'rare': return 3;
      default: return 2;
    }
  };

  const animateCardTwice = (achievementId: string) => {
    if (animatingAchievements.has(achievementId)) return; // Já está animando
    
    // Encontrar o índice do achievement
    const index = achievements.findIndex(a => a.id === achievementId);
    if (index === -1) return;
    
    const animation = cardAnimations[index];
    if (!animation) return;
    
    setAnimatingAchievements(prev => new Set(prev).add(achievementId));
    
    // Reset para garantir posição inicial
    animation.rotate.setValue(0);
    
    // Animação de 2 rotações completas
    Animated.sequence([
      Animated.timing(animation.rotate, {
        toValue: 1, // 360 graus
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animation.rotate, {
        toValue: 2, // 720 graus  
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Ao terminar, parar na posição original
      animation.rotate.setValue(0);
      setAnimatingAchievements(prev => {
        const newSet = new Set(prev);
        newSet.delete(achievementId);
        return newSet;
      });
    });
  };

  // Processar fila de notificações
  useEffect(() => {
    if (notificationQueue.length > 0 && !notificationVisible) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationVisible(true);
      
      // Remove da fila
      setNotificationQueue(prev => prev.slice(1));
      
      // Auto-hide após 4 segundos
      setTimeout(() => {
        setNotificationVisible(false);
        setTimeout(() => setCurrentNotification(null), 300);
      }, 4000);
    }
  }, [notificationQueue, notificationVisible]);

  const handleCardPress = (achievement: Achievement, index: number) => {
    const animation = cardAnimations[index];
    if (animation) {
      Animated.sequence([
        Animated.timing(animation.scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animation.scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Marcar como vista se foi desbloqueada
    if (achievement.unlockedAt) {
      AchievementViewService.markAchievementAsViewed(achievement.id);
      setUnviewedAchievements(prev => {
        const newSet = new Set(prev);
        newSet.delete(achievement.id);
        return newSet;
      });
    }
    
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const renderAchievementCard = ({ item: achievement, index }: { item: Achievement; index: number }) => {
    const isUnlocked = !!achievement.unlockedAt;
    const colors = getRarityGradient(achievement.rarity);
    const stars = getRarityStars(achievement.rarity);
    const progressPercentage = achievement.progress && achievement.maxProgress 
      ? (achievement.progress / achievement.maxProgress) * 100 
      : 0;
    
    const animation = cardAnimations[index] || {
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
    };

    const rotateInterpolation = animation.rotate.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['0deg', '180deg', '360deg'],
    });

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => handleCardPress(achievement, index)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.achievementCard,
            {
              backgroundColor: isUnlocked ? themeColors.surface : themeColors.surface + 'AA',
              transform: [
                { scale: animation.scale },
                { rotate: isUnlocked ? rotateInterpolation : '0deg' },
              ],
            },
          ]}
        >
          {/* Efeito de brilho para conquistas desbloqueadas */}
          {isUnlocked && (
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  backgroundColor: colors[0] + '30',
                  opacity: isUnlocked ? 0.6 : 0,
                },
              ]}
            />
          )}

          {/* Indicador de "não visto" */}
          {isUnlocked && unviewedAchievements.has(achievement.id) && (
            <View style={styles.unviewedIndicator}>
              <View style={styles.unviewedDot} />
            </View>
          )}

          {/* Header do card com raridade */}
          <View style={styles.cardHeader}>
            <View style={styles.rarityContainer}>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={12}
                  color={i < stars ? colors[0] : themeColors.border}
                />
              ))}
            </View>
            {isUnlocked && (
              <View style={[styles.unlockedBadge, { backgroundColor: colors[0] }]}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>

          {/* Ícone principal */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.iconBackground,
                {
                  backgroundColor: isUnlocked ? colors[0] + '20' : themeColors.border + '20',
                  transform: [{ rotate: isUnlocked ? rotateInterpolation : '0deg' }],
                },
              ]}
            >
              <Ionicons
                name={achievement.icon as any}
                size={40}
                color={isUnlocked ? colors[0] : themeColors.textSecondary}
              />
            </Animated.View>
          </View>

          {/* Conteúdo */}
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.achievementTitle,
                {
                  color: isUnlocked ? themeColors.textPrimary : themeColors.textSecondary,
                  fontWeight: isUnlocked ? 'bold' : 'normal',
                }
              ]}
              numberOfLines={2}
            >
              {achievement.title}
            </Text>
            
            <Text
              style={[
                styles.achievementDescription,
                { color: themeColors.textSecondary }
              ]}
              numberOfLines={3}
            >
              {achievement.description}
            </Text>
          </View>

          {/* Progresso */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
              <Text style={[styles.pointsText, { color: colors[0] }]}>
                {achievement.points} pts
              </Text>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: isUnlocked ? colors[0] : colors[0] + '60',
                  },
                ]}
              />
            </View>
          </View>

          {/* Data de desbloqueio */}
          {isUnlocked && achievement.unlockedAt && (
            <View style={styles.unlockedDate}>
              <Text style={[styles.dateText, { color: colors[0] }]}>
                🎉 {formatDate(achievement.unlockedAt)}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => {
    const filters = [
      { key: 'all', label: 'Todas', icon: 'grid' },
      { key: 'unlocked', label: 'Desbloqueadas', icon: 'checkmark-circle' },
      { key: 'locked', label: 'Bloqueadas', icon: 'lock-closed' },
      { key: 'writing', label: 'Escrita', icon: 'create' },
      { key: 'milestones', label: 'Marcos', icon: 'flag' },
      { key: 'creativity', label: 'Criatividade', icon: 'color-palette' },
      { key: 'consistency', label: 'Consistência', icon: 'time' },
      { key: 'special', label: 'Especiais', icon: 'star' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filterItem => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === filterItem.key 
                  ? Colors.primary 
                  : themeColors.surface,
              }
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Ionicons
              name={filterItem.icon as any}
              size={16}
              color={filter === filterItem.key ? Colors.white : themeColors.textPrimary}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === filterItem.key 
                    ? Colors.white 
                    : themeColors.textPrimary,
                }
              ]}
            >
              {filterItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <Loading />
      </View>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  const handleResetAchievements = async () => {
    try {
      await EnhancedAchievementService.clearAllAchievements();
      console.log('🧹 Conquistas resetadas manualmente');
      loadAchievements(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao resetar conquistas:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header com estatísticas */}
      {stats && (
        <Card variant="elevated" isDark={settings?.darkTheme} style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {stats.unlockedCount}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Desbloqueadas
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.accent }]}>
                {stats.totalPoints}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Pontos
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                {Math.round((stats.unlockedCount / stats.totalCount) * 100)}%
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Progresso
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Botão de Reset Temporário (DEBUG) */}
      <TouchableOpacity 
        style={[styles.resetButton, { backgroundColor: '#FF6B6B' }]}
        onPress={handleResetAchievements}
      >
        <Ionicons name="refresh" size={16} color="white" />
        <Text style={styles.resetButtonText}>Reset Conquistas</Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filtersWrapper}>
        {renderFilters()}
      </View>

      {/* Lista de conquistas */}
      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievementCard}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />

      {/* Modal de detalhes */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            {selectedAchievement && (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons
                    name={selectedAchievement.icon as any}
                    size={60}
                    color={getRarityGradient(selectedAchievement.rarity)[0]}
                  />
                  <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
                    {selectedAchievement.title}
                  </Text>
                  <Text style={[styles.modalDescription, { color: themeColors.textSecondary }]}>
                    {selectedAchievement.description}
                  </Text>
                </View>

                <View style={styles.modalStats}>
                  <Text style={[styles.modalStatText, { color: themeColors.textPrimary }]}>
                    Progresso: {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                  </Text>
                  <Text style={[styles.modalStatText, { color: themeColors.textPrimary }]}>
                    Pontos: {selectedAchievement.points}
                  </Text>
                  <Text style={[styles.modalStatText, { color: themeColors.textPrimary }]}>
                    Raridade: {selectedAchievement.rarity.toUpperCase()}
                  </Text>
                  {selectedAchievement.unlockedAt && (
                    <Text style={[styles.modalStatText, { color: Colors.success }]}>
                      Desbloqueada em: {formatDate(selectedAchievement.unlockedAt)}
                    </Text>
                  )}
                </View>

                <Button
                  title="Fechar"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  fullWidth
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Notificação de conquista desbloqueada */}
      {currentNotification && (
        <Animated.View 
          style={[
            styles.notificationContainer,
            {
              opacity: notificationVisible ? 1 : 0,
              transform: [{
                translateY: notificationVisible ? 0 : -100
              }]
            }
          ]}
        >
          <View style={[styles.notificationCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationBadge}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
              </View>
              <Text style={[styles.notificationTitle, { color: themeColors.textPrimary }]}>
                Conquista Desbloqueada!
              </Text>
            </View>
            <Text style={[styles.notificationAchievementTitle, { color: themeColors.primary }]}>
              {currentNotification.title}
            </Text>
            <Text style={[styles.notificationDescription, { color: themeColors.textSecondary }]}>
              {currentNotification.description}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: 'white',
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  filtersWrapper: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.xs,
    flexShrink: 1,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (width - Spacing.lg * 3) / 2,
    marginBottom: Spacing.lg,
  },
  achievementCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
  },
  unviewedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  unviewedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4757',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  rarityContainer: {
    flexDirection: 'row',
  },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  achievementTitle: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 'auto',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
  },
  pointsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  unlockedDate: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  dateText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalStats: {
    marginBottom: Spacing.lg,
  },
  modalStatText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notificationCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  notificationBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationAchievementTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  notificationDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
});

export default EnhancedAchievementsScreen;
