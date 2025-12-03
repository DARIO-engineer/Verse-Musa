import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleCache from '../utils/SimpleCache';

export interface PoemType {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export class PoemTypeService {
  private static readonly POEM_TYPES_KEY = 'poem_types';

  // Tipos padrão do sistema
  static getDefaultTypes(): PoemType[] {
    return [
      {
        id: 'poesia',
        name: 'Poesia',
        description: 'Expressão artística através de versos e estrofes',
        placeholder: 'Escreva sua poesia aqui...', 
        icon: 'flower-outline',
        color: '#09868B',
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: 'jogral',
        name: 'Jogral',
        description: 'Poesia em formato de diálogo ou apresentação em grupo',
        placeholder: 'Escreva seu jogral aqui...\n\nNarrador: ...\nPersonagem 1: ...\nPersonagem 2: ...',
        icon: 'people-outline',
        color: '#3D7C47',
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: 'soneto',
        name: 'Soneto',
        description: 'Poema de 14 versos com estrutura clássica',
        placeholder: 'Escreva seu soneto aqui...\n\n(Quarteto 1 - 4 versos)\n...\n\n(Quarteto 2 - 4 versos)\n...\n\n(Terceto 1 - 3 versos)\n...\n\n(Terceto 2 - 3 versos)\n...', 
        icon: 'library-outline',
        color: '#76C1D4',
        isDefault: true,
        createdAt: new Date(),
      },
    ];
  }


  // Buscar todos os tipos (padrão + personalizados)
  static async getAllTypes(): Promise<PoemType[]> {
    try {
      const cacheKey = 'all_poem_types';
      const cached = SimpleCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const customTypesJson = await AsyncStorage.getItem(this.POEM_TYPES_KEY);
      const customTypes: PoemType[] = customTypesJson ? JSON.parse(customTypesJson) : [];
      
      // Converter datas do storage
      const parsedCustomTypes = customTypes.map(type => ({
        ...type,
        createdAt: new Date(type.createdAt),
      }));

      const allTypes = [...this.getDefaultTypes(), ...parsedCustomTypes];
      
      // Cache por 5 minutos
      SimpleCache.set(cacheKey, allTypes, 5);
      
      return allTypes;
    } catch (error) {
      console.error('Erro ao buscar tipos de poema:', error);
      return this.getDefaultTypes();
    }
  }

  // Buscar apenas tipos personalizados
  static async getCustomTypes(): Promise<PoemType[]> {
    try {
      const typesJson = await AsyncStorage.getItem(this.POEM_TYPES_KEY);
      if (!typesJson) return [];

      const types: PoemType[] = JSON.parse(typesJson);
      return types.map(type => ({
        ...type,
        createdAt: new Date(type.createdAt),
      }));
    } catch (error) {
      console.error('Erro ao buscar tipos personalizados:', error);
      return [];
    }
  }

  // Criar novo tipo personalizado
  static async createCustomType(
    name: string,
    description: string,
    placeholder: string,
    icon: string = 'document-text-outline'
  ): Promise<string> {
    try {
      const customTypes = await this.getCustomTypes();
      
      // Verificar se já existe um tipo com esse nome
      const existingType = customTypes.find(
        type => type.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingType) {
        throw new Error('Já existe um tipo de obra com esse nome');
      }

      const newType: PoemType = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description.trim(),
        placeholder: placeholder.trim(),
        icon,
        color: '#09868B', // Cor padrão
        isDefault: false,
        createdAt: new Date(),
      };

      const updatedTypes = [...customTypes, newType];
      await AsyncStorage.setItem(this.POEM_TYPES_KEY, JSON.stringify(updatedTypes));
      
      // Limpar cache
      SimpleCache.delete('all_poem_types');
      
      console.log('✅ Tipo personalizado criado:', newType.name);
      return newType.id;
    } catch (error) {
      console.error('❌ Erro ao criar tipo personalizado:', error);
      throw error;
    }
  }

