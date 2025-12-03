import AsyncStorage from '@react-native-async-storage/async-storage';
import { Draft } from './DraftService';

export interface Achievement {
  key: string;
  label: string;
  poems: number;
  minWords: number;
  icon: string;
  color: string;
  description: string;
  motivationalMessage: string;
  category: 'Poesia' | 'Soneto' | 'Jogral' | 'Misto';
  instructions: string;
}

export interface AchievementProgress {
  achievementKey: string;
  unlockedAt?: Date;
  usedPoemIds: string[]; // IDs das poesias que contaram para esta conquista
  currentCount: number;
}

export interface AchievementState {
  unlockedAchievements: string[];
  progress: AchievementProgress[];
  newUnlockedAchievementKeys: string[];
  lastUnlockedKey?: string;
}

export const POEM_ACHIEVEMENTS: Achievement[] = [
  // CONQUISTAS DE POESIA
  {
    key: 'bronze_poesia',
    label: 'Bronze Poesia',
    poems: 1,
    minWords: 50, // Reduzido para ser mais acessível inicialmente
    icon: 'medal',
    color: '#cd7f32', // bronze
    description: 'Escreva 1 poesia com 50+ palavras.',
    motivationalMessage: '🎉 Seu primeiro poema épico! Você começou sua jornada poética.',
    category: 'Poesia',
    instructions: 'Para conquistar: Escreva uma poesia com pelo menos 50 palavras na categoria "Poesia".'
  },
  {
    key: 'prata_poesia',
    label: 'Prata Poesia',
    poems: 5,
    minWords: 150,
    icon: 'medal',
    color: '#c0c0c0', // prata
    description: 'Escreva 5 poesias com 150+ palavras.',
    motivationalMessage: '✨ Cinco poemas épicos! Sua voz poética está se fortalecendo com poemas significativos.',
    category: 'Poesia',
    instructions: 'Para conquistar: Escreva 5 poesias com pelo menos 150 palavras cada. Apenas poemas da categoria "Poesia" contam.'
  },
  {
    key: 'ouro_poesia',
    label: 'Ouro Poesia',
    poems: 10,
    minWords: 200,
    icon: 'medal',
    color: '#ffd700', // ouro
    description: 'Escreva 10 poesias com 200+ palavras.',
    motivationalMessage: '🌟 Dez poemas dourados! Você está se tornando um verdadeiro poeta com obras significativas.',
    category: 'Poesia',
    instructions: 'Para conquistar: Escreva 10 poesias com pelo menos 200 palavras cada. Continue explorando temas profundos.'
  },

  // CONQUISTAS DE SONETO
  {
    key: 'bronze_soneto',
    label: 'Bronze Soneto',
    poems: 1,
    minWords: 50, // Reduzido para focar na estrutura ao invés da quantidade de palavras
    icon: 'book',
    color: '#b87333', // bronze escuro
    description: 'Escreva 1 soneto com estrutura tradicional.',
    motivationalMessage: '📖 Seu primeiro soneto! Você descobriu a beleza da forma clássica.',
    category: 'Soneto',
    instructions: 'Para conquistar: Escreva um soneto na categoria "Soneto". Lembre-se da estrutura de 14 versos.'
  },
  {
    key: 'prata_soneto',
    label: 'Prata Soneto',
    poems: 3,
    minWords: 100,
    icon: 'book',
    color: '#a8a9ad', // prata
    description: 'Escreva 3 sonetos com 100+ palavras.',
    motivationalMessage: '📖 Três sonetos! Você está dominando a forma clássica da poesia.',
    category: 'Soneto',
    instructions: 'Para conquistar: Escreva 3 sonetos com pelo menos 100 palavras cada. Mantenha a estrutura clássica.'
  },
  {
    key: 'ouro_soneto',
    label: 'Ouro Soneto',
    poems: 7,
    minWords: 120,
    icon: 'book',
    color: '#ffd700', // ouro
    description: 'Escreva 7 sonetos com 120+ palavras.',
    motivationalMessage: '📖 Sete sonetos dourados! Você é um mestre da forma clássica.',
    category: 'Soneto',
    instructions: 'Para conquistar: Escreva 7 sonetos com pelo menos 120 palavras cada. Explore diferentes temas clássicos.'
  },

  // CONQUISTAS DE JOGRAL
  {
    key: 'bronze_jogral',
    label: 'Bronze Jogral',
    poems: 1,
    minWords: 40, // Reduzido para focar na performance ao invés da quantidade
    icon: 'microphone',
    color: '#cd7f32', // bronze
    description: 'Escreva 1 jogral performático.',
    motivationalMessage: '🎤 Seu primeiro jogral! Você descobriu o poder da palavra falada.',
    category: 'Jogral',
    instructions: 'Para conquistar: Escreva um jogral na categoria "Jogral". Foque na performance e ritmo.'
  },
  {
    key: 'prata_jogral',
    label: 'Prata Jogral',
    poems: 3,
    minWords: 80,
    icon: 'microphone',
    color: '#a8a9ad', // prata
    description: 'Escreva 3 jograis com 80+ palavras.',
    motivationalMessage: '🎤 Três jograis! Sua voz está se tornando mais forte e expressiva.',
    category: 'Jogral',
    instructions: 'Para conquistar: Escreva 3 jograis com pelo menos 80 palavras cada. Foque no ritmo e na oralidade.'
  },
  {
    key: 'ouro_jogral',
    label: 'Ouro Jogral',
    poems: 5,
    minWords: 100,
    icon: 'microphone',
    color: '#ffd700', // ouro
    description: 'Escreva 5 jograis com 100+ palavras.',
    motivationalMessage: '🎤 Cinco jograis dourados! Você é um verdadeiro jogralista.',
    category: 'Jogral',
    instructions: 'Para conquistar: Escreva 5 jograis com pelo menos 100 palavras cada. Experimente diferentes ritmos.'
  },

  // CONQUISTAS MISTAS
  {
    key: 'versatil',
    label: 'Versátil',
    poems: 3,
    minWords: 50,
    icon: 'star',
    color: '#9C27B0',
    description: 'Escreva 3 obras em categorias diferentes (Poesia, Soneto, Jogral).',
    motivationalMessage: '⭐ Você é um poeta versátil! Dominando diferentes formas de expressão.',
    category: 'Misto',
    instructions: 'Para conquistar: Escreva pelo menos 1 poesia, 1 soneto e 1 jogral com 50+ palavras cada.'
  },
  {
    key: 'polivalente',
    label: 'Polivalente',
    poems: 5,
    minWords: 80,
    icon: 'star',
    color: '#9C27B0',
    description: 'Escreva 5 obras em categorias diferentes.',
    motivationalMessage: '⭐ Você é um poeta polivalente! Explorando todas as formas de arte poética.',
    category: 'Misto',
    instructions: 'Para conquistar: Escreva pelo menos 2 poesias, 2 sonetos e 1 jogral com 80+ palavras cada.'
  },
  {
    key: 'universal',
    label: 'Universal',
    poems: 10,
    minWords: 100,
    icon: 'star',
    color: '#9C27B0',
    description: 'Escreva 10 obras em categorias diferentes.',
    motivationalMessage: '⭐ Você é um poeta universal! Dominando todas as formas de expressão poética.',
    category: 'Misto',
    instructions: 'Para conquistar: Escreva pelo menos 4 poesias, 3 sonetos e 3 jograis com 100+ palavras cada.'
  },

  // CONQUISTAS DE DIAMANTE
  {
    key: 'diamante_poesia',
    label: 'Diamante Poesia',
    poems: 20,
    minWords: 250,
    icon: 'gem',
    color: '#b9f2ff', // diamante
    description: 'Escreva 20 poesias com 250+ palavras.',
    motivationalMessage: '💎 Poeta de Diamante! Seus poemas são verdadeiras joias literárias, brilhando com profundidade e emoção.',
    category: 'Poesia',
    instructions: 'Para conquistar: Escreva 20 poesias com pelo menos 250 palavras cada. Seus versos são eternos.'
  },
  {
    key: 'diamante_soneto',
    label: 'Diamante Soneto',
    poems: 15,
    minWords: 150,
    icon: 'gem',
    color: '#b9f2ff', // diamante
    description: 'Escreva 15 sonetos com 150+ palavras.',
    motivationalMessage: '💎 Mestre dos Sonetos! Você elevou a forma clássica a um novo patamar de excelência e arte.',
    category: 'Soneto',
    instructions: 'Para conquistar: Escreva 15 sonetos com pelo menos 150 palavras cada. A perfeição em 14 versos.'
  },
  {
    key: 'diamante_jogral',
    label: 'Diamante Jogral',
    poems: 10,
    minWords: 120,
    icon: 'gem',
    color: '#b9f2ff', // diamante
    description: 'Escreva 10 jograis com 120+ palavras.',
    motivationalMessage: '🎤 Lenda do Jogral! Sua voz ecoa com poder e inspiração, movendo corações e mentes.',
    category: 'Jogral',
    instructions: 'Para conquistar: Escreva 10 jograis com pelo menos 120 palavras cada. Sua performance é inesquecível.'
  },

  // CONQUISTA FINAL
  {
    key: 'lenda_viva',
    label: 'Lenda Viva',
    poems: 3, // Representa as 3 conquistas de diamante necessárias
    minWords: 0, // Não aplicável
    icon: 'trophy',
    color: '#FFD700', // ouro brilhante
    description: 'Desbloqueie todas as conquistas de diamante.',
    motivationalMessage: '👑 Lenda Viva! Você alcançou o panteão dos poetas. Sua jornada é uma inspiração para todos.',
    category: 'Misto',
    instructions: 'Para conquistar: Desbloqueie todas as outras 3 conquistas de diamante. Você é uma verdadeira lenda.'
  }
];

