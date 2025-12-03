// src/services/CloudBackupService.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Draft } from './DraftService';
import { ErrorHandlingService } from './ErrorHandlingService';

interface BackupMetadata {
  lastBackup: Date;
  totalDrafts: number;
  deviceId: string;
  version: string;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retries: number;
}

export class CloudBackupService {
  private static firebaseApp: FirebaseApp | null = null;
  private static readonly SYNC_QUEUE_KEY = '@VersoEMusa:syncQueue';
  private static readonly LAST_SYNC_KEY = '@VersoEMusa:lastSync';
  private static readonly MAX_RETRIES = 3;
  private static isSyncing = false;

  /**
   * Inicializa Firebase com as credenciais do app.json
   */
  static async initialize(): Promise<void> {
    try {
      // Evitar múltiplas inicializações
      if (getApps().length > 0) {
        this.firebaseApp = getApps()[0];
        console.log('✅ Firebase já inicializado');
        return;
      }

      // Configuração do Firebase (já está no app.json extra)
      const firebaseConfig = {
        apiKey: "AIzaSyBq4jcP5Zgnjk7Gn5spSSrlbAb2e4JQU-M",
        authDomain: "verso-e-musa-b2976.firebaseapp.com",
        projectId: "verso-e-musa-b2976",
        storageBucket: "verso-e-musa-b2976.firebasestorage.app",
        messagingSenderId: "626922109603",
        appId: "1:626922109603:android:acd0e1b0673c664925dd16"
      };

      this.firebaseApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      ErrorHandlingService.handleError(error as Error, 'FIREBASE_INIT');
    }
  }

  /**
   * Obtém instância do Firestore
   */
  private static getFirestore() {
    if (!this.firebaseApp) {
      throw new Error('Firebase não inicializado. Chame initialize() primeiro.');
    }
    return getFirestore(this.firebaseApp);
  }

  /**
   * Gera ID único do dispositivo
   */
  private static async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('@VersoEMusa:deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('@VersoEMusa:deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Faz backup de todos os rascunhos na nuvem
   */
  static async backupAllDrafts(drafts: Draft[]): Promise<void> {
    try {
      await this.initialize();
      const db = this.getFirestore();
      const deviceId = await this.getDeviceId();

      console.log(`☁️ Iniciando backup de ${drafts.length} rascunhos...`);

      // Criar coleção para este dispositivo
      const backupRef = collection(db, 'backups', deviceId, 'drafts');

      // Backup de cada rascunho
      for (const draft of drafts) {
        const draftDoc = doc(backupRef, draft.id);
        await setDoc(draftDoc, {
          ...draft,
          updatedAt: Timestamp.fromDate(draft.updatedAt),
          createdAt: Timestamp.fromDate(draft.createdAt || draft.updatedAt),
          backedUpAt: Timestamp.now(),
        });
      }

      // Salvar metadata do backup
      const metadataRef = doc(db, 'backups', deviceId);
      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        totalDrafts: drafts.length,
        deviceId,
        version: '1.0.0',
      };
      await setDoc(metadataRef, {
        ...metadata,
        lastBackup: Timestamp.now(),
      });

      // Atualizar local
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());

      console.log('✅ Backup concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      ErrorHandlingService.handleError(error as Error, 'CLOUD_BACKUP');
      throw error;
    }
  }

  /**
   * Restaura rascunhos da nuvem
   */
  static async restoreAllDrafts(): Promise<Draft[]> {
    try {
      await this.initialize();
      const db = this.getFirestore();
      const deviceId = await this.getDeviceId();

      console.log('☁️ Restaurando rascunhos da nuvem...');

      const backupRef = collection(db, 'backups', deviceId, 'drafts');
      const querySnapshot = await getDocs(query(backupRef, orderBy('updatedAt', 'desc')));

      const drafts: Draft[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drafts.push({
          ...data,
          id: doc.id,
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Draft);
      });

      console.log(`✅ ${drafts.length} rascunhos restaurados!`);
      return drafts;
    } catch (error) {
      console.error('❌ Erro ao restaurar:', error);
      ErrorHandlingService.handleError(error as Error, 'CLOUD_RESTORE');
      throw error;
    }
  }

