import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { TEXTUAL_INSPIRATIONS, INSPIRATION_CATEGORIES } from '../constants/inspirations';
import WriterDashboardService from '../services/WriterDashboardService';
import PresentationModeService from '../services/PresentationModeService';
import VisualEditorService from '../services/VisualEditorService';
import ResourceLibraryService from '../services/ResourceLibraryService';
import { useSettings } from '../contexts/SettingsContext';
import { useDrafts } from '../contexts/DraftsContext';
import { useApp } from '../contexts/AppContext';
import { DraftService } from '../services/DraftService';
import { NavigationHelper } from '../utils/NavigationHelper';
import { CategoryService, Category } from '../services/CategoryService';
import { UserTemplateService, UserTemplate } from '../services/UserTemplateService';
import { PDFService } from '../services/PDFService';
import SimpleCache from '../utils/SimpleCache';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CreateTemplateModal from '../components/CreateTemplateModal';

interface PoemTemplate {
  id: string;
  name: string;
  description: string;
  structure: string;
  example: string;
  icon: string;
  gradient: string[];
}

const POEM_TEMPLATES: PoemTemplate[] = [
  {
    id: 'free_verse',
    name: 'Verso Livre',
    description: 'Forma livre de expressão poética sem regras rígidas',
    structure: 'Sem estrutura fixa - deixe sua criatividade fluir',
    example: 'Como o vento que dança...\nEntre as folhas do outono...',
    icon: 'create-outline',
    gradient: Colors.gradientPrimary,
  },
  {
    id: 'sonnet',
    name: 'Soneto',
    description: 'Forma clássica com 14 versos e estrutura definida',
    structure: '14 versos: 2 quartetos + 2 tercetos\nEsquema: ABBA ABBA CDC DCD',
    example: 'Amor é fogo que arde sem se ver...\nÉ ferida que dói e não se sente...',
    icon: 'library-outline',
    gradient: Colors.gradientAccent,
  },
];

// TEMAS FORTES PARA OBRAS - Temas curtos e impactantes
const POWERFUL_THEMES = [
  // Poder e Autoridade Divina
  'O Poder da Cruz',
  'Deus ainda é Deus',
  'O Nome que está acima de todo nome',
  'Quando Deus silencia',
  'O rugido do Leão de Judá',
  'Sangue precioso',
  'A força do perdão',
  'Fogo consumidor',
  'Águas profundas',
  'O trono eterno',
  
  // Reflexão e Questionamento
  'Com tão pouco tempo, o que faremos?',
  'Em que lugar da tua vida Deus está?',
  'Percebes a Sua presença?',
  'Onde está a tua fé?',
  'O que fazes com teus talentos?',
  'Qual é o preço da tua alma?',
  'Para que foste chamado?',
  'Quando foi a última vez que choraste?',
  'O que resta quando tudo acaba?',
  'Quem és quando ninguém te vê?',
  
  // Intimidade e Relacionamento
  'Face a face com Deus',
  'No secreto do Altíssimo',
  'Coração partido, espírito quebrantado',
  'Sede de Ti, ó Deus',
  'Mais perto quero estar',
  'Abba, Pai',
  'Como a corça brama',
  'Vem, Espírito Santo',
  'Maranata, ora vem',
  'Eis-me aqui, envia-me',
  
  // Luta e Vitória
  'Gigantes que precisam cair',
  'Muralhas de Jericó',
  'Vale de ossos secos',
  'Fornalha ardente',
  'Cova dos leões',
  'Mar Vermelho se abre',
  'Pedra rolada',
  'Véu rasgado',
  'Morte, onde está teu aguilhão?',
  'Ressurreição e vida',
  
  // Tempo e Eternidade
  'Kairos - o tempo de Deus',
  'Última hora',
  'Enquanto é hoje',
  'Tempo de plantar, tempo de colher',
  'Geração que passa',
  'Pegadas na areia',
  'Vapor que aparece',
  'Eternidade no coração',
  'Um dia em Teus átrios',
  'Para sempre, ó Senhor',
  
  // Transformação e Crescimento
  'De glória em glória',
  'Vasos de barro',
  'Ouro refinado no fogo',
  'Quebrantamento que cura',
  'Morrer para viver',
  'Nascer de novo',
  'Águas vivas',
  'Fruto em toda estação',
  'Sal da terra',
  'Luz do mundo',
  
  // Missão e Propósito
  'Ide por todo mundo',
  'Pescadores de homens',
  'Ceifeiros na seara',
  'Embaixadores de Cristo',
  'Cartas vivas',
  'Testemunhas até aos confins',
  'Pregadores da verdade',
  'Consoladores dos aflitos',
  'Libertadores dos cativos',
  'Curadores dos feridos',
];

interface InspirationCategory {
  name: string;
  prompts: string[];
  icon: string;
  color: string;
}

