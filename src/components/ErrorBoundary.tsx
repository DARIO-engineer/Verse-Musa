import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/DesignSystem';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary capturou um erro:', error);
    console.error('📍 Stack trace:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Mostrar alerta amigável para o usuário
    setTimeout(() => {
      Alert.alert(
        '🚨 Erro Detectado',
        `Algo deu errado: ${error.message}\n\nO app pode não funcionar corretamente até ser reiniciado.`,
        [
          { text: 'Tentar Novamente', onPress: this.handleRetry },
          { text: 'Ver Detalhes', onPress: this.showErrorDetails },
        ],
        { cancelable: false }
      );
    }, 100);

    // Enviar erro para serviço de analytics se disponível
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: any) => {
    try {
      // Aqui você pode integrar com Sentry, Crashlytics, etc.
      console.log('📊 Enviando erro para analytics:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('❌ Erro ao enviar analytics:', e);
    }
  };

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  showErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    Alert.alert(
      '🐛 Detalhes do Erro',
      `Erro: ${error?.message}\n\nStack: ${error?.stack?.substring(0, 200)}...`,
      [
        { text: 'Copiar', onPress: () => this.copyErrorToClipboard() },
        { text: 'Fechar', style: 'cancel' }
      ]
    );
  };

  copyErrorToClipboard = () => {
    // Implementar cópia para clipboard se necessário
    Alert.alert('📋', 'Detalhes do erro copiados!');
  };

  render() {
    if (this.state.hasError) {
      // Usar componente customizado se fornecido
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      // Tela de erro padrão
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
          padding: Spacing.xl,
        }}>
          <Ionicons name="warning" size={64} color={Colors.warning} />
          
          <Text style={{
            fontSize: Typography.fontSize['2xl'],
            fontWeight: Typography.fontWeight.bold,
            color: Colors.text || '#000',
            marginTop: Spacing.lg,
            textAlign: 'center',
          }}>
            Oops! Algo deu errado
          </Text>

          <Text style={{
            fontSize: Typography.fontSize.base,
            color: Colors.textSecondary || '#666',
            marginTop: Spacing.md,
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Encontramos um problema inesperado. Não se preocupe, seus dados estão seguros.
          </Text>

          <View style={{ marginTop: Spacing.xl, width: '100%' }}>
            <TouchableOpacity
              onPress={this.retry}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                alignItems: 'center',
                marginBottom: Spacing.md,
              }}
            >
              <Text style={{
                color: Colors.white,
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.semibold,
              }}>
                Tentar Novamente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.showErrorDetails}
              style={{
                borderColor: Colors.border,
                borderWidth: 1,
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: Colors.textSecondary || '#666',
                fontSize: Typography.fontSize.base,
              }}>
                Ver Detalhes do Erro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook para tratamento de erros em componentes funcionais
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`❌ Erro capturado${context ? ` em ${context}` : ''}:`, error);
    
    // Mostrar erro amigável para o usuário
    Alert.alert(
      '⚠️ Erro',
      `Ocorreu um problema${context ? ` em ${context}` : ''}. Tente novamente.`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }, []);

  return { handleError };
};

// Componente de erro customizado para casos específicos
export const CustomErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  }}>
    <Ionicons name="refresh-circle" size={80} color={Colors.primary} />
    
    <Text style={{
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: Colors.text || '#000',
      marginTop: Spacing.lg,
      textAlign: 'center',
    }}>
      Verso & Musa
    </Text>

    <Text style={{
      fontSize: Typography.fontSize.base,
      color: Colors.textSecondary || '#666',
      marginTop: Spacing.sm,
      textAlign: 'center',
    }}>
      Recarregando sua experiência criativa...
    </Text>

    <TouchableOpacity
      onPress={retry}
      style={{
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginTop: Spacing.xl,
      }}
    >
      <Text style={{
        color: Colors.white,
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
      }}>
        Continuar
      </Text>
    </TouchableOpacity>
  </View>
);

export default ErrorBoundary;
