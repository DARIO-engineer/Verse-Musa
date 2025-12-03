// Helper dev para criar drafts de teste que usam templates
export async function attachDevAchievementMocks() {
  try {
    // @ts-ignore
    globalThis.__createMockTemplateDrafts = async (opts: { userId?: string } = {}) => {
      try {
        const DraftService = require('../services/DraftService').DraftService;
        console.log('🔧 Dev: criando drafts mock para templates...');

        // 1) Um soneto usando template de soneto
        await DraftService.saveDraft(
          'Soneto Mock 1',
          'Linha1\nLinha2\nLinha3\nLinha4\nLinha5\nLinha6\nLinha7\nLinha8\nLinha9\nLinha10\nLinha11\nLinha12\nLinha13\nLinha14',
          'Soneto',
          undefined,
          'template_soneto_1'
        );

        // 2) Três drafts usando templates diferentes para atingir unique_templates
        await DraftService.saveDraft('Template Mock A', 'Conteúdo A A A', 'Poesia', undefined, 'template_a');
        await DraftService.saveDraft('Template Mock B', 'Conteúdo B B B', 'Poesia', undefined, 'template_b');
        await DraftService.saveDraft('Template Mock C', 'Conteúdo C C C', 'Poesia', undefined, 'template_c');

        // 3) Um draft adicional para contar como uso de template
        await DraftService.saveDraft('Template Mock Extra', 'Mais conteúdo', 'Poesia', undefined, 'template_extra');

        console.log('🔧 Dev: drafts mock criados. Agora revalide conquistas com __triggerRevalidateAchievements()');
        return true;
      } catch (err) {
        console.error('🔧 Dev: falha ao criar drafts mock', err);
        return false;
      }
    };

    console.log('🔧 Dev: __createMockTemplateDrafts disponível no globalThis');
  } catch (err) {
    console.error('🔧 Dev: não foi possível anexar mocks de conquistas', err);
  }
}

export default attachDevAchievementMocks;
