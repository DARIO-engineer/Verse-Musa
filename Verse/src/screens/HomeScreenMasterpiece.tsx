import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import ModernCard from '../components/UI/ModernCard';
import { Avatar } from '../components/UI';
import AchievementCelebrationModal from '../components/AchievementCelebrationModal';
import { useApp } from '../contexts/AppContext';
import { EnhancedAchievementService } from '../services/EnhancedAchievementService';
import { NavigationHelper } from '../utils/NavigationHelper';

const DAILY_QUOTES = [
  "A poesia é a música da alma",
  "Cada verso é uma nova descoberta",
  "Inspire-se e transforme palavras em arte",
  "Hoje é um novo dia para criar",
  "Sua criatividade não tem limites",
  "Cada poema é uma jornada única",
  "Deixe sua alma falar através das palavras",
];

const { width } = Dimensions.get('window');

// Funções para formatação de data/hora
const formatDateTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateInfo = (createdAt: string | Date, updatedAt: string | Date) => {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
  
  // Se a diferença entre criação e atualização for menor que 1 minuto, mostrar só a criação
  const diffInMinutes = (updated.getTime() - created.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 1) {
    return formatDateTime(created);
  } else {
    return `Modificado em ${formatDateTime(updated)}`;
  }
};

interface HomeStats {
  totalPoems: number;
  currentStreak: number;
  wordsWritten: number;
  categoriesExplored: number;
}

interface QuickAction {
  title: string;
  icon: string;
  gradient: string[];
  onPress: () => void;
}

