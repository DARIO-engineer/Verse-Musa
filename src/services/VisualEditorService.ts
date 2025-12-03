// src/services/VisualEditorService.ts
export interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface TextSelection {
  start: number;
  end: number;
}

export interface FormattedText {
  text: string;
  format: TextFormat;
  start: number;
  end: number;
}

export interface VisualEditorSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'serif' | 'monospace' | 'cursive';
  lineHeight: number;
  backgroundColor: string;
  textColor: string;
  enableTypewriter: boolean;
  typewriterSpeed: number;
  showWordCount: boolean;
  showLineNumbers: boolean;
}

class VisualEditorService {
  private defaultSettings: VisualEditorSettings = {
    fontSize: 'medium',
    fontFamily: 'default',
    lineHeight: 1.6,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    enableTypewriter: false,
    typewriterSpeed: 50,
    showWordCount: true,
    showLineNumbers: false,
  };

  // Formatação de texto
  applyBold(text: string, selection: TextSelection): string {
    const before = text.substring(0, selection.start);
    const selected = text.substring(selection.start, selection.end);
    const after = text.substring(selection.end);
    
    return `${before}**${selected}**${after}`;
  }

  applyItalic(text: string, selection: TextSelection): string {
    const before = text.substring(0, selection.start);
    const selected = text.substring(selection.start, selection.end);
    const after = text.substring(selection.end);
    
    return `${before}*${selected}*${after}`;
  }

  applyUnderline(text: string, selection: TextSelection): string {
    const before = text.substring(0, selection.start);
    const selected = text.substring(selection.start, selection.end);
    const after = text.substring(selection.end);
    
    return `${before}<u>${selected}</u>${after}`;
  }

  // Fontes disponíveis
  getFontFamilies(): { [key: string]: string } {
    return {
      default: 'System',
      serif: 'Times New Roman',
      monospace: 'Courier New',
      cursive: 'Dancing Script',
    };
  }

  // Tamanhos de fonte
  getFontSizes(): { [key: string]: number } {
    return {
      'small': 14,
      'medium': 16,
      'large': 18,
      'extra-large': 20,
    };
  }

  // Aplicar configurações visuais
  getTextStyle(settings: Partial<VisualEditorSettings>): any {
    const mergedSettings = { ...this.defaultSettings, ...settings };
    const fontSizes = this.getFontSizes();
    
    return {
      fontSize: fontSizes[mergedSettings.fontSize],
      fontFamily: this.getFontFamilies()[mergedSettings.fontFamily],
      lineHeight: mergedSettings.lineHeight,
      color: mergedSettings.textColor,
      backgroundColor: mergedSettings.backgroundColor,
    };
  }

  // Modo máquina de escrever
  simulateTypewriter(text: string, speed: number = 50): Promise<string[]> {
    return new Promise((resolve) => {
      const words = text.split(' ');
      const result: string[] = [];
      let currentText = '';
      
      const typeWord = (index: number) => {
        if (index >= words.length) {
          resolve(result);
          return;
        }
        
        currentText += (index > 0 ? ' ' : '') + words[index];
        result.push(currentText);
        
        setTimeout(() => typeWord(index + 1), speed);
      };
      
      typeWord(0);
    });
  }

  // Análise de texto
  analyzeText(text: string): {
    wordCount: number;
    characterCount: number;
    lineCount: number;
    paragraphCount: number;
    averageWordsPerLine: number;
    readingTime: number; // em minutos
  } {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return {
      wordCount: words.length,
      characterCount: characters,
      lineCount: lines,
      paragraphCount: paragraphs,
      averageWordsPerLine: lines > 0 ? Math.round(words.length / lines) : 0,
      readingTime: Math.ceil(words.length / 200), // 200 palavras por minuto
    };
  }

  // Inserção de elementos especiais
  insertQuote(text: string, cursorPosition: number, quote: string): string {
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);
    
