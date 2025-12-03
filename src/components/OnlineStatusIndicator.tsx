// src/components/OnlineStatusIndicator.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

interface OnlineStatusIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top',
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // Monitorar conexão
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      // Mostrar indicador quando offline OU quando showWhenOnline = true
      if (!online || showWhenOnline) {
        setShowIndicator(true);
        
        // Animar entrada
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();

        // Auto-esconder quando voltar online (depois de 3s)
        if (online && showWhenOnline) {
          setTimeout(() => {
            hideIndicator();
          }, 3000);
        }
      } else {
        hideIndicator();
      }
    });

    return () => unsubscribe();
  }, [showWhenOnline]);

  const hideIndicator = () => {
    Animated.timing(slideAnim, {
      toValue: position === 'top' ? -100 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowIndicator(false);
    });
  };

  if (!showIndicator) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        isOnline ? styles.online : styles.offline,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons
        name={isOnline ? 'cloud-done' : 'cloud-offline'}
        size={20}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isOnline ? '✓ Online - Backup ativo' : '⚠ Offline - Dados salvos localmente'}
      </Text>
    </Animated.View>
  );
};

export const OnlineStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.badgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 1000,
  },
  top: {
    top: 0,
    paddingTop: 50, // Considerando status bar
  },
  bottom: {
    bottom: 0,
    paddingBottom: 20,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#FF6B6B',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeOnline: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeOffline: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#4CAF50',
  },
  dotOffline: {
    backgroundColor: '#FF6B6B',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
