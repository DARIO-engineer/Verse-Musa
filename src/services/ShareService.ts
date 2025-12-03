// src/services/ShareService.ts
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform, Share, Alert } from 'react-native';
import { Draft } from './DraftService';
import { ErrorHandlingService } from './ErrorHandlingService';

export class ShareService {
  /**
   * Compartilha poema como texto simples
   */
  static async shareAsText(draft: Draft): Promise<void> {
    try {
      const message = this.formatPoemText(draft);
      
      if (Platform.OS === 'web') {
        // Web usa Clipboard API
        await this.shareOnWeb(message);
      } else {
        // Mobile usa Share API nativo
        await Share.share({
          message,
          title: draft.title || 'Meu Poema',
        });
      }

      Alert.alert(
        '✅ Compartilhado',
        `Poema "${draft.title}" foi compartilhado com sucesso!`,
        [{ text: 'OK' }]
      );

      console.log('✅ Poema compartilhado como texto');
    } catch (error) {
      console.error('❌ Erro ao compartilhar texto:', error);
      Alert.alert(
        '❌ Erro ao Compartilhar',
        'Não foi possível compartilhar o poema. Tente novamente.',
        [{ text: 'OK' }]
      );
      ErrorHandlingService.handleError(error as Error, 'SHARE_TEXT');
      throw error;
    }
  }

  /**
   * Formata poema para compartilhamento
   */
  private static formatPoemText(draft: Draft): string {
    const title = draft.title || 'Sem título';
    const content = draft.content;
    const category = draft.category || 'Poesia';

    return `
📖 ${title}
🏷️ ${category}
  static async shareAsImage(
    draft: Draft,
    backgroundColor: string = '#1A237E',
    textColor: string = '#FFFFFF'
  ): Promise<void> {
    try {
      // Gerar SVG do poema
      const svgContent = this.generatePoemSVG(draft, backgroundColor, textColor);
      
      // Salvar SVG como arquivo temporário
      const fileUri = `${FileSystem.cacheDirectory}poem_${draft.id}.svg`;
      await FileSystem.writeAsStringAsync(fileUri, svgContent);

      // Compartilhar arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/svg+xml',
          dialogTitle: 'Compartilhar Poema',
        });

        Alert.alert(
          '✅ Imagem Criada',
          `Poema "${draft.title}" foi compartilhado como imagem!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Não Disponível',
          'Compartilhamento não está disponível neste dispositivo.',
          [{ text: 'OK' }]
        );
        throw new Error('Compartilhamento não disponível neste dispositivo');
      }

      console.log('✅ Poema compartilhado como imagem');
    } catch (error) {
      console.error('❌ Erro ao compartilhar imagem:', error);
      Alert.alert(
        '❌ Erro ao Criar Imagem',
        'Não foi possível criar a imagem do poema.',
        [{ text: 'OK' }]
      );
      ErrorHandlingService.handleError(error as Error, 'SHARE_IMAGE');
      throw error;
    }
  }     });
      } else {
        throw new Error('Compartilhamento não disponível neste dispositivo');
      }

      console.log('✅ Poema compartilhado como imagem');
    } catch (error) {
      console.error('❌ Erro ao compartilhar imagem:', error);
      ErrorHandlingService.handleError(error as Error, 'SHARE_IMAGE');
      throw error;
    }
  }

  /**
   * Gera SVG estilizado do poema
   */
  private static generatePoemSVG(
    draft: Draft,
    backgroundColor: string,
    textColor: string
  ): string {
    const title = draft.title || 'Sem título';
    const content = draft.content;
    
    // Quebrar linhas longas
    const lines = content.split('\n');
    const maxCharsPerLine = 35;
    const wrappedLines: string[] = [];
    
    lines.forEach(line => {
      if (line.length <= maxCharsPerLine) {
        wrappedLines.push(line);
      } else {
        const words = line.split(' ');
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) wrappedLines.push(currentLine);
      }
    });

    const lineHeight = 30;
    const startY = 120;
    const totalHeight = Math.max(500, startY + wrappedLines.length * lineHeight + 100);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="${totalHeight}" fill="${backgroundColor}"/>
  
  <!-- Decorative border -->
  <rect x="30" y="30" width="740" height="${totalHeight - 60}" 
        fill="none" stroke="${textColor}" stroke-width="2" opacity="0.3"/>
  
  <!-- Title -->
  <text x="400" y="70" text-anchor="middle" 
        font-family="Georgia, serif" font-size="32" 
        font-weight="bold" fill="${textColor}">
    ${this.escapeXml(title)}
  </text>
  
  <!-- Divider -->
  <line x1="200" y1="90" x2="600" y2="90" 
        stroke="${textColor}" stroke-width="1" opacity="0.5"/>
  
  <!-- Poem content -->
  ${wrappedLines.map((line, index) => `
  <text x="400" y="${startY + index * lineHeight}" text-anchor="middle"
        font-family="Georgia, serif" font-size="20" fill="${textColor}">
    ${this.escapeXml(line)}
  </text>`).join('')}
  
  <!-- Watermark -->
  <text x="400" y="${totalHeight - 20}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="14" 
        fill="${textColor}" opacity="0.4">
    Criado com Verso e Musa 🎭
  </text>
