// AI Writing Assistant Service
// Provides intelligent writing suggestions, auto-completion, and creative assistance

export interface WritingSuggestion {
  id: string;
  type: 'completion' | 'rhyme' | 'synonym' | 'structure' | 'theme';
  text: string;
  confidence: number;
  context: string;
  position?: number;
}

export interface PoemAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  mood: string;
  themes: string[];
  structure: string;
  rhymeScheme?: string;
  meter?: string;
  readabilityScore: number;
  emotionalIntensity: number;
  suggestions: string[];
}

export interface MoodTheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
  keywords: string[];
  inspirations: string[];
  ambientSound?: string;
}

export class AIWritingAssistantService {
  private static lastSuggestionTime = 0;
  private static suggestionCache = new Map<string, WritingSuggestion[]>();

  // Generate contextual suggestions based on current content and mood
  static generateContextualSuggestions(
    text: string, 
    cursorPosition: number, 
    moodTheme?: MoodTheme | null
  ): WritingSuggestion[] {
    const now = Date.now();
    const cacheKey = `${text.slice(Math.max(0, cursorPosition - 20), cursorPosition + 20)}_${moodTheme?.id || 'none'}`;
    
    // Check cache to avoid generating same suggestions repeatedly
    if (this.suggestionCache.has(cacheKey) && (now - this.lastSuggestionTime) < 2000) {
      return this.suggestionCache.get(cacheKey) || [];
    }

    const suggestions: WritingSuggestion[] = [];
    const contextBefore = text.slice(Math.max(0, cursorPosition - 50), cursorPosition);
    
    // Generate dynamic suggestions based on context
    const lastWords = contextBefore.trim().split(/\s+/).slice(-3);
    const currentLine = text.split('\n')[text.slice(0, cursorPosition).split('\n').length - 1];
    
    // Rhyme suggestions
    if (lastWords.length > 0) {
      const lastWord = lastWords[lastWords.length - 1].replace(/[.,!?;:]/, '');
      const rhymes = this.generateRhymes(lastWord);
      rhymes.forEach((rhyme, index) => {
        suggestions.push({
          id: `rhyme_${index}_${now}`,
          type: 'rhyme',
          text: rhyme,
          confidence: 0.8,
          context: `Rima com "${lastWord}"`,
          position: cursorPosition
        });
      });
    }

    // Mood-based suggestions
    if (moodTheme) {
      const moodSuggestions = this.generateMoodBasedSuggestions(moodTheme, contextBefore);
      suggestions.push(...moodSuggestions.map((text, index) => ({
        id: `mood_${index}_${now}`,
        type: 'theme' as const,
        text,
        confidence: 0.9,
        context: `Inspirado em ${moodTheme.name}`,
        position: cursorPosition
      })));
    }

    // Completion suggestions
    if (currentLine.length > 5) {
      const completions = this.generateCompletions(currentLine, contextBefore);
      completions.forEach((completion, index) => {
        suggestions.push({
          id: `completion_${index}_${now}`,
          type: 'completion',
          text: completion,
          confidence: 0.7,
          context: 'Continuação sugerida',
          position: cursorPosition
        });
      });
    }

    // Cache the results
    this.suggestionCache.set(cacheKey, suggestions);
    this.lastSuggestionTime = now;
    
    // Limit cache size
    if (this.suggestionCache.size > 10) {
      const firstKey = this.suggestionCache.keys().next().value;
      if (firstKey) {
        this.suggestionCache.delete(firstKey);
      }
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  // Generate dynamic rhymes
  private static generateRhymes(word: string): string[] {
    const rhymeMap: Record<string, string[]> = {
      'amor': ['dor', 'flor', 'cor', 'calor', 'esplendor'],
      'coração': ['paixão', 'emoção', 'canção', 'solidão', 'razão'],
      'vida': ['partida', 'ferida', 'querida', 'perdida', 'medida'],
      'alma': ['calma', 'palma', 'salma'],
      'luz': ['cruz', 'conduz', 'seduz', 'traduz'],
      'mar': ['luar', 'sonhar', 'amar', 'voar', 'brilhar'],
      'céu': ['véu', 'mel', 'fiel', 'cruel'],
      'tempo': ['momento', 'vento', 'lamento', 'tormento'],
    };

    const wordLower = word.toLowerCase();
    if (rhymeMap[wordLower]) {
      return rhymeMap[wordLower];
    }

    // Generate rhymes based on word endings
    const ending = wordLower.slice(-2);
    const allRhymes = Object.values(rhymeMap).flat();
    return allRhymes.filter(rhyme => rhyme.endsWith(ending)).slice(0, 3);
  }

  // Generate mood-based suggestions
  private static generateMoodBasedSuggestions(moodTheme: MoodTheme, context: string): string[] {
    const suggestions: string[] = [];
    
    // Use mood keywords and inspirations
    const randomKeywords = moodTheme.keywords.sort(() => 0.5 - Math.random()).slice(0, 2);
    const randomInspiration = moodTheme.inspirations[Math.floor(Math.random() * moodTheme.inspirations.length)];
    
    suggestions.push(...randomKeywords);
    if (randomInspiration && !context.includes(randomInspiration.slice(0, 10))) {
      suggestions.push(randomInspiration.slice(0, 30) + '...');
    }

    return suggestions;
  }

  // Generate contextual completions
  private static generateCompletions(currentLine: string, context: string): string[] {
    const completions: string[] = [];
    
    // Common poetic completions
    const poeticEndings = [
      'como estrelas no infinito',
      'sussurra ao vento',
      'dança na brisa',
      'ecoa no silêncio',
      'floresce na alma',
      'brilha eternamente',
      'toca o coração',
      'desperta a esperança'
    ];

    // Filter completions that make sense with current line
    const lineWords = currentLine.toLowerCase().split(/\s+/);
    const lastWord = lineWords[lineWords.length - 1];

    if (lastWord.includes('luz') || lastWord.includes('brilh')) {
      completions.push('que ilumina o caminho', 'dourada do amanhecer');
    } else if (lastWord.includes('amor') || lastWord.includes('coração')) {
      completions.push('que aquece a alma', 'sincero e profundo');
    } else {
      // Add random poetic endings
      completions.push(...poeticEndings.sort(() => 0.5 - Math.random()).slice(0, 2));
    }

    return completions;
  }

  // Predefined mood themes based on color psychology
  static MOOD_THEMES: MoodTheme[] = [
    {
      id: 'serene',
      name: 'Serenidade',
      description: 'Paz, tranquilidade e contemplação',
      colors: ['#E3F2FD', '#BBDEFB', '#90CAF9'],
      keywords: ['paz', 'calma', 'silêncio', 'brisa', 'lago', 'meditação'],
      inspirations: [
        'Como o lago sereno reflete o céu...',
        'No silêncio da manhã, encontro...',
        'Respirar é um ato de fé...'
      ],
      ambientSound: 'nature_sounds'
    },
    {
      id: 'passionate',
      name: 'Paixão',
      description: 'Amor intenso, desejo e emoção ardente',
      colors: ['#FFEBEE', '#FFCDD2', '#EF5350'],
      keywords: ['amor', 'coração', 'fogo', 'desejo', 'alma', 'eternidade'],
      inspirations: [
        'Teu olhar incendeia minha alma...',
        'No vermelho do pôr do sol, vejo...',
        'Amor é fogo que arde sem se ver...'
      ],
      ambientSound: 'romantic_piano'
    },
    {
      id: 'melancholic',
      name: 'Melancolia',
      description: 'Nostalgia, saudade e reflexão profunda',
      colors: ['#F3E5F5', '#E1BEE7', '#BA68C8'],
      keywords: ['saudade', 'memória', 'tempo', 'lágrima', 'outono', 'solidão'],
      inspirations: [
        'Nas folhas que caem, vejo o tempo...',
        'Saudade é a presença da ausência...',
        'O que foi não volta mais...'
      ],
      ambientSound: 'rain_sounds'
    },
    {
      id: 'hopeful',
      name: 'Esperança',
      description: 'Otimismo, renovação e novos começos',
      colors: ['#E8F5E8', '#C8E6C9', '#66BB6A'],
      keywords: ['esperança', 'luz', 'amanhecer', 'primavera', 'sonho', 'futuro'],
      inspirations: [
        'Após a tempestade, sempre vem o sol...',
        'Na semente pequena, uma floresta...',
        'Cada dia é uma nova oportunidade...'
      ],
      ambientSound: 'birds_chirping'
    },
    {
      id: 'mystical',
      name: 'Místico',
      description: 'Espiritualidade, mistério e transcendência',
      colors: ['#E8EAF6', '#C5CAE9', '#7986CB'],
      keywords: ['alma', 'divino', 'mistério', 'estrelas', 'infinito', 'sagrado'],
      inspirations: [
        'Nas estrelas, leio os segredos do universo...',
        'O sagrado habita no silêncio...',
        'Entre o visível e o invisível...'
      ],
      ambientSound: 'meditation_bells'
    },
    {
      id: 'energetic',
      name: 'Energia',
      description: 'Vitalidade, movimento e força criativa',
      colors: ['#FFF3E0', '#FFCC02', '#FF9800'],
      keywords: ['força', 'movimento', 'vida', 'energia', 'sol', 'criação'],
      inspirations: [
        'Como o sol que nunca se cansa...',
        'Na dança da vida, encontro ritmo...',
        'Energia pura flui em mim...'
      ],
      ambientSound: 'upbeat_instrumental'
    }
  ];

  // Portuguese rhyme patterns and common endings
  private static RHYME_PATTERNS = {
    'ão': ['coração', 'paixão', 'emoção', 'canção', 'solidão', 'oração'],
    'ar': ['amar', 'sonhar', 'voar', 'cantar', 'olhar', 'encontrar'],
    'or': ['amor', 'dor', 'flor', 'cor', 'calor', 'esplendor'],
    'ada': ['amada', 'madrugada', 'jornada', 'balada', 'alvorada'],
    'ente': ['presente', 'gente', 'mente', 'semente', 'corrente'],
    'eza': ['beleza', 'tristeza', 'natureza', 'pureza', 'certeza'],
    'ida': ['vida', 'ferida', 'partida', 'querida', 'perdida'],
    'ado': ['passado', 'amado', 'sonhado', 'encontrado', 'lembrado']
  };

  // Synonyms for common poetic words
  private static SYNONYMS = {
    'amor': ['paixão', 'carinho', 'afeto', 'ternura', 'adoração'],
    'tristeza': ['melancolia', 'pesar', 'mágoa', 'dor', 'sofrimento'],
    'alegria': ['felicidade', 'júbilo', 'contentamento', 'euforia', 'prazer'],
    'beleza': ['formosura', 'encanto', 'graça', 'elegância', 'esplendor'],
    'tempo': ['momento', 'instante', 'época', 'era', 'período'],
    'coração': ['peito', 'alma', 'ser', 'íntimo', 'essência'],
    'olhos': ['olhar', 'vista', 'pupilas', 'íris', 'contemplação'],
    'luz': ['claridade', 'brilho', 'luminosidade', 'fulgor', 'resplendor']
  };

  // Get mood themes
  static getMoodThemes(): MoodTheme[] {
    return this.MOOD_THEMES;
  }

  // Get theme by ID
  static getMoodTheme(id: string): MoodTheme | undefined {
    return this.MOOD_THEMES.find(theme => theme.id === id);
  }

  // Generate writing suggestions based on current text
  static generateSuggestions(text: string, cursorPosition: number): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = [];
    const words = text.toLowerCase().split(/\s+/);
    const currentWord = this.getCurrentWord(text, cursorPosition);
    const lastWord = words[words.length - 1];

    // Rhyme suggestions
    if (lastWord && lastWord.length > 2) {
      const rhymes = this.findRhymes(lastWord);
      rhymes.forEach((rhyme, index) => {
        suggestions.push({
          id: `rhyme_${index}`,
          type: 'rhyme',
          text: rhyme,
          confidence: 0.8,
          context: `Rima com "${lastWord}"`
        });
      });
    }

    // Synonym suggestions
    if (currentWord && this.SYNONYMS[currentWord.toLowerCase()]) {
      const synonyms = this.SYNONYMS[currentWord.toLowerCase()];
      synonyms.forEach((synonym, index) => {
        suggestions.push({
          id: `synonym_${index}`,
          type: 'synonym',
          text: synonym,
          confidence: 0.9,
          context: `Sinônimo de "${currentWord}"`
        });
      });
    }

    // Completion suggestions based on common patterns
    const completions = this.generateCompletions(text, cursorPosition);
    suggestions.push(...completions);

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  // Find rhyming words
  private static findRhymes(word: string): string[] {
    const rhymes: string[] = [];
    const wordLower = word.toLowerCase();
    
    // Check for common endings
    for (const [ending, words] of Object.entries(this.RHYME_PATTERNS)) {
      if (wordLower.endsWith(ending)) {
        rhymes.push(...words.filter(w => w !== wordLower));
        break;
      }
    }

    // If no pattern match, try to find words with similar endings
    if (rhymes.length === 0) {
      const lastTwoChars = wordLower.slice(-2);
      for (const words of Object.values(this.RHYME_PATTERNS)) {
        const matches = words.filter(w => w.endsWith(lastTwoChars) && w !== wordLower);
        rhymes.push(...matches);
      }
    }

    return rhymes.slice(0, 3);
  }

  // Get current word at cursor position
  private static getCurrentWord(text: string, position: number): string {
    const beforeCursor = text.slice(0, position);
    const afterCursor = text.slice(position);
    
    const wordStart = beforeCursor.search(/\S+$/);
    const wordEnd = afterCursor.search(/\s/);
    
    if (wordStart === -1) return '';
    
    const start = wordStart;
    const end = wordEnd === -1 ? afterCursor.length : wordEnd;
    
    return beforeCursor.slice(start) + afterCursor.slice(0, end);
  }

  // Generate completion suggestions
  private static generateCompletions(text: string, cursorPosition: number): WritingSuggestion[] {
    const completions: WritingSuggestion[] = [];
    const lines = text.split('\n');
    const currentLineIndex = text.slice(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';

    // Common poetic completions
    const commonCompletions = [
      'como uma flor que desabrocha',
      'no silêncio da madrugada',
      'entre sonhos e realidade',
      'com a força do vento',
      'nas águas cristalinas',
      'sob o manto das estrelas'
    ];

    // Context-based completions
    if (currentLine.includes('amor')) {
      completions.push({
        id: 'completion_love',
        type: 'completion',
        text: 'que transcende o tempo',
        confidence: 0.7,
        context: 'Complemento para "amor"'
      });
    }

    if (currentLine.includes('noite')) {
      completions.push({
        id: 'completion_night',
        type: 'completion',
        text: 'envolta em mistério',
        confidence: 0.7,
        context: 'Complemento para "noite"'
      });
    }

    // Add random common completions
    commonCompletions.slice(0, 2).forEach((completion, index) => {
      completions.push({
        id: `completion_common_${index}`,
        type: 'completion',
        text: completion,
        confidence: 0.6,
        context: 'Sugestão criativa'
      });
    });

    return completions;
  }

  // Analyze poem content
  static analyzePoemContent(content: string): PoemAnalysis {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    // Sentiment analysis (simplified)
    const positiveWords = ['amor', 'alegria', 'feliz', 'belo', 'luz', 'esperança', 'sonho'];
    const negativeWords = ['tristeza', 'dor', 'sofrimento', 'lágrima', 'solidão', 'saudade'];
    
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveScore++;
      if (negativeWords.some(nw => word.includes(nw))) negativeScore++;
    });

    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
    if (positiveScore > negativeScore) sentiment = 'positive';
    else if (negativeScore > positiveScore) sentiment = 'negative';
    else if (positiveScore > 0 && negativeScore > 0) sentiment = 'mixed';

    // Detect themes
    const themes: string[] = [];
    if (words.some(w => ['amor', 'coração', 'paixão'].includes(w))) themes.push('Amor');
    if (words.some(w => ['natureza', 'flor', 'árvore', 'mar'].includes(w))) themes.push('Natureza');
    if (words.some(w => ['tempo', 'passado', 'futuro', 'memória'].includes(w))) themes.push('Tempo');
    if (words.some(w => ['deus', 'alma', 'sagrado', 'divino'].includes(w))) themes.push('Espiritualidade');

    // Structure analysis
    let structure = 'Verso Livre';
    if (lines.length === 14) structure = 'Soneto';
    else if (lines.length % 4 === 0) structure = 'Quartetos';

    // Readability score (simplified)
    const avgWordsPerLine = words.length / Math.max(lines.length, 1);
    const readabilityScore = Math.min(100, Math.max(0, 100 - (avgWordsPerLine - 8) * 5));

    // Emotional intensity
    const emotionalWords = [...positiveWords, ...negativeWords];
    const emotionalIntensity = Math.min(100, (words.filter(w => 
      emotionalWords.some(ew => w.includes(ew))
    ).length / words.length) * 100);

    // Generate suggestions
    const suggestions: string[] = [];
    if (lines.length < 4) suggestions.push('Considere adicionar mais versos para desenvolver melhor o tema');
    if (themes.length === 0) suggestions.push('Tente incorporar um tema central mais definido');
    if (emotionalIntensity < 30) suggestions.push('Adicione mais palavras emotivas para intensificar o sentimento');
    if (readabilityScore < 50) suggestions.push('Simplifique algumas frases para melhor fluidez');

    return {
      sentiment,
      mood: this.detectMood(sentiment, words),
      themes,
      structure,
      readabilityScore: Math.round(readabilityScore),
      emotionalIntensity: Math.round(emotionalIntensity),
      suggestions
    };
  }

  // Detect mood from sentiment and words
  private static detectMood(sentiment: string, words: string[]): string {
    if (words.some(w => ['paz', 'calma', 'sereno'].includes(w))) return 'Sereno';
    if (words.some(w => ['amor', 'paixão', 'desejo'].includes(w))) return 'Apaixonado';
    if (words.some(w => ['saudade', 'tristeza', 'melancolia'].includes(w))) return 'Melancólico';
    if (words.some(w => ['esperança', 'sonho', 'futuro'].includes(w))) return 'Esperançoso';
    if (words.some(w => ['mistério', 'alma', 'divino'].includes(w))) return 'Místico';
    if (words.some(w => ['energia', 'força', 'vida'].includes(w))) return 'Energético';
    
    switch (sentiment) {
      case 'positive': return 'Alegre';
      case 'negative': return 'Melancólico';
      case 'mixed': return 'Complexo';
      default: return 'Contemplativo';
    }
  }

  // Generate theme-based inspirations
  static generateThemeInspirations(themeId: string): string[] {
    const theme = this.getMoodTheme(themeId);
    if (!theme) return [];

    return theme.inspirations;
  }

  // Get writing prompts based on mood
  static getWritingPrompts(mood: string): string[] {
    const prompts = {
      'Sereno': [
        'Descreva um momento de paz absoluta',
        'Como seria o silêncio se tivesse cor?',
        'Escreva sobre um lugar onde o tempo para'
      ],
      'Apaixonado': [
        'O primeiro olhar que mudou tudo',
        'Descreva o amor sem usar a palavra "amor"',
        'Como seria se as emoções tivessem forma?'
      ],
      'Melancólico': [
        'Uma carta para o tempo perdido',
        'O que ficou nas entrelinhas do adeus',
        'Descreva a saudade como se fosse uma pessoa'
      ],
      'Esperançoso': [
        'O amanhecer após a tempestade',
        'Escreva sobre um sonho que se tornou real',
        'Como seria plantar esperança?'
      ]
    };

    return prompts[mood] || [
      'Escreva sobre algo que te inspira',
      'Descreva um sentimento usando apenas imagens',
      'Como seria se pudesse conversar com seu eu do passado?'
    ];
  }
}
