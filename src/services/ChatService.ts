// src/services/ChatService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MusaChatRateLimiter } from './RateLimiter';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  conversationId: string;
  type?: 'text' | 'suggestion' | 'error';
  metadata?: {
    tokens?: number;
    model?: string;
    suggestions?: string[];
  };
}

export interface ChatHistory {
  conversations: { [id: string]: ChatMessage[] };
  currentConversationId: string | null;
  lastUpdated: Date;
}

const STORAGE_KEY = 'musa_chat_history';
const API_KEY = 'AIzaSyANb4yl1wmgi7I3psgEnDlwJ3JWFcb-t7A';

class ChatServiceClass {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized = false;
  private rateLimiter: MusaChatRateLimiter;

  constructor() {
    this.initialize();
    this.rateLimiter = new MusaChatRateLimiter();
  }

  private async initialize() {
    try {
      if (API_KEY && API_KEY.startsWith('AIza')) {
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.isInitialized = true;
        console.log('Musa AI inicializada com sucesso');
      } else {
        console.warn('API Key da Musa não configurada');
      }
    } catch (error) {
      console.error('Erro ao inicializar Musa AI:', error);
    }
  }

  async loadChatHistory(): Promise<ChatHistory> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        Object.keys(parsed.conversations).forEach(conversationId => {
          parsed.conversations[conversationId] = parsed.conversations[conversationId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }

    // Retorna histórico vazio se não encontrar nada
    const emptyHistory: ChatHistory = {
      conversations: {},
      currentConversationId: null,
      lastUpdated: new Date()
    };
    return emptyHistory;
  }

  async saveChatHistory(history: ChatHistory): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    const history = await this.loadChatHistory();
    return history.conversations[conversationId] || [];
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      const history = await this.loadChatHistory();
      
      if (!history.conversations[message.conversationId]) {
        history.conversations[message.conversationId] = [];
      }
      
      history.conversations[message.conversationId].push(message);
      history.currentConversationId = message.conversationId;
      history.lastUpdated = new Date();
      
      await this.saveChatHistory(history);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  async startNewConversation(): Promise<string> {
    const conversationId = `conv_${Date.now()}`;
    const history = await this.loadChatHistory();
    
    history.conversations[conversationId] = [];
    history.currentConversationId = conversationId;
    history.lastUpdated = new Date();
    
    await this.saveChatHistory(history);
    return conversationId;
  async sendMessageToMusa(message: string, conversationId: string): Promise<ChatMessage> {
    console.log('🎭 Musa: Tentando enviar mensagem para a API do Gemini...');
    console.log('🔑 API Key disponível:', API_KEY ? 'Sim' : 'Não');
    console.log('✅ Musa inicializada:', this.isInitialized);
    console.log('🤖 GenAI disponível:', this.genAI ? 'Sim' : 'Não');
    
    // Verificar rate limit ANTES de chamar a API
    const canProceed = await this.rateLimiter.canMakeRequest();
    if (!canProceed) {
      const errorMsg = await this.rateLimiter.getErrorMessage();
      const remaining = await this.rateLimiter.getRemainingRequests();
      
      console.warn(`⚠️ Rate limit atingido. Requisições restantes: ${remaining}`);
      
      Alert.alert(
        '⏳ Limite Atingido',
        errorMsg,
        [{ text: 'OK' }]
      );
      
      const rateLimitMessage: ChatMessage = {
        id: `ratelimit_${Date.now()}`,
        content: `🕒 ${errorMsg}\n\nEnquanto isso, posso te ajudar com respostas rápidas:\n\n${this.getLocalResponse(message)}`,
        isUser: false,
        timestamp: new Date(),
        conversationId,
        type: 'error',
        metadata: {
          model: 'rate-limited',
        }
      };
      
      await this.saveMessage(rateLimitMessage);
      return rateLimitMessage;
    }
    
    try {
      if (!this.isInitialized || !this.genAI) {
        console.error('❌ Musa AI não está inicializada');
        throw new Error('Musa AI não está inicializada');
      }

      // Registrar requisição no rate limiter
      await this.rateLimiter.recordRequest(); console.error('❌ Musa AI não está inicializada');
        throw new Error('Musa AI não está inicializada');
      }

      console.log('🚀 Enviando para Gemini API...');
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Contexto da Musa para respostas mais poéticas e criativas
      const prompt = `Você é a Musa, uma assistente de IA especializada em poesia e criação literária. 
      Você é sábia, inspiradora e tem um profundo conhecimento sobre literatura, poesia e escrita criativa.
      Responda de forma poética, mas prática. Use uma linguagem elegante mas acessível.
      
      Pergunta do usuário: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Resposta recebida da API do Gemini:', text.substring(0, 100) + '...');

      const botMessage: ChatMessage = {
        id: `musa_${Date.now()}`,
        content: text,
        isUser: false,
        timestamp: new Date(),
        conversationId,
        type: 'text',
        metadata: {
          model: 'gemini-pro',
          tokens: text.length // Estimativa simples
        }
      };

      await this.saveMessage(botMessage);
      return botMessage;

    } catch (error) {
      console.error('❌ Erro ao comunicar com a Musa:', error);
      console.error('📝 Detalhes do erro:', error instanceof Error ? error.message : String(error));
      
      Alert.alert(
        '❌ Erro na Conversa',
        'Não foi possível enviar sua mensagem para Musa. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
      
      // Resposta de fallback em caso de erro
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: `Ops! Tive um problema para me conectar à minha fonte de inspiração divina. 

${this.getLocalResponse(message)}

*Resposta gerada localmente enquanto reestabeleço a conexão.*`,
        isUser: false,
        timestamp: new Date(),
        conversationId,
        type: 'text',
        metadata: {
          model: 'local-fallback'
        }
      };

      await this.saveMessage(errorMessage);
      return errorMessage;
    }
  }

  // Respostas locais para quando a AI não estiver disponível
  private getLocalResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('começar') || lowerMessage.includes('inicio')) {
      return "Para começar um poema, observe o mundo ao seu redor. Uma palavra, um sentimento, uma imagem podem ser o primeiro verso. Não se preocupe com perfeição - deixe as palavras fluírem naturalmente.";
    }
    
    if (lowerMessage.includes('bloqueio') || lowerMessage.includes('inspiração')) {
      return "O bloqueio criativo é como uma estação: temporário e necessário. Tente ler outros poetas, caminhar na natureza, ou simplesmente escrever sobre o próprio bloqueio. Às vezes, a criatividade precisa de silêncio para voltar a falar.";
    }
    
    if (lowerMessage.includes('soneto')) {
      return "O soneto é uma forma clássica de 14 versos, tradicionalmente com rimas ABAB CDCD EFEF GG. Mas lembre-se: a forma serve ao sentimento, não o contrário. Use a estrutura como um jardim onde suas palavras podem crescer.";
    }
    
    if (lowerMessage.includes('haicai') || lowerMessage.includes('haiku')) {
      return "O haicai captura um momento fugaz em três versos: 5-7-5 sílabas. É poesia da simplicidade e contemplação. Observe um instante da natureza e tente expressá-lo com a menor quantidade de palavras possível.";
    }
    
    return "Sua pergunta desperta minha curiosidade poética. Embora eu esteja temporariamente offline, posso sugerir: explore suas emoções através das palavras, leia poetas que te inspiram, e lembre-se de que cada verso é um passo na jornada da criação.";
  }

  // Gerar uma resposta inteligente (versão local melhorada)
  generateIntelligentResponse(userMessage: string): string {
    return this.getLocalResponse(userMessage);
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }

  async getConversationList(): Promise<{ id: string; title: string; lastMessage: string; timestamp: Date }[]> {
    const history = await this.loadChatHistory();
    
    return Object.keys(history.conversations).map(id => {
      const messages = history.conversations[id];
      const lastMessage = messages[messages.length - 1];
      const firstUserMessage = messages.find(msg => msg.isUser);
      
      return {
        id,
        title: firstUserMessage?.content.substring(0, 30) + '...' || 'Nova conversa',
        lastMessage: lastMessage?.content.substring(0, 50) + '...' || '',
        timestamp: lastMessage?.timestamp || new Date()
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const ChatService = new ChatServiceClass();
