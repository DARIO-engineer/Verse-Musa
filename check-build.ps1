# Script para verificar status do build EAS
# Execute: .\check-build.ps1

Write-Host "🔍 Verificando status do build..." -ForegroundColor Cyan

$buildId = "61e1f17c-e0d9-4907-978c-d0699c58b07a"

npx eas build:view $buildId

Write-Host "`n📱 Link direto: https://expo.dev/accounts/eadriano/projects/Verse/builds/$buildId" -ForegroundColor Green
Write-Host "⏳ Execute este script novamente em alguns minutos para verificar o progresso." -ForegroundColor Yellow
Write-Host "`n💡 Quando o status mudar para 'finished', você poderá baixar o APK!" -ForegroundColor Cyan
