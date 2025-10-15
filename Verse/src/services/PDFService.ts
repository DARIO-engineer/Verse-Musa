import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

interface PoemData {
  title: string;
  subtitle?: string;
  content: string;
  author?: string;
  date?: string;
  wordCount?: number;
  verseCount?: number;
  category?: string;
}

export class PDFService {
  static async generatePoemPDF(poemData: PoemData, options: { share?: boolean } = {}): Promise<void> {
    try {
      const { title, content } = poemData;
      
      // Verificar se há título, senão pedir ao usuário
      let fileName: string = title?.trim() || '';
      if (!fileName) {
        const userFileName = await this.promptForFileName();
        if (!userFileName) {
          // Usuário cancelou
          return;
        }
        fileName = userFileName;
      }

      const isShortPoem = this.isShortPoem(content);
      const html = this.generateHTML(poemData, isShortPoem);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const { share = true } = options;

      if (share) {
        // Compartilhar - mostrar modal de compartilhamento
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Compartilhar: ${fileName}`,
          });
        }
      } else {
        // Download - salvar diretamente na pasta Downloads
        await this.saveToDownloads(uri, fileName);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  static async exportPoemAsText(poemData: PoemData): Promise<void> {
    try {
      const { title, content, author, category } = poemData;
      
      // Verificar se há título, senão pedir ao usuário
      let fileName: string = title?.trim() || '';
      if (!fileName) {
        const userFileName = await this.promptForFileName();
        if (!userFileName) {
          // Usuário cancelou
          return;
        }
        fileName = userFileName;
      }
      
      const textContent = `${fileName}\n\n${content}\n\n---\nTipo: ${category || 'Poesia'}\nAutor: ${author || 'Anônimo'}\nData: ${new Date().toLocaleDateString('pt-BR')}\nExportado do Verso & Musa`;

      // Limpar o nome do arquivo removendo caracteres especiais
      const cleanTitle = fileName.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
      const textFileName = `${cleanTitle || 'Poema'}.txt`;
      const fileUri = FileSystem.documentDirectory + textFileName;

      await FileSystem.writeAsStringAsync(fileUri, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: `Compartilhar: ${fileName}`,
        });
      }
    } catch (error) {
      console.error('Erro ao exportar texto:', error);
      throw error;
    }
  }

  private static generateHTML(poemData: PoemData, isShortPoem: boolean): string {
    const { title, subtitle, content, author, date, wordCount, verseCount, category } = poemData;
    const pageFormat = isShortPoem ? 'A5' : 'A4';
    const margin = pageFormat === 'A5' ? '18mm' : '25mm';

    // Preparar informações do autor (só mostrar se não for padrão)
    const showAuthor = author && author !== 'Poeta';
    const authorInfo = showAuthor ? ` • Escritor: ${author}` : '';
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page { 
              size: ${pageFormat}; 
              margin: 20mm 15mm;
            }
            
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #2c2c2c;
              text-align: left;
              margin: 0;
              padding: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 24pt;
            }
            
            .title {
              font-size: 16pt;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 6pt;
              line-height: 1.2;
            }
            
            .subtitle {
              font-size: 12pt;
              font-style: italic;
              color: #666;
              margin-bottom: 12pt;
            }
            
            .content {
              white-space: pre-line;
              margin-bottom: 20pt;
              text-align: left;
            }
            
            .stanza { 
              margin-bottom: 12pt;
              page-break-inside: avoid;
            }
            
            .stanza:last-child {
              margin-bottom: 0;
            }
            
            .footer {
              position: fixed;
              bottom: 15pt;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 7pt;
              color: #888;
              border-top: 0.5pt solid #ddd;
              padding-top: 6pt;
            }
            
            .metadata {
              font-size: 8pt;
              color: #666;
              line-height: 1.2;
            }
            
            .export-info {
              font-size: 6pt;
              color: #aaa;
              margin-top: 3pt;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${this.escapeHtml(title)}</div>
            ${subtitle ? `<div class="subtitle">${this.escapeHtml(subtitle)}</div>` : ''}
          </div>
          
          <div class="content">${this.formatPoemContent(content)}</div>
          
          <div class="footer">
            <div class="metadata">
              ${category || 'Poesia'}${authorInfo} • ${new Date().toLocaleDateString('pt-BR')}
            </div>
            <div class="export-info">Verso & Musa</div>
          </div>
        </body>
      </html>
    `;
  }

  private static escapeHtml(text: string): string {
    return text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] || c));
  }

  private static formatPoemContent(content: string): string {
    // Processar o conteúdo de forma mais simples e compacta
    return content
      .split(/\n\s*\n/) // Dividir por linhas vazias (estrofes)
      .filter(stanza => stanza.trim()) // Remover estrofes vazias
      .map(stanza => {
        // Limpar e formatar cada estrofe
        const cleanStanza = stanza
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(line => this.escapeHtml(line))
          .join('<br>');
        
        return `<div class="stanza">${cleanStanza}</div>`;
      })
      .join('');
  }

  static isShortPoem(content: string): boolean {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const verses = content.split('\n').filter(l => l.trim().length > 0).length;
    return words <= 140 || verses <= 16;
  }

  static getPoemStats(content: string): { wordCount: number; verseCount: number } {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const verses = content.split('\n').filter(l => l.trim().length > 0);
    return { wordCount: words.length, verseCount: verses.length };
  }

  /**
   * Pede ao usuário para inserir um nome para o arquivo
   */
  private static async promptForFileName(): Promise<string | null> {
    return new Promise((resolve) => {
      Alert.prompt(
        '📄 Nome do PDF',
        'Como deseja nomear o arquivo PDF?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: 'OK',
            onPress: (fileName?: string) => {
              const cleanName = fileName?.trim();
              if (cleanName) {
                resolve(cleanName);
              } else {
                resolve('Meu Poema');
              }
            },
          },
        ],
        'plain-text',
        'Meu Poema'
      );
    });
  }

  private static async saveToDownloads(uri: string, fileName: string): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        // Solicitar permissão para acessar a galeria/storage
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'É necessário permitir acesso ao armazenamento para salvar o PDF.');
          return;
        }

        // Limpar o nome do arquivo
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9\s\-_.]/g, '').trim();
        const finalFileName = `${cleanFileName || 'Poema'}.pdf`;

        // Criar asset na galeria (que vai para Downloads)
        const asset = await MediaLibrary.createAssetAsync(uri);
        
        // Tentar criar/encontrar álbum Downloads
        let album = await MediaLibrary.getAlbumAsync('Downloads');
        if (!album) {
          album = await MediaLibrary.createAlbumAsync('Downloads', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert(
          '✅ PDF Salvo',
          `"${finalFileName}" foi salvo na pasta Downloads com sucesso!`,
          [{ text: 'OK' }]
        );
        
      } else {
        // iOS - usar compartilhamento
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Salvar: ${fileName}`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar na pasta Downloads:', error);
      Alert.alert('Erro', 'Não foi possível salvar o PDF na pasta Downloads. Tente novamente.');
    }
  }

  private static async savePDFToDevice(uri: string, title: string): Promise<void> {
    // Limpar o nome do arquivo removendo caracteres especiais
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
    const fileName = `${cleanTitle || 'Poema'}.pdf`;
    const newUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.moveAsync({ from: uri, to: newUri });
    console.log('✅ PDF salvo como:', fileName);
    console.log('📁 Localização:', newUri);
  }
}
