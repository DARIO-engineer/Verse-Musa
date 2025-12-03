import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';

const { width } = Dimensions.get('window');

interface LiteraryForm {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  characteristics: string[];
  example: string;
  tips: string[];
  icon: string;
  color: string;
  gradient: string[];
}

const LITERARY_FORMS: LiteraryForm[] = [
  {
    id: 'poesia',
    title: 'Poesia',
    subtitle: 'A arte de expressar o coração',
    description: 'Arte de expressar sentimentos e ideias através de palavras ritmadas e belas. A poesia toca a alma, inspira o espírito e conecta o humano ao divino.',
    characteristics: [
      'Expressão de sentimentos profundos',
      'Uso de metáforas e simbolismos',
      'Ritmo e musicalidade nas palavras',
      'Linguagem figurada e criativa',
      'Conexão entre o terreno e o eterno'
    ],
    example: `Deus é o Verbo que se fez canção,
A Palavra que dança em cada verso.
No universo do Seu coração,
Cada alma é um poema diverso.

Cristo, o Poeta dos poetas,
Escreveu amor em cruz de dor.
Suas mãos, divinas canetas,
Redigiram nossa redenção em amor.

— Exemplo cristocêntrico`,
    tips: [
      'Escreva com o coração aberto',
      'Use imagens que toquem a alma',
      'Conecte o humano ao divino',
      'Explore trocadilhos e jogos de palavras',
      'Deixe a fé inspirar seus versos'
    ],
    icon: 'heart-outline',
    color: '#D32F2F',
    gradient: ['#D32F2F', '#F44336']
  },
  {
    id: 'soneto',
    title: 'Soneto',
    subtitle: 'A forma clássica da poesia',
    description: 'Forma poética fixa de 14 versos em quartetos e tercetos. Estrutura perfeita para expressar reflexões profundas sobre fé, amor e vida.',
    characteristics: [
      '14 versos em 4 estrofes fixas',
      'Dois quartetos e dois tercetos',
      'Esquema de rimas tradicional',
      'Métrica decassílaba (10 sílabas)',
      'Desenvolvimento temático estruturado'
    ],
    example: `Jesus, o Verbo eterno feito carne,
Desceu do céu à terra por amor.
Na cruz, Seu sangue santo nos encarne
Da morte eterna, dando-nos vigor.

Ressuscitou! A morte não O alcança,
Venceu o mal, quebrou a maldição.
Em nós plantou divina esperança,
Selou conosco nova aliança, irmão.

Oh graça que nos salva e nos liberta!
Oh amor que jamais se esgotará!
Cristo, a porta sempre aberta,

Que ao Pai eterno nos conduzirá.
Neste soneto, minha alma desperta
Para louvar quem sempre me amará.

— Soneto cristocêntrico`,
    tips: [
      'Desenvolva um tema central forte',
      'Use os quartetos para exposição',
      'Reserve os tercetos para conclusão',
      'Conte as sílabas com cuidado',
      'Mantenha unidade temática'
    ],
    icon: 'library-outline',
    color: '#8E24AA',
    gradient: ['#8E24AA', '#BA68C8']
  },
  {
    id: 'verso_livre',
    title: 'Verso Livre',
    subtitle: 'Liberdade poética guiada pelo Espírito',
    description: 'Poesia sem métrica fixa, onde o Espírito guia o ritmo. Liberdade para expressar a fé sem amarras formais, deixando o coração falar.',
    characteristics: [
      'Sem métrica ou rima obrigatória',
      'Ritmo natural e espontâneo',
      'Liberdade de expressão total',
      'Foco na mensagem e emoção',
      'Estrutura flexível e criativa'
    ],
    example: `No silêncio da madrugada,
Quando o mundo dorme
E só restam Deus e eu,

Sussurro orações
Que sobem como incenso,
Palavras que dançam
Entre o céu e a terra.

Sou livre para amar,
Livre para crer,
Livre para ser
Quem Ele sonhou que eu fosse.

Verso livre,
Alma livre,
Coração livre em Cristo.

— Verso livre cristocêntrico`,
    tips: [
      'Deixe o Espírito guiar o ritmo',
      'Use quebras de linha intencionais',
      'Explore imagens espirituais fortes',
      'Seja autêntico na expressão',
      'Confie na inspiração divina'
    ],
    icon: 'infinite-outline',
    color: '#1976D2',
    gradient: ['#1976D2', '#42A5F5']
  },
  {
    id: 'jogral',
    title: 'Jogral',
    subtitle: 'Vozes unidas em louvor',
    description: 'Poesia coletiva onde múltiplas vozes se unem em harmonia. Perfeita para cultos, celebrações e momentos de adoração comunitária.',
    characteristics: [
      'Múltiplas vozes em harmonia',
      'Alternância entre solo e coro',
      'Ritmo marcante e memorável',
      'Mensagem edificante e clara',
      'Participação coletiva ativa'
    ],
    example: `VOZ 1: Cristo é o Caminho!
CORO: Ele nos conduz!

VOZ 2: Cristo é a Verdade!
CORO: Ele nos liberta!

VOZ 1: Cristo é a Vida!
VOZ 2: Nele temos paz!
CORO: Jesus é o Senhor,
       Nosso Salvador!

TODOS: Aleluia! Aleluia!
       Cristo reina em nós!
       Aleluia! Aleluia!
       Bendito seja Deus!

— Jogral cristocêntrico`,
    tips: [
      'Defina claramente cada voz',
      'Crie refrões fáceis de decorar',
      'Use temas edificantes e claros',
      'Mantenha ritmo constante',
      'Facilite a participação de todos'
    ],
    icon: 'people-outline',
    color: '#00796B',
    gradient: ['#00796B', '#4DB6AC']
  }
];

