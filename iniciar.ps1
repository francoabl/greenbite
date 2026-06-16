Write-Host "========================================" -ForegroundColor Green
Write-Host "  GreenBite - Inicio Rapido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 1. Verificar Docker
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Cyan
$dockerOk = docker info 2>$null
if (-not $dockerOk) {
    Write-Host "  ERROR: Docker no esta corriendo. Inicia Docker Desktop primero." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker OK" -ForegroundColor Green

# 2. Iniciar bases de datos
Write-Host "[2/5] Iniciando PostgreSQL..." -ForegroundColor Cyan
docker compose up -d
Write-Host "  Esperando a que las BD esten listas..."
do { Start-Sleep 2 } until ((docker compose exec usuarios_db pg_isready -U postgres -q 2>$null) -and $LASTEXITCODE -eq 0)
do { Start-Sleep 2 } until ((docker compose exec pedidos_db pg_isready -U postgres -q 2>$null) -and $LASTEXITCODE -eq 0)
Write-Host "  PostgreSQL listo" -ForegroundColor Green
Write-Host "  (Las tablas las crea Hibernate/JPA automaticamente al arrancar cada microservicio)" -ForegroundColor DarkGray

# 3. Verificar dependencias del frontend y BFF (Node)
Write-Host "[3/5] Verificando dependencias Node (bff, frontend)..." -ForegroundColor Cyan
$nodeDirs = @("bff", "frontend")
foreach ($d in $nodeDirs) {
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

# 4. Iniciar backend en ventanas separadas
Write-Host "[4/5] Iniciando servicios backend..." -ForegroundColor Cyan
$root = Get-Location

# Microservicios Spring Boot (Maven Wrapper). La primera vez descargara dependencias.
$springServices = @(
    @{name="ms-usuarios"; port=4001},
    @{name="ms-pedidos";  port=4002}
)
foreach ($svc in $springServices) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\$($svc.name)'; .\mvnw.cmd spring-boot:run"
    Write-Host "  $($svc.name) (Spring Boot) -> http://localhost:$($svc.port)" -ForegroundColor Green
    Start-Sleep 2
}

# BFF (Node + Express)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\bff'; npm run dev"
Write-Host "  bff (Node) -> http://localhost:4000" -ForegroundColor Green
Start-Sleep 2

# 5. Iniciar frontend
Write-Host "[5/5] Iniciando frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Write-Host "  frontend -> http://localhost:5173" -ForegroundColor Green
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
Write-Host "  NOTA: los microservicios Spring Boot tardan unos segundos en levantar." -ForegroundColor Yellow
Write-Host "  Para detener: cierra las ventanas y ejecuta 'docker compose down'" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
