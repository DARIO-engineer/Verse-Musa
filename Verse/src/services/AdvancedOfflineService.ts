// src/services/AdvancedOfflineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo, { NetInfoState } from '@react-native-netinfo'; // Dependência não instalada
import { AppState, AppStateStatus } from 'react-native';

export interface SyncItem {
  id: string;
  type: 'draft' | 'profile' | 'settings' | 'achievement';
  data: any;
  lastModified: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
  priority: 'low' | 'medium' | 'high';
}

export interface CacheItem {
  key: string;
  data: any;
  timestamp: string;
  ttl: number; // time to live em segundos
  size: number; // tamanho em bytes
  accessCount: number;
  lastAccessed: string;
}

export interface OfflineSettings {
  autoSync: boolean;
  syncOnWifiOnly: boolean;
  maxCacheSize: number; // em MB
  maxRetryAttempts: number;
  syncInterval: number; // em minutos
  lowPowerMode: boolean;
  backgroundSync: boolean;
}

export interface BackupData {
  id: string;
  timestamp: string;
  version: string;
  data: {
    drafts: any[];
    profile: any;
    settings: any;
    achievements: any[];
  };
  size: number;
  checksum: string;
}

class AdvancedOfflineService {
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private readonly CACHE_KEY = 'advanced_cache';
  private readonly OFFLINE_SETTINGS_KEY = 'offline_settings';
  private readonly BACKUP_KEY = 'local_backup';
  
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private appState: AppStateStatus = 'active';
  
  private defaultSettings: OfflineSettings = {
    autoSync: true,
    syncOnWifiOnly: false,
    maxCacheSize: 50, // 50MB
    maxRetryAttempts: 3,
    syncInterval: 15, // 15 minutos
    lowPowerMode: false,
    backgroundSync: true
  };

  constructor() {
    this.initializeNetworkMonitoring();
    this.initializeAppStateMonitoring();
    this.startPeriodicSync();
  }

  // Inicializar monitoramento de rede (simplificado)
  private initializeNetworkMonitoring(): void {
    // Assumir que está online por padrão
    // Em uma implementação real, você instalaria @react-native-netinfo
    this.isOnline = true;
    console.log('📶 Monitoramento de rede simplificado ativo');
  }

