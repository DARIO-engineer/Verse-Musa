import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Draft } from '../services/DraftService';
import { Category } from '../services/CategoryService';
import { UserTemplate } from '../services/UserTemplateService';
import { PoemTemplate } from '../constants/poemTemplates';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { useDrafts } from '../contexts/DraftsContext';
import { DraftService } from '../services/DraftService';
import { CategoryService } from '../services/CategoryService';
import { UserTemplateService } from '../services/UserTemplateService';
import { EnhancedAchievementService } from '../services/EnhancedAchievementService';
import SimpleCache from '../utils/SimpleCache';
import { POEM_TEMPLATES, TEXTUAL_INSPIRATIONS, POWERFUL_THEMES } from '../constants/poemTemplates';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { NavigationHelper } from '../utils/NavigationHelper';
import ModernCard from '../components/UI/ModernCard';

const { width } = Dimensions.get('window');

// Funções auxiliares para formatação de data
const formatDateTime = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(date);
  }
};

const formatDateInfo = (createdAt: string | Date, updatedAt: string | Date) => {
  try {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);
    const diffInMinutes = (updated.getTime() - created.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return `Criado ${formatDateTime(created)}`;
    } else {
      return `Modificado ${formatDateTime(updated)}`;
    }
  } catch (e) {
    return 'Data indisponível';
  }
};

type EditDraftScreenRouteProp = RouteProp<{ params: { draftId?: string; draft?: any; originScreen?: 'Home' | 'Obras' | 'Profile' } }, 'params'>;

