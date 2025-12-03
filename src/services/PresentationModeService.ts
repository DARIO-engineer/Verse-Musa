// src/services/PresentationModeService.ts
import { Dimensions } from 'react-native';

export interface PresentationSlide {
  id: string;
  content: string;
  type: 'title' | 'verse' | 'stanza' | 'conclusion';
  duration?: number; // em segundos
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface PresentationSettings {
  autoAdvance: boolean;
  slideInterval: number; // em segundos
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  textColor: string;
  showProgress: boolean;
  showTimer: boolean;
  enableGestures: boolean;
}

export interface PresentationData {
  id: string;
  title: string;
  author: string;
  slides: PresentationSlide[];
  settings: PresentationSettings;
  totalDuration: number;
}

class PresentationModeService {
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  constructor() {
    const { width, height } = Dimensions.get('window');
    this.screenWidth = width;
    this.screenHeight = height;
  }

  // Configurações padrão
  private defaultSettings: PresentationSettings = {
    autoAdvance: false,
    slideInterval: 5,
    fontSize: 'medium',
    textAlign: 'center',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    showProgress: true,
    showTimer: false,
    enableGestures: true
  };

  // Converter poema em slides
  createPresentationFromPoem(
    title: string,
    content: string,
    author: string = 'Autor Anônimo',
    customSettings?: Partial<PresentationSettings>
  ): PresentationData {
    const settings = { ...this.defaultSettings, ...customSettings };
    const slides: PresentationSlide[] = [];

    // Slide de título
    slides.push({
      id: 'title',
      content: title,
      type: 'title',
      fontSize: this.getFontSize(settings.fontSize, 'title'),
      textAlign: settings.textAlign
    });

    // Slide do autor
    if (author && author !== 'Autor Anônimo') {
      slides.push({
        id: 'author',
        content: `por ${author}`,
        type: 'title',
        fontSize: this.getFontSize(settings.fontSize, 'subtitle'),
        textAlign: settings.textAlign
      });
    }

    // Processar conteúdo do poema
    const lines = content.split('\n').filter(line => line.trim() !== '');
    let currentStanza: string[] = [];
    let slideIndex = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        // Linha vazia indica fim de estrofe
        if (currentStanza.length > 0) {
          slides.push({
            id: `stanza-${slideIndex++}`,
            content: currentStanza.join('\n'),
            type: 'stanza',
            fontSize: this.getFontSize(settings.fontSize, 'content'),
            textAlign: settings.textAlign,
            duration: settings.slideInterval
          });
          currentStanza = [];
        }
      } else {
        currentStanza.push(trimmedLine);
      }
    });

    // Adicionar última estrofe se houver
    if (currentStanza.length > 0) {
      slides.push({
        id: `stanza-${slideIndex}`,
        content: currentStanza.join('\n'),
        type: 'stanza',
        fontSize: this.getFontSize(settings.fontSize, 'content'),
        textAlign: settings.textAlign,
        duration: settings.slideInterval
      });
    }

    // Slide de conclusão
    slides.push({
      id: 'conclusion',
      content: 'Fim',
      type: 'conclusion',
      fontSize: this.getFontSize(settings.fontSize, 'title'),
      textAlign: settings.textAlign
    });

    const totalDuration = slides.reduce((sum, slide) => sum + (slide.duration || 3), 0);

    return {
      id: Date.now().toString(),
      title,
      author,
      slides,
      settings,
      totalDuration
    };
  }

  // Criar apresentação verso por verso
  createVerseByVersePresentation(
    title: string,
    content: string,
    author: string = 'Autor Anônimo',
    customSettings?: Partial<PresentationSettings>
  ): PresentationData {
    const settings = { ...this.defaultSettings, ...customSettings };
    const slides: PresentationSlide[] = [];

    // Slide de título
    slides.push({
      id: 'title',
      content: title,
      type: 'title',
      fontSize: this.getFontSize(settings.fontSize, 'title'),
      textAlign: settings.textAlign
    });

    // Processar cada verso individualmente
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine !== '') {
        slides.push({
          id: `verse-${index}`,
          content: trimmedLine,
          type: 'verse',
          fontSize: this.getFontSize(settings.fontSize, 'content'),
          textAlign: settings.textAlign,
          duration: settings.slideInterval
        });
      }
    });

    // Slide final com poema completo
    slides.push({
      id: 'complete',
      content: content,
      type: 'conclusion',
      fontSize: this.getFontSize(settings.fontSize, 'small'),
      textAlign: settings.textAlign
    });

    const totalDuration = slides.reduce((sum, slide) => sum + (slide.duration || 3), 0);

    return {
      id: Date.now().toString(),
      title,
      author,
      slides,
      settings,
      totalDuration
    };
  }

  // Obter tamanho de fonte baseado nas configurações
  private getFontSize(size: PresentationSettings['fontSize'], type: 'title' | 'subtitle' | 'content' | 'small'): number {
    const baseSizes = {
      'extra-large': { title: 48, subtitle: 36, content: 32, small: 24 },
      'large': { title: 40, subtitle: 30, content: 26, small: 20 },
      'medium': { title: 32, subtitle: 24, content: 20, small: 16 },
      'small': { title: 24, subtitle: 18, content: 16, small: 12 }
    };

    // Ajustar para tamanho da tela
    const screenFactor = Math.min(this.screenWidth / 375, this.screenHeight / 667);
    const adjustedSize = baseSizes[size][type] * screenFactor;
    
    return Math.round(adjustedSize);
  }

  // Calcular layout otimizado para o texto
  calculateOptimalLayout(text: string, fontSize: number): {
    maxLines: number;
    lineHeight: number;
    padding: number;
  } {
    const lineHeight = fontSize * 1.4;
    const padding = Math.max(20, this.screenWidth * 0.05);
    const availableHeight = this.screenHeight - (padding * 2) - 100; // 100 para controles
    const maxLines = Math.floor(availableHeight / lineHeight);

    return {
      maxLines,
      lineHeight,
      padding
    };
  }

  // Temas predefinidos
  getThemes(): { [key: string]: Partial<PresentationSettings> } {
    return {
      'dark': {
        backgroundColor: '#000000',
        textColor: '#FFFFFF'
      },
      'light': {
        backgroundColor: '#FFFFFF',
        textColor: '#000000'
      },
      'sepia': {
        backgroundColor: '#F4F1E8',
        textColor: '#5D4037'
      },
      'night': {
        backgroundColor: '#1A1A2E',
        textColor: '#E94560'
      },
      'nature': {
        backgroundColor: '#0F3460',
        textColor: '#16A085'
      },
      'poetry': {
        backgroundColor: '#2C3E50',
        textColor: '#F39C12'
      }
    };
  }

  // Validar configurações
  validateSettings(settings: Partial<PresentationSettings>): PresentationSettings {
    return {
      autoAdvance: settings.autoAdvance ?? this.defaultSettings.autoAdvance,
      slideInterval: Math.max(1, Math.min(30, settings.slideInterval ?? this.defaultSettings.slideInterval)),
      fontSize: settings.fontSize ?? this.defaultSettings.fontSize,
      textAlign: settings.textAlign ?? this.defaultSettings.textAlign,
      backgroundColor: settings.backgroundColor ?? this.defaultSettings.backgroundColor,
      textColor: settings.textColor ?? this.defaultSettings.textColor,
      showProgress: settings.showProgress ?? this.defaultSettings.showProgress,
      showTimer: settings.showTimer ?? this.defaultSettings.showTimer,
      enableGestures: settings.enableGestures ?? this.defaultSettings.enableGestures
    };
  }

  // Exportar apresentação para compartilhamento
  exportPresentation(presentation: PresentationData): string {
    const exportData = {
      title: presentation.title,
      author: presentation.author,
      slides: presentation.slides.map(slide => ({
        content: slide.content,
        type: slide.type
      })),
      createdAt: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Importar apresentação
  importPresentation(jsonData: string): PresentationData | null {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.title || !data.slides || !Array.isArray(data.slides)) {
        throw new Error('Formato inválido');
      }

      const slides: PresentationSlide[] = data.slides.map((slide: any, index: number) => ({
        id: `imported-${index}`,
        content: slide.content || '',
        type: slide.type || 'verse',
        fontSize: this.getFontSize('medium', slide.type || 'content'),
        textAlign: 'center',
        duration: this.defaultSettings.slideInterval
      }));

      return {
        id: Date.now().toString(),
        title: data.title,
        author: data.author || 'Autor Anônimo',
        slides,
        settings: this.defaultSettings,
        totalDuration: slides.reduce((sum, slide) => sum + (slide.duration || 3), 0)
      };
    } catch (error) {
      console.error('Erro ao importar apresentação:', error);
      return null;
    }
  }

  // Gerar estatísticas da apresentação
  generatePresentationStats(presentation: PresentationData): {
    totalSlides: number;
    totalWords: number;
    estimatedReadingTime: number;
    averageWordsPerSlide: number;
    longestSlide: string;
  } {
    const totalSlides = presentation.slides.length;
    const allText = presentation.slides.map(s => s.content).join(' ');
    const words = allText.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    
    // Tempo estimado de leitura (200 palavras por minuto)
    const estimatedReadingTime = Math.ceil(totalWords / 200);
    
    const averageWordsPerSlide = Math.round(totalWords / totalSlides);
    
    // Slide mais longo
    let longestSlide = '';
    let maxWords = 0;
    presentation.slides.forEach(slide => {
      const slideWords = slide.content.split(/\s+/).length;
      if (slideWords > maxWords) {
        maxWords = slideWords;
        longestSlide = slide.content.substring(0, 50) + '...';
      }
    });

    return {
      totalSlides,
      totalWords,
      estimatedReadingTime,
      averageWordsPerSlide,
      longestSlide
    };
  }
}

export default new PresentationModeService();