  // Monitorar estado do app
  private initializeAppStateMonitoring(): void {
    AppState.addEventListener('change', (nextAppState) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App voltou ao primeiro plano');
        this.processSyncQueue();
      }
      this.appState = nextAppState;
    });
  }

  // Sincronização periódica
  private async startPeriodicSync(): Promise<void> {
    const settings = await this.getOfflineSettings();
    
    if (settings.autoSync) {
      setInterval(async () => {
        if (this.isOnline && !this.syncInProgress) {
          await this.processSyncQueue();
        }
      }, settings.syncInterval * 60 * 1000);
    }
  }

  // Adicionar item à fila de sincronização
  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'syncStatus' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const newItem: SyncItem = {
        ...item,
        id: Date.now().toString(),
        syncStatus: 'pending',
        retryCount: 0
      };
      
      // Verificar se já existe item similar
      const existingIndex = queue.findIndex(
        queueItem => queueItem.type === item.type && 
        JSON.stringify(queueItem.data) === JSON.stringify(item.data)
      );
      
      if (existingIndex !== -1) {
        queue[existingIndex] = newItem;
      } else {
        queue.push(newItem);
      }
      
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log('📤 Item adicionado à fila de sincronização:', newItem.type);
      
      // Tentar sincronizar imediatamente se online
      if (this.isOnline) {
        this.processSyncQueue();
      }
    } catch (error) {
      console.error('Erro ao adicionar à fila de sync:', error);
    }
  }

  // Processar fila de sincronização
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    try {
      this.syncInProgress = true;
      const queue = await this.getSyncQueue();
      const settings = await this.getOfflineSettings();
      
      // Filtrar itens que precisam ser sincronizados
      const pendingItems = queue.filter(item => 
        item.syncStatus === 'pending' || 
        (item.syncStatus === 'error' && item.retryCount < settings.maxRetryAttempts)
      );

      if (pendingItems.length === 0) {
        this.syncInProgress = false;
        return;
      }

      console.log(`🔄 Sincronizando ${pendingItems.length} itens...`);

      // Ordenar por prioridade
      pendingItems.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Processar itens
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          
          // Atualizar status na fila
          const updatedQueue = await this.getSyncQueue();
          const itemIndex = updatedQueue.findIndex(q => q.id === item.id);
          if (itemIndex !== -1) {
            updatedQueue[itemIndex].syncStatus = 'synced';
            updatedQueue[itemIndex].lastModified = new Date().toISOString();
          }
          await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
          
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
          
          // Atualizar contagem de retry
          const updatedQueue = await this.getSyncQueue();
          const itemIndex = updatedQueue.findIndex(q => q.id === item.id);
          if (itemIndex !== -1) {
            updatedQueue[itemIndex].syncStatus = 'error';
            updatedQueue[itemIndex].retryCount++;
          }
          await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
        }
      }

      // Limpar itens sincronizados antigos
      await this.cleanupSyncQueue();
      
    } catch (error) {
      console.error('Erro ao processar fila de sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sincronizar item individual
  private async syncItem(item: SyncItem): Promise<void> {
    // Simular sincronização (aqui você implementaria a lógica real)
    console.log(`🔄 Sincronizando ${item.type}:`, item.id);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular falha ocasional
    if (Math.random() < 0.1) {
      throw new Error('Falha na sincronização');
    }
    
    console.log(`✅ ${item.type} sincronizado com sucesso`);
  }

  // Cache inteligente
  async setCache(key: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      const cache = await this.getCache();
      const settings = await this.getOfflineSettings();
      
      const dataString = JSON.stringify(data);
      const size = new Blob([dataString]).size;
      
      // Verificar limite de cache
      const totalSize = this.calculateCacheSize(cache);
      const maxSizeBytes = settings.maxCacheSize * 1024 * 1024;
      
      if (totalSize + size > maxSizeBytes) {
        await this.evictCache(size);
      }
      
      const cacheItem: CacheItem = {
        key,
        data,
        timestamp: new Date().toISOString(),
        ttl,
        size,
        accessCount: 0,
        lastAccessed: new Date().toISOString()
      };
      
      cache[key] = cacheItem;
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      
      console.log(`💾 Cache atualizado: ${key} (${size} bytes)`);
    } catch (error) {
      console.error('Erro ao definir cache:', error);
    }
  }

  async getCache(key?: string): Promise<any> {
    try {
      const cacheData = await AsyncStorage.getItem(this.CACHE_KEY);
      const cache = cacheData ? JSON.parse(cacheData) : {};
      
      if (key) {
        const item = cache[key];
        if (!item) return null;
        
        // Verificar TTL
        const now = new Date().getTime();
        const itemTime = new Date(item.timestamp).getTime();
        const ageInSeconds = (now - itemTime) / 1000;
        
        if (ageInSeconds > item.ttl) {
          delete cache[key];
          await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
          return null;
        }
        
        // Atualizar estatísticas de acesso
        item.accessCount++;
        item.lastAccessed = new Date().toISOString();
        cache[key] = item;
        await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        
        return item.data;
      }
      
      return cache;
    } catch (error) {
      console.error('Erro ao obter cache:', error);
      return key ? null : {};
    }
  }

  // Eviction de cache (LRU + tamanho)
  private async evictCache(requiredSpace: number): Promise<void> {
    try {
      const cache = await this.getCache();
      const items = Object.values(cache) as CacheItem[];
      
      // Ordenar por último acesso (LRU)
      items.sort((a, b) => 
        new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
      );
      
      let freedSpace = 0;
      const keysToRemove: string[] = [];
      
      for (const item of items) {
        keysToRemove.push(item.key);
        freedSpace += item.size;
        
        if (freedSpace >= requiredSpace) {
          break;
        }
      }
      
      // Remover itens
      for (const key of keysToRemove) {
        delete cache[key];
      }
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log(`🗑️ Cache eviction: ${keysToRemove.length} itens removidos (${freedSpace} bytes)`);
    } catch (error) {
      console.error('Erro na eviction de cache:', error);
    }
  }

  // Backup automático local
  async createLocalBackup(): Promise<string> {
    try {
      console.log('💾 Criando backup local...');
      
      // Coletar dados
      const draftsData = await AsyncStorage.getItem('drafts') || '[]';
      const profileData = await AsyncStorage.getItem('app_profile') || '{}';
      const settingsData = await AsyncStorage.getItem('app_settings') || '{}';
      const achievementsData = await AsyncStorage.getItem('achievements') || '[]';
      
      const backupData: BackupData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          drafts: JSON.parse(draftsData),
          profile: JSON.parse(profileData),
          settings: JSON.parse(settingsData),
          achievements: JSON.parse(achievementsData)
        },
        size: 0,
        checksum: ''
      };
      
      const backupString = JSON.stringify(backupData);
      backupData.size = new Blob([backupString]).size;
      backupData.checksum = this.generateChecksum(backupString);
      
      // Salvar backup
      const backups = await this.getLocalBackups();
      backups.push(backupData);
      
      // Manter apenas os 5 backups mais recentes
      backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recentBackups = backups.slice(0, 5);
      
      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(recentBackups));
      
      console.log(`✅ Backup criado: ${backupData.id} (${backupData.size} bytes)`);
      return backupData.id;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backups = await this.getLocalBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error('Backup não encontrado');
      }
      
      console.log('🔄 Restaurando backup:', backupId);
      
      // Verificar integridade
      const backupString = JSON.stringify(backup);
      const currentChecksum = this.generateChecksum(backupString);
      
      if (currentChecksum !== backup.checksum) {
        throw new Error('Backup corrompido');
      }
      
      // Restaurar dados
      await AsyncStorage.setItem('drafts', JSON.stringify(backup.data.drafts));
      await AsyncStorage.setItem('app_profile', JSON.stringify(backup.data.profile));
      await AsyncStorage.setItem('app_settings', JSON.stringify(backup.data.settings));
      await AsyncStorage.setItem('achievements', JSON.stringify(backup.data.achievements));
      
      console.log('✅ Backup restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  // Métodos auxiliares
  private async getSyncQueue(): Promise<SyncItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter fila de sync:', error);
      return [];
    }
  }

  private async cleanupSyncQueue(): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const cleanQueue = queue.filter(item => 
        item.syncStatus !== 'synced' || 
        new Date(item.lastModified) > oneDayAgo
      );
      
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(cleanQueue));
    } catch (error) {
      console.error('Erro ao limpar fila de sync:', error);
    }
  }

  private calculateCacheSize(cache: { [key: string]: CacheItem }): number {
    return Object.values(cache).reduce((total, item) => total + item.size, 0);
  }

  private async getLocalBackups(): Promise<BackupData[]> {
    try {
      const data = await AsyncStorage.getItem(this.BACKUP_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter backups:', error);
      return [];
    }
  }

  private generateChecksum(data: string): string {
    // Implementação simples de checksum
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  async getOfflineSettings(): Promise<OfflineSettings> {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_SETTINGS_KEY);
      const settings = data ? JSON.parse(data) : {};
      return { ...this.defaultSettings, ...settings };
    } catch (error) {
      console.error('Erro ao obter configurações offline:', error);
      return this.defaultSettings;
    }
  }

  async updateOfflineSettings(settings: Partial<OfflineSettings>): Promise<void> {
    try {
      const currentSettings = await this.getOfflineSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.OFFLINE_SETTINGS_KEY, JSON.stringify(newSettings));
      console.log('⚙️ Configurações offline atualizadas');
    } catch (error) {
      console.error('Erro ao atualizar configurações offline:', error);
    }
  }

  // Status do serviço
  getStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    queueSize: number;
    cacheSize: number;
  } {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueSize: 0, // Será atualizado dinamicamente
      cacheSize: 0  // Será atualizado dinamicamente
    };
  }
}

export default new AdvancedOfflineService();
