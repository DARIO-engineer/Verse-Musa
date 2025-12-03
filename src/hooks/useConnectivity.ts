import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useConnectivity = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const checkConnection = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? false);
  }, []);

  useEffect(() => {
    // Verifica o estado inicial
    checkConnection();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [checkConnection]);

  return { isConnected, checkConnection };
};
