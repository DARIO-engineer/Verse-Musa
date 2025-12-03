import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Script para limpar categorias problemáticas que não conseguem ser apagadas
 */
export class CategoryCleanupService {
  private static readonly STORAGE_KEY = '@Muse_Categories';
  
  /**
   * Lista todas as categorias armazenadas
   */
  static async debugCategories() {
    try {
      console.log('🔍 === DEBUG CATEGORIAS ===');
      
      // Buscar todas as chaves do AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('📋 Todas as chaves:', allKeys);
      
      // Buscar especificamente as categorias
      const categoriesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (categoriesJson) {
        const categories = JSON.parse(categoriesJson);
        console.log('📁 Total de categorias encontradas:', categories.length);
        
        categories.forEach((cat: any, index: number) => {
          console.log(`${index + 1}. ${cat.name} (${cat.id}) - Default: ${cat.isDefault}`);
        });
        
        // Buscar categorias personalizadas
        const customCategories = categories.filter((cat: any) => !cat.isDefault);
        console.log('🔧 Categorias personalizadas:', customCategories.length);
        customCategories.forEach((cat: any) => {
          console.log(`   - ${cat.name} (${cat.id})`);
        });
        
        return categories;
      } else {
        console.log('❌ Nenhuma categoria encontrada no AsyncStorage');
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao debug categorias:', error);
      return [];
    }
  }
  
  /**
   * Remove categorias específicas pelo nome
   */
  static async removeSpecificCategories(categoryNames: string[]) {
    try {
      console.log('🗑️ Removendo categorias:', categoryNames);
      
      const categoriesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!categoriesJson) {
        console.log('❌ Nenhuma categoria encontrada');
        return false;
      }
      
      const categories = JSON.parse(categoriesJson);
      console.log('📋 Categorias antes da limpeza:', categories.length);
      
      // Filtrar removendo as categorias especificadas
      const filteredCategories = categories.filter((cat: any) => {
        const shouldKeep = !categoryNames.includes(cat.name.toLowerCase());
        if (!shouldKeep) {
          console.log(`🗑️ Removendo: ${cat.name} (${cat.id})`);
        }
        return shouldKeep;
      });
      
      console.log('📋 Categorias após limpeza:', filteredCategories.length);
      
      // Salvar categorias limpas
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCategories));
      
      console.log('✅ Limpeza concluída com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover categorias:', error);
      return false;
    }
  }
  
  /**
   * Remove todas as categorias personalizadas (não padrão)
   */
  static async removeAllCustomCategories() {
    try {
      console.log('🗑️ Removendo TODAS as categorias personalizadas...');
      
      const categoriesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!categoriesJson) {
        console.log('❌ Nenhuma categoria encontrada');
        return false;
      }
      
      const categories = JSON.parse(categoriesJson);
      console.log('📋 Total de categorias:', categories.length);
      
      // Manter apenas categorias padrão
      const defaultCategories = categories.filter((cat: any) => cat.isDefault === true);
      
      console.log('📋 Categorias padrão mantidas:', defaultCategories.length);
      console.log('🗑️ Categorias personalizadas removidas:', categories.length - defaultCategories.length);
      
      // Salvar apenas as categorias padrão
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultCategories));
      
      console.log('✅ Todas as categorias personalizadas foram removidas!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover categorias personalizadas:', error);
      return false;
    }
  }
  
  /**
   * Reseta completamente as categorias para os valores padrão
   */
  static async resetToDefaults() {
    try {
      console.log('🔄 Resetando categorias para padrões...');
      
      const defaultCategories = [
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
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultCategories));
      
      console.log('✅ Categorias resetadas para os padrões!');
      console.log('📋 Categorias padrão:', defaultCategories.map(c => c.name));
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar categorias:', error);
      return false;
    }
  }
}

// Funções auxiliares para uso no console
export const debugCategories = () => CategoryCleanupService.debugCategories();
export const removeCategories = (names: string[]) => CategoryCleanupService.removeSpecificCategories(names);
export const removeAllCustom = () => CategoryCleanupService.removeAllCustomCategories();
export const resetCategories = () => CategoryCleanupService.resetToDefaults();
