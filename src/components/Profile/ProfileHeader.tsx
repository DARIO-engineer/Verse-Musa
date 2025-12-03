
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../styles/DesignSystem';

interface ProfileHeaderProps {
  userName: string | null;
  userEmail: string | null;
  googlePhoto: string | null;
  isDarkTheme: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userName, userEmail, googlePhoto, isDarkTheme }) => {
  const themeColors = {
    background: isDarkTheme ? Colors.backgroundDark : Colors.background,
    text: isDarkTheme ? Colors.textPrimaryDark : Colors.textPrimary,
    card: isDarkTheme ? Colors.gray800 : Colors.white,
  };

  return (
    <View style={styles.container}>
      {googlePhoto ? (
        <Image source={{ uri: googlePhoto }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person-outline" size={60} color={Colors.primary} />
        </View>
      )}
      <Text style={[styles.userName, { color: themeColors.text }]}>{userName || 'Convidado'}</Text>
      {userEmail && <Text style={[styles.userEmail, { color: Colors.gray500 }]}>{userEmail}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.lg,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
});

export default ProfileHeader;