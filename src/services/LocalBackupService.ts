// src/services/LocalBackupService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Draft } from './DraftService';

interface BackupMetadata {
  lastBackup: Date;
  totalDrafts: number;
  version: string;
}

export class LocalBackupService {
  private static readonly BACKUP_KEY = '@VersoEMusa:localBackup';
  private static readonly METADATA_KEY = '@VersoEMusa:backupMetadata';

  /**
   * Faz backup de todos os rascunhos localmente
   */
  static async backupAllDrafts(drafts: Draft[]): Promise<void> {
    try {
      console.log(`💾 Iniciando backup de ${drafts.length} rascunhos...`);

      // Salvar rascunhos
      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(drafts));

      // Salvar metadata
      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        totalDrafts: drafts.length,
        version: '1.0.0',
      };
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));

      Alert.alert(
        '✅ Backup Concluído',
        `${drafts.length} poema(s) foram salvos com sucesso!`,
        [{ text: 'OK' }]
      );

      console.log('✅ Backup local concluído!');
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      Alert.alert(
        '❌ Erro no Backup',
        'Não foi possível fazer backup dos seus poemas. Tente novamente.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  }

  /**
   * Restaura rascunhos do backup local
   */
  static async restoreAllDrafts(): Promise<Draft[]> {
    try {
      console.log('📥 Restaurando rascunhos do backup...');

      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      
      if (!backupJson) {
        Alert.alert(
          '⚠️ Backup Vazio',
          'Não há backup disponível para restaurar.',
          [{ text: 'OK' }]
        );
        return [];
      }

      const drafts: Draft[] = JSON.parse(backupJson);
      
      // Converter datas de string para Date
      const restoredDrafts = drafts.map(draft => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt),
      }));

      Alert.alert(
        '✅ Restauração Concluída',
        `${restoredDrafts.length} poema(s) foram restaurados!`,
        [{ text: 'OK' }]
      );

      console.log(`✅ ${restoredDrafts.length} rascunhos restaurados!`);
      return restoredDrafts;
    } catch (error) {
      console.error('❌ Erro ao restaurar:', error);
      Alert.alert(
        '❌ Erro na Restauração',
        'Não foi possível restaurar o backup. Os dados podem estar corrompidos.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  }

  /**
   * Backup automático de um único rascunho
   */
  static async backupSingleDraft(draft: Draft, showAlert: boolean = false): Promise<void> {
    try {
      // Pegar backup atual
      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      const drafts: Draft[] = backupJson ? JSON.parse(backupJson) : [];

      // Adicionar ou atualizar rascunho
      const existingIndex = drafts.findIndex(d => d.id === draft.id);
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft;
      } else {
        drafts.push(draft);
      }

      // Salvar
      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(drafts));

      // Atualizar metadata
      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        totalDrafts: drafts.length,
        version: '1.0.0',
      };
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));

      if (showAlert) {
        Alert.alert(
          '✅ Salvo',
          `Poema "${draft.title}" foi salvo com sucesso!`,
          [{ text: 'OK' }]
        );
      }

      console.log(`✅ Rascunho ${draft.id} salvo no backup`);
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);
      if (showAlert) {
        Alert.alert(
          '❌ Erro ao Salvar',
          'Não foi possível salvar o poema. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
      throw error;
    }
  }

  /**
   * Deleta um rascunho do backup
   */
  static async deleteDraftFromBackup(draftId: string, showAlert: boolean = true): Promise<void> {
    try {
      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      if (!backupJson) return;

      const drafts: Draft[] = JSON.parse(backupJson);
      const filtered = drafts.filter(d => d.id !== draftId);

      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(filtered));

      // Atualizar metadata
      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        totalDrafts: filtered.length,
        version: '1.0.0',
      };
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));

      if (showAlert) {
        Alert.alert(
          '✅ Deletado',
          'Poema foi removido do backup.',
          [{ text: 'OK' }]
        );
      }

      console.log(`🗑️ Rascunho ${draftId} deletado do backup`);
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      if (showAlert) {
        Alert.alert(
          '❌ Erro',
          'Não foi possível deletar o poema.',
          [{ text: 'OK' }]
        );
      }
      throw error;
    }
  }

  /**
   * Verifica se há backup disponível
   */
  static async hasBackup(): Promise<boolean> {
    try {
      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      return backupJson !== null;
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
      const metadataJson = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataJson) return null;

      const metadata: BackupMetadata = JSON.parse(metadataJson);
      return new Date(metadata.lastBackup);
    } catch (error) {
      console.error('❌ Erro ao obter data:', error);
      return null;
    }
  }

  /**
   * Obtém metadata do backup
   */
  static async getBackupMetadata(): Promise<BackupMetadata | null> {
    try {
      const metadataJson = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataJson) return null;

      const metadata: BackupMetadata = JSON.parse(metadataJson);
      return {
        ...metadata,
        lastBackup: new Date(metadata.lastBackup),
      };
    } catch (error) {
      console.error('❌ Erro ao obter metadata:', error);
      return null;
    }
  }

  /**
   * Limpa todo o backup (usar com cuidado!)
   */
  static async clearBackup(): Promise<void> {
    Alert.alert(
      '⚠️ Atenção',
      'Tem certeza que deseja limpar todo o backup? Esta ação não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(this.BACKUP_KEY);
              await AsyncStorage.removeItem(this.METADATA_KEY);
              
              Alert.alert(
                '✅ Backup Limpo',
                'Todo o backup foi removido.',
                [{ text: 'OK' }]
              );
              
              console.log('🗑️ Backup limpo');
            } catch (error) {
              console.error('❌ Erro ao limpar backup:', error);
              Alert.alert(
                '❌ Erro',
                'Não foi possível limpar o backup.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }

  /**
   * Exporta backup como JSON
   */
  static async exportBackupAsJson(): Promise<string> {
    try {
      const backupJson = await AsyncStorage.getItem(this.BACKUP_KEY);
      const metadataJson = await AsyncStorage.getItem(this.METADATA_KEY);

      if (!backupJson) {
        Alert.alert(
          '⚠️ Backup Vazio',
          'Não há dados para exportar.',
          [{ text: 'OK' }]
        );
        throw new Error('No backup data');
      }

      const exportData = {
        backup: JSON.parse(backupJson),
        metadata: metadataJson ? JSON.parse(metadataJson) : null,
        exportedAt: new Date().toISOString(),
      };

      Alert.alert(
        '✅ Pronto para Exportar',
        'Backup preparado com sucesso!',
        [{ text: 'OK' }]
      );

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Erro ao exportar:', error);
      Alert.alert(
        '❌ Erro na Exportação',
        'Não foi possível exportar o backup.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  }

  /**
   * Importa backup de JSON
   */
  static async importBackupFromJson(jsonString: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonString);
      
      if (!importData.backup || !Array.isArray(importData.backup)) {
        throw new Error('Invalid backup format');
      }

      await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(importData.backup));
      
      if (importData.metadata) {
        await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(importData.metadata));
      }

      Alert.alert(
        '✅ Importação Concluída',
        `${importData.backup.length} poema(s) foram importados!`,
        [{ text: 'OK' }]
      );

      console.log('✅ Backup importado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao importar:', error);
      Alert.alert(
        '❌ Erro na Importação',
        'Não foi possível importar o backup. Verifique se o arquivo está correto.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  }
}