// Categorias organizadas para interface (removido - usando import)

const CreatePoemMasterpiece: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme, getThemeColors: getGlobalThemeColors } = useSettings();
  const { refreshDrafts, addDraftOptimistic, updateDraftOptimistic } = useDrafts();
  const { profile } = useApp();
  const isDark = activeTheme === 'dark';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [availableTypes, setAvailableTypes] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PoemTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [activeInspirationTab, setActiveInspirationTab] = useState<'textual' | 'themes'>('textual');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [selectedUserTemplate, setSelectedUserTemplate] = useState<UserTemplate | null>(null);
  const [showResourceLibrary, setShowResourceLibrary] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [visualEditorSettings, setVisualEditorSettings] = useState(VisualEditorService.getVisualThemes().modern);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  
  const [theme, setTheme] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const borderPulseAnim = useRef(new Animated.Value(0)).current;
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeColors = getGlobalThemeColors();
  const { settings } = useSettings(); // Obter configurações, incluindo autoSaveEnabled

  useEffect(() => {
    // Carregar tipos disponíveis e templates
    const loadData = async () => {
      try {
        const types = await CategoryService.getAllCategories();
        setAvailableTypes(types);
        // Selecionar o primeiro tipo por padrão
        if (types.length > 0 && !selectedTypeId) {
          setSelectedTypeId(types[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, []);

  // Carregar templates do usuário quando o modal de templates é aberto
  useEffect(() => {
    if (showTemplates) {
      console.log('📖 Modal de templates aberto, carregando templates...');
      loadUserTemplates();
    }
  }, [showTemplates]);

  // Função para resetar completamente para nova obra
  const resetToNewPoem = useCallback(() => {
    console.log('🆕 Resetando para nova obra...');
    
    // Cancelar qualquer auto-save pendente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    
    // Limpar completamente o estado
    setTitle('');
    setContent('');
    setCurrentDraftId(null);
    setSelectedTemplate(null);
    setSelectedUserTemplate(null);
    setWordCount(0);
    setVerseCount(0);
    setIsAutoSaving(false);
    
    // Reset para primeira categoria disponível
    if (availableTypes.length > 0) {
      setSelectedTypeId(availableTypes[0].id);
    }
    
    console.log('✅ Estado resetado para nova obra');
  }, [availableTypes]);

  // Função para recarregar tipos
  const reloadTypes = async () => {
    try {
      console.log('🔄 CreatePoem: Recarregando tipos...');
      const types = await CategoryService.getAllCategories();
      setAvailableTypes(types);
      console.log('✅ CreatePoem: Tipos recarregados:', types.length);
    } catch (error) {
      console.error('❌ CreatePoem: Erro ao recarregar tipos:', error);
    }
  };

  // Recarregar tipos quando a tela receber foco (ex: voltando da tela de gerenciar categorias)
  useFocusEffect(
    useCallback(() => {
      const reloadTypesOnFocus = async () => {
        try {
          console.log('🔄 CreatePoem: Recarregando tipos com limpeza de cache...');
          const types = await CategoryService.getAllCategories();
          setAvailableTypes(types);
          console.log('✅ CreatePoem: Tipos recarregados:', types.length);
        } catch (error) {
          console.error('❌ CreatePoem: Erro ao recarregar tipos:', error);
        }
      };
      
      reloadTypesOnFocus();
    }, [])
  );

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  useEffect(() => {
    // Contagem de palavras e versos
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const verses = content.split('\n').filter(line => line.trim().length > 0);
    setWordCount(words.length);
    setVerseCount(verses.length);

    // Auto-save inteligente com debounce - só auto-salva se há conteúdo substancial
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Só auto-salva se a configuração estiver ativada E há título E conteúdo com pelo menos 10 caracteres
    if (settings.autoSaveEnabled && title.trim() && content.trim().length >= 10) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 3000); // Aumentei para 3 segundos para reduzir duplicações
    }
  }, [title, content, currentDraftId, settings.autoSaveEnabled]);
  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const autoSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsAutoSaving(true);
    
    try {
      const selectedCategory = getSelectedType();
      const categoryName = selectedCategory?.name || 'Poesia';
      const trimmedTitle = (title || 'Rascunho sem título').trim();
      const trimmedContent = content.trim();
      
      // Se temos um currentDraftId, tentar atualizar primeiro
      if (currentDraftId) {
        try {
          console.log('🔄 Auto-save: Tentando atualizar rascunho:', currentDraftId);
          const updatedDraft = await DraftService.getDraftById(currentDraftId);
          if(updatedDraft){
            updateDraftOptimistic(updatedDraft);
          }
          await DraftService.updateDraft(
            currentDraftId,
            trimmedTitle,
            trimmedContent,
            categoryName, // Usar o nome da categoria
            selectedTypeId,
            selectedTemplate?.id,
            selectedUserTemplate?.id,
            theme.trim()
          );
          await refreshDrafts(); // Still refresh in background
          console.log('✅ Auto-save: Rascunho atualizado');
          return;
        } catch (error) {
          console.warn('⚠️ Auto-save: Rascunho não existe mais, resetando ID:', error);
          setCurrentDraftId(null); // Reset o ID se o rascunho não existe
        }      }
      
      // Criar novo rascunho (ou se falhou a atualização acima)
      console.log('💾 Auto-save: Criando novo rascunho');
      const newDraftId = await DraftService.saveDraft(
        trimmedTitle,
        trimmedContent,
        categoryName, // Usar o nome da categoria
        selectedTypeId,
        selectedTemplate?.id,
        selectedUserTemplate?.id,
        theme.trim()
      );
      
      setCurrentDraftId(newDraftId);
      const newDraft = await DraftService.getDraftById(newDraftId);
      if (newDraft) {
        addDraftOptimistic(newDraft);
      }
      await refreshDrafts(); // Still refresh in background
      console.log('✅ Auto-save: Novo rascunho criado:', newDraftId);
      
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Título necessário', 'Por favor, adicione um título ao seu poema.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Conteúdo necessário', 'Por favor, escreva seu poema.');
      return;
    }

    try {
      // Cancelar auto-save pendente antes do save manual
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;      }
      
      // Usar diretamente o tipo selecionado como categoria
      const categoryName = getSelectedType()?.name || 'Poesia';
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      
      let finalDraftId = currentDraftId;
      
      // Se já temos um currentDraftId, atualizar em vez de criar novo
      if (currentDraftId) {
        console.log('💾 Save: Atualizando rascunho existente:', currentDraftId);
        try {
          await DraftService.updateDraft(
            currentDraftId,
            trimmedTitle,
            trimmedContent,
            categoryName,
            selectedTypeId,
            selectedTemplate?.id,
            selectedUserTemplate?.id,
            theme.trim()
          );
          const updatedDraft = await DraftService.getDraftById(currentDraftId);
          if(updatedDraft){
            updateDraftOptimistic(updatedDraft);
          }
        } catch (error) {
          console.warn('⚠️ Save: Erro ao atualizar, criando novo:', error);
          finalDraftId = await DraftService.saveDraft(
            trimmedTitle,
            trimmedContent,
            categoryName,
            selectedTypeId,
            selectedTemplate?.id,
            selectedUserTemplate?.id,
            theme.trim()
          );
          const newDraft = await DraftService.getDraftById(finalDraftId);
          if (newDraft) {
            addDraftOptimistic(newDraft);
          }
        }
      } else {
        // Verificar se já existe um rascunho similar
        const existingDrafts = await DraftService.getAllDrafts();
        const similarDraft = existingDrafts.find(draft => 
          draft.title === trimmedTitle && 
          draft.category === categoryName &&
          draft.typeId === selectedTypeId
        );
        
        if (similarDraft) {
          console.log('💾 Save: Atualizando rascunho similar:', similarDraft.id);
          await DraftService.updateDraft(
            similarDraft.id,
            trimmedTitle,
            trimmedContent,
            categoryName,
            selectedTypeId,
            selectedTemplate?.id,
            selectedUserTemplate?.id,
            theme.trim()
          );
          finalDraftId = similarDraft.id;
          const updatedDraft = await DraftService.getDraftById(finalDraftId);
          if(updatedDraft){
            updateDraftOptimistic(updatedDraft);
          }
        } else {
          console.log('💾 Save: Criando novo rascunho');
          finalDraftId = await DraftService.saveDraft(
            trimmedTitle,
            trimmedContent,
            categoryName,
            selectedTypeId,
            selectedTemplate?.id,
            selectedUserTemplate?.id,
            theme.trim()
          );
          const newDraft = await DraftService.getDraftById(finalDraftId);
          if (newDraft) {
            addDraftOptimistic(newDraft);
          }
        }
      }

      // Atualizar contexto após save manual
      refreshDrafts();
      
      // Invalidar cache para garantir dados atualizados na navegação
      SimpleCache.invalidateDrafts();
      console.log('🧹 Cache invalidado após criar obra');
      
      // Sistema de conquistas é verificado automaticamente no DraftService
      
      // Limpar campos imediatamente após salvar
      resetToNewPoem();

      Alert.alert(
        'Poema Salvo! ✨',
        'Sua obra foi salva com sucesso. Continue criando!',
        [
          {
            text: 'Criar Novo',
            onPress: () => {
              // Já foi limpo, não precisa fazer nada
            }
          },
          {
            text: 'Ver Rascunhos',
            onPress: () => {
              const success = NavigationHelper.navigateToObras();
              if (!success) {
                console.log('🔄 Fallback: navegando para ObrasTab via navigation');
                (navigation as any).navigate('ObrasTab');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o poema. Tente novamente.');
    }
  };

  const handleExportPDF = async (share: boolean = true) => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Nada para exportar', 'Por favor, adicione um título ou conteúdo ao seu poema.');
      return;
    }

    try {
      const stats = PDFService.getPoemStats(content);
      const selectedCategory = getSelectedType();
      const categoryName = selectedCategory?.name || 'Poesia';
      
      
      const poemData = {
        title: title.trim() || 'Poema sem título',
        content: content.trim(),
        author: profile?.name || 'Poeta',
        date: new Date().toISOString(),
        wordCount: stats.wordCount,
        verseCount: stats.verseCount,
        category: categoryName,
      };

      await PDFService.generatePoemPDF(poemData, { share });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      Alert.alert('Erro', 'Não foi possível exportar o PDF. Tente novamente.');
    }
  };

  // Função para mapear nome do template para ID do tipo
  const mapTemplateToTypeId = (templateName: string): string => {
    switch (templateName.toLowerCase()) {
      case 'soneto':
        return 'soneto';
      case 'jogral':
        return 'jogral';
      case 'verso livre':
        return 'poesia';
      default:
        return 'poesia';
    }
  };

  const applyTemplate = (template: PoemTemplate) => {
    setSelectedTemplate(template);
    setSelectedUserTemplate(null); // Limpar template do usuário se houver
    const typeId = mapTemplateToTypeId(template.name);
    setSelectedTypeId(typeId);
    setContent(template.example);
    setShowTemplates(false);
  };

  const addInspirationPrompt = (prompt: string) => {
    if (content.trim()) {
      setContent(prev => `${prev}\n\n"${prompt}"\n\n`);
    } else {
      setContent(`"${prompt}"\n\n`);
    }
  };

  const handleInspirationSelect = (inspiration: string) => {
    // Se for um tema poderoso (da aba 'themes'), adiciona ao título
    if (activeInspirationTab === 'themes') {
      setTitle(inspiration);
    } else {
      // Se for inspiração textual, adiciona ao conteúdo
      addInspirationPrompt(inspiration);
    }
    setShowInspiration(false);
  };

  const cleanupDuplicates = async () => {
    try {
      console.log('🧹 Iniciando limpeza de rascunhos duplicados...');
      const allDrafts = await DraftService.getAllDrafts();
      
      if (allDrafts.length === 0) {
        Alert.alert('Info', 'Nenhum rascunho encontrado para limpar.');
        return;
      }

      // Agrupar rascunhos por título + categoria + typeId
      const draftGroups = new Map<string, typeof allDrafts>();
      
      allDrafts.forEach(draft => {
        const key = `${draft.title}_${draft.category}_${draft.typeId || 'undefined'}`;
        if (!draftGroups.has(key)) {
          draftGroups.set(key, []);
        }
        draftGroups.get(key)!.push(draft);
      });

      // Identificar e remover duplicatas
      let duplicatesFound = 0;
      const draftsToDelete: string[] = [];
      
      for (const [key, group] of draftGroups) {
        if (group.length > 1) {
          // Manter o mais recente, deletar os outros
          const sortedGroup = group.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          for (let i = 1; i < sortedGroup.length; i++) {
            draftsToDelete.push(sortedGroup[i].id);
            duplicatesFound++;
          }
        }
      }

      if (duplicatesFound === 0) {
        Alert.alert('✅ Limpeza', 'Nenhum rascunho duplicado encontrado!');
        return;
      }

      // Confirmar limpeza
      Alert.alert(
        'Limpeza de Duplicados',
        `Encontrados ${duplicatesFound} rascunhos duplicados. Deseja removê-los?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Limpar',
            style: 'destructive',
            onPress: async () => {
              try {
                for (const draftId of draftsToDelete) {
                  await DraftService.deleteDraft(draftId);
                }
                await refreshDrafts();
                Alert.alert('✅ Sucesso', `${duplicatesFound} rascunhos duplicados foram removidos!`);
              } catch (error) {
                console.error('Erro ao limpar duplicados:', error);
                Alert.alert('Erro', 'Falha ao limpar alguns rascunhos duplicados.');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Erro na limpeza de duplicados:', error);
      Alert.alert('Erro', 'Falha ao verificar rascunhos duplicados.');
    }
  };

  // Funções para Templates do Usuário
  const loadUserTemplates = async () => {
    try {
      console.log('🔄 Carregando templates do usuário...');
      const templates = await UserTemplateService.getAllTemplates();
      console.log('📁 Templates carregados:', templates.length, templates);
      setUserTemplates(templates);
    } catch (error) {
      console.error('❌ Erro ao carregar templates:', error);
    }
  };

  const handleApplyUserTemplate = async (template: UserTemplate) => {
    try {
      if (content.trim()) {
        Alert.alert(
          'Aplicar Template',
          'Você já tem conteúdo escrito. Deseja substituir pelo template?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Substituir', 
              style: 'destructive',
              onPress: () => {
                setContent(template.content);
                setSelectedUserTemplate(template);
                setSelectedTemplate(null); // Limpar template padrão se houver
                if (template.categoryId && availableTypes.some(cat => cat.id === template.categoryId)) {
                  setSelectedTypeId(template.categoryId);
                }
                setShowTemplates(false); // Fechar o modal
                // Incrementar uso do template
                UserTemplateService.incrementUsage(template.id);
              }
            }
          ]
        );
      } else {
        setContent(template.content);
        setSelectedUserTemplate(template);
        setSelectedTemplate(null); // Limpar template padrão se houver
        if (template.categoryId && availableTypes.some(cat => cat.id === template.categoryId)) {
          setSelectedTypeId(template.categoryId);
        }
        setShowTemplates(false); // Fechar o modal
        // Incrementar uso do template
        await UserTemplateService.incrementUsage(template.id);
      }
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
    }
  };

  const handleToggleTemplateFavorite = async (templateId: string) => {
    try {
      await UserTemplateService.toggleFavorite(templateId);
      await loadUserTemplates(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  const handleDeleteUserTemplate = async (templateId: string) => {
    try {
      Alert.alert(
        'Excluir Template',
        'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: async () => {
              await UserTemplateService.deleteTemplate(templateId);
              await loadUserTemplates();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  };

  const handleContentChange = (text: string) => {
    console.log('🌟 Digitando:', text.length, 'caracteres');
    setContent(text);
    
    // Gerenciar estado de digitação
    setIsTyping(true);
    
    // Iniciar animação de pulso
    console.log('🎨 Iniciando animação de borda');
    startBorderPulseAnimation();
    
    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Definir novo timeout para parar a animação
    typingTimeoutRef.current = setTimeout(() => {
      console.log('⏹️ Parando animação de borda');
      setIsTyping(false);
      stopBorderPulseAnimation();
    }, 1000);
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

  const getSelectedType = (): Category | undefined => {
    return availableTypes.find(type => type.id === selectedTypeId);
  };

  const getPlaceholder = (): string => {
    const selectedType = getSelectedType();
    if (selectedTemplate) {
      return "Edite o exemplo ou comece do zero...";
    }
    
    // Gerar placeholder baseado na categoria
    switch (selectedType?.id) {
      case 'soneto':
        return "Escreva seu soneto aqui...\n\n(Quarteto 1 - 4 versos)\n...\n\n(Quarteto 2 - 4 versos)\n...\n\n(Terceto 1 - 3 versos)\n...\n\n(Terceto 2 - 3 versos)\n...";
      case 'jogral':
        return "Escreva seu jogral aqui...\n\nNarrador: ...\nPersonagem 1: ...\nPersonagem 2: ...";
      default:
        return `Escreva sua ${selectedType?.name || 'obra'} aqui...\n\nDeixe sua criatividade fluir... Cada palavra é uma pincelada na tela da alma.`;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
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
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.white} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.white,
            }}>
              Criar Obra
            </Text>
            {isAutoSaving && (
              <Text style={{
                fontSize: Typography.fontSize.xs,
                color: 'rgba(255,255,255,0.8)',
                marginTop: Spacing.xs,
              }}>
                Salvando automaticamente...
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(Boolean(title.trim()) || Boolean(content.trim()) || Boolean(currentDraftId)) && (
              <TouchableOpacity
                onPress={resetToNewPoem}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: BorderRadius.lg,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.sm,
                }}
              >
                <Ionicons name="add" size={20} color={themeColors.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleExportPDF()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.lg,
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.sm,
              }}
            >
              <Ionicons name="document-text-outline" size={20} color={themeColors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: themeColors.accent,
                borderRadius: BorderRadius.lg,
                paddingHorizontal: Spacing.base,
                paddingVertical: Spacing.sm,
              }}
            >
              <Text style={{
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.white,
              }}>
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }} // Ajustado para acomodar tab navigator
          showsVerticalScrollIndicator={false}
        >
          {/* Ferramentas Criativas */}
          <View style={{
            flexDirection: 'row',
            marginBottom: Spacing.lg,
            justifyContent: 'space-around',
          }}>
            <TouchableOpacity
              onPress={() => setShowTemplates(true)}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                alignItems: 'center',
                flex: 1,
                marginRight: Spacing.sm,
                ...Shadows.base,
              }}
            >
              <Ionicons name="library-outline" size={24} color={themeColors.primary} />
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
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                alignItems: 'center',
                flex: 1,
                marginLeft: Spacing.sm,
                ...Shadows.base,
              }}
            >
              <Ionicons name="bulb-outline" size={24} color={themeColors.accent} />
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

          {/* Seleção de Tipo */}
          <View style={{ marginBottom: Spacing.lg }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Spacing.sm,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
              }}>
                Tipo de Obra
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateCategory(true)}
                style={{
                  backgroundColor: themeColors.primary,
                  borderRadius: BorderRadius.full,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add" size={16} color={themeColors.white} />
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.white,
                  marginLeft: Spacing.xs,
                }}>
                  Novo Tipo
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.sm }}
            >
              {availableTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                  style={{
                    backgroundColor: selectedTypeId === type.id ? themeColors.primary : themeColors.surface,
                    borderRadius: BorderRadius.lg,
                    paddingHorizontal: Spacing.base,
                    paddingVertical: Spacing.sm,
                    marginRight: Spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: selectedTypeId === type.id ? themeColors.primary : themeColors.border,
                    ...Shadows.sm,
                  }}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={16} 
                    color={selectedTypeId === type.id ? themeColors.white : themeColors.primary}
                    style={{ marginRight: Spacing.xs }}
                  />
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.medium,
                    color: selectedTypeId === type.id ? themeColors.white : themeColors.textPrimary,
                  }}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Botão para gerenciar categorias */}
              <TouchableOpacity
                onPress={() => {
                  try {
                    // Navegar diretamente para ManageCategories
                    (navigation as any).navigate('ManageCategories');
                  } catch (error) {
                    console.error('Erro na navegação para gerenciar categorias:', error);
                    Alert.alert('Navegação', 'Erro ao abrir gerenciar categorias');
                  }
                }}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  paddingHorizontal: Spacing.base,
                  paddingVertical: Spacing.sm,
                  marginRight: Spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  borderStyle: 'dashed',
                  ...Shadows.sm,
                }}
              >
                <Ionicons 
                  name="settings-outline" 
                  size={16} 
                  color={themeColors.textSecondary}
                  style={{ marginRight: Spacing.xs }}
                />
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  fontWeight: Typography.fontWeight.medium,
                  color: themeColors.textSecondary,
                }}>
                  Gerenciar
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            {getSelectedType() && (
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                fontStyle: 'italic',
              }}>
                {getSelectedType()?.description}
              </Text>
            )}
          </View>

          {/* Campo Título */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Título da Obra
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título do seu poema..."
              placeholderTextColor={themeColors.textSecondary}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                borderWidth: 1,
                borderColor: title.trim() ? themeColors.primary : themeColors.border,
                ...Shadows.sm,
              }}
            />
          </View>

          {/* Campo Conteúdo */}
          <View style={{ marginBottom: Spacing.lg }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Spacing.sm,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
              }}>
                Sua Obra
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                  marginRight: Spacing.sm,
                }}>
                  {verseCount} versos • {wordCount} palavras
                </Text>
              </View>
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
                value={content}
                onChangeText={handleContentChange}
                placeholder={getPlaceholder()}
                placeholderTextColor={themeColors.textSecondary}
                multiline
                textAlignVertical="top"
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textPrimary,
                  minHeight: 200,
                  lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
                  borderWidth: 0, // Remove border do TextInput, já que está na View animada
                }}
              />
            </Animated.View>
          </View>

          {/* Estatísticas */}
          {(wordCount > 0 || verseCount > 0) && (
            <View style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.base,
              marginBottom: Spacing.lg,
              ...Shadows.sm,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Estatísticas da Obra
              </Text>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.bold,
                    color: themeColors.primary,
                  }}>
                    {verseCount}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: themeColors.textSecondary,
                  }}>
                    Versos
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.bold,
                    color: themeColors.accent,
                  }}>
                    {wordCount}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: themeColors.textSecondary,
                  }}>
                    Palavras
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.bold,
                    color: themeColors.secondary,
                  }}>
                    {content.length}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: themeColors.textSecondary,
                  }}>
                    Caracteres
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Templates */}
      <Modal
        visible={showTemplates}
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
                  backgroundColor: themeColors.primary,
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

          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {/* Templates Padrão */}
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.md,
            }}>
              📚 Templates Padrão
            </Text>
            
            {POEM_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => applyTemplate(template)}
                style={{
                  backgroundColor: selectedTemplate?.id === template.id 
                    ? themeColors.primary + '20' 
                    : themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  marginBottom: Spacing.md,
                  borderWidth: selectedTemplate?.id === template.id ? 2 : 0,
                  borderColor: selectedTemplate?.id === template.id ? themeColors.primary : 'transparent',
                  ...Shadows.base,
                }}
              >
                <LinearGradient
                  colors={[template.gradient[0] + '15', 'transparent']}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: BorderRadius.lg,
                  }}
                />
                {selectedTemplate?.id === template.id && (
                  <View style={{
                    position: 'absolute',
                    top: Spacing.sm,
                    right: Spacing.sm,
                    backgroundColor: themeColors.primary,
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
                    backgroundColor: template.gradient[0],
                    borderRadius: BorderRadius.full,
                    padding: Spacing.sm,
                    marginRight: Spacing.md,
                  }}>
                    <Ionicons name={template.icon as any} size={20} color={themeColors.white} />
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
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.sm,
                }}>
                  {template.structure}
                </Text>
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
                    "{template.example}"
                  </Text>
                </View>
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
                
                {userTemplates.map((template) => (
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
                      ...Shadows.base,
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
                          {template.categoryName} • {template.usageCount} uso{template.usageCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      {template.isFavorite && (
                        <Ionicons name="heart" size={16} color="#EF4444" />
                      )}
                    </View>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                      marginBottom: Spacing.sm,
                    }}>
                      {template.description}
                    </Text>
                    <View style={{
                      backgroundColor: template.color + '10',
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
                    ...Shadows.base,
                  }}
                >
                  <Ionicons 
                    name="add-circle-outline" 
                    size={32} 
                    color={themeColors.primary} 
                    style={{ marginBottom: Spacing.sm }}
                  />
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.primary,
                    marginBottom: Spacing.xs,
                  }}>
                    Criar Meu Primeiro Template
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Salve este poema como template para usar depois
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
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
            }}>
              Inspiração Poética
            </Text>
            <TouchableOpacity
              onPress={() => setShowInspiration(false)}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowInspiration(true)}
            style={[
              styles.toolButton,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <Ionicons name="bulb" size={20} color={themeColors.primary} />
            <Text style={[styles.toolButtonText, { color: themeColors.textPrimary }]}>
              Inspiração
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowResourceLibrary(true)}
            style={[
              styles.toolButton,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <Ionicons name="library" size={20} color={themeColors.primary} />
            <Text style={[styles.toolButtonText, { color: themeColors.textPrimary }]}>
              Recursos
            </Text>
          </TouchableOpacity>

          {/* Abas de Inspiração */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: themeColors.surface,
            margin: Spacing.lg,
            borderRadius: BorderRadius.lg,
            padding: 4,
          }}>
            <TouchableOpacity
              onPress={() => setActiveInspirationTab('textual')}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.lg,
                borderRadius: BorderRadius.md,
                backgroundColor: activeInspirationTab === 'textual' ? themeColors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name="chatbox-ellipses" 
                size={20} 
                color={activeInspirationTab === 'textual' ? Colors.white : themeColors.textSecondary} 
                style={{ marginBottom: 4 }}
              />
              <Text style={{
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.medium,
                color: activeInspirationTab === 'textual' ? Colors.white : themeColors.textSecondary,
              }}>
                Inspirações Textuais
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveInspirationTab('themes')}
              style={{
                flex: 1,
                paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.lg,
                borderRadius: BorderRadius.md,
                backgroundColor: activeInspirationTab === 'themes' ? themeColors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name="flame" 
                size={20} 
                color={activeInspirationTab === 'themes' ? Colors.white : themeColors.textSecondary} 
                style={{ marginBottom: 4 }}
              />
              <Text style={{
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.medium,
                color: activeInspirationTab === 'themes' ? Colors.white : themeColors.textSecondary,
              }}>
                Temas Poderosos
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {/* Conteúdo da aba ativa */}
            {activeInspirationTab === 'textual' ? (
              <View>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                  textAlign: 'center',
                }}>
                  📚 Biblioteca de Inspirações
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.lg,
                  textAlign: 'center',
                  lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
                }}>
                  Textos diversificados de grandes autores e tradições
                </Text>

                {/* Categorias de Inspiração */}
                {Object.entries(INSPIRATION_CATEGORIES).map(([key, category]) => (
                  <View key={key} style={{ marginBottom: Spacing.xl }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: Spacing.md,
                      paddingHorizontal: Spacing.sm,
                    }}>
                      <Ionicons name={category.icon as any} size={20} color={category.color} />
                      <Text style={{
                        fontSize: Typography.fontSize.lg,
                        fontWeight: Typography.fontWeight.bold,
                        color: themeColors.textPrimary,
                        marginLeft: Spacing.sm,
                      }}>
                        {category.name}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                      marginBottom: Spacing.md,
                      paddingHorizontal: Spacing.sm,
                      fontStyle: 'italic',
                    }}>
                      {category.description}
                    </Text>

                    {TEXTUAL_INSPIRATIONS
                      .filter(item => item.category === key)
                      .map((inspiration, index) => (
                        <TouchableOpacity
                          key={`${key}-${index}`}
                          onPress={() => handleInspirationSelect(inspiration.content)}
                          style={{
                            backgroundColor: themeColors.surface,
                            padding: Spacing.lg,
                            borderRadius: BorderRadius.lg,
                            marginBottom: Spacing.md,
                            borderLeftWidth: 4,
                            borderLeftColor: category.color,
                            ...Shadows.sm,
                          }}
                        >
                          <Text style={{
                            fontSize: Typography.fontSize.base,
                            fontWeight: Typography.fontWeight.semibold,
                            color: themeColors.textPrimary,
                            marginBottom: Spacing.xs,
                          }}>
                            {inspiration.title}
                          </Text>
                          <Text style={{
                            fontSize: Typography.fontSize.sm,
                            color: themeColors.textPrimary,
                            lineHeight: Typography.fontSize.sm * 1.5,
                            fontStyle: 'italic',
                            marginBottom: Spacing.xs,
                          }}>
                            "{inspiration.content}"
                          </Text>
                          {inspiration.author && (
                            <Text style={{
                              fontSize: Typography.fontSize.xs,
                              color: themeColors.textSecondary,
                              textAlign: 'right',
                              fontWeight: Typography.fontWeight.medium,
                            }}>
                              — {inspiration.author}
                              {inspiration.source && ` (${inspiration.source})`}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.sm,
                  textAlign: 'center',
                }}>
                  🔥 Temas Poderosos
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.lg,
                  textAlign: 'center',
                  lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
                }}>
                  Temas bíblicos profundos e transformadores para suas obras
                </Text>

                {POWERFUL_THEMES.map((theme, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleInspirationSelect(theme)}
                    style={{
                      backgroundColor: themeColors.surface,
                      padding: Spacing.lg,
                      borderRadius: BorderRadius.lg,
                      marginBottom: Spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: Colors.accent,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons 
                      name="flame" 
                      size={20} 
                      color={Colors.accent} 
                      style={{ marginRight: Spacing.md }}
                    />
                    <Text style={{
                      flex: 1,
                      fontSize: Typography.fontSize.base,
                      color: themeColors.textPrimary,
                      lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
                      fontWeight: Typography.fontWeight.medium,
                    }}>
                      {theme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <CreateCategoryModal
        visible={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCategoryCreated={async (categoryId) => {
          console.log('Nova categoria criada:', categoryId);
          // Recarregar tipos disponíveis
          await reloadTypes();
          // Selecionar a nova categoria se aplicável
          setSelectedTypeId(categoryId);
          setShowCreateCategory(false);
          Alert.alert('Sucesso! ✨', 'Nova categoria criada com sucesso.');
        }}
        title="Nova Categoria"
      />

      <CreateTemplateModal
        visible={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onTemplateCreated={async (template) => {
          await loadUserTemplates();
          setShowCreateTemplate(false);
          Alert.alert('✅ Sucesso', 'Template criado com sucesso!');
        }}
        initialContent={content}
        initialCategory={selectedTypeId}
      />

      {/* Modal de Biblioteca de Recursos */}
      <Modal
        visible={showResourceLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
          <LinearGradient
            colors={Colors.gradientSecondary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.lg,
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: Colors.white,
              }}>
                📚 Biblioteca de Recursos
              </Text>
              <TouchableOpacity
                onPress={() => setShowResourceLibrary(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                }}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {/* Metáforas */}
            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.md,
              }}>
                🎭 Metáforas
              </Text>
              {ResourceLibraryService.getAllMetaphors().slice(0, 3).map((metaphor, index) => (
                <TouchableOpacity
                  key={metaphor.id}
                  onPress={() => {
                    setContent(prev => prev + '\n\n' + metaphor.example);
                    setShowResourceLibrary(false);
                  }}
                  style={{
                    backgroundColor: themeColors.surface,
                    padding: Spacing.lg,
                    borderRadius: BorderRadius.lg,
                    marginBottom: Spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: Colors.primary,
                    ...Shadows.sm,
                  }}
                >
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.textPrimary,
                    marginBottom: Spacing.xs,
                  }}>
                    {metaphor.metaphor}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                    marginBottom: Spacing.xs,
                  }}>
                    {metaphor.meaning}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textPrimary,
                    fontStyle: 'italic',
                  }}>
                    Exemplo: "{metaphor.example}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rimas */}
            <View style={{ marginBottom: Spacing.xl }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.md,
              }}>
                🎵 Dicionário de Rimas
              </Text>
              {ResourceLibraryService.getAllRhymeWords().slice(0, 5).map((word, index) => {
                const rhymes = ResourceLibraryService.getRhymesForWord(word);
                return (
                  <View
                    key={word}
                    style={{
                      backgroundColor: themeColors.surface,
                      padding: Spacing.lg,
                      borderRadius: BorderRadius.lg,
                      marginBottom: Spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: Colors.accent,
                      ...Shadows.sm,
                    }}
                  >
                    <Text style={{
                      fontSize: Typography.fontSize.base,
                      fontWeight: Typography.fontWeight.semibold,
                      color: themeColors.textPrimary,
                      marginBottom: Spacing.xs,
                    }}>
                      {word}
                    </Text>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: themeColors.textSecondary,
                    }}>
                      Rimas: {rhymes.join(', ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default CreatePoemMasterpiece;
