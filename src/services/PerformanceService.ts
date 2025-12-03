// src/services/PerformanceService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, PixelRatio } from 'react-native';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface PerformanceMetrics {
  screenLoadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  averageAnimationFPS: number;
}

export class PerformanceService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static metrics: PerformanceMetrics = {
    screenLoadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    averageAnimationFPS: 0,
  };

  // Cache inteligente com expiração
  static async setCache<T>(key: string, data: T, expiresInMs: number = 300000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    };
    
    this.cache.set(key, entry);
    
    // Persiste cache importante
    if (key.includes('critical') || key.includes('user')) {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    }
  }

  static async getCache<T>(key: string): Promise<T | null> {
    // Verifica cache em memória primeiro
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      this.metrics.cacheHitRate += 0.1;
      return memoryEntry.data;
    }

    // Verifica cache persistido
    try {
      const persistedData = await AsyncStorage.getItem(`cache_${key}`);
      if (persistedData) {
        const entry: CacheEntry<T> = JSON.parse(persistedData);
        if (this.isValidEntry(entry)) {
          this.cache.set(key, entry);
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  private static isValidEntry(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.expiresIn;
  }

  // Otimização de imagens baseada no dispositivo
  static getOptimalImageSize(): { width: number; height: number } {
    const { width, height } = Dimensions.get('window');
    const pixelDensity = PixelRatio.get();
    
    return {
      width: Math.round(width * pixelDensity),
      height: Math.round(height * pixelDensity),
    };
  }

  // Debounce inteligente para pesquisas
  static smartDebounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastArgs: Parameters<T>;
    
    return (...args: Parameters<T>) => {
      lastArgs = args;
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        func(...lastArgs);
      }, delay);
    };
  }

  // Preload inteligente de dados
  static async preloadCriticalData(): Promise<void> {
    const criticalKeys = ['user_preferences', 'recent_drafts', 'achievements'];
    
    const preloadPromises = criticalKeys.map(async (key) => {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          await this.setCache(key, JSON.parse(data), 600000); // 10 min
        }
      } catch (error) {
        console.warn(`Preload failed for ${key}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Monitor de performance
  static startPerformanceMonitoring(): void {
    const startTime = Date.now();
    
    // Monitor de memória (simulado)
    setInterval(() => {
      this.metrics.memoryUsage = this.cache.size * 0.1; // Estimativa
    }, 5000);

    // Cleanup de cache automático
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // 1 minuto
  }

  private static cleanupExpiredCache(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidEntry(entry)) {
        this.cache.delete(key);
      }
    }
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Otimização de scroll para listas grandes
  static getOptimalListConfig(itemCount: number) {
    const { height } = Dimensions.get('window');
    const itemHeight = 120; // altura estimada do item
    const windowSize = Math.ceil(height / itemHeight) + 2;
    
    return {
      windowSize,
      maxToRenderPerBatch: Math.min(10, itemCount / 4),
      updateCellsBatchingPeriod: 50,
      removeClippedSubviews: itemCount > 50,
      getItemLayout: (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
    };
  }
}

// Inicializa o serviço
PerformanceService.startPerformanceMonitoring();
PerformanceService.preloadCriticalData();
