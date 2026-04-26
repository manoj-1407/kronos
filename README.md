# Kronos - Operating Systems Simulation Studio

[![Backend Tests](https://img.shields.io/badge/backend-pytest-success)](./backend/tests)
[![Frontend Build](https://img.shields.io/badge/frontend-vite%20build-646CFF)](./frontend)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Stack: FastAPI + React](https://img.shields.io/badge/stack-FastAPI%20%2B%20React-0ea5e9)](#tech-stack)

Kronos is a visual simulation studio for core operating-systems algorithms.  
Instead of static textbook examples, Kronos lets you execute workloads, watch each state transition, compare outcomes across algorithms, and generate explainable insights.

Built for students, educators, and engineers who want practical intuition for scheduling, memory behavior, disk movement, and deadlock safety.

## Why Kronos feels different

- Clear simulation-first interface with step-by-step playback.
- Same input, multiple algorithms, side-by-side decisions.
- Performance metrics + plain-language insights for each run.
- Scenario presets for repeatable experiments.
- Export-ready history for reports and assignments.

## Feature Set

### Simulation modules

- CPU scheduling: FCFS, SJF, SRTF, Round Robin, Priority (NP/P), MLFQ
- Memory paging: FIFO, LRU, Optimal, LFU, Clock
- Disk scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK
- Deadlock analysis: Banker's safety and request checks

### Analysis workspace

- Run history with replayable input/output snapshots
- Multi-run comparison workspace
- Auto-generated run insights
- CSV export for reports
- Scenario presets (save and reuse workloads)

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: FastAPI, SQLModel, Uvicorn
- Data: SQLite by default, `DATABASE_URL` override supported
- CI: GitHub Actions (backend test + frontend build + optional Pages deploy)

## Quick Start

### One command (Windows)

```powershell
.\setup.ps1
```

This bootstraps dependencies, runs backend tests, and starts both services.

### Manual local run

```powershell
# backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```powershell
# frontend
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Deployment (Free Tier Friendly)

### Recommended production-lite setup

- Frontend: GitHub Pages
- Backend: Render free web service
- Data: SQLite for demo use, free Postgres for durable persistence

Detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

To enable Pages deployment in CI:

1. Set repo variable `ENABLE_PAGES_DEPLOY=true`
2. Set repo secret `VITE_API_URL` to your backend URL
3. Keep GitHub Pages configured for GitHub Actions

## Configuration

### Backend env vars

- `DATABASE_URL` optional, default `sqlite:///./kronos.db`
- `CORS_ALLOW_ORIGINS` comma-separated origins, default `*`

### Frontend env vars

- `VITE_API_URL` backend base URL

## Repository Layout

```text
kronos/
  backend/
    app/
      algorithms/
      routers/
      database.py
      main.py
      models.py
    tests/
  frontend/
    src/
      components/
      pages/
      lib/
      store/
      types/
  .github/workflows/
  docker-compose.yml
  DEPLOYMENT.md
  setup.ps1
```

## Security and Contribution

- Security policy: [SECURITY.md](./SECURITY.md)
- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

## Keywords

`operating systems` `algorithm visualizer` `cpu scheduling` `page replacement` `disk scheduling` `deadlock detection` `fastapi` `react` `education tooling`
