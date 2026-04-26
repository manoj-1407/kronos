# Deployment Guide

This guide keeps Kronos on free hosting tiers.

## Recommended setup

- Frontend: GitHub Pages
- Backend: Render free web service
- Database: start with SQLite for demos; switch to free Postgres for persistent production data

## 1) Backend on Render (free)

1. Create a new Web Service from this repo.
2. Root directory: `backend`
3. Build command:
   - `pip install -r requirements.txt`
4. Start command:
   - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment variables:
   - `DATABASE_URL` (optional; default SQLite)
   - `CORS_ALLOW_ORIGINS=https://manoj-1407.github.io`

## 2) Frontend on GitHub Pages

1. In repo settings, enable Pages via GitHub Actions.
2. Add repository secret:
   - `VITE_API_URL=https://<your-render-service>.onrender.com`
3. Push to `main`. Workflow `.github/workflows/deploy.yml` builds and publishes frontend.

## 3) Verify

- API health: `/health`
- API docs: `/docs`
- Frontend loads simulations and history without CORS errors
- History CSV export downloads correctly

## Notes on free tiers

- Render free services may spin down when inactive.
- First request after idle can be slower.
- For always-on backend with SQLite volumes, consider Oracle Always Free VM and Docker Compose.