  /**
   * Backup automático de um único rascunho
   */
  static async backupSingleDraft(draft: Draft): Promise<void> {
    try {
      await this.initialize();
      const db = this.getFirestore();
      const deviceId = await this.getDeviceId();

      const draftDoc = doc(db, 'backups', deviceId, 'drafts', draft.id);
      await setDoc(draftDoc, {
        ...draft,
        updatedAt: Timestamp.fromDate(draft.updatedAt),
        createdAt: Timestamp.fromDate(draft.createdAt || draft.updatedAt),
        backedUpAt: Timestamp.now(),
      });

      console.log(`✅ Rascunho ${draft.id} salvo na nuvem`);
    } catch (error) {
      // Adicionar à fila de sincronização se falhar
      await this.addToSyncQueue({
        id: draft.id,
        type: 'create',
        data: draft,
        timestamp: new Date(),
        retries: 0,
      });
      console.warn('⚠️ Backup adicionado à fila de sincronização');
    }
  }

  /**
   * Deleta um rascunho da nuvem
   */
  static async deleteDraftFromCloud(draftId: string): Promise<void> {
    try {
      await this.initialize();
      const db = this.getFirestore();
      const deviceId = await this.getDeviceId();

      const draftDoc = doc(db, 'backups', deviceId, 'drafts', draftId);
      await deleteDoc(draftDoc);

      console.log(`🗑️ Rascunho ${draftId} deletado da nuvem`);
    } catch (error) {
      // Adicionar à fila de sincronização
      await this.addToSyncQueue({
        id: draftId,
        type: 'delete',
        data: null,
        timestamp: new Date(),
        retries: 0,
      });
      console.warn('⚠️ Deleção adicionada à fila de sincronização');
    }
  }

  /**
   * Adiciona item à fila de sincronização
   */
  private static async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
      
      // Evitar duplicatas
      const existingIndex = queue.findIndex(q => q.id === item.id && q.type === item.type);
      if (existingIndex >= 0) {
        queue[existingIndex] = item;
      } else {
        queue.push(item);
      }

      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('❌ Erro ao adicionar à fila:', error);
    }
  }

  /**
   * Processa fila de sincronização pendente
   */
  static async processSyncQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }

    try {
      this.isSyncing = true;
      const queueJson = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      if (!queueJson) return;

      const queue: SyncQueueItem[] = JSON.parse(queueJson);
      console.log(`🔄 Processando ${queue.length} itens na fila...`);

      const remainingQueue: SyncQueueItem[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'create' || item.type === 'update') {
            await this.backupSingleDraft(item.data);
          } else if (item.type === 'delete') {
            await this.deleteDraftFromCloud(item.id);
          }
        } catch (error) {
          // Se falhou e ainda tem tentativas, manter na fila
          if (item.retries < this.MAX_RETRIES) {
            remainingQueue.push({ ...item, retries: item.retries + 1 });
          } else {
            console.error(`❌ Item ${item.id} falhou após ${this.MAX_RETRIES} tentativas`);
          }
        }
      }

      // Atualizar fila
      if (remainingQueue.length > 0) {
        await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
        console.log(`⚠️ ${remainingQueue.length} itens ainda na fila`);
      } else {
        await AsyncStorage.removeItem(this.SYNC_QUEUE_KEY);
        console.log('✅ Fila de sincronização limpa!');
      }
    } catch (error) {
      console.error('❌ Erro ao processar fila:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Verifica se há backup disponível
   */
  static async hasBackup(): Promise<boolean> {
    try {
      await this.initialize();
      const db = this.getFirestore();
      const deviceId = await this.getDeviceId();

      const metadataRef = doc(db, 'backups', deviceId);
      const metadataDoc = await getDoc(metadataRef);

      return metadataDoc.exists();
    } catch (error) {
      console.error('❌ Erro ao verificar backup:', error);
      return false;
    }
  }

  /**
   * Obtém data do último backup
   */
  static async getLastBackupDate(): Promise<Date | null> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      return lastSyncStr ? new Date(lastSyncStr) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sincronização inteligente (merge local + cloud)
   */
  static async smartSync(localDrafts: Draft[]): Promise<Draft[]> {
    try {
      const cloudDrafts = await this.restoreAllDrafts();
      
      // Merge: prioriza versão mais recente
      const mergedMap = new Map<string, Draft>();

      // Adicionar locais
      localDrafts.forEach(draft => {
        mergedMap.set(draft.id, draft);
      });

      // Merge com cloud (prioriza mais recente)
      cloudDrafts.forEach(cloudDraft => {
        const localDraft = mergedMap.get(cloudDraft.id);
        if (!localDraft || cloudDraft.updatedAt > localDraft.updatedAt) {
          mergedMap.set(cloudDraft.id, cloudDraft);
        }
      });

      const mergedDrafts = Array.from(mergedMap.values());
      
      // Fazer backup da versão merged
      await this.backupAllDrafts(mergedDrafts);

      console.log(`🔄 Sincronização concluída: ${mergedDrafts.length} rascunhos`);
      return mergedDrafts;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }
}
