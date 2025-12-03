import * as React from 'react';
import { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  AchievementService, 
  AchievementState, 
  Achievement, 
  AchievementProgress,
  POEM_ACHIEVEMENTS
} from '../services/AchievementService';
import { useDrafts } from './DraftsContext';
import AchievementCelebrationModal from '../components/AchievementCelebrationModal';

interface AchievementContextType {
  achievementState: AchievementState;
  currentAchievement: Achievement | null;
  nextAchievement: Achievement | null;
  nextProgress: AchievementProgress | undefined;
  progressToNext: number;
  checkAchievements: () => Promise<void>;
  getAchievementProgress: (key: string) => AchievementProgress | undefined;
  getAchievementStats: () => {
    totalAchievements: number;
    unlockedCount: number;
    progress: number;
    completionPercentage: number;
  };
  markAchievementAsShown: (achievementKey: string) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const { drafts } = useDrafts();
  const [achievementState, setAchievementState] = useState<AchievementState>({
    unlockedAchievements: [],
    progress: [],
    newUnlockedAchievementKeys: [],
    lastUnlockedKey: undefined
  });
  const [lastUnlockedKey, setLastUnlockedKey] = useState<string | undefined>(undefined);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsAchievement, setCongratsAchievement] = useState<Achievement | null>(null);

  // Verificar conquistas quando os rascunhos mudarem
  useEffect(() => {
    checkAchievements();
  }, [drafts]);

  // Detectar novas conquistas
  useEffect(() => {
    if (achievementState.lastUnlockedKey && achievementState.lastUnlockedKey !== lastUnlockedKey) {
      setLastUnlockedKey(achievementState.lastUnlockedKey);
    }
  }, [achievementState.lastUnlockedKey, lastUnlockedKey]);

  // Detectar novas conquistas e exibir modal de felicitação
  useEffect(() => {
    if (achievementState.newUnlockedAchievementKeys.length > 0) {
      const key = achievementState.newUnlockedAchievementKeys[0];
      const achievement = POEM_ACHIEVEMENTS.find(a => a.key === key) || null;
      if (achievement) {
        setCongratsAchievement(achievement);
        setShowCongratsModal(true);
      }
    }
  }, [achievementState.newUnlockedAchievementKeys]);

  const handleCloseCongrats = () => {
    if (congratsAchievement) {
      markAchievementAsShown(congratsAchievement.key);
    }
    setShowCongratsModal(false);
    setCongratsAchievement(null);
  };

  const checkAchievements = async (): Promise<void> => {
    const result = await AchievementService.checkAndUpdateAchievements(drafts);
    setAchievementState(result.state);
  };

  // Obter conquistas e progresso
  const currentAchievement = AchievementService.getCurrentAchievement(achievementState);
  const nextAchievement = AchievementService.getNextAchievement(achievementState);
  const nextProgress = nextAchievement ? 
    AchievementService.getAchievementProgress(nextAchievement.key, achievementState) : 
    undefined;
  const progressToNext = nextProgress ? Math.min(1, nextProgress.currentCount / (nextAchievement?.poems || 1)) : 1;

  const getAchievementProgress = (key: string): AchievementProgress | undefined => {
    return AchievementService.getAchievementProgress(key, achievementState);
  };

  const getAchievementStats = () => {
    return AchievementService.getAchievementStats(achievementState);
  };

  const markAchievementAsShown = (achievementKey: string) => {
    setAchievementState(prev => ({
      ...prev,
      newUnlockedAchievementKeys: prev.newUnlockedAchievementKeys.filter(key => key !== achievementKey)
    }));
  };

  const value: AchievementContextType = {
    achievementState,
    currentAchievement,
    nextAchievement,
    nextProgress,
    progressToNext,
    checkAchievements,
    getAchievementProgress,
    getAchievementStats,
    markAchievementAsShown,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
      <AchievementCelebrationModal
        visible={showCongratsModal}
        achievement={congratsAchievement ? {
          id: congratsAchievement.key,
          title: congratsAchievement.label,
          description: congratsAchievement.description,
          icon: congratsAchievement.icon,
          category: congratsAchievement.category,
          unlockedAt: undefined
        } : null}
        onClose={handleCloseCongrats}
      />
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  // Proteção máxima: só chama useContext se React estiver disponível e AchievementContext não for null
  if (!React || typeof React.useContext !== 'function') {
    return {
      achievementState: {
        unlockedAchievements: [],
        progress: [],
        newUnlockedAchievementKeys: [],
        lastUnlockedKey: undefined
      },
      currentAchievement: null,
      nextAchievement: null,
      nextProgress: undefined,
      progressToNext: 0,
      checkAchievements: async () => {},
      getAchievementProgress: (_key: string) => undefined,
      getAchievementStats: () => ({
        totalAchievements: 0,
        unlockedCount: 0,
        progress: 0,
        completionPercentage: 0,
      }),
      markAchievementAsShown: () => {},
    };
  }
  const context = React.useContext(AchievementContext);
  if (context === undefined) {
    return {
      achievementState: {
        unlockedAchievements: [],
        progress: [],
        newUnlockedAchievementKeys: [],
        lastUnlockedKey: undefined
      },
      currentAchievement: null,
      nextAchievement: null,
      nextProgress: undefined,
      progressToNext: 0,
      checkAchievements: async () => {},
      getAchievementProgress: () => undefined,
      getAchievementStats: () => ({
        totalAchievements: 0,
        unlockedCount: 0,
        progress: 0,
        completionPercentage: 0,
      }),
      markAchievementAsShown: () => {},
    };
  }
  return context;
};
