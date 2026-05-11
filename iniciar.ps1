Write-Host "========================================" -ForegroundColor Green
Write-Host "  GreenBite - Inicio Rapido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 1. Verificar Docker
Write-Host "[1/6] Verificando Docker..." -ForegroundColor Cyan
$dockerOk = docker info 2>$null
if (-not $dockerOk) {
    Write-Host "  ERROR: Docker no esta corriendo. Inicia Docker Desktop primero." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker OK" -ForegroundColor Green

# 2. Iniciar bases de datos
Write-Host "[2/6] Iniciando PostgreSQL..." -ForegroundColor Cyan
docker compose up -d
Write-Host "  Esperando a que las BD esten listas..."
do { Start-Sleep 2 } until ((docker compose exec usuarios_db pg_isready -U postgres -q 2>$null) -and $LASTEXITCODE -eq 0)
do { Start-Sleep 2 } until ((docker compose exec pedidos_db pg_isready -U postgres -q 2>$null) -and $LASTEXITCODE -eq 0)
Write-Host "  PostgreSQL listo" -ForegroundColor Green

# 3. Crear tablas
Write-Host "[3/6] Creando tablas..." -ForegroundColor Cyan
$usuariosSql = Get-Content "ms-usuarios/src/database/schema.sql" -Raw
$pedidosSql  = Get-Content "ms-pedidos/src/database/schema.sql" -Raw

$usuariosSql | docker compose exec -T usuarios_db psql -U postgres -d usuarios_db 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  usuarios_db OK" -ForegroundColor Green } else { Write-Host "  usuarios_db ERROR" -ForegroundColor Red }

$pedidosSql | docker compose exec -T pedidos_db psql -U postgres -d pedidos_db 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  pedidos_db OK" -ForegroundColor Green } else { Write-Host "  pedidos_db ERROR" -ForegroundColor Red }

# 4. Verificar dependencias
Write-Host "[4/6] Verificando dependencias..." -ForegroundColor Cyan
$dirs = @("ms-usuarios", "ms-pedidos", "bff", "frontend")
foreach ($d in $dirs) {
    if (-not (Test-Path "$d/node_modules")) {
        Write-Host "  Instalando $d..." -NoNewline
        Push-Location $d
        npm install --silent 2>$null
        Pop-Location
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host "  $d ya instalado" -ForegroundColor Yellow
    }
}

# 5. Iniciar backend en ventanas separadas
Write-Host "[5/6] Iniciando servicios backend..." -ForegroundColor Cyan
$root = Get-Location
$backends = @(
    @{name="ms-usuarios"; port=4001},
    @{name="ms-pedidos";  port=4002},
    @{name="bff";         port=4000}
)

foreach ($svc in $backends) {
    $title = "GreenBite - $($svc.name) (:$( $svc.port ))"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\$($svc.name)'; npm run dev"
    Write-Host "  $($svc.name) → http://localhost:$($svc.port)" -ForegroundColor Green
    Start-Sleep 2
}

# 6. Iniciar frontend
Write-Host "[6/6] Iniciando frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Write-Host "  frontend → http://localhost:5173" -ForegroundColor Green
Start-Sleep 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Todo funcionando!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:      http://localhost:5173" -ForegroundColor White
Write-Host "  BFF:           http://localhost:4000/health" -ForegroundColor White
Write-Host "  ms-usuarios:   http://localhost:4001/health" -ForegroundColor White
Write-Host "  ms-pedidos:    http://localhost:4002/health" -ForegroundColor White
Write-Host ""
Write-Host "  Para detener: cierra las ventanas y ejecuta 'docker compose down'" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
