# ============================================================================
# install.ps1 — Installation on-premise EduTutor IA (client, Windows, air-gapped)
# ----------------------------------------------------------------------------
# TJ2.4 — cf. docs/on-premise/install.md et docs/on-premise/prerequisites.md
#
# Ce script :
#   1. Verifie les droits d'administration necessaires au demon Docker.
#   2. Verifie que Docker Desktop + Docker Compose v2 sont installes.
#   3. Selectionne le modele LLM a importer selon le tier client (-Tier).
#   4. Verifie que les poids du modele sont bien presents LOCALEMENT dans
#      models/<tier>/ (pack de livraison) — aucun acces Internet requis.
#   5. Genere un .env avec des secrets aleatoires si absent.
#   6. Importe le modele dans Ollama via `ollama create` (jamais `ollama pull`).
#   7. Demarre la stack complete (postgres, ollama, backend, frontend).
#   8. Execute un healthcheck interne sur les 3 services.
#
# Usage (PowerShell en Administrateur) :
#   .\scripts\install.ps1                    # tier standard (defaut)
#   .\scripts\install.ps1 -Tier pro
#   .\scripts\install.ps1 -Tier enterprise
#
# Procedure de rollback : voir docs/on-premise/install.md #Rollback.
# ============================================================================

param(
    [ValidateSet("standard", "pro", "enterprise")]
    [string]$Tier = "standard"
)

$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

switch ($Tier) {
    "standard"   { $Model = "llama3.2:3b"; $ModelDir = "standard-llama3.2-3b" }
    "pro"        { $Model = "gpt-oss:20b"; $ModelDir = "pro-gpt-oss-20b" }
    "enterprise" { $Model = "gemma4:31b"; $ModelDir = "enterprise-gemma-4-31b-it" }
}

Write-Host "=== Installation EduTutor IA on-premise - tier '$Tier' (modele $Model) ==="
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Droits d'administration (piege #2 - Docker Desktop exige des privileges)
# ---------------------------------------------------------------------------
Write-Host "==> [1/8] Verification des droits d'administration..."
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Ce script doit etre lance depuis un PowerShell 'Executer en tant qu'administrateur' (droits necessaires pour Docker Desktop)."
    exit 1
}
Write-Host "    OK."

# ---------------------------------------------------------------------------
# 2. Docker + Docker Compose
# ---------------------------------------------------------------------------
Write-Host "==> [2/8] Verification de Docker et Docker Compose..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker n'est pas installe. https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Le demon Docker ne repond pas. Demarrez Docker Desktop puis relancez ce script."
    exit 1
}
docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "'docker compose' (v2) introuvable. Mettez Docker Desktop a jour."
    exit 1
}
Write-Host "    OK."

# ---------------------------------------------------------------------------
# 3. Poids du modele presents localement (air-gapped - piege #1)
# ---------------------------------------------------------------------------
Write-Host "==> [3/8] Verification de la presence locale des poids du modele ($Model)..."
$ModelPath = "models/$ModelDir"
if (-not (Test-Path "$ModelPath/Modelfile")) {
    Write-Error "$ModelPath/Modelfile introuvable. Ce pack de livraison doit contenir les poids pre-telecharges du modele. Voir models/README.md. Ce script n'effectue JAMAIS de 'ollama pull' reseau (site potentiellement air-gapped)."
    exit 1
}
Write-Host "    OK ($ModelPath/Modelfile present)."

# ---------------------------------------------------------------------------
# 4. Generation du .env (secrets aleatoires, jamais de mot de passe en dur)
# ---------------------------------------------------------------------------
Write-Host "==> [4/8] Configuration de l'environnement (.env)..."
if (Test-Path ".env") {
    Write-Host "    .env deja present : conserve tel quel (secrets non regeneres)."
} else {
    Copy-Item ".env.prod.example" ".env"

    $secretBytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
    $djangoSecret = [Convert]::ToBase64String($secretBytes)

    $pgBytes = New-Object byte[] 24
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($pgBytes)
    $pgPassword = [Convert]::ToBase64String($pgBytes) -replace '[/+=]', ''

    $content = Get-Content ".env"
    $content = $content -replace '^DJANGO_SECRET_KEY=.*', "DJANGO_SECRET_KEY=$djangoSecret"
    $content = $content -replace '^POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$pgPassword"
    $content = $content -replace '^LLM_BACKEND=.*', "LLM_BACKEND=ollama"
    $content = $content -replace '^OLLAMA_MODEL=.*', "OLLAMA_MODEL=$Model"
    Set-Content ".env" -Value $content -Encoding utf8

    Write-Host "    .env genere avec des secrets aleatoires uniques (DJANGO_SECRET_KEY, POSTGRES_PASSWORD)."
}

