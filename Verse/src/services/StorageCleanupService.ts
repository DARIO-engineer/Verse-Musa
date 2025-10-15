// src/services/StorageCleanupService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JsonUtils } from '../utils/JsonUtils';

export class StorageCleanupService {  // Chaves conhecidas do storage
  private static readonly KNOWN_KEYS = [
    '@VersoEMusa:drafts',
    '@VersoEMusa:profile',
    '@VersoEMusa:profilePhoto',
    '@VersoEMusa:writingStats',
    '@VersoEMusa:dailyActivity',
    '@VersoEMusa:achievementProgress',
  ];

  // Limpar dados corrompidos do storage
  static async cleanCorruptedData(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpeza de dados corrompidos...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      let cleanedCount = 0;

      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          
          // Verificar se o valor está corrompido
          if (this.isCorruptedValue(value)) {
            console.log(`🗑️ Removendo chave corrompida: ${key}`);
            await AsyncStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao verificar chave ${key}:`, error);
          // Se há erro ao ler, provavelmente está corrompido
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }

      console.log(`✅ Limpeza concluída. ${cleanedCount} itens removidos.`);
    } catch (error) {
      console.error('❌ Erro durante limpeza do storage:', error);
    }
  }

  // Verificar se um valor está corrompido
  private static isCorruptedValue(value: string | null): boolean {
    if (!value) return false;
    
    // Usar JsonUtils para verificação mais robusta
    return !JsonUtils.isValidJson(value) && 
           (value === 'undefined' || 
            value === 'null' || 
            value === '' || 
            value === 'NaN' ||
            value.trim() === 'undefined' || 
            value.trim() === 'null');
  }

  // Inicializar storage com valores padrão
  static async initializeDefaultData(): Promise<void> {
    try {
      console.log('🔧 Inicializando dados padrão...');      // Verificar e inicializar drafts
      const draftsData = await AsyncStorage.getItem('@VersoEMusa:drafts');
      if (!draftsData || this.isCorruptedValue(draftsData)) {
        await AsyncStorage.setItem('@VersoEMusa:drafts', JSON.stringify([]));
        console.log('✅ Drafts inicializados');
      }

      // Verificar e inicializar achievement progress
      const achievementData = await AsyncStorage.getItem('@VersoEMusa:achievementProgress');
      if (!achievementData || this.isCorruptedValue(achievementData)) {
        await AsyncStorage.setItem('@VersoEMusa:achievementProgress', JSON.stringify([]));
        console.log('✅ Achievement progress inicializado');
      }

      console.log('✅ Inicialização concluída');
    } catch (error) {
      console.error('❌ Erro durante inicialização:', error);
    }
  }

  // Fazer limpeza completa e reinicialização
  static async fullCleanup(): Promise<void> {
    await this.cleanCorruptedData();
    await this.initializeDefaultData();
  }

  // Verificar saúde do storage
  static async checkStorageHealth(): Promise<boolean> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      let corruptedCount = 0;

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (this.isCorruptedValue(value)) {
          corruptedCount++;
        }
      }

      const isHealthy = corruptedCount === 0;
      console.log(`📊 Storage health: ${isHealthy ? '✅ Saudável' : `⚠️ ${corruptedCount} itens corrompidos`}`);
      
      return isHealthy;
    } catch (error) {
      console.error('❌ Erro ao verificar saúde do storage:', error);
      return false;
    }
  }
}
