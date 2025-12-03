// src/services/DraftService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Draft {
  id: string;
  title: string;
  content: string;
  category: string; // Mudado para suportar categorias dinâmicas
  typeId?: string; // Campo para tipos personalizados
  templateId?: string; // ID do template padrão usado
  userTemplateId?: string; // ID do template do usuário usado
  theme?: string; // Tema da obra
  createdAt: Date;
  updatedAt: Date;
  isPublished?: boolean;
  editCount?: number; // Contador de edições
}

export class DraftService {
  private static readonly DRAFTS_KEY = '@VersoEMusa:drafts';

  // Gerar um ID único para o rascunho
  private static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Salvar um novo rascunho
  static async saveDraft(
    title: string, 
    content: string, 
    category: string, // Mudado para suportar categorias dinâmicas
    typeId?: string,
    templateId?: string,
    userTemplateId?: string,
    theme?: string
  ): Promise<string> {
    try {
      console.log('💾 Tentando salvar rascunho:', { title, category, typeId, contentLength: content.length });
      
      const drafts = await this.getAllDrafts();
      console.log('📝 Rascunhos existentes:', drafts.length);
      
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      
      // Verificar se já existe um rascunho com o mesmo título e conteúdo
      const duplicateExists = drafts.some(draft => 
        draft.title === trimmedTitle && 
        draft.content === trimmedContent &&
        draft.category === category
      );
      
      if (duplicateExists) {
        console.warn('⚠️ Tentativa de criar rascunho duplicado bloqueada');
        throw new Error('Um rascunho com este título e conteúdo já existe');
      }
      
      const newDraft: Draft = {
        id: this.generateId(),
        title: trimmedTitle,
        content: trimmedContent,
        category,
        typeId,
        templateId,
        userTemplateId,
        theme,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true // Obras são automaticamente "publicadas" quando salvas
      };
      
      const updatedDrafts = [...drafts, newDraft];
      await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(updatedDrafts));
      
      console.log('✅ Rascunho salvo com sucesso:', newDraft.id);
      
      // Verificar conquistas após salvar obra
      try {
        const { EnhancedAchievementService } = require('./EnhancedAchievementService');
        await EnhancedAchievementService.checkAndUpdateAchievements(
          'user_current', 
          'poem_created',
          { 
            category: category,
            wordCount: content.split(/\s+/).length
          }
        );
        console.log('🏆 Sistema de conquistas verificado após criar obra');
      } catch (achievementError) {
        console.warn('⚠️ Erro ao verificar conquistas:', achievementError);
        // Não falhar o salvamento por causa de erro nas conquistas
      }
      
      return newDraft.id;
    } catch (error: any) {
      console.error('❌ Erro ao salvar rascunho:', error);
      throw error;
    }
  }

  // Obter todos os rascunhos
  static async getAllDrafts(): Promise<Draft[]> {
    try {
      console.log('📋 Carregando rascunhos do AsyncStorage...');
      const data = await AsyncStorage.getItem(this.DRAFTS_KEY);
      
      if (!data) {
        console.log('📋 Nenhum rascunho encontrado');
        return [];
      }

      const drafts = JSON.parse(data) as Draft[];
      
      // Converter datas de string para Date
      const convertedDrafts = drafts.map(draft => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt)
      }));
      
      console.log(`📋 ${convertedDrafts.length} rascunhos carregados`);
      return convertedDrafts;
    } catch (error) {
      console.error('❌ Erro ao obter rascunhos:', error);
      return [];
    }
  }

  // Obter rascunho por ID
  static async getDraftById(id: string): Promise<Draft | null> {
    try {
      const drafts = await this.getAllDrafts();
      const draft = drafts.find(d => d.id === id);
      
      if (!draft) {
        console.log('❌ Rascunho não encontrado:', id);
        return null;
      }
      
      console.log('✅ Rascunho encontrado:', draft.title);
      return draft;
    } catch (error) {
      console.error('❌ Erro ao obter rascunho por ID:', error);
      return null;
    }
  }

  // Atualizar um rascunho existente
  static async updateDraft(
    id: string, 
    title: string, 
    content: string, 
    category: string, // Mudado para suportar categorias dinâmicas
    typeId?: string,
    templateId?: string,
    userTemplateId?: string,
    theme?: string
  ): Promise<void> {
    try {
      console.log('✏️ Atualizando rascunho:', id);
      const drafts = await this.getAllDrafts();
      const draftIndex = drafts.findIndex(draft => draft.id === id);
      
      if (draftIndex === -1) {
        console.log('❌ Rascunho não encontrado para atualizar:', id);
        throw new Error('Rascunho não encontrado');
      }
      
      console.log('🔍 Rascunhos disponíveis:', drafts.map(d => d.id));
      
      drafts[draftIndex] = {
        ...drafts[draftIndex],
        title: title.trim(),
        content: content.trim(),
        category,
        typeId,
        templateId,
        userTemplateId,
        theme,
        updatedAt: new Date(),
        editCount: (drafts[draftIndex].editCount || 0) + 1, // Incrementa o contador
      };
      
      await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(drafts));
      
      console.log('✅ Rascunho atualizado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar rascunho:', error);
      throw error;
    }
  }

  // Excluir um rascunho
  static async deleteDraft(id: string): Promise<void> {
    try {
      console.log('🗑️ Excluindo rascunho:', id);
      const drafts = await this.getAllDrafts();
      const draftToDelete = drafts.find(draft => draft.id === id);
      const filteredDrafts = drafts.filter(draft => draft.id !== id);
      
      if (drafts.length === filteredDrafts.length) {
        console.log('❌ Rascunho não encontrado para exclusão:', id);
        throw new Error('Rascunho não encontrado');
      }
      
      await AsyncStorage.setItem(this.DRAFTS_KEY, JSON.stringify(filteredDrafts));
      
      // Notificar o sistema de conquistas sobre a exclusão
      if (draftToDelete) {
        try {
          const { EnhancedAchievementService } = require('./EnhancedAchievementService');
          await EnhancedAchievementService.handleDraftDeletion(draftToDelete);
        } catch (achievementError) {
          console.warn('⚠️ Erro ao processar exclusão de rascunho para conquistas:', achievementError);
          // Não falhar a exclusão por causa de erro nas conquistas
        }
      }
      
      console.log('✅ Rascunho excluído com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao excluir rascunho:', error);
      throw error;
    }
  }

  // Obter rascunhos por categoria
  static async getDraftsByCategory(category: string): Promise<Draft[]> {
    try {
      const drafts = await this.getAllDrafts();
      return drafts.filter(draft => draft.category === category);
    } catch (error) {
      console.error('❌ Erro ao obter rascunhos por categoria:', error);
      return [];
    }
  }

  // Contar total de rascunhos
  static async getTotalDrafts(): Promise<number> {
    try {
      const drafts = await this.getAllDrafts();
      return drafts.length;
    } catch (error) {
      console.error('❌ Erro ao contar rascunhos:', error);
      return 0;
    }
  }

  // Limpar todos os rascunhos (usar com cuidado!)
  static async clearAllDrafts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.DRAFTS_KEY);
      
      // Limpar também todas as conquistas incorretas
      try {
        const { EnhancedAchievementService } = require('./EnhancedAchievementService');
        await EnhancedAchievementService.clearAllAchievements();
        console.log('🧹 Conquistas limpas junto com os rascunhos');
      } catch (achievementError) {
        console.warn('⚠️ Erro ao limpar conquistas:', achievementError);
      }
      
      console.log('🧹 Todos os rascunhos foram removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar rascunhos:', error);
      throw error;
    }
  }
}