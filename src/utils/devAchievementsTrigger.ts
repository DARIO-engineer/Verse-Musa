import { EnhancedAchievementService } from '../services/EnhancedAchievementService';

// Helper dev: expõe função global para revalidar conquistas manualmente
export async function attachDevRevalidate() {
  try {
    // @ts-ignore
    globalThis.__triggerRevalidateAchievements = async (userId: string = 'default') => {
      console.log('🔧 Dev: iniciando revalidação de conquistas...');
      await EnhancedAchievementService.revalidateAllAchievements(userId);
      console.log('🔧 Dev: revalidação concluída');
    };

    console.log('🔧 Dev: __triggerRevalidateAchievements disponível no globalThis');
  } catch (err) {
    console.error('🔧 Dev: não foi possível anexar revalidação de conquistas', err);
  }
}

export default attachDevRevalidate;