  // Atualizar tipo personalizado
  static async updateCustomType(
    id: string,
    name: string,
    description: string,
    placeholder: string,
    icon: string
  ): Promise<void> {
    try {
      const customTypes = await this.getCustomTypes();
      const typeIndex = customTypes.findIndex(type => type.id === id);
      
      if (typeIndex === -1) {
        throw new Error('Tipo não encontrado');
      }

      if (customTypes[typeIndex].isDefault) {
        throw new Error('Tipos padrão não podem ser editados');
      }

      customTypes[typeIndex] = {
        ...customTypes[typeIndex],
        name: name.trim(),
        description: description.trim(),
        placeholder: placeholder.trim(),
        icon,
      };

      await AsyncStorage.setItem(this.POEM_TYPES_KEY, JSON.stringify(customTypes));
      
      // Limpar cache
      SimpleCache.delete('all_poem_types');
      
      console.log('✅ Tipo personalizado atualizado:', name);
    } catch (error) {
      console.error('❌ Erro ao atualizar tipo personalizado:', error);
      throw error;
    }
  }

  // Deletar tipo personalizado
  static async deleteCustomType(id: string): Promise<void> {
    try {
      const customTypes = await this.getCustomTypes();
      const typeToDelete = customTypes.find(type => type.id === id);
      
      if (!typeToDelete) {
        throw new Error('Tipo não encontrado');
      }

      if (typeToDelete.isDefault) {
        throw new Error('Tipos padrão não podem ser deletados');
      }

      const filteredTypes = customTypes.filter(type => type.id !== id);
      await AsyncStorage.setItem(this.POEM_TYPES_KEY, JSON.stringify(filteredTypes));
      
      // Limpar cache
      SimpleCache.delete('all_poem_types');
      
      console.log('✅ Tipo personalizado deletado:', typeToDelete.name);
    } catch (error) {
      console.error('❌ Erro ao deletar tipo personalizado:', error);
      throw error;
    }
  }

  // Buscar tipo por ID
  static async getTypeById(id: string): Promise<PoemType | null> {
    try {
      const allTypes = await this.getAllTypes();
      return allTypes.find(type => type.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar tipo por ID:', error);
      return null;
    }
  }

  // Converter nome antigo para novo formato
  static mapLegacyCategoryToId(oldCategory: string): string {
    switch (oldCategory.toLowerCase()) {
      case 'poesia':
        return 'poesia';
      case 'jogral':
        return 'jogral';
      case 'soneto':
        return 'soneto';
      default:
        return 'poesia'; // fallback
    }
  }

  // Função utilitária para obter o nome do tipo de um draft
  static async getTypeName(draft: { typeId?: string; category: string }): Promise<string> {
    try {
      // Se tem typeId, buscar o tipo personalizado/padrão
      if (draft.typeId) {
        const type = await this.getTypeById(draft.typeId);
        if (type) {
          return type.name;
        }
      }
      
      // Fallback para categoria legacy
      return draft.category;
    } catch (error) {
      console.error('Erro ao obter nome do tipo:', error);
      return draft.category; // Fallback para categoria legacy
    }
  }

  // Função utilitária para obter o placeholder do tipo de um draft
  static async getTypePlaceholder(draft: { typeId?: string; category: string }): Promise<string> {
    try {
      // Se tem typeId, buscar o tipo personalizado/padrão
      if (draft.typeId) {
        const type = await this.getTypeById(draft.typeId);
        if (type) {
          return type.placeholder;
        }
      }
      
      // Fallback para placeholders padrão baseados na categoria legacy
      const defaultTypes = this.getDefaultTypes();
      const legacyType = defaultTypes.find(t => t.name === draft.category);
      return legacyType?.placeholder || 'Escreva sua obra aqui...';
    } catch (error) {
      console.error('Erro ao obter placeholder do tipo:', error);
      return 'Escreva sua obra aqui...';
    }
  }
}
