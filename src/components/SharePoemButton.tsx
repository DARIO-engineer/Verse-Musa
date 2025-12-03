// src/components/SharePoemButton.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Draft } from '../services/DraftService';
import { ShareService } from '../services/ShareService';

interface SharePoemButtonProps {
  draft: Draft;
  iconSize?: number;
  iconColor?: string;
  showLabel?: boolean;
}

export const SharePoemButton: React.FC<SharePoemButtonProps> = ({
  draft,
  iconSize = 24,
  iconColor = '#4FC3F7',
  showLabel = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShareText = async () => {
    try {
      setLoading(true);
      await ShareService.shareAsText(draft);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o poema');
    } finally {
      setLoading(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setLoading(true);
      await ShareService.shareAsImage(draft);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar como imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleExportFile = async () => {
    try {
      setLoading(true);
      await ShareService.exportAsFile(draft);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar o arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="share-social" size={iconSize} color={iconColor} />
        {showLabel && <Text style={styles.labelText}>Compartilhar</Text>}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Compartilhar Poema</Text>
            <Text style={styles.modalSubtitle}>"{draft.title || 'Sem título'}"</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4FC3F7" />
                <Text style={styles.loadingText}>Preparando...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleShareText}
                >
                  <Ionicons name="text" size={24} color="#4FC3F7" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Compartilhar como Texto</Text>
                    <Text style={styles.optionSubtitle}>
                      WhatsApp, Telegram, E-mail...
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleShareImage}
                >
                  <Ionicons name="image" size={24} color="#4FC3F7" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Compartilhar como Imagem</Text>
                    <Text style={styles.optionSubtitle}>
                      Instagram, Facebook, Twitter...
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleExportFile}
                >
                  <Ionicons name="document-text" size={24} color="#4FC3F7" />
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Exportar como Arquivo</Text>
                    <Text style={styles.optionSubtitle}>
                      Salvar arquivo .txt
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close-circle" size={24} color="#999" />
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 16,
    color: '#4FC3F7',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 16,
    fontSize: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  cancelButton: {
    backgroundColor: '#1A1A1A',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 16,
    fontWeight: '500',
  },
});
