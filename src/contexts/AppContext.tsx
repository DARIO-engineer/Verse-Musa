import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { DraftService, Draft } from '../services/DraftService';
import { EnhancedProfileService, UserProfile } from '../services/EnhancedProfileService';
import SimpleCache from '../utils/SimpleCache';

interface AppContextType {
  // Drafts
  drafts: Draft[];
  loading: boolean;
  
  // Profile
  profile: UserProfile | null;
  
  // Actions
  loadDrafts: (forceReload?: boolean) => Promise<void>;
  addDraft: (title: string, content: string, category: 'Poesia' | 'Jogral' | 'Soneto') => Promise<string>;
  deleteDraft: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Stats
  stats: {
    totalPoems: number;
    totalWords: number;
    categoriesExplored: number;
    publishedPoems: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDrafts = useCallback(async (forceReload: boolean = false) => {
    try {
      setLoading(true);
      
      // Se forceReload for true, pular o cache
      if (!forceReload) {
        // Verificar cache primeiro
        const cacheKey = 'app_drafts';
        const cached = SimpleCache.get(cacheKey);
        if (cached) {
          console.log('📦 Usando dados do cache para rascunhos');
          setDrafts(cached);
          setLoading(false);
          return;
        }
      } else {
        console.log('🔄 Forçando recarga de rascunhos (ignorando cache)');
      }

      console.log('🌐 Carregando rascunhos do serviço...');
      const draftsData = await DraftService.getAllDrafts();
      setDrafts(draftsData);
      SimpleCache.set('app_drafts', draftsData, 30); // Cache por 30 segundos
      console.log('✅ Rascunhos carregados:', draftsData.length, 'itens');
    } catch (error) {
      console.error('Erro ao carregar rascunhos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const cacheKey = 'app_profile';
      const cached = SimpleCache.get(cacheKey);
      if (cached) {
        setProfile(cached);
        return;
      }

      const profileData = await EnhancedProfileService.getProfile();
      setProfile(profileData);
      SimpleCache.set(cacheKey, profileData, 60); // Cache por 1 minuto
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, []);

  const addDraft = useCallback(async (title: string, content: string, category: 'Poesia' | 'Jogral' | 'Soneto') => {
    try {
      const draftId = await DraftService.saveDraft(title, content, category);
      
      // Invalidar cache e recarregar
      SimpleCache.delete('app_drafts');
      await loadDrafts();
      
      // Atualizar estatísticas de escrita no perfil
      if (profile) {
        const wordsAdded = content.split(' ').length;
        await EnhancedProfileService.updateWritingStats(wordsAdded, true);
        // Recarregar perfil para obter as estatísticas atualizadas
        await loadProfile();
      }
      
      return draftId;
    } catch (error) {
      console.error('Erro ao adicionar rascunho:', error);
      throw error;
    }
  }, [loadDrafts, loadProfile, profile]);

  const deleteDraft = useCallback(async (id: string) => {
    try {
      await DraftService.deleteDraft(id);
      
      // Invalidar cache e recarregar
      SimpleCache.delete('app_drafts');
      await loadDrafts();
    } catch (error) {
      console.error('Erro ao deletar rascunho:', error);
      throw error;
    }
  }, [loadDrafts]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return;
      
      const updatedProfile = { ...profile, ...updates };
      await EnhancedProfileService.updateProfile(updatedProfile);
      
      // Invalidar cache e atualizar estado
      SimpleCache.delete('app_profile');
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }, [profile]);

  const refreshData = useCallback(async () => {
    // Limpar todos os caches
    SimpleCache.clear();
    
    // Recarregar dados diretamente para evitar dependências circulares
    setLoading(true);
    try {
      const [draftsData, profileData] = await Promise.all([
        DraftService.getAllDrafts(),
        EnhancedProfileService.getProfile()
      ]);
      
      setDrafts(draftsData);
      setProfile(profileData);
      
      // Recriar cache
      SimpleCache.set('app_drafts', draftsData, 30);
      SimpleCache.set('app_profile', profileData, 60);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Sem dependências para evitar loops

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const totalPoems = drafts.length;
    const publishedPoems = drafts.filter(d => d.isPublished).length;
    const totalWords = drafts.reduce((acc, draft) => {
      return acc + (draft.content?.split(' ').length || 0);
    }, 0);
    
    // Usar typeId primeiro, se não existir usar category (compatibilidade)
    const usedTypes = drafts.map(d => d.typeId || d.category).filter(Boolean);
    const categoriesExplored = new Set(usedTypes).size;
    
    console.log('📊 Estatísticas calculadas:', {
      totalPoems,
      totalWords,
      categoriesExplored,
      usedTypes: Array.from(new Set(usedTypes))
    });

    return {
      totalPoems,
      publishedPoems,
      totalWords,
      categoriesExplored,
    };
  }, [drafts]);

  // Calcular streak baseado nos rascunhos
  const calculateRealStreak = React.useCallback(() => {
    if (drafts.length === 0) return 0;

    try {
      // Agrupar drafts por data (dia) usando formato YYYY-MM-DD
      const draftsByDate = new Map<string, Draft[]>();
      
      drafts.forEach(draft => {
        const date = new Date(draft.createdAt);
        // Usar formato YYYY-MM-DD para evitar problemas de timezone
        const dateKey = date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0');
        
        if (!draftsByDate.has(dateKey)) {
          draftsByDate.set(dateKey, []);
        }
        draftsByDate.get(dateKey)!.push(draft);
      });

      // Converter para array de datas únicas e ordenar (mais recente primeiro)
      const uniqueDateStrings = Array.from(draftsByDate.keys()).sort().reverse();
      
      if (uniqueDateStrings.length === 0) return 0;

      // Data de hoje no formato YYYY-MM-DD
      const today = new Date();
      const todayString = today.getFullYear() + '-' + 
                         String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(today.getDate()).padStart(2, '0');

      // Data de ontem
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.getFullYear() + '-' + 
                             String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(yesterday.getDate()).padStart(2, '0');

      const mostRecentDate = uniqueDateStrings[0];
      
      // Se a atividade mais recente não foi hoje nem ontem, streak = 0
      if (mostRecentDate !== todayString && mostRecentDate !== yesterdayString) {
        return 0;
      }

      // Calcular streak consecutivo
      let streak = 1; // Começar com 1 (o dia mais recente)
      
      for (let i = 0; i < uniqueDateStrings.length - 1; i++) {
        const currentDateStr = uniqueDateStrings[i];
        const nextDateStr = uniqueDateStrings[i + 1];
        
        // Converter strings para objetos Date para calcular diferença
        const currentDate = new Date(currentDateStr + 'T00:00:00');
        const nextDate = new Date(nextDateStr + 'T00:00:00');
        
        const daysDifference = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference === 1) {
          streak++;
        } else {
          break; // Quebra na sequência
        }
      }
      
      console.log('📊 Streak calculado:', {
        totalDrafts: drafts.length,
        uniqueDays: uniqueDateStrings.length,
        mostRecentDate,
        todayString,
        yesterdayString,
        streak
      });
      
      return streak;
    } catch (error) {
      console.error('Erro ao calcular streak:', error);
      return 0;
    }
  }, [drafts]);

  // Atualizar o streak do perfil se necessário
  React.useEffect(() => {
    if (profile && drafts.length > 0) {
      const realStreak = calculateRealStreak();
      if (realStreak !== profile.currentStreak) {
        updateProfile({ currentStreak: realStreak, longestStreak: Math.max(profile.longestStreak || 0, realStreak) });
      }
    }
  }, [drafts, profile, calculateRealStreak, updateProfile]);

  // Carregar dados iniciais
  useEffect(() => {
    const initializeApp = async () => {
      await loadDrafts();
      await loadProfile();
      
      // Verificar integridade das conquistas após carregar os dados
      try {
        const EnhancedAchievementService = require('../services/EnhancedAchievementService').default;
        await EnhancedAchievementService.checkAndFixIntegrity();
        console.log('✅ Integridade das conquistas verificada');
      } catch (error) {
        console.warn('⚠️ Erro ao verificar integridade das conquistas:', error);
      }
    };
    
    initializeApp();
  }, []); // Remover dependências para evitar loops

  const value: AppContextType = {
    drafts,
    profile,
    loading,
    loadDrafts,
    addDraft,
    deleteDraft,
    updateProfile,
    refreshData,
    stats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
