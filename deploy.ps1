# deploy.ps1 - Script de deploy do APK
# Execute: .\deploy.ps1

Write-Host "🚀 DEPLOY VERSO E MUSA - APK ANDROID" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# 1. Verificar status do build atual
Write-Host "`n📊 Verificando build atual..." -ForegroundColor Yellow
npx eas build:list --platform android --limit 1

# 2. Perguntar se quer cancelar e criar novo
Write-Host "`n❓ Opções:" -ForegroundColor Cyan
Write-Host "  1. Aguardar build atual (61e1f17c)" -ForegroundColor White
Write-Host "  2. Cancelar e criar novo build" -ForegroundColor White
Write-Host "  3. Apenas verificar status" -ForegroundColor White

$opcao = Read-Host "`nEscolha (1/2/3)"

switch ($opcao) {
    "1" {
        Write-Host "`n⏳ Aguardando build 61e1f17c..." -ForegroundColor Yellow
        Write-Host "🔗 Link: https://expo.dev/accounts/eadriano/projects/Verse/builds/61e1f17c-e0d9-4907-978c-d0699c58b07a" -ForegroundColor Green
        Write-Host "`n💡 Quando concluído, baixe o APK pelo link acima!" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "`n🛑 Cancelando build atual..." -ForegroundColor Yellow
        npx eas build:cancel 61e1f17c-e0d9-4907-978c-d0699c58b07a
        
        Write-Host "`n🔨 Iniciando novo build otimizado..." -ForegroundColor Green
        npx eas build --platform android --profile preview --non-interactive
    }
    "3" {
        Write-Host "`n✅ Status verificado!" -ForegroundColor Green
        Write-Host "Execute novamente para fazer deploy." -ForegroundColor White
    }
    default {
        Write-Host "`n❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host "`n" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host "✨ Deploy finalizado!" -ForegroundColor Cyan
