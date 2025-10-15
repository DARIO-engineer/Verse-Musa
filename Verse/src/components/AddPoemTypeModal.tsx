import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/DesignSystem';

interface AddPoemTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, description: string, placeholder: string, icon: string) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'document-text-outline', label: 'Documento' },
  { name: 'book-outline', label: 'Livro' },
  { name: 'newspaper-outline', label: 'Jornal' },
  { name: 'chatbubble-outline', label: 'Conversa' },
  { name: 'heart-outline', label: 'Coração' },
  { name: 'star-outline', label: 'Estrela' },
  { name: 'musical-notes-outline', label: 'Música' },
  { name: 'brush-outline', label: 'Pincel' },
  { name: 'bulb-outline', label: 'Ideia' },
  { name: 'leaf-outline', label: 'Folha' },
  { name: 'flame-outline', label: 'Chama' },
  { name: 'diamond-outline', label: 'Diamante' },
];

const AddPoemTypeModal: React.FC<AddPoemTypeModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('document-text-outline');
  const [loading, setLoading] = useState(false);

  // Limpar campos quando o modal for fechado
  useEffect(() => {
    if (!visible) {
      setName('');
      setDescription('');
      setPlaceholder('');
      setSelectedIcon('document-text-outline');
      setLoading(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (loading) return; // Previne fechar durante operação
    
    // Se houver dados preenchidos, confirmar saída
    if (name.trim() || description.trim() || placeholder.trim()) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem dados não salvos. Deseja realmente sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: onClose
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para o tipo de obra.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, adicione uma descrição.');
      return;
    }

    if (!placeholder.trim()) {
      Alert.alert('Erro', 'Por favor, defina um texto de exemplo.');
      return;
    }

    setLoading(true);
    try {
      await onAdd(name, description, placeholder, selectedIcon);
      
      // Limpar campos
      setName('');
      setDescription('');
      setPlaceholder('');
      setSelectedIcon('document-text-outline');
      
      onClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar o tipo de obra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.bold,
            color: Colors.textPrimary,
          }}>
            Novo Tipo de Obra
          </Text>
          
          <TouchableOpacity
            onPress={handleAdd}
            disabled={loading}
            style={{
              backgroundColor: loading ? Colors.gray300 : Colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: BorderRadius.md,
            }}
          >
            <Text style={{
              color: Colors.white,
              fontWeight: Typography.fontWeight.semibold,
            }}>
              {loading ? 'Criando...' : 'Criar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ flex: 1, padding: Spacing.lg }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nome */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: Colors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Nome do Tipo
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: Colors.textPrimary,
                backgroundColor: Colors.surface,
              }}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Cordel, Haicai, Crônica..."
              placeholderTextColor={Colors.textSecondary}
              maxLength={30}
            />
          </View>

          {/* Descrição */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: Colors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Descrição
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: Colors.textPrimary,
                backgroundColor: Colors.surface,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva brevemente este tipo de obra..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={150}
            />
          </View>

          {/* Placeholder */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: Colors.textPrimary,
              marginBottom: Spacing.sm,
            }}>
              Texto de Exemplo
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                fontSize: Typography.fontSize.base,
                color: Colors.textPrimary,
                backgroundColor: Colors.surface,
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              value={placeholder}
              onChangeText={setPlaceholder}
              placeholder="Escreva aqui um exemplo ou estrutura que aparecerá para o usuário..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={500}
            />
          </View>

          {/* Ícone */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: Colors.textPrimary,
              marginBottom: Spacing.md,
            }}>
              Escolha um Ícone
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Spacing.sm,
            }}>
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  onPress={() => setSelectedIcon(icon.name)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: BorderRadius.md,
                    borderWidth: 2,
                    borderColor: selectedIcon === icon.name ? Colors.primary : Colors.border,
                    backgroundColor: selectedIcon === icon.name ? Colors.primaryLight : Colors.surface,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={icon.name as any}
                    size={24}
                    color={selectedIcon === icon.name ? Colors.primary : Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddPoemTypeModal;