$ComposeArgs = @(
    "-f", "docker-compose.yml",
    "-f", "docker-compose.prod.yml",
    "-f", "docker-compose.onpremise.yml",
    "--profile", "ollama",
    "--profile", "edge"
)

# ---------------------------------------------------------------------------
# 5/6. Import local du modele dans Ollama (jamais 'ollama pull')
# ---------------------------------------------------------------------------
Write-Host "==> [5/8] Demarrage de postgres + ollama (preparation import modele)..."
docker compose @ComposeArgs up -d postgres ollama
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du demarrage de postgres/ollama."; exit 1 }

Write-Host "==> [6/8] Import local du modele $Model dans Ollama..."
$existing = docker compose @ComposeArgs exec -T ollama ollama list 2>$null
$alreadyPresent = $false
foreach ($line in $existing) {
    if ($line -match [regex]::Escape($Model)) { $alreadyPresent = $true }
}
if ($alreadyPresent) {
    Write-Host "    Modele $Model deja importe, etape ignoree."
} else {
    docker compose @ComposeArgs exec -T ollama ollama create $Model -f "/models/$ModelDir/Modelfile"
    if ($LASTEXITCODE -ne 0) { Write-Error "Echec de l'import du modele $Model."; exit 1 }
    Write-Host "    Modele $Model importe avec succes (100% local, aucun acces reseau)."
}

# ---------------------------------------------------------------------------
# 7. Demarrage de la stack complete
# ---------------------------------------------------------------------------
Write-Host "==> [7/8] Demarrage de la stack complete (backend, frontend)..."
docker compose @ComposeArgs up -d --build
if ($LASTEXITCODE -ne 0) { Write-Error "Echec du demarrage de la stack complete."; exit 1 }

# ---------------------------------------------------------------------------
# 8. Healthcheck interne
# ---------------------------------------------------------------------------
Write-Host "==> [8/8] Healthcheck interne des services..."
Start-Sleep -Seconds 5

$fail = $false

$pgUserLine = Select-String -Path ".env" -Pattern '^POSTGRES_USER=' | Select-Object -First 1
if ($pgUserLine) {
    $pgUser = ($pgUserLine.Line -split '=', 2)[1]
} else {
    $pgUser = "apocal"
}

docker compose @ComposeArgs exec -T postgres pg_isready -U $pgUser *> $null
if ($LASTEXITCODE -eq 0) { Write-Host "    [OK] postgres" } else { Write-Warning "    [ECHEC] postgres ne repond pas."; $fail = $true }

docker compose @ComposeArgs exec -T ollama ollama list *> $null
if ($LASTEXITCODE -eq 0) { Write-Host "    [OK] ollama" } else { Write-Warning "    [ECHEC] ollama ne repond pas."; $fail = $true }

$backendOk = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8000/health/" -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { $backendOk = $true; break }
    } catch {
        Start-Sleep -Seconds 2
    }
}
if ($backendOk) {
    Write-Host "    [OK] backend (http://localhost:8000/health/)"
} else {
    Write-Warning "    [ECHEC] backend ne repond pas apres 60s."
    $fail = $true
}

Write-Host ""
if (-not $fail) {
    Write-Host "=== Installation terminee avec succes (tier $Tier, modele $Model) ==="
    Write-Host "Voir docs/on-premise/install.md pour les commandes de maintenance et la procedure de rollback."
} else {
    Write-Error "=== Installation terminee AVEC ERREURS - voir ci-dessus. Diagnostic : docker compose logs -f ==="
    exit 1
}
