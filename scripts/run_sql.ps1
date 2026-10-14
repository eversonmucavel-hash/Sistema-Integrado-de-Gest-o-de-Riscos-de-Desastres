# ============================================
# SIGRD - Executar todos os scripts SQL
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " SIGRD - Executando scripts SQL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Ir para a pasta init
$initPath = "C:\Users\everson\Desktop\ProCOisa\sigrd\docker\init"
Set-Location $initPath

# Lista de ficheiros por ordem
$files = @(
    "01_extensions.sql",
    "02_geography.sql",
    "03_risks.sql",
    "04_alerts.sql",
    "05_shelters.sql",
    "06_teams.sql",
    "07_resources.sql",
    "08_weather.sql",
    "09_users.sql",
    "10_functions.sql",
    "11_seed.sql"
)

$total = $files.Count
$atual = 0
$erros = @()

foreach ($file in $files) {
    $atual++
    Write-Host "[$atual/$total] Executando: $file" -ForegroundColor Yellow
    
    # Verificar se o ficheiro existe
    if (-not (Test-Path $file)) {
        Write-Host "  ❌ FICHEIRO NAO ENCONTRADO!" -ForegroundColor Red
        $erros += $file
        continue
    }
    
    # Verificar se esta vazio
    $size = (Get-Item $file).Length
    if ($size -eq 0) {
        Write-Host "  ⚠️  FICHEIRO VAZIO (0 bytes)! Salta." -ForegroundColor Magenta
        $erros += $file
        continue
    }
    
    # Executar
    try {
        $output = Get-Content $file -Raw | docker exec -i sigrd_postgres psql -U sigrd_user -d sigrd_db 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ OK" -ForegroundColor Green
        } else {
            Write-Host "  ❌ ERRO:" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            $erros += $file
        }
    } catch {
        Write-Host "  ❌ EXCECAO: $_" -ForegroundColor Red
        $erros += $file
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
if ($erros.Count -eq 0) {
    Write-Host " ✅ TODOS OS SCRIPTS EXECUTADOS COM SUCESSO!" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Ficheiros com problemas:" -ForegroundColor Yellow
    foreach ($e in $erros) {
        Write-Host "   - $e" -ForegroundColor Red
    }
}
Write-Host "============================================" -ForegroundColor Cyan