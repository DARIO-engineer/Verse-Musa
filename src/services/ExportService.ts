// FUNCIONALIDADE DE EXPORTAÇÃO REMOVIDA

export class ExportService {
  static async showExportOptions(): Promise<void> {
    // Funcionalidade removida
  }
}
      ]
    );
  }

  /**
   * Exporta uma obra 
   */
  static async exportWork(draft: Draft, options: ExportOptions = { format: 'txt' }): Promise<void> {
    try {
      const { format, includeMetadata = true } = options;
      
      if (format === 'txt') {
        await this.exportAsText(draft, includeMetadata);
      } else if (format === 'pdf') {
        await this.exportAsPDF(draft, includeMetadata);
      } else {
        throw new Error('Formato não suportado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao exportar obra:', error);
      Alert.alert(
        '❌ Erro na Exportação',
        'Não foi possível exportar a obra. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Exporta como texto simples
   */
  private static async exportAsText(draft: Draft, includeMetadata: boolean): Promise<void> {
    const content = this.generateTextContent(draft, includeMetadata);
    const title = `${draft.title || 'Obra'}.txt`;

    // Usar o compartilhamento nativo do React Native
    const result = await Share.share({
      message: content,
      title: title,
    }, {
      dialogTitle: `Exportar "${draft.title}"`,
      subject: title,
    });

    if (result.action === Share.sharedAction) {
      console.log('✅ Obra em texto compartilhada com sucesso');
      
      Alert.alert(
        '✅ Obra Exportada',
        `"${draft.title}" foi exportada como texto com sucesso!`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Exporta como PDF
   */
  private static async exportAsPDF(draft: Draft, includeMetadata: boolean): Promise<void> {
    try {
      Alert.alert(
        'Exportar PDF',
        'O que deseja fazer?',
        [
          {
            text: 'Compartilhar',
            onPress: async () => {
              await ExportService.generateAndSharePDF(draft, includeMetadata);
            }
          },
          {
            text: 'Baixar',
            onPress: async () => {
              await ExportService.generateAndDownloadPDF(draft, includeMetadata);
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error);
      Alert.alert(
        '❌ Erro ao Exportar PDF',
        'Não foi possível exportar o PDF. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }

  private static async generateAndSharePDF(draft: Draft, includeMetadata: boolean) {
    try {
      const htmlContent = this.generatePDFContent(draft, includeMetadata);
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      
      if (uri && await Sharing.isAvailableAsync()) {
        const result = await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Compartilhar "${draft.title}"`,
          UTI: 'com.adobe.pdf',
        });
        
        // Não mostrar alerta automático - deixar o sistema de compartilhamento lidar com isso
        console.log('📄 PDF disponibilizado para compartilhamento');
      } else {
        Alert.alert('PDF Gerado', `Arquivo salvo em: ${uri}`);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar PDF para compartilhamento:', error);
      Alert.alert(
        '❌ Erro ao Compartilhar PDF',
        'Não foi possível gerar o PDF para compartilhamento. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }

  private static async generateAndDownloadPDF(draft: Draft, includeMetadata: boolean) {
    try {
      const htmlContent = this.generatePDFContent(draft, includeMetadata);
      const fileName = `${draft.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Obra'}.pdf`;
      
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent, 
        base64: false,
        width: 612,
        height: 792,
        margins: {
          left: 50,
          top: 50,
          right: 50,
          bottom: 50,
        }
      });

      if (Platform.OS === 'android') {
        // Usar o sistema de compartilhamento nativo para Android
        if (await Sharing.isAvailableAsync()) {
          const result = await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Salvar "${draft.title}"`,
            UTI: 'com.adobe.pdf',
          });
          
          // Não mostrar alerta automático - o usuário pode ter cancelado
          console.log('📄 PDF disponibilizado para compartilhamento/download');
        } else {
          Alert.alert(
            '📄 PDF Criado',
            `PDF gerado com sucesso!\nLocalização: ${uri}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        // iOS - usar o sistema nativo de compartilhamento
        if (await Sharing.isAvailableAsync()) {
          const result = await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Salvar "${draft.title}"`,
            UTI: 'com.adobe.pdf',
          });
          
          // Não mostrar alerta automático - o usuário pode ter cancelado
          console.log('📄 PDF disponibilizado para compartilhamento/download');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      Alert.alert(
        '❌ Erro ao Gerar PDF',
        'Não foi possível criar o PDF. Verifique se há espaço suficiente no dispositivo.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Gera conteúdo em formato texto simples
   */
  private static generateTextContent(draft: Draft, includeMetadata: boolean): string {
    let content = '';

    // Título
    if (draft.title) {
      content += `${draft.title}\n`;
      content += '='.repeat(draft.title.length) + '\n\n';
    }

    // Metadados
    if (includeMetadata) {
      content += '📋 INFORMAÇÕES DA OBRA\n';
      content += '-'.repeat(25) + '\n';
      content += `Tipo: ${draft.category || 'Não especificado'}\n`;
      content += `Criado em: ${new Date(draft.createdAt).toLocaleDateString('pt-BR')}\n`;
      
      if (draft.updatedAt && draft.updatedAt !== draft.createdAt) {
        content += `Atualizado em: ${new Date(draft.updatedAt).toLocaleDateString('pt-BR')}\n`;
      }
      
      const wordCount = draft.content?.split(/\s+/).filter(word => word.length > 0).length || 0;
      const verseCount = draft.content?.split('\n').filter(line => line.trim()).length || 0;
      
      content += `Palavras: ${wordCount}\n`;
      content += `Versos: ${verseCount}\n`;
      
      
      content += '\n' + '='.repeat(50) + '\n\n';
    }

    // Conteúdo principal
    content += draft.content || '';

    // Rodapé
    content += '\n\n---\nExportado do Verso & Musa 🎭';

    return content;
  }

  /**
   * Gera conteúdo HTML para PDF (bem formatado com suporte a markdown)
   */
  private static generatePDFContent(draft: Draft, includeMetadata: boolean): string {
    const title = draft.title || 'Obra Sem Título';
    const rawContent = draft.content || '';
    const createdDate = new Date(draft.createdAt).toLocaleDateString('pt-BR');
    const wordCount = rawContent.split(/\s+/).filter(word => word.length > 0).length;
    const verseCount = rawContent.split('\n').filter(line => line.trim()).length;

    // Converter markdown para HTML
    const content = this.convertMarkdownToHTML(rawContent);

    let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @page { 
            margin: 2cm; 
            size: A4; 
        }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin: 0 0 10px 0;
        }
        .subtitle {
            font-size: 1.2em;
            color: #7f8c8d;
            font-style: italic;
        }
        .metadata {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .metadata h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .metadata p {
            margin: 5px 0;
        }
        .content {
            background: white;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid #e1e8ed;
            border-radius: 5px;
        }
        .poem-content {
            font-size: 1.1em;
            line-height: 1.8;
            font-style: italic;
            text-align: left;
            text-indent: 20px;
        }
        .poem-content strong {
            font-weight: bold;
            color: #2c3e50;
        }
        .poem-content em {
            font-style: italic;
            color: #34495e;
        }
        .poem-content u {
            text-decoration: underline;
            color: #3498db;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #3498db;
            color: #7f8c8d;
            font-style: italic;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${title}</h1>
            <div class="subtitle">Uma criação poética</div>
        </div>`;

    if (includeMetadata) {
        html += `
        <div class="metadata">
            <h3>📋 Informações da Obra</h3>
            <p><strong>Tipo:</strong> ${draft.category || 'Não especificado'}</p>
            <p><strong>Data de Criação:</strong> ${createdDate}</p>
            <p><strong>Palavras:</strong> ${wordCount}</p>
            <p><strong>Versos:</strong> ${verseCount}</p>`;
        
        
        html += `</div>`;
    }

    html += `
        <div class="content">
            <div class="poem-content">${content}</div>
        </div>
        
        <div class="footer">
            Exportado do Verso & Musa 🎭<br>
            ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Converte markdown simples para HTML
   */
  private static convertMarkdownToHTML(text: string): string {
    let html = text;
    
    // Converter negrito: **texto** -> <strong>texto</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter itálico: *texto* -> <em>texto</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Converter sublinhado: _texto_ -> <u>texto</u>
    html = html.replace(/_(.*?)_/g, '<u>$1</u>');
    
    // Preservar quebras de linha
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Exporta múltiplas obras (funcionalidade futura)
   */
  static async exportMultipleWorks(drafts: Draft[], format: 'txt' | 'pdf' = 'txt'): Promise<void> {
    Alert.alert(
      '🚧 Em Desenvolvimento',
      'A exportação de múltiplas obras será implementada em breve.',
      [{ text: 'OK' }]
    );
  }
}
