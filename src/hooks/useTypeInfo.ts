import { useState, useEffect } from 'react';
import { CategoryService } from '../services/CategoryService';

export interface DraftTypeInfo {
  typeId?: string;
  category: string;
}

export const useTypeName = (draft: DraftTypeInfo | null) => {
  const [typeName, setTypeName] = useState<string>('');

  useEffect(() => {
    if (!draft) {
      setTypeName('');
      return;
    }

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

  return typeName;
};

export const useTypePlaceholder = (draft: DraftTypeInfo | null) => {
  const [placeholder, setPlaceholder] = useState<string>('');

  useEffect(() => {
    if (!draft) {
      setPlaceholder('');
      return;
    }

    const getPlaceholder = async () => {
      try {
        // For now, use a simple fallback since CategoryService doesn't have getTypePlaceholder
        // TODO: Add getTypePlaceholder method to CategoryService if needed
        const defaultPlaceholders: Record<string, string> = {
          'poesia': 'Escreva sua poesia aqui...',
          'soneto': 'Escreva seu soneto aqui...\n\n(Quarteto 1 - 4 versos)\n...\n\n(Quarteto 2 - 4 versos)\n...\n\n(Terceto 1 - 3 versos)\n...\n\n(Terceto 2 - 3 versos)\n...',
          'jogral': 'Escreva seu jogral aqui...\n\nNarrador: ...\nPersonagem 1: ...\nPersonagem 2: ...',
        };

        if (draft.typeId && defaultPlaceholders[draft.typeId]) {
          setPlaceholder(defaultPlaceholders[draft.typeId]);
        } else {
          setPlaceholder('Escreva sua obra aqui...');
        }
      } catch (error) {
        console.error('Erro ao obter placeholder do tipo:', error);
        setPlaceholder('Escreva sua obra aqui...'); // Fallback
      }
    };

    getPlaceholder();
  }, [draft]);

  return placeholder;
};
