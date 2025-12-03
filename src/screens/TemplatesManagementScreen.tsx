import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { UserTemplateService, UserTemplate } from '../services/UserTemplateService';
import CreateTemplateModal from '../components/CreateTemplateModal';
import EditTemplateModal from '../components/EditTemplateModal';

const TemplatesManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme, getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<UserTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState<UserTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserTemplates();
  }, []);

  const loadUserTemplates = async () => {
    try {
      setLoading(true);
      const templates = await UserTemplateService.getAllTemplates();
      setUserTemplates(templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    Alert.alert(
      'Excluir Template',
      'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserTemplateService.deleteTemplate(templateId);
              await loadUserTemplates();
              Alert.alert('Sucesso', 'Template excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o template.');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      await UserTemplateService.toggleFavorite(templateId);
      await loadUserTemplates();
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  const handleTemplateCreated = async (template: UserTemplate) => {
    await loadUserTemplates();
    setShowCreateTemplate(false);
    Alert.alert('Sucesso! ✨', 'Template criado com sucesso!');
  };

  const handleTemplateUpdated = async (template: UserTemplate) => {
    await loadUserTemplates();
    setShowEditTemplate(false);
    setTemplateToEdit(null);
    Alert.alert('Sucesso! ✨', 'Template atualizado com sucesso!');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const openEditModal = (template: UserTemplate) => {
    setTemplateToEdit(template);
    setShowEditTemplate(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
      
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
        <SafeAreaView edges={['top']}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: Colors.white,
          }}>
            Meus Templates
          </Text>

          <TouchableOpacity
            onPress={() => setShowCreateTemplate(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Carregando templates...</Text>
          </View>
        ) : userTemplates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Nenhum template criado ainda</Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>Crie seu primeiro template personalizado!</Text>
            <TouchableOpacity 
              style={[styles.createFirstButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowCreateTemplate(true)}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.createFirstButtonText}>Criar Primeiro Template</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.templatesContainer}>
            <Text style={[styles.statsText, { color: themeColors.textSecondary }]}>
              {userTemplates.length} template{userTemplates.length !== 1 ? 's' : ''} criado{userTemplates.length !== 1 ? 's' : ''}
            </Text>
            
            {userTemplates.map((template) => (
              <View key={template.id} style={[styles.templateCard, { 
                backgroundColor: themeColors.surface, 
                borderLeftColor: template.color,
                borderColor: themeColors.border 
              }]}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                      <Ionicons name={template.icon as any} size={18} color={Colors.white} />
                    </View>
                    <View style={styles.templateText}>
                      <Text style={[styles.templateName, { color: themeColors.textPrimary }]}>{template.name}</Text>
                      <Text style={[styles.templateCategory, { color: themeColors.textSecondary }]}>{template.categoryName}</Text>
                    </View>
                    {template.isFavorite && (
                      <Ionicons name="heart" size={16} color="#EF4444" style={styles.favoriteIcon} />
                    )}
                  </View>
                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(template.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons 
                        name={template.isFavorite ? "heart" : "heart-outline"} 
                        size={18} 
                        color={template.isFavorite ? "#EF4444" : themeColors.textSecondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openEditModal(template)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="create-outline" size={18} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowTemplateDetails(template)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="eye-outline" size={18} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteTemplate(template.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {template.description && (
                  <Text style={[styles.templateDescription, { color: themeColors.textSecondary }]}>{template.description}</Text>
                )}
                
                <View style={styles.templateStats}>
                  <Text style={[styles.usageStats, { color: themeColors.textSecondary }]}>
                    {template.usageCount} uso{template.usageCount !== 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.templateLength, { color: themeColors.textSecondary }]}>
                    {template.content.length} caracteres
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Criação de Template */}
      <CreateTemplateModal
        visible={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onTemplateCreated={handleTemplateCreated}
      />

      {/* Modal de Edição de Template */}
      <EditTemplateModal
        visible={showEditTemplate}
        onClose={() => setShowEditTemplate(false)}
        onTemplateUpdated={handleTemplateUpdated}
        templateToEdit={templateToEdit}
      />

      {/* Modal de Detalhes do Template */}
      <Modal
        visible={!!showTemplateDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showTemplateDetails && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalTemplateIcon, { backgroundColor: showTemplateDetails.color }]}>
                  <Ionicons name={showTemplateDetails.icon as any} size={20} color={Colors.white} />
                </View>
                <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>{showTemplateDetails.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTemplateDetails(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {showTemplateDetails.description && (
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: themeColors.textPrimary }]}>Descrição</Text>
                  <Text style={[styles.modalSectionText, { color: themeColors.textSecondary }]}>{showTemplateDetails.description}</Text>
                </View>
              )}
              
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: themeColors.textPrimary }]}>Categoria</Text>
                <Text style={[styles.modalSectionText, { color: themeColors.textSecondary }]}>{showTemplateDetails.categoryName}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: themeColors.textPrimary }]}>Conteúdo</Text>
                <View style={[styles.templateContentContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                  <Text style={[styles.templateContent, { color: themeColors.textPrimary }]}>{showTemplateDetails.content}</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  createFirstButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.sm,
  },
  templatesContainer: {
    paddingBottom: Spacing.xl,
  },
  statsText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  templateCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  templateText: {
    flex: 1,
  },
  templateName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  templateCategory: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  favoriteIcon: {
    marginLeft: Spacing.sm,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  templateDescription: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageStats: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  templateLength: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTemplateIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalSection: {
    marginBottom: Spacing.xl,
  },
  modalSectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  modalSectionText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  templateContentContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  templateContent: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * 1.5,
  },
});

export default TemplatesManagementScreen;
