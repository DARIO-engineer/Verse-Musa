import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import { CategoryService } from '../../services/CategoryService';

interface TypeNameDisplayProps {
  draft: {
    typeId?: string;
    category: string;
  };
  style?: TextStyle;
}

const TypeNameDisplay: React.FC<TypeNameDisplayProps> = ({ draft, style }) => {
  const [typeName, setTypeName] = useState<string>(draft.category);

  useEffect(() => {
    const getTypeName = async () => {
      try {
        const name = await CategoryService.getTypeName(draft);
        setTypeName(name);
      } catch (error) {
        console.error('Erro ao obter nome do tipo:', error);
        setTypeName(draft.category); // Fallback
      }
    };

    getTypeName();
  }, [draft]);

  return (
    <Text style={style}>
      {typeName}
    </Text>
  );
};

export default TypeNameDisplay;
