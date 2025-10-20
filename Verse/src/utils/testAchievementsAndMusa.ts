// Teste abrangente do sistema de conquistas e Musa
import { DraftService } from '../services/DraftService';
import { EnhancedAchievementService } from '../services/EnhancedAchievementService';
import { SimpleChatService } from '../services/SimpleChatService';

export class TestAchievementsAndMusa {
  
  /**
   * Teste completo do sistema de conquistas
   */
  static async testAchievements(): Promise<void> {
    console.log('🧪 === INICIANDO TESTE DE CONQUISTAS ===');
    
    try {
      // 1. Limpar dados de teste
      console.log('🧹 Limpando dados de teste...');
      await EnhancedAchievementService.clearAllAchievements();
      
      // 2. Testar primeira obra (deve desbloquear "Primeiras Palavras")
      console.log('📝 Testando primeira obra...');
      const firstDraftId = await DraftService.saveDraft(
        'Meu Primeiro Soneto',
        `Jesus, o Verbo eterno feito carne,
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
Para louvar quem sempre me amará.`,
        'soneto'
      );
      
      console.log('✅ Primeira obra criada:', firstDraftId);
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Verificar se a conquista foi desbloqueada
      const achievements = await EnhancedAchievementService.getUserAchievements('user_current');
      const firstCreation = achievements.find(a => a.id === 'first_creation');
      
      if (firstCreation?.unlockedAt) {
        console.log('🎉 SUCESSO: Conquista "Primeiras Palavras" desbloqueada!');
      } else {
        console.log('❌ FALHA: Conquista "Primeiras Palavras" NÃO foi desbloqueada');
      }
      
      // 4. Testar mais obras para outras conquistas
      console.log('📝 Criando mais obras para testar outras conquistas...');
      
      for (let i = 2; i <= 6; i++) {
        await DraftService.saveDraft(
          `Poesia ${i}`,
          `Esta é minha ${i}ª obra poética.
          
Verso livre fluindo,
Palavras dançando,
Coração cantando
Em louvor ao Criador.

Cada palavra é uma oração,
Cada verso uma adoração,
Cada poema uma celebração
Do amor divino em meu coração.`,
          'poesia'
        );
        
        console.log(`✅ Obra ${i} criada`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 5. Verificar conquista de 5 obras
      const updatedAchievements = await EnhancedAchievementService.getUserAchievements('user_current');
      const fiveWorks = updatedAchievements.find(a => a.id === 'five_works');
      
      if (fiveWorks?.unlockedAt) {
        console.log('🎉 SUCESSO: Conquista "Escritor Iniciante" (5 obras) desbloqueada!');
      } else {
        console.log('❌ FALHA: Conquista "Escritor Iniciante" NÃO foi desbloqueada');
      }
      
      // 6. Listar todas as conquistas desbloqueadas
      console.log('🏆 === CONQUISTAS DESBLOQUEADAS ===');
      const unlockedAchievements = updatedAchievements.filter(a => a.unlockedAt);
      
      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach(achievement => {
          console.log(`✅ ${achievement.title}: ${achievement.description}`);
        });
      } else {
        console.log('❌ Nenhuma conquista foi desbloqueada');
      }
      
      console.log('🧪 === TESTE DE CONQUISTAS CONCLUÍDO ===');
      
    } catch (error) {
      console.error('❌ Erro no teste de conquistas:', error);
    }
  }
  
  /**
   * Teste completo do sistema da Musa
   */
  static async testMusa(): Promise<void> {
    console.log('🤖 === INICIANDO TESTE DA MUSA ===');
    
    try {
      const chatService = new SimpleChatService();
      
      // 1. Criar nova conversa
      console.log('💬 Criando nova conversa...');
      const conversation = await chatService.createConversation();
      console.log('✅ Conversa criada:', conversation.id);
      
      // 2. Testar mensagem simples
      console.log('📤 Enviando mensagem de teste...');
      const response1 = await chatService.sendMessage(
        conversation.id,
        'Olá Musa! Você pode me ajudar a escrever um poema sobre esperança?'
      );
      
      console.log('📥 Resposta recebida:', response1.content?.substring(0, 100) + '...');
      
      // 3. Testar modo Escritor
      console.log('✍️ Testando modo Escritor...');
      const response2 = await chatService.sendMessage(
        conversation.id,
        'Me ajude a melhorar este verso: "O sol brilha no céu azul"',
        'Você é uma assistente conversacional cristã especializada em escrita criativa...'
      );
      
      console.log('📥 Resposta do Escritor:', response2.content?.substring(0, 100) + '...');
      
      // 4. Verificar histórico
      console.log('📚 Verificando histórico...');
      const conversations = await chatService.loadConversations();
      console.log(`✅ Total de conversas no histórico: ${conversations.length}`);
      
      // 5. Testar fallback (simular erro de API)
      console.log('🔄 Testando sistema de fallback...');
      
      // Forçar erro no Gemini (simulação)
      const originalGenAI = (chatService as any).genAI;
      (chatService as any).genAI = null; // Simular falha do Gemini
      
      const response3 = await chatService.sendMessage(
        conversation.id,
        'Esta mensagem deve usar o fallback'
      );
      
      console.log('📥 Resposta via fallback:', response3.content?.substring(0, 100) + '...');
      
      // Restaurar
      (chatService as any).genAI = originalGenAI;
      
      console.log('🤖 === TESTE DA MUSA CONCLUÍDO ===');
      
    } catch (error) {
      console.error('❌ Erro no teste da Musa:', error);
    }
  }
  
  /**
   * Teste de integração completo
   */
  static async runFullTest(): Promise<void> {
    console.log('🚀 === INICIANDO TESTE COMPLETO ===');
    
    // Testar conquistas
    await this.testAchievements();
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Testar Musa
    await this.testMusa();
    
    console.log('🎉 === TESTE COMPLETO FINALIZADO ===');
    console.log('📊 Verifique os logs acima para ver os resultados');
  }
  
  /**
   * Teste rápido apenas das conquistas básicas
   */
  static async quickAchievementTest(): Promise<void> {
    console.log('⚡ === TESTE RÁPIDO DE CONQUISTAS ===');
    
    try {
      // Criar uma obra simples
      const draftId = await DraftService.saveDraft(
        'Teste de Conquista',
        'Esta é uma obra de teste para verificar se as conquistas funcionam.',
        'poesia'
      );
      
      console.log('✅ Obra de teste criada:', draftId);
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar conquistas
      const achievements = await EnhancedAchievementService.getUserAchievements('user_current');
      const unlockedCount = achievements.filter(a => a.unlockedAt).length;
      
      console.log(`🏆 Total de conquistas desbloqueadas: ${unlockedCount}`);
      
      if (unlockedCount > 0) {
        console.log('✅ SUCESSO: Sistema de conquistas está funcionando!');
      } else {
        console.log('❌ PROBLEMA: Nenhuma conquista foi desbloqueada');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste rápido:', error);
    }
  }
}

// Exportar para uso em desenvolvimento
export default TestAchievementsAndMusa;
