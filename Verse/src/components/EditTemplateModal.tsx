import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { CategoryService, Category } from '../services/CategoryService';
import { UserTemplateService, UserTemplate } from '../services/UserTemplateService';

interface EditTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onTemplateUpdated: (template: UserTemplate) => void;
  templateToEdit: UserTemplate | null;
}

const TEMPLATE_ICONS = [
  { name: 'book-outline', label: 'Livro' },
  { name: 'heart-outline', label: 'Coração' },
  { name: 'star-outline', label: 'Estrela' },
  { name: 'moon-outline', label: 'Lua' },
  { name: 'sunny-outline', label: 'Sol' },
  { name: 'flower-outline', label: 'Flor' },
  { name: 'leaf-outline', label: 'Folha' },
  { name: 'musical-notes-outline', label: 'Música' },
  { name: 'camera-outline', label: 'Câmera' },
  { name: 'mail-outline', label: 'Carta' },
  { name: 'time-outline', label: 'Tempo' },
  { name: 'location-outline', label: 'Local' },
  { name: 'people-outline', label: 'Pessoas' },
  { name: 'bulb-outline', label: 'Ideia' },
  { name: 'brush-outline', label: 'Arte' },
  { name: 'telescope-outline', label: 'Exploração' },
];

const TEMPLATE_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#84CC16',
  '#F97316', '#8B5A3C', '#6B7280', '#1F2937'
];

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  visible,
  onClose,
  onTemplateUpdated,
  templateToEdit,
}) => {
  const { getThemeColors } = useSettings();
  const themeColors = getThemeColors();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(TEMPLATE_ICONS[0].name);
  const [selectedColor, setSelectedColor] = useState(TEMPLATE_COLORS[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && templateToEdit) {
      loadCategories();
      // Pre-fill form with existing template data
      setName(templateToEdit.name);
      setDescription(templateToEdit.description);
      setContent(templateToEdit.content);
      setSelectedIcon(templateToEdit.icon);
      setSelectedColor(templateToEdit.color);
      setSelectedCategoryId(templateToEdit.categoryId);
      setTags(templateToEdit.tags.join(', '));
    }
  }, [visible, templateToEdit]);

  const loadCategories = async () => {
    try {
      const categories = await CategoryService.getAllCategories();
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!templateToEdit) return;

    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para o template');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Erro', 'Por favor, adicione conteúdo ao template');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return;
    }

    setIsLoading(true);

    try {
      const selectedCategory = availableCategories.find(cat => cat.id === selectedCategoryId);

      const updates = {
        name: name.trim(),
        description: description.trim() || `Template personalizado: ${name.trim()}`,
        content: content.trim(),
        categoryId: selectedCategoryId,
        categoryName: selectedCategory?.name || 'Categoria',
        icon: selectedIcon,
        color: selectedColor,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      await UserTemplateService.updateTemplate(templateToEdit.id, updates);
      const updatedTemplate = await UserTemplateService.getTemplateById(templateToEdit.id);

      if (updatedTemplate) {
        onTemplateUpdated(updatedTemplate);
        Alert.alert('Sucesso', 'Template atualizado com sucesso!');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o template. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!templateToEdit) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: selectedColor,
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
                marginRight: Spacing.md,
              }}>
                <Ionicons name={selectedIcon as any} size={24} color="#FFFFFF" />
              </View>
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                Editar Template
              </Text>
            </View>
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

          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: Spacing.lg }}>
              {/* Nome do Template */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Nome do Template *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Carta ao Futuro, Memória Especial..."
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
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Descrição
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva brevemente o propósito deste template..."
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

              {/* Categoria */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Categoria *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {availableCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategoryId(category.id)}
                      style={{
                        backgroundColor: selectedCategoryId === category.id
                          ? themeColors.primary
                          : themeColors.surface,
                        borderRadius: BorderRadius.lg,
                        paddingHorizontal: Spacing.base,
                        paddingVertical: Spacing.sm,
                        marginRight: Spacing.sm,
                        borderWidth: 1,
                        borderColor: selectedCategoryId === category.id
                          ? themeColors.primary
                          : themeColors.border,
                      }}
                    >
                      <Text style={{
                        fontSize: Typography.fontSize.sm,
                        color: selectedCategoryId === category.id
                          ? '#FFFFFF'
                          : themeColors.textPrimary,
                        fontWeight: selectedCategoryId === category.id
                          ? Typography.fontWeight.medium
                          : Typography.fontWeight.normal,
                      }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Ícone */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Ícone
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TEMPLATE_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon.name}
                      onPress={() => setSelectedIcon(icon.name)}
                      style={{
                        backgroundColor: selectedIcon === icon.name
                          ? selectedColor
                          : themeColors.surface,
                        borderRadius: BorderRadius.lg,
                        padding: Spacing.base,
                        marginRight: Spacing.sm,
                        borderWidth: 2,
                        borderColor: selectedIcon === icon.name
                          ? selectedColor
                          : themeColors.border,
                      }}
                    >
                      <Ionicons
                        name={icon.name as any}
                        size={24}
                        color={selectedIcon === icon.name ? '#FFFFFF' : themeColors.textPrimary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Cor */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Cor
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                  {TEMPLATE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: color,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: Spacing.sm,
                        marginBottom: Spacing.sm,
                        borderWidth: selectedColor === color ? 3 : 1,
                        borderColor: selectedColor === color ? themeColors.textPrimary : 'transparent',
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Tags */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Tags (separadas por vírgula)
                </Text>
                <TextInput
                  value={tags}
                  onChangeText={setTags}
                  placeholder="memória, nostalgia, família..."
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

              {/* Conteúdo do Template */}
              <View style={{ marginBottom: Spacing.xl }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                }}>
                  Conteúdo do Template *
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.sm,
                }}>
                  Use [variáveis] para campos que o usuário preencherá depois
                </Text>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Era [época/ano] quando eu...\n\nEu me lembro de...\n\n[adicione mais campos aqui]"
                  placeholderTextColor={themeColors.textSecondary}
                  multiline
                  numberOfLines={10}
                  style={{
                    backgroundColor: themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.base,
                    fontSize: Typography.fontSize.base,
                    color: themeColors.textPrimary,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    textAlignVertical: 'top',
                    minHeight: 200,
                  }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Botão Atualizar */}
          <View style={{
            padding: Spacing.lg,
            borderTopWidth: 1,
            borderTopColor: themeColors.border,
          }}>
            <TouchableOpacity
              onPress={handleUpdateTemplate}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <LinearGradient
                colors={[selectedColor, selectedColor + 'CC']}
                style={{
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  alignItems: 'center',
                  ...Shadows.base,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.medium,
                  color: '#FFFFFF',
                }}>
                  {isLoading ? 'Atualizando...' : 'Atualizar Template'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default EditTemplateModal;