    return `${before}\n\n> "${quote}"\n\n${after}`;
  }

  insertSeparator(text: string, cursorPosition: number, type: 'line' | 'stars' | 'dots' = 'line'): string {
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);
    
    const separators = {
      line: '\n\n---\n\n',
      stars: '\n\n* * *\n\n',
      dots: '\n\n• • •\n\n',
    };
    
    return `${before}${separators[type]}${after}`;
  }

  // Layouts visuais para poemas
  applyPoemLayout(text: string, layout: 'center' | 'left' | 'right' | 'justify'): string {
    const lines = text.split('\n');
    
    switch (layout) {
      case 'center':
        return lines.map(line => `<center>${line}</center>`).join('\n');
      case 'right':
        return lines.map(line => `<div style="text-align: right">${line}</div>`).join('\n');
      case 'justify':
        return lines.map(line => `<div style="text-align: justify">${line}</div>`).join('\n');
      default:
        return text;
    }
  }

  // Temas visuais predefinidos
  getVisualThemes(): { [key: string]: Partial<VisualEditorSettings> } {
    return {
      classic: {
        fontFamily: 'serif',
        fontSize: 'medium',
        backgroundColor: '#F5F5DC',
        textColor: '#2F4F4F',
        lineHeight: 1.8,
      },
      modern: {
        fontFamily: 'default',
        fontSize: 'medium',
        backgroundColor: '#FFFFFF',
        textColor: '#333333',
        lineHeight: 1.6,
      },
      typewriter: {
        fontFamily: 'monospace',
        fontSize: 'medium',
        backgroundColor: '#F0F0F0',
        textColor: '#000000',
        lineHeight: 1.5,
        enableTypewriter: true,
      },
      elegant: {
        fontFamily: 'cursive',
        fontSize: 'large',
        backgroundColor: '#FFF8DC',
        textColor: '#8B4513',
        lineHeight: 1.7,
      },
      dark: {
        fontFamily: 'default',
        fontSize: 'medium',
        backgroundColor: '#1A1A1A',
        textColor: '#E0E0E0',
        lineHeight: 1.6,
      },
      minimal: {
        fontFamily: 'default',
        fontSize: 'medium',
        backgroundColor: '#FAFAFA',
        textColor: '#555555',
        lineHeight: 1.5,
      },
    };
  }

  // Exportar texto formatado
  exportFormattedText(text: string, format: 'html' | 'markdown' | 'rtf'): string {
    switch (format) {
      case 'html':
        return this.convertToHTML(text);
      case 'markdown':
        return this.convertToMarkdown(text);
      case 'rtf':
        return this.convertToRTF(text);
      default:
        return text;
    }
  }

  private convertToHTML(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/\n/g, '<br>');
  }

  private convertToMarkdown(text: string): string {
    // Texto já está em formato markdown básico
    return text;
  }

  private convertToRTF(text: string): string {
    return `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
  }

  // Validação de formatação
  validateFormatting(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar tags não fechadas
    const boldMatches = text.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) {
      errors.push('Tag de negrito não fechada (**texto**)');
    }
    
    const italicMatches = text.match(/(?<!\*)\*(?!\*)/g);
    if (italicMatches && italicMatches.length % 2 !== 0) {
      errors.push('Tag de itálico não fechada (*texto*)');
    }
    
    const underlineMatches = text.match(/<u>|<\/u>/g);
    if (underlineMatches && underlineMatches.length % 2 !== 0) {
      errors.push('Tag de sublinhado não fechada (<u>texto</u>)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sugestões de melhoria visual
  getSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const analysis = this.analyzeText(text);
    
    if (analysis.lineCount > 20 && analysis.paragraphCount < 3) {
      suggestions.push('Considere dividir o texto em mais parágrafos para melhor legibilidade');
    }
    
    if (analysis.averageWordsPerLine > 15) {
      suggestions.push('Linhas muito longas podem prejudicar a leitura. Considere quebras de linha');
    }
    
    if (analysis.wordCount < 10) {
      suggestions.push('Texto muito curto. Considere expandir suas ideias');
    }
    
    if (analysis.readingTime > 10) {
      suggestions.push('Texto longo. Considere dividir em seções ou capítulos');
    }
    
    return suggestions;
  }
}

export default new VisualEditorService();
