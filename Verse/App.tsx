import 'react-native-gesture-handler'; // Mantenha esta linha como a primeira
import React, { useEffect, useState } from 'react';
import AppNavigatorOfflineFirst from './src/navigation/AppNavigatorOfflineFirst';
import { SettingsProvider } from './src/contexts/SettingsContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftsProvider } from './src/contexts/DraftsContext';
// Dev helpers temporariamente desabilitados para resolver problemas de bundling
import { ErrorHandlingService } from './src/services/ErrorHandlingService';
import { StorageCleanupService } from './src/services/StorageCleanupService';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Configurar tratamento global de erros
        console.log('🔧 Configurando tratamento de erros...');
        ErrorHandlingService.setupGlobalHandlers();
        
        // 2. Limpeza de dados corrompidos
        console.log('🚀 Iniciando app - limpeza de storage...');
        await StorageCleanupService.fullCleanup();
        
        // 3. Verificar se onboarding foi concluído
        const onboardingComplete = await AsyncStorage.getItem('@VersoEMusa:onboarding_complete');
        if (onboardingComplete === 'true') {
          setShowOnboarding(false);
        }
        
        console.log('✅ App inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro na inicialização do app:', error);
        ErrorHandlingService.handleError(error as Error, 'APP_INITIALIZATION');
      } finally {
        setLoading(false);
      }
    }

    initializeApp();
  }, []);

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return (
    <SafeAreaProvider>
      <DraftsProvider>
        <SettingsProvider>
          <AppNavigatorOfflineFirst />
        </SettingsProvider>
      </DraftsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