</svg>`;
  }

  /**
   * Escapa caracteres especiais XML
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  static async exportAsFile(draft: Draft): Promise<void> {
    try {
      const content = this.formatPoemText(draft);
      const fileName = `${draft.title?.replace(/[^a-z0-9]/gi, '_') || 'poema'}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Exportar Poema',
        });

        Alert.alert(
          '✅ Arquivo Criado',
          `Arquivo "${fileName}" foi exportado com sucesso!`,
          [{ text: 'OK' }]
        );
      }

      console.log('✅ Poema exportado como arquivo');
    } catch (error) {
      console.error('❌ Erro ao exportar arquivo:', error);
      Alert.alert(
        '❌ Erro ao Exportar',
        'Não foi possível exportar o arquivo do poema.',
        [{ text: 'OK' }]
      );
      ErrorHandlingService.handleError(error as Error, 'EXPORT_FILE');
      throw error;
    }
  }   alert('✅ Poema copiado!');
    }
  }

  /**
  static async shareCollection(drafts: Draft[], collectionName: string = 'Minha Coletânea'): Promise<void> {
    try {
      const content = this.formatCollection(drafts, collectionName);
      const fileName = `${collectionName.replace(/[^a-z0-9]/gi, '_')}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Compartilhar Coletânea',
        });

        Alert.alert(
          '✅ Coletânea Compartilhada',
          `${drafts.length} poema(s) foram compartilhados em "${fileName}"!`,
          [{ text: 'OK' }]
        );
      }

      console.log('✅ Coletânea compartilhada');
    } catch (error) {
      console.error('❌ Erro ao compartilhar coletânea:', error);
      Alert.alert(
        '❌ Erro ao Compartilhar',
        'Não foi possível compartilhar a coletânea de poemas.',
        [{ text: 'OK' }]
      );
      ErrorHandlingService.handleError(error as Error, 'SHARE_COLLECTION');
      throw error;
    }
  }   throw error;
    }
  }

  /**
   * Compartilha múltiplos poemas como coletânea
   */
  static async shareCollection(drafts: Draft[], collectionName: string = 'Minha Coletânea'): Promise<void> {
    try {
      const content = this.formatCollection(drafts, collectionName);
      const fileName = `${collectionName.replace(/[^a-z0-9]/gi, '_')}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Compartilhar Coletânea',
        });
      }

      console.log('✅ Coletânea compartilhada');
    } catch (error) {
      console.error('❌ Erro ao compartilhar coletânea:', error);
      ErrorHandlingService.handleError(error as Error, 'SHARE_COLLECTION');
      throw error;
    }
  }

  /**
   * Formata coletânea de poemas
   */
  private static formatCollection(drafts: Draft[], collectionName: string): string {
    const header = `
╔═══════════════════════════════════════╗
║                                       ║
║     ${collectionName.padStart(20)}     ║
║                                       ║
╚═══════════════════════════════════════╝

Coletânea com ${drafts.length} poema(s)
Criado com Verso e Musa 🎭

═══════════════════════════════════════════

`;

    const poems = drafts.map((draft, index) => {
      return `
${index + 1}. ${draft.title || 'Sem título'}
${'─'.repeat(40)}

${draft.content}

Categoria: ${draft.category || 'Poesia'}

═══════════════════════════════════════════
`;
    }).join('\n');

    return header + poems;
  }
}
