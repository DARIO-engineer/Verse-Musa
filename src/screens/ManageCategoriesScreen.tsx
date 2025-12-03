import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { CategoryService, Category } from '../services/CategoryService';
import CreateCategoryModal from '../components/CreateCategoryModal';

const AVAILABLE_ICONS = [
  'create-outline',
  'library-outline', 
  'people-outline',
  'heart-outline',
  'star-outline',
  'flower-outline',
  'musical-notes-outline',
  'book-outline',
  'pencil-outline',
  'sparkles-outline',
  'moon-outline',
  'sunny-outline',
];

const AVAILABLE_COLORS = [
  '#09868B', // Primary
  '#76C1D4', // Accent
  '#3D7C47', // Secondary
  '#E74C3C', // Red
  '#9B59B6', // Purple
  '#F39C12', // Orange
  '#27AE60', // Green
  '#3498DB', // Blue
  '#E67E22', // Dark Orange
  '#1ABC9C', // Turquoise
];

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ManageCategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme, getThemeColors: getGlobalThemeColors } = useSettings();
  const themeColors = getGlobalThemeColors();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'create-outline',
    color: '#09868B',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Recarregar categorias quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 ManageCategories: Recarregando no foco...');
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    try {
      console.log('🔄 ManageCategories: Iniciando carregamento...');
      setLoading(true);
      
      const allCategories = await CategoryService.getAllCategories();
      console.log('✅ ManageCategories: Categorias carregadas:', allCategories);
      setCategories(allCategories);
      
    } catch (error) {
      console.error('❌ ManageCategories: Erro ao carregar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias. Tente novamente.');
      
      // Fallback: usar categorias padrão
      const fallbackCategories = [
        {
          id: 'poesia',
          name: 'Poesia',
          description: 'Expressões poéticas livres e criativas',
          icon: 'create-outline',
          color: '#09868B',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'soneto',
          name: 'Soneto',
          description: 'Forma clássica de 14 versos',
          icon: 'library-outline',
          color: '#76C1D4',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'jogral',
          name: 'Jogral',
          description: 'Declamação em grupo ou alternada',
          icon: 'people-outline',
          color: '#3D7C47',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
      console.log('🏁 ManageCategories: Carregamento finalizado');
    }
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira um nome para a categoria.');
      return;
    }

    try {
      await CategoryService.createCategory(
        formData.name,
        formData.description,
        formData.icon,
        formData.color
      );
      
      setShowCreateModal(false);
      resetForm();
      await loadCategories();
      
      Alert.alert('Sucesso! ✨', 'Categoria criada com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar a categoria.');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira um nome para a categoria.');
      return;
    }

    try {
      await CategoryService.updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
      });
      
      setShowEditModal(false);
      setEditingCategory(null);
      resetForm();
      await loadCategories();
      
      Alert.alert('Sucesso! ✨', 'Categoria atualizada com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a categoria.');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Não permitido', 'Categorias padrão não podem ser removidas.');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoryService.deleteCategory(category.id);
              await loadCategories();
              Alert.alert('Sucesso', 'Categoria excluída com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir a categoria.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Não permitido', 'Categorias padrão não podem ser editadas.');
      return;
    }

    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'create-outline',
      color: '#09868B',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const CategoryFormModal = ({ visible, onClose, onSave, title }: {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    title: string;
  }) => (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
          }}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="close" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={{ flex: 1, padding: Spacing.lg }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          {/* Nome */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Nome da Categoria
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ex: Poemas de Amor"
              placeholderTextColor={themeColors.textSecondary}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                borderWidth: 1,
                borderColor: themeColors.border,
              }}
            />
          </View>

          {/* Descrição */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Descrição (Opcional)
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Descreva o tipo de obras desta categoria..."
              placeholderTextColor={themeColors.textSecondary}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                borderWidth: 1,
                borderColor: themeColors.border,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Ícone */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Ícone
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setFormData(prev => ({ ...prev, icon }))}
                  style={{
                    backgroundColor: formData.icon === icon ? themeColors.primary : themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    marginRight: Spacing.sm,
                    borderWidth: 1,
                    borderColor: formData.icon === icon ? themeColors.primary : themeColors.border,
                  }}
                >
                  <Ionicons 
                    name={icon as any} 
                    size={24} 
                    color={formData.icon === icon ? themeColors.white : themeColors.textPrimary} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Cor */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Cor
            </Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Spacing.sm,
            }}>
              {AVAILABLE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setFormData(prev => ({ ...prev, color }))}
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: color,
                    borderRadius: BorderRadius.lg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: formData.color === color ? 3 : 1,
                    borderColor: formData.color === color ? themeColors.textPrimary : themeColors.border,
                  }}
                >
                  {formData.color === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            onPress={onSave}
            style={{
              backgroundColor: themeColors.primary,
              borderRadius: BorderRadius.lg,
              padding: Spacing.base,
              alignItems: 'center',
              marginBottom: Spacing.xl,
            }}
          >
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.white,
            }}>
              {title}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar
        barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />

      {/* Header */}
      <LinearGradient
        colors={themeColors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          borderBottomLeftRadius: BorderRadius.xl,
          borderBottomRightRadius: BorderRadius.xl,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={() => {
              // Verificar se pode voltar na pilha de navegação
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // Fallback: ir para a aba principal
                (navigation as any).navigate('HomeTab');
              }
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.white} />
          </TouchableOpacity>

          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.white,
          }}>
            Gerenciar Categorias
          </Text>

          <TouchableOpacity
            onPress={openCreateModal}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="add" size={24} color={themeColors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
        {loading ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingVertical: Spacing.xl * 2,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: themeColors.textSecondary,
            }}>
              Carregando categorias...
            </Text>
          </View>
        ) : (
          <>
            {/* Categorias Padrão */}
            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.base,
              }}>
                Categorias Padrão
              </Text>
              {categories.filter(cat => cat.isDefault).map((category) => (
                <View
                  key={category.id}
                  style={{
                    backgroundColor: themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.base,
                    marginBottom: Spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderLeftWidth: 4,
                    borderLeftColor: category.color,
                    ...Shadows.sm,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: category.color,
                      borderRadius: BorderRadius.full,
                      padding: Spacing.sm,
                      marginRight: Spacing.md,
                    }}
                  >
                    <Ionicons name={category.icon as any} size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: Typography.fontSize.base,
                      fontWeight: Typography.fontWeight.semibold,
                      color: themeColors.textPrimary,
                    }}>
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text style={{
                        fontSize: Typography.fontSize.sm,
                        color: themeColors.textSecondary,
                        marginTop: Spacing.xs,
                      }}>
                        {category.description}
                      </Text>
                    )}
                  </View>
                  <View style={{
                    backgroundColor: themeColors.accent,
                    borderRadius: BorderRadius.sm,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                  }}>
                    <Text style={{
                      fontSize: Typography.fontSize.xs,
                      fontWeight: Typography.fontWeight.medium,
                      color: themeColors.white,
                    }}>
                      Padrão
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Categorias Personalizadas */}
            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.base,
              }}>
                Categorias Personalizadas
              </Text>
              {categories.filter(cat => !cat.isDefault).length === 0 ? (
                <View style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.xl,
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: themeColors.border,
                }}>
                  <Ionicons name="folder-open-outline" size={48} color={themeColors.textSecondary} />
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    marginTop: Spacing.sm,
                  }}>
                    Nenhuma categoria personalizada criada
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    marginTop: Spacing.xs,
                  }}>
                    Toque no + para criar uma nova categoria
                  </Text>
                </View>
              ) : (
                categories.filter(cat => !cat.isDefault).map((category) => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: themeColors.surface,
                      borderRadius: BorderRadius.lg,
                      padding: Spacing.base,
                      marginBottom: Spacing.sm,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderLeftWidth: 4,
                      borderLeftColor: category.color,
                      ...Shadows.sm,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: category.color,
                        borderRadius: BorderRadius.full,
                        padding: Spacing.sm,
                        marginRight: Spacing.md,
                      }}
                    >
                      <Ionicons name={category.icon as any} size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: Typography.fontSize.base,
                        fontWeight: Typography.fontWeight.semibold,
                        color: themeColors.textPrimary,
                      }}>
                        {category.name}
                      </Text>
                      {category.description && (
                        <Text style={{
                          fontSize: Typography.fontSize.sm,
                          color: themeColors.textSecondary,
                          marginTop: Spacing.xs,
                        }}>
                          {category.description}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                      <TouchableOpacity
                        onPress={() => openEditModal(category)}
                        style={{
                          backgroundColor: themeColors.primary,
                          borderRadius: BorderRadius.sm,
                          padding: Spacing.xs,
                        }}
                      >
                        <Ionicons name="pencil" size={16} color={themeColors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteCategory(category)}
                        style={{
                          backgroundColor: '#E74C3C',
                          borderRadius: BorderRadius.sm,
                          padding: Spacing.xs,
                        }}
                      >
                        <Ionicons name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal Criar Categoria */}
      <CreateCategoryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCategoryCreated={async (categoryId) => {
          console.log('Nova categoria criada:', categoryId);
          await loadCategories(); // Recarregar lista
          setShowCreateModal(false);
        }}
        title="Nova Categoria"
      />

      {/* Modal Editar Categoria */}
      <CategoryFormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
          resetForm();
        }}
        onSave={handleEditCategory}
        title="Editar Categoria"
      />
    </SafeAreaView>
  );
};

export default ManageCategoriesScreen;
