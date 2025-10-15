import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, CommonStyles, BorderRadius, Shadows } from '../styles/DesignSystem';
import { useSettings } from '../contexts/SettingsContext';
import { getGlobalThemeColors } from '../utils/ThemeUtils';
import ModernCard from '../components/UI/ModernCard';
import { useApp } from '../contexts/AppContext';
import { POETRY_FORMS, LITERARY_DEVICES, POETRY_HISTORY } from '../constants/poetryEducation';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AboutScreen: React.FC = () => {
  const { settings } = useSettings();
  const { stats } = useApp();
  const navigation = useNavigation();
  const themeColors = getGlobalThemeColors(settings?.themeVariant ?? 'default', settings?.darkTheme ?? false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const appFeatures = [
    {
      title: 'Criação Poética',
      description: 'Interface intuitiva para escrever e editar poemas com templates personalizados',
      icon: 'create-outline',
      gradient: themeColors.gradientPrimary,
    },
    {
      title: 'IA Musa',
      description: 'Assistente de IA que ajuda na criação, inspiração e correção de textos poéticos',
      icon: 'sparkles-outline',
      gradient: themeColors.gradientSecondary,
    },
    {
      title: 'Organização Inteligente',
      description: 'Categorize e organize seus poemas com sistema de tags e pastas personalizadas',
      icon: 'folder-outline',
      gradient: themeColors.gradientAccent,
    },
    {
      title: 'Exportação Múltipla',
      description: 'Exporte seus poemas em PDF, imagem ou texto puro para compartilhar',
      icon: 'share-outline',
      gradient: themeColors.gradientPrimary,
    },
    {
      title: 'Gamificação',
      description: 'Sistema de conquistas e estatísticas para motivar sua jornada poética',
      icon: 'trophy-outline',
      gradient: themeColors.gradientSecondary,
    },
    {
      title: 'Modo Offline',
      description: 'Crie e edite seus poemas mesmo sem conexão com a internet',
      icon: 'phone-portrait-outline',
      gradient: themeColors.gradientAccent,
    },
  ];

  const testimonials = [
    {
      text: '"O Verso&Musa transformou minha relação com a poesia. Agora escrevo todos os dias!"',
      author: 'Ana Silva',
      role: 'Poeta Amadora',
    },
    {
      text: '"A IA Musa é incrível! Me ajuda a superar o bloqueio criativo e encontrar as palavras certas."',
      author: 'Carlos Mendes',
      role: 'Escritor',
    },
    {
      text: '"Interface linda e funcionalidades completas. É o app de poesia que eu sempre sonhei."',
      author: 'Mariana Costa',
      role: 'Professora de Literatura',
    },
  ];

  const handleContact = (type: 'email' | 'feedback') => {
    if (type === 'email') {
      Linking.openURL('mailto:marvinsfglucas@gmail.com');
    } else {
      Linking.openURL('mailto:marvinsfglucas@gmail.com?subject=Feedback do App Verse&body=Olá! Gostaria de enviar um feedback sobre o app Verse:');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle={settings?.darkTheme ? "light-content" : "dark-content"} backgroundColor={themeColors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing['4xl'] }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={themeColors.gradientPrimary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Verso & Musa</Text>
            <Text style={styles.tagline}>
              Onde a poesia encontra a inspiração
            </Text>
            <Text style={styles.version}>Versão 1.0.0 Beta</Text>
          </View>
        </LinearGradient>

        {/* App Description */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading2, { color: themeColors.textPrimary, textAlign: 'center', marginBottom: Spacing.lg }]}>
            Sobre o App
          </Text>
          <Text style={[CommonStyles.body, { color: themeColors.textSecondary, textAlign: 'center', lineHeight: 24 }]}>
            Verso&Musa é seu companheiro completo para a criação poética. Com ferramentas intuitivas,
            templates inspiradores, assistente de IA e organização inteligente, transforme suas ideias
            em versos memoráveis. Esta versão Beta está sendo constantemente aprimorada com seu feedback.
          </Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            Seu Progresso Poético
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ModernCard
                title="Poemas Criados"
                value={stats.totalPoems?.toString() || '0'}
                icon="book"
                gradient={themeColors.gradientPrimary}
                trend="up"
                trendValue={`${stats.totalPoems || 0} obras`}
              />
            </View>
            <View style={styles.statItem}>
              <ModernCard
                title="Palavras Escritas"
                value={stats.totalWords?.toLocaleString() || '0'}
                icon="text"
                gradient={themeColors.gradientSecondary}
                trend="up"
                trendValue={`${stats.totalWords || 0} palavras`}
              />
            </View>
            <View style={styles.statItem}>
              <ModernCard
                title="Categorias Exploradas"
                value={`${stats.categoriesExplored || 0}`}
                icon="library"
                gradient={themeColors.gradientAccent}
                trend="up"
                trendValue="tipos diferentes"
              />
            </View>
            <View style={styles.statItem}>
              <ModernCard
                title="Categorias"
                value={stats.categoriesExplored?.toString() || '0'}
                icon="albums"
                gradient={themeColors.gradientPrimary}
                trend="up"
                trendValue="exploradas"
              />
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            Funcionalidades Principais
          </Text>
          <View style={styles.featuresGrid}>
            {appFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleSection(`feature-${index}`)}
                activeOpacity={0.7}
                style={styles.featureCard}
              >
                <LinearGradient
                  colors={feature.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureGradient}
                >
                  <Ionicons name={feature.icon as any} size={32} color={Colors.white} />
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  {expandedSection === `feature-${index}` && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.expandedText}>
                        Descubra como esta funcionalidade pode transformar sua experiência poética.
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            O que dizem nossos usuários
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsContainer}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={[styles.testimonialCard, { backgroundColor: themeColors.surface, ...Shadows.md }]}>
                <Text style={[CommonStyles.quote, { color: themeColors.textPrimary, marginBottom: Spacing.md }]}>
                  {testimonial.text}
                </Text>
                <View style={styles.testimonialAuthor}>
                  <Text style={[CommonStyles.body, { color: themeColors.textPrimary, fontWeight: '600' }]}>
                    {testimonial.author}
                  </Text>
                  <Text style={[CommonStyles.caption, { color: themeColors.textSecondary }]}>
                    {testimonial.role}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            Sobre o Desenvolvedor
          </Text>
          <View style={[styles.developerCard, { backgroundColor: themeColors.surface, ...Shadows.lg }]}>
            <Image
              source={require('../../assets/musa.png')}
              style={styles.developerImage}
              resizeMode="cover"
            />
            <View style={styles.developerInfo}>
              <Text style={[CommonStyles.heading4, { color: themeColors.textPrimary }]}>
                Dário Pimentel
              </Text>
              <Text style={[CommonStyles.bodySmall, { color: themeColors.textSecondary, marginBottom: Spacing.sm }]}>
                Dev & Apaixonado por Poesia
              </Text>
              <Text style={[CommonStyles.body, { color: themeColors.textSecondary, lineHeight: 20 }]}>
                Criador do Verso&Musa com o sonho de democratizar a poesia através da tecnologia.
                Acredito que todos têm um poeta interior esperando para ser descoberto.
              </Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  onPress={() => handleContact('email')}
                  style={[styles.socialButton, { backgroundColor: themeColors.primary }]}
                >
                  <Ionicons name="information-circle-outline" size={20} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleContact('feedback')}
                  style={[styles.socialButton, { backgroundColor: themeColors.secondary }]}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleContact('feedback')}
                  style={[styles.socialButton, { backgroundColor: themeColors.accent }]}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Recursos Avançados */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            🚀 Recursos Avançados
          </Text>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('WriterDashboard' as never)}
              style={[
                styles.advancedFeatureCard,
                { backgroundColor: themeColors.surface, ...Shadows.md }
              ]}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.advancedFeatureGradient}
              >
                <Ionicons name="analytics" size={32} color={Colors.white} />
                <Text style={styles.advancedFeatureTitle}>Dashboard do Escritor</Text>
                <Text style={styles.advancedFeatureDescription}>
                  Métricas, análises e relatórios de produtividade
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('PoetryEducation' as never)}
              style={[
                styles.advancedFeatureCard,
                { backgroundColor: themeColors.surface, ...Shadows.md }
              ]}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.advancedFeatureGradient}
              >
                <Ionicons name="school" size={32} color={Colors.white} />
                <Text style={styles.advancedFeatureTitle}>Educação Poética</Text>
                <Text style={styles.advancedFeatureDescription}>
                  Aprenda formas, figuras e história da poesia
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beta Information */}
        <View style={styles.section}>
          <Text style={[CommonStyles.heading3, { color: themeColors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' }]}>
            Versão Beta
          </Text>
          <View style={[styles.betaCard, { backgroundColor: themeColors.surface, ...Shadows.md }]}>
            <View style={styles.betaHeader}>
              <Ionicons name="flask-outline" size={32} color={themeColors.primary} />
              <Text style={[CommonStyles.heading4, { color: themeColors.textPrimary, marginLeft: Spacing.md }]}>
                Em Desenvolvimento
              </Text>
            </View>
            <Text style={[CommonStyles.body, { color: themeColors.textSecondary, lineHeight: 22, marginTop: Spacing.md }]}>
              Esta é uma versão Beta do Verso&Musa. Estamos constantemente trabalhando em melhorias
              e novas funcionalidades. Sua opinião é fundamental para tornar este app ainda melhor!
            </Text>
            <TouchableOpacity
              onPress={() => handleContact('feedback')}
              style={[styles.feedbackButton, { backgroundColor: themeColors.primary }]}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
              <Text style={styles.feedbackButtonText}>Enviar Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[CommonStyles.caption, { color: themeColors.textSecondary, textAlign: 'center' }]}>
            © 2025 Verso&Musa. Todos os direitos reservados.
          </Text>
          <Text style={[CommonStyles.caption, { color: themeColors.textSecondary, textAlign: 'center', marginTop: Spacing.xs }]}>
            Versão Beta • Feito com ❤️ para amantes da poesia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  appTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  version: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  section: {
    padding: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
  },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  expandedContent: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
  },
  expandedText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    textAlign: 'center',
  },
  testimonialsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  testimonialCard: {
    width: width * 0.8,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  developerCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  advancedFeatureCard: {
    width: (width - Spacing.lg * 3) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  advancedFeatureGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
  },
  advancedFeatureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  advancedFeatureDescription: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  developerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: Spacing.md,
  },
  developerInfo: {
    flex: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  storeIcon: {
    width: 48,
    height: 48,
    marginRight: Spacing.md,
  },
  storeTextSmall: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
  },
  storeTextLarge: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  betaCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  betaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  feedbackButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  betaCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});

export default AboutScreen;
