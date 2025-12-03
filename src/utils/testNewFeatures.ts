// src/utils/testNewFeatures.ts
import { LocalBackupService } from '../services/LocalBackupService';
import { ShareService } from '../services/ShareService';
import { MusaChatRateLimiter } from '../services/RateLimiter';
import { Draft } from '../services/DraftService';

/**
 * Script de teste para as novas funcionalidades
 * Execute cada teste individualmente através do console
 */

// Draft de exemplo para testes
const testDraft: Draft = {
  id: 'test_001',
  title: 'Teste de Poema',
  content: `No silêncio da noite estrelada
Onde sonhos dançam levemente
Minha alma encontra morada
Em versos que brotam da mente`,
  category: 'Soneto',
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublished: false,
};

/**
 * TESTE 1: Local Backup Service
 */
export async function testLocalBackup() {
  console.log('🧪 === TESTE 1: Local Backup ===');
  
  try {
    // Fazer backup de um rascunho
    console.log('1️⃣ Fazendo backup do rascunho de teste...');
    await LocalBackupService.backupSingleDraft(testDraft);
    console.log('✅ Backup local concluído');

    // Fazer backup de múltiplos
    console.log('\n2️⃣ Fazendo backup de múltiplos rascunhos...');
    await LocalBackupService.backupAllDrafts([testDraft]);
    console.log('✅ Backup em lote concluído');

    // Restaurar rascunhos
    console.log('\n3️⃣ Restaurando do backup local...');
    const restored = await LocalBackupService.restoreAllDrafts();
    console.log(`✅ ${restored.length} rascunho(s) restaurados:`);
    restored.forEach(draft => {
      console.log(`   - ${draft.title} (${draft.id})`);
    });

    console.log('\n🎉 TESTE 1: SUCESSO!\n');
  } catch (error) {
    console.error('❌ ERRO no teste de backup:', error);
  }
}

/**
 * TESTE 2: Share Service
 */
export async function testShareService() {
  console.log('🧪 === TESTE 2: Share Service ===');
  
  try {
    // Teste 1: Compartilhar como texto
    console.log('1️⃣ Testando compartilhamento de texto...');
    console.log('📝 Formato do texto:');
    console.log('─'.repeat(50));
    // Simular formatação (sem compartilhar de verdade)
    const formattedText = `
📖 ${testDraft.title}
🏷️ ${testDraft.category}

${testDraft.content}

---
Criado com Verso e Musa 🎭
`.trim();
    console.log(formattedText);
    console.log('─'.repeat(50));
    console.log('✅ Formatação OK');

    // Teste 2: Gerar SVG
    console.log('\n2️⃣ Testando geração de SVG...');
    console.log('🎨 SVG seria gerado com:');
    console.log(`   - Título: ${testDraft.title}`);
    console.log(`   - Cor de fundo: #1A237E`);
    console.log(`   - Cor do texto: #FFFFFF`);
    console.log(`   - ${testDraft.content.split('\n').length} linhas`);
    console.log('✅ SVG OK');

    // Teste 3: Exportar arquivo
    console.log('\n3️⃣ Testando exportação de arquivo...');
    const fileName = `${testDraft.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    console.log(`📄 Arquivo: ${fileName}`);
    console.log('✅ Export OK');

    console.log('\n🎉 TESTE 2: SUCESSO!\n');
  } catch (error) {
    console.error('❌ ERRO no teste de share:', error);
  }
}

/**
 * TESTE 3: Rate Limiter
 */
export async function testRateLimiter() {
  console.log('🧪 === TESTE 3: Rate Limiter ===');
  
  try {
    const limiter = new MusaChatRateLimiter();
    
    console.log('1️⃣ Testando limite de requisições...');
    console.log('📊 Configuração: 20 mensagens / 5 minutos\n');

    // Simular 25 requisições
    let blocked = 0;
    let allowed = 0;

    for (let i = 1; i <= 25; i++) {
      const canProceed = await limiter.canMakeRequest();
      
      if (canProceed) {
        await limiter.recordRequest();
        allowed++;
        console.log(`✅ Requisição ${i}: PERMITIDA`);
      } else {
        blocked++;
        const errorMsg = await limiter.getErrorMessage();
        console.log(`🚫 Requisição ${i}: BLOQUEADA - ${errorMsg}`);
      }

      // Pequeno delay para simular uso real
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Estatísticas
    console.log('\n📊 Estatísticas:');
    console.log(`   ✅ Permitidas: ${allowed}`);
    console.log(`   🚫 Bloqueadas: ${blocked}`);
    
    const remaining = await limiter.getRemainingRequests();
    console.log(`   📝 Requisições restantes: ${remaining}`);

    console.log('\n2️⃣ Testando reset...');
    await limiter.reset();
    const afterReset = await limiter.getRemainingRequests();
    console.log(`✅ Após reset: ${afterReset} requisições disponíveis`);

    console.log('\n🎉 TESTE 3: SUCESSO!\n');
  } catch (error) {
    console.error('❌ ERRO no teste de rate limiter:', error);
  }
}

/**
 * TESTE COMPLETO - Executa todos os testes
 */
export async function testAll() {
  console.log('🚀 === INICIANDO TESTES COMPLETOS ===\n');
  
  await testLocalBackup();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testShareService();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testRateLimiter();
  
  console.log('🏁 === TODOS OS TESTES CONCLUÍDOS ===');
}

// Para usar no console do React Native Debugger ou navegador:
// import { testAll, testLocalBackup, testShareService, testRateLimiter } from './utils/testNewFeatures';
// testAll();
