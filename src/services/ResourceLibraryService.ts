// src/services/ResourceLibraryService.ts
export interface Metaphor {
  id: string;
  category: string;
  metaphor: string;
  meaning: string;
  example: string;
}

export interface RhymeWord {
  word: string;
  rhymes: string[];
  syllables: number;
}

export interface FamousQuote {
  id: string;
  text: string;
  author: string;
  category: 'christian' | 'classic' | 'modern' | 'inspirational';
  source?: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'nature' | 'emotion' | 'memory' | 'faith' | 'love' | 'reflection';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CreativityExercise {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  timeEstimate: number; // em minutos
  category: string;
}

class ResourceLibraryService {
  private metaphors: Metaphor[] = [
    {
      id: '1',
      category: 'Natureza',
      metaphor: 'O coração é um jardim',
      meaning: 'Os sentimentos crescem e florescem como plantas',
      example: 'Em meu coração-jardim, tua lembrança é rosa que jamais murcha'
    },
    {
      id: '2',
      category: 'Tempo',
      metaphor: 'O tempo é um rio',
      meaning: 'O tempo flui continuamente, levando momentos',
      example: 'No rio do tempo, nossos dias são gotas que se perdem no oceano'
    },
    {
      id: '3',
      category: 'Amor',
      metaphor: 'O amor é uma chama',
      meaning: 'O amor aquece, ilumina, mas pode queimar',
      example: 'Tua paixão é chama que arde em meu peito sem se consumir'
    },
    {
      id: '4',
      category: 'Vida',
      metaphor: 'A vida é uma jornada',
      meaning: 'A vida é um caminho com destinos e descobertas',
      example: 'Nesta jornada da vida, cada escolha é uma estrada nova'
    },
    {
      id: '5',
      category: 'Esperança',
      metaphor: 'A esperança é uma estrela',
      meaning: 'A esperança guia e ilumina nos momentos escuros',
      example: 'Quando tudo escurece, a esperança brilha como estrela solitária'
    },
    {
      id: '6',
      category: 'Fé',
      metaphor: 'A fé é uma âncora',
      meaning: 'A fé nos mantém firmes nas tempestades da vida',
      example: 'Minha fé é âncora que me sustenta no mar revolto dos dias'
    }
  ];

  private rhymeDatabase: { [key: string]: string[] } = {
    'amor': ['dor', 'flor', 'cor', 'calor', 'valor', 'clamor', 'temor', 'fervor'],
    'coração': ['paixão', 'emoção', 'canção', 'oração', 'solidão', 'perdão', 'ilusão'],
    'vida': ['partida', 'ferida', 'querida', 'perdida', 'corrida', 'medida', 'guarida'],
    'sonho': ['risonho', 'medonho', 'tristonho', 'vergonha', 'testemunha'],
    'luz': ['cruz', 'conduz', 'seduz', 'produz', 'traduz', 'Jesus'],
    'paz': ['capaz', 'eficaz', 'sagaz', 'tenaz', 'voraz', 'audaz'],
    'esperança': ['lembrança', 'mudança', 'criança', 'confiança', 'bonança'],
    'tempo': ['momento', 'lamento', 'tormento', 'contento', 'vento'],
    'céu': ['véu', 'mel', 'fiel', 'cruel', 'papel', 'anel'],
    'mar': ['lugar', 'luar', 'pesar', 'chorar', 'amar', 'sonhar']
  };

