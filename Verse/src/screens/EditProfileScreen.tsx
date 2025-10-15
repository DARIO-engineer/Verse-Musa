import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EnhancedProfileService } from '../services/EnhancedProfileService';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../styles/DesignSystem';
import SimpleCache from '../utils/SimpleCache';

interface FormData {
  name: string;
  email: string;
  bio: string;
  inspirationQuote: string;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    bio: '',
    inspirationQuote: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Forçar limpeza completa do cache antes de carregar
      SimpleCache.delete('user_profile');
      
      const profileData = await EnhancedProfileService.getProfile();
      setProfile(profileData);
      
      if (profileData) {
        const newFormData = {
          name: profileData.name || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          inspirationQuote: profileData.inspirationQuote || '',
        };
        
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!formData.name.trim()) {
        Alert.alert('Erro', 'O nome é obrigatório!');
        return;
      }

      const dataToSave = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        inspirationQuote: formData.inspirationQuote.trim(),
      };
      
      console.log('💾 EditProfile - Salvando dados:', dataToSave);

      const success = await EnhancedProfileService.updateProfile(dataToSave);

      if (success) {
        console.log('✅ EditProfile - Dados salvos, recarregando...');
        // Recarregar o perfil para mostrar as alterações
        await loadProfile();
        
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoAction = () => {
    const options: any[] = [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: selectPhoto },
    ];

    if (profile?.photoUri) {
      options.push({ 
        text: 'Remover Foto', 
        onPress: removePhoto, 
        style: 'destructive'
      });
    }

    Alert.alert(
      'Foto do Perfil',
      profile?.photoUri 
        ? 'Você já tem uma foto. O que deseja fazer?' 
        : 'Adicionar foto do perfil:',
      options
    );
  };

  const takePhoto = async () => {
    const photoUri = await EnhancedProfileService.takeProfilePhoto();
    if (photoUri) {
      await loadProfile(); // Recarregar perfil completo
    }
  };

  const selectPhoto = async () => {
    const photoUri = await EnhancedProfileService.selectProfilePhoto();
    if (photoUri) {
      await loadProfile(); // Recarregar perfil completo
    }
  };

  const removePhoto = async () => {
    const success = await EnhancedProfileService.removeProfilePhoto();
    if (success) {
      await loadProfile(); // Recarregar perfil completo
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle" size={60} color={Colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#000000' }]}>
            Carregando perfil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          Editar Perfil
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Ionicons 
            name="checkmark" 
            size={24} 
            color={saving ? '#999999' : Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção Foto */}
        <View style={[styles.section, { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }]}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#000000' }]}>
            📸 Foto do Perfil
          </Text>
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={handlePhotoAction} style={styles.photoWrapper}>
              {profile?.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.initialText}>
                    {(formData.name || profile?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.photoEditIcon}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: isDark ? '#cccccc' : '#666666' }]}>
              {profile?.photoUri 
                ? 'Toque para alterar ou remover foto' 
                : formData.name 
                  ? `Toque para adicionar foto de ${formData.name}` 
                  : 'Toque para adicionar foto'}
            </Text>
          </View>
        </View>

        {/* Seção Informações */}
        <View style={[styles.section, { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }]}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#ffffff' : '#000000' }]}>
            👤 Informações Pessoais
          </Text>
          
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Nome *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#3a3a3a' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#555555' : '#dddddd'
              }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Seu nome artístico"
              placeholderTextColor={isDark ? '#999999' : '#666666'}
              maxLength={50}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Email (opcional)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#3a3a3a' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#555555' : '#dddddd'
              }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="seu@email.com"
              placeholderTextColor={isDark ? '#999999' : '#666666'}
              keyboardType="email-address"
              maxLength={100}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Frase Inspiradora</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#3a3a3a' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#555555' : '#dddddd'
              }]}
              value={formData.inspirationQuote}
              onChangeText={(text) => setFormData({ ...formData, inspirationQuote: text })}
              placeholder="Uma frase que te inspira a escrever..."
              placeholderTextColor={isDark ? '#999999' : '#666666'}
              maxLength={200}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? '#ffffff' : '#000000' }]}>Biografia (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: isDark ? '#3a3a3a' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#555555' : '#dddddd'
              }]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Conte um pouco sobre você e sua jornada na poesia..."
              placeholderTextColor={isDark ? '#999999' : '#666666'}
              multiline
              maxLength={500}
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  photoEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
