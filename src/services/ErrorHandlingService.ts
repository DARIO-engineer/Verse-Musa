// src/services/ErrorHandlingService.ts
import { Alert } from 'react-native';
import { NotificationService } from './NotificationService';

declare var global: any;

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandlingService {
  private static errorHistory: AppError[] = [];
  private static maxHistorySize = 50;

  /**
   * Registra um erro e o exibe ao usuário de forma amigável
   */
  static handleError(error: Error | string, context?: string): void {
    const appError: AppError = {
      code: context || 'UNKNOWN_ERROR',
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'object' ? error : undefined,
      timestamp: new Date(),
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
    };

    // Salvar no histórico
    this.addToHistory(appError);

    // Log para desenvolvimento
    console.error('🚨 ErrorHandlingService:', appError);

    // Mostrar para o usuário
    this.showUserFriendlyError(appError);
  }

  /**
   * Mostra erro de forma amigável para o usuário
   */
  private static showUserFriendlyError(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    
    // Tentar mostrar notificação push primeiro
    try {
      NotificationService.addSystemNotification(
        '⚠️ Atenção',
        userMessage
      ).catch(() => {
        // Se falhar, usar Alert como fallback
        this.showErrorAlert(userMessage, error);
      });
    } catch {
      // Fallback para Alert
      this.showErrorAlert(userMessage, error);
    }
  }

  /**
   * Mostra Alert de erro
   */
  private static showErrorAlert(message: string, error: AppError): void {
    Alert.alert(
      '⚠️ Algo deu errado',
      message,
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Detalhes',
          onPress: () => this.showErrorDetails(error),
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  }

  /**
   * Mostra detalhes técnicos do erro
   */
  private static showErrorDetails(error: AppError): void {
    const details = `Código: ${error.code}\nHorário: ${error.timestamp.toLocaleString()}\nMensagem: ${error.message}`;
    
    Alert.alert(
      '🔍 Detalhes do Erro',
      details,
      [
        {
          text: 'Copiar',
          onPress: () => {
            // Em um app real, aqui você copiaria para o clipboard
            console.log('Detalhes copiados:', details);
          }
        },
        { text: 'Fechar', style: 'cancel' }
      ]
    );
  }

  /**
   * Converte erro técnico em mensagem amigável
   */
  private static getUserFriendlyMessage(error: AppError): string {
    const message = error.message.toLowerCase();

    // Erros de rede
    if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
      return 'Verifique sua conexão com a internet e tente novamente.';
    }

    // Erros de permissão
    if (message.includes('permission') || message.includes('denied')) {
      return 'O app precisa de permissão para realizar esta ação. Verifique as configurações.';
    }

    // Erros de armazenamento
    if (message.includes('storage') || message.includes('disk') || message.includes('space')) {
      return 'Não há espaço suficiente no dispositivo. Libere algum espaço e tente novamente.';
    }

    // Erros de arquivo
    if (message.includes('file') || message.includes('export') || message.includes('save')) {
      return 'Não foi possível salvar ou acessar o arquivo. Tente novamente.';
    }

    // Erros de dados
    if (message.includes('parse') || message.includes('json') || message.includes('invalid')) {
      return 'Os dados estão corrompidos. O app será reiniciado para corrigir o problema.';
    }

    // Erros de navegação
    if (message.includes('navigate') || message.includes('screen') || message.includes('route')) {
      return 'Erro na navegação. Tente voltar e acessar a tela novamente.';
    }

    // Erro genérico
    return 'Ocorreu um problema inesperado. O app pode não funcionar corretamente até ser reiniciado.';
  }

  /**
   * Adiciona erro ao histórico
   */
  private static addToHistory(error: AppError): void {
    this.errorHistory.unshift(error);
    
    // Manter apenas os últimos erros
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Obtém histórico de erros
   */
  static getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  /**
   * Limpa histórico de erros
   */
  static clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Configura handlers globais de erro
   */
  static setupGlobalHandlers(): void {
    try {
      // Handler para erros não capturados
      if (typeof ErrorUtils !== 'undefined') {
        const originalHandler = ErrorUtils.getGlobalHandler();
        
        ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
          console.error('🚨 Global Error Handler:', error);
          
          // Registrar o erro
          this.handleError(error, 'GLOBAL_ERROR');
          
          // Chamar handler original se existir
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }

      // Handler para promises rejeitadas
      if (typeof global !== 'undefined' && global.HermesInternal?.enablePromiseRejectionTracker) {
        global.HermesInternal.enablePromiseRejectionTracker({
          allRejections: true,
          onUnhandled: (id: number, rejection: any) => {
            console.error('🚨 Unhandled Promise Rejection:', rejection);
            this.handleError(rejection, 'PROMISE_REJECTION');
          },
          onHandled: (id: number) => {
            // Promise foi tratada depois
          },
        });
      }
    } catch (error) {
      console.error('❌ Erro ao configurar handlers globais:', error);
    }
  }

  /**
   * Wrapper para executar código com tratamento de erro
   */
  static async safeExecute<T>(
    operation: () => Promise<T> | T,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }

  /**
   * Wrapper para funções síncronas
   */
  static safeSyncExecute<T>(
    operation: () => T,
    context: string,
    fallbackValue?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }
}

// Configurar handlers globais quando o serviço for importado
ErrorHandlingService.setupGlobalHandlers();
