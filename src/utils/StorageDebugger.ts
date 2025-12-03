// src/utils/StorageDebugger.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleCache from './SimpleCache';

export class StorageDebugger {
  /**
   * Listar todas as chaves do AsyncStorage
   */
  static async listAllKeys(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('🗂️ Todas as chaves no AsyncStorage:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📄 ${key}:`, value ? `${value.substring(0, 100)}...` : 'null');
      }
    } catch (error) {
      console.error('❌ Erro ao listar chaves:', error);
    }
  }

  /**
   * Verificar especificamente os rascunhos
   */
  static async debugDrafts(): Promise<void> {
    try {
      console.log('\n� === DEBUG STORAGE DRAFTS ===');
      
      // 1. Verificar AsyncStorage
      const draftsJson = await AsyncStorage.getItem('@VersoEMusa:drafts');
      console.log('� AsyncStorage drafts:', draftsJson ? 'Dados existem' : 'Vazio');
      
      if (draftsJson) {
        try {
          const parsed = JSON.parse(draftsJson);
          console.log('📝 Drafts no storage:', Array.isArray(parsed) ? parsed.length : 'Dados inválidos');
          
          if (Array.isArray(parsed)) {
            parsed.forEach((draft, index) => {
              console.log(`   ${index + 1}. ID: ${draft.id}, Título: "${draft.title}"`);
            });
          }
        } catch (e) {
          console.log('❌ Erro ao parsear drafts do storage:', e);
        }
      }
      
      // 2. Verificar Cache
      const cachedDrafts = SimpleCache.get('all_drafts');
      console.log('💾 Cache drafts:', cachedDrafts ? `${cachedDrafts.length} itens` : 'Vazio');
      
      if (cachedDrafts && Array.isArray(cachedDrafts)) {
        cachedDrafts.forEach((draft, index) => {
          console.log(`   ${index + 1}. ID: ${draft.id}, Título: "${draft.title}"`);
        });
      }
      
      // 3. Verificar consistência
      const storageCount = draftsJson ? JSON.parse(draftsJson).length : 0;
      const cacheCount = cachedDrafts ? cachedDrafts.length : 0;
      
      if (storageCount !== cacheCount) {
        console.log('⚠️ INCONSISTÊNCIA: Storage tem', storageCount, 'mas cache tem', cacheCount);
      } else {
        console.log('✅ Storage e cache consistentes com', storageCount, 'drafts');
      }
      
      console.log('� === FIM DEBUG STORAGE ===\n');
    } catch (error) {
      console.error('❌ Erro no debug de rascunhos:', error);
    }
  }

  /**
   * Limpar dados corrompidos
   */
  static async cleanCorruptedData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        
        if (value === 'undefined' || value === 'null' || value === '') {
          console.log(`🧹 Removendo chave corrompida: ${key}`);
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }
  
  static async clearAllData() {
    console.log('🧹 Limpando todos os dados...');
    
    try {
      // Limpar AsyncStorage
      await AsyncStorage.removeItem('@VersoEMusa:drafts');
      console.log('✅ AsyncStorage limpo');
      
      // Limpar cache
      SimpleCache.delete('all_drafts');
      console.log('✅ Cache limpo');
      
      console.log('🎉 Todos os dados foram limpos!');
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }
  
  static async fixInconsistency() {
    console.log('🔧 Corrigindo inconsistências...');
    
    try {
      // Sempre usar dados do storage como fonte da verdade
      const draftsJson = await AsyncStorage.getItem('@VersoEMusa:drafts');
      
      if (draftsJson) {
        const parsed = JSON.parse(draftsJson);
        if (Array.isArray(parsed)) {
          SimpleCache.set('all_drafts', parsed, 30);
          console.log('✅ Cache sincronizado com storage');
        }
      } else {
        SimpleCache.delete('all_drafts');
        console.log('✅ Cache limpo (storage vazio)');
      }
      
    } catch (error) {
      console.error('❌ Erro ao corrigir inconsistências:', error);
    }
  }
}
