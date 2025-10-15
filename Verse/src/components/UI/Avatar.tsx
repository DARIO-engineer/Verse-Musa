import React from 'react';
import { View, Text, Image } from 'react-native';
import { Colors, Typography } from '../../styles/DesignSystem';

interface AvatarProps {
  name?: string;
  photoUri?: string;
  size?: number;
  showOnlyInitial?: boolean;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name = 'Poeta Anônimo', 
  photoUri, 
  size = 40, 
  showOnlyInitial = false,
  style = {} 
}) => {
  // Função para extrair iniciais do primeiro e último nome
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ').filter(n => n.length > 0);
    if (names.length === 0) return 'PA'; // Poeta Anônimo
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    // Primeiro e último nome
    const firstName = names[0].charAt(0).toUpperCase();
    const lastName = names[names.length - 1].charAt(0).toUpperCase();
    return firstName + lastName;
  };
  
  const initials = getInitials(name);
  
  if (!showOnlyInitial && photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }
  
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.35, // Ajustar tamanho para duas letras
          fontWeight: 'bold',
          color: Colors.white,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

export default Avatar;
