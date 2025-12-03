// src/services/ErrorService.ts
import { Alert } from 'react-native';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
  context?: string;
  action?: string;
}

type ErrorHandler = (error: AppError) => void;

class ErrorService {
  private static listeners: ErrorHandler[] = [];
  private static errors: AppError[] = [];

  /**
   * Registra um listener para erros
   */
  static addErrorListener(handler: ErrorHandler): () => void {
    this.listeners.push(handler);
    return () => {
      const index = this.listeners.indexOf(handler);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Mostra um erro de forma visível para o usuário
   */
  static showError(message: string, context?: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    const error: AppError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
      context,
    };

    this.errors.push(error);
    
    // Notificar listeners
    this.listeners.forEach(listener => listener(error));

    // Fallback para Alert se não houver listeners
    if (this.listeners.length === 0) {
      const title = type === 'error' ? '❌ Erro' : 
                   type === 'warning' ? '⚠️ Aviso' : 
                   'ℹ️ Informação';
      
      Alert.alert(title, message, [{ text: 'OK' }]);
    }

    // Log no console para debugging
    console.error(`[${type.toUpperCase()}] ${context || 'App'}:`, message);
  }

  /**
   * Mostra erro de rede
   */
  static showNetworkError(): void {
    this.showError(
      'Problema de conexão. Verifique sua internet e tente novamente.',
      'Network',
      'warning'
    );
  }

  /**
   * Mostra erro de dados
   */
  static showDataError(action: string): void {
    this.showError(
      `Não foi possível ${action}. Tente novamente em alguns instantes.`,
      'Data',
      'error'
    );
  }

  /**
   * Mostra erro de validação
   */
  static showValidationError(field: string): void {
    this.showError(
      `${field} é obrigatório ou contém informações inválidas.`,
      'Validation',
      'warning'
    );
  }

  /**
   * Mostra erro genérico
   */
  static showGenericError(): void {
    this.showError(
      'Algo deu errado. Por favor, tente novamente.',
      'Generic',
      'error'
    );
  }

  /**
   * Mostra mensagem de sucesso
   */
  static showSuccess(message: string): void {
    this.showError(message, 'Success', 'info');
  }

  /**
   * Trata erros de JavaScript não capturados
   */
  static handleUncaughtError(error: Error, isFatal?: boolean): void {
    const message = isFatal 
      ? 'Erro crítico detectado. O app será reiniciado.'
      : `Erro inesperado: ${error.message}`;
    
    this.showError(message, 'Uncaught', 'error');
    
    // Log detalhado
    console.error('🚨 Uncaught Error:', {
      message: error.message,
      stack: error.stack,
      isFatal,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtém histórico de erros
   */
  static getErrorHistory(): AppError[] {
    return [...this.errors].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Limpa histórico de erros
   */
  static clearErrorHistory(): void {
    this.errors = [];
  }

  /**
   * Trata erros de promessas rejeitadas
   */
  static handlePromiseRejection(reason: any): void {
    const message = reason?.message || 'Operação falhou inesperadamente';
    this.showError(message, 'Promise', 'error');
    
    console.error('🔥 Promise Rejection:', reason);
  }
}

// Configurar handlers globais
if (typeof global !== 'undefined') {
  // Handler para erros JavaScript não capturados
  const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
  
  (global as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    ErrorService.handleUncaughtError(error, isFatal);
    originalHandler?.(error, isFatal);
  });

  // Handler para promessas rejeitadas
  const trackingOptions = { allRejections: true };
  require('promise/setimmediate/rejection-tracking').enable(trackingOptions);
  
  process.on?.('unhandledRejection', (reason) => {
    ErrorService.handlePromiseRejection(reason);
  });
}

export { ErrorService };
