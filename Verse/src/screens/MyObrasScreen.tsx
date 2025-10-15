import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  TextInput,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { useApp } from '../contexts/AppContext';
import { Draft } from '../services/DraftService';
import { NavigationHelper } from '../utils/NavigationHelper';
import { CategoryService, Category } from '../services/CategoryService';
import { ExportService } from '../services/ExportService';
import TypeNameDisplay from '../components/UI/TypeNameDisplay';
import SimpleCache from '../utils/SimpleCache';


const MyObrasScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMassSelectionModal, setShowMassSelectionModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  
  const navigation = useNavigation();
  const { drafts, loading, loadDrafts, deleteDraft, stats } = useApp();
  const { activeTheme, getThemeColors: getGlobalThemeColors } = useSettings();
  const themeColors = getGlobalThemeColors();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Garantir que as categorias sejam inicializadas e carregadas
    const initializeAndLoadCategories = async () => {
      try {
        await CategoryService.initializeDefaultCategories();
        await loadCategories();
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Tentar só carregar se a inicialização falhar
        await loadCategories();
      }
    };
    
    initializeAndLoadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('🔄 Carregando categorias...');
      const allCategories = await CategoryService.getAllCategories();
      console.log('✅ Categorias carregadas:', allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
    }
  };

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 MyObras: Tela focada, recarregando dados...');
      // Invalidar cache primeiro para garantir dados frescos
      SimpleCache.invalidateDrafts();
      // Forçar recarga completa para garantir dados atualizados
      loadDrafts(true); // true = forceReload
      loadCategories(); // Também recarregar categorias
    }, [loadDrafts])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDrafts();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar seus rascunhos.');
    } finally {
      setRefreshing(false);
    }
  }, [loadDrafts]);

  const handleDeleteDraft = useCallback((draft: Draft) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${draft.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDraft(draft.id);
              Alert.alert('Sucesso', 'Rascunho excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o rascunho.');
            }
          },
        },
      ]
    );
  }, [deleteDraft]);

  const handleEditDraft = useCallback((draft: Draft) => {
    console.log('🎯 Navegando para edição do rascunho:', draft.id);
    try {
      // Usar navegação direta como no HomeScreen
      (navigation as any).navigate('EditDraft', { 
        draft, 
        originScreen: 'Obras' 
      });
      console.log('✅ Navegação direta executada com sucesso');
    } catch (error) {
      console.error('❌ Erro na navegação direta, tentando NavigationHelper:', error);
      // Fallback para NavigationHelper se a navegação direta falhar
      const success = NavigationHelper.navigateToEditDraft(draft.id, 'Obras');
      
      if (!success) {
        console.error('❌ Falha ao navegar para EditDraft. Verifique a configuração do NavigationHelper.');
        Alert.alert('Erro de Navegação', 'Não foi possível abrir a tela de edição. Tente novamente mais tarde.');
      }
    }
  }, [navigation]);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
      return `Criado em ${formatDateTime(created)}`;
    } else {
      return `Criado em ${formatDateTime(created)}\nÚltima modificação: ${formatDateTime(updated)}`;
    }
  };

  // Funções para seleção múltipla
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedDrafts(new Set());
  };

  const toggleDraftSelection = (draftId: string) => {
    const newSelection = new Set(selectedDrafts);
    if (newSelection.has(draftId)) {
      newSelection.delete(draftId);
    } else {
      newSelection.add(draftId);
    }
    setSelectedDrafts(newSelection);
  };

  const selectAllDrafts = () => {
    const allDraftIds = new Set(filteredDrafts.map(draft => draft.id));
    setSelectedDrafts(allDraftIds);
  };

  const deselectAllDrafts = () => {
    setSelectedDrafts(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedDrafts.size === 0) return;

    Alert.alert(
      'Excluir Obras',
      `Tem certeza que deseja excluir ${selectedDrafts.size} obra${selectedDrafts.size !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const draftId of selectedDrafts) {
                await deleteDraft(draftId);
              }
              setSelectedDrafts(new Set());
              setSelectionMode(false);
              Alert.alert('Sucesso', `${selectedDrafts.size} obra${selectedDrafts.size !== 1 ? 's' : ''} excluída${selectedDrafts.size !== 1 ? 's' : ''} com sucesso!`);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir algumas obras.');
            }
          },
        },
      ]
    );
  };

  const handleBulkEdit = () => {
    if (selectedDrafts.size === 0) {
      Alert.alert('Aviso', 'Nenhuma obra selecionada.');
      return;
    }

    if (selectedDrafts.size === 1) {
      // Se apenas uma obra selecionada, navegar diretamente para edição
      const draftId = Array.from(selectedDrafts)[0];
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        handleEditDraft(draft);
        setSelectionMode(false);
        setSelectedDrafts(new Set());
      }
    } else {
      // Para múltiplas obras, mostrar opções
      Alert.alert(
        'Editar Múltiplas Obras',
        'Escolha como deseja editar as obras selecionadas:',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Editar Uma por Uma',
            onPress: () => {
              const selectedIds = Array.from(selectedDrafts);
              const selectedDraftsList = drafts.filter(d => selectedIds.includes(d.id));
              
              // Navegar para primeira obra
              if (selectedDraftsList.length > 0) {
                handleEditDraft(selectedDraftsList[0]);
                setSelectionMode(false);
                setSelectedDrafts(new Set());
              }
            }
          }
        ]
      );
    }
  };

  const handleBulkExport = () => {
    // Implementar exportação múltipla (para implementação futura)
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de exportação múltipla será implementada em breve.');
  };

  const handleCardPress = (draft: Draft) => {
    if (selectionMode) {
      toggleDraftSelection(draft.id);
    } else {
      try {
        (navigation as any).navigate('ViewDraft', { draftId: draft.id });
      } catch (error) {
        console.error('Erro ao navegar para ViewDraft, fallback para EditDraft', error);
        handleEditDraft(draft);
      }
    }
  };

  const handleCardLongPress = (draft: Draft) => {
    if (!selectionMode) {
      setSelectedDraft(draft);
      setShowOptionsModal(true);
    }
  };

  const handleSelectDraft = () => {
    if (selectedDraft) {
      setShowOptionsModal(false);
      setSelectionMode(true);
      setSelectedDrafts(new Set([selectedDraft.id]));
      setSelectedDraft(null);
    }
  };

  const handleEditFromModal = () => {
    if (selectedDraft) {
      setShowOptionsModal(false);
      handleEditDraft(selectedDraft);
      setSelectedDraft(null);
    }
  };

  const handleDeleteFromModal = () => {
    if (selectedDraft) {
      setShowOptionsModal(false);
      handleDeleteDraft(selectedDraft);
      setSelectedDraft(null);
    }
  };

  const handleExportFromModal = () => {
    if (selectedDraft) {
      setShowOptionsModal(false);
      ExportService.showExportOptions(selectedDraft);
      setSelectedDraft(null);
    }
  };

  // Filtrar rascunhos baseado na categoria e busca
  const filteredDrafts = drafts.filter(draft => {
    const matchesCategory = selectedCategory === 'Todos' || 
      categories.find(cat => cat.name === selectedCategory && 
        (cat.id === draft.typeId || 
         (!draft.typeId && draft.category && 
          ((draft.category === 'Poesia' && cat.id === 'poesia') ||
           (draft.category === 'Soneto' && cat.id === 'soneto') ||
           (draft.category === 'Jogral' && cat.id === 'jogral'))
         )
        )
      );
    
    const matchesSearch = !searchQuery || 
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle={activeTheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />

      {/* Header com busca */}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
          <Text style={{
            fontSize: Typography.fontSize['3xl'],
            fontWeight: Typography.fontWeight.bold,
            color: Colors.white,
          }}>
            {selectionMode ? `${selectedDrafts.size} Selecionada${selectedDrafts.size !== 1 ? 's' : ''}` : 'Minhas Obras'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {selectionMode ? (
              <>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginRight: Spacing.sm,
                  }}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
                {selectedDrafts.size > 0 && (
                  <TouchableOpacity
                    onPress={handleBulkDelete}
                    style={{
                      backgroundColor: 'rgba(231, 76, 60, 0.8)',
                      borderRadius: BorderRadius.full,
                      padding: Spacing.sm,
                      marginRight: Spacing.sm,
                    }}
                  >
                    <Ionicons name="trash" size={24} color={Colors.white} />
                  </TouchableOpacity>
                )}
                {selectedDrafts.size > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedDrafts.size === 0) {
                        setShowMassSelectionModal(true);
                      } else {
                        setShowActionModal(true);
                      }
                    }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      borderRadius: BorderRadius.full,
                      padding: Spacing.sm,
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={24} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginRight: Spacing.sm,
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateTab' as never)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                  }}
                >
                  <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Barra de pesquisa */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: BorderRadius.lg,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: Spacing.sm,
              fontSize: Typography.fontSize.base,
              color: Colors.white,
            }}
            placeholder="Buscar suas obras..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Filtros por categoria - Horizontal com Scroll */}
        <View style={{ paddingVertical: Spacing.lg }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
            }}>
              Categorias
            </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('🎯 Gerenciar categorias pressed');
                try {
                  // Tentar navegar dentro do mesmo stack
                  navigation.navigate('ManageCategories' as never);
                } catch (error) {
                  console.error('❌ Erro na navegação:', error);
                  // Fallback: tentar navegar para o ProfileTab e depois Settings
                  (navigation as any).navigate('ProfileTab', { 
                    screen: 'ManageCategories'
                  });
                }
              }}
              style={{
                backgroundColor: themeColors.primary,
                borderRadius: BorderRadius.full,
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="settings" size={16} color={themeColors.white} />
              <Text style={{
                fontSize: Typography.fontSize.xs,
                fontWeight: Typography.fontWeight.medium,
                color: themeColors.white,
                marginLeft: Spacing.xs,
              }}>
                Gerenciar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filtros de categoria - Scroll horizontal */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Spacing.lg,
            }}
            style={{ marginBottom: Spacing.md }}
          >
            {/* Categoria "Todos" */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('Todos')}
              style={{
                backgroundColor: selectedCategory === 'Todos'
                  ? themeColors.primary
                  : themeColors.surface,
                borderRadius: BorderRadius.full,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                marginRight: Spacing.sm,
                borderWidth: 0,
                borderColor: 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                ...Shadows.sm,
              }}
            >
              <Ionicons 
                name="library" 
                size={16} 
                color={selectedCategory === 'Todos' ? themeColors.white : themeColors.primary} 
              />
              <Text style={{
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.medium,
                color: selectedCategory === 'Todos' ? themeColors.white : themeColors.textPrimary,
                marginLeft: Spacing.xs,
              }}>
                Todos ({drafts.length})
              </Text>
            </TouchableOpacity>

          {/* Categorias dinâmicas - mostrar apenas as 2 mais usadas por padrão */}
          {(() => {
            // Calcular contagem para cada categoria e ordenar por uso
            const categoriesWithCount = categories.filter(category => category && category.id && category.name).map(category => {
              const count = drafts.filter(d => 
                d.typeId === category.id || 
                (!d.typeId && d.category && 
                  ((d.category === 'Poesia' && category.id === 'poesia') ||
                   (d.category === 'Soneto' && category.id === 'soneto') ||
                   (d.category === 'Jogral' && category.id === 'jogral'))
                )
              ).length;
              return { category, count };
            })
            .filter(item => item.count > 0) // Só categorias com obras
            .sort((a, b) => b.count - a.count); // Ordenar por mais usadas

            // Mostrar sempre apenas as 2 mais usadas nos círculos
            const categoriesToShow = categoriesWithCount.slice(0, 2);

            return categoriesToShow.map(({ category, count }) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.name || 'Todos')}
                style={{
                  backgroundColor: selectedCategory === category.name
                    ? (category.color || themeColors.primary)
                    : themeColors.surface,
                  borderRadius: BorderRadius.full,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.sm,
                  marginRight: Spacing.sm,
                  borderWidth: 0,
                  borderColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...Shadows.sm,
                }}
              >
                <Ionicons 
                  name={(category.icon || 'library') as any} 
                  size={16} 
                  color={selectedCategory === category.name ? themeColors.white : (category.color || themeColors.primary)} 
                />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.medium,
                  color: selectedCategory === category.name ? themeColors.white : themeColors.textPrimary,
                  marginLeft: Spacing.xs,
                }}>
                  {category.name || 'Categoria'} ({count})
                </Text>
              </TouchableOpacity>
            ));
          })()}

          </ScrollView>

          {/* Botão "Ver todas as categorias" - mostrar quando há mais de 2 categorias com obras */}
          {(() => {
            const categoriesWithWorks = categories.filter(category => 
              category && category.id && category.name &&
              drafts.filter(d => 
                d.typeId === category.id || 
                (!d.typeId && d.category && 
                  ((d.category === 'Poesia' && category.id === 'poesia') ||
                   (d.category === 'Soneto' && category.id === 'soneto') ||
                   (d.category === 'Jogral' && category.id === 'jogral'))
                )
              ).length > 0
            ).length;
            
            const shouldShowButton = categoriesWithWorks > 2 || showAllCategories;
            
            return shouldShowButton ? (
              <View style={{ paddingHorizontal: Spacing.lg }}>
                <TouchableOpacity
                  onPress={() => setShowAllCategories(!showAllCategories)}
                  style={{
                    backgroundColor: themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    borderStyle: 'dashed',
                    ...Shadows.sm,
                  }}
                >
                  <Ionicons 
                    name={showAllCategories ? "chevron-up" : "grid-outline"} 
                    size={20} 
                    color={themeColors.textSecondary} 
                  />
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                    marginTop: Spacing.xs,
                  }}>
                    {showAllCategories 
                      ? "Fechar grid de categorias" 
                      : "Ver todas em grid"
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })()}

          {/* Grid expandido de categorias - quando "Ver todas" está ativado */}
          {showAllCategories && (
            <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.md }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {/* Categoria "Todos" no grid */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory('Todos');
                    setShowAllCategories(false);
                  }}
                  style={{
                    width: '48%',
                    marginBottom: Spacing.sm,
                  }}
                >
                      <LinearGradient
                        colors={selectedCategory === 'Todos'
                          ? [themeColors.primary, themeColors.primary + '80']
                          : [themeColors.surface, themeColors.surface]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          padding: Spacing.md,
                          borderRadius: BorderRadius.lg,
                          alignItems: 'center',
                          backgroundColor: selectedCategory === 'Todos' ? 'transparent' : themeColors.surface,
                          borderWidth: 0,
                          borderColor: 'transparent',
                          ...Shadows.sm,
                        }}
                      >
                    <Ionicons 
                      name="library" 
                      size={24} 
                      color={selectedCategory === 'Todos' ? themeColors.white : themeColors.primary} 
                    />
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      fontWeight: Typography.fontWeight.semibold,
                      color: selectedCategory === 'Todos' ? themeColors.white : themeColors.textPrimary,
                      marginTop: Spacing.xs,
                      textAlign: 'center',
                    }}>
                      Todos
                    </Text>
                    <Text style={{
                      fontSize: Typography.fontSize.xs,
                      color: selectedCategory === 'Todos' ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary,
                      marginTop: Spacing.xs,
                    }}>
                      {drafts.length} obra{drafts.length !== 1 ? 's' : ''}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Todas as categorias no grid - incluindo as sem obras */}
                {categories.filter(category => category && category.id && category.name).map((category) => {
                  const count = drafts.filter(d => 
                    d.typeId === category.id || 
                    (!d.typeId && d.category && 
                      ((d.category === 'Poesia' && category.id === 'poesia') ||
                       (d.category === 'Soneto' && category.id === 'soneto') ||
                       (d.category === 'Jogral' && category.id === 'jogral'))
                    )
                  ).length;

                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setSelectedCategory(category.name || 'Todos');
                        setShowAllCategories(false);
                      }}
                      style={{
                        width: '48%',
                        marginBottom: Spacing.sm,
                      }}
                    >
                      <LinearGradient
                        colors={selectedCategory === category.name
                          ? [category.color || themeColors.primary, (category.color || themeColors.primary) + '80']
                          : [themeColors.surface, themeColors.surface]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          padding: Spacing.md,
                          borderRadius: BorderRadius.lg,
                          alignItems: 'center',
                          backgroundColor: selectedCategory === category.name ? 'transparent' : themeColors.surface,
                          borderWidth: 0,
                          borderColor: 'transparent',
                          ...Shadows.sm,
                        }}
                      >
                        <Ionicons 
                          name={(category.icon || 'library') as any} 
                          size={24} 
                          color={selectedCategory === category.name ? themeColors.white : (category.color || themeColors.primary)} 
                        />
                        <Text style={{
                          fontSize: Typography.fontSize.sm,
                          fontWeight: Typography.fontWeight.semibold,
                          color: selectedCategory === category.name ? themeColors.white : themeColors.textPrimary,
                          marginTop: Spacing.xs,
                          textAlign: 'center',
                        }}>
                          {category.name || 'Categoria'}
                        </Text>
                        <Text style={{
                          fontSize: Typography.fontSize.xs,
                          color: selectedCategory === category.name ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary,
                          marginTop: Spacing.xs,
                        }}>
                          {count} obra{count !== 1 ? 's' : ''}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Lista de rascunhos */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          {filteredDrafts.length === 0 ? (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: Spacing['4xl'],
            }}>
              <Ionicons name="library-outline" size={64} color={themeColors.textSecondary} />
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textSecondary,
                marginTop: Spacing.lg,
                textAlign: 'center',
              }}>
                {searchQuery ? 'Nenhuma obra encontrada' : 'Você ainda não criou nenhuma obra'}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.sm,
                paddingHorizontal: Spacing.xl,
              }}>
                {searchQuery ? 
                  'Tente ajustar sua busca ou criar uma nova obra.' : 
                  'Que tal começar criando sua primeira poesia?'
                }
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateTab' as never)}
                style={{
                  backgroundColor: themeColors.primary,
                  paddingHorizontal: Spacing.xl,
                  paddingVertical: Spacing.md,
                  borderRadius: BorderRadius.lg,
                  marginTop: Spacing.xl,
                  ...Shadows.sm,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.white,
                }}>
                  Criar Nova Obra
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.lg,
              }}>
                {filteredDrafts.length} obra{filteredDrafts.length !== 1 ? 's' : ''}{selectedCategory !== 'Todos' ? ` de ${selectedCategory}` : ''}
              </Text>

              {filteredDrafts.map((draft) => (
                <TouchableOpacity
                  key={draft.id}
                  activeOpacity={0.7}
                  onPress={() => handleCardPress(draft)}
                  onLongPress={() => handleCardLongPress(draft)}
                  style={{
                    backgroundColor: selectionMode && selectedDrafts.has(draft.id)
                      ? themeColors.primary + '15'
                      : themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.lg,
                    marginBottom: Spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: selectionMode && selectedDrafts.has(draft.id)
                      ? themeColors.primary
                      : themeColors.primary,
                    borderWidth: selectionMode && selectedDrafts.has(draft.id) ? 2 : 0,
                    borderColor: selectionMode && selectedDrafts.has(draft.id) ? themeColors.primary : 'transparent',
                    borderTopWidth: 0,
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                    ...Shadows.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {selectionMode && (
                      <View style={{ marginRight: Spacing.md, alignItems: 'center', justifyContent: 'center', height: 24 }}>
                        <Ionicons 
                          name={selectedDrafts.has(draft.id) ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={selectedDrafts.has(draft.id) ? themeColors.primary : themeColors.textSecondary} 
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                        <Text style={{
                          fontSize: Typography.fontSize.lg,
                          fontWeight: Typography.fontWeight.bold,
                          color: themeColors.textPrimary,
                          flex: 1,
                        }}>
                          {draft.title}
                        </Text>
                        {!selectionMode && (
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleEditDraft(draft);
                              }}
                              style={{
                                backgroundColor: themeColors.primary,
                                borderRadius: BorderRadius.full,
                                padding: Spacing.xs,
                                marginRight: Spacing.xs,
                              }}
                            >
                              <Ionicons name="create" size={16} color={themeColors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(draft);
                              }}
                              style={{
                                backgroundColor: '#E74C3C',
                                borderRadius: BorderRadius.full,
                                padding: Spacing.xs,
                              }}
                            >
                              <Ionicons name="trash" size={16} color="white" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                        <View style={{
                          backgroundColor: themeColors.accent,
                          paddingHorizontal: Spacing.sm,
                          paddingVertical: Spacing.xs,
                          borderRadius: BorderRadius.sm,
                          marginRight: Spacing.sm,
                        }}>
                          <TypeNameDisplay
                            draft={draft}
                            style={{
                              fontSize: Typography.fontSize.xs,
                              fontWeight: Typography.fontWeight.semibold,
                              color: Colors.white,
                            }}
                          />
                        </View>
                        <Text style={{
                          fontSize: Typography.fontSize.sm,
                          color: themeColors.textSecondary,
                          lineHeight: 16,
                        }}>
                          {formatDateInfo(draft.createdAt, draft.updatedAt)}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: Typography.fontSize.sm,
                          color: themeColors.textSecondary,
                          lineHeight: 20,
                          marginBottom: Spacing.sm,
                        }}
                        numberOfLines={3}
                      >
                        {draft.content}
                      </Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="text" size={16} color={themeColors.textSecondary} />
                          <Text style={{
                            fontSize: Typography.fontSize.xs,
                            color: themeColors.textSecondary,
                            marginLeft: Spacing.xs,
                          }}>
                            {draft.content.split(' ').length} palavras
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Botão Flutuante de Ações (quando há seleções) */}
      {selectionMode && selectedDrafts.size > 0 && (
        <TouchableOpacity
          onPress={() => setShowActionModal(true)}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: themeColors.primary,
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="options" size={24} color={themeColors.white} />
          <View style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: '#E74C3C',
            borderRadius: 12,
            minWidth: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              {selectedDrafts.size}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Ações em massa - Modal */}
      {showMassSelectionModal && (
        <Modal
          transparent
          animationType="slide"
          visible={showMassSelectionModal}
          onRequestClose={() => setShowMassSelectionModal(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: themeColors.surface,
              borderTopLeftRadius: BorderRadius.lg,
              borderTopRightRadius: BorderRadius.lg,
              padding: Spacing.lg,
              ...Shadows.md,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.md,
              }}>
                Ações em Massa
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                <TouchableOpacity
                  onPress={selectAllDrafts}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.primary,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    marginRight: Spacing.sm,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.white,
                  }}>
                    Selecionar Todas
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deselectAllDrafts}
                  style={{
                    flex: 1,
                    backgroundColor: themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}
                >
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textPrimary,
                  }}>
                    Limpar Seleção
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleBulkDelete}
                style={{
                  backgroundColor: '#E74C3C',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  alignItems: 'center',
                  marginBottom: Spacing.md,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.semibold,
                  color: Colors.white,
                }}>
                  Excluir {selectedDrafts.size} Obra{selectedDrafts.size !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBulkExport}
                style={{
                  backgroundColor: themeColors.accent,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.semibold,
                  color: Colors.white,
                }}>
                  Exportar {selectedDrafts.size} Obra{selectedDrafts.size !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowMassSelectionModal(false);
                  toggleSelectionMode();
                }}
                style={{
                  position: 'absolute',
                  top: Spacing.md,
                  right: Spacing.md,
                }}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de Opções da Obra */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: themeColors.background,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            padding: Spacing.lg,
            minHeight: 280,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.text,
              textAlign: 'center',
              marginBottom: Spacing.lg,
            }}>
              {selectedDraft?.title || 'Opções da Obra'}
            </Text>

            <View style={{ gap: Spacing.md }}>
              <TouchableOpacity
                onPress={handleSelectDraft}
                style={{
                  backgroundColor: themeColors.primary,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark-circle" size={24} color={themeColors.white} style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.white,
                }}>
                  Selecionar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEditFromModal}
                style={{
                  backgroundColor: '#3498DB',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="create" size={24} color="white" style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: "white",
                }}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteFromModal}
                style={{
                  backgroundColor: '#E74C3C',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash" size={24} color="white" style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: "white",
                }}>
                  Excluir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportFromModal}
                style={{
                  backgroundColor: '#9B59B6',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="share" size={24} color="white" style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: "white",
                }}>
                  Exportar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowOptionsModal(false)}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  alignItems: 'center',
                  marginTop: Spacing.md,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.text,
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Ações em Lote */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: themeColors.background,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            padding: Spacing.lg,
            minHeight: 300,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.text,
              textAlign: 'center',
              marginBottom: Spacing.lg,
            }}>
              Ações para {selectedDrafts.size} Obra{selectedDrafts.size !== 1 ? 's' : ''}
            </Text>

            <View style={{ gap: Spacing.md }}>
              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  handleBulkEdit();
                }}
                style={{
                  backgroundColor: themeColors.primary,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="create" size={24} color={themeColors.white} style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.white,
                }}>
                  Editar Selecionadas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  handleBulkExport();
                }}
                style={{
                  backgroundColor: '#27AE60',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="share" size={24} color="white" style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: "white",
                }}>
                  Exportar Selecionadas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowActionModal(false);
                  handleBulkDelete();
                }}
                style={{
                  backgroundColor: '#E74C3C',
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash" size={24} color="white" style={{ marginRight: Spacing.sm }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: "white",
                }}>
                  Excluir Selecionadas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowActionModal(false)}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  alignItems: 'center',
                  marginTop: Spacing.md,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.text,
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyObrasScreen;