const EditDraftScreenNew: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditDraftScreenRouteProp>();
  const { activeTheme, getThemeColors } = useSettings();
  const { refreshDrafts, updateDraftOptimistic } = useDrafts();
  const themeColors = getThemeColors();
  const isDark = activeTheme === 'dark';
  
  const { draftId, draft: serializedDraft, originScreen } = route.params;
  
  // Estados principais
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('poesia');
  const [availableTypes, setAvailableTypes] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PoemTemplate | null>(null);
  const [selectedUserTemplate, setSelectedUserTemplate] = useState<UserTemplate | null>(null);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [activeInspirationTab, setActiveInspirationTab] = useState<'textual' | 'themes'>('textual');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para controle de mudanças
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTypeId, setOriginalTypeId] = useState('poesia');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  
  // Estatísticas
  const [wordCount, setWordCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  
  // Refs e animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const borderPulseAnim = useRef(new Animated.Value(0)).current;
  const toastOpacityAnim = useRef(new Animated.Value(0)).current;
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false);

  // Animações de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Carregar dados do rascunho
  useEffect(() => {
    const fetchDraft = async () => {
      setLoading(true);
      
      const id = draftId || serializedDraft?.id;
      if (!id) {
        Alert.alert('Erro', 'ID do rascunho não encontrado.');
        navigation.goBack();
        return;
      }

      const draftData = await DraftService.getDraftById(id);
      
      if (draftData) {
        setDraft(draftData);
        setTitle(draftData.title);
        setContent(draftData.content);
        setOriginalTitle(draftData.title);
        setOriginalContent(draftData.content);
        
        // Configurar tipo/categoria
        if (draftData.typeId) {
          setSelectedTypeId(draftData.typeId);
          setOriginalTypeId(draftData.typeId);
        } else {
          const mappedTypeId = CategoryService.mapLegacyCategory(draftData.category);
          setSelectedTypeId(mappedTypeId);
          setOriginalTypeId(mappedTypeId);
        }

        // Carregar templates se disponíveis
        if (draftData.templateId) {
          const template = POEM_TEMPLATES.find(t => t.id === draftData.templateId);
          if (template) setSelectedTemplate(template);
        }

        if (draftData.userTemplateId) {
          try {
            const userTemplates = await UserTemplateService.getAllTemplates();
            const userTemplate = userTemplates.find(t => t.id === draftData.userTemplateId);
            if (userTemplate) setSelectedUserTemplate(userTemplate);
          } catch (error) {
            console.error('Erro ao carregar template do usuário:', error);
          }
        }
      } else {
        Alert.alert('Erro', 'Rascunho não encontrado');
        navigation.goBack();
      }
      
      setLoading(false);
    };
    
    fetchDraft();
  }, [draftId, serializedDraft]);

  // Carregar tipos de obra
  const loadPoemTypes = async () => {
    try {
      const allCategories = await CategoryService.getAllCategories();
      setAvailableTypes(allCategories);
    } catch (error) {
      console.error('Erro ao carregar tipos de obra:', error);
      // Fallback para categorias padrão
      const defaultCategories = [
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
      setAvailableTypes(defaultCategories);
    }
  };

  useEffect(() => {
    loadPoemTypes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPoemTypes();
    }, [])
  );

  // Detectar mudanças não salvas
  useEffect(() => {
    const titleChanged = title !== originalTitle;
    const contentChanged = content !== originalContent;
    const typeChanged = selectedTypeId !== originalTypeId;
    
    setHasUnsavedChanges(titleChanged || contentChanged || typeChanged);
  }, [title, content, selectedTypeId, originalTitle, originalContent, originalTypeId]);

  // Interceptar navegação para mudanças não salvas
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!hasUnsavedChanges) return;
        
        e.preventDefault();
        setShowUnsavedModal(true);
      });

      return unsubscribe;
    }, [navigation, hasUnsavedChanges])
  );

  // Contador de palavras e versos
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const verses = content.split('\n').filter(line => line.trim().length > 0);
    setWordCount(words.length);
    setVerseCount(verses.length);
  }, [content]);

  // Auto-save inteligente
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if ((title.trim() || content.trim()) && hasUnsavedChanges && !showUnsavedModal) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave(false, false); // Auto-save silencioso
        setIsAutoSaving(true);
        setTimeout(() => setIsAutoSaving(false), 1500);
      }, 3000);
    }
  }, [title, content, hasUnsavedChanges, showUnsavedModal]);

  // Funções auxiliares
  const getLegacyCategory = (): 'Poesia' | 'Jogral' | 'Soneto' => {
    const selectedType = availableTypes.find(type => type.id === selectedTypeId);
    if (selectedType?.name === 'Jogral') return 'Jogral';
    if (selectedType?.name === 'Soneto') return 'Soneto';
    return 'Poesia';
  };

  const getSelectedType = (): Category | null => {
    return availableTypes.find(type => type.id === selectedTypeId) || null;
  };

  // Handlers principais
  const handleGoBack = () => {
    if (isNavigatingRef.current) return;
    
    isNavigatingRef.current = true;
    setHasUnsavedChanges(false);
    
    setTimeout(() => {
      if (originScreen === 'Obras') {
        try {
          navigation.goBack();
        } catch (error) {
          navigation.navigate('ObrasTab' as never);
        }
      } else {
        navigation.goBack();
      }
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    }, 50);
  };

  const handleSave = async (thenGoBack = false, showToast = true) => {
    if (!title.trim()) {
      Alert.alert('Título necessário', 'Por favor, adicione um título ao seu poema.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Conteúdo necessário', 'Por favor, escreva seu poema.');
      return;
    }

    if (!draft?.id) {
      Alert.alert('Erro', 'Rascunho não encontrado.');
      return;
    }

    try {
      await DraftService.updateDraft(
        draft.id, 
        title.trim(), 
        content.trim(), 
        getLegacyCategory(),
        selectedTypeId,
        selectedTemplate?.id,
        selectedUserTemplate?.id
      );
      
      const updatedDraft = await DraftService.getDraftById(draft.id);
      if (updatedDraft) {
        updateDraftOptimistic(updatedDraft);
      }
      
      SimpleCache.invalidateDrafts();
      refreshDrafts();

      // Verificar conquistas
      EnhancedAchievementService.checkAndUpdateAchievements(
        'user_current',
        'poem_edited', 
        { 
          draftId: draft.id,
          wordCount: content.split(/\s+/).length,
          editCount: (draft.editCount || 0) + 1
        }
      );

      setOriginalTitle(title);
      setOriginalContent(content);
      setOriginalTypeId(selectedTypeId);
      setHasUnsavedChanges(false);

      if (thenGoBack) {
        setTimeout(() => {
          handleGoBack();
        }, 100);
        return;
      }

      if (showToast) {
        showSuccessToast();
      }

    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    }
  };

  const handleSaveAndExit = () => {
    setShowUnsavedModal(false);
    handleSave(true, true);
  };

  const handleDiscardAndExit = () => {
    setShowUnsavedModal(false);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    
    setTitle(originalTitle);
    setContent(originalContent);
    setSelectedTypeId(originalTypeId);
    setHasUnsavedChanges(false);
    
    setTimeout(() => {
      handleGoBack();
    }, 100);
  };

  const handleCancelExit = () => {
    setShowUnsavedModal(false);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setIsTyping(true);
    
    startBorderPulseAnimation();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopBorderPulseAnimation();
    }, 1000);
  };

  const startBorderPulseAnimation = () => {
    borderPulseAnim.stopAnimation();
    borderPulseAnim.setValue(0);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(borderPulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const stopBorderPulseAnimation = () => {
    borderPulseAnim.stopAnimation();
    Animated.timing(borderPulseAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const showSuccessToast = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  // Templates e inspiração
  const loadUserTemplates = async () => {
    try {
      const templates = await UserTemplateService.getAllTemplates();
      setUserTemplates(templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  useEffect(() => {
    if (showTemplates) {
      loadUserTemplates();
    }
  }, [showTemplates]);

  const applyTemplate = (template: PoemTemplate) => {
    Alert.alert(
      'Aplicar Template',
      `Deseja aplicar o template "${template.name}"? Isso irá adicionar o exemplo ao final do seu texto atual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            setSelectedTemplate(template);
            setSelectedUserTemplate(null);
            
            const mapTemplateToTypeId = (templateName: string): string => {
              switch (templateName.toLowerCase()) {
                case 'soneto': return 'soneto';
                case 'jogral': return 'jogral';
                default: return 'poesia';
              }
            };
            
            setSelectedTypeId(mapTemplateToTypeId(template.name));
            
            if (content.trim()) {
              setContent(prev => `${prev}\n\n--- ${template.name} ---\n${template.example}`);
            } else {
              setContent(template.example);
            }
            setShowTemplates(false);
          }
        }
      ]
    );
  };

  const handleApplyUserTemplate = async (template: UserTemplate) => {
    Alert.alert(
      'Aplicar Template',
      `Deseja aplicar o template "${template.name}"? Isso irá adicionar o conteúdo ao final do seu texto atual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            setSelectedUserTemplate(template);
            setSelectedTemplate(null);
            
            if (template.categoryId && availableTypes.some(cat => cat.id === template.categoryId)) {
              setSelectedTypeId(template.categoryId);
            }
            
            if (content.trim()) {
              setContent(prev => `${prev}\n\n--- ${template.name} ---\n${template.content}`);
            } else {
              setContent(template.content);
            }
            setShowTemplates(false);
            UserTemplateService.incrementUsage(template.id);
          }
        }
      ]
    );
  };

  const addInspirationPrompt = (prompt: string, isTheme: boolean = false) => {
    if (isTheme) {
      setTitle(prompt);
    } else {
      if (content.trim()) {
        setContent(prev => `${prev}\n\n"${prompt}"\n\n`);
      } else {
        setContent(`"${prompt}"\n\n`);
      }
    }
    setShowInspiration(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      borderPulseAnim.stopAnimation();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: themeColors.background 
      }}>
        <Ionicons name="book" size={48} color={themeColors.primary} />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 18, 
          color: themeColors.textPrimary 
        }}>
          Carregando rascunho...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: themeColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />

      {/* Header moderno com gradiente */}
      <LinearGradient
        colors={themeColors.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          borderBottomLeftRadius: BorderRadius.xl,
          borderBottomRightRadius: BorderRadius.xl,
          ...Shadows.lg,
        }}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Navegação e ações */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: Spacing.md 
            }}>
              <TouchableOpacity
                onPress={() => {
                  if (hasUnsavedChanges) {
                    setShowUnsavedModal(true);
                  } else {
                    handleGoBack();
                  }
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.white} />
                <Text style={{
                  color: Colors.white,
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.medium,
                  marginLeft: Spacing.xs,
                }}>
                  Voltar
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Status indicators */}
                {hasUnsavedChanges && (
                  <View style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.9)',
                    borderRadius: BorderRadius.full,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                    marginRight: Spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons name="time" size={14} color={Colors.white} />
                    <Text style={{
                      color: Colors.white,
                      fontSize: Typography.fontSize.xs,
                      fontWeight: Typography.fontWeight.medium,
                      marginLeft: 4,
                    }}>
                      Não salvo
                    </Text>
                  </View>
                )}

                {isAutoSaving && (
                  <View style={{
                    backgroundColor: 'rgba(40, 167, 69, 0.9)',
                    borderRadius: BorderRadius.full,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs,
                    marginRight: Spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons name="cloud-upload" size={14} color={Colors.white} />
                    <Text style={{
                      color: Colors.white,
                      fontSize: Typography.fontSize.xs,
                      fontWeight: Typography.fontWeight.medium,
                      marginLeft: 4,
                    }}>
                      Salvando...
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => handleSave(true)}
                  style={{
                    backgroundColor: Colors.success,
                    borderRadius: BorderRadius.full,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                  <Text style={{
                    color: Colors.white,
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.bold,
                    marginLeft: Spacing.xs,
                  }}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Informações da obra */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                <Ionicons name="create" size={18} color={Colors.white} style={{ marginRight: Spacing.xs }} />
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.bold,
                  color: Colors.white,
                }}>
                  Editando Obra
                </Text>
              </View>

              {draft && draft.title && (
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: 'rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                  fontWeight: Typography.fontWeight.semibold,
                  marginBottom: Spacing.xs,
                }}>
                  "{draft.title}"
                </Text>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                <Ionicons name="folder" size={14} color="rgba(255, 255, 255, 0.8)" />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginLeft: 4,
                  marginRight: Spacing.md,
                }}>
                  {getSelectedType()?.name || 'Poesia'}
                </Text>
                <Ionicons name="stats-chart" size={14} color="rgba(255, 255, 255, 0.8)" />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginLeft: 4,
                }}>
                  {wordCount} palavras • {verseCount} versos
                </Text>
              </View>

              {draft && (
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  {formatDateInfo(draft.createdAt, draft.updatedAt)}
                </Text>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: 180
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          
          {/* Título da obra */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.md,
            borderWidth: 1,
            borderColor: themeColors.border + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={{
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}
              >
                <Ionicons name="star" size={20} color={Colors.white} />
              </LinearGradient>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                Título da Obra
              </Text>
            </View>
            
            <TextInput
              style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                padding: Spacing.md,
                backgroundColor: themeColors.background,
                borderRadius: BorderRadius.lg,
                borderWidth: 2,
                borderColor: title.trim() ? Colors.primary + '50' : themeColors.border + '30',
                ...Shadows.sm,
              }}
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título da sua obra..."
              placeholderTextColor={themeColors.textSecondary}
              maxLength={100}
            />
          </View>

          {/* Estatísticas em cards */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: Spacing.lg,
          }}>
            <View style={{ width: '31%' }}>
              <ModernCard
                title="Palavras"
                value={wordCount.toString()}
                icon="text"
                gradient={themeColors.gradientPrimary}
                trend="neutral"
                trendValue=""
              />
            </View>
            <View style={{ width: '31%' }}>
              <ModernCard
                title="Versos"
                value={verseCount.toString()}
                icon="list"
                gradient={themeColors.gradientSecondary}
                trend="neutral"
                trendValue=""
              />
            </View>
            <View style={{ width: '31%' }}>
              <ModernCard
                title="Tipo"
                value={getSelectedType()?.name || 'Poesia'}
                icon="library"
                gradient={themeColors.gradientAccent}
                trend="neutral"
                trendValue=""
              />
            </View>
          </View>

          {/* Estilo da obra */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.md,
            borderWidth: 1,
            borderColor: themeColors.border + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
              <LinearGradient
                colors={[Colors.accent, Colors.primary]}
                style={{
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}
              >
                <Ionicons name="library" size={20} color={Colors.white} />
              </LinearGradient>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                Estilo da Obra
              </Text>
            </View>
            
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between',
            }}>
              {availableTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                  style={{
                    backgroundColor: selectedTypeId === type.id 
                      ? Colors.primary 
                      : themeColors.background,
                    borderWidth: 2,
                    borderColor: selectedTypeId === type.id 
                      ? Colors.primary 
                      : themeColors.border + '50',
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.md,
                    alignItems: 'center',
                    width: '48%',
                    marginBottom: Spacing.md,
                    minHeight: 100,
                    justifyContent: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <View style={{
                    backgroundColor: selectedTypeId === type.id 
                      ? 'rgba(255,255,255,0.2)' 
                      : type.color + '20',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginBottom: Spacing.sm,
                  }}>
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={selectedTypeId === type.id ? Colors.white : type.color}
                    />
                  </View>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.bold,
                    color: selectedTypeId === type.id ? Colors.white : themeColors.textPrimary,
                    textAlign: 'center',
                  }}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Descrição do tipo selecionado */}
            {getSelectedType() && (
              <View style={{
                backgroundColor: Colors.primary + '10',
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                marginTop: Spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: Colors.primary,
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textPrimary,
                  fontStyle: 'italic',
                }}>
                  💡 {getSelectedType()?.description}
                </Text>
              </View>
            )}
          </View>

          {/* Ferramentas criativas */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.md,
            borderWidth: 1,
            borderColor: themeColors.border + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <LinearGradient
                colors={[Colors.success, Colors.accent]}
                style={{
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}
              >
                <Ionicons name="bulb" size={20} color={Colors.white} />
              </LinearGradient>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                Ferramentas Criativas
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setShowTemplates(true)}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  alignItems: 'center',
                  marginRight: Spacing.sm,
                  borderWidth: 1,
                  borderColor: themeColors.border + '50',
                  ...Shadows.sm,
                }}
              >
                <Ionicons name="library-outline" size={24} color={Colors.primary} />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginTop: Spacing.xs,
                }}>
                  Templates
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowInspiration(true)}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  alignItems: 'center',
                  marginLeft: Spacing.sm,
                  borderWidth: 1,
                  borderColor: themeColors.border + '50',
                  ...Shadows.sm,
                }}
              >
                <Ionicons name="bulb-outline" size={24} color={Colors.accent} />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textPrimary,
                  marginTop: Spacing.xs,
                }}>
                  Inspiração
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Editor de conteúdo */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.xl,
            ...Shadows.md,
            borderWidth: 1,
            borderColor: themeColors.border + '30',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
              <LinearGradient
                colors={[Colors.accent, Colors.warning]}
                style={{
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}
              >
                <Ionicons name="heart" size={20} color={Colors.white} />
              </LinearGradient>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                Sua Criação
              </Text>
            </View>
            
            <Animated.View style={{
              borderRadius: BorderRadius.lg,
              borderWidth: 2,
              borderColor: borderPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  isTyping ? Colors.primary : (content.trim() ? Colors.primary + '50' : themeColors.border + '30'),
                  isTyping ? Colors.accent : (content.trim() ? Colors.primary + '50' : themeColors.border + '30')
                ]
              }),
              shadowColor: isTyping ? Colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: borderPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [isTyping ? 0.2 : 0, isTyping ? 0.6 : 0]
              }),
              shadowRadius: borderPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [isTyping ? 4 : 0, isTyping ? 12 : 0]
              }),
              elevation: isTyping ? 8 : 0,
            }}>
              <TextInput
                style={{
                  fontSize: Typography.fontSize.base,
                  lineHeight: Typography.fontSize.base * 1.6,
                  color: themeColors.textPrimary,
                  minHeight: 200,
                  padding: Spacing.lg,
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.lg,
                  textAlignVertical: 'top',
                }}
                value={content}
                onChangeText={handleContentChange}
                placeholder="Escreva sua obra aqui...\n\nDeixe sua criatividade fluir..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                scrollEnabled={false}
              />
            </Animated.View>
            
            {/* Contador inspirador */}
            {content.length > 0 && (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: Spacing.md,
                paddingHorizontal: Spacing.sm,
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  fontStyle: 'italic',
                }}>
                  {wordCount} palavras de pura inspiração
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={16} color={Colors.accent} />
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: Colors.accent,
                    fontWeight: Typography.fontWeight.medium,
                    marginLeft: Spacing.xs,
                  }}>
                    Continue criando
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de Templates */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplates(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
            }}>
              Templates de Poesia
            </Text>
            <TouchableOpacity
              onPress={() => setShowTemplates(false)}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
            {POEM_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => applyTemplate(template)}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  marginBottom: Spacing.md,
                  ...Shadows.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                  <Ionicons name={template.icon as any} size={24} color={Colors.primary} />
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.bold,
                    color: themeColors.textPrimary,
                    marginLeft: Spacing.sm,
                  }}>
                    {template.name}
                  </Text>
                </View>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.sm,
                }}>
                  {template.description}
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  fontStyle: 'italic',
                }}>
                  {template.structure}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Templates do usuário */}
            {userTemplates.length > 0 && (
              <>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginTop: Spacing.xl,
                  marginBottom: Spacing.md,
                }}>
                  Meus Templates
                </Text>
                
                {userTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => handleApplyUserTemplate(template)}
                    style={{
                      backgroundColor: themeColors.surface,
                      borderRadius: BorderRadius.lg,
                      padding: Spacing.lg,
                      marginBottom: Spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: template.color,
                      ...Shadows.sm,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: Spacing.sm,
                    }}>
                      <View style={{
                        backgroundColor: template.color,
                        borderRadius: BorderRadius.full,
                        padding: Spacing.sm,
                        marginRight: Spacing.md,
                      }}>
                        <Ionicons name={template.icon as any} size={20} color={Colors.white} />
                      </View>
                      <Text style={{
                        fontSize: Typography.fontSize.base,
                        fontWeight: Typography.fontWeight.semibold,
                        color: themeColors.textPrimary,
                      }}>
                        {template.name}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                    }}>
                      {template.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Inspiração */}
      <Modal
        visible={showInspiration}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInspiration(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
            }}>
              Inspiração Poética
            </Text>
            <TouchableOpacity onPress={() => setShowInspiration(false)}>
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* Abas de inspiração */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          }}>
            <TouchableOpacity
              onPress={() => setActiveInspirationTab('textual')}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeInspirationTab === 'textual' ? Colors.primary : 'transparent',
              }}
            >
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: activeInspirationTab === 'textual' ? Typography.fontWeight.bold : Typography.fontWeight.normal,
                color: activeInspirationTab === 'textual' ? Colors.primary : themeColors.textSecondary,
              }}>
                Inspirações
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveInspirationTab('themes')}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeInspirationTab === 'themes' ? Colors.primary : 'transparent',
              }}
            >
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: activeInspirationTab === 'themes' ? Typography.fontWeight.bold : Typography.fontWeight.normal,
                color: activeInspirationTab === 'themes' ? Colors.primary : themeColors.textSecondary,
              }}>
                Temas
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
            {(activeInspirationTab === 'textual' ? TEXTUAL_INSPIRATIONS : POWERFUL_THEMES).map((prompt, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => addInspirationPrompt(prompt, activeInspirationTab === 'themes')}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  marginBottom: Spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...Shadows.sm,
                }}
              >
                <Ionicons 
                  name={activeInspirationTab === 'textual' ? 'bulb' : 'flame'} 
                  size={20} 
                  color={activeInspirationTab === 'textual' ? Colors.success : Colors.accent} 
                />
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textPrimary,
                  marginLeft: Spacing.md,
                  flex: 1,
                }}>
                  {prompt}
                </Text>
                <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Toast de sucesso */}
      {showToast && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            right: 20,
            backgroundColor: Colors.success,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: BorderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            opacity: toastOpacityAnim,
            zIndex: 1000,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={{
            color: Colors.white,
            fontSize: Typography.fontSize.sm,
            fontWeight: Typography.fontWeight.semibold,
          }}>
            Obra salva com sucesso!
          </Text>
        </Animated.View>
      )}

      {/* Modal de mudanças não salvas */}
      <Modal
        visible={showUnsavedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.lg,
        }}>
          <View style={{
            backgroundColor: themeColors.background,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            width: '100%',
            maxWidth: 400,
            ...Shadows.lg,
          }}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
              <View style={{
                backgroundColor: Colors.warning,
                borderRadius: BorderRadius.full,
                padding: Spacing.md,
                marginBottom: Spacing.md,
              }}>
                <Ionicons name="warning" size={32} color={Colors.white} />
              </View>
              
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                textAlign: 'center',
                marginBottom: Spacing.sm,
              }}>
                Sair sem Salvar?
              </Text>
              
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
              }}>
                Você tem alterações não salvas. O que gostaria de fazer?
              </Text>
            </View>

            <View style={{ gap: Spacing.sm }}>
              <TouchableOpacity
                onPress={handleSaveAndExit}
                style={{
                  backgroundColor: Colors.success,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: Colors.white,
                }}>
                  Salvar e Sair
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDiscardAndExit}
                style={{
                  backgroundColor: Colors.error,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: Colors.white,
                }}>
                  Descartar e Sair
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelExit}
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CreateTemplateModal
        visible={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onSave={() => {
          setShowCreateTemplate(false);
          loadUserTemplates();
        }}
        initialTitle={title}
        initialContent={content}
        initialCategoryId={selectedTypeId}
      />
    </KeyboardAvoidingView>
  );
};

export default EditDraftScreenNew;