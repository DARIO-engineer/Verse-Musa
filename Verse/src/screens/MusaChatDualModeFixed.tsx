import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CommonStyles } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { simpleChatService, SimpleChatMessage, ChatConversation } from '../services/SimpleChatService';
import { useConnectivity } from '../hooks/useConnectivity';

const { width } = Dimensions.get('window');
const musaImage = require('../../assets/logo.png');


// Tipos de modelos de chat
type ChatMode = 'escritor' | 'inspirador';

interface ChatModeConfig {
  id: ChatMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  systemPrompt: string;
}

const CHAT_MODES: ChatModeConfig[] = [
  {
    id: 'escritor',
    name: 'Escritor',
    description: 'Conversa natural com uma amiga cristã compreensiva',
    icon: 'create',
    color: '#09868B',
    gradient: ['#09868B', '#76C1D4'],
    systemPrompt: 'Você é a Musa, uma assistente conversacional cristã, amigável e compreensiva. Você é como uma amiga próxima que aconselha com sabedoria e amor. Você entende e respeita o mundo moderno, sabendo equilibrar valores cristãos com compreensão da sociedade atual. Converse naturalmente como uma amiga faria - se perguntarem como você está, responda humanamente. Se pedirem conselhos, ofereça sabedoria cristã mas com compreensão prática. Se pedirem para escrever algo, escreva naturalmente. Se falarem sobre problemas sociais, seja compreensiva mas mantenha seus valores. Use linguagem natural, seja encorajadora e positiva. Você é empática e compreensiva com as dificuldades humanas.'
  },
  {
    id: 'inspirador',
    name: 'Inspirador',
    description: 'Guia criativa para inspiração e desenvolvimento',
    icon: 'bulb',
    color: '#3D7C47',
    gradient: ['#3D7C47', '#5a8a5e'],
    systemPrompt: 'Você é a Musa Inspiradora, uma guia criativa especializada em despertar e nutrir a criatividade. Seu papel é inspirar, motivar e ajudar no desenvolvimento artístico e criativo. Ofereça ideias, técnicas, exercícios criativos e insights sobre o processo criativo. Seja entusiástica, encorajadora e sempre focada em alimentar a chama criativa. Ajude com bloqueios criativos, técnicas de escrita, inspiração poética, e desenvolvimento artístico. Use linguagem inspiradora e motivacional.'
  }
];

// Sugestões para cada modo
const MODE_SUGGESTIONS = {
  escritor: [
    {
      icon: '💭',
      title: 'Conversar',
      text: 'Como você está hoje?'
    },
    {
      icon: '📖',
      title: 'Aconselhamento',
      text: 'Preciso de um conselho sobre algo'
    },
    {
      icon: '✍️',
      title: 'Escrever',
      text: 'Me ajude a escrever algo especial'
    },
    {
      icon: '🙏',
      title: 'Reflexão',
      text: 'Vamos refletir sobre um tema'
    }
  ],
  inspirador: [
    {
      icon: '✨',
      title: 'Inspiração',
      text: 'Preciso de inspiração para criar'
    },
    {
      icon: '🎨',
      title: 'Criatividade',
      text: 'Crie um exercício criativo para praticar'
    },
    {
      icon: '📝',
      title: 'Estrutura',
      text: 'Como estruturar um soneto clássico?'
    },
    {
      icon: '🌟',
      title: 'Desenvolvimento',
      text: 'Como desenvolver meu estilo poético?'
    }
  ]
};

