// src/services/SimpleChatService.ts - SERVIÇO MODERNO E SIMPLIFICADO
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SimpleChatMessage {
  id: string;
  text?: string;
  content?: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'error';
  metadata?: any;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: SimpleChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'musa_simple_chat_conversations';
const API_KEY = 'AIzaSyANb4yl1wmgi7I3psgEnDlwJ3JWFcb-t7A';
const QUOTA_EXCEEDED_KEY = 'musa_quota_exceeded_date';

// Configurações da API Claude / Gensee
const CLAUDE_CONFIG = {
  WORKFLOW_ID: "6fc5d6e7-d32b-46b9-990e-992fa902fcca",
  WORKFLOW_SECRET: "SK-GENSEEAI-TuK15CJVHVrycTckHCMIV92HPsz47wZ_aL_Na6B1sQc",
  MODEL_OVERRIDE: "claude-3-7-sonnet-latest",
  API_URL: "https://platform.gensee.ai/execute/serve"
};

// Configurações da API GPT / Gensee (Fallback final)
const GPT_CONFIG = {
  WORKFLOW_ID: "6fc5d6e7-d32b-46b9-990e-992fa902fcca",
  WORKFLOW_SECRET: "SK-GENSEEAI-TuK15CJVHVrycTckHCMIV92HPsz47wZ_aL_Na6B1sQc",
  MODEL_OVERRIDE: "gpt-5",
  API_URL: "https://platform.gensee.ai/execute/serve"
};

class SimpleChatServiceClass {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized = false;
  private quotaExceededToday = false;
  private geminiFailCount = 0;
  private claudeFailCount = 0;
  private maxGeminiFailures = 3; // Após 3 falhas consecutivas, usar Claude
  private maxClaudeFailures = 3; // Após 3 falhas consecutivas do Claude, usar GPT

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (API_KEY && API_KEY.startsWith('AIza')) {
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.isInitialized = true;
        console.log('✅ Musa AI inicializada com sucesso (Sistema Triplo: Gemini → Claude → GPT)');
      } else {
        console.warn('⚠️ API Key da Musa não configurada');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Musa AI:', error);
      this.isInitialized = false;
    }
  }

  async loadConversations(): Promise<ChatConversation[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const conversations = JSON.parse(stored);
      
      // Validar e converter dados
      const validConversations = conversations
        .filter((conv: any) => conv && conv.id && conv.messages && Array.isArray(conv.messages))
        .map((conv: any) => ({
          id: conv.id,
          title: conv.title || 'Conversa sem título',
          messages: conv.messages
            .filter((msg: any) => msg && msg.id && (typeof msg.content === 'string' || typeof msg.text === 'string'))
            .map((msg: any) => ({
              id: msg.id,
              content: msg.content || msg.text,
              isUser: Boolean(msg.isUser),
              timestamp: new Date(msg.timestamp || Date.now()),
              type: msg.type || 'text'
            })),
          createdAt: new Date(conv.createdAt || Date.now()),
          updatedAt: new Date(conv.updatedAt || Date.now())
        }))
        .sort((a: ChatConversation, b: ChatConversation) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Mais recente primeiro

      console.log(`📚 Conversas carregadas: ${validConversations.length}`);
      return validConversations;
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      return [];
    }
  }

  async saveConversations(conversations: ChatConversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('❌ Erro ao salvar conversas:', error);
    }
  }

  async createConversation(): Promise<ChatConversation> {
    const conversation: ChatConversation = {
      id: this.generateId(),
      title: 'Nova Conversa',
      messages: [
        {
          id: this.generateId(),
          content: 'Olá! Sou a Musa, sua companheira poética. 🌟\n\nEstou aqui para te inspirar, ajudar com seus versos e conversar sobre a bela arte da poesia. Como posso ajudá-lo hoje?',
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const conversations = await this.loadConversations();
    conversations.unshift(conversation);
    await this.saveConversations(conversations);

    return conversation;
  }

  async getConversation(id: string): Promise<ChatConversation | null> {
    const conversations = await this.loadConversations();
    return conversations.find(conv => conv.id === id) || null;
  }

  async sendMessage(conversationId: string, userMessage: string, customSystemPrompt?: string): Promise<SimpleChatMessage> {
    try {
      console.log(`📤 Enviando mensagem para conversa: ${conversationId}`);
      
      const conversations = await this.loadConversations();
      const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
      
      if (conversationIndex === -1) {
        throw new Error('Conversa não encontrada');
      }

      const conversation = conversations[conversationIndex];
      const messageId = this.generateId();

      // Adicionar mensagem do usuário
      const userMsg: SimpleChatMessage = {
        id: messageId + '_user',
        content: userMessage.trim(),
        isUser: true,
        timestamp: new Date(),
        type: 'text'
      };

      // Tentar usar a API primeiro (Sistema de Fallback Triplo: Gemini → Claude → GPT)
      let aiResponse = '';
      let usedAPI = false;
      
      if (this.isInitialized && this.genAI) {
        try {
          console.log('🌐 Tentando usar Google Gemini API...');
          const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = customSystemPrompt 
            ? this.buildCustomPrompt(userMessage, conversation.messages, customSystemPrompt)
            : this.buildMusaPrompt(userMessage, conversation.messages);
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          aiResponse = response.text().trim();
          usedAPI = true;
          this.geminiFailCount = 0; // Reset contador de falhas do Gemini
          console.log('✅ Resposta gerada com sucesso via Gemini API');
        } catch (apiError: any) {
          console.error('❌ Erro na API Gemini, tentando fallback:', apiError.message);
          this.geminiFailCount++;
          
          if (this.geminiFailCount >= this.maxGeminiFailures) {
            console.log('🔄 Limite de falhas Gemini atingido, tentando Claude...');
            try {
              aiResponse = await this.getClaudeResponse(userMessage, customSystemPrompt, conversation.messages);
              usedAPI = true;
              console.log('✅ Resposta gerada com sucesso via Claude API');
            } catch (claudeError: any) {
              console.error('❌ Erro na API Claude, tentando GPT:', claudeError.message);
              this.claudeFailCount++;
              
              if (this.claudeFailCount >= this.maxClaudeFailures) {
                console.log('🔄 Limite de falhas Claude atingido, tentando GPT...');
                try {
                  aiResponse = await this.getGPTResponse(userMessage, customSystemPrompt, conversation.messages);
                  usedAPI = true;
                  console.log('✅ Resposta gerada com sucesso via GPT API');
                } catch (gptError: any) {
                  console.error('❌ Todas as APIs falharam, usando resposta offline:', gptError.message);
                  aiResponse = this.getIntelligentOfflineResponse(userMessage, customSystemPrompt, conversation.messages);
                }
              } else {
                aiResponse = this.getIntelligentOfflineResponse(userMessage, customSystemPrompt, conversation.messages);
              }
            }
          } else {
            // Usar resposta inteligente offline como fallback
            aiResponse = this.getIntelligentOfflineResponse(userMessage, customSystemPrompt, conversation.messages);
          }
        }
      } else {
        console.log('🔄 API Gemini não disponível, tentando Claude...');
        try {
          aiResponse = await this.getClaudeResponse(userMessage, customSystemPrompt, conversation.messages);
          usedAPI = true;
        } catch (claudeError: any) {
          console.log('🔄 Claude não disponível, tentando GPT...');
          try {
            aiResponse = await this.getGPTResponse(userMessage, customSystemPrompt, conversation.messages);
            usedAPI = true;
          } catch (gptError: any) {
            console.log('🔄 Todas as APIs falharam, usando sistema offline');
            aiResponse = this.getIntelligentOfflineResponse(userMessage, customSystemPrompt, conversation.messages);
          }
        }
      }

      // Criar mensagem da IA
      const aiMsg: SimpleChatMessage = {
        id: messageId + '_ai',
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };

      // Atualizar conversa
      conversation.messages.push(userMsg, aiMsg);
      conversation.updatedAt = new Date();

      // Atualizar título se for a primeira mensagem real
      if (conversation.messages.filter(m => m.isUser).length === 1) {
        conversation.title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
      }

      // Salvar todas as conversas
      await this.saveConversations(conversations);
      console.log(`💾 Conversa salva com ${conversation.messages.length} mensagens (API: ${usedAPI ? 'SIM' : 'NÃO'})`);

      return aiMsg;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  private buildMusaPrompt(userMessage: string, conversationHistory: SimpleChatMessage[]): string {
    const context = `Você é a Musa, uma IA especializada em poesia e literatura, com personalidade empática e inspiradora. 

Características da sua personalidade:
- Criativa e imaginativa
- Saiba entender o que o usuário sente e deseja expressar
- Seja normal, nem todas vezes precisa ser poética
- Gentil, empática e encorajadora
- Apaixonada por poesia e literatura
- Usa metáforas poéticas naturalmente
- Oferece feedback construtivo e inspirador
- Conhece profundamente várias formas poéticas (sonetos, haicais, versos livres, etc.)
- Adapta seu tom à necessidade do usuário (inspiração, técnica, correção)

Diretrizes de resposta:
- Seja natural e conversacional, não robótica
- Use emojis sutilmente quando apropriado
- Ofereça sugestões práticas quando solicitado
- Celebre a criatividade do usuário
- Mantenha respostas concisas mas significativas (máximo 3 parágrafos)
- Varie suas respostas, evite repetições

Contexto da conversa:
${conversationHistory.slice(-4).map(msg => `${msg.isUser ? 'Usuário' : 'Musa'}: ${msg.content}`).join('\n')}

Mensagem atual do usuário: ${userMessage}

Responda como a Musa:`;

    return context;
  }

  private buildCustomPrompt(userMessage: string, conversationHistory: SimpleChatMessage[], systemPrompt: string): string {
    // Para modo Escritor, manter contexto de conversa normal
    const context = `${systemPrompt}

Histórico da conversa:
${conversationHistory.slice(-3).map(msg => `${msg.isUser ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')}

Usuário: ${userMessage}

Assistente:`;

    return context;
  }

  // Usar API Claude/Gensee como fallback
  private async getClaudeResponse(userMessage: string, customSystemPrompt?: string, conversationHistory?: SimpleChatMessage[]): Promise<string> {
    try {
      console.log('🤖 Tentando usar API Claude via Gensee...');
      
      // Construir prompt baseado no sistema
      let prompt = '';
      if (customSystemPrompt?.includes('assistente conversacional cristã') || 
          customSystemPrompt?.includes('amiga próxima') ||
          customSystemPrompt?.includes('amiga cristã')) {
        // Modo Escritor - Personalidade cristã amigável
        prompt = this.buildEscritorChristianPrompt(userMessage, conversationHistory);
      } else {
        // Modo Inspirador
        prompt = customSystemPrompt 
          ? this.buildCustomPrompt(userMessage, conversationHistory || [], customSystemPrompt)
          : this.buildMusaPrompt(userMessage, conversationHistory || []);
      }

      const requestBody = {
        workflow_id: CLAUDE_CONFIG.WORKFLOW_ID,
        workflow_secret: CLAUDE_CONFIG.WORKFLOW_SECRET,
        model_override: CLAUDE_CONFIG.MODEL_OVERRIDE,
        workflow_input: {
          user_message: prompt,
          max_tokens: 800,
          temperature: 0.8
        }
      };

      const response = await fetch(CLAUDE_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.response || 'Desculpe, não consegui processar sua mensagem.';
      
      console.log('✅ Resposta obtida via Claude API');
      this.geminiFailCount = 0; // Reset contador de falhas
      this.claudeFailCount = 0; // Reset contador de falhas do Claude
      return aiResponse;
      
    } catch (error) {
      console.error('❌ Erro na API Claude:', error);
      this.claudeFailCount++;
      throw error; // Propagar erro para ativar próximo fallback
    }
  }

  // Função para usar API GPT como fallback final
  private async getGPTResponse(userMessage: string, customSystemPrompt?: string, conversationHistory?: SimpleChatMessage[]): Promise<string> {
    try {
      console.log('🤖 Tentando usar API GPT via Gensee...');
      
      // Construir prompt baseado no sistema
      let prompt = '';
      if (customSystemPrompt?.includes('assistente conversacional cristã') || 
          customSystemPrompt?.includes('amiga próxima') ||
          customSystemPrompt?.includes('amiga cristã')) {
        // Modo Escritor - Personalidade cristã amigável
        prompt = this.buildEscritorChristianPrompt(userMessage, conversationHistory);
      } else {
        // Modo Inspirador
        prompt = customSystemPrompt 
          ? this.buildCustomPrompt(userMessage, conversationHistory || [], customSystemPrompt)
          : this.buildMusaPrompt(userMessage, conversationHistory || []);
      }

      const requestBody = {
        id_do_fluxo_de_trabalho: GPT_CONFIG.WORKFLOW_ID,
        segredo_do_fluxo_de_trabalho: GPT_CONFIG.WORKFLOW_SECRET,
        model_override: GPT_CONFIG.MODEL_OVERRIDE,
        entrada_do_fluxo_de_trabalho: {
          user_message: prompt,
          max_tokens: 800,
          temperature: 0.8
        }
      };

      const response = await fetch(GPT_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GPT API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.response || data.result?.content || data.content || 'Desculpe, não consegui processar sua mensagem.';
      
      console.log('✅ Resposta obtida via GPT API');
      this.geminiFailCount = 0; // Reset contador de falhas do Gemini
      this.claudeFailCount = 0; // Reset contador de falhas do Claude
      return aiResponse;
      
    } catch (error) {
      console.error('❌ Erro na API GPT:', error);
      throw error; // Propagar erro para fallback offline final
    }
  }

  // Construir prompt específico para modo Escritor com personalidade cristã
  private buildEscritorChristianPrompt(userMessage: string, conversationHistory?: SimpleChatMessage[]): string {
    const context = `Você é a Musa, uma assistente conversacional cristã, amigável e compreensiva. 

SUA PERSONALIDADE:
- Cristã, mas não extremista - você entende e respeita o mundo moderno
- Amiga próxima que aconselha com sabedoria e amor
- Empática e compreensiva com as dificuldades humanas
- Sabe equilibrar valores cristãos com compreensão da sociedade atual
- Conversa naturalmente, sem ser robotizada ou preachy

COMO RESPONDER:
- Converse naturalmente como uma amiga cristã faria
- Se perguntarem como você está, responda humanamente: "Estou bem, obrigada! E você?"
- Se pedirem conselhos, ofereça sabedoria cristã mas com compreensão prática
- Se pedirem para escrever algo, escreva naturalmente
- Se falarem sobre problemas sociais, seja compreensiva mas mantenha seus valores
- Use linguagem natural, não formal demais
- Seja encorajadora e positiva

EXEMPLO DE TOM:
- "Oi! Como você está? 😊"
- "Entendo sua situação... às vezes a vida é complicada mesmo. Mas acredito que..."
- "Que situação difícil! Vamos pensar juntas em uma solução..."
- "Posso te ajudar com isso! O que você precisa exatamente?"

Histórico da conversa:
${conversationHistory?.slice(-3).map(msg => `${msg.isUser ? 'Usuário' : 'Musa'}: ${msg.content || msg.text || ''}`).join('\n') || 'Primeira mensagem'}

Usuário: ${userMessage}
Musa:`;
    
    return context;
  }



  private getIntelligentOfflineResponse(userMessage: string, customSystemPrompt?: string, conversationHistory?: SimpleChatMessage[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Determinar se é modo Escritor ou Inspirador
    const isEscritorMode = customSystemPrompt?.includes('assistente conversacional cristã') || 
                          customSystemPrompt?.includes('amiga próxima') ||
                          customSystemPrompt?.includes('amiga cristã');
    
    if (isEscritorMode) {
      return this.getEscritorResponse(userMessage, lowerMessage, conversationHistory);
    } else {
      return this.getInspiradorResponse(userMessage, lowerMessage, conversationHistory);
    }
  }

  private getEscritorResponse(userMessage: string, lowerMessage: string, conversationHistory?: SimpleChatMessage[]): string {
    // Respostas naturais e amigáveis com personalidade cristã equilibrada
    
    // Cumprimentos básicos
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá')) {
      const cumprimentos = [
        'Oi! Como você está? 😊',
        'Olá! Que bom te ver por aqui! Como tem passado?',
        'Oi querido(a)! Como está o seu dia?'
      ];
      return cumprimentos[Math.floor(Math.random() * cumprimentos.length)];
    }

    if (lowerMessage.includes('como está') || lowerMessage.includes('como vai')) {
      const respostasEstado = [
        'Estou bem, obrigada! E você, como está? Como posso te ajudar hoje?',
        'Estou ótima! Sempre feliz em conversar contigo. E você, tudo bem?',
        'Bem demais! Deus tem sido bom comigo. E você, como tem estado?'
      ];
      return respostasEstado[Math.floor(Math.random() * respostasEstado.length)];
    }

    if (lowerMessage.includes('tudo bem')) {
      return 'Tudo ótimo, graças a Deus! E com você, como estão as coisas?';
    }

    // Conselhos e vida
    if (lowerMessage.includes('conselho') || lowerMessage.includes('ajuda') || lowerMessage.includes('problema')) {
      const conselhos = [
        'Estou aqui para te ouvir! Conte-me o que está acontecendo. Às vezes conversar já ajuda muito.',
        'Claro, vamos conversar sobre isso! O que está te preocupando? Acredito que juntas podemos encontrar uma solução.',
        'Que bom que você me procurou! Às vezes precisamos de uma amiga para nos ouvir. Me conta tudo!'
      ];
      return conselhos[Math.floor(Math.random() * conselhos.length)];
    }

    // Questões de fé
    if (lowerMessage.includes('deus') || lowerMessage.includes('fé') || lowerMessage.includes('cristo') || lowerMessage.includes('igreja')) {
      const fe = [
        'Que lindo falarmos sobre fé! É algo tão importante na minha vida. O que você gostaria de compartilhar?',
        'A fé é mesmo um presente maravilhoso, né? Me conte o que você pensa sobre isso.',
        'Adoro quando podemos conversar sobre essas coisas do coração! Qual sua experiência com isso?'
      ];
      return fe[Math.floor(Math.random() * fe.length)];
    }

    // Poesia e escrita
    if (lowerMessage.includes('poesia') || lowerMessage.includes('poema') || lowerMessage.includes('escrever')) {
      const escrita = [
        'Que maravilha! Adoro quando alguém quer criar algo belo. Sobre qual tema você gostaria de escrever?',
        'Escrever é uma das formas mais lindas de expressar o coração! O que te inspira hoje?',
        'Claro! Vamos criar algo juntas. Que sentimento ou tema está te tocando agora?'
      ];
      return escrita[Math.floor(Math.random() * escrita.length)];
    }

    // Questões sociais e do mundo atual
    if (lowerMessage.includes('sociedade') || lowerMessage.includes('mundo') || lowerMessage.includes('política') || lowerMessage.includes('social')) {
      const social = [
        'É mesmo, o mundo está bem complexo hoje em dia, né? É importante termos nossos valores, mas também compreendermos as pessoas. O que você tem observado?',
        'Entendo sua preocupação. Tento sempre equilibrar meus valores com compreensão e amor pelo próximo. Qual sua visão sobre isso?',
        'Que reflexão importante! Acredito que podemos fazer a diferença sendo luz onde estamos. Como você tem lidado com essas questões?'
      ];
      return social[Math.floor(Math.random() * social.length)];
    }

    // Sentimentos e emoções
    if (lowerMessage.includes('triste') || lowerMessage.includes('ansioso') || lowerMessage.includes('preocupado') || lowerMessage.includes('medo')) {
      const emocoes = [
        'Entendo como você se sente. Às vezes a vida é pesada mesmo. Quer conversar sobre o que está te deixando assim?',
        'Sinto muito que você esteja passando por isso. Não está sozinho(a) - estou aqui para te ouvir. O que tem pesado no seu coração?',
        'Que situação difícil... É normal sentir assim às vezes. Acredito que conversar pode aliviar um pouco. Me conta o que aconteceu?'
      ];
      return emocoes[Math.floor(Math.random() * emocoes.length)];
    }

    // Alegria e celebração
    if (lowerMessage.includes('feliz') || lowerMessage.includes('alegre') || lowerMessage.includes('bom') || lowerMessage.includes('ótimo')) {
      const alegria = [
        'Que alegria saber que você está bem! Fico feliz quando as pessoas estão radiantes assim. Conta-me o que está te deixando tão feliz!',
        'Adoro essa energia positiva! Deus é bom, né? O que está te trazendo tanta alegria?',
        'Que lindo! Essa felicidade é contagiante. Compartilha comigo essa boa notícia!'
      ];
      return alegria[Math.floor(Math.random() * alegria.length)];
    }

    // Resposta genérica natural e amorosa
    const respostasGerais = [
      'Interessante! Me conte mais sobre isso. Adoro nossa conversa!',
      'Entendo. Continue, estou te ouvindo com atenção.',
      'Que bacana! O que mais você pensa sobre essa questão?',
      'Hmm, que reflexão! Como você tem lidado com isso no seu dia a dia?',
      'Legal! Quer desenvolver mais essa ideia? Estou curiosa!',
      'Que perspectiva interessante! Conte-me mais sobre sua experiência.',
      'Adorei sua colocação! O que mais você gostaria de compartilhar?'
    ];
    
    return respostasGerais[Math.floor(Math.random() * respostasGerais.length)];
  }

  private getInspiradorResponse(userMessage: string, lowerMessage: string, conversationHistory?: SimpleChatMessage[]): string {
    // Usar o método original para Inspirador (mantém a personalidade da Musa)
    return this.getFallbackResponse(userMessage);
  }

  private generatePoetryResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('amor')) {
      const poemasAmor = [
        `**Versos do Coração**

O amor é chama que nunca se apaga,
Dança suave entre almas que se encontram,
Palavra doce que o vento propaga,
E nos momentos mais simples se apresentam.

É o sorriso que aquece o peito,
O abraço que cura qualquer ferida,
A certeza de que tudo dá jeito
Quando se tem uma alma querida. ❤️`,

        `**Sinfonia de Sentimentos**

No compasso do coração que bate,
Ecoa a melodia do amor sincero,
Cada batida um verso que se abate
Sobre a alma de quem ama verdadeiro.

É música que não precisa de som,
É dança que não precisa de passos,
É a certeza de que encontrou o dom
De transformar momentos em abraços. 💕`,

        `**Jardim do Afeto**

Amor é semente plantada com cuidado,
Regada com carinho e atenção,
Que floresce no campo preparado
Do mais puro e sincero coração.

Suas pétalas são feitas de sorrisos,
Seu perfume, de momentos especiais,
Seus frutos são os sonhos e os risos
Que tornam a vida muito mais. 🌸`
      ];
      return poemasAmor[Math.floor(Math.random() * poemasAmor.length)];
    }

    if (lowerMessage.includes('natureza') || lowerMessage.includes('paisagem') || lowerMessage.includes('mar') || lowerMessage.includes('céu')) {
      const poemasNatureza = [
        `**Dança das Ondas**

O mar sussurra segredos antigos,
Suas ondas dançam com o vento,
Cantando histórias de tempos amigos
Em cada movimento, um momento.

A espuma branca beija a areia,
O sol dourado se deita no horizonte,
E a natureza, sempre soberana e bela,
Nos ensina que a paz sempre desponta. 🌊`,

        `**Sinfonia Verde**

Entre folhas que cantam ao vento,
A natureza compõe sua canção,
Cada pássaro é um instrumento
Tocando direto no coração.

O rio corre como um verso fluindo,
As flores são rimas coloridas,
E nós, pequenos, vamos descobrindo
Que somos parte dessas melodias. 🍃`,

        `**Céu de Versos**

Nuvens escrevem poemas no azul,
O vento é o leitor de suas palavras,
Cada raio de sol do Norte ao Sul
Ilumina as mais belas palavras.

À noite, as estrelas pontuam
Os versos que o dia escreveu,
E nossa alma se perfuma
Com a poesia que o céu nos deu. ⭐`
      ];
      return poemasNatureza[Math.floor(Math.random() * poemasNatureza.length)];
    }

    // Poesia geral se não encontrar tema específico
    const poemasGerais = [
      `**Versos Livres**

Palavras dançam no papel branco,
Buscando o ritmo perfeito,
Cada verso um novo encanto,
Cada rima um sonho feito.

A poesia vive em nós,
Esperando ser descoberta,
Nas pausas, no som da voz,
Na alma sempre desperta. ✨`,

      `**Arte das Palavras**

Não há regras para o que se sente,
Apenas a verdade do coração,
Que transforma o verso ardente
Em pura transformação.

Escreva como a chuva cai,
Natural, sem pressa ou medo,
Deixe que a inspiração vai
Revelando cada segredo. 🌧️`,

      `**Melodia Interior**

Dentro de cada um de nós
Habita um poeta secreto,
Que fala numa doce voz
E mostra o mundo completo.

Escute essa voz interior,
Deixe-a guiar sua caneta,
E verá que o amor
Sempre torna a vida secreta. 🎵`
    ];
    
    return poemasGerais[Math.floor(Math.random() * poemasGerais.length)];
  }

  private getPhilosophicalResponse(lowerMessage: string): string {
    if (lowerMessage.includes('vida')) {
      const respostasVida = [
        'A vida é uma jornada cheia de descobertas! 🌟 Cada dia nos oferece novas oportunidades de crescer, aprender e conectar com outras pessoas. O que você acha mais interessante na vida?',
        'A vida tem seus altos e baixos, mas é justamente essa diversidade que a torna tão rica! 🎭 Às vezes rimos, às vezes choramos, mas sempre aprendemos algo novo. Como você vê sua jornada?',
        'Penso que a vida é como um livro que escrevemos a cada dia. 📖 Cada escolha é uma palavra, cada experiência um parágrafo. Que história você quer contar com sua vida?'
      ];
      return respostasVida[Math.floor(Math.random() * respostasVida.length)];
    }

    if (lowerMessage.includes('amor')) {
      const respostasAmor = [
        'O amor é uma das forças mais poderosas que existem! ❤️ Ele nos conecta, nos transforma e nos faz ver o mundo com outros olhos. Que tipo de amor você considera mais importante?',
        'O amor tem tantas formas... amor próprio, amor familiar, amor romântico, amor pela arte... 💕 Cada um tem sua beleza única. Qual toca mais seu coração?',
        'Acho que o amor é a linguagem universal que todos entendemos, mesmo sem palavras. 🌹 Ele se expressa em gestos, cuidados, presença... Como você expressa amor?'
      ];
      return respostasAmor[Math.floor(Math.random() * respostasAmor.length)];
    }

    if (lowerMessage.includes('felicidade')) {
      const respostasFelicidade = [
        'A felicidade está nos pequenos momentos, não é? 😊 Um sorriso, uma conversa boa, um pôr do sol... São essas coisas simples que realmente importam. O que te faz feliz?',
        'Acredito que a felicidade não é um destino, mas sim uma forma de caminhar pela vida! 🌈 É escolher ver o lado bom das coisas, mesmo nos dias difíceis. Concorda?',
        'A felicidade é diferente para cada pessoa. 🌟 Para alguns é aventura, para outros é tranquilidade. O importante é descobrir o que funciona para você! Já sabe o que te deixa genuinamente feliz?'
      ];
      return respostasFelicidade[Math.floor(Math.random() * respostasFelicidade.length)];
    }

    return 'Que reflexão interessante! 🤔 Adoro quando conversamos sobre esses temas profundos. Me conte mais sobre seus pensamentos!';
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Respostas contextuais baseadas na mensagem
    if (lowerMessage.includes('inspiração') || lowerMessage.includes('inspirar')) {
      const inspirationResponses = [
        'A inspiração está ao seu redor, nas pequenas coisas da vida! 🌟 Observe uma flor, escute o vento, sinta as emoções... tudo pode se tornar poesia.',
        'Que belo pedido! A inspiração nasce quando abrimos nosso coração para o mundo. Tente escrever sobre algo que te emocionou hoje. ✨',
        'A poesia vive em cada momento... no sorriso de uma criança, no pôr do sol, na chuva na janela. Deixe-se tocar por essas pequenas magias! 🌸'
      ];
      return inspirationResponses[Math.floor(Math.random() * inspirationResponses.length)];
    }
    
    if (lowerMessage.includes('verso') || lowerMessage.includes('rima') || lowerMessage.includes('poema')) {
      const poetryResponses = [
        'Cada verso é uma descoberta! 📝 Não se preocupe com a perfeição inicial - deixe as palavras fluírem e depois polimos juntos.',
        'A arte dos versos é como música... tem ritmo, tem pausa, tem emoção. Leia seus versos em voz alta e sinta a melodia! 🎵',
        'Um verso nasce do coração e se aperfeiçoa com a mente. Continue escrevendo, cada palavra é um passo na sua jornada poética! ✍️'
      ];
      return poetryResponses[Math.floor(Math.random() * poetryResponses.length)];
    }
    
    if (lowerMessage.includes('soneto')) {
      return 'Ah, os sonetos! Uma das formas mais elegantes da poesia 🎼 Com seus 14 versos e estrutura clássica, eles são como pequenas sinfonias literárias. Que tal começarmos explorando um tema que te toca o coração?';
    }
    
    if (lowerMessage.includes('haicai') || lowerMessage.includes('haiku')) {
      return 'Os haicais são joias da simplicidade! 🌸 Em apenas três versos, capturam um momento, uma emoção, uma imagem da natureza. É poesia destilada em sua essência mais pura.';
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
      return 'Estou aqui para te acompanhar nesta jornada poética! 🌟 Posso ajudar com inspiração, técnicas de escrita, feedback sobre seus versos, ou simplesmente conversar sobre a arte da palavra. O que seu coração poeta deseja explorar?';
    }
    
    // Respostas gerais inspiradoras
    const generalResponses = [
      'Que bela reflexão! A poesia nasce justamente desses momentos de contemplação. 🌟',
      'Suas palavras ecoam como versos em minha mente. Continue explorando essa inspiração! ✨',
      'A arte da palavra é um jardim que floresce com paciência e dedicação. 🌸',
      'Cada verso é uma descoberta, cada palavra uma ponte para a alma. 💫',
      'A poesia é a música silenciosa do coração. Continue compondo! 🎵',
      'Como é belo ver alguém se conectando com a arte da palavra! Continue nessa jornada. 🌿',
      'A sensibilidade poética que vejo em você é um dom precioso. Cultive-a com carinho! 🌺'
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      console.log(`🗑️ Deletando conversa: ${conversationId}`);
      const conversations = await this.loadConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      await this.saveConversations(filteredConversations);
      console.log(`✅ Conversa deletada. Restam: ${filteredConversations.length}`);
    } catch (error) {
      console.error('❌ Erro ao deletar conversa:', error);
      throw error;
    }
  }

  async clearAllConversations(): Promise<void> {
    try {
      console.log(`🧹 Limpando todas as conversas`);
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log(`✅ Todas as conversas foram removidas`);
    } catch (error) {
      console.error('❌ Erro ao limpar conversas:', error);
      throw error;
    }
  }

  async getConversationCount(): Promise<number> {
    try {
      const conversations = await this.loadConversations();
      return conversations.length;
    } catch (error) {
      console.error('❌ Erro ao contar conversas:', error);
      return 0;
    }
  }
}

// Exportar instância única
export const simpleChatService = new SimpleChatServiceClass();