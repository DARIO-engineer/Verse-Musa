import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { useApp } from '../contexts/AppContext';
import { DraftService, Draft } from '../services/DraftService';
import { PDFService } from '../services/PDFService';

type ViewDraftRouteProp = RouteProp<{ params: { draftId?: string; draft?: any } }, 'params'>;

const ViewDraftScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ViewDraftRouteProp>();
  const { activeTheme } = useSettings();
  const { profile } = useApp();
  const isDark = activeTheme === 'dark';

  const { draftId, draft: serializedDraft } = route.params || {};
  const [draft, setDraft] = useState<Draft | null>(serializedDraft || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const id = draftId || serializedDraft?.id;
      if (!id) {
        Alert.alert('Erro', 'ID do rascunho não informado');
        navigation.goBack();
        return;
      }

      try {
        const data = await DraftService.getDraftById(id);
        if (!data) {
          Alert.alert('Erro', 'Rascunho não encontrado');
          navigation.goBack();
          return;
        }
        setDraft(data);
      } catch (error) {
        console.error('Erro ao carregar rascunho para visualização', error);
        Alert.alert('Erro', 'Não foi possível carregar a obra');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (!serializedDraft) load();
    else setLoading(false);
  }, [draftId, serializedDraft]);

  const handleDownloadPDF = async () => {
    if (!draft) return;

    try {
      const stats = PDFService.getPoemStats(draft.content);
      const poemData = {
        title: draft.title || 'Obra sem título',
        content: draft.content,
        author: profile?.name || 'Poeta',
        date: new Date().toISOString(),
        wordCount: stats.wordCount,
        verseCount: stats.verseCount,
        category: draft.category || 'Poesia',
      };

      await PDFService.generatePoemPDF(poemData, { share: false }); // share: false para baixar
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      Alert.alert('Erro', 'Não foi possível baixar o PDF. Tente novamente.');
    }
  };

  if (loading || !draft) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? Colors.backgroundDark : Colors.background }}>
        <Ionicons name="book" size={48} color={Colors.primary} />
        <Text style={{ marginTop: 12, fontSize: Typography.fontSize.base, color: isDark ? Colors.textPrimaryDark : Colors.textPrimary }}>Carregando obra...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? Colors.backgroundDark : Colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? Colors.backgroundDark : Colors.background} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: isDark ? Colors.borderDark : Colors.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: Spacing.sm, borderRadius: BorderRadius.full }}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.textPrimaryDark : Colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: isDark ? Colors.textPrimaryDark : Colors.textPrimary }}>Visualizar Obra</Text>
          {draft.title ? <Text style={{ fontSize: Typography.fontSize.sm, color: isDark ? Colors.textSecondaryDark : Colors.textSecondary, marginTop: 4 }}>&quot;{draft.title}&quot;</Text> : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleDownloadPDF}
            style={{ 
              padding: Spacing.sm, 
              borderRadius: BorderRadius.full,
              marginRight: Spacing.xs,
            }}
          >
            <Ionicons name="download-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (navigation as any).navigate('EditDraft', { draftId: draft.id })}
            style={{ padding: Spacing.sm, borderRadius: BorderRadius.full }}
          >
            <Ionicons name="pencil" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ 
          padding: Spacing.lg,
          paddingBottom: 100 // Espaço extra para evitar sobreposição com o navigator
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Spacing.lg }}>
          {draft.title ? (
            <Text style={{ fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: isDark ? Colors.textPrimaryDark : Colors.textPrimary }}>{draft.title}</Text>
          ) : null}

          <Text style={{ fontSize: Typography.fontSize.xs, color: isDark ? Colors.textSecondaryDark : Colors.textSecondary, marginTop: Spacing.xs }}>{draft.category || draft.typeId || 'Poesia'} • {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}</Text>
        </View>

        <View style={{ 
          backgroundColor: isDark ? Colors.surfaceDark : Colors.surface, 
          borderRadius: BorderRadius.lg, 
          padding: Spacing.lg, 
          ...Shadows.sm,
          marginBottom: Spacing.lg // Margem extra no final do conteúdo
        }}>
          <Text style={{ 
            fontSize: Typography.fontSize.base, 
            color: isDark ? Colors.textPrimaryDark : Colors.textPrimary, 
            lineHeight: Typography.fontSize.base * 1.6 
          }}>
            {draft.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewDraftScreen;
