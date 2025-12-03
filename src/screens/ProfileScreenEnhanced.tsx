import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { useApp } from '../contexts/AppContext';
import ModernCard from '../components/UI/ModernCard';

const ProfileScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const { profile, stats, refreshData, updateProfile } = useApp();
  const { activeTheme, getThemeColors: getActiveThemeColors } = useSettings();
  const isDark = activeTheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    inspirationQuote: profile?.inspirationQuote || '',
  });

  const themeColors = getActiveThemeColors();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  useEffect(() => {
    setEditForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      inspirationQuote: profile?.inspirationQuote || '',
    });
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Falha ao atualizar o perfil. Tente novamente.');
    }
  };

  const menuOptions = {
    content: [
      { title: 'Conquistas', icon: 'trophy-outline', screen: 'Achievements' },
      { title: 'Meus Templates', icon: 'bookmark-outline', screen: 'Templates' },
      { title: 'Gerir Categorias', icon: 'albums-outline', screen: 'ManageCategories' },
    ],
    app: [
      { title: 'Notificações', icon: 'notifications-outline', screen: 'Notifications' },
      { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
      { title: 'Sobre', icon: 'information-circle-outline', screen: 'About' },
    ],
  };

  const renderAvatar = (size = 80) => {
    const name = profile?.name || 'Poeta Anônimo';
    const initial = name.charAt(0).toUpperCase();
    
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: themeColors.surface,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: Colors.white,
        }}
      >
        <Text
          style={{
            fontSize: size / 2.5,
            fontWeight: 'bold',
            color: themeColors.primary,
          }}
        >
          {initial}
        </Text>
      </View>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
          <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
            <Ionicons name="close" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: 'bold',
            color: themeColors.textPrimary,
          }}>
            Editar Perfil
          </Text>
          <TouchableOpacity onPress={handleSaveProfile}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: 'bold',
              color: themeColors.primary,
            }}>
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
          <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
            {renderAvatar(100)}
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: 'bold',
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Nome
            </Text>
            <TextInput
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              style={{
                backgroundColor: themeColors.surface,
                borderWidth: 1,
                borderColor: themeColors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
              }}
              placeholder="Seu nome"
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: 'bold',
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Bio
            </Text>
            <TextInput
              value={editForm.bio}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
              style={{
                backgroundColor: themeColors.surface,
                borderWidth: 1,
                borderColor: themeColors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                minHeight: 100,
              }}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: 'bold',
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Frase de Inspiração
            </Text>
            <TextInput
              value={editForm.inspirationQuote}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, inspirationQuote: text }))}
              style={{
                backgroundColor: themeColors.surface,
                borderWidth: 1,
                borderColor: themeColors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
              }}
              placeholder="Sua frase inspiradora..."
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={themeColors.background} 
      />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} tintColor={themeColors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço extra para o AppNavigator
      >
        {/* Header */}
        <View style={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.xl,
          paddingTop: Spacing.md,
          backgroundColor: themeColors.surface,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: Spacing.md }}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={{ padding: Spacing.sm }}>
              <Ionicons name="create-outline" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {renderAvatar(80)}
            <View style={{ marginLeft: Spacing.lg, flex: 1 }}>
              <Text style={{
                fontSize: Typography.fontSize['2xl'],
                fontWeight: 'bold',
                color: themeColors.textPrimary,
              }}>
                {profile?.name || 'Poeta Anônimo'}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textSecondary,
                fontStyle: 'italic',
                marginTop: Spacing.xs,
              }}>
                "{profile?.inspirationQuote || 'A poesia é a música da alma'}"
              </Text>
            </View>
          </View>
        </View>

        {/* Estatísticas Melhoradas */}
        <View style={{ padding: Spacing.lg }}>
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.lg,
          }}>
            Sua Jornada Poética
          </Text>

          {/* Cards de estatísticas com melhor design */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard 
                title="Total de Obras" 
                value={stats.totalPoems} 
                icon="book" 
                gradient={themeColors.gradientPrimary}
                trend={stats.totalPoems > 0 ? "up" : "neutral"}
                trendValue={stats.totalPoems > 0 ? `+${stats.totalPoems}` : "Primeira obra?"}
              />
            </View>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard 
                title="Palavras Escritas" 
                value={stats.totalWords?.toLocaleString() || '0'} 
                icon="text" 
                gradient={themeColors.gradientSecondary}
                trend={stats.totalWords > 0 ? "up" : "neutral"}
                trendValue={
                  stats.totalWords === 0 ? "Primeira palavra?" :
                  stats.totalWords < 100 ? "Ótimo começo!" :
                  stats.totalWords < 500 ? "Progredindo!" :
                  "Poeta dedicado! 🎭"
                }
              />
            </View>
            <View style={{ width: '48%', marginBottom: Spacing.md }}>
              <ModernCard 
                title="Categorias" 
                value={stats.categoriesExplored} 
                icon="albums" 
                gradient={themeColors.gradientAccent}
                trend={stats.categoriesExplored > 1 ? "up" : "neutral"}
                trendValue={
                  stats.categoriesExplored === 0 ? "Explore estilos!" :
                  stats.categoriesExplored === 1 ? "Primeiro estilo!" :
                  "Versátil! 🎨"
                }
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
                gradient={['#F59E0B', '#FB923C']}
                trend={(profile?.currentStreak || 0) > 0 ? "up" : "neutral"}
                trendValue={
                  (profile?.currentStreak || 0) === 0 
                    ? "🚀 Vamos lá!" 
                    : (profile?.currentStreak || 0) > 1 ? '+1 dia' : 'Nova!'
                }
              />
            </View>
          </View>

          {/* Seção de progresso */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginTop: Spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <Ionicons name="trending-up" size={20} color={themeColors.primary} />
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginLeft: Spacing.sm,
              }}>
                Progresso Semanal
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                }}>
                  Meta semanal: 3 obras
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                  marginTop: 2,
                }}>
                  Você está indo bem! 🎯
                </Text>
              </View>
              <View style={{
                backgroundColor: themeColors.primary,
                borderRadius: BorderRadius.full,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
              }}>
                <Text style={{
                  color: Colors.white,
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.bold,
                }}>
                  {Math.min(stats.totalPoems, 3)}/3
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu de opções */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.md,
          }}>
            Conteúdo
          </Text>
          {menuOptions.content.map(item => (
            <TouchableOpacity
              key={item.title}
              style={{
                backgroundColor: themeColors.surface,
                padding: Spacing.lg,
                borderRadius: BorderRadius.lg,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Spacing.md,
              }}
              onPress={() => (navigation as any).navigate(item.screen)}
            >
              <Ionicons name={item.icon as any} size={22} color={themeColors.primary} />
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                marginLeft: Spacing.md,
                flex: 1,
              }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ))}

          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.md,
            marginTop: Spacing.lg,
          }}>
            Aplicação
          </Text>
          {menuOptions.app.map(item => (
            <TouchableOpacity
              key={item.title}
              style={{
                backgroundColor: themeColors.surface,
                padding: Spacing.lg,
                borderRadius: BorderRadius.lg,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Spacing.md,
              }}
              onPress={() => (navigation as any).navigate(item.screen)}
            >
              <Ionicons name={item.icon as any} size={22} color={themeColors.primary} />
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                marginLeft: Spacing.md,
                flex: 1,
              }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
};

export default ProfileScreenEnhanced;
