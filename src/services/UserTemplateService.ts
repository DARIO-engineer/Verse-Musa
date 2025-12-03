import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  createdAt: Date;
  usageCount: number;
  isFavorite: boolean;
  tags: string[];
}

export class UserTemplateService {
  private static readonly USER_TEMPLATES_KEY = 'muse_user_templates';

  /**
   * Cria um novo template personalizado
   */
  static async createTemplate(template: Omit<UserTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<string> {
    try {
      const templates = await this.getAllTemplates();
      const newTemplate: UserTemplate = {
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        usageCount: 0,
      };

      templates.push(newTemplate);
      await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
      
      console.log('✅ Template criado:', newTemplate.name);
      return newTemplate.id;
    } catch (error) {
      console.error('❌ Erro ao criar template:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os templates do usuário
   */
  static async getAllTemplates(): Promise<UserTemplate[]> {
    try {
      const stored = await AsyncStorage.getItem(this.USER_TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar templates:', error);
      return [];
    }
  }

  /**
   * Obtém templates por categoria
   */
  static async getTemplatesByCategory(categoryId: string): Promise<UserTemplate[]> {
    try {
      const templates = await this.getAllTemplates();
      return templates.filter(template => template.categoryId === categoryId);
    } catch (error) {
      console.error('❌ Erro ao carregar templates por categoria:', error);
      return [];
    }
  }

  /**
   * Obtém templates favoritos
   */
  static async getFavoriteTemplates(): Promise<UserTemplate[]> {
    try {
      const templates = await this.getAllTemplates();
      return templates.filter(template => template.isFavorite);
    } catch (error) {
      console.error('❌ Erro ao carregar templates favoritos:', error);
      return [];
    }
  }

  /**
   * Obtém templates mais usados
   */
  static async getMostUsedTemplates(limit: number = 10): Promise<UserTemplate[]> {
    try {
      const templates = await this.getAllTemplates();
      return templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Erro ao carregar templates mais usados:', error);
      return [];
    }
  }

  /**
   * Atualiza um template existente
   */
  static async updateTemplate(id: string, updates: Partial<UserTemplate>): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const index = templates.findIndex(template => template.id === id);
      
      if (index === -1) {
        throw new Error('Template não encontrado');
      }

      templates[index] = { ...templates[index], ...updates };
      await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
      
      console.log('✅ Template atualizado:', id);
    } catch (error) {
      console.error('❌ Erro ao atualizar template:', error);
      throw error;
    }
  }

  /**
   * Incrementa o contador de uso de um template
   */
  static async incrementUsage(id: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const template = templates.find(t => t.id === id);
      
      if (template) {
        template.usageCount += 1;
        await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
        console.log(`✅ Uso incrementado para template: ${template.name} (${template.usageCount} usos)`);
      }
    } catch (error) {
      console.error('❌ Erro ao incrementar uso do template:', error);
    }
  }

  /**
   * Marca/desmarca um template como favorito
   */
  static async toggleFavorite(id: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const template = templates.find(t => t.id === id);
      
      if (template) {
        template.isFavorite = !template.isFavorite;
        await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
        console.log(`✅ Template ${template.isFavorite ? 'marcado' : 'desmarcado'} como favorito: ${template.name}`);
      }
    } catch (error) {
      console.error('❌ Erro ao alterar favorito do template:', error);
      throw error;
    }
  }

  /**
   * Remove um template
   */
  static async deleteTemplate(id: string): Promise<void> {
    try {
      const templates = await this.getAllTemplates();
      const filteredTemplates = templates.filter(template => template.id !== id);
      await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
      
      console.log('✅ Template removido:', id);
    } catch (error) {
      console.error('❌ Erro ao remover template:', error);
      throw error;
    }
  }

  /**
   * Busca templates por texto
   */
  static async searchTemplates(query: string): Promise<UserTemplate[]> {
    try {
      const templates = await this.getAllTemplates();
      const lowerQuery = query.toLowerCase();
      
      return templates.filter(template =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        template.categoryName.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('❌ Erro ao buscar templates:', error);
      return [];
    }
  }

  /**
   * Obtém um template por ID
   */
  static async getTemplateById(id: string): Promise<UserTemplate | null> {
    try {
      const templates = await this.getAllTemplates();
      return templates.find(template => template.id === id) || null;
    } catch (error) {
      console.error('❌ Erro ao buscar template por ID:', error);
      return null;
    }
  }

  /**
   * Exporta todos os templates para backup
   */
  static async exportTemplates(): Promise<string> {
    try {
      const templates = await this.getAllTemplates();
      return JSON.stringify(templates, null, 2);
    } catch (error) {
      console.error('❌ Erro ao exportar templates:', error);
      throw error;
    }
  }

  /**
   * Importa templates de um backup
   */
  static async importTemplates(backupData: string, mergeWithExisting: boolean = true): Promise<void> {
    try {
      const importedTemplates: UserTemplate[] = JSON.parse(backupData);
      
      if (!Array.isArray(importedTemplates)) {
        throw new Error('Dados de backup inválidos');
      }

      let finalTemplates = importedTemplates;
      
      if (mergeWithExisting) {
        const existingTemplates = await this.getAllTemplates();
        const existingIds = new Set(existingTemplates.map(t => t.id));
        
        // Adiciona apenas templates que não existem
        const newTemplates = importedTemplates.filter(t => !existingIds.has(t.id));
        finalTemplates = [...existingTemplates, ...newTemplates];
      }

      await AsyncStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(finalTemplates));
      console.log(`✅ Templates importados: ${importedTemplates.length} templates`);
    } catch (error) {
      console.error('❌ Erro ao importar templates:', error);
      throw error;
    }
  }

  /**
   * Cria templates padrão iniciais
   */
  static async initializeDefaultTemplates(): Promise<void> {
    try {
      const existingTemplates = await this.getAllTemplates();
      
      // Se já existem templates, não criar os padrão
      if (existingTemplates.length > 0) {
        return;
      }

      const defaultTemplates: Omit<UserTemplate, 'id' | 'createdAt' | 'usageCount'>[] = [
        {
          name: 'Oração de Gratidão',
          description: 'Template para expressar gratidão ao Senhor pelas bênçãos recebidas',
          content: 'Senhor, meu Deus,\n\nNeste dia venho à Tua presença com um coração grato.\n\nObrigado(a) por [bênção específica]...\n\nReconheço que toda boa dádiva vem de Ti...\n\nAjuda-me a sempre lembrar de Tuas misericórdias...\n\nEm nome de Jesus, amém.',
          categoryId: 'default_oracao',
          categoryName: 'Oração',
          icon: 'heart-outline',
          color: '#10B981',
          isFavorite: true,
          tags: ['oração', 'gratidão', 'bênçãos', 'fé']
        },
        {
          name: 'Reflexão Bíblica',
          description: 'Para meditar sobre um versículo ou passagem das Escrituras',
          content: 'Versículo do dia: [inserir versículo]\n\nO que Deus está me ensinando através desta palavra...\n\nComo posso aplicar este ensinamento em minha vida...\n\nOração: Senhor, ajuda-me a viver segundo Tua palavra...\n\nPromessa que reclamo: ...',
          categoryId: 'default_reflexao',
          categoryName: 'Reflexão',
          icon: 'book-outline',
          color: '#6366F1',
          isFavorite: true,
          tags: ['bíblia', 'reflexão', 'versículo', 'meditação']
        },
        {
          name: 'Testemunho de Fé',
          description: 'Para compartilhar como Deus tem agido em sua vida',
          content: 'Em [data/período], Deus me ensinou que...\n\nA situação era...\n\nEu orei pedindo...\n\nDeus respondeu de forma...\n\nIsso fortaleceu minha fé porque...\n\nQuero glorificar o Senhor por...',
          categoryId: 'default_testemunho',
          categoryName: 'Testemunho',
          icon: 'star-outline',
          color: '#F59E0B',
          isFavorite: false,
          tags: ['testemunho', 'milagre', 'fé', 'glória']
        },
        {
          name: 'Louvor e Adoração',
          description: 'Template para expressar louvor e adoração ao Senhor',
          content: 'Aleluia! Cantarei ao Senhor porque...\n\nTeu nome é santo e digno de todo louvor...\n\nReconheço Tua majestade em...\n\nMeu coração se alegra porque Tu és...\n\nQuero Te adorar com...\n\nPara sempre cantarei Tuas maravilhas!',
          categoryId: 'default_louvor',
          categoryName: 'Louvor',
          icon: 'musical-notes-outline',
          color: '#8B5CF6',
          isFavorite: true,
          tags: ['louvor', 'adoração', 'cântico', 'alegria']
        }
      ];

      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }

      console.log('✅ Templates padrão inicializados');
    } catch (error) {
      console.error('❌ Erro ao inicializar templates padrão:', error);
    }
  }
}
