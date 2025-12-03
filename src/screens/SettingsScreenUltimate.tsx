import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings, ThemeMode, ThemeVariant, AccentColor } from '../contexts/SettingsContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'switch' | 'select' | 'action' | 'navigation';
  icon: string;
  value?: any;
  options?: { label: string; value: any; color?: string }[];
  action?: () => void;
  onToggle?: (value: boolean) => void; // Para switches
  gradient?: string[];
  enabled?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsScreenUltimate: React.FC = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);
  const { settings, updateSetting, activeTheme, getThemeColors } = useSettings();
  const isDark = activeTheme === 'dark';
  const themeColors = getThemeColors();




  const settingSections: SettingSection[] = [
    {
      title: 'Aparência',
      items: [
        {
          id: 'themeMode',
          title: 'Modo do Tema',
          description: 'Configure quando usar tema claro ou escuro',
          type: 'select',
          icon: 'contrast-outline',
          value: settings.themeMode,
          options: [
            { label: 'Automático (Sistema)', value: 'system' },
            { label: 'Claro', value: 'light' },
            { label: 'Escuro', value: 'dark' },
          ],
          gradient: themeColors.gradientPrimary,
        },
        {
          id: 'themeVariant',
          title: 'Estilo Visual',
          description: 'Escolha uma aparência única para o app',
          type: 'select',
          icon: 'brush-outline',
          value: settings.themeVariant,
          options: [
              { label: 'Neo-Menta & Argila', value: 'neoMint' },
              { label: 'Musa Noturna', value: 'nocturnal' },
              { label: 'Amanhecer Etéreo', value: 'ethereal' },
              { label: 'Pôr do Sol', value: 'sunset' },
              { label: 'Profundidade do Oceano', value: 'ocean' },
              { label: 'Moderno', value: 'modern' },
          ],
          gradient: themeColors.gradientSecondary,
        },
        {
          id: 'accentColor',
          title: 'Cor Principal',
          description: 'Personalize a cor de destaque do aplicativo',
          type: 'select',
          icon: 'color-palette-outline',
          value: settings.accentColor,
          options: [
            { label: 'Azul', value: 'primary', color: Colors.primary },
            { label: 'Verde', value: 'green', color: '#4CAF50' },
            { label: 'Roxo', value: 'purple', color: '#9C27B0' },
            { label: 'Laranja', value: 'orange', color: '#FF9800' },
          ],
          gradient: themeColors.gradientAccent,
        },
      ],
    },
    {
      title: 'Conteúdo',
      items: [
        {
          id: 'showMusa',
          title: 'Exibir Chat Musa',
          description: 'Mostrar ou ocultar a aba da Musa IA',
          type: 'switch',
          icon: 'chatbubble-ellipses-outline',
          value: settings.showMusa,
          onToggle: (value: boolean) => updateSetting('showMusa', value),
          gradient: themeColors.gradientAccent,
        },
        {
          id: 'autoSaveEnabled',
          title: 'Salvar Automaticamente',
          description: 'Ativar ou desativar o salvamento automático de obras',
          type: 'switch',
          icon: 'save-outline',
          value: settings.autoSaveEnabled,
          onToggle: (value: boolean) => updateSetting('autoSaveEnabled', value),
          gradient: themeColors.gradientSuccess,
        },
        {
          id: 'manageCategories',
          title: 'Gerenciar Categorias',
          description: 'Organize seus poemas por categorias',
          type: 'navigation',
          icon: 'library-outline',
          action: () => {
            console.log('🎯 Gerenciar categorias pressed');
            navigation?.navigate('ManageCategories');
          },
          gradient: themeColors.gradientPoetry,
        },
      ],
    },
    {
      title: 'Suporte',
      items: [
        {
          id: 'help',
          title: 'Ajuda',
          description: 'Informações sobre como usar o aplicativo',
          type: 'navigation',
          icon: 'help-circle-outline',
          action: () => navigation?.navigate('About'),
          gradient: themeColors.gradientPrimary,
        },
        {
          id: 'feedback',
          title: 'Enviar Feedback',
          description: 'Compartilhe sugestões ou reporte problemas',
          type: 'action',
          icon: 'chatbubble-outline',
          action: () => handleSendFeedback(),
          gradient: themeColors.gradientAccent,
        },
        {
          id: 'share',
          title: 'Compartilhar App',
          description: 'Indique o Verso & Musa para outros poetas',
          type: 'action',
          icon: 'share-outline',
          action: () => handleShareApp(),
          gradient: themeColors.gradientSuccess,
        },
        {
          id: 'about',
          title: 'Sobre',
          description: 'Versão e informações do aplicativo',
          type: 'navigation',
          icon: 'information-circle-outline',
          action: () => navigation?.navigate('About'),
          gradient: themeColors.gradientSecondary,
        },
      ],
    },
  ];

  const handleSelectOption = async (settingId: string, value: any) => {
    if (settingId === 'themeMode') {
      await updateSetting('themeMode', value as ThemeMode);
    } else if (settingId === 'themeVariant') {
      await updateSetting('themeVariant', value as ThemeVariant);
    } else if (settingId === 'accentColor') {
      await updateSetting('accentColor', value as AccentColor);
    }

    setModalVisible(false);
    setSelectedSetting(null);
  };

  const handleSendFeedback = async () => {
    try {
      await Share.share({
        title: 'Feedback - Verso & Musa',
        message: 'Gostaria de enviar um feedback sobre o aplicativo Verso & Musa...',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o compartilhamento.');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Verso & Musa - App de Poesia',
        message: '📝✨ Descobri um app incrível para escrever poesias! Verso & Musa tem tudo que um poeta precisa. Baixe agora: [link]',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o aplicativo.');
    }
  };

  const openSelectModal = (setting: SettingItem) => {
    setSelectedSetting(setting);
    setModalVisible(true);
  };

  const renderSettingItem = (item: SettingItem) => {
    const isEnabled = item.enabled !== false;

    if (item.type === 'switch') {
      return (
        <View
          key={item.id}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            marginBottom: Spacing.md,
            overflow: 'hidden',
            opacity: isEnabled ? 1 : 0.6,
            ...Shadows.sm,
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.base,
          }}
        >
          <LinearGradient
            colors={(item.gradient || Colors.gradientPrimary) as any}
            style={{ width: 4, height: '100%', position: 'absolute', left: 0 }}
          />
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: `${item.gradient?.[0] || Colors.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.md,
          }}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={item.gradient?.[0] || Colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.xs,
            }}>
              {item.title}
            </Text>
            <Text style={{
              fontSize: Typography.fontSize.sm,
              color: themeColors.textSecondary,
              lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
            }}>
              {item.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => item.onToggle?.(!item.value)}
            disabled={!isEnabled}
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              backgroundColor: item.value ? (item.gradient?.[0] || Colors.primary) : themeColors.border,
              justifyContent: 'center',
              paddingHorizontal: 3,
              alignItems: item.value ? 'flex-end' : 'flex-start',
            }}
          >
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: Colors.white,
            }} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          if (!isEnabled) return;

          if (item.type === 'select') {
            openSelectModal(item);
          } else if (item.type === 'action' || item.type === 'navigation') {
            item.action?.();
          }
        }}
        disabled={!isEnabled}
        style={{
          backgroundColor: themeColors.surface,
          borderRadius: BorderRadius.lg,
          marginBottom: Spacing.md,
          overflow: 'hidden',
          opacity: isEnabled ? 1 : 0.6,
          ...Shadows.sm,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* Indicador colorido */}
          <LinearGradient
            colors={(item.gradient || Colors.gradientPrimary) as any}
            style={{ width: 4 }}
          />

          <View style={{
            flex: 1,
            padding: Spacing.base,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${item.gradient?.[0] || Colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.md,
            }}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={item.gradient?.[0] || Colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.xs,
              }}>
                {item.title}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
              }}>
                {item.description}
              </Text>
              {item.type === 'select' && (
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: item.gradient?.[0] || Colors.primary,
                  marginTop: Spacing.xs,
                  fontWeight: Typography.fontWeight.medium,
                }}>
                  {item.options?.find(opt => opt.value === item.value)?.label}
                </Text>
              )}
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      
      {/* Header */}
      <LinearGradient
        colors={(isDark ? Colors.gradientNight : Colors.gradientPrimary) as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xl,
          borderBottomLeftRadius: BorderRadius.xl,
          borderBottomRightRadius: BorderRadius.xl,
        }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              marginRight: Spacing.md,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: Typography.fontSize['2xl'],
              fontWeight: Typography.fontWeight.bold,
              color: Colors.white,
              marginBottom: Spacing.xs,
            }}>
              Configurações
            </Text>
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: 'rgba(255,255,255,0.8)',
            }}>
              Personalize sua experiência poética
            </Text>
          </View>
        </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ marginTop: Spacing.xl }}>
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.bold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.base,
              marginHorizontal: Spacing.lg,
            }}>
              {section.title}
            </Text>
            
            <View style={{ paddingHorizontal: Spacing.lg }}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Versão do App */}
        <View style={{
          marginTop: Spacing.xl,
          marginBottom: Spacing.lg,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textSecondary,
            marginBottom: Spacing.xs,
          }}>
            Verso & Musa
          </Text>
          <Text style={{
            fontSize: Typography.fontSize.xs,
            color: themeColors.textSecondary,
          }}>
            Versão 2.0.0 • Build 2024.12
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Seleção */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: themeColors.surface,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.xl,
            maxHeight: '60%',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: Spacing.lg,
            }}>
              <View style={{
                width: 40,
                height: 4,
                backgroundColor: themeColors.border,
                borderRadius: 2,
              }} />
            </View>
            
            {selectedSetting && (
              <>
                <Text style={{
                  fontSize: Typography.fontSize.xl,
                  fontWeight: Typography.fontWeight.bold,
                  color: themeColors.textPrimary,
                  textAlign: 'center',
                  marginBottom: Spacing.lg,
                  paddingHorizontal: Spacing.lg,
                }}>
                  {selectedSetting.title}
                </Text>
                
                <ScrollView>
                  {selectedSetting.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectOption(selectedSetting.id, option.value)}
                      style={{
                        paddingVertical: Spacing.lg,
                        paddingHorizontal: Spacing.lg,
                        borderBottomWidth: index < selectedSetting.options!.length - 1 ? 1 : 0,
                        borderBottomColor: themeColors.border,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {option.color && (
                          <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: option.color,
                            marginRight: Spacing.sm,
                          }} />
                        )}
                        <Text style={{
                          fontSize: Typography.fontSize.base,
                          color: themeColors.textPrimary,
                        }}>
                          {option.label}
                        </Text>
                      </View>
                      {selectedSetting.value === option.value && (
                        <Ionicons name="checkmark" size={24} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreenUltimate;