  private famousQuotes: FamousQuote[] = [
    // Citações Cristãs
    {
      id: '1',
      text: 'Tudo posso naquele que me fortalece.',
      author: 'Apóstolo Paulo',
      category: 'christian',
      source: 'Filipenses 4:13'
    },
    {
      id: '2',
      text: 'O Senhor é meu pastor, nada me faltará.',
      author: 'Rei Davi',
      category: 'christian',
      source: 'Salmo 23:1'
    },
    {
      id: '3',
      text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.',
      author: 'Jesus Cristo',
      category: 'christian',
      source: 'João 3:16'
    },
    {
      id: '4',
      text: 'A fé é o firme fundamento das coisas que se esperam.',
      author: 'Apóstolo Paulo',
      category: 'christian',
      source: 'Hebreus 11:1'
    },
    // Poetas Cristãos
    {
      id: '5',
      text: 'Senhor, fazei-me instrumento de vossa paz.',
      author: 'São Francisco de Assis',
      category: 'christian'
    },
    {
      id: '6',
      text: 'Tarde vos amei, ó beleza tão antiga e tão nova.',
      author: 'Santo Agostinho',
      category: 'christian'
    },
    {
      id: '7',
      text: 'Deus escreve direito por linhas tortas.',
      author: 'Provérbio Cristão',
      category: 'christian'
    },
    // Clássicos da Literatura
    {
      id: '8',
      text: 'Ser ou não ser, eis a questão.',
      author: 'William Shakespeare',
      category: 'classic'
    },
    {
      id: '9',
      text: 'No meio do caminho tinha uma pedra.',
      author: 'Carlos Drummond de Andrade',
      category: 'classic'
    },
    {
      id: '10',
      text: 'Amar é mudar a alma de casa.',
      author: 'Mário Quintana',
      category: 'classic'
    },
    {
      id: '11',
      text: 'Quem dera eu fosse um peixe para nadar neste momento.',
      author: 'Vinicius de Moraes',
      category: 'classic'
    },
    // Inspiracionais Modernos
    {
      id: '12',
      text: 'A poesia está guardada nas palavras — é tudo que eu sei.',
      author: 'Manoel de Barros',
      category: 'modern'
    },
    {
      id: '13',
      text: 'Escrever é uma forma de sangrar sem se ferir.',
      author: 'Clarice Lispector',
      category: 'modern'
    },
    {
      id: '14',
      text: 'A vida é a arte do encontro, embora haja tanto desencontro pela vida.',
      author: 'Vinicius de Moraes',
      category: 'inspirational'
    }
  ];

  private writingPrompts: WritingPrompt[] = [
    {
      id: '1',
      title: 'O Jardim Secreto',
      prompt: 'Descreva um lugar especial da sua infância usando apenas metáforas da natureza.',
      category: 'memory',
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Carta ao Tempo',
      prompt: 'Escreva uma carta para o tempo, agradecendo ou reclamando sobre sua passagem.',
      category: 'reflection',
      difficulty: 'intermediate'
    },
    {
      id: '3',
      title: 'A Cor do Sentimento',
      prompt: 'Escolha uma emoção e descreva-a usando apenas cores e texturas.',
      category: 'emotion',
      difficulty: 'beginner'
    },
    {
      id: '4',
      title: 'Oração em Versos',
      prompt: 'Transforme uma oração pessoal em um poema, mantendo sua essência espiritual.',
      category: 'faith',
      difficulty: 'intermediate'
    },
    {
      id: '5',
      title: 'O Som do Silêncio',
      prompt: 'Descreva o silêncio usando apenas metáforas sonoras.',
      category: 'nature',
      difficulty: 'advanced'
    },
    {
      id: '6',
      title: 'Amor em Estações',
      prompt: 'Compare as fases de um relacionamento com as quatro estações do ano.',
      category: 'love',
      difficulty: 'intermediate'
    }
  ];

  private creativityExercises: CreativityExercise[] = [
    {
      id: '1',
      title: 'Exercício das 5 Palavras',
      description: 'Desenvolva criatividade com associações aleatórias',
      instructions: [
        'Escolha 5 palavras completamente aleatórias',
        'Crie conexões entre elas',
        'Escreva um poema de 4 versos usando todas as palavras',
        'Tente manter um tema coerente'
      ],
      timeEstimate: 15,
      category: 'Criatividade'
    },
    {
      id: '2',
      title: 'Reescrita de Perspectiva',
      description: 'Mude o ponto de vista para criar novos significados',
      instructions: [
        'Escolha um objeto comum (cadeira, caneta, etc.)',
        'Escreva sobre ele do ponto de vista do próprio objeto',
        'Use primeira pessoa',
        'Explore sentimentos e experiências do objeto'
      ],
      timeEstimate: 20,
      category: 'Perspectiva'
    },
    {
      id: '3',
      title: 'Poema Sensorial',
      description: 'Explore todos os cinco sentidos',
      instructions: [
        'Escolha uma memória marcante',
        'Dedique um verso para cada sentido',
        'Visão, audição, olfato, paladar, tato',
        'Conecte todos os sentidos na conclusão'
      ],
      timeEstimate: 25,
      category: 'Sensorial'
    }
  ];