const HomeScreenMasterpiece: React.FC = () => {
  const { drafts, profile, loading, stats, refreshData } = useApp();
  const { activeTheme, getThemeColors } = useSettings();
  const isDark = activeTheme === 'dark';
  const themeColors = getThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const navigation = useNavigation();
  const { settings } = useSettings();

  const quickActions: QuickAction[] = [
    {
      title: '✏️ Criar Poema',
      icon: 'create-outline',
      gradient: Array.isArray(themeColors.gradientPrimary) ? themeColors.gradientPrimary : Colors.gradientPrimary,
      onPress: () => navigation.navigate('CreateTab' as never),
    },
    {
      title: '📚 Meus Rascunhos',
      icon: 'documents-outline',
      gradient: Array.isArray(themeColors.gradientSecondary) ? themeColors.gradientSecondary : Colors.gradientSecondary,
      onPress: () => navigation.navigate('ObrasTab' as never),
    },
  ];

  // Adicionar Musa apenas se estiver habilitada nas configurações
  if (settings?.showMusa) {
    quickActions.push({
      title: '✨ Musa IA',
      icon: 'sparkles-outline',
      gradient: Array.isArray(themeColors.gradientAccent) ? themeColors.gradientAccent : Colors.gradientAccent,
      onPress: () => navigation.navigate('MusaTab' as never),
    });
  }

  const checkForNewAchievements = async () => {
    try {
      // Verificar conquistas baseadas nos rascunhos atuais
      await EnhancedAchievementService.checkAndUpdateAchievements(
        'user_current', // Um ID de usuário padrão ou obtido do perfil
        'poem_created', // Ação de verificação geral
        { totalPoems: drafts.length }
      );
      
      const achievements = await EnhancedAchievementService.getUserAchievements('user_current');
      const newUnlocked = achievements.filter(a => a.unlockedAt);
      
      if (newUnlocked.length > 0) {
        setNewAchievement(newUnlocked[0]);
        setShowAchievementModal(true);
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  };

  // Atualizar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen recebeu foco - atualizando dados...');
      refreshData();
      checkForNewAchievements();
    }, [refreshData])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      await checkForNewAchievements();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados. Tente novamente.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const generateDailyQuote = () => {
    const today = new Date().getDate();
    const quote = DAILY_QUOTES[today % DAILY_QUOTES.length];
    setDailyQuote(quote);
  };

  useEffect(() => {
    generateDailyQuote();
    checkForNewAchievements();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 160 }} // Ajustado para nova altura do tab navigator
      >
        {/* Header com gradiente */}
        <LinearGradient
          colors={themeColors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.xl,
            borderBottomLeftRadius: BorderRadius.xl,
            borderBottomRightRadius: BorderRadius.xl,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: Spacing.xs,
              }}>
                {getGreeting()}, {profile?.name || 'Poeta'}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize['4xl'],
                fontWeight: Typography.fontWeight.bold,
                color: Colors.white,
                marginBottom: Spacing.sm,
              }}>
                {settings?.showMusa ? 'Verso & Musa' : 'Verso'}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 24,
              }}>
                {dailyQuote}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => NavigationHelper.navigateToProfile()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Avatar 
                name={profile?.name} 
                photoUri={profile?.photoUri}
                size={32}
                showOnlyInitial={true}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Cards de estatísticas */}
        <View style={{ padding: Spacing.lg }}>
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.lg,
          }}>
            Suas Estatísticas
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            marginBottom: Spacing.xl,
          }}>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard
                title="Total de Obras"
                value={stats.totalPoems}
                icon="book"
                gradient={themeColors.gradientPrimary}
                trend={stats.totalPoems > 0 ? "up" : "neutral"}
                trendValue={stats.totalPoems > 0 ? `${stats.totalPoems}` : "0"}
              />
            </View>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard
                title="Sequência Atual"
                value={
                  (profile?.currentStreak || 0) === 0 
                    ? "Comece hoje!" 
                    : `${profile?.currentStreak || 0} ${(profile?.currentStreak || 0) === 1 ? 'dia' : 'dias'}`
                }
                icon={(profile?.currentStreak || 0) === 0 ? "rocket-outline" : "flame"}
                gradient={themeColors.gradientSecondary}
                trend={(profile?.currentStreak || 0) > 0 ? "up" : "neutral"}
                trendValue={
                  (profile?.currentStreak || 0) === 0 
                    ? "🚀 Vamos lá!" 
                    : (profile?.currentStreak || 0) > 1 ? '+1' : 'Nova!'
                }
              />
            </View>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard
                title="Palavras Escritas"
                value={stats.totalWords?.toLocaleString() || '0'}
                icon="text"
                gradient={themeColors.gradientAccent}
                trend={stats.totalWords > 0 ? "up" : "neutral"}
                trendValue={
                  stats.totalWords === 0 ? "Primeira palavra?" :
                  stats.totalWords < 50 ? "Ótimo começo!" :
                  stats.totalWords < 200 ? "Que progresso!" :
                  stats.totalWords < 500 ? "Incrível!" :
                  "Poeta dedicado! 🎭"
                }
              />
            </View>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard
                title="Categorias"
                value={stats.categoriesExplored}
                icon="albums"
                gradient={themeColors.gradientSecondary}
                trend={stats.categoriesExplored > 0 ? "up" : "neutral"}
                trendValue={
                  stats.categoriesExplored === 0 ? "Explore estilos!" :
                  stats.categoriesExplored === 1 ? "Primeiro estilo!" :
                  stats.categoriesExplored < 3 ? "Diversificando!" :
                  "Versátil! 🎨"
                }
              />
            </View>
          </View>

          {/* Ações rápidas */}
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.lg,
          }}>
            Ações Rápidas
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: Spacing.xl,
          }}>
            {quickActions.map((action, index) => (              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                activeOpacity={0.7}
                style={{
                  width: '48%',
                  marginBottom: Spacing.md,
                }}
              >
                <LinearGradient
                  colors={(Array.isArray(action.gradient) ? action.gradient : Colors.gradientPrimary) as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.lg,
                    alignItems: 'center',
                    ...Shadows.md,
                  }}
                >
                  <Ionicons name={action.icon as any} size={32} color={Colors.white} />
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: Colors.white,
                    marginTop: Spacing.sm,
                    textAlign: 'center',
                  }}>
                    {action.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Últimos poemas */}
          {drafts.length > 0 && (
            <>
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: isDark ? Colors.textPrimaryDark : Colors.textPrimary,
                marginBottom: Spacing.lg,
              }}>
                Obras Recentes
              </Text>

              {drafts
                .sort((a, b) => {
                  // Ordenar por data de modificação (updatedAt) ou criação (createdAt), mais recente primeiro
                  const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                  const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                  return dateB - dateA;
                })
                .slice(0, 3)
                .map((draft) => (
                <TouchableOpacity
                  key={draft.id}
                  onPress={() => {
                    console.log('🔎 Visualizando rascunho do Home:', draft.id);
                    try {
                      (navigation as any).navigate('ViewDraft', { draftId: draft.id });
                    } catch (error) {
                      console.error('Erro ao navegar para ViewDraft:', error);
                      const success = NavigationHelper.navigateToEditDraft(draft.id, 'Home');
                      if (!success) (navigation as any).navigate('ObrasTab');
                    }
                  }}
                  style={{
                    backgroundColor: isDark ? Colors.surfaceDark : Colors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.lg,
                    marginBottom: Spacing.md,
                    ...Shadows.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: Typography.fontSize.xl,
                        fontWeight: Typography.fontWeight.bold,
                        color: isDark ? Colors.textPrimaryDark : Colors.textPrimary,
                        marginBottom: Spacing.xs,
                        lineHeight: Typography.fontSize.xl * 1.2,
                      }}>
                        {draft.title}
                      </Text>
                      <Text style={{
                        fontSize: Typography.fontSize.sm,
                        color: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
                        marginBottom: Spacing.xs,
                      }}>
                        {draft.category}
                      </Text>
                      <Text style={{
                        fontSize: Typography.fontSize.xs,
                        color: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
                        marginBottom: Spacing.sm,
                        fontStyle: 'italic',
                      }}>
                        {formatDateInfo(draft.createdAt, draft.updatedAt)}
                      </Text>
                      <Text 
                        style={{
                          fontSize: Typography.fontSize.sm,
                          color: isDark ? Colors.textSecondaryDark : Colors.textSecondary,
                          lineHeight: 20,
                        }}
                        numberOfLines={2}
                      >
                        {draft.content}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          try {
                            (navigation as any).navigate('EditDraft', { draftId: draft.id, originScreen: 'Home' });
                          } catch (err) {
                            console.error('Erro ao navegar para EditDraft:', err);
                            NavigationHelper.navigateToEditDraft(draft.id, 'Home');
                          }
                        }}
                        style={{ marginRight: Spacing.sm, backgroundColor: Colors.primary, padding: Spacing.xs, borderRadius: BorderRadius.full }}
                      >
                        <Ionicons name="create" size={16} color="#fff" />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.textSecondaryDark : Colors.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => {
          console.log('🎯 FAB pressed - navegando para CreateTab');
          (navigation as any).navigate('CreateTab');
        }}
        style={{
          position: 'absolute',
          bottom: 100, // Ajustar para nova altura do tab navigator
          right: Spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: themeColors.primary || Colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="add" 
          size={28} 
          color={themeColors.white || '#FFFFFF'} 
          style={{
            textAlign: 'center',
            includeFontPadding: false,
          }}
        />
      </TouchableOpacity>

      {/* Modal de conquistas */}
      <AchievementCelebrationModal
        visible={showAchievementModal}
        achievement={newAchievement}
        userName={profile?.name}
        onClose={() => {
          setShowAchievementModal(false);
          setNewAchievement(null);
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreenMasterpiece;
