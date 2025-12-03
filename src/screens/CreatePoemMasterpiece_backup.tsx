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
import { useSettings } from '../contexts/SettingsContext';
import { useDrafts } from '../contexts/DraftsContext';
import { DraftService } from '../services/DraftService';
import { NavigationHelper } from '../utils/NavigationHelper';
import { CategoryService, Category } from '../services/CategoryService';
import { UserTemplateService, UserTemplate } from '../services/UserTemplateService';
import { EnhancedAchievementService } from '../services/EnhancedAchievementService';
import SimpleCache from '../utils/SimpleCache';
import CreateCategoryModal from '../components/CreateCategoryModal';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { AIWritingAssistantService, WritingSuggestion, MoodTheme } from '../services/AIWritingAssistantService';

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

const CreatePoemMasterpiece: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme, getThemeColors: getGlobalThemeColors } = useSettings();
  const { refreshDrafts, addDraftOptimistic, updateDraftOptimistic } = useDrafts();
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
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  
  const [theme, setTheme] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [verseCount, setVerseCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Simplified state - removed complex features
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const borderPulseAnim = useRef(new Animated.Value(0)).current;
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeColors = getGlobalThemeColors();
  const { settings } = useSettings();

  // Simplified content handling

  // Handle cursor position changes
  const handleSelectionChange = useCallback((event: any) => {
    const { start } = event.nativeEvent.selection;
    setCursorPosition(start);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    // Update counters
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const verses = text.trim() ? text.split('\n').filter(line => line.trim()).length : 0;
    
    setWordCount(words);
    setVerseCount(verses);
    setContent(text);
    
    // Manage typing state
    setIsTyping(true);
    
    // Start pulse animation
    startBorderPulseAnimation();
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop animation
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopBorderPulseAnimation();
    }, 1000);

    // Simple content update without complex features
  }, []);



  const startBorderPulseAnimation = useCallback(() => {
    // Stop any previous animation
    borderPulseAnim.stopAnimation();
    // Reset to 0
    borderPulseAnim.setValue(0);
    
    // Start new loop animation
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
  }, [borderPulseAnim]);

  const stopBorderPulseAnimation = useCallback(() => {
    borderPulseAnim.stopAnimation();
    Animated.timing(borderPulseAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [borderPulseAnim]);

  const getSelectedType = useCallback((): Category | undefined => {
    return availableTypes.find(type => type.id === selectedTypeId);
  }, [availableTypes, selectedTypeId]);

  const getPlaceholder = useCallback((): string => {
    const selectedType = getSelectedType();
    if (selectedTemplate) {
      return "Edite o exemplo ou comece do zero...";
    }
    
    // Generate placeholder based on category
    switch (selectedType?.id) {
      case 'soneto':
        return "Escreva seu soneto aqui...\n\n(Quarteto 1 - 4 versos)\n...\n\n(Quarteto 2 - 4 versos)\n...\n\n(Terceto 1 - 3 versos)\n...\n\n(Terceto 2 - 3 versos)\n...";
      case 'jogral':
        return "Escreva seu jogral aqui...\n\nNarrador: ...\nPersonagem 1: ...\nPersonagem 2: ...";
      default:
        return `Escreva sua ${selectedType?.name || 'obra'} aqui...\n\nDeixe sua criatividade fluir... Cada palavra é uma pincelada na tela da alma.`;
    }
  }, [selectedTemplate, getSelectedType]);

  // Save function
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
      const categoryName = getSelectedType()?.name || 'Poesia';
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      
      const newDraftId = await DraftService.saveDraft(
        trimmedTitle,
        trimmedContent,
        categoryName,
        selectedTypeId,
        selectedTemplate?.id,
        selectedUserTemplate?.id,
        theme.trim()
      );
      
      Alert.alert(
        'Poema Salvo! ✨',
        'Sua obra foi salva com sucesso.',
        [
          {
            text: 'Criar Novo',
            onPress: () => {
              setTitle('');
              setContent('');
              setCurrentDraftId(null);
              setSelectedTemplate(null);
              setSelectedUserTemplate(null);
            }
          },
          {
            text: 'Ver Rascunhos',
            onPress: () => {
              navigation.navigate('ObrasTab' as never);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o poema. Tente novamente.');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await CategoryService.getAllCategories();
        setAvailableTypes(types);
        if (types.length > 0 && !selectedTypeId) {
          setSelectedTypeId(types[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, [selectedTypeId]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
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
          </LinearGradient>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: Spacing.lg,
              paddingBottom: Spacing.xl * 2,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Ferramentas Criativas */}
            <View style={{
              marginBottom: Spacing.lg,
            }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: Spacing.sm }}
{{ ... }}
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

            {/* Title Field */}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Título
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

            {/* Content Field */}
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
                  onSelectionChange={handleSelectionChange}
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
                    borderWidth: 0,
                  }}
                />
              </Animated.View>

              {/* Text Formatting Toolbar - Fixed styling */}
              {showFormattingTools && selectedText && (
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.base,
                  padding: Spacing.sm,
                  marginTop: Spacing.sm,
                  justifyContent: 'center',
                  ...Shadows.sm,
                }}>
                  <TouchableOpacity
                    onPress={() => applyTextFormatting('bold')}
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: BorderRadius.base,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                      marginHorizontal: Spacing.xs,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      fontWeight: Typography.fontWeight.bold,
                      color: themeColors.primary,
                    }}>
                      B
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyTextFormatting('italic')}
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: BorderRadius.base,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                      marginHorizontal: Spacing.xs,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      fontStyle: 'italic',
                      color: themeColors.accent,
                    }}>
                      I
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyTextFormatting('underline')}
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: BorderRadius.base,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                      marginHorizontal: Spacing.xs,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      textDecorationLine: 'underline',
                      color: themeColors.secondary,
                    }}>
                      U
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowFormattingTools(false)}
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: BorderRadius.base,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: Spacing.xs,
                      marginLeft: Spacing.sm,
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={16} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* AI Writing Suggestions - Dynamic and contextual */}
            {showSuggestions && writingSuggestions.length > 0 && (
              <View style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                marginBottom: Spacing.lg,
                borderLeftWidth: 4,
                borderLeftColor: themeColors.accent,
                ...Shadows.sm,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: Spacing.sm,
                }}>
                  <Ionicons name="sparkles" size={16} color={themeColors.accent} />
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.textPrimary,
                    marginLeft: Spacing.xs,
                  }}>
                    Sugestões Dinâmicas da Musa
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSuggestions(false)}
                    style={{ marginLeft: 'auto' }}
                  >
                    <Ionicons name="close" size={16} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {writingSuggestions.filter(s => s && s.text && s.id).map((suggestion, index) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      onPress={() => applySuggestion(suggestion)}
                      style={{
                        backgroundColor: themeColors.primary + '15',
                        borderRadius: BorderRadius.base,
                        paddingHorizontal: Spacing.sm,
                        paddingVertical: Spacing.xs,
                        marginRight: Spacing.sm,
                        borderWidth: 1,
                        borderColor: themeColors.primary + '30',
                      }}
                    >
                      <Text style={{
                        fontSize: Typography.fontSize.sm,
                        color: themeColors.primary,
                        fontWeight: Typography.fontWeight.medium,
                      }}>
                        {String(suggestion.text || '')}
                      </Text>
                      <Text style={{
                        fontSize: Typography.fontSize.xs,
                        color: themeColors.textSecondary,
                        marginTop: 2,
                      }}>
                        {String(suggestion.context || suggestion.type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Poem Analysis Display */}
            {poemAnalysis && (
              <View style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                marginBottom: Spacing.lg,
                borderLeftWidth: 4,
                borderLeftColor: themeColors.secondary,
                ...Shadows.sm,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: Spacing.sm,
                }}>
                  <Ionicons name="analytics" size={16} color={themeColors.secondary} />
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.textPrimary,
                    marginLeft: Spacing.xs,
                  }}>
                    Análise em Tempo Real
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View style={{
                    backgroundColor: themeColors.primary + '15',
                    borderRadius: BorderRadius.sm,
                    paddingHorizontal: Spacing.xs,
                    paddingVertical: 2,
                    marginRight: Spacing.xs,
                    marginBottom: Spacing.xs,
                  }}>
                    <Text style={{
                      fontSize: Typography.fontSize.xs,
                      color: themeColors.primary,
                    }}>
                      {String(poemAnalysis.sentiment || '')}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: themeColors.accent + '15',
                    borderRadius: BorderRadius.sm,
                    paddingHorizontal: Spacing.xs,
                    paddingVertical: 2,
                    marginRight: Spacing.xs,
                    marginBottom: Spacing.xs,
                  }}>
                    <Text style={{
                      fontSize: Typography.fontSize.xs,
                      color: themeColors.accent,
                    }}>
                      {String(poemAnalysis.mood || '')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Modal de Seleção de Humor */}
      <Modal
        visible={showMoodSelector}
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
              Selecionar Humor
            </Text>
            <TouchableOpacity
              onPress={() => setShowMoodSelector(false)}
              style={{
                backgroundColor: themeColors.surface,
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
              }}
            >
              <Ionicons name="close" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
            {AIWritingAssistantService.MOOD_THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                onPress={() => selectMoodTheme(theme)}
                style={{
                  backgroundColor: selectedMoodTheme?.id === theme.id
                    ? theme.colors[0] + '20'
                    : themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.base,
                  marginBottom: Spacing.md,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors[0],
                  ...Shadows.base,
                }}
              >
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  fontWeight: Typography.fontWeight.semibold,
                  color: themeColors.textPrimary,
                  marginBottom: Spacing.xs,
                }}>
                  {theme.name}
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.sm,
                }}>
                  {theme.description}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                  {theme.keywords.slice(0, 3).map((keyword, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: theme.colors[0] + '15',
                        borderRadius: BorderRadius.sm,
                        paddingHorizontal: Spacing.xs,
                        paddingVertical: 2,
                        marginRight: Spacing.xs,
                        marginBottom: Spacing.xs,
                      }}
                    >
                      <Text style={{
                        fontSize: Typography.fontSize.xs,
                        color: theme.colors[0],
                      }}>
                        {keyword}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <CreateCategoryModal
        visible={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCategoryCreated={async (categoryId) => {
          const types = await CategoryService.getAllCategories();
          setAvailableTypes(types);
          setSelectedTypeId(categoryId);
          setShowCreateCategory(false);
          Alert.alert('Sucesso! ✨', 'Nova categoria criada com sucesso.');
        }}
        title="Nova Categoria"
      />
    </SafeAreaView>
  );
};

export default CreatePoemMasterpiece;
