// src/components/UI/PoetryCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Spacing, Shadows, CommonStyles } from '../../styles/DesignSystem';
import Card from './Card';

interface PoetryCardProps {
  title: string;
  content: string;
  author?: string;
  date?: string;
  category?: string;
  onPress?: () => void;
  style?: ViewStyle;
  isDark?: boolean;
}

const PoetryCard: React.FC<PoetryCardProps> = ({
  title,
  content,
  author,
  date,
  category,
  onPress,
  style,
  isDark = false,
}) => {
  // Função para obter a cor do gradiente com base na categoria
  const getCategoryGradient = () => {
    if (!category) return ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'];
    
    // Usar a função do DesignSystem se disponível
    if (typeof CommonStyles.helpers?.getCategoryGradient === 'function') {
      return CommonStyles.helpers.getCategoryGradient(category, isDark);
    }
    
    // Fallback para cores padrão
    return isDark 
      ? [Colors.primaryDark, Colors.secondaryDark]
      : [Colors.primary, Colors.secondary];
  };

  // Função para obter o emoji da categoria
  const getCategoryEmoji = () => {
    if (!category) return '📝';
    
    // Usar a função do DesignSystem se disponível
    if (typeof CommonStyles.helpers?.getCategoryEmoji === 'function') {
      return CommonStyles.helpers.getCategoryEmoji(category);
    }
    
    return '📝';
  };

  // Renderiza o conteúdo do cartão
  const renderCardContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryEmoji()} {category}</Text>
          </View>
        )}
      </View>
      
      <Text 
        style={[styles.content, isDark && styles.contentDark]} 
        numberOfLines={5}
      >
        {content}
      </Text>
      
      <View style={styles.footerContainer}>
        {author && (
          <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
            Por: {author} {date && `• ${date}`}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Card
      variant="poetry"
      onPress={onPress}
      style={[styles.card, style]}
      isDark={isDark}
    >
      <LinearGradient
        colors={getCategoryGradient()}
        style={styles.categoryIndicator}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {renderCardContent()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  categoryIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  contentContainer: {
    padding: Spacing.base,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    ...CommonStyles.poetryText,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleDark: {
    color: Colors.textPrimaryDark,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  content: {
    ...CommonStyles.poetryText,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    lineHeight: Typography.lineHeight.relaxed,
  },
  contentDark: {
    color: Colors.textPrimaryDark,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  metaTextDark: {
    color: Colors.textSecondaryDark,
  },
});

export default PoetryCard;