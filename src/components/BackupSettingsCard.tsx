// src/components/BackupSettingsCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalBackupService } from '../services/LocalBackupService';
import { useDrafts } from '../contexts/DraftsContext';

export const BackupSettingsCard: React.FC = () => {
  const { drafts, setDrafts } = useDrafts();
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [hasCloudBackup, setHasCloudBackup] = useState(false);

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const lastDate = await LocalBackupService.getLastBackupDate();
      setLastBackup(lastDate);

      const hasBackup = await LocalBackupService.hasBackup();
      setHasCloudBackup(hasBackup);
    } catch (error) {
      console.error('Erro ao carregar info de backup:', error);
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      await LocalBackupService.backupAllDrafts(drafts);
      await loadBackupInfo();
    } catch (error) {
      console.error('Erro no backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      '⚠️ Restaurar Backup',
      'Isso irá substituir seus poemas locais pelos do backup. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            try {
              setLoading(true);
              const restoredDrafts = await LocalBackupService.restoreAllDrafts();
              if (restoredDrafts.length > 0) {
                setDrafts(restoredDrafts);
              }
              await loadBackupInfo();
            } catch (error) {
              console.error('Erro na restauração:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearBackup = async () => {
    try {
      setLoading(true);
      await LocalBackupService.clearBackup();
      await loadBackupInfo();
    } catch (error) {
      console.error('Erro ao limpar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (days < 7) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="save" size={28} color="#4FC3F7" />
        <Text style={styles.title}>Backup Local</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.dot, hasCloudBackup ? styles.dotActive : styles.dotInactive]} />
          <Text style={styles.value}>
            {hasCloudBackup ? 'Configurado' : 'Não configurado'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Último backup:</Text>
        <Text style={styles.value}>{formatDate(lastBackup)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Poemas locais:</Text>
        <Text style={styles.value}>{drafts.length}</Text>
      </View>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={styles.loadingText}>Processando...</Text>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleBackupNow}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Fazer Backup Agora</Text>
          </TouchableOpacity>

          {hasCloudBackup && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRestore}
              >
                <Ionicons name="refresh-outline" size={20} color="#4FC3F7" />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Restaurar Backup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearBackup}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                <Text style={[styles.buttonText, styles.dangerButtonText]}>
                  Limpar Backup
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <Text style={styles.helpText}>
        💡 Seus poemas são salvos automaticamente no dispositivo de forma segura.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  value: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  dotInactive: {
    backgroundColor: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 12,
  },
  buttonsContainer: {
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4FC3F7',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4FC3F7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4FC3F7',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },
  dangerButtonText: {
    color: '#FF6B6B',
  },
  helpText: {
    fontSize: 13,
    color: '#888',
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
