// src/services/OfflineExportService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Draft } from './DraftService';
import { Alert } from 'react-native';

export interface ExportOptions {
  format: 'pdf' | 'txt' | 'json';
  includeMetadata: boolean;
  includeImages: boolean;
  customTheme?: 'classic' | 'modern' | 'minimal';
}

export class OfflineExportService {
  // Exportar todos os rascunhos
  static async exportAllDrafts(options: ExportOptions = { format: 'pdf', includeMetadata: true, includeImages: false }): Promise<void> {
    try {
      const draftsJson = await AsyncStorage.getItem('@VersoEMusa:drafts');
      const drafts: Draft[] = draftsJson ? JSON.parse(draftsJson) : [];

      if (drafts.length === 0) {
        Alert.alert('Aviso', 'Nenhum rascunho encontrado para exportar.');
        return;
      }

      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(drafts, options);
          break;
        case 'txt':
          await this.exportToTXT(drafts, options);
          break;
        case 'json':
          await this.exportToJSON(drafts, options);
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar rascunhos:', error);
      Alert.alert('Erro', 'Falha ao exportar rascunhos.');
    }
  }

  // Exportar um rascunho específico
  static async exportSingleDraft(draft: Draft, options: ExportOptions = { format: 'pdf', includeMetadata: true, includeImages: false }): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF([draft], options);
          break;
        case 'txt':
          await this.exportToTXT([draft], options);
          break;
        case 'json':
          await this.exportToJSON([draft], options);
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar rascunho:', error);
      Alert.alert('Erro', 'Falha ao exportar rascunho.');
    }
  }

  // Backup completo do app
  static async createFullBackup(): Promise<void> {
    try {
      const backupData = {
        drafts: await AsyncStorage.getItem('@VersoEMusa:drafts'),
        achievements: await AsyncStorage.getItem('@VersoEMusa:achievements'),
        settings: await AsyncStorage.getItem('@VersoEMusa:settings'),
        profile: {
          name: await AsyncStorage.getItem('profileName'),
          email: await AsyncStorage.getItem('profileEmail'),
          photo: await AsyncStorage.getItem('profilePhoto'),
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      const fileName = `versoemusa_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = (FileSystem as any).documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Backup do VersoEMusa',
        });
      }

      Alert.alert('Sucesso', 'Backup criado e compartilhado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      Alert.alert('Erro', 'Falha ao criar backup.');
    }
  }

  // Restaurar backup
  static async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const data = JSON.parse(backupData);

      if (data.drafts) await AsyncStorage.setItem('@VersoEMusa:drafts', data.drafts);
      if (data.achievements) await AsyncStorage.setItem('@VersoEMusa:achievements', data.achievements);
      if (data.settings) await AsyncStorage.setItem('@VersoEMusa:settings', data.settings);
      if (data.profile?.name) await AsyncStorage.setItem('profileName', data.profile.name);
      if (data.profile?.email) await AsyncStorage.setItem('profileEmail', data.profile.email);
      if (data.profile?.photo) await AsyncStorage.setItem('profilePhoto', data.profile.photo);

      Alert.alert('Sucesso', 'Backup restaurado com sucesso! Reinicie o app para ver as mudanças.');
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      Alert.alert('Erro', 'Falha ao restaurar backup. Verifique se o arquivo está correto.');
    }
  }

  // Exportar para PDF
  private static async exportToPDF(drafts: Draft[], options: ExportOptions): Promise<void> {
    const theme = options.customTheme || 'modern';
    const html = this.generatePDFHTML(drafts, options, theme);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: drafts.length === 1 ? `${drafts[0].title}.pdf` : 'Meus_Poemas.pdf',
      });
    }
  }

  // Exportar para TXT
  private static async exportToTXT(drafts: Draft[], options: ExportOptions): Promise<void> {
    let content = '';

    if (options.includeMetadata) {
      content += `VERSO E MUSA - COLEÇÃO DE POEMAS\n`;
      content += `Exportado em: ${new Date().toLocaleDateString('pt-BR')}\n`;
      content += `Total de poemas: ${drafts.length}\n`;
      content += `${'='.repeat(50)}\n\n`;
    }

    drafts.forEach((draft, index) => {
      content += `${index + 1}. ${draft.title.toUpperCase()}\n`;
      if (options.includeMetadata) {
        content += `Categoria: ${draft.category}\n`;
        
        const created = new Date(draft.createdAt);
        const updated = new Date(draft.updatedAt);
        const diffInMinutes = (updated.getTime() - created.getTime()) / (1000 * 60);
        
        content += `Criado em: ${created.toLocaleDateString('pt-BR')} às ${created.toLocaleTimeString('pt-BR')}\n`;
        
        if (diffInMinutes >= 1) {
          content += `Última modificação: ${updated.toLocaleDateString('pt-BR')} às ${updated.toLocaleTimeString('pt-BR')}\n`;
        }
        
        content += `Palavras: ${draft.content.split(' ').length}\n`;
      }
      content += `${'-'.repeat(30)}\n`;
      content += `${draft.content}\n\n`;
      content += `${'='.repeat(50)}\n\n`;
    });

    const fileName = drafts.length === 1 ? `${drafts[0].title}.txt` : 'Meus_Poemas.txt';
    const fileUri = (FileSystem as any).documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: fileName,
      });
    }
  }

  // Exportar para JSON
  private static async exportToJSON(drafts: Draft[], options: ExportOptions): Promise<void> {
    const exportData = {
      metadata: {
        appName: 'Verso e Musa',
        exportDate: new Date().toISOString(),
        totalPoems: drafts.length,
        version: '1.0.0',
      },
      drafts: drafts.map(draft => ({
        ...draft,
        wordCount: draft.content.split(' ').length,
        exportedAt: new Date().toISOString(),
      })),
    };

    const fileName = drafts.length === 1 ? `${drafts[0].title}.json` : 'Meus_Poemas.json';
    const fileUri = (FileSystem as any).documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: fileName,
      });
    }
  }

  // Gerar HTML para PDF
  private static generatePDFHTML(drafts: Draft[], options: ExportOptions, theme: string): string {
    const themeColors = {
      classic: { bg: '#FFFEF7', text: '#2C3E50', accent: '#8B4513', border: '#DDD' },
      modern: { bg: '#FFFFFF', text: '#1A202C', accent: '#3D8EF7', border: '#E2E8F0' },
      minimal: { bg: '#FAFAFA', text: '#333333', accent: '#666666', border: '#EEE' },
    };

    const colors = themeColors[theme as keyof typeof themeColors];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verso e Musa - Coleção</title>
          <style>
            @page {
              margin: 2cm;
              @bottom-center {
                content: "Página " counter(page) " de " counter(pages);
                font-size: 12px;
                color: ${colors.text};
              }
            }
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              color: ${colors.text};
              background: ${colors.bg};
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid ${colors.accent};
            }
            .header h1 {
              font-size: 2.5em;
              color: ${colors.accent};
              margin: 0;
              font-weight: 300;
              letter-spacing: 2px;
            }
            .header p {
              margin: 10px 0 0 0;
              color: ${colors.text};
              opacity: 0.7;
            }
            .poem {
              margin-bottom: 50px;
              page-break-inside: avoid;
              border-left: 4px solid ${colors.accent};
              padding-left: 20px;
            }
            .poem-title {
              font-size: 1.8em;
              font-weight: bold;
              color: ${colors.accent};
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .poem-meta {
              font-size: 0.9em;
              color: ${colors.text};
              opacity: 0.6;
              margin-bottom: 20px;
            }
            .poem-content {
              font-size: 1.1em;
              line-height: 1.8;
              white-space: pre-line;
              margin-bottom: 20px;
              text-align: justify;
            }
            .poem-footer {
              text-align: right;
              font-style: italic;
              color: ${colors.text};
              opacity: 0.5;
              border-top: 1px solid ${colors.border};
              padding-top: 10px;
              margin-top: 20px;
            }
            .divider {
              text-align: center;
              margin: 40px 0;
              color: ${colors.accent};
              font-size: 1.5em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VERSO E MUSA</h1>
            <p>Coleção Pessoal de Poemas</p>
            ${options.includeMetadata ? `
              <p>Exportado em ${new Date().toLocaleDateString('pt-BR')}</p>
              <p>Total: ${drafts.length} ${drafts.length === 1 ? 'poema' : 'poemas'}</p>
            ` : ''}
          </div>
          
          ${drafts.map((draft, index) => `
            <div class="poem">
              <div class="poem-title">${draft.title}</div>
              ${options.includeMetadata ? `
                <div class="poem-meta">
                  Categoria: ${draft.category} | 
                  Criado em: ${new Date(draft.createdAt).toLocaleDateString('pt-BR')} | 
                  ${draft.content.split(' ').length} palavras
                </div>
              ` : ''}
              <div class="poem-content">${draft.content}</div>
              <div class="poem-footer">
                ~ ${new Date(draft.createdAt).getFullYear()}
              </div>
            </div>
            ${index < drafts.length - 1 ? '<div class="divider">❋ ❋ ❋</div>' : ''}
          `).join('')}
        </body>
      </html>
    `;
  }

  // Estatísticas offline
  static async getOfflineStatistics(): Promise<any> {
    try {
      const draftsJson = await AsyncStorage.getItem('@VersoEMusa:drafts');
      const drafts: Draft[] = draftsJson ? JSON.parse(draftsJson) : [];

      const stats = {
        totalDrafts: drafts.length,
        totalWords: drafts.reduce((acc, draft) => acc + draft.content.split(' ').length, 0),
        averageWordsPerPoem: 0,
        categoryCounts: {} as Record<string, number>,
        createdThisMonth: 0,
        longestPoem: null as Draft | null,
        oldestPoem: null as Draft | null,
        newestPoem: null as Draft | null,
      };

      if (drafts.length > 0) {
        stats.averageWordsPerPoem = Math.round(stats.totalWords / drafts.length);
        
        // Contar por categoria
        drafts.forEach(draft => {
          const category = draft.category || 'Sem categoria';
          stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
        });

        // Poemas criados este mês
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        stats.createdThisMonth = drafts.filter(draft => {
          const draftDate = new Date(draft.createdAt);
          return draftDate.getMonth() === currentMonth && draftDate.getFullYear() === currentYear;
        }).length;

        // Poema mais longo
        stats.longestPoem = drafts.reduce((longest, current) => 
          current.content.split(' ').length > longest.content.split(' ').length ? current : longest
        );

        // Poema mais antigo e mais novo
        const sortedByDate = [...drafts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        stats.oldestPoem = sortedByDate[0];
        stats.newestPoem = sortedByDate[sortedByDate.length - 1];
      }

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }
}
