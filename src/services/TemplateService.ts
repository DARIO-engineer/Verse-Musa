import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftService } from './DraftService';

interface TemplateUsage {
  templateId: string;
  templateName: string;
  usageCount: number;
  lastUsed: string;
  firstUsed: string;
}

const TEMPLATE_USAGE_KEY = '@verse_musa_template_usage';

export class TemplateService {
  
  /**
   * Registra o uso de um template
   */
  static async recordTemplateUsage(templateId: string, templateName: string): Promise<void> {
    try {
      const usageData = await this.getTemplateUsage();
      const now = new Date().toISOString();
      
      const existingIndex = usageData.findIndex(item => item.templateId === templateId);
      
      if (existingIndex >= 0) {
        // Template já usado, incrementar contador
        usageData[existingIndex].usageCount += 1;
        usageData[existingIndex].lastUsed = now;
      } else {
        // Primeiro uso do template
        usageData.push({
          templateId,
          templateName,
          usageCount: 1,
          lastUsed: now,
          firstUsed: now
        });
      }
      
      await AsyncStorage.setItem(TEMPLATE_USAGE_KEY, JSON.stringify(usageData));
      console.log(`📋 Template registrado: ${templateName} (${templateId})`);
      
    } catch (error) {
      console.error('❌ Erro ao registrar uso de template:', error);
    }
  }

  /**
   * Obtém dados de uso de templates
   */
  static async getTemplateUsage(): Promise<TemplateUsage[]> {
    try {
      const stored = await AsyncStorage.getItem(TEMPLATE_USAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Erro ao obter dados de templates:', error);
      return [];
    }
  }

  /**
   * Conta quantos templates diferentes foram usados
   */
  static async getUniqueTemplatesUsed(): Promise<number> {
    try {
      const usageData = await this.getTemplateUsage();
      return usageData.length;
    } catch (error) {
      console.error('❌ Erro ao contar templates únicos:', error);
      return 0;
    }
  }

  /**
   * Conta quantas obras foram criadas com um template específico
   */
  static async getTemplateWorksCount(templateId: string): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts) return 0;

      // Contar obras que usaram este template
      const templateWorks = drafts.filter(draft => {
        if (!draft) return false;
        
        // Verificar se o draft tem referência ao template
        return draft.templateId === templateId || 
               draft.userTemplateId === templateId ||
               (draft.category && draft.category.includes(templateId));
      });

      console.log(`📋 Obras com template ${templateId}: ${templateWorks.length}`);
      return templateWorks.length;
      
    } catch (error) {
      console.error('❌ Erro ao contar obras por template:', error);
      return 0;
    }
  }

  /**
   * Conta total de obras criadas com qualquer template
   */
  static async getTotalTemplateWorks(): Promise<number> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts) return 0;

      // Contar obras que têm alguma referência a template
      const templateWorks = drafts.filter(draft => {
        if (!draft) return false;
        
        return draft.templateId || 
               draft.userTemplateId || 
               (draft.category && draft.category !== 'Personalizado' && draft.category !== 'Livre');
      });

      console.log(`📋 Total de obras com templates: ${templateWorks.length}`);
      return templateWorks.length;
      
    } catch (error) {
      console.error('❌ Erro ao contar total de obras com templates:', error);
      return 0;
    }
  }

  /**
   * Verifica se alguma obra foi criada com templates específicos conhecidos
   */
  static async checkSpecificTemplateUsage(): Promise<{
    poesiaLivre: number;
    soneto: number;
    haiku: number;
    versoLivre: number;
    total: number;
  }> {
    try {
      const drafts = await DraftService.getAllDrafts();
      if (!drafts) return { poesiaLivre: 0, soneto: 0, haiku: 0, versoLivre: 0, total: 0 };

      let poesiaLivre = 0;
      let soneto = 0;
      let haiku = 0;
      let versoLivre = 0;

      drafts.forEach(draft => {
        if (!draft) return;
        
        const category = (draft.category || '').toLowerCase();
        const templateId = (draft.templateId || '').toLowerCase();
        const userTemplateId = (draft.userTemplateId || '').toLowerCase();
        
        // Verificar diferentes formas de identificar templates
        if (category.includes('poesia') || templateId.includes('poesia') || 
            userTemplateId.includes('poesia')) {
          poesiaLivre++;
        }
        
        if (category.includes('soneto') || templateId.includes('soneto') || 
            userTemplateId.includes('soneto')) {
          soneto++;
        }
        
        if (category.includes('haiku') || templateId.includes('haiku') || 
            userTemplateId.includes('haiku')) {
          haiku++;
        }
        
        if (category.includes('verso') || templateId.includes('verso') || 
            userTemplateId.includes('verso')) {
          versoLivre++;
        }
      });

      const total = poesiaLivre + soneto + haiku + versoLivre;
      
      console.log('📋 Templates específicos encontrados:', {
        poesiaLivre, soneto, haiku, versoLivre, total
      });
      
      return { poesiaLivre, soneto, haiku, versoLivre, total };
      
    } catch (error) {
      console.error('❌ Erro ao verificar templates específicos:', error);
      return { poesiaLivre: 0, soneto: 0, haiku: 0, versoLivre: 0, total: 0 };
    }
  }

  /**
   * Reset dos dados de templates
   */
  static async resetTemplateData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TEMPLATE_USAGE_KEY);
      console.log('🔄 Dados de templates resetados');
    } catch (error) {
      console.error('❌ Erro ao resetar dados de templates:', error);
    }
  }

  /**
   * Detecta template baseado no conteúdo/categoria da obra
   */
  static detectTemplateFromDraft(draft: any): string | null {
    if (!draft) return null;

    const category = (draft.category || '').toLowerCase();
    const templateId = (draft.templateId || '').toLowerCase();
    const content = (draft.content || '').toLowerCase();
    
    // Detectar soneto (14 versos)
    if (category.includes('soneto') || templateId.includes('soneto')) {
      return 'soneto';
    }
    
    // Detectar haiku (3 versos curtos)
    if (category.includes('haiku') || templateId.includes('haiku') || 
        (content.split('\n').length === 3 && content.length < 100)) {
      return 'haiku';
    }
    
    // Detectar poesia livre
    if (category.includes('poesia') || templateId.includes('poesia')) {
      return 'poesia_livre';
    }
    
    // Detectar verso livre
    if (category.includes('verso') || templateId.includes('verso')) {
      return 'verso_livre';
    }
    
    return null;
  }
}