const ACHIEVEMENT_STORAGE_KEY = '@VersoEMusa:achievements';

export class AchievementService {
  // Carregar estado das conquistas
  static async loadAchievementState(): Promise<AchievementState> {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        unlockedAchievements: [],
        progress: [],
        newUnlockedAchievementKeys: [],
        lastUnlockedKey: undefined
      };
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      return {
        unlockedAchievements: [],
        progress: [],
        newUnlockedAchievementKeys: [],
        lastUnlockedKey: undefined
      };
    }
  }

  // Salvar estado das conquistas
  static async saveAchievementState(state: AchievementState): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Erro ao salvar conquistas:', error);
    }
  }

  // Função auxiliar para contar palavras de forma consistente
  private static countWords(text: string): number {
    // Remove espaços extras e quebras de linha
    const cleanText = text.trim().replace(/\s+/g, ' ');
    // Retorna 0 se o texto estiver vazio
    if (!cleanText) return 0;
    // Divide por espaços e conta as palavras
    return cleanText.split(' ').length;
  }

  // Função auxiliar para validar um poema
  private static validatePoem(draft: Draft, minWords: number): boolean {
    if (!draft || !draft.content || !draft.category) return false;
    const wordCount = this.countWords(draft.content);
    return wordCount >= minWords;
  }

  // Verificar e atualizar conquistas baseado nos rascunhos
  static async checkAndUpdateAchievements(drafts: Draft[]): Promise<{
    newUnlockedAchievements: Achievement[];
    state: AchievementState;
  }> {
    if (!Array.isArray(drafts)) {
      console.error('Drafts inválidos fornecidos para verificação de conquistas');
      return { newUnlockedAchievements: [], state: await this.loadAchievementState() };
    }

    const currentState = await this.loadAchievementState();
    const newUnlockedAchievements: Achievement[] = [];
    const stillUnlocked: string[] = [];
    let newUnlockedKeys: string[] = [];

    for (const achievement of POEM_ACHIEVEMENTS) {
      let isUnlocked = false;
      let currentCount = 0;
      let usedPoemIds: string[] = [];
      const existingProgress = currentState.progress.find(p => p.achievementKey === achievement.key);

      try {
        // Validar drafts antes de processar
        const validDrafts = drafts.filter(draft => draft && draft.id && draft.category && draft.content);

        if (achievement.category === 'Misto') {
        // Tratamento especial para a conquista "Lenda Viva"
        if (achievement.key === 'lenda_viva') {
            // Verificar se todas as conquistas de diamante foram desbloqueadas
            const diamantePoesia = currentState.unlockedAchievements.includes('diamante_poesia');
            const diamanteSoneto = currentState.unlockedAchievements.includes('diamante_soneto');
            const diamanteJogral = currentState.unlockedAchievements.includes('diamante_jogral');
            
            isUnlocked = diamantePoesia && diamanteSoneto && diamanteJogral;
            currentCount = (diamantePoesia ? 1 : 0) + (diamanteSoneto ? 1 : 0) + (diamanteJogral ? 1 : 0);
            usedPoemIds = []; // Não aplicável para esta conquista
          } else {
            // Para outras conquistas mistas (versatil, polivalente, universal)
            const poesias = validDrafts.filter(d => d.category === 'Poesia' && this.validatePoem(d, achievement.minWords));
            const sonetos = validDrafts.filter(d => d.category === 'Soneto' && this.validatePoem(d, achievement.minWords));
            const jograis = validDrafts.filter(d => d.category === 'Jogral' && this.validatePoem(d, achievement.minWords));
            let minPoesias = 1, minSonetos = 1, minJograis = 1;
            if (achievement.key === 'polivalente') {
              minPoesias = 2; minSonetos = 2; minJograis = 1;
            } else if (achievement.key === 'universal') {
              minPoesias = 4; minSonetos = 3; minJograis = 3;
            }

            // Verificação mais robusta para conquistas mistas
            const hasPoesias = poesias.length >= minPoesias;
            const hasSonetos = sonetos.length >= minSonetos;
            const hasJograis = jograis.length >= minJograis;
            
            isUnlocked = hasPoesias && hasSonetos && hasJograis;
            currentCount = Math.min(poesias.length, minPoesias) + 
                         Math.min(sonetos.length, minSonetos) + 
                         Math.min(jograis.length, minJograis);
            
            // Garantir que IDs únicos sejam usados
            const uniqueIds = new Set<string>();
            poesias.slice(0, minPoesias).forEach(p => uniqueIds.add(p.id!));
            sonetos.slice(0, minSonetos).forEach(p => uniqueIds.add(p.id!));
            jograis.slice(0, minJograis).forEach(p => uniqueIds.add(p.id!));
            
            usedPoemIds = Array.from(uniqueIds);
          }
        } else {
          // Para conquistas de categoria específica
          const categoryPoems = validDrafts.filter(d => 
            d.category === achievement.category && 
            this.validatePoem(d, achievement.minWords)
          );
          
          isUnlocked = categoryPoems.length >= achievement.poems;
          currentCount = Math.min(categoryPoems.length, achievement.poems);
          usedPoemIds = categoryPoems
            .slice(0, achievement.poems)
            .map(p => p.id!)
            .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicatas
        }
      } catch (error) {
        console.error(`Erro ao processar conquista ${achievement.key}:`, error);
        continue; // Pula para próxima conquista em caso de erro
      }

      // Processar resultado após verificação
      if (isUnlocked) {
        stillUnlocked.push(achievement.key);
        if (!currentState.unlockedAchievements.includes(achievement.key)) {
          newUnlockedAchievements.push(achievement);
          newUnlockedKeys.push(achievement.key);
          currentState.lastUnlockedKey = achievement.key; // SÓ ATUALIZA QUANDO DESBLOQUEAR
        }
        // Atualizar ou adicionar progresso
        const progressIndex = currentState.progress.findIndex(p => p.achievementKey === achievement.key);
        const unlockedAt = existingProgress?.unlockedAt || (isUnlocked ? new Date() : undefined);
        const progress = {
          achievementKey: achievement.key,
          usedPoemIds,
          currentCount,
          unlockedAt: unlockedAt
        };
        if (progressIndex >= 0) {
          currentState.progress[progressIndex] = progress;
        } else {
          currentState.progress.push(progress);
        }
      }
    }
    // Remover conquistas que não estão mais desbloqueadas
    currentState.unlockedAchievements = stillUnlocked;
    currentState.progress = currentState.progress.filter(p => stillUnlocked.includes(p.achievementKey));
    currentState.newUnlockedAchievementKeys = newUnlockedKeys;
    // NÃO limpar lastUnlockedKey automaticamente aqui!
    await this.saveAchievementState(currentState);
    return {
      newUnlockedAchievements,
      state: currentState
    };
  }

  // Obter progresso de uma conquista específica
  static getAchievementProgress(achievementKey: string, state: AchievementState): AchievementProgress | undefined {
    return state.progress.find(p => p.achievementKey === achievementKey);
  }

  // Obter próxima conquista a ser desbloqueada
  static getNextAchievement(state: AchievementState): Achievement | null {
    const unlockedKeys = state.unlockedAchievements;
    return POEM_ACHIEVEMENTS.find(a => !unlockedKeys.includes(a.key)) || null;
  }

  // Obter conquista atual (última desbloqueada)
  static getCurrentAchievement(state: AchievementState): Achievement | null {
    if (state.unlockedAchievements.length === 0) {
      return POEM_ACHIEVEMENTS[0]; // Bronze como padrão
    }
    const lastUnlockedKey = state.unlockedAchievements[state.unlockedAchievements.length - 1];
    return POEM_ACHIEVEMENTS.find(a => a.key === lastUnlockedKey) || null;
  }

  // Resetar todas as conquistas (para testes)
  static async resetAchievements(): Promise<void> {
    await AsyncStorage.removeItem(ACHIEVEMENT_STORAGE_KEY);
  }

  // Resetar apenas o lastUnlockedKey (para evitar celebrações repetidas)
  static async markAchievementAsShown(achievementKey: string): Promise<void> {
    try {
      const currentState = await this.loadAchievementState();
      currentState.newUnlockedAchievementKeys = currentState.newUnlockedAchievementKeys.filter(key => key !== achievementKey);
      await this.saveAchievementState(currentState);
    } catch (error) {
      console.error('Erro ao marcar conquista como mostrada:', error);
    }
  }

  // Limpar completamente o estado das conquistas (para resolver bugs)
  static async clearAllAchievementData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACHIEVEMENT_STORAGE_KEY);
      console.log('Estado das conquistas limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar conquistas:', error);
    }
  }

  // Obter estatísticas das conquistas
  static getAchievementStats(state: AchievementState) {
    const totalAchievements = POEM_ACHIEVEMENTS.length;
    const unlockedCount = state.unlockedAchievements.length;
    const progress = state.progress.reduce((acc, p) => acc + p.currentCount, 0);

    return {
      totalAchievements,
      unlockedCount,
      progress,
      completionPercentage: (unlockedCount / totalAchievements) * 100
    };
  }
}