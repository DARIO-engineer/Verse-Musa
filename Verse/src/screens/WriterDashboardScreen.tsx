import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { useApp } from '../contexts/AppContext';
import ModernCard from '../components/UI/ModernCard';
import WriterDashboardService from '../services/WriterDashboardService';

const { width } = Dimensions.get('window');

const WriterDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, stats } = useApp();
  const { activeTheme } = useSettings();
  const isDark = activeTheme === 'dark';
  const themeColors = getThemeColors('default', isDark);
  
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState<any>(null);
  const [styleEvolution, setStyleEvolution] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [
        productivityMetrics,
        vocabularyData,
        styleData,
        goalsData,
        reportData
      ] = await Promise.all([
        WriterDashboardService.getProductivityMetrics(),
        WriterDashboardService.analyzeVocabulary(['exemplo de texto']),
        WriterDashboardService.getStyleEvolution('month'),
        WriterDashboardService.getGoals(),
        WriterDashboardService.generateMonthlyReport(new Date().getMonth(), new Date().getFullYear())
      ]);

      setMetrics(productivityMetrics);
      setVocabularyAnalysis(vocabularyData);
      setStyleEvolution(styleData);
      setGoals(goalsData);
      setMonthlyReport(reportData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const createNewGoal = () => {
    Alert.prompt(
      'Nova Meta',
      'Quantas palavras você quer escrever por dia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Criar',
          onPress: async (text) => {
            if (text && !isNaN(Number(text))) {
              await WriterDashboardService.createGoal({
                type: 'daily',
                target: Number(text),
                unit: 'words',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                isActive: true
              });
              loadDashboardData();
              Alert.alert('Sucesso!', 'Meta criada com sucesso!');
            }
          }
        }
      ],
      'plain-text',
      '100'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <LinearGradient
        colors={Colors.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xl,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={{
              fontSize: Typography.fontSize['2xl'],
              fontWeight: Typography.fontWeight.bold,
              color: Colors.white,
              marginBottom: Spacing.xs,
            }}>
              📊 Dashboard do Escritor
            </Text>
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: 'rgba(255,255,255,0.9)',
            }}>
              Acompanhe seu progresso poético
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Métricas de Produtividade */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text style={{
            fontSize: Typography.fontSize.xl,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.lg,
          }}>
            📈 Produtividade
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <ModernCard
              title="Média Diária"
              value={`${metrics?.dailyAverage || 0} palavras`}
              icon="trending-up"
              style={{ width: (width - Spacing.lg * 3) / 2, marginBottom: Spacing.md }}
            />
            <ModernCard
              title="Sequência Atual"
              value={`${metrics?.currentStreak || 0} dias`}
              icon="flame"
              style={{ width: (width - Spacing.lg * 3) / 2, marginBottom: Spacing.md }}
            />
            <ModernCard
              title="Maior Sequência"
              value={`${metrics?.longestStreak || 0} dias`}
              icon="trophy"
              style={{ width: (width - Spacing.lg * 3) / 2, marginBottom: Spacing.md }}
            />
            <ModernCard
              title="Hora Produtiva"
              value={`${metrics?.mostProductiveHour || 9}:00`}
              icon="time"
              style={{ width: (width - Spacing.lg * 3) / 2, marginBottom: Spacing.md }}
            />
          </View>
        </View>

        {/* Análise de Vocabulário */}
        {vocabularyAnalysis && (
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.lg,
            }}>
              📚 Vocabulário
            </Text>
            
            <View style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              ...Shadows.md,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textSecondary,
                }}>
                  Palavras Únicas
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.bold,
                  color: themeColors.textPrimary,
                }}>
                  {vocabularyAnalysis.totalUniqueWords}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: themeColors.textSecondary,
                }}>
                  Complexidade
                </Text>
                <Text style={{
                  fontSize: Typography.fontSize.lg,
                  fontWeight: Typography.fontWeight.bold,
                  color: themeColors.textPrimary,
                }}>
                  {vocabularyAnalysis.complexityScore}/10
                </Text>
              </View>

              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                marginTop: Spacing.sm,
              }}>
                Palavras mais usadas: {vocabularyAnalysis.mostUsedWords?.slice(0, 3).map((w: any) => w.word).join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Evolução do Estilo */}
        {styleEvolution && (
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.lg,
            }}>
              🎨 Evolução do Estilo
            </Text>
            
            <View style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              ...Shadows.md,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Média de palavras por poema: {styleEvolution.averageWordsPerPoem}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Categorias favoritas: {styleEvolution.mostUsedCategories?.join(', ')}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textPrimary,
              }}>
                Crescimento vocabular: +{styleEvolution.vocabularyGrowth?.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        {/* Metas */}
        <View style={{ marginBottom: Spacing.xl }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.lg,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
            }}>
              🎯 Metas
            </Text>
            <TouchableOpacity
              onPress={createNewGoal}
              style={{
                backgroundColor: themeColors.primary,
                borderRadius: BorderRadius.md,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
              }}
            >
              <Text style={{
                color: Colors.white,
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.medium,
              }}>
                Nova Meta
              </Text>
            </TouchableOpacity>
          </View>

          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <View
                key={goal.id}
                style={{
                  backgroundColor: themeColors.surface,
                  borderRadius: BorderRadius.lg,
                  padding: Spacing.lg,
                  marginBottom: Spacing.md,
                  ...Shadows.sm,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: Spacing.sm,
                }}>
                  <Text style={{
                    fontSize: Typography.fontSize.base,
                    fontWeight: Typography.fontWeight.semibold,
                    color: themeColors.textPrimary,
                  }}>
                    {goal.target} {goal.unit} por {goal.type === 'daily' ? 'dia' : goal.type}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: themeColors.textSecondary,
                  }}>
                    {Math.round((goal.progress / goal.target) * 100)}%
                  </Text>
                </View>
                
                <View style={{
                  backgroundColor: themeColors.background,
                  borderRadius: BorderRadius.sm,
                  height: 8,
                  overflow: 'hidden',
                }}>
                  <View style={{
                    backgroundColor: themeColors.primary,
                    height: '100%',
                    width: `${Math.min((goal.progress / goal.target) * 100, 100)}%`,
                  }} />
                </View>
              </View>
            ))
          ) : (
            <View style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.xl,
              alignItems: 'center',
              ...Shadows.sm,
            }}>
              <Ionicons name="target" size={48} color={themeColors.textSecondary} />
              <Text style={{
                fontSize: Typography.fontSize.base,
                color: themeColors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.md,
              }}>
                Nenhuma meta definida ainda.{'\n'}Crie sua primeira meta para acompanhar seu progresso!
              </Text>
            </View>
          )}
        </View>

        {/* Relatório Mensal */}
        {monthlyReport && (
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.xl,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.lg,
            }}>
              📅 Relatório de {monthlyReport.month}
            </Text>
            
            <View style={{
              backgroundColor: themeColors.surface,
              borderRadius: BorderRadius.lg,
              padding: Spacing.lg,
              ...Shadows.md,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}>
                <Text style={{ color: themeColors.textSecondary }}>Poemas criados</Text>
                <Text style={{ 
                  color: themeColors.textPrimary,
                  fontWeight: Typography.fontWeight.bold,
                }}>
                  {monthlyReport.totalPoems}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}>
                <Text style={{ color: themeColors.textSecondary }}>Palavras escritas</Text>
                <Text style={{ 
                  color: themeColors.textPrimary,
                  fontWeight: Typography.fontWeight.bold,
                }}>
                  {monthlyReport.totalWords}
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}>
                <Text style={{ color: themeColors.textSecondary }}>Tempo escrevendo</Text>
                <Text style={{ 
                  color: themeColors.textPrimary,
                  fontWeight: Typography.fontWeight.bold,
                }}>
                  {Math.round(monthlyReport.totalMinutes / 60)}h
                </Text>
              </View>

              {monthlyReport.topCategories?.length > 0 && (
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginTop: Spacing.sm,
                }}>
                  Categorias favoritas: {monthlyReport.topCategories.join(', ')}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WriterDashboardScreen;