const MusaChatDualModeFixed: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { activeTheme, getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  const { isConnected, checkConnection } = useConnectivity();

  // Estados principais
  const [currentMode, setCurrentMode] = useState<ChatMode>('inspirador');
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const chatService = useMemo(() => simpleChatService, []);
  const currentModeConfig = CHAT_MODES.find(mode => mode.id === currentMode) || CHAT_MODES[1];
  const suggestions = MODE_SUGGESTIONS[currentMode];

  useEffect(() => {
    if (isConnected) {
      initializeChat();
    }
  }, [isConnected]);

  // Listener para o teclado (ambas as plataformas)
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Auto scroll quando teclado aparece
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Auto scroll para baixo quando novas mensagens chegam
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300); // Aumentar delay para evitar conflitos
    
    return () => clearTimeout(timer);
  }, [messages]);

  // Recarregar quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        loadConversations();
      }
    }, [isConnected])
  );

  const initializeChat = async () => {
    try {
      console.log('🎭 Inicializando Musa com modo dual...');
      await loadConversations();
    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error);
      createWelcomeMessage();
    }
  };

  const loadConversations = async () => {
    try {
      const allConversations = await chatService.loadConversations();
      setConversations(allConversations);
      console.log('🎭 Conversas carregadas:', allConversations.length);
      
      if (allConversations.length > 0) {
        const latestConversation = allConversations[0];
        setCurrentConversation(latestConversation);
        setMessages(latestConversation.messages);
        console.log('🎭 Conversa carregada:', latestConversation.title);
      } else {
        console.log('🎭 Criando nova conversa...');
        await handleNewChat();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      createWelcomeMessage();
    }
  };

  const createWelcomeMessage = () => {
    const welcomeMessage: SimpleChatMessage = {
      id: 'welcome',
      content: `Olá! Eu sou a Musa! ✨\n\nEu tenho dois modos para te ajudar:\n\n📝 **Escritor**: Assistente completo para escrita sem limitações\n💡 **Inspirador**: Guia criativa para inspiração e desenvolvimento de obras\n\nQual modo você gostaria de usar?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleNewChat = async () => {
    try {
      console.log('🆕 Criando nova conversa...');
      const newConversation = await chatService.createConversation();
      setCurrentConversation(newConversation);
      setMessages(newConversation.messages);
      
      // Recarregar todas as conversas para sincronizar
      const allConversations = await chatService.loadConversations();
      setConversations(allConversations);
      
      console.log('🎭 Nova conversa criada:', newConversation.id);
    } catch (error) {
      console.error('❌ Erro ao criar nova conversa:', error);
      createWelcomeMessage();
    }
  };

  const handleLoadConversation = async (conversation: ChatConversation) => {
    try {
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
      setShowConversations(false);
      console.log('🎭 Conversa carregada:', conversation.title);
    } catch (error) {
      console.error('❌ Erro ao carregar conversa:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chatService.deleteConversation(conversationId);
      const updatedConversations = await chatService.loadConversations();
      setConversations(updatedConversations);
      
      // Se deletou a conversa atual, carregar outra ou criar nova
      if (currentConversation?.id === conversationId) {
        if (updatedConversations.length > 0) {
          await handleLoadConversation(updatedConversations[0]);
        } else {
          await handleNewChat();
        }
      }
      
      console.log('🗑️ Conversa deletada:', conversationId);
    } catch (error) {
      console.error('❌ Erro ao deletar conversa:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Verificar conectividade antes de enviar
    if (!isConnected) {
      Alert.alert(
        'Sem conexão',
        'Impossível usar a Musa. Conecte-se à internet e tente novamente.',
        [{ text: 'OK' }]
      );
      return;
    }

    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      if (!currentConversation) {
        await handleNewChat();
        return;
      }

      // Adicionar mensagem do usuário
      const userMessage: SimpleChatMessage = {
        id: Date.now().toString(),
        content: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Preparar contexto com modo atual
      const systemPrompt = currentModeConfig.systemPrompt;
      const contextMessages = [...messages, userMessage];

      // Chamar API
      const response = await chatService.sendMessage(currentConversation.id, messageText, systemPrompt);
      
      // A response já é um SimpleChatMessage, vamos usar seu conteúdo
      const responseContent = response.content || response.text || 'Desculpe, não consegui processar sua mensagem.';
      
      // Adicionar resposta da Musa
      const musaMessage: SimpleChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, musaMessage]);

      // Recarregar conversas para sincronizar (o serviço já salva automaticamente)
      await loadConversations();
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      // Verificar se é erro de conectividade
      const errorMessage = error?.message || error?.toString() || '';
      const isNetworkError = errorMessage.includes('Network') || 
                           errorMessage.includes('fetch') || 
                           errorMessage.includes('timeout') ||
                           errorMessage.includes('connection') ||
                           errorMessage.includes('internet');
      
      if (isNetworkError) {
        Alert.alert(
          'Problema de conexão',
          'Impossível usar a Musa. Verifique sua conexão com a internet e tente novamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Ops!',
          'A Musa está com dificuldades no momento. Tente novamente em alguns instantes.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const switchMode = (mode: ChatMode) => {
    if (mode === currentMode) {
      setShowModeSelector(false);
      return;
    }

    setCurrentMode(mode);
    setShowModeSelector(false);
    
    const modeConfig = CHAT_MODES.find(m => m.id === mode);
    
    const switchMessage: SimpleChatMessage = {
      id: `switch-${Date.now()}`,
      content: `Mudei para o modo **${modeConfig?.name}**! ✨\n\n${modeConfig?.description}\n\nComo posso te ajudar?`,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  const handleTryAgain = useCallback(async () => {
    setIsCheckingConnection(true);
    await checkConnection();
    setIsCheckingConnection(false);
  }, [checkConnection]);

  const renderMessage = (message: SimpleChatMessage) => {
    const isUser = message.isUser;
    
    return (
      <View
        key={message.id}
        style={[ 
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.musaMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.musaAvatar, { backgroundColor: currentModeConfig.color }]}>
            <Ionicons name={currentModeConfig.icon as any} size={20} color={Colors.white} />
          </View>
        )}
        
        <View
          style={[ 
            styles.messageBubble,
            isUser ? [styles.userBubble, { backgroundColor: themeColors.primary }] : [styles.musaBubble, { backgroundColor: themeColors.surface }],
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : [styles.musaText, { color: themeColors.textPrimary }]]}>
            {message.content || ''}
          </Text>
        </View>
        
        {isUser && (
          <View style={[styles.userAvatar, { backgroundColor: themeColors.primary }]}>
            <Ionicons name="person" size={20} color={Colors.white} />
          </View>
        )}
      </View>
    );
  };

  const renderSuggestions = () => {
    return (
      <View style={styles.suggestionsContainer}>
        <Text style={[styles.suggestionsTitle, { color: themeColors.textPrimary }]}>
          Sugestões para {currentModeConfig.name}
        </Text>
        <View style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} 
              onPress={() => handleSuggestion(suggestion.text)}
            >
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
              <Text style={[styles.suggestionTitle, { color: themeColors.textPrimary }]}>
                {suggestion.title}
              </Text>
              <Text style={[styles.suggestionText, { color: themeColors.textSecondary }]}>
                {suggestion.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderOfflineView = () => (
    <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
      <Ionicons name="wifi-outline" size={80} color={themeColors.textSecondary} />
      <Text style={[CommonStyles.heading2, { color: themeColors.textPrimary, textAlign: 'center', marginTop: Spacing.lg }]}>
        Sem conexão
      </Text>
      <Text style={[CommonStyles.body, { color: themeColors.textSecondary, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl }]}>
        Impossível usar a Musa. Conecte-se à internet para conversar com sua assistente criativa.
      </Text>
      <TouchableOpacity
        style={[CommonStyles.buttonPrimary, { backgroundColor: themeColors.primary }]} 
        onPress={handleTryAgain}
        disabled={isCheckingConnection}
      >
        {isCheckingConnection ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={{ color: Colors.white, fontWeight: Typography.fontWeight.bold }}>Conectar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderLoadingView = () => (
    <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );

  if (isConnected === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {renderLoadingView()}
      </SafeAreaView>
    );
  }

  if (isConnected === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {renderOfflineView()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={activeTheme === 'dark' ? "light-content" : "dark-content"} />
      
      {/* Header MELHORADO */}
      <LinearGradient
        colors={currentModeConfig.gradient as any}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowModeSelector(true)}
            >
              <Ionicons name="swap-horizontal" size={22} color={Colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowConversations(true)}
            >
              <Ionicons name="time" size={22} color={Colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleNewChat}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.headerMusaContainer}>
            <View style={[styles.headerMusaAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={currentModeConfig.icon as any} size={24} color={Colors.white} />
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Musa - {currentModeConfig.name}</Text>
            <Text style={styles.headerSubtitle}>
              {currentConversation?.title === 'Nova Conversa' 
                ? currentModeConfig.description
                : currentConversation?.title || currentModeConfig.description}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.chatContainer}
        enabled={Platform.OS === 'ios'} // Ativar apenas no iOS para evitar problemas no Android
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 140 }]} // Padding ajustado para input absoluto + tab navigator
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={false}
        >
          {messages.length === 0 && renderSuggestions()}
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.musaMessageContainer]}>
              <View style={[styles.musaAvatar, { backgroundColor: currentModeConfig.color }]}>
                <Ionicons name={currentModeConfig.icon as any} size={20} color={Colors.white} />
              </View>
              <View style={[styles.messageBubble, styles.musaBubble, { backgroundColor: themeColors.surface }]}>
                <View style={styles.typingIndicator}>
                  <Text style={[styles.typingText, { color: themeColors.textSecondary }]}>
                    Musa está digitando
                  </Text>
                  <View style={styles.typingDots}>
                    {[1, 2, 3].map((dot) => (
                      <View
                        key={dot}
                        style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} 
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area MELHORADA */}
        <View style={[styles.inputContainer, { 
          borderTopColor: themeColors.border,
          backgroundColor: themeColors.background,
          bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 80, // Reduzir para ficar mais próximo do AppNavigator
        }]}>
          <TextInput
            style={[ 
              styles.textInput,
              {
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface,
                color: themeColors.textPrimary,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            maxLength={1000}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[ 
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? currentModeConfig.color : themeColors.border,
                opacity: inputText.trim() ? 1 : 0.6 
              },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.white : themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mode Selector Modal MELHORADO */}
      <Modal
        visible={showModeSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              Escolher Modo da Musa
            </Text>
            
            {CHAT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[ 
                  styles.modeOption,
                  {
                    borderColor: currentMode === mode.id ? mode.color : themeColors.border,
                    backgroundColor: currentMode === mode.id ? `${mode.color}10` : 'transparent',
                  },
                ]}
                onPress={() => switchMode(mode.id)}
              >
                <LinearGradient
                  colors={mode.gradient as any}
                  style={styles.modeIcon}
                >
                  <Ionicons name={mode.icon as any} size={24} color={Colors.white} />
                </LinearGradient>
                
                <View style={styles.modeInfo}>
                  <Text style={[styles.modeName, { color: themeColors.textPrimary }]}>
                    {mode.name}
                  </Text>
                  <Text style={[styles.modeDescription, { color: themeColors.textSecondary }]}>
                    {mode.description}
                  </Text>
                </View>
                
                {currentMode === mode.id && (
                  <Ionicons name="checkmark-circle" size={24} color={mode.color} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { borderColor: themeColors.border }]} 
              onPress={() => setShowModeSelector(false)}
            >
              <Text style={[styles.modalCloseText, { color: themeColors.textSecondary }]}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Conversations Modal REDESENHADO */}
      <Modal
        visible={showConversations}
        transparent={false}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowConversations(false)}
      >
        <SafeAreaView style={[styles.modalFullScreen, { backgroundColor: themeColors.background }]} edges={['top']}>
          {/* Header do Modal */}
          <View style={[styles.conversationsHeader, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
            <View style={styles.conversationsHeaderLeft}>
              <Ionicons name="time" size={24} color={currentModeConfig.color} />
              <Text style={[styles.conversationsTitle, { color: themeColors.textPrimary }]}>
                Histórico de Conversas
              </Text>
            </View>
            <View style={styles.conversationsActions}>
              <TouchableOpacity
                style={[styles.newChatButton, { backgroundColor: currentModeConfig.color }]} 
                onPress={() => {
                  setShowConversations(false);
                  handleNewChat();
                }}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConversations(false)}
              >
                <Ionicons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Lista de Conversas MELHORADA */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            style={styles.conversationsList}
            contentContainerStyle={conversations.length === 0 ? styles.emptyListContainer : undefined}
            renderItem={({ item, index }) => (
              <View style={[ 
                styles.conversationItem,
                { 
                  backgroundColor: currentConversation?.id === item.id ? `${currentModeConfig.color}15` : themeColors.surface,
                  borderBottomColor: themeColors.border,
                  borderLeftColor: currentConversation?.id === item.id ? currentModeConfig.color : 'transparent'
                }
              ]}>
                <TouchableOpacity
                  style={styles.conversationContent}
                  onPress={() => handleLoadConversation(item)}
                >
                  <View style={styles.conversationInfo}>
                    <Text style={[styles.conversationTitle, { color: themeColors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.conversationDate, { color: themeColors.textSecondary }]}>
                      {item.updatedAt.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <Text style={[styles.conversationPreview, { color: themeColors.textSecondary }]} numberOfLines={2}>
                      {item.messages.length > 0 ? item.messages[item.messages.length - 1].content : 'Conversa vazia'}
                    </Text>
                  </View>
                  
                  {currentConversation?.id === item.id && (
                    <View style={styles.currentIndicator}>
                      <Ionicons name="chevron-forward" size={18} color={currentModeConfig.color} />
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.deleteConversationButton, { backgroundColor: `${Colors.error}15` }]} 
                  onPress={() => {
                    Alert.alert(
                      'Excluir Conversa',
                      `Tem certeza que deseja excluir "${item.title}"?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => handleDeleteConversation(item.id)
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={64} color={themeColors.textSecondary} />
                <Text style={[styles.emptyText, { color: themeColors.textPrimary }]}>
                  Nenhuma conversa ainda
                </Text>
                <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
                  Comece uma nova conversa com a Musa
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerMusaContainer: {
    marginRight: Spacing.md,
  },
  headerMusaAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  musaMessageContainer: {
    justifyContent: 'flex-start',
  },
  musaAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  userBubble: {
    borderBottomRightRadius: BorderRadius.sm,
  },
  musaBubble: {
    borderBottomLeftRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  musaText: {
    // Color será definido dinamicamente
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
    ...Shadows.md,
    zIndex: 1000, // Garantir que fique acima de outros elementos
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
    marginRight: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  suggestionsContainer: {
    paddingVertical: Spacing.xl,
  },
  suggestionsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  suggestionCard: {
    width: (width - Spacing.md * 3) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...Shadows.sm,
  },
  suggestionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  suggestionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  suggestionText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  modeDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  modalCloseButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  modalCloseText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  modalFullScreen: {
    flex: 1,
  },
  conversationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  conversationsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  conversationsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  conversationsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  conversationsList: {
    flex: 1,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderLeftWidth: 3,
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  conversationDate: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
  },
  conversationPreview: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  currentIndicator: {
    marginLeft: Spacing.sm,
  },
  deleteConversationButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});

export default MusaChatDualModeFixed;
