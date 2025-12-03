import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class CategoryServiceClass {
  private readonly STORAGE_KEY = '@Muse_Categories';
  private categoriesCache: Category[] | null = null;
  private isInitialized = false;
  
  // Categorias padrão que não podem ser deletadas
  private readonly DEFAULT_CATEGORIES: Category[] = [
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

  /**
   * Inicializa as categorias padrão se necessário
   */
  async initializeDefaultCategories(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ CategoryService: Já inicializado, retornando...');
      return;
    }

    try {
      console.log('🔄 CategoryService: Inicializando categorias padrão...');
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        console.log('📝 CategoryService: Criando categorias padrão...');
        await AsyncStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(this.DEFAULT_CATEGORIES)
        );
        this.categoriesCache = [...this.DEFAULT_CATEGORIES];
        console.log('✅ CategoryService: Categorias padrão criadas');
      } else {
        const existingCategories = JSON.parse(stored) as Category[];
        this.categoriesCache = existingCategories;
        console.log('✅ CategoryService: Categorias carregadas do storage:', existingCategories.length);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ CategoryService: Erro ao inicializar categorias padrão:', error);
      // Fallback silencioso - usar categorias padrão em memória
      this.categoriesCache = [...this.DEFAULT_CATEGORIES];
      this.isInitialized = true;
    }
  }

  /**
   * Obtém todas as categorias
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      // Se já temos cache, retornar
      if (this.categoriesCache) {
        console.log('📦 CategoryService: Retornando do cache:', this.categoriesCache.length);
        return [...this.categoriesCache];
      }

      // Inicializar se necessário
      if (!this.isInitialized) {
        await this.initializeDefaultCategories();
      }

      // Retornar cache após inicialização
      if (this.categoriesCache) {
        return [...this.categoriesCache];
      }

      // Fallback final
      console.log('⚠️ CategoryService: Usando fallback para categorias padrão');
      return [...this.DEFAULT_CATEGORIES];
      
    } catch (error) {
      console.error('❌ CategoryService: Erro ao buscar categorias:', error);
      return [...this.DEFAULT_CATEGORIES];
    }
  }

  /**
   * Obtém uma categoria específica por ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getAllCategories();
      return categories.find(cat => cat.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar categoria por ID:', error);
      return null;
    }
  }

  /**
   * Cria uma nova categoria personalizada
   */
  async createCategory(
    name: string,
    description: string = '',
    icon: string = 'create-outline',
    color: string = '#09868B'
  ): Promise<string> {
    try {
      const categories = await this.getAllCategories();
      
      // Verificar se já existe uma categoria com esse nome
      if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        throw new Error(`❌ A categoria "${name}" já existe! Tente um nome diferente.`);
      }
      
      const newCategory: Category = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedCategories = [...categories, newCategory];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCategories));
      
      // Atualizar cache e notificar mudança
      this.categoriesCache = updatedCategories;
      console.log('📢 CategoryService: Nova categoria criada, cache atualizado');
      
      return newCategory.id;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma categoria existente
   */
  async updateCategory(
    id: string,
    updates: Partial<Pick<Category, 'name' | 'description' | 'icon' | 'color'>>
  ): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const categoryIndex = categories.findIndex(cat => cat.id === id);
      
      if (categoryIndex === -1) {
        throw new Error('Categoria não encontrada');
      }
      
      const category = categories[categoryIndex];
      
      // Não permitir editar categorias padrão (apenas personalizadas)
      if (category.isDefault) {
        throw new Error('Categorias padrão não podem ser editadas');
      }
      
      // Verificar se o novo nome já existe (se nome foi alterado)
      if (updates.name && updates.name !== category.name) {
        if (categories.find(cat => 
          cat.id !== id && cat.name.toLowerCase() === updates.name!.toLowerCase()
        )) {
          throw new Error('Já existe uma categoria com esse nome');
        }
      }
      
      categories[categoryIndex] = {
        ...category,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
      
      // Atualizar cache e notificar mudança
      this.categoriesCache = categories;
      console.log('📢 CategoryService: Categoria atualizada, cache atualizado');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  /**
   * Remove uma categoria personalizada
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const category = categories.find(cat => cat.id === id);
      
      if (!category) {
        throw new Error('Categoria não encontrada');
      }
      
      // Não permitir deletar categorias padrão
      if (category.isDefault) {
        throw new Error('Categorias padrão não podem ser removidas');
      }
      
      const updatedCategories = categories.filter(cat => cat.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCategories));
      
      // Atualizar cache e notificar mudança
      this.categoriesCache = updatedCategories;
      console.log('📢 CategoryService: Categoria deletada, cache atualizado');
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  /**
   * Obtém apenas categorias personalizadas (não padrão)
   */
  async getCustomCategories(): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories();
      return categories.filter(cat => !cat.isDefault);
    } catch (error) {
      console.error('Erro ao buscar categorias personalizadas:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas das categorias (quantos poemas/drafts cada uma tem)
   */
  async getCategoryStats(): Promise<Record<string, number>> {
    try {
      // Implementar quando integrar com DraftService
      // Por enquanto retorna objeto vazio
      return {};
    } catch (error) {
      console.error('Erro ao buscar estatísticas de categorias:', error);
      return {};
    }
  }

  /**
   * Gera estatísticas completas das categorias baseado nos drafts
   */
  async generateCategoryStats(drafts: any[]): Promise<{name: string, count: number, icon: string, gradient: string[], color: string}[]> {
    try {
      console.log('📊 CategoryService: Gerando estatísticas para', drafts.length, 'drafts');
      
      const categories = await this.getAllCategories();
      const stats: {name: string, count: number, icon: string, gradient: string[], color: string}[] = [];
      
      // Adicionar "Todos" primeiro
      stats.push({
        name: 'Todos',
        count: drafts.length,
        icon: 'library',
        gradient: ['#667EEA', '#764BA2'],
        color: '#667EEA'
      });
      
      // Processar cada categoria
      for (const category of categories) {
        // Contar drafts que pertencem a esta categoria
        const matchingDrafts = drafts.filter(draft => {
          // Primeiro: verificar por typeId (sistema atual)
          if (draft.typeId && draft.typeId === category.id) {
            console.log(`✅ Draft "${draft.title}" matched by typeId: ${draft.typeId} === ${category.id}`);
            return true;
          }
          
          // Segundo: verificar por categoria legacy APENAS se não tem typeId
          if (!draft.typeId && draft.category) {
            const mappedCategory = this.mapLegacyCategory(draft.category);
            if (mappedCategory && mappedCategory === category.id) {
              console.log(`✅ Draft "${draft.title}" matched by legacy category: ${draft.category} -> ${mappedCategory} === ${category.id}`);
              return true;
            }
          }
          
          return false;
        });
        
        const count = matchingDrafts.length;
        console.log(`📈 Categoria "${category.name}" (${category.id}): ${count} drafts`);
        
        // Adicionar todas as categorias (mesmo com 0 obras para mostrar na UI)
        stats.push({
          name: category.name,
          count: count,
          icon: category.icon,
          gradient: [category.color, this.lightenColor(category.color, 20)],
          color: category.color
        });
      }
      
      console.log('✅ Estatísticas geradas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao gerar estatísticas de categorias:', error);
      return [{
        name: 'Todos',
        count: drafts.length,
        icon: 'library',
        gradient: ['#667EEA', '#764BA2'],
        color: '#667EEA'
      }];
    }
  }

  /**
   * Função utilitária para clarear uma cor
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Define ícone personalizado para categoria (compatibilidade)
   */
  async setCustomCategoryIcon(categoryName: string, icon: string, gradient: string[]): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      const category = categories.find(cat => cat.name === categoryName);
      
      if (!category) {
        throw new Error(`Categoria "${categoryName}" não encontrada`);
      }
      
      await this.updateCategory(category.id, {
        icon: icon,
        color: gradient[0] // Usar a primeira cor do gradiente
      });
      
      console.log(`✅ Ícone da categoria "${categoryName}" atualizado`);
    } catch (error) {
      console.error('❌ Erro ao definir ícone personalizado:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma categoria está sendo usada
   */
  async isCategoryInUse(id: string): Promise<boolean> {
    try {
      // Implementar quando integrar com DraftService
      // Por enquanto retorna false
      return false;
    } catch (error) {
      console.error('Erro ao verificar uso da categoria:', error);
      return false;
    }
  }

  /**
   * Mapeia categoria legacy para nova estrutura
   */
  mapLegacyCategory(legacyCategory: string): string {
    // Apenas mapear categorias padrão legacy para IDs padrão
    const legacyMapping: Record<string, string> = {
      'Poesia': 'poesia',
      'Soneto': 'soneto', 
      'Jogral': 'jogral',
    };
    
    console.log(`🔄 mapLegacyCategory: "${legacyCategory}" -> "${legacyMapping[legacyCategory] || 'not_mapped'}"`)
    
    // Se é uma categoria padrão legacy, mapear para o ID correspondente
    if (legacyMapping[legacyCategory]) {
      return legacyMapping[legacyCategory];
    }
    
    // Para categorias personalizadas (PL, PJ, etc), não mapear
    // Deixar que sejam tratadas pelo typeId
    return '';
  }

  /**
   * Obtém categoria padrão (fallback)
   */
  getDefaultCategory(): Category {
    return this.DEFAULT_CATEGORIES[0]; // Poesia
  }

  /**
   * Obtém o nome do tipo/categoria de um draft
   */
  async getTypeName(draft: { typeId?: string; category: string }): Promise<string> {
    try {
      // Se tem typeId, buscar a categoria por ID
      if (draft.typeId) {
        const category = await this.getCategoryById(draft.typeId);
        if (category) {
          return category.name;
        }
      }

      // Fallback para categoria legacy - mapear para nova estrutura
      const mappedId = this.mapLegacyCategory(draft.category);
      if (mappedId) {
        const category = await this.getCategoryById(mappedId);
        if (category) {
          return category.name;
        }
      }

      // Último fallback - retornar categoria legacy
      return draft.category;
    } catch (error) {
      console.error('Erro ao obter nome do tipo:', error);
      return draft.category; // Fallback para categoria legacy
    }
  }

  /**
   * Limpa o cache de categorias (força recarregamento na próxima consulta)
   */
  clearCache(): void {
    this.categoriesCache = null;
    this.isInitialized = false;
    console.log('🧹 CategoryService: Cache limpo');
  }
}

export const CategoryService = new CategoryServiceClass();
