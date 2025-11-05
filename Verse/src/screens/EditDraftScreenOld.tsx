
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
import { POEM_TEMPLATES, TEXTUAL_INSPIRATIONS, POWERFUL_THEMES, INSPIRATION_CATEGORIES } from '../constants/poemTemplates';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { NavigationHelper } from '../utils/NavigationHelper';

// Small local date helpers (used in other screens as well)
const formatDateTime = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  } catch (e) {
    return String(date);
  }
};

const formatDateInfo = (createdAt: string | Date, updatedAt: string | Date) => {
  try {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);
    if (created.getTime() === updated.getTime()) return `Criado em ${formatDateTime(created)}`;
    return `Criado em ${formatDateTime(created)}\nÚltima modificação: ${formatDateTime(updated)}`;
  } catch (e) {
    return '';
  }
};



type EditDraftScreenRouteProp = RouteProp<{ params: { draftId?: string; draft?: any; originScreen?: 'Home' | 'Obras' | 'Profile' } }, 'params'>;

const EditDraftScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditDraftScreenRouteProp>();
  const { activeTheme, settings } = useSettings();
  const { refreshDrafts, updateDraftOptimistic } = useDrafts();
  const isDark = activeTheme === 'dark';
  
  const { draftId, draft: serializedDraft, originScreen } = route.params;
  
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState(''); // Campo separado para tema
  const [selectedTypeId, setSelectedTypeId] = useState<string>('poesia');
  const [availableTypes, setAvailableTypes] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PoemTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [selectedUserTemplate, setSelectedUserTemplate] = useState<UserTemplate | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [activeInspirationTab, setActiveInspirationTab] = useState<'textual' | 'themes'>('textual');
  const [wordCount, setWordCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para controle de mudanças não salvas
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTypeId, setOriginalTypeId] = useState('poesia');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSavingBlocked, setIsSavingBlocked] = useState(false); // Flag para bloquear salvamento
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const borderPulseAnim = useRef(new Animated.Value(0)).current;
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacityAnim = useRef(new Animated.Value(0)).current;
  const isNavigatingRef = useRef(false); // Flag para prevenir múltiplas navegações

  const themeColors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    surface: isDark ? '#2a2a2a' : '#f8f9fa',
    textPrimary: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
  };

  // Animações de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
        
        // Armazenar valores originais para detectar mudanças
        setOriginalTitle(draftData.title);
        setOriginalContent(draftData.content);
        
        // Priorizar typeId se disponível, senão usar categoria legacy
        if (draftData.typeId) {
          setSelectedTypeId(draftData.typeId);
          setOriginalTypeId(draftData.typeId);
        } else {
          // Converter categoria antiga para ID do tipo (compatibilidade)
          const mappedTypeId = CategoryService.mapLegacyCategory(draftData.category);
          setSelectedTypeId(mappedTypeId);
          setOriginalTypeId(mappedTypeId);
        }

        // Carregar template usado se disponível
        if (draftData.templateId) {
          const template = POEM_TEMPLATES.find(t => t.id === draftData.templateId);
          if (template) {
            setSelectedTemplate(template);
            console.log('📋 Template padrão carregado:', template.name);
          }
        }

        if (draftData.userTemplateId) {
          try {
            const userTemplates = await UserTemplateService.getAllTemplates();
            const userTemplate = userTemplates.find(t => t.id === draftData.userTemplateId);
            if (userTemplate) {
              setSelectedUserTemplate(userTemplate);
              console.log('📋 Template do usuário carregado:', userTemplate.name);
            }
          } catch (error) {
            console.error('Erro ao carregar template do usuário:', error);
          }
        }

        // Carregar tema se disponível
        if (draftData.theme) {
          setTheme(draftData.theme);
          console.log('🎨 Tema carregado:', draftData.theme);
        }
      } else {
        Alert.alert('Erro', 'Rascunho não encontrado');
        navigation.goBack();
      }
      
      setLoading(false);
    };
    
    fetchDraft();
  }, [draftId, serializedDraft]);

  // Função para carregar tipos de obra
  const loadPoemTypes = async () => {
    try {
      console.log('🔄 EditDraftScreen - Carregando tipos de obra...');

      // Carregar todas as categorias (padrão + personalizadas)
      const allCategories = await CategoryService.getAllCategories();
      console.log('📋 EditDraftScreen - Categorias carregadas:', allCategories.length);
      console.log('📝 EditDraftScreen - Categorias:', allCategories.map(c => `${c.name} (${c.id})`));

      setAvailableTypes(allCategories);
    } catch (error) {
      console.error('❌ EditDraftScreen - Erro ao carregar tipos de obra:', error);
      // Fallback: usar categorias padrão
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
      console.log('🔄 EditDraftScreen - Usando categorias padrão:', defaultCategories.length);
      setAvailableTypes(defaultCategories);
    }
  };

  // Carregar tipos de obra disponíveis
  useEffect(() => {
    loadPoemTypes();
  }, []);

  // Recarregar tipos quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 EditDraftScreen - Tela ganhou foco, recarregando tipos...');
      loadPoemTypes();
    }, [])
  );

  // Função para recarregar tipos manualmente
  const reloadTypes = async () => {
    console.log('🔄 Recarregando tipos manualmente...');
    await loadPoemTypes();
  };

  // Função para obter categoria no formato antigo (para compatibilidade)
  const getLegacyCategory = (): 'Poesia' | 'Jogral' | 'Soneto' => {
    const selectedType = availableTypes.find(type => type.id === selectedTypeId);
    if (selectedType?.name === 'Jogral') return 'Jogral';
    if (selectedType?.name === 'Soneto') return 'Soneto';
    return 'Poesia';
  };

  // Função para obter o tipo selecionado
  const getSelectedType = (): Category | null => {
    return availableTypes.find(type => type.id === selectedTypeId) || null;
  };

  // Detectar mudanças não salvas
  useEffect(() => {
    const titleChanged = title !== originalTitle;
    const contentChanged = content !== originalContent;
    const typeChanged = selectedTypeId !== originalTypeId;
    
    setHasUnsavedChanges(titleChanged || contentChanged || typeChanged);
  }, [title, content, selectedTypeId, originalTitle, originalContent, originalTypeId]);

  // Interceptar navegação para mostrar aviso de mudanças não salvas
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        console.log('🚧 beforeRemove interceptado, hasUnsavedChanges:', hasUnsavedChanges);
        
        if (!hasUnsavedChanges) {
          // Se não há mudanças, permitir navegação
          console.log('✅ Navegação permitida - sem mudanças');
          return;
        }

        // Prevenir navegação padrão
        e.preventDefault();
        console.log('⚠️ Navegação bloqueada - mostrando modal');

        // Mostrar modal de confirmação
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

  // Auto-save com debounce (sem toast e menos frequente)
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Só faz auto-save se estiver habilitado nas configurações E tiver conteúdo, mudanças E o salvamento não estiver bloqueado
    if (settings.autoSaveEnabled && (title.trim() || content.trim()) && hasUnsavedChanges && !showUnsavedModal && !isSavingBlocked) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-salvando rascunho...');
        handleSave(false, false); // Auto-save sem toast
        setIsAutoSaving(true);
        setTimeout(() => setIsAutoSaving(false), 1000); // Mostra indicador por 1 segundo
      }, 5000); // Aumentado para 5 segundos
    } else if (!settings.autoSaveEnabled && hasUnsavedChanges) {
      console.log('⚠️ Auto-save desabilitado nas configurações');
    }
  }, [title, content, hasUnsavedChanges, showUnsavedModal, isSavingBlocked, settings.autoSaveEnabled]);

  // Carregar templates do usuário quando o modal de templates é aberto
  useEffect(() => {
    if (showTemplates) {
      console.log('📖 EditDraft: Modal de templates aberto, carregando templates...');
      loadUserTemplates();
    }
  }, [showTemplates]);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Parar animação de borda se estiver rodando
      borderPulseAnim.stopAnimation();
    };
  }, []);

  const handleGoBack = () => {
    // Prevenir múltiplas chamadas
    if (isNavigatingRef.current) {
      console.log('🚫 Navegação já em andamento, ignorando...');
      return;
    }
    
    console.log(`🔙 Saindo da edição, origem: ${originScreen}`);
    isNavigatingRef.current = true;
    
    // Garantir que não há mudanças não salvas primeiro
    setHasUnsavedChanges(false);
    
    // Usar setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      if (originScreen === 'Obras') {
        try {
          console.log('🔄 Tentando navegação goBack() primeiro...');
          // Primeiro tentar um simples goBack()
          navigation.goBack();
          console.log('✅ Navegação goBack() executada');
        } catch (error) {
          console.log('⚠️ goBack() falhou, tentando navegação para ObrasTab');
          try {
            // Tentar navegação direta para ObrasTab
            navigation.navigate('ObrasTab' as never);
            console.log('✅ Navegação direta para ObrasTab executada');
          } catch (error2) {
            console.log('⚠️ Navegação direta falhou, usando NavigationHelper');
            NavigationHelper.navigateToObras();
          }
        }
      } else {
        // Para outras origens (Home, Profile), usar goBack() simples
        console.log('🔄 Executando goBack() para origem:', originScreen);
        navigation.goBack();
      }
      
      // Reset da flag após um tempo
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    }, 50);
  };

  const handleSave = async (thenGoBack = false, showToast = true) => {
    // Bloquear salvamento se o modal estiver aberto (exceto quando explicitamente chamado pelo modal)
    if (isSavingBlocked && !thenGoBack) {
      console.log('🚫 Salvamento bloqueado - modal aberto');
      return;
    }

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
        selectedUserTemplate?.id,
        theme.trim()
      );
      const updatedDraft = await DraftService.getDraftById(draft.id);
      if (updatedDraft) {
        updateDraftOptimistic(updatedDraft);
      }
      
      // Invalidar cache para garantir que a lista seja atualizada
      SimpleCache.invalidateDrafts();
      console.log('🧹 Cache invalidado após salvar obra');
      
      refreshDrafts();

      // Verificar conquistas em segundo plano
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
        // Usar setTimeout para garantir que o estado seja atualizado antes da navegação
        setTimeout(() => {
          handleGoBack();
        }, 100);
        return; // Interrompe aqui para não mostrar toast
      }

      if (showToast) {
        showSuccessToast();
      }

    } catch (error) {
      console.error('❌ Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    }
  };

  // Função para salvar e sair
  const handleSaveAndExit = () => {
    console.log('💾 Salvando e saindo...');
    setIsSavingBlocked(false); // Permitir salvamento
    setShowUnsavedModal(false);
    handleSave(true, true); // Salva, sai e mostra toast
  };

  // Função para descartar mudanças e sair
  const handleDiscardAndExit = () => {
    console.log('🗑️ Descartando mudanças e saindo...');
    setIsSavingBlocked(false); // Desbloquear salvamento
    setShowUnsavedModal(false);
    
    // Limpar timeout de auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    
    // Restaurar conteúdo original
    setTitle(originalTitle);
    setContent(originalContent);
    setSelectedTypeId(originalTypeId);
    
    // Desativar flag de mudanças não salvas
    setHasUnsavedChanges(false);
    
    // Garantir que o estado seja atualizado antes de navegar
    setTimeout(() => {
      handleGoBack();
    }, 100);
  };

  // Função para cancelar e continuar editando
  const handleCancelExit = () => {
    console.log('❌ Cancelando saída - continuando edição');
    setIsSavingBlocked(false); // Desbloquear salvamento
    setShowUnsavedModal(false);
    
    // Limpar qualquer timeout de auto-save pendente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  };

  const mapTemplateToTypeId = (templateName: string): string => {
    switch (templateName.toLowerCase()) {
      case 'soneto':
        return 'soneto';
      case 'jogral':
        return 'jogral';
      default:
        return 'poesia';
    }
  };

  const applyTemplate = (template: PoemTemplate) => {
    console.log('🎯 EditDraft: Aplicando template:', template.name);
    
    Alert.alert(
      'Aplicar Template',
      `Deseja aplicar o template "${template.name}"? Isso irá adicionar o exemplo ao final do seu texto atual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            console.log('✅ EditDraft: Template confirmado, aplicando...');
            setSelectedTemplate(template);
            setSelectedUserTemplate(null); // Limpar template do usuário se houver
            setSelectedTypeId(mapTemplateToTypeId(template.name));
            if (content.trim()) {
              setContent(prev => `${prev}\n\n--- ${template.name} ---\n${template.example}`);
            } else {
              setContent(template.example);
            }
            setShowTemplates(false);
            console.log('✅ EditDraft: Template aplicado com sucesso');
          }
        }
      ]
    );
  };

  // Funções para Templates do Usuário
  const loadUserTemplates = async () => {
    try {
      console.log('🔄 EditDraft: Carregando templates do usuário...');
      const templates = await UserTemplateService.getAllTemplates();
      console.log('📁 EditDraft: Templates carregados:', templates.length, templates);
      setUserTemplates(templates);
    } catch (error) {
      console.error('❌ EditDraft: Erro ao carregar templates:', error);
    }
  };

  const handleApplyUserTemplate = async (template: UserTemplate) => {
    try {
      Alert.alert(
        'Aplicar Template',
        `Deseja aplicar o template "${template.name}"? Isso irá adicionar o conteúdo ao final do seu texto atual.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Aplicar',
            onPress: () => {
              setSelectedUserTemplate(template);
              setSelectedTemplate(null); // Limpar template padrão se houver
              if (template.categoryId && availableTypes.some(cat => cat.id === template.categoryId)) {
                setSelectedTypeId(template.categoryId);
              }
              if (content.trim()) {
                setContent(prev => `${prev}\n\n--- ${template.name} ---\n${template.content}`);
              } else {
                setContent(template.content);
              }
              setShowTemplates(false);
              // Incrementar uso do template
              UserTemplateService.incrementUsage(template.id);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
    }
  };

  const addInspirationPrompt = (prompt: string, isTheme: boolean = false) => {
    console.log('🎯 EditDraft: Aplicando inspiração:', prompt, 'isTheme:', isTheme);
    
    if (isTheme) {
      // Para temas poderosos, adiciona ao título (conforme solicitado anteriormente)
      setTitle(prompt);
      console.log('✅ EditDraft: Tema aplicado ao título');
    } else {
      // Para inspirações textuais, adiciona ao conteúdo
      if (content.trim()) {
        setContent(prev => `${prev}\n\n"${prompt}"\n\n`);
      } else {
        setContent(`"${prompt}"\n\n`);
      }
      console.log('✅ EditDraft: Inspiração textual aplicada');
    }
    setShowInspiration(false);
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

  // Função para gerenciar estado de digitação
  const handleContentChange = (text: string) => {
    console.log('🌟 Digitando:', text.length, 'caracteres');
    setContent(text);
    setIsTyping(true);
    
    // Iniciar animação de pulso
    console.log('🎨 Iniciando animação de borda');
    startBorderPulseAnimation();
    
    // Limpar timeout anterior se existir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Definir novo timeout para parar o estado de digitação
    typingTimeoutRef.current = setTimeout(() => {
      console.log('⏹️ Parando animação de borda');
      setIsTyping(false);
      stopBorderPulseAnimation();
    }, 1000); // Para de digitar após 1 segundo de inatividade
  };

  const startBorderPulseAnimation = () => {
    // Parar qualquer animação anterior
    borderPulseAnim.stopAnimation();
    // Resetar para 0
    borderPulseAnim.setValue(0);
    
    // Iniciar nova animação em loop
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Ionicons name="book" size={48} color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#1a1a1a' }}>
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

      {/* Header Melhorado */}
      <LinearGradient
        colors={isDark ? Colors.gradientNight as any : Colors.gradientPrimary as any}
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
            {/* Linha superior com navegação e ações */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md }}>
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
                {/* Indicador de status */}
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
                  textAlign: 'center',
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
          paddingTop: Spacing.md,
          paddingBottom: 160 // Espaço suficiente para não sobrepor com o tab navigator
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Título */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            marginBottom: Spacing.lg,
            ...Shadows.lg,
            borderWidth: 1,
            borderColor: themeColors.border + '50',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <View style={{
                backgroundColor: Colors.primary + '20',
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
                marginRight: Spacing.md,
              }}>
                <Ionicons name="star" size={20} color={Colors.primary} />
              </View>
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
              }}>
                ⭐ Título da Sua Obra
              </Text>
            </View>
            <TextInput
              style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                padding: Spacing.base,
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                borderWidth: 1,
                borderColor: title.trim() ? Colors.primary : themeColors.border,
                ...Shadows.sm,
              }}
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título da sua obra..."
              placeholderTextColor={themeColors.textSecondary}
              maxLength={100}
            />
          </View>

          {/* Tipos de Obra */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            marginBottom: Spacing.lg,
            ...Shadows.lg,
            borderWidth: 1,
            borderColor: themeColors.border + '50',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={{
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}
              >
                <Ionicons name="library" size={20} color={Colors.white} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: Typography.fontSize.xl,
                  fontWeight: Typography.fontWeight.bold,
                  color: themeColors.textPrimary,
                }}>
                  📚 Estilo da Obra
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginTop: 2,
                }}>
                  Escolha o que melhor representa sua criação
                </Text>
              </View>
              <TouchableOpacity
                onPress={reloadTypes}
                style={{
                  backgroundColor: Colors.primary + '20',
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                }}
              >
                <Ionicons name="refresh" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Grid de Tipos Melhorado */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'flex-start',
              alignContent: 'flex-start',
              paddingBottom: Spacing.sm, // Adiciona padding para evitar sobreposição
            }}>
              {availableTypes.map((type: any, index: number) => (
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
                    borderRadius: BorderRadius.xl,
                    padding: Spacing.md,
                    alignItems: 'center',
                    flexBasis: '32%',
                    marginRight: Spacing.sm,
                    minHeight: 120,
                    justifyContent: 'center',
                    ...Shadows.sm,
                    transform: [{ scale: selectedTypeId === type.id ? 1.02 : 1 }],
                    marginBottom: Spacing.md, // Adiciona margem inferior para melhor espaçamento
                  }}
                >
                  <View style={{
                    backgroundColor: selectedTypeId === type.id 
                      ? 'rgba(255,255,255,0.2)' 
                      : Colors.primary + '20',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.md,
                    marginBottom: Spacing.sm,
                  }}>
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={selectedTypeId === type.id ? Colors.white : Colors.primary}
                    />
                  </View>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.bold,
                    color: selectedTypeId === type.id ? Colors.white : themeColors.textPrimary,
                    textAlign: 'center',
                    lineHeight: Typography.fontSize.sm * 1.2,
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
                padding: Spacing.lg,
                marginTop: Spacing.lg,
                borderLeftWidth: 4,
                borderLeftColor: Colors.primary,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                  <Ionicons name="information-circle" size={16} color={Colors.primary} />
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.bold,
                    color: Colors.primary,
                    marginLeft: Spacing.xs,
                  }}>
                    Sobre este estilo
                  </Text>
                </View>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textPrimary,
                  fontStyle: 'italic',
                  lineHeight: Typography.fontSize.base * 1.5,
                }}>
                  💡 {getSelectedType()?.description}
                </Text>
              </View>
            )}
          </View>

          {/* Template Selecionado */}
          {selectedTemplate && (
            <View style={{
              backgroundColor: `${selectedTemplate.gradient[0]}15`,
              borderRadius: BorderRadius.lg,
              padding: Spacing.base,
              marginBottom: Spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: selectedTemplate.gradient[0],
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: selectedTemplate.gradient[0],
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginRight: Spacing.md,
                  }}>
                    <Ionicons 
                      name={selectedTemplate.icon as any} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: Typography.fontSize.base,
                      fontWeight: Typography.fontWeight.semibold,
                      color: themeColors.textPrimary,
                    }}>
                      {selectedTemplate.name}
                    </Text>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                      marginTop: Spacing.xs,
                    }}>
                      Template Padrão
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTemplate(null);
                  }}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.xs,
                  }}
                >
                  <Ionicons name="close" size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Template do Usuário Selecionado */}
          {selectedUserTemplate && (
            <View style={{
              backgroundColor: `${selectedUserTemplate.color}15`,
              borderRadius: BorderRadius.lg,
              padding: Spacing.base,
              marginBottom: Spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: selectedUserTemplate.color,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: selectedUserTemplate.color,
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginRight: Spacing.md,
                  }}>
                    <Ionicons 
                      name={selectedUserTemplate.icon as any} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: Typography.fontSize.base,
                      fontWeight: Typography.fontWeight.semibold,
                      color: themeColors.textPrimary,
                    }}>
                      {selectedUserTemplate.name}
                    </Text>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                      marginTop: Spacing.xs,
                    }}>
                      Meu Template
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUserTemplate(null);
                  }}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: BorderRadius.full,
                    padding: Spacing.xs,
                  }}
                >
                  <Ionicons name="close" size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ferramentas Criativas */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.base,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Ferramentas Criativas
            </Text>
            
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity
                onPress={() => {
                  console.log('🎯 EditDraft: Botão Templates pressionado');
                  setShowTemplates(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
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
                onPress={() => {
                  console.log('🎯 EditDraft: Botão Inspiração pressionado');
                  setShowInspiration(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
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

          {/* Estatísticas */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            ...Shadows.sm,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  Palavras
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.xl,
                  fontWeight: Typography.fontWeight.bold,
                  color: Colors.primary,
                  marginTop: 2,
                }}>
                  {wordCount}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  Versos
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.xl,
                  fontWeight: Typography.fontWeight.bold,
                  color: Colors.success,
                  marginTop: 2,
                }}>
                  {verseCount}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  Tipo
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: Colors.accent,
                  marginTop: 2,
                }}>
                  {getSelectedType()?.name || 'Poesia'}
                </Text>
              </View>
            </View>
          </View>

          {/* Editor de Conteúdo */}
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            marginBottom: Spacing.xl,
            ...Shadows.lg,
            borderWidth: 1,
            borderColor: themeColors.border + '50',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: Colors.accent + '20',
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}>
                  <Ionicons name="heart" size={20} color={Colors.accent} />
                </View>
                <Text style={{
                  fontSize: Typography.fontSize.xl,
                  fontWeight: Typography.fontWeight.bold,
                  color: themeColors.textPrimary,
                }}>
                  ✨ Sua Criação
                </Text>
              </View>
              {isAutoSaving && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-upload" size={16} color={Colors.success} />
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: Colors.success,
                    marginLeft: Spacing.xs,
                    fontWeight: Typography.fontWeight.medium,
                  }}>
                    Salvando...
                  </Text>
                </View>
              )}
            </View>
            
            <Animated.View style={{
              borderRadius: BorderRadius.lg,
              borderWidth: 2,
              borderColor: borderPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  isTyping ? '#007AFF' : (content.trim() ? Colors.primary : themeColors.border),
                  isTyping ? '#00D4FF' : (content.trim() ? Colors.primary : themeColors.border)
                ]
              }),
              shadowColor: isTyping ? '#00D4FF' : 'transparent',
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
                  lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
                  color: themeColors.textPrimary,
                  minHeight: 200,
                  padding: Spacing.base,
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  textAlignVertical: 'top',
                  borderWidth: 0, // Remove border do TextInput, já que está na View animada
                }}
                value={content}
                onChangeText={handleContentChange}
                placeholder="Escreva sua obra aqui...\n\nDeixe sua criatividade fluir..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                scrollEnabled={false}
              />
            </Animated.View>
            
            {/* Contador de palavras inspirador */}
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
                  {content.split(' ').filter((word: string) => word.length > 0).length} palavras de pura inspiração
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
              flex: 1,
            }}>
              Templates de Poesia
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setShowTemplates(false);
                  setShowCreateTemplate(true);
                }}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.sm,
                }}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
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

            {/* Templates do Usuário */}
            {userTemplates.length > 0 && (
              <>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginTop: Spacing.xl,
                  marginBottom: Spacing.md,
                }}>
                  🔖 Meus Templates
                </Text>
                
                {userTemplates.map((template: any) => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => handleApplyUserTemplate(template)}
                    style={{
                      backgroundColor: selectedUserTemplate?.id === template.id 
                        ? template.color + '20' 
                        : themeColors.surface,
                      borderRadius: BorderRadius.lg,
                      padding: Spacing.base,
                      marginBottom: Spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: template.color,
                      borderWidth: selectedUserTemplate?.id === template.id ? 2 : 0,
                      borderColor: selectedUserTemplate?.id === template.id ? template.color : 'transparent',
                      ...Shadows.sm,
                    }}
                  >
                    {selectedUserTemplate?.id === template.id && (
                      <View style={{
                        position: 'absolute',
                        top: Spacing.sm,
                        right: Spacing.sm,
                        backgroundColor: template.color,
                        borderRadius: BorderRadius.full,
                        padding: Spacing.xs,
                      }}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
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
                        <Ionicons name={template.icon as any} size={20} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: Typography.fontSize.base,
                          fontWeight: Typography.fontWeight.semibold,
                          color: themeColors.textPrimary,
                        }}>
                          {template.name}
                        </Text>
                        <Text style={{
                          fontSize: Typography.fontSize.sm,
                          color: themeColors.textSecondary,
                        }}>
                          {template.description}
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: BorderRadius.base,
                      padding: Spacing.sm,
                    }}>
                      <Text style={{
                        fontSize: Typography.fontSize.sm,
                        color: themeColors.textSecondary,
                        fontStyle: 'italic',
                      }}>
                        {template.content.length > 100 
                          ? template.content.substring(0, 100) + '...' 
                          : template.content}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Seção para criar primeiro template quando não há nenhum */}
            {userTemplates.length === 0 && (
              <>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginTop: Spacing.xl,
                  marginBottom: Spacing.md,
                }}>
                  🔖 Meus Templates
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowTemplates(false);
                    setShowCreateTemplate(true);
                  }}
                  style={{
                    backgroundColor: themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.lg,
                    marginBottom: Spacing.md,
                    borderWidth: 2,
                    borderColor: themeColors.border,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...Shadows.sm,
                  }}
                >
                  <Ionicons 
                    name="add-circle-outline" 
                    size={32} 
                    color={Colors.primary} 
                    style={{ marginBottom: Spacing.sm }}
                  />
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: Colors.primary,
                    marginBottom: Spacing.xs,
                  }}>
                    Criar Template desta Obra
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Salve esta obra como template para usar depois
                  </Text>
                </TouchableOpacity>
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
          
          {/* Abas de Inspiração */}
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

      {/* Toast de Sucesso */}
      {showToast && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 50, // Reduzido de 100 para 50 para ficar mais próximo do topo
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
            Poema salvo!
          </Text>
        </Animated.View>
      )}

      {/* Modal de mudanças não salvas */}
      <Modal
        visible={showUnsavedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
        onShow={() => {
          // Bloquear completamente qualquer salvamento quando modal abrir
          console.log('🚫 Modal aberto - bloqueando salvamento');
          setIsSavingBlocked(true);
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
          }
        }}
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
        onTemplateCreated={async (template: any) => {
          await loadUserTemplates();
          setShowCreateTemplate(false);
          Alert.alert('✅ Sucesso', 'Template criado com sucesso!');
        }}
        initialContent={content}
        initialCategory={selectedTypeId}
      />
    </KeyboardAvoidingView>
  );
};

export default EditDraftScreen;