  // Métodos para acessar metáforas
  getMetaphorsByCategory(category: string): Metaphor[] {
    return this.metaphors.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  getAllMetaphors(): Metaphor[] {
    return this.metaphors;
  }

  getRandomMetaphor(): Metaphor {
    return this.metaphors[Math.floor(Math.random() * this.metaphors.length)];
  }

  // Métodos para rimas
  getRhymesForWord(word: string): string[] {
    const normalizedWord = word.toLowerCase().trim();
    return this.rhymeDatabase[normalizedWord] || [];
  }

  getAllRhymeWords(): string[] {
    return Object.keys(this.rhymeDatabase);
  }

  findWordsWithRhymes(searchTerm: string): { word: string; rhymes: string[] }[] {
    const results: { word: string; rhymes: string[] }[] = [];
    
    Object.entries(this.rhymeDatabase).forEach(([word, rhymes]) => {
      if (word.includes(searchTerm.toLowerCase()) || 
          rhymes.some(rhyme => rhyme.includes(searchTerm.toLowerCase()))) {
        results.push({ word, rhymes });
      }
    });
    
    return results;
  }

  // Métodos para citações
  getQuotesByCategory(category: FamousQuote['category']): FamousQuote[] {
    return this.famousQuotes.filter(q => q.category === category);
  }

  getAllQuotes(): FamousQuote[] {
    return this.famousQuotes;
  }

  getRandomQuote(category?: FamousQuote['category']): FamousQuote {
    const quotes = category ? this.getQuotesByCategory(category) : this.famousQuotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Métodos para prompts de escrita
  getPromptsByCategory(category: WritingPrompt['category']): WritingPrompt[] {
    return this.writingPrompts.filter(p => p.category === category);
  }

  getPromptsByDifficulty(difficulty: WritingPrompt['difficulty']): WritingPrompt[] {
    return this.writingPrompts.filter(p => p.difficulty === difficulty);
  }

  getDailyPrompt(): WritingPrompt {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % this.writingPrompts.length;
    return this.writingPrompts[index];
  }

  getAllPrompts(): WritingPrompt[] {
    return this.writingPrompts;
  }

  // Métodos para exercícios de criatividade
  getExercisesByCategory(category: string): CreativityExercise[] {
    return this.creativityExercises.filter(e => e.category === category);
  }

  getExercisesByTime(maxTime: number): CreativityExercise[] {
    return this.creativityExercises.filter(e => e.timeEstimate <= maxTime);
  }

  getAllExercises(): CreativityExercise[] {
    return this.creativityExercises;
  }

  getRandomExercise(): CreativityExercise {
    return this.creativityExercises[Math.floor(Math.random() * this.creativityExercises.length)];
  }

  // Método para busca geral
  searchResources(query: string): {
    metaphors: Metaphor[];
    quotes: FamousQuote[];
    prompts: WritingPrompt[];
    exercises: CreativityExercise[];
    rhymes: { word: string; rhymes: string[] }[];
  } {
    const searchTerm = query.toLowerCase();
    
    return {
      metaphors: this.metaphors.filter(m => 
        m.metaphor.toLowerCase().includes(searchTerm) ||
        m.meaning.toLowerCase().includes(searchTerm) ||
        m.category.toLowerCase().includes(searchTerm)
      ),
      quotes: this.famousQuotes.filter(q => 
        q.text.toLowerCase().includes(searchTerm) ||
        q.author.toLowerCase().includes(searchTerm)
      ),
      prompts: this.writingPrompts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.prompt.toLowerCase().includes(searchTerm)
      ),
      exercises: this.creativityExercises.filter(e => 
        e.title.toLowerCase().includes(searchTerm) ||
        e.description.toLowerCase().includes(searchTerm)
      ),
      rhymes: this.findWordsWithRhymes(searchTerm)
    };
  }
}

export default new ResourceLibraryService();
