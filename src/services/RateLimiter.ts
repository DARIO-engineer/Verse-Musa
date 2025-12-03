// src/services/RateLimiter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitConfig {
  maxRequests: number; // Máximo de requisições
  windowMs: number; // Janela de tempo em milissegundos
  storageKey: string; // Chave no AsyncStorage
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Verifica se pode fazer nova requisição
   */
  async canMakeRequest(): Promise<boolean> {
    try {
      const now = Date.now();
      const record = await this.getRequestRecord();

      // Limpar registros antigos
      if (now - record.timestamp > this.config.windowMs) {
        // Nova janela de tempo
        await this.resetRequestRecord(now);
        return true;
      }

      // Verificar se atingiu o limite
      if (record.count >= this.config.maxRequests) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar rate limit:', error);
      return true; // Em caso de erro, permitir (fail-open)
    }
  }

  /**
   * Registra uma nova requisição
   */
  async recordRequest(): Promise<void> {
    try {
      const now = Date.now();
      const record = await this.getRequestRecord();

      // Se está em nova janela, resetar
      if (now - record.timestamp > this.config.windowMs) {
        await this.resetRequestRecord(now);
      } else {
        // Incrementar contador
        record.count++;
        await this.saveRequestRecord(record);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar requisição:', error);
    }
  }

  /**
   * Obtém tempo restante até poder fazer nova requisição (em ms)
   */
  async getTimeUntilReset(): Promise<number> {
    try {
      const record = await this.getRequestRecord();
      const now = Date.now();
      const elapsed = now - record.timestamp;
      
      if (elapsed >= this.config.windowMs) {
        return 0;
      }

      return this.config.windowMs - elapsed;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtém número de requisições restantes
   */
  async getRemainingRequests(): Promise<number> {
    try {
      const record = await this.getRequestRecord();
      const now = Date.now();

      // Se passou a janela, resetar
      if (now - record.timestamp > this.config.windowMs) {
        return this.config.maxRequests;
      }

      return Math.max(0, this.config.maxRequests - record.count);
    } catch (error) {
      return this.config.maxRequests;
    }
  }

  /**
   * Obtém mensagem de erro amigável
   */
  async getErrorMessage(): Promise<string> {
    const timeUntilReset = await this.getTimeUntilReset();
    const minutes = Math.ceil(timeUntilReset / 60000);
    
    if (minutes < 1) {
      return 'Aguarde alguns segundos antes de tentar novamente.';
    } else if (minutes === 1) {
      return 'Você atingiu o limite de uso. Aguarde 1 minuto.';
    } else {
      return `Você atingiu o limite de uso. Aguarde ${minutes} minutos.`;
    }
  }

  /**
   * Reseta o contador manualmente
   */
  async reset(): Promise<void> {
    await this.resetRequestRecord(Date.now());
  }

  // Métodos privados

  private async getRequestRecord(): Promise<RequestRecord> {
    try {
      const stored = await AsyncStorage.getItem(this.config.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Erro ao ler rate limit:', error);
    }

    // Retorna registro vazio
    return {
      timestamp: Date.now(),
      count: 0,
    };
  }

  private async saveRequestRecord(record: RequestRecord): Promise<void> {
    try {
      await AsyncStorage.setItem(this.config.storageKey, JSON.stringify(record));
    } catch (error) {
      console.error('❌ Erro ao salvar rate limit:', error);
    }
  }

  private async resetRequestRecord(timestamp: number): Promise<void> {
    const record: RequestRecord = {
      timestamp,
      count: 0,
    };
    await this.saveRequestRecord(record);
  }
}

// Rate limiters pré-configurados
export class GeminiRateLimiter extends RateLimiter {
  constructor() {
    super({
      maxRequests: 10, // 10 requisições
      windowMs: 60000, // Por minuto
      storageKey: '@VersoEMusa:gemini_rate_limit',
    });
  }
}

export class MusaChatRateLimiter extends RateLimiter {
  constructor() {
    super({
      maxRequests: 20, // 20 mensagens
      windowMs: 300000, // Por 5 minutos
      storageKey: '@VersoEMusa:musa_chat_rate_limit',
    });
  }
}

export class BackupRateLimiter extends RateLimiter {
  constructor() {
    super({
      maxRequests: 5, // 5 backups
      windowMs: 3600000, // Por hora
      storageKey: '@VersoEMusa:backup_rate_limit',
    });
  }
}
