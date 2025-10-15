import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { getThemeColors, Colors, Spacing, BorderRadius, Shadows, Typography } from '../styles/DesignSystem';
import { Card, Button } from '../components/UI';
import { OfflineExportService } from '../services/OfflineExportService';
import * as DocumentPicker from 'expo-document-picker';

const BackupScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const { settings } = useSettings();
  const themeColors = getThemeColors(settings?.themeVariant ?? 'default', settings.darkTheme);

  // Animações
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    loadStatistics();
    
    // Animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const stats = await OfflineExportService.getOfflineStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullBackup = async () => {
    try {
      setExporting(true);
      await OfflineExportService.createFullBackup();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar backup completo.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllDrafts = async (format: 'pdf' | 'txt' | 'json') => {
    try {
      setExporting(true);
      await OfflineExportService.exportAllDrafts({ 
        format, 
        includeMetadata: true, 
        includeImages: false 
      });
    } catch (error) {
      Alert.alert('Erro', `Falha ao exportar em ${format.toUpperCase()}.`);
    } finally {
      setExporting(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Ler o arquivo
        const response = await fetch(file.uri);
        const backupData = await response.text();
        
        Alert.alert(
          'Confirmar Restauração',
          'Isso irá substituir todos os dados atuais pelos dados do backup. Continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Restaurar', 
              style: 'destructive',
              onPress: async () => {
                await OfflineExportService.restoreFromBackup(backupData);
                await loadStatistics();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao restaurar backup.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textPrimary }]}>
          Carregando dados...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
        <View style={styles.headerContent}>
          <Ionicons name="archive" size={28} color={Colors.primary} />
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Backup Local
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Estatísticas */}
          {statistics && (
            <Card variant="elevated" isDark={settings.darkTheme} style={styles.card}>
              <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                📊 Suas Estatísticas
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.primary }]}>
                    {statistics.totalDrafts}
                  </Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    Poemas
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.accent }]}>
                    {statistics.totalWords}
                  </Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    Palavras
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.secondary }]}>
                    {statistics.averageWordsPerPoem}
                  </Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    Média/Poema
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.success }]}>
                    {statistics.createdThisMonth}
                  </Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                    Este Mês
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Backup Completo */}
          <Card variant="elevated" isDark={settings.darkTheme} style={styles.card}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              💾 Backup Completo
            </Text>
            <Text style={[styles.cardDescription, { color: themeColors.textSecondary }]}>
              Salve todos os seus dados: poemas, configurações, conquistas e perfil em um arquivo único.
            </Text>
            <Button
              title={exporting ? "Criando Backup..." : "Criar Backup Completo"}
              onPress={handleFullBackup}
              disabled={exporting}
              loading={exporting}
              icon="download-outline"
              variant="primary"
              fullWidth
              style={styles.button}
            />
          </Card>

          {/* Exportar Poemas */}
          <Card variant="elevated" isDark={settings.darkTheme} style={styles.card}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              📄 Exportar Poemas
            </Text>
            <Text style={[styles.cardDescription, { color: themeColors.textSecondary }]}>
              Exporte todos os seus poemas em diferentes formatos para compartilhar ou imprimir.
            </Text>
            
            <View style={styles.buttonRow}>
              <Button
                title="PDF"
                onPress={() => handleExportAllDrafts('pdf')}
                disabled={exporting}
                icon="document-text-outline"
                variant="secondary"
                style={styles.exportButton}
              />
              <Button
                title="TXT"
                onPress={() => handleExportAllDrafts('txt')}
                disabled={exporting}
                icon="document-outline"
                variant="outline"
                style={styles.exportButton}
              />
              <Button
                title="JSON"
                onPress={() => handleExportAllDrafts('json')}
                disabled={exporting}
                icon="code-outline"
                variant="ghost"
                style={styles.exportButton}
              />
            </View>
          </Card>

          {/* Restaurar Backup */}
          <Card variant="elevated" isDark={settings.darkTheme} style={styles.card}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              🔄 Restaurar Backup
            </Text>
            <Text style={[styles.cardDescription, { color: themeColors.textSecondary }]}>
              Restaure seus dados a partir de um arquivo de backup criado anteriormente.
            </Text>
            <Button
              title="Selecionar Arquivo de Backup"
              onPress={handleRestoreBackup}
              disabled={exporting}
              icon="cloud-upload-outline"
              variant="outline"
              fullWidth
              style={styles.button}
            />
          </Card>

          {/* Informações */}
          <Card variant="outlined" isDark={settings.darkTheme} style={styles.card}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              ℹ️ Sobre o Backup Local
            </Text>
            <View style={styles.infoList}>
              <Text style={[styles.infoItem, { color: themeColors.textSecondary }]}>
                • Todos os dados ficam armazenados apenas no seu dispositivo
              </Text>
              <Text style={[styles.infoItem, { color: themeColors.textSecondary }]}>
                • Nenhuma informação é enviada para servidores externos
              </Text>
              <Text style={[styles.infoItem, { color: themeColors.textSecondary }]}>
                • Você tem controle total sobre seus backups
              </Text>
              <Text style={[styles.infoItem, { color: themeColors.textSecondary }]}>
                • Exporte e compartilhe quando quiser
              </Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    paddingTop: Spacing.xl,
    ...Shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.md,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  animatedContainer: {
    flex: 1,
  },
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: Spacing.md,
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  infoList: {
    marginTop: Spacing.sm,
  },
  infoItem: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
});

export default BackupScreen;
