import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { CategoryService } from '../services/CategoryService';

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated?: (categoryId: string) => void;
  title?: string;
}

const AVAILABLE_ICONS = [
  'heart-outline',
  'leaf-outline',
  'star-outline',
  'musical-notes-outline',
  'book-outline',
  'create-outline',
  'chatbubble-outline',
  'bulb-outline',
  'flame-outline',
  'flower-outline',
  'diamond-outline',
  'sunny-outline',
  'moon-outline',
  'cloud-outline',
  'water-outline',
  'earth-outline',
];

const AVAILABLE_COLORS = [
  '#09868B', // Teal (padrão)
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Yellow
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316', // Orange
  '#84CC16', // Lime
];

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  visible,
  onClose,
  onCategoryCreated,
  title = 'Nova Categoria'
}) => {
  const { settings } = useSettings();
  const themeColors = getThemeColors(settings?.themeVariant ?? 'default', settings.darkTheme);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'create-outline',
    color: '#09868B',
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'create-outline',
      color: '#09868B',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'O nome da categoria é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      console.log('🆕 Criando categoria:', formData);
      const newCategoryId = await CategoryService.createCategory(
        formData.name.trim(),
        formData.description.trim(),
        formData.icon,
        formData.color
      );
      
      console.log('✅ Categoria criada com ID:', newCategoryId);
      
      resetForm();
      Alert.alert('Sucesso! ✨', 'Categoria criada com sucesso.');
      
      if (onCategoryCreated) {
        onCategoryCreated(newCategoryId);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      Alert.alert('Erro', 'Não foi possível criar a categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
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
            onPress={handleClose}
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
                      color={formData.icon === icon ? '#FFFFFF' : themeColors.textPrimary} 
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {AVAILABLE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setFormData(prev => ({ ...prev, color }))}
                    style={{
                      backgroundColor: color,
                      borderRadius: BorderRadius.full,
                      width: 48,
                      height: 48,
                      marginRight: Spacing.sm,
                      borderWidth: formData.color === color ? 4 : 2,
                      borderColor: formData.color === color ? themeColors.background : 'rgba(255,255,255,0.3)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {formData.color === color && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !formData.name.trim()}
              style={{
                backgroundColor: (loading || !formData.name.trim()) ? themeColors.border : formData.color,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                alignItems: 'center',
                marginBottom: Spacing.xl,
              }}
            >
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: '#FFFFFF',
              }}>
                {loading ? 'Criando...' : 'Criar Categoria'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateCategoryModal;
