// src/screens/TestScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharePoemButton } from '../components/SharePoemButton';
import { OnlineStatusIndicator, OnlineStatusBadge } from '../components/OnlineStatusIndicator';
import { BackupSettingsCard } from '../components/BackupSettingsCard';
import { Draft } from '../services/DraftService';
import { CloudBackupService } from '../services/CloudBackupService';
import { MusaChatRateLimiter } from '../services/RateLimiter';

const testDraft: Draft = {
  id: 'test_001',
  title: 'Poema de Teste',
  content: `No silêncio da noite estrelada
Onde sonhos dançam levemente
Minha alma encontra morada
Em versos que brotam da mente`,
  category: 'Soneto',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function TestScreen() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testCloudBackup = async () => {
    addLog('🧪 Iniciando teste de Backup...');
    try {
      await CloudBackupService.initialize();
      addLog('✅ Firebase inicializado');

      await CloudBackupService.backupSingleDraft(testDraft);
      addLog('✅ Backup realizado com sucesso');

      const hasBackup = await CloudBackupService.hasBackup();
      addLog(`📦 Tem backup na nuvem: ${hasBackup ? 'SIM' : 'NÃO'}`);

      Alert.alert('✅ Sucesso', 'Teste de backup concluído!');
    } catch (error) {
      addLog(`❌ Erro: ${error}`);
      Alert.alert('❌ Erro', String(error));
    }
  };

  const testRateLimiter = async () => {
    addLog('🧪 Iniciando teste de Rate Limiter...');
    try {
      const limiter = new MusaChatRateLimiter();
      
      for (let i = 1; i <= 5; i++) {
        const can = await limiter.canMakeRequest();
        if (can) {
          await limiter.recordRequest();
          addLog(`✅ Requisição ${i}: Permitida`);
        } else {
          addLog(`🚫 Requisição ${i}: Bloqueada`);
        }
      }

      const remaining = await limiter.getRemainingRequests();
      addLog(`📊 Requisições restantes: ${remaining}`);
      
      Alert.alert('✅ Sucesso', `Teste concluído! ${remaining} requisições restantes`);
    } catch (error) {
      addLog(`❌ Erro: ${error}`);
    }
  };

  const clearLog = () => {
    setLog([]);
  };

  return (
    <ScrollView style={styles.container}>
      <OnlineStatusIndicator position="top" showWhenOnline={true} />
      
      <View style={styles.header}>
        <Ionicons name="flask" size={40} color="#4FC3F7" />
        <Text style={styles.title}>Testes das Novas Funcionalidades</Text>
      </View>

      {/* Badge de Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status da Conexão</Text>
        <OnlineStatusBadge />
      </View>

      {/* Teste de Compartilhamento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compartilhamento de Poemas</Text>
        <View style={styles.card}>
          <Text style={styles.draftTitle}>{testDraft.title}</Text>
          <Text style={styles.draftContent} numberOfLines={3}>
            {testDraft.content}
          </Text>
          <SharePoemButton 
            draft={testDraft}
            iconSize={28}
            showLabel={true}
          />
        </View>
      </View>

      {/* Botões de Teste */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testes Automatizados</Text>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={testCloudBackup}
        >
          <Ionicons name="cloud-upload" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Testar Cloud Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.testButton2]}
          onPress={testRateLimiter}
        >
          <Ionicons name="speedometer" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Testar Rate Limiter</Text>
        </TouchableOpacity>
      </View>

      {/* Backup Settings Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações de Backup</Text>
        <BackupSettingsCard />
      </View>

      {/* Console de Log */}
      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Console de Testes</Text>
          <TouchableOpacity onPress={clearLog}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.console}>
          {log.length === 0 ? (
            <Text style={styles.emptyLog}>Execute um teste para ver os logs...</Text>
          ) : (
            log.map((entry, index) => (
              <Text key={index} style={styles.logEntry}>
                {entry}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4FC3F7',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  draftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  draftContent: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4FC3F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  testButton2: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  console: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    maxHeight: 300,
  },
  emptyLog: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 40,
  },
  logEntry: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