interface LiteraryGuideScreenProps {
  onClose?: () => void;
}

const LiteraryGuideScreen: React.FC<LiteraryGuideScreenProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const { activeTheme, getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  const isDark = activeTheme === 'dark';
  
  const [selectedForm, setSelectedForm] = useState<LiteraryForm | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleCard = (formId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(formId)) {
      newExpanded.delete(formId);
    } else {
      newExpanded.add(formId);
    }
    setExpandedCards(newExpanded);
  };

  const renderLiteraryForm = (form: LiteraryForm, index: number) => {
    const isExpanded = expandedCards.has(form.id);
    
    return (
      <Animated.View
        key={form.id}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: Spacing.lg,
        }}
      >
        <TouchableOpacity
          onPress={() => toggleCard(form.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={form.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: BorderRadius.xl,
              padding: Spacing.lg,
              ...Shadows.lg,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isExpanded ? Spacing.md : 0,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: BorderRadius.full,
                  padding: Spacing.sm,
                  marginRight: Spacing.md,
                }}>
                  <Ionicons name={form.icon as any} size={24} color={Colors.white} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: Typography.fontSize.xl,
                    fontWeight: Typography.fontWeight.bold,
                    color: Colors.white,
                    marginBottom: Spacing.xs,
                  }}>
                    {form.title}
                  </Text>
                  <Text style={{
                    fontSize: Typography.fontSize.sm,
                    color: 'rgba(255,255,255,0.9)',
                    fontStyle: 'italic',
                  }}>
                    {form.subtitle}
                  </Text>
                </View>
              </View>
              
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={Colors.white} 
              />
            </View>

            {isExpanded && (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: BorderRadius.lg,
                padding: Spacing.md,
              }}>
                {/* Descrição */}
                <Text style={{
                  fontSize: Typography.fontSize.base,
                  color: Colors.white,
                  lineHeight: 24,
                  marginBottom: Spacing.lg,
                }}>
                  {form.description}
                </Text>

                {/* Características */}
                <View style={{ marginBottom: Spacing.lg }}>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.semibold,
                    color: Colors.white,
                    marginBottom: Spacing.sm,
                  }}>
                    📋 Características:
                  </Text>
                  {form.characteristics.map((char, idx) => (
                    <Text key={idx} style={{
                      fontSize: Typography.fontSize.sm,
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: Spacing.xs,
                      paddingLeft: Spacing.md,
                    }}>
                      • {char}
                    </Text>
                  ))}
                </View>

                {/* Exemplo */}
                <View style={{ marginBottom: Spacing.lg }}>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.semibold,
                    color: Colors.white,
                    marginBottom: Spacing.sm,
                  }}>
                    📝 Exemplo:
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: BorderRadius.md,
                    padding: Spacing.md,
                  }}>
                    <Text style={{
                      fontSize: Typography.fontSize.sm,
                      color: Colors.white,
                      fontFamily: 'monospace',
                      lineHeight: 20,
                    }}>
                      {form.example}
                    </Text>
                  </View>
                </View>

                {/* Dicas */}
                <View>
                  <Text style={{
                    fontSize: Typography.fontSize.lg,
                    fontWeight: Typography.fontWeight.semibold,
                    color: Colors.white,
                    marginBottom: Spacing.sm,
                  }}>
                    💡 Dicas para Escrever:
                  </Text>
                  {form.tips.map((tip, idx) => (
                    <Text key={idx} style={{
                      fontSize: Typography.fontSize.sm,
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: Spacing.xs,
                      paddingLeft: Spacing.md,
                    }}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
        colors={isDark ? Colors.gradientNight as any : Colors.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          borderBottomLeftRadius: BorderRadius.xl,
          borderBottomRightRadius: BorderRadius.xl,
          ...Shadows.lg,
        }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              onPress={() => onClose ? onClose() : navigation.goBack()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: BorderRadius.full,
                padding: Spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
              <Text style={{
                color: Colors.white,
                fontSize: Typography.fontSize.sm,
                fontWeight: Typography.fontWeight.medium,
                marginLeft: Spacing.xs,
              }}>
                Voltar
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', flex: 1, marginHorizontal: Spacing.lg }}>
              <Text style={{
                fontSize: Typography.fontSize.xl,
                fontWeight: Typography.fontWeight.bold,
                color: Colors.white,
                textAlign: 'center',
              }}>
                📚 Guia Literário
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginTop: Spacing.xs,
              }}>
                Explore as formas de arte literária
              </Text>
            </View>

            <View style={{ width: 80 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introdução */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: Spacing.xl,
          }}
        >
          <View style={{
            backgroundColor: themeColors.surface,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            ...Shadows.sm,
          }}>
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.semibold,
              color: themeColors.textPrimary,
              marginBottom: Spacing.md,
              textAlign: 'center',
            }}>
              🎨 Bem-vindo ao Mundo da Literatura
            </Text>
            <Text style={{
              fontSize: Typography.fontSize.base,
              color: themeColors.textSecondary,
              lineHeight: 24,
              textAlign: 'center',
            }}>
              Descubra as diferentes formas de arte literária que você pode explorar no App. 
              Cada forma tem suas próprias características, beleza e desafios únicos.
            </Text>
          </View>
        </Animated.View>

        {/* Formas Literárias */}
        {LITERARY_FORMS.map((form, index) => renderLiteraryForm(form, index))}

        {/* Call to Action */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: Spacing.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateTab' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themeColors.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: BorderRadius.xl,
                padding: Spacing.lg,
                alignItems: 'center',
                ...Shadows.md,
              }}
            >
              <Ionicons name="create" size={32} color={Colors.white} />
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
                color: Colors.white,
                marginTop: Spacing.sm,
              }}>
                Comece a Escrever
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginTop: Spacing.xs,
              }}>
                Aplique o que aprendeu e crie sua primeira obra
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default LiteraryGuideScreen;
