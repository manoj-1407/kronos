# ============================================================
# Kronos — One-Shot Setup Script for Windows (PowerShell 5+)
# Run from D:\kronos: .\setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Write-Step { param([string]$msg) Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK   { param([string]$msg) Write-Host "   $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "   $msg" -ForegroundColor Yellow }

Write-Host @"

  ██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████╗
  ██║ ██╔╝██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════╝
  █████╔╝ ██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████╗
  ██╔═██╗ ██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║
  ██║  ██╗██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
  OS Internals Visualizer — Setup Script
"@ -ForegroundColor Cyan

# ── 1. Check Python ──────────────────────────────────────────────────────────
Write-Step "Checking Python..."
try {
    $pyVer = python --version 2>&1
    Write-OK "Found: $pyVer"
} catch {
    Write-Error "Python not found. Install from https://python.org and re-run."
    exit 1
}

# ── 2. Check Node ────────────────────────────────────────────────────────────
Write-Step "Checking Node.js..."
try {
    $nodeVer = node --version 2>&1
    Write-OK "Found: $nodeVer"
} catch {
    Write-Error "Node.js not found. Install from https://nodejs.org and re-run."
    exit 1
}

# ── 3. Backend — virtual environment + packages ──────────────────────────────
Write-Step "Setting up Python backend..."
Set-Location "$ROOT\backend"

if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-OK "Created virtual environment"
}

& "venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
& "venv\Scripts\pip.exe"    install -r requirements.txt --quiet
Write-OK "Backend packages installed"

# ── 4. Run backend tests ──────────────────────────────────────────────────────
Write-Step "Running backend tests..."
$testResult = & "venv\Scripts\pytest.exe" tests/ -v --tb=short 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-OK "All tests passed"
} else {
    Write-Warn "Some tests failed (non-fatal, continuing setup):"
    Write-Warn "$testResult"
}

# ── 5. Frontend — npm install ─────────────────────────────────────────────────
Write-Step "Installing frontend dependencies..."
Set-Location "$ROOT\frontend"
npm install --silent
Write-OK "Frontend packages installed"

# ── 6. Create .env for frontend ───────────────────────────────────────────────
$envFile = "$ROOT\frontend\.env"
if (-not (Test-Path $envFile)) {
    Set-Content $envFile "VITE_API_URL=http://localhost:8000"
    Write-OK "Created frontend .env"
}

# ── 7. Launch both servers ────────────────────────────────────────────────────
Write-Step "Launching Kronos..."

# Backend in new terminal
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ROOT\backend'; .\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
) -WindowStyle Normal

Start-Sleep 2

# Frontend in new terminal
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ROOT\frontend'; npm run dev"
) -WindowStyle Normal

Start-Sleep 3

Write-Host @"

  ╔══════════════════════════════════════════════════╗
  ║            KRONOS IS RUNNING                     ║
  ║                                                  ║
  ║  Frontend:  http://localhost:5173                ║
  ║  Backend:   http://localhost:8000                ║
  ║  API Docs:  http://localhost:8000/docs           ║
  ║                                                  ║
  ║  Both servers opened in separate terminals.      ║
  ╚══════════════════════════════════════════════════╝
"@ -ForegroundColor Green

# Open browser
Start-Sleep 2
Start-Process "http://localhost:5173"
