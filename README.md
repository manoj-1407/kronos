# Kronos

Kronos is an operating-systems simulation lab that makes algorithm behavior visible, measurable, and explainable.

It is built for learners, interview prep, and systems classes where "just reading formulas" is not enough. You can run classic CPU, memory, disk, and deadlock simulations, inspect step-by-step state transitions, compare runs, and export results.

## Highlights

- Real-time simulation for CPU scheduling, memory paging, disk head movement, and deadlock safety analysis.
- History workspace with replay, run comparison, generated insights, CSV export, and reusable scenario presets.
- Practical UI focused on signal over noise: metrics first, playback controls, and clear category workflows.
- Fast local setup for Windows and Docker-based full-stack run mode.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: FastAPI, SQLModel, Uvicorn
- Data: SQLite by default (`DATABASE_URL` supported for Postgres or other engines)
- CI/CD: GitHub Actions + GitHub Pages for frontend deployment

## Quick Start (Windows)

```powershell
.\setup.ps1
```

This installs dependencies, runs backend tests, starts backend + frontend in separate terminals, and opens the browser.

## Manual Local Run

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- UI: `http://localhost:5173`
- API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

## Deployment (Free-first strategy)

### Option A (recommended)

- Frontend: GitHub Pages
- Backend: Render free web service
- Database: SQLite for demos, free Postgres for durable production data

### Option B

- Frontend: GitHub Pages
- Backend: Oracle Cloud Always Free VM with Docker Compose

See deployment workflow in `.github/workflows/deploy.yml` and set `VITE_API_URL` secret in repository settings.

## Environment Variables

### Backend

- `DATABASE_URL` (optional): defaults to SQLite `sqlite:///./kronos.db`
- `CORS_ALLOW_ORIGINS` (optional): comma-separated list, defaults to `*`

### Frontend

- `VITE_API_URL`: base URL for backend API

## Project Layout

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
      lib/
      pages/
      store/
      types/
  .github/workflows/
  docker-compose.yml
  setup.ps1
```

## Security Notes

- Never commit `.env` files, local database files, or dependency caches.
- Use GitHub repository secrets for deployment credentials and API URLs.
- Review `SECURITY.md` for reporting and disclosure policy.

## Keywords

`operating systems` `cpu scheduling` `memory management` `disk scheduling` `deadlock detection` `fastapi` `react` `simulation` `education` `systems design`
