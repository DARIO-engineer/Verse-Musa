import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getThemeColors } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { POETRY_FORMS, LITERARY_DEVICES, POETRY_HISTORY } from '../constants/poetryEducation';

const { width } = Dimensions.get('window');

const PoetryEducationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeTheme } = useSettings();
  const isDark = activeTheme === 'dark';
  const themeColors = getThemeColors('default', isDark);
  
  const [activeTab, setActiveTab] = useState<'forms' | 'devices' | 'history'>('forms');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const renderTabButton = (tab: 'forms' | 'devices' | 'history', title: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        backgroundColor: activeTab === tab ? themeColors.primary : 'transparent',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? Colors.white : themeColors.textSecondary} 
      />
      <Text style={{
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        color: activeTab === tab ? Colors.white : themeColors.textSecondary,
        marginLeft: Spacing.xs,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPoetryForms = () => (
    <View>
      {POETRY_FORMS.map((form) => (
        <TouchableOpacity
          key={form.id}
          onPress={() => toggleExpanded(form.id)}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            borderLeftWidth: 4,
            borderLeftColor: form.difficulty === 'beginner' ? Colors.success : 
                             form.difficulty === 'intermediate' ? Colors.warning : Colors.error,
            ...Shadows.sm,
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.xs,
              }}>
                {form.name}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                marginBottom: Spacing.sm,
              }}>
                {form.description}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                <View style={{
                  backgroundColor: form.difficulty === 'beginner' ? Colors.success : 
                                   form.difficulty === 'intermediate' ? Colors.warning : Colors.error,
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.xs,
                  borderRadius: BorderRadius.sm,
                  marginRight: Spacing.sm,
                }}>
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: Colors.white,
                    fontWeight: Typography.fontWeight.medium,
                  }}>
                    {form.difficulty === 'beginner' ? 'Iniciante' : 
                     form.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </Text>
                </View>
                <Text style={{
                  fontSize: Typography.fontSize.xs,
                  color: themeColors.textSecondary,
                }}>
                  {form.origin}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={expandedItem === form.id ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={themeColors.textSecondary} 
            />
          </View>

          {expandedItem === form.id && (
            <View style={{
              marginTop: Spacing.lg,
              paddingTop: Spacing.lg,
              borderTopWidth: 1,
              borderTopColor: themeColors.border,
            }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Características:
              </Text>
              {form.characteristics.map((char, index) => (
                <Text key={index} style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.xs,
                  marginLeft: Spacing.sm,
                }}>
                  • {char}
                </Text>
              ))}

              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginTop: Spacing.md,
                marginBottom: Spacing.sm,
              }}>
                Estrutura:
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: themeColors.textSecondary,
                marginBottom: Spacing.md,
                fontStyle: 'italic',
              }}>
                {form.structure}
              </Text>

              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginBottom: Spacing.sm,
              }}>
                Exemplo:
              </Text>
              <View style={{
                backgroundColor: themeColors.background,
                padding: Spacing.md,
                borderRadius: BorderRadius.md,
                borderLeftWidth: 3,
                borderLeftColor: Colors.primary,
              }}>
                <Text style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textPrimary,
                  fontStyle: 'italic',
                  lineHeight: Typography.fontSize.sm * 1.4,
                }}>
                  {form.example}
                </Text>
                {form.author && (
                  <Text style={{
                    fontSize: Typography.fontSize.xs,
                    color: themeColors.textSecondary,
                    textAlign: 'right',
                    marginTop: Spacing.sm,
                  }}>
                    — {form.author}
                  </Text>
                )}
              </View>

              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
                color: themeColors.textPrimary,
                marginTop: Spacing.md,
                marginBottom: Spacing.sm,
              }}>
                Dicas para escrever:
              </Text>
              {form.tips.map((tip, index) => (
                <Text key={index} style={{
                  fontSize: Typography.fontSize.sm,
                  color: themeColors.textSecondary,
                  marginBottom: Spacing.xs,
                  marginLeft: Spacing.sm,
                }}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLiteraryDevices = () => (
    <View>
      {LITERARY_DEVICES.map((device) => (
        <View
          key={device.id}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            borderLeftWidth: 4,
            borderLeftColor: device.category === 'sound' ? Colors.primary :
                             device.category === 'meaning' ? Colors.secondary :
                             device.category === 'structure' ? Colors.accent : Colors.warning,
            ...Shadows.sm,
          }}
        >
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.xs,
          }}>
            {device.name}
          </Text>
          
          <View style={{
            backgroundColor: device.category === 'sound' ? Colors.primary :
                             device.category === 'meaning' ? Colors.secondary :
                             device.category === 'structure' ? Colors.accent : Colors.warning,
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
            borderRadius: BorderRadius.sm,
            alignSelf: 'flex-start',
            marginBottom: Spacing.sm,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.xs,
              color: Colors.white,
              fontWeight: Typography.fontWeight.medium,
            }}>
              {device.category === 'sound' ? 'Som' :
               device.category === 'meaning' ? 'Significado' :
               device.category === 'structure' ? 'Estrutura' : 'Estilo'}
            </Text>
          </View>

          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textSecondary,
            marginBottom: Spacing.md,
          }}>
            {device.definition}
          </Text>

          <Text style={{
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.sm,
          }}>
            Exemplos:
          </Text>
          {device.examples.map((example, index) => (
            <Text key={index} style={{
              fontSize: Typography.fontSize.sm,
              color: themeColors.textPrimary,
              fontStyle: 'italic',
              marginBottom: Spacing.xs,
              marginLeft: Spacing.sm,
            }}>
              • "{example}"
            </Text>
          ))}

          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textSecondary,
            marginTop: Spacing.sm,
            fontWeight: Typography.fontWeight.medium,
          }}>
            Como usar: {device.usage}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPoetryHistory = () => (
    <View>
      {POETRY_HISTORY.map((period) => (
        <View
          key={period.id}
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.md,
            ...Shadows.sm,
          }}
        >
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.bold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.xs,
          }}>
            {period.period}
          </Text>
          
          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textSecondary,
            marginBottom: Spacing.md,
            fontStyle: 'italic',
          }}>
            {period.timeframe}
          </Text>

          <Text style={{
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.sm,
          }}>
            Características:
          </Text>
          {period.characteristics.map((char, index) => (
            <Text key={index} style={{
              fontSize: Typography.fontSize.sm,
              color: themeColors.textSecondary,
              marginBottom: Spacing.xs,
              marginLeft: Spacing.sm,
            }}>
              • {char}
            </Text>
          ))}

          <Text style={{
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
            color: themeColors.textPrimary,
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
          }}>
            Principais autores:
          </Text>
          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textPrimary,
            marginBottom: Spacing.md,
          }}>
            {period.mainAuthors.join(', ')}
          </Text>

          <Text style={{
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
            color: themeColors.textPrimary,
            marginBottom: Spacing.sm,
          }}>
            Obras importantes:
          </Text>
          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textPrimary,
            marginBottom: Spacing.md,
          }}>
            {period.importantWorks.join(', ')}
          </Text>

          <Text style={{
            fontSize: Typography.fontSize.sm,
            color: themeColors.textSecondary,
            fontStyle: 'italic',
          }}>
            Contexto: {period.context}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <LinearGradient
        colors={Colors.gradientAccent as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xl,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={{
              fontSize: Typography.fontSize['2xl'],
              fontWeight: Typography.fontWeight.bold,
              color: Colors.white,
              marginBottom: Spacing.xs,
            }}>
              📚 Educação Poética
            </Text>
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: 'rgba(255,255,255,0.9)',
            }}>
              Aprenda sobre formas, figuras e história
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: BorderRadius.full,
              padding: Spacing.sm,
            }}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: themeColors.surface,
        margin: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        ...Shadows.sm,
      }}>
        {renderTabButton('forms', 'Formas', 'library')}
        {renderTabButton('devices', 'Figuras', 'color-palette')}
        {renderTabButton('history', 'História', 'time')}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: Spacing.lg,
          paddingTop: 0,
          paddingBottom: 100,
        }}
      >
        {activeTab === 'forms' && renderPoetryForms()}
        {activeTab === 'devices' && renderLiteraryDevices()}
        {activeTab === 'history' && renderPoetryHistory()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PoetryEducationScreen;
